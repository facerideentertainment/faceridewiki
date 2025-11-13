
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Shield, HelpCircle, FileQuestion, Megaphone, FileSearch, LogOut } from "lucide-react";
import Image from "next/image";

import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { associates } from "@/lib/associates";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, DocumentData } from "firebase/firestore";

interface WikiArticle extends DocumentData {
  title: string;
  content: string;
  tags?: string[];
}

function AssociateSidebarSection() {
    const { firestore } = useFirebase();
    const articlesCollection = useMemoFirebase(() => collection(firestore, 'wiki_pages'), [firestore]);
    const { data: articles } = useCollection<WikiArticle>(articlesCollection);
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();


    const getAssociateArticleCount = (associateName: string) => {
        if (!articles) return 0;
        const lowerCaseName = associateName.toLowerCase();
        return articles.filter(article => 
            article.title.toLowerCase().includes(lowerCaseName) ||
            article.content.toLowerCase().includes(lowerCaseName) ||
            (article.tags || []).some((tag: string) => tag.toLowerCase().includes(lowerCaseName))
        ).length;
    }
    
    const handleClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };


    return (
        <div className="p-4">
            <p className="font-bold mb-2 text-muted-foreground text-xs uppercase tracking-wider px-2">Associates</p>
            <SidebarMenu>
                {associates.map(associate => (
                    <SidebarMenuItem key={associate.id}>
                        <SidebarMenuButton asChild size="sm" isActive={pathname === `/associates/${associate.id}`} onClick={handleClick} className="h-auto py-1.5">
                            <Link href={`/associates/${associate.id}`} className="flex items-center justify-start w-full">
                                <Image 
                                    src={associate.logo} 
                                    alt={`${associate.name} logo`} 
                                    width={32} 
                                    height={32} 
                                    className="rounded-full flex-shrink-0 border-2 border-border mr-3"
                                    unoptimized
                                />
                                <span className="flex-grow whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-sm">{associate.name}</span>
                                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 ml-auto flex-shrink-0">
                                    {getAssociateArticleCount(associate.name)}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </div>
    )
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Editor';
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
        setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    handleClick();
    logout();
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center p-4 border-b">
        <Link href="/" onClick={handleClick}>
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/facerideentertainment%20(1)-modified.png?alt=media&token=0cf7814b-356e-4541-b320-bfbd0be1d07a"
            alt="Face Ride Entertainment Logo"
            width={120}
            height={34}
            className="dark:invert"
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-0 no-scrollbar">
        
        <AssociateSidebarSection />

        <div className="px-4 py-2">
            <SidebarMenu className="gap-0">
                <SidebarMenuItem>
                    <SidebarMenuButton
                    asChild
                    size="lg"
                    className="font-headline font-semibold"
                    isActive={pathname === "/search"}
                    tooltip={{ children: "Explore Entries" }}
                    onClick={handleClick}
                    >
                    <Link href="/search">
                        <FileSearch />
                        <span>Explore Entries</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                {canEdit && (
                <SidebarMenuItem>
                    <SidebarMenuButton
                    asChild
                    size="lg"
                    className="font-headline font-semibold"
                    isActive={pathname === "/article/new"}
                    tooltip={{ children: "Create Entry" }}
                    onClick={handleClick}
                    >
                    <Link href="/article/new">
                        <PlusCircle />
                        <span>Create Entry</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                )}
            {user?.role === "Admin" && (
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    size="lg"
                    className="font-headline font-semibold"
                    isActive={pathname === "/admin"}
                    tooltip={{ children: "Admin" }}
                    onClick={handleClick}
                >
                    <Link href="/admin">
                    <Shield />
                    <span>Admin Dashboard</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            </SidebarMenu>
        </div>
        
        {loading ? (
            <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
        ) : user && (
            <div className="p-4 text-sm">
                <SidebarSeparator className="my-2"/>
                <div>
                    <p className="font-semibold text-foreground">Signed in as</p>
                    <p className="text-muted-foreground truncate">{user.displayName || user.email.split('@')[0]}</p>
                    <p className="text-muted-foreground">Role: {user.role}</p>
                </div>
            </div>
        )}
        
        <div className="flex-grow" />

        <div className="p-4 text-sm">
            <SidebarSeparator className="my-2"/>
            <p className="font-semibold mb-2 text-muted-foreground text-xs uppercase tracking-widest px-2">Quick Links</p>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" className="justify-start text-muted-foreground gap-1" isActive={pathname === '/help'} onClick={handleClick}>
                        <Link href="/help"><HelpCircle className="mr-2 h-4 w-4" /> Help & Support</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" className="justify-start text-muted-foreground gap-1" isActive={pathname === '/guidelines'} onClick={handleClick}>
                        <Link href="/guidelines"><FileQuestion className="mr-2 h-4 w-4" /> Guidelines</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild size="sm" className="justify-start text-muted-foreground gap-1" isActive={pathname === '/about'} onClick={handleClick}>
                        <Link href="/about"><Megaphone className="mr-2 h-4 w-4" /> About</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>


      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        {loading ? (
            <div className="h-10 bg-muted rounded animate-pulse" />
        ) : user ? (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton variant="ghost" onClick={handleLogout} className="w-full justify-start font-semibold">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        ) : (
            <div className="p-2">
                <Button asChild className="w-full h-11 text-base font-headline tracking-wider">
                    <Link href="/login" onClick={handleClick}>Login / Sign Up</Link>
                </Button>
            </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
