
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, DocumentData, Timestamp, query, where, orderBy } from "firebase/firestore";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { UserDisplayName } from "@/components/ui/user-display-name";
import { Eye, FileText } from "lucide-react";

interface Article extends DocumentData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorDisplayName: string;
  createdAt: Timestamp;
  tags?: string[];
  status?: 'published' | 'draft';
  viewCount?: number;
}


function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const { firestore } = useFirebase();
  const { user, loading: authLoading } = useAuth();

  const articlesCollection = useMemoFirebase(() => {
    const baseCollection = collection(firestore, 'wiki_pages');
    
    if (user?.role === 'Admin' || user?.role === 'Editor') {
        return query(baseCollection, orderBy("createdAt", "desc"));
    } else {
        return query(baseCollection, where('status', '==', 'published'), orderBy("createdAt", "desc"));
    }
  }, [firestore, user]);
  
  const { data: articles, isLoading } = useCollection<Article>(articlesCollection);

  const filteredArticles = articles?.filter(
    (article) =>
        !q || // Show all articles if query is empty
        article.title.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q) ||
        (article.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );

  const headingText = q ? `Search Results for "${q}"` : 'All Entries';

  const stripHtml = (html: string) => {
    if (typeof document !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
    // Basic fallback for server-side or non-browser environments
    return html.replace(/<[^>]+>/g, '');
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-headline font-bold">
        {headingText}
      </h1>
      
      {(isLoading || authLoading) && <p>Loading entries...</p>}

      {!isLoading && !authLoading && filteredArticles && filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => {
            return (
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
                     <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t mt-auto gap-2">
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
            )
          })}
        </div>
      ) : !isLoading && !authLoading && (
        <p className="text-muted-foreground text-center py-8">{q ? "No entries found matching your search." : "No public entries are available yet."}</p>
      )}
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading search results...</div>}>
            <SearchResults />
        </Suspense>
    )
}
