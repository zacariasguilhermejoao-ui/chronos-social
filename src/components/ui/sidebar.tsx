import * as React from "react";
import { cn } from "@/lib/utils";

/** Sidebar shell (desktop). Mobile uses bottom nav. */
export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <aside className={cn("hidden lg:flex flex-col w-64 border-r border-border bg-sidebar-background text-sidebar-foreground", className)}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("p-4 border-b border-border", className)}>{children}</div>;
}

export function SidebarContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("flex-1 overflow-y-auto p-2", className)}>{children}</div>;
}

export function SidebarFooter({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("p-4 border-t border-border", className)}>{children}</div>;
}

export function SidebarMenu({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <nav className={cn("space-y-1", className)}>{children}</nav>;
}

export function SidebarMenuItem({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("", className)}>{children}</div>;
}

export function SidebarMenuButton({
  className,
  children,
  isActive,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
