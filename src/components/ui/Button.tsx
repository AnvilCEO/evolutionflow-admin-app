"use client";

import { cn } from "@/utils/cn";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 스타일 변형
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * 버튼 크기
   * @default "md"
   */
  size?: ButtonSize;
  /**
   * 로딩 상태 여부
   * @default false
   */
  isLoading?: boolean;
  /**
   * 전체 너비 여부
   * @default false
   */
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white border border-black hover:bg-transparent hover:text-black",
  secondary:
    "bg-white text-black border border-black hover:bg-black hover:text-white",
  outline:
    "bg-transparent text-black border border-black hover:bg-black hover:text-white",
  ghost:
    "bg-transparent text-black border border-transparent hover:border-black",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-[32px] px-4 text-[12px]",
  md: "h-[44px] px-6 text-[14px]",
  lg: "h-[56px] px-8 text-[16px]",
};

/**
 * 공통 버튼 컴포넌트
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   버튼 텍스트
 * </Button>
 *
 * <Button variant="outline" isLoading>
 *   로딩 중...
 * </Button>
 */
export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        // 기본 스타일
        "font-pretendard inline-flex cursor-pointer select-none items-center justify-center font-medium leading-none transition-colors duration-200",
        // 비활성 상태
        "disabled:cursor-not-allowed disabled:opacity-40",
        // variant
        variantStyles[variant],
        // size
        sizeStyles[size],
        // 전체 너비
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {/* 로딩 스피너 */}
      {isLoading && (
        <span
          className={cn(
            "mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
