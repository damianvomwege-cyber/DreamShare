import Image from "next/image";

import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full border bg-[linear-gradient(135deg,var(--muted),color-mix(in_srgb,var(--primary),transparent_84%))] text-sm font-bold text-muted-foreground shadow-sm shadow-slate-950/10",
        className,
      )}
      aria-label={name}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
