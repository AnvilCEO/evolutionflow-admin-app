"use client";

import { useState } from "react";
import AdminTable from "../components/AdminTable";

export default function PartnershipsPage() {
  const [inquiries] = useState([
    {
      id: "p1",
      companyName: "(주)요가복스",
      contactName: "김팀장",
      email: "contact@yogafox.com",
      status: "unread",
      createdAt: "2025-02-15T10:00:00Z",
    },
    {
      id: "p2",
      companyName: "힐링매트 스튜디오",
      contactName: "이대표",
      email: "ceo@healingmat.co.kr",
      status: "read",
      createdAt: "2025-02-10T14:30:00Z",
    },
  ]);

  const columns = [
    { key: "companyName", label: "업체/기관명" },
    { key: "contactName", label: "담당자명" },
    { key: "email", label: "이메일" },
    {
      key: "status",
      label: "상태",
      render: (value: unknown) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === "unread" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {value === "unread" ? "읽지 않음" : "확인 완료"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "문의 접수일",
      render: (value: unknown) => new Date(value as string).toLocaleDateString("ko-KR"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-pretendard text-3xl font-bold text-black">제휴문의</h1>
          <p className="font-pretendard mt-2 text-gray-600">
            앱 및 웹사이트를 통해 접수된 제휴/비즈니스 문의 내역을 확인합니다.
          </p>
        </div>
      </div>

      <AdminTable columns={columns as never} data={inquiries as never} rowKey="id" />
    </div>
  );
}
