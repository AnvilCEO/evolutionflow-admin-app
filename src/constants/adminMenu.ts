export type AdminMenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  visible: boolean;
};

export const ADMIN_MENU_STORAGE_KEY = "ef-admin-menu-items-v1";
export const ADMIN_MENU_UPDATED_EVENT = "ef-admin-menu-updated";

export const ADMIN_MENU_DEFAULT_ITEMS: AdminMenuItem[] = [
  { id: "dashboard", label: "대시보드", href: "/admin", icon: "📊", visible: true },
  { id: "members", label: "회원관리", href: "/admin/members", icon: "👥", visible: true },
  { id: "requests", label: "신청관리", href: "/admin/requests", icon: "✅", visible: true },
  { id: "boards", label: "게시판 관리", href: "/admin/boards", icon: "📝", visible: true },
  { id: "instructors", label: "강사관리", href: "/admin/instructors", icon: "🎓", visible: true },
  { id: "workshops", label: "워크샵", href: "/admin/workshops", icon: "📚", visible: true },
  { id: "schedules", label: "스케줄", href: "/admin/schedules", icon: "📅", visible: true },
  { id: "studios", label: "스튜디오", href: "/admin/studios", icon: "🏢", visible: true },
  { id: "events", label: "Trip&Event", href: "/admin/events", icon: "🎉", visible: true },
  { id: "inquiries", label: "제휴문의", href: "/admin/inquiries", icon: "🤝", visible: true },
  { id: "menu", label: "메뉴관리", href: "/admin/menu", icon: "🧩", visible: true },
];

export function cloneAdminMenuItems(items: AdminMenuItem[]): AdminMenuItem[] {
  return items.map((item) => ({ ...item }));
}

export function normalizeAdminMenuItems(rawItems: unknown): AdminMenuItem[] {
  if (!Array.isArray(rawItems)) {
    return cloneAdminMenuItems(ADMIN_MENU_DEFAULT_ITEMS);
  }

  const defaultById = new Map(
    ADMIN_MENU_DEFAULT_ITEMS.map((item) => [item.id, item]),
  );
  const seenIds = new Set<string>();
  const normalized: AdminMenuItem[] = [];

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== "object") continue;

    const candidate = rawItem as { id?: unknown; visible?: unknown };
    if (typeof candidate.id !== "string" || seenIds.has(candidate.id)) {
      continue;
    }

    const base = defaultById.get(candidate.id);
    if (!base) continue;

    normalized.push({
      ...base,
      visible:
        typeof candidate.visible === "boolean" ? candidate.visible : base.visible,
    });
    seenIds.add(candidate.id);
  }

  for (const base of ADMIN_MENU_DEFAULT_ITEMS) {
    if (seenIds.has(base.id)) continue;
    normalized.push({ ...base });
  }

  return normalized;
}
