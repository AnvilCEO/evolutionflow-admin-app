import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Evolutionflow Manager",
    template: "%s | Evolutionflow Manager",
  },
  description: "Evolutionflow manager application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-pretendard bg-gray-50 text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
