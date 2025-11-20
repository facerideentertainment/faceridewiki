
"use client";
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';

import { getAssociateById } from '@/lib/associates';
import { useFirebase } from '@/firebase/provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Eye, FileText } from 'lucide-react';
import { UserDisplayName } from '@/components/ui/user-display-name';

interface Article extends DocumentData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  viewCount?: number;
  authorDisplayName: string;
}

export default function AssociatePage() {
  const { slug } = useParams();
  const associate = getAssociateById(slug as string);
  const { firestore } = useFirebase();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const stripHtml = (html: string) => {
    if (typeof document !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
    return html.replace(/<[^>]+>/g, '');
  }

  useEffect(() => {
    const fetchArticles = async () => {
      if (!associate) return;

      try {
        const lowerCaseName = associate.name.toLowerCase();
        
        const q = query(collection(firestore, "wiki_pages"));
        const querySnapshot = await getDocs(q);
        
        const fetchedArticles: Article[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          const content = (data.content || '').toLowerCase();
          const title = (data.title || '').toLowerCase();
          const tags = (data.tags || []).map((t: string) => t.toLowerCase());

          if (
            content.includes(lowerCaseName) ||
            title.includes(lowerCaseName) ||
            tags.includes(lowerCaseName)
          ) {
            fetchedArticles.push({ id: doc.id, ...data } as Article);
          }
        });

        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [associate, firestore]);

  if (!associate) {
    return <div>Associate not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <Image 
              src={associate.logo} 
              alt={`${associate.name} logo`} 
              width={100} 
              height={100} 
              className="rounded-full border-4 border-border"
              unoptimized
            />
            <div>
              <CardTitle className="text-4xl font-bold">{associate.name}</CardTitle>
              <CardDescription className="text-lg">{associate.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">Related Wiki Entries</h2>
          {loading ? (
            <p>Loading articles...</p>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <Link href={`/article/${article.id}`} key={article.id}>
                  <Card className="h-full hover:border-primary transition-colors group flex flex-col">
                    {article.imageUrl && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                        <Image 
                          src={article.imageUrl} 
                          alt={article.title} 
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          priority={index < 3}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="font-headline text-lg font-bold leading-snug group-hover:text-primary transition-colors flex items-start gap-2">
                        {!article.imageUrl && <FileText className="w-5 h-5 mt-1 text-muted-foreground flex-shrink-0" />}
                        <span className="flex-grow">{article.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow flex flex-col">
                      <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                        {stripHtml(article.content).substring(0, 200)}...
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(article.tags || []).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t mt-auto">
                          <div className="truncate">
                            By <UserDisplayName displayName={article.authorDisplayName} /> on {article.createdAt?.toDate().toLocaleDateString() ?? '...'}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Eye className="w-3 h-3" />
                              <span>{article.viewCount?.toLocaleString() ?? 0}</span>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p>No articles found related to {associate.name}.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
