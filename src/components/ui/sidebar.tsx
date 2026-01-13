'use client';

import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

interface SidebarItemProps {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <aside className={cn('w-64 border-r bg-white dark:bg-zinc-950 flex flex-col', className)}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children }: SidebarProps) {
  return <div className={cn('p-4 border-b', className)}>{children}</div>;
}

export function SidebarContent({ className, children }: SidebarProps) {
  return <div className={cn('flex-1 overflow-y-auto p-4', className)}>{children}</div>;
}

export function SidebarFooter({ className, children }: SidebarProps) {
  return <div className={cn('p-4 border-t', className)}>{children}</div>;
}

export function SidebarItem({ active, children, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        active === true
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
          : 'text-zinc-700 dark:text-zinc-300'
      )}
    >
      {children}
    </button>
  );
}

export function SidebarLabel({ className, children }: SidebarProps) {
  return (
    <span className={cn('px-3 text-xs font-semibold text-muted-foreground uppercase', className)}>
      {children}
    </span>
  );
}
