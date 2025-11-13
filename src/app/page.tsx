
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  FileText,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, DocumentData, Timestamp, query, orderBy, limit } from "firebase/firestore";
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
}

export default function Home() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const articlesCollection = useMemoFirebase(() => 
    query(collection(firestore, 'wiki_pages'), orderBy("createdAt", "desc"), limit(3)), 
    [firestore]
  );
  const {data: articles, isLoading} = useCollection<Article>(articlesCollection);

  const canEdit = user?.role === 'Admin' || user?.role === 'Editor';

  const stripHtml = (html: string) => {
    // This regex is a simple way to strip HTML tags.
    // For more complex HTML, a library like `striptags` would be more robust.
    return html.replace(/<[^>]+>/g, '');
  }

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <section className="bg-card border rounded-lg p-6 md:p-10">
        <h1 className="text-3xl font-bold font-headline">
          Welcome to the Face Ride Entertainment Wiki
        </h1>
        <p className="mt-2 text-muted-foreground">
          You wanna know? You better be ready for the ride. This is the ultimate, comprehensive platform—we promise a long, messy, and satisfying cram session. Go ahead, eat the facts until you choke.
        </p>
        <div className="mt-6 flex gap-2">
          <Button asChild>
            <Link href="/search">Explore Entries</Link>
          </Button>
          {canEdit && (
            <Button variant="secondary" asChild>
              <Link href="/article/new">Create New Entry</Link>
            </Button>
          )}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-headline font-bold">Recent Entries</h2>
          <Button variant="link" asChild>
            <Link href="/search">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && <p>Loading entries...</p>}
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
                      <span>Author: {article.authorDisplayName || article.authorId}</span>
                      <span>{article.createdAt?.toDate().toLocaleDateString() ?? 'Date unavailable'}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-bold mb-6">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Bot className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-lg font-bold">AI Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Generate and enhance content with advanced AI assistance
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Search className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-lg font-bold">Smart Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Find content quickly with powerful search capabilities
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Users className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-lg font-bold">Collaborative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Work together with role-based permissions and editing
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
