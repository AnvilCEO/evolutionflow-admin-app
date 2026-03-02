"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_MENU_DEFAULT_ITEMS,
  ADMIN_MENU_STORAGE_KEY,
  ADMIN_MENU_UPDATED_EVENT,
  AdminMenuItem,
  cloneAdminMenuItems,
  normalizeAdminMenuItems,
} from "@/constants/adminMenu";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function loadMenuItems(): AdminMenuItem[] {
  if (typeof window === "undefined") {
    return cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS);
  }

  const rawValue = window.localStorage.getItem(ADMIN_MENU_STORAGE_KEY);
  if (!rawValue) {
    return cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS);
  }

  try {
    return normalizeAdminMenuItems(JSON.parse(rawValue));
  } catch {
    return cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS);
  }
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>(
    cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS),
  );

  useEffect(() => {
    const syncMenuItems = () => setMenuItems(loadMenuItems());

    syncMenuItems();

    const onStorage = (event: StorageEvent) => {
      if (event.key !== ADMIN_MENU_STORAGE_KEY) return;
      syncMenuItems();
    };

    const onMenuUpdated = () => syncMenuItems();

    window.addEventListener("storage", onStorage);
    window.addEventListener(ADMIN_MENU_UPDATED_EVENT, onMenuUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ADMIN_MENU_UPDATED_EVENT, onMenuUpdated);
    };
  }, []);

  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => item.visible),
    [menuItems],
  );

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
          {visibleMenuItems.map((item) => {
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
