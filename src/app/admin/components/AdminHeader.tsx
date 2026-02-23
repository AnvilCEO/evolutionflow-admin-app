"use client";

import { AuthUser } from "@/lib/api/auth";

interface AdminHeaderProps {
  user: AuthUser;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export default function AdminHeader({
  user,
  onLogout,
  onToggleSidebar,
}: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-2 hover:bg-gray-100"
        >
          {/* Menu Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        <span className="font-pretendard text-lg font-bold">Admin Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {user?.name || "Administrator"}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-md p-2 text-sm text-red-600 hover:bg-red-50"
        >
          {/* Logout Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
