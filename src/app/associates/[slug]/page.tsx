
"use client";
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

// Define the Article interface
interface Article {
  id: string;
  title: string;
  tags: string[];
  imageUrl?: string;
}

export default function AssociatePage() {
  const { slug } = useParams();
  const associate = getAssociateById(slug as string);
  const { firestore } = useFirebase();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const articlesCollection = useMemo(() => collection(firestore, 'wiki_pages'), [firestore]);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!associate) return;

      try {
        const lowerCaseName = associate.name.toLowerCase();
        
        // This query might not be efficient. Firestore doesn't support full-text search natively.
        // For a production app, a dedicated search service like Algolia or Elasticsearch is recommended.
        const q = query(collection(firestore, "wiki_pages"));
        const querySnapshot = await getDocs(q);
        
        const fetchedArticles: Article[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const article: Article = {
            id: doc.id,
            title: data.title,
            tags: data.tags || [],
            imageUrl: data.imageUrl,
          };

          const content = data.content.toLowerCase();
          const title = data.title.toLowerCase();
          const tags = (data.tags || []).map((t: string) => t.toLowerCase());

          if (
            content.includes(lowerCaseName) ||
            title.includes(lowerCaseName) ||
            tags.includes(lowerCaseName)
          ) {
            fetchedArticles.push(article);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map(article => (
                <Link href={`/article/${article.id}`} key={article.id} className="flex">
                  <Card className="hover:shadow-lg transition-shadow w-full flex flex-col group">
                    {article.imageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                            <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                    )}
                    <CardHeader className={!article.imageUrl ? 'flex-1' : ''}>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
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
