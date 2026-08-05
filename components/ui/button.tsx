import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-normal tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] hover:-translate-y-0.5 active:translate-y-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent-gold)] text-white hover:bg-[var(--accent-gold-hover)] hover:shadow-[0_0_40px_rgb(var(--accent-gold-rgb)/50%)]",
        outline:
          "border border-[rgb(var(--accent-gold-rgb)/35%)] text-white backdrop-blur-sm hover:border-[rgb(var(--accent-gold-rgb)/70%)] hover:bg-[rgb(var(--accent-gold-rgb)/10%)] hover:text-white",
        ghost:
          "text-white/70 hover:text-white hover:bg-white/5",
        dark:
          "bg-white text-black hover:bg-white/90",
      },
      size: {
        sm: "h-9 px-5 text-xs",
        md: "h-11 px-7",
        lg: "h-13 px-9 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild) {
      const child = React.Children.only(
        children as React.ReactElement<{ className?: string }>
      );
      return React.cloneElement(child, {
        className: cn(
          buttonVariants({ variant, size }),
          className,
          child.props.className
        ),
      });
    }
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
