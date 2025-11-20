
"use client";

import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc, DocumentData, Timestamp, increment } from "firebase/firestore";
import { PageProps } from "@/types";
import { ArticleEditor } from "@/components/article-editor";
import { isToday, format, formatDistanceToNow } from 'date-fns';
import { UserDisplayName } from "@/components/ui/user-display-name";
import { useEffect } from "react";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface Article extends DocumentData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  authorDisplayName: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  lastEditorDisplayName?: string;
  viewCount?: number;
}

export default function ArticlePage({ params }: PageProps<{ slug: string }>) {
  const slug = params.slug;
  const { user } = useAuth();
  const router = useRouter();
  const { firestore } = useFirebase();

  if (slug === 'new') {
    return <ArticleEditor />;
  }

  const articleRef = useMemoFirebase(() => doc(firestore, 'wiki_pages', slug), [firestore, slug]);
  const {data: article, isLoading} = useDoc<Article>(articleRef);
  
  useEffect(() => {
    // Increment view count
    if (articleRef) {
        updateDocumentNonBlocking(articleRef, { viewCount: increment(1) }).catch(err => {
            console.warn("Could not update view count. This might be due to permissions or the document not existing yet.");
        });
    }
  }, [articleRef]);


  if (isLoading) {
    return <div>Loading entry...</div>
  }

  if (!article) {
    notFound();
  }

  const canEdit = user?.role === 'Admin' || user?.role === 'Editor';

  const formatTimestamp = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return 'Date not available';
    const date = timestamp.toDate();
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'PPP');
  };

  const hasBeenEdited = article.updatedAt && article.lastEditorDisplayName && article.authorDisplayName !== article.lastEditorDisplayName;
  
  return (
    <article className="max-w-4xl mx-auto">
      {article.imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 shadow-lg">
            <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="w-full h-auto object-cover"
            priority
            />
        </div>
      )}
      <div className="flex justify-between items-start gap-4 mb-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">{article.title}</h1>
        {canEdit && (
            <Button onClick={() => router.push(`/article/${article.id}/edit`)} className="shrink-0">
                <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
        <span>By <UserDisplayName displayName={article.authorDisplayName} /></span>
        <span>|</span>
        <span>Created: {formatTimestamp(article.createdAt)}</span>
        {hasBeenEdited && (
            <>
                <span>|</span>
                <span>Last edited by <UserDisplayName displayName={article.lastEditorDisplayName} /> {formatTimestamp(article.updatedAt)}</span>
            </>
        )}
         {article.viewCount !== undefined && (
            <>
                <span>|</span>
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {article.viewCount.toLocaleString()} views</span>
            </>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {(article.tags || []).map((tag: string) => (
          <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">{tag}</Badge>
          </Link>
        ))}
      </div>
      <div 
        className="prose-base md:prose-lg dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap font-body"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
