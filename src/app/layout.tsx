import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { PortfolioProvider } from "@/hooks/usePortfolio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stockfolio — 주식 포트폴리오 관리",
  description: "주식 포트폴리오를 관리하고 실시간 시세 정보를 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <PortfolioProvider>
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
        </PortfolioProvider>
      </body>
    </html>
  );
}
