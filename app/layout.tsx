import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "COLLABLE | 스트리머 합방 예약",
  description: "스트리머끼리 가능한 시간을 확인하고 합방을 신청하는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-slate-950 antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
