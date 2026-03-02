"use client";

import Link from "next/link";

type BoardItem = {
  id: string;
  name: string;
  description: string;
  path: string;
  status: "active" | "inactive";
};

const boardItems: BoardItem[] = [
  {
    id: "announcements",
    name: "공지사항",
    description: "운영 공지 및 업데이트 안내 게시판",
    path: "/notice/announcements",
    status: "active",
  },
  {
    id: "instructor-community",
    name: "강사 커뮤니티",
    description: "강사 전용 공지 및 커뮤니티 게시판",
    path: "/notice/instructor-community",
    status: "active",
  },
];

export default function AdminBoardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-pretendard text-3xl font-bold text-black">
          게시판 관리
        </h1>
        <p className="font-pretendard mt-2 text-gray-600">
          게시판별 운영 상태와 접근 경로를 확인할 수 있습니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
              <th className="px-6 py-3">게시판</th>
              <th className="px-6 py-3">설명</th>
              <th className="px-6 py-3">상태</th>
              <th className="px-6 py-3">경로</th>
            </tr>
          </thead>
          <tbody>
            {boardItems.map((board, index) => (
              <tr
                key={board.id}
                className={`border-b border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 text-sm font-semibold text-black">
                  {board.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {board.description}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      board.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {board.status === "active" ? "운영중" : "비활성"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    href={board.path}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {board.path}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
