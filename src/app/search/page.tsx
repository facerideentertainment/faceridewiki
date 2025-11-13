
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, DocumentData, Timestamp, query, where } from "firebase/firestore";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { UserDisplayName } from "@/components/ui/user-display-name";

interface Article extends DocumentData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorDisplayName: string;
  createdAt: Timestamp;
  tags?: string[];
  status?: 'published' | 'draft';
}


function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const { firestore } = useFirebase();
  const { user, loading: authLoading } = useAuth();

  const articlesCollection = useMemoFirebase(() => {
    const baseCollection = collection(firestore, 'wiki_pages');
    
    if (user?.role === 'Admin' || user?.role === 'Editor') {
        return baseCollection;
    } else {
        return query(baseCollection, where('status', '==', 'published'));
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
        <div className="grid gap-6">
          {filteredArticles.map((article) => {
            return (
            <Link href={`/article/${article.id}`} key={article.id}>
                <Card className="hover:border-primary transition-colors flex flex-col md:flex-row">
                    {article.imageUrl && (
                        <div className="relative w-full md:w-48 aspect-video md:aspect-square flex-shrink-0">
                            <Image src={article.imageUrl} alt={article.title} fill className="object-cover rounded-t-lg md:rounded-none md:rounded-l-lg"/>
                        </div>
                    )}
                    <div className="flex flex-col flex-grow">
                        <CardHeader>
                            <CardTitle className="font-headline">{article.title}</CardTitle>
                            <CardDescription>By <UserDisplayName displayName={article.authorDisplayName} /> on {article.createdAt?.toDate().toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="line-clamp-2 text-muted-foreground">{stripHtml(article.content)}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {(article.tags || []).map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </Link>
          )})}
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
