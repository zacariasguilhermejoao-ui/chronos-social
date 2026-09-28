import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps & { className?: string; activeClassName?: string }>(
  ({ className, activeClassName, to, ...props }, ref) => (
    <RouterNavLink
      ref={ref}
      to={to}
      className={({ isActive }) => cn(className, isActive && activeClassName)}
      {...props}
    />
  )
);
NavLink.displayName = "NavLink";

export { NavLink };
