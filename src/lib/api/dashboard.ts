import { apiGet } from "./client";

export type DashboardMetrics = {
  totalMembers: number;
  totalInstructors: number;
  totalWorkshops: number;
  totalWorkshopRequests: number;
  totalTripEventApplications: number;
  totalStudios: number;
  totalPartnershipInquiries: number;
  totalSchedules: number;
};

export type DashboardActivity = {
  id: string;
  type: "member";
  description: string;
  timestamp: string;
  user: string;
};

export type DashboardSnapshot = {
  metrics: DashboardMetrics;
  recentActivities: DashboardActivity[];
  failedSources: string[];
};

type MemberListItem = {
  id: string;
  name?: string | null;
  nameKo?: string | null;
  nameEn?: string | null;
  createdAt?: string;
};

const DEFAULT_METRICS: DashboardMetrics = {
  totalMembers: 0,
  totalInstructors: 0,
  totalWorkshops: 0,
  totalWorkshopRequests: 0,
  totalTripEventApplications: 0,
  totalStudios: 0,
  totalPartnershipInquiries: 0,
  totalSchedules: 0,
};

function readTotal(response: unknown): number {
  if (!response || typeof response !== "object") return 0;

  const withTotal = response as { total?: unknown; data?: unknown };
  if (typeof withTotal.total === "number") return withTotal.total;
  if (Array.isArray(withTotal.data)) return withTotal.data.length;
  return 0;
}

function safeUserName(user: MemberListItem): string {
  const candidate = [user.nameKo, user.name, user.nameEn].find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return candidate?.trim() ?? "회원";
}

function mapRecentActivities(response: unknown): DashboardActivity[] {
  if (!response || typeof response !== "object") return [];

  const data = (response as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];

  return data
    .map((raw): DashboardActivity | null => {
      if (!raw || typeof raw !== "object") return null;
      const item = raw as MemberListItem;
      if (typeof item.id !== "string") return null;

      return {
        id: item.id,
        type: "member",
        description: "새로운 회원 가입",
        timestamp: item.createdAt ?? "",
        user: safeUserName(item),
      };
    })
    .filter((item): item is DashboardActivity => item !== null);
}

type MetricSource = {
  key: keyof DashboardMetrics;
  path: string;
};

const METRIC_SOURCES: MetricSource[] = [
  { key: "totalMembers", path: "/users?page=1&pageSize=1" },
  { key: "totalInstructors", path: "/teachers?page=1&limit=1" },
  { key: "totalWorkshops", path: "/workshops?page=1&limit=1" },
  { key: "totalWorkshopRequests", path: "/requests/workshop?page=1&limit=1" },
  {
    key: "totalTripEventApplications",
    path: "/trip-events/applications/all?page=1&limit=1",
  },
  { key: "totalStudios", path: "/studios?page=1&limit=1" },
  { key: "totalPartnershipInquiries", path: "/requests/contact?page=1&limit=1" },
  { key: "totalSchedules", path: "/schedules?page=1&limit=1" },
];

export async function getAdminDashboardSnapshot(
  accessToken: string,
): Promise<DashboardSnapshot> {
  const failedSources: string[] = [];
  const metricResultEntries = await Promise.all(
    METRIC_SOURCES.map(async (source) => {
      try {
        const response = await apiGet<unknown>(source.path, accessToken);
        return [source.key, readTotal(response)] as const;
      } catch {
        failedSources.push(source.key);
        return [source.key, 0] as const;
      }
    }),
  );

  const metrics = metricResultEntries.reduce<DashboardMetrics>(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    { ...DEFAULT_METRICS },
  );

  let recentActivities: DashboardActivity[] = [];
  try {
    const usersResponse = await apiGet<unknown>(
      "/users?page=1&pageSize=4&sortBy=createdAt&sortDirection=desc",
      accessToken,
    );
    recentActivities = mapRecentActivities(usersResponse);
  } catch {
    failedSources.push("recentActivities");
  }

  return {
    metrics,
    recentActivities,
    failedSources,
  };
}
