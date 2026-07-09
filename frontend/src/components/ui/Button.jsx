import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm",
  accent:
    "bg-[var(--color-accent)] text-[var(--color-primary-dark)] hover:brightness-95 shadow-sm",
  outline:
    "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-paper)]",
  ghost: "text-[var(--color-ink)] hover:bg-[var(--color-paper)]",
  danger: "bg-[var(--color-danger)] text-white hover:brightness-95",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-5 py-3 rounded-xl",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
