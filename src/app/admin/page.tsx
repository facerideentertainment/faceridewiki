
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, Users, FileText, BarChart3, MoreHorizontal, ExternalLink } from "lucide-react";
import { doc, collection, DocumentData } from 'firebase/firestore';

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { User } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { httpsCallable } from "firebase/functions";
import { firebaseConfig } from "@/firebase/config";

interface Article extends DocumentData {
    id: string;
    title: string;
    authorId: string;
    authorDisplayName: string;
    createdAt: any;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, functions } = useFirebase();

  const [deleteTarget, setDeleteTarget] = useState<{id: string, title: string} | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);

  const usersCollection = useMemoFirebase(() => {
    if (user?.role === 'Admin') {
      return collection(firestore, 'users');
    }
    return null;
  }, [firestore, user]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollection);

  const wikiPagesCollection = useMemoFirebase(() => collection(firestore, 'wiki_pages'), [firestore]);
  const { data: articles, isLoading: articlesLoading } = useCollection<Article>(wikiPagesCollection);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'Admin') {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading or Access Denied...</p>
      </div>
    );
  }
  
  const stats = {
    totalEntries: articles?.length ?? 0,
    totalUsers: users?.length ?? 0,
  };

  const confirmArticleDelete = async () => {
    if (!deleteTarget) return;

    try {
        const articleRef = doc(firestore, 'wiki_pages', deleteTarget.id);
        await deleteDocumentNonBlocking(articleRef);
        toast({
            title: "Entry Deleted",
            description: `"${deleteTarget.title}" has been successfully deleted.`,
        });
    } catch (error) {
        toast({
            title: "Error Deleting Entry",
            description: "There was a problem deleting the entry. Please try again.",
            variant: "destructive",
        });
    } finally {
        setDeleteTarget(null);
    }
  };

  const confirmUserDelete = async () => {
    if (!deleteUserTarget) return;

    try {
        const userDocRef = doc(firestore, 'users', deleteUserTarget.uid);
        await deleteDocumentNonBlocking(userDocRef);
        toast({
            title: "User Record Deleted",
            description: `The document for ${deleteUserTarget.displayName || deleteUserTarget.email} has been removed from the database.`,
        });
    } catch (error: any) {
        toast({
            title: "Deletion Failed",
            description: error.message || "Could not delete user document. Check console for details.",
            variant: "destructive",
        });
    } finally {
        setDeleteUserTarget(null);
    }
  };


  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    const setRole = httpsCallable(functions, 'setRole');
    try {
        await setRole({ uid: userId, role: newRole });
        toast({
            title: "User Role Updated",
            description: `User role has been changed to ${newRole}.`,
        });
    } catch (error) {
        console.error("Error setting role:", error);
        toast({
            title: "Update Failed",
            description: "Could not update user role. Check console for details.",
            variant: "destructive",
        });
    }
  };

  const analyticsUrl = `https://console.firebase.google.com/u/0/project/${firebaseConfig.projectId}/analytics/dashboard`;


  return (
    <>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the entry titled
              <span className="font-bold"> &quot;{deleteTarget?.title}&quot;</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArticleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteUserTarget} onOpenChange={(open) => !open && setDeleteUserTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the database record for <span className="font-bold">{deleteUserTarget?.displayName || deleteUserTarget?.email}</span>. It will NOT delete their authentication account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUserDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Record</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Activity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <Button variant="link" asChild className="p-0 h-auto text-2xl font-bold">
                 <Link href={analyticsUrl} target="_blank" rel="noopener noreferrer">
                   View Analytics
                   <ExternalLink className="h-5 w-5 ml-2" />
                 </Link>
               </Button>
               <p className="text-xs text-muted-foreground">View real-time and historical data in Firebase.</p>
            </CardContent>
          </Card>
        </section>

        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-headline font-bold">User Management</h2>
            </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(usersLoading || !users) ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Loading users...</TableCell></TableRow>
                ) : (
                    users.map((u) => (
                    <TableRow key={u.uid}>
                        <TableCell className="font-medium">{u.displayName || u.email.split('@')[0]}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={u.uid === user.uid}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRoleChange(u.uid, 'Viewer')} disabled={u.role === 'Viewer'}>Viewer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(u.uid, 'Editor')} disabled={u.role === 'Editor'}>Editor</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(u.uid, 'Admin')} disabled={u.role === 'Admin'}>Admin</DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => setDeleteUserTarget(u)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User Record
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold mb-4">Entries Management</h2>
          <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Author</TableHead>
                    <TableHead className="hidden md:table-cell">Creation Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(articlesLoading || !articles) ? (
                     <TableRow><TableCell colSpan={4} className="text-center">Loading entries...</TableCell></TableRow>
                  ) : (
                    articles.map((article) => {
                        const canDelete = user.role === 'Admin' || (user.role === 'Editor' && article.authorId === user.uid);
                        const creationDate = article.createdAt && article.createdAt.toDate ? 
                                            article.createdAt.toDate().toLocaleDateString() : 
                                            'Date not available';
                        return (
                        <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{article.authorDisplayName || '...'}</TableCell>
                        <TableCell className="hidden md:table-cell">{creationDate}</TableCell>
                        <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" asChild>
                            <Link href={`/article/${article.id}`}><Eye className="h-4 w-4" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                            <Link href={`/article/${article.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setDeleteTarget({id: article.id, title: article.title})} 
                                className="text-destructive hover:text-destructive"
                                disabled={!canDelete}
                                title={canDelete ? "Delete entry" : "You do not have permission to delete this"}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    )})
                  )}
                </TableBody>
              </Table>
          </Card>
        </section>
      </div>
    </>
  );
}

    