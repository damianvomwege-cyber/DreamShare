import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DreamShareMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_30%_18%,#8ff7ff_0,#28d7e8_28%,#128aa8_58%,#10213f_100%)] text-white shadow-lg shadow-cyan-950/15",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        className="size-[78%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M43.8 15.1c-9.5 1.1-16.9 9.2-16.9 19 0 5.6 2.4 10.6 6.2 14.1-9.6-1.1-17-9.3-17-19.2 0-10.7 8.7-19.4 19.4-19.4 3 0 5.8.7 8.3 1.9z"
          fill="white"
          opacity=".96"
        />
        <path
          d="M39.4 27.4c3.8 0 6.9 2.6 7.7 6.2 3 .6 5.3 3.2 5.3 6.4 0 3.6-2.9 6.6-6.6 6.6H25.2c-4.1 0-7.5-3.3-7.5-7.5 0-3.8 2.8-6.9 6.5-7.4 1.5-4.4 5.6-7.6 10.5-7.6 2 0 3.9.5 5.5 1.4"
          stroke="#10213f"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".55"
        />
        <path
          d="M39.4 27.4c3.8 0 6.9 2.6 7.7 6.2 3 .6 5.3 3.2 5.3 6.4 0 3.6-2.9 6.6-6.6 6.6H25.2c-4.1 0-7.5-3.3-7.5-7.5 0-3.8 2.8-6.9 6.5-7.4 1.5-4.4 5.6-7.6 10.5-7.6 2 0 3.9.5 5.5 1.4"
          stroke="white"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M49.3 13.7l1.2 3.2 3.2 1.2-3.2 1.2-1.2 3.2-1.2-3.2-3.2-1.2 3.2-1.2z"
          fill="#F97316"
        />
        <circle cx="17.2" cy="17.5" r="2.6" fill="#F97316" />
      </svg>
    </span>
  );
}

export function DreamShareLogo({
  className,
  markClassName,
  label = APP_NAME,
}: {
  className?: string;
  markClassName?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <DreamShareMark className={markClassName} />
      <span className="font-bold tracking-normal">{label}</span>
    </span>
  );
}
