"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /*
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return null;
  }
  */

  // Mock user for UI preview
  const mockUser = user || {
    id: 'mock-admin',
    email: 'admin@evolutionflowglobal.com',
    name: '관리자(PREVIEW)',
    role: 'ADMIN'
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeader
          user={mockUser as any}
          onLogout={() => {
            signOut();
            router.replace("/login");
          }}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
