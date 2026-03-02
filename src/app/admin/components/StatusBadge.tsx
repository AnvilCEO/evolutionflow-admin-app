"use client";

interface StatusBadgeProps {
  status: "active" | "inactive" | "suspended" | "pending" | "approved" | "rejected";
  label?: string;
  size?: "sm" | "md";
  withDot?: boolean;
}

export default function StatusBadge({
  status,
  label,
  size = "md",
  withDot = true
}: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      dotColor: "bg-green-500",
      displayText: label || "활성",
    },
    inactive: {
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
      dotColor: "bg-gray-500",
      displayText: label || "비활성",
    },
    suspended: {
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      dotColor: "bg-red-500",
      displayText: label || "정지됨",
    },
    pending: {
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
      dotColor: "bg-yellow-500",
      displayText: label || "대기중",
    },
    approved: {
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      dotColor: "bg-green-500",
      displayText: label || "승인됨",
    },
    rejected: {
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      dotColor: "bg-red-500",
      displayText: label || "거절됨",
    },
  };

  const config = statusConfig[status];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
      )}
      {config.displayText}
    </span>
  );
}
