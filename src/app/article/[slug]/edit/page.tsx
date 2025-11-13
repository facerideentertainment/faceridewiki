
"use client";

import { ArticleEditor } from "@/components/article-editor";
import { notFound, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { PageProps } from "@/types";

export default function EditArticlePage({ params }: PageProps<{ slug: string }>) {
  const slug = params.slug;
  const { user } = useAuth();
  const router = useRouter();
  const { firestore } = useFirebase();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const articleRef = useMemoFirebase(() => doc(firestore, 'wiki_pages', slug), [firestore, slug]);
  const { data: article, isLoading } = useDoc(articleRef);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { // Wait for user to be loaded
        if (user === null && !isLoading) { // User is definitely not logged in
             router.push('/login');
        }
        return;
    }
    
    if (!article) {
        if(!isLoading) notFound();
        return;
    }

    const canEdit = user.role === 'Admin' || user.role === 'Editor';
    
    if (!canEdit) {
        router.push(`/article/${slug}`);
        setIsAuthorized(false);
    } else {
        setIsAuthorized(true);
    }
  }, [user, router, article, slug, isLoading]);

  if (isLoading || isAuthorized === null) {
      return <div>Checking permissions...</div>
  }

  if (!article) {
    notFound();
  }

  if (!isAuthorized) {
    return <div>Redirecting...</div>
  }

  return <ArticleEditor article={article} />;
}
