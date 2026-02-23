"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { label: "대시보드", href: "/admin", icon: "📊" },
  { label: "회원관리", href: "/admin/members", icon: "👥" },
  { label: "강사관리", href: "/admin/instructors", icon: "🎓" },
  { label: "워크샵", href: "/admin/workshops", icon: "📚" },
  { label: "스케줄", href: "/admin/schedules", icon: "📅" },
  { label: "스튜디오", href: "/admin/studios", icon: "🏢" },
  { label: "Trip&Event", href: "/admin/events", icon: "🎉" },
  { label: "제휴문의", href: "/admin/inquiries", icon: "🤝" },
];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          {isOpen && <h1 className="font-bold text-lg">Evolutionflow</h1>}
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onToggle}
            className="w-full text-xs text-gray-600 hover:text-black"
          >
            {isOpen ? "숨기기" : "펼치기"}
          </button>
        </div>
      </aside>
    </>
  );
}
