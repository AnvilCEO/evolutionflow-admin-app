"use client";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "로딩 중..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
