/**
 * Card Component
 * Container component for grouping related content
 */

"use client";

import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
  header?: ReactNode;
  footer?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      header,
      footer,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: "bg-white border border-gray-200",
      elevated: "bg-white shadow-md border border-gray-100",
      bordered: "bg-white border-2 border-gray-300",
    };

    const paddingStyles = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg transition-shadow duration-200",
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {header && (
          <div className={cn("border-b border-gray-200", padding !== "none" && "-mt-6 -mx-6 px-6 py-4 mb-6")}>
            {header}
          </div>
        )}

        {children}

        {footer && (
          <div className={cn("border-t border-gray-200 mt-6", padding !== "none" && "-mb-6 -mx-6 px-6 py-4")}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
