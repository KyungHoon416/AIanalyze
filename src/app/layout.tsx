import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "놀이의발견 AI 광고 자동화 플랫폼",
  description:
    "AI 기반 광고주 유치 및 광고 운영 자동화 플랫폼 — 시장조사부터 ROI 리포트까지, 키워드 하나로 시작하는 광고 사업 운영.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
