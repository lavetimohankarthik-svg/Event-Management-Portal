import { cn } from "@/lib/utils";

export const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children }) => (
  <div className={cn("border-b border-[var(--color-border)] px-5 py-4", className)}>
    {children}
  </div>
);

export const CardBody = ({ className, children }) => (
  <div className={cn("px-5 py-4", className)}>{children}</div>
);

export const Badge = ({ className, children }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      className
    )}
  >
    {children}
  </span>
);
