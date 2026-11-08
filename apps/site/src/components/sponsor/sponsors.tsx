import { cn } from "cn";
import { SPONSORS } from "./sponsor-data";

export function Sponsors({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-start gap-x-5 gap-y-5 sm:gap-8", className)}>
      {SPONSORS.map((name) => (
        <li key={name}>
          <a
            href={`https://github.com/${name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-transparent p-1 focus-visible:border-ring"
          >
            <img
              src={`https://unavatar.io/github/${name}`}
              alt={name}
              loading="lazy"
              className="size-14 rounded-full border-2 border-card object-cover shadow-[0_0_0_1px_var(--color-border)] transition-[box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_0_0_2px_var(--color-primary)] sm:size-16"
            />
            <span className="text-[0.8125rem] font-semibold text-muted-foreground transition-colors group-hover:text-foreground sm:text-sm">
              {name}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
