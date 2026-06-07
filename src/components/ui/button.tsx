import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import type { DreamSound } from "@/components/layout/sound-effects";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "kinetic-bar bg-[linear-gradient(135deg,var(--primary),color-mix(in_srgb,var(--primary),#0f766e_24%),var(--success))] text-primary-foreground shadow-sm shadow-cyan-950/15 hover:brightness-105 active:brightness-95",
  secondary:
    "border bg-card/72 text-card-foreground shadow-sm shadow-slate-950/5 hover:border-primary/35 hover:bg-muted/70 active:bg-muted",
  ghost: "text-foreground hover:bg-muted/70 active:bg-muted",
  danger:
    "bg-destructive text-white shadow-sm shadow-red-950/15 hover:brightness-105 active:brightness-95",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  sound?: DreamSound | "none";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  sound,
  ...props
}: ButtonProps) {
  const soundName = sound ?? (variant === "danger" ? "danger" : "tap");

  return (
    <button
      data-sound={soundName === "none" ? undefined : soundName}
      className={cn(
        "focus-ring motion-button inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-lg font-medium disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  sound?: DreamSound | "none";
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  sound,
  ...props
}: ButtonLinkProps) {
  const soundName = sound ?? (variant === "danger" ? "danger" : "nav");

  return (
    <Link
      href={href}
      data-sound={soundName === "none" ? undefined : soundName}
      className={cn(
        "focus-ring motion-button inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-lg font-medium",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
