import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 조건부 class 조합 및 Tailwind 클래스 충돌을 자동으로 정리해주는 유틸 함수
 * @returns
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
