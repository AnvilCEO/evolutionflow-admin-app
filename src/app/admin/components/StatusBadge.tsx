"use client";

interface StatusBadgeProps {
  status: "active" | "inactive" | "suspended" | "pending" | "approved" | "rejected";
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      displayText: label || "활성",
    },
    inactive: {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      displayText: label || "비활성",
    },
    suspended: {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      displayText: label || "정지됨",
    },
    pending: {
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      displayText: label || "대기중",
    },
    approved: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      displayText: label || "승인됨",
    },
    rejected: {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      displayText: label || "거절됨",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.displayText}
    </span>
  );
}
