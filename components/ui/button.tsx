import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] shadow-sm",
  secondary:
    "bg-white/80 text-[var(--ink)] border border-[var(--line)] hover:bg-white",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-black/5",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
