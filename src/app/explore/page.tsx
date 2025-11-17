
"use client";

import Link from "next/link";
import {
  FileText,
  Eye,
} from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, DocumentData, Timestamp, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/lib/auth";

interface Article extends DocumentData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  authorDisplayName: string;
  authorId: string;
  createdAt: Timestamp;
  viewCount?: number;
}

export default function ExplorePage() {
  const { firestore } = useFirebase();
  const { user, loading: isAuthLoading } = useAuth();
  const articlesCollection = useMemoFirebase(() => 
    isAuthLoading ? null : query(collection(firestore, 'wiki_pages'), orderBy("createdAt", "desc")), 
    [firestore, isAuthLoading]
  );
  const {data: articles, isLoading: isArticlesLoading} = useCollection<Article>(articlesCollection);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]+>/g, '');
  }

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-headline font-bold">All Entries</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isArticlesLoading && <p>Loading entries...</p>}
          {articles?.map((article, index) => {
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
                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t mt-auto">
                        <span>By: {article.authorDisplayName || article.authorId}</span>
                        <div className="flex items-center gap-2">
                            {article.viewCount !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{article.viewCount}</span>
                                </div>
                            )}
                            <span>{article.createdAt?.toDate().toLocaleDateString() ?? 'Date unavailable'}</span>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  );
}
