
"use client";

import { Search, Menu, RefreshCw, LogOut, ImageIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "../theme-toggle";
import { ProfilePictureEditor } from "../profile-picture-editor";
import { useCart } from "@/context/cart-context";
import { Badge } from "../ui/badge";

export function AppHeaderClient() {
  const { toggleSidebar, isMobile } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { user, logout, loading } = useAuth();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const { cartItems } = useCart();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);


  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/search`);
    }
  };

  return (
    <>
      <ProfilePictureEditor open={isProfileEditorOpen} onOpenChange={setIsProfileEditorOpen} />
      
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search wiki entries..."
              defaultValue={searchParams.get("q") || ""} 
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-80 lg:w-96"
              aria-label="Search articles"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
                {totalItems}
              </Badge>
            )}
            <span className="sr-only">Shopping Cart</span>
          </Link>
        </Button>
        {loading ? (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.email || ''} />
                  <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {user.role}
                </p>
              </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileEditorOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Change Picture</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </>
  );
}
