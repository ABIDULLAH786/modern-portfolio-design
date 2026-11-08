import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "ghost" | "subtle" | "danger" | "link";
type Size = "sm" | "md" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-[image:var(--gradient)] text-on-primary shadow-[var(--shadow)] hover:-translate-y-px",
  ghost: "border border-border bg-surface hover:border-primary",
  subtle: "bg-surface-2 hover:bg-primary-soft hover:text-primary",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
  link: "text-primary underline-offset-4 hover:underline px-0",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 [&_svg]:size-4",
  md: "h-11 px-5 text-[0.95rem] gap-2 [&_svg]:size-[18px]",
  icon: "size-9 justify-center [&_svg]:size-4",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "ghost", size = "md", loading, className, children, disabled, type = "button", ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});

export function buttonClass(variant: Variant = "ghost", size: Size = "md", className?: string) {
  return cn("inline-flex shrink-0 items-center rounded-full font-semibold whitespace-nowrap transition", variants[variant], sizes[size], className);
}
