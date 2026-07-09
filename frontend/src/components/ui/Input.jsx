import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Label = ({ children, required, className }) => (
  <label className={cn("mb-1.5 block text-sm font-medium text-[var(--color-ink)]", className)}>
    {children}
    {required && <span className="text-[var(--color-danger)]"> *</span>}
  </label>
);

export const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 text-xs text-[var(--color-danger)]">{message}</p>
  ) : null;

const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export default Input;
