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
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span>{name}</span>
      {isDev && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">Dev</Badge>}
    </div>
  );
}
