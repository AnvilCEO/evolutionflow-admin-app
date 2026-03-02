"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_MENU_DEFAULT_ITEMS,
  ADMIN_MENU_STORAGE_KEY,
  ADMIN_MENU_UPDATED_EVENT,
  AdminMenuItem,
  cloneAdminMenuItems,
  normalizeAdminMenuItems,
} from "@/constants/adminMenu";

function moveItem(items: AdminMenuItem[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export default function AdminMenuManagementPage() {
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>(
    cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS),
  );
  const [isReady, setIsReady] = useState(false);

  const visibleCount = useMemo(
    () => menuItems.filter((item) => item.visible).length,
    [menuItems],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawValue = window.localStorage.getItem(ADMIN_MENU_STORAGE_KEY);
    if (!rawValue) {
      setIsReady(true);
      return;
    }

    try {
      setMenuItems(normalizeAdminMenuItems(JSON.parse(rawValue)));
    } catch {
      setMenuItems(cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS));
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;

    const storedItems = menuItems.map((item) => ({
      id: item.id,
      visible: item.visible,
    }));

    window.localStorage.setItem(
      ADMIN_MENU_STORAGE_KEY,
      JSON.stringify(storedItems),
    );
    window.dispatchEvent(new Event(ADMIN_MENU_UPDATED_EVENT));
  }, [menuItems, isReady]);

  const handleToggleVisible = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item,
      ),
    );
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    setMenuItems((prev) => moveItem(prev, index, direction));
  };

  const handleReset = () => {
    setMenuItems(cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-pretendard text-3xl font-bold text-black">메뉴관리</h1>
        <p className="font-pretendard mt-2 text-gray-600">
          관리자 사이드바 메뉴의 노출 여부와 순서를 관리합니다.
        </p>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            전체 {menuItems.length}개 메뉴 중{" "}
            <span className="font-semibold text-black">{visibleCount}개</span>가
            노출 중입니다.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            기본값 복원
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">순서</th>
              <th className="px-4 py-3">메뉴명</th>
              <th className="px-4 py-3">경로</th>
              <th className="px-4 py-3">노출</th>
              <th className="px-4 py-3">정렬</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-semibold text-black">
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.href}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(item.id)}
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      item.visible
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {item.visible ? "노출" : "숨김"}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === menuItems.length - 1}
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
