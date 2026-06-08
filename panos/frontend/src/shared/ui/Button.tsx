import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/utils/classnames";

import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

const SIZE_CLASS: Record<ButtonSize, string | undefined> = {
  sm: styles.sm,
  md: undefined,
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  asChild = false,
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(styles.button, VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className, ...props }: IconButtonProps) {
  return (
    <button className={cn(styles.iconButton, className)} aria-label={label} {...props}>
      {children}
    </button>
  );
}
