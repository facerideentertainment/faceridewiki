"use client";

import { Badge } from "@/components/ui/badge";

interface UserDisplayNameProps {
  displayName: string | null | undefined;
  className?: string;
}

export function UserDisplayName({ displayName, className }: UserDisplayNameProps) {
  const name = displayName || '...';
  const isDev = name.toLowerCase() === 'maxplasss';
  
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span>{name}</span>
      {isDev && <Badge variant="destructive" className="text-[10px] px-1 py-0">Dev</Badge>}
    </span>
  );
}
