import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthGate } from "@/components/AuthGate";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/hooks/useAuth";
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
      <body className="min-h-full bg-slate-950 text-slate-100">
        <AuthProvider>
          <AuthGate>
            <PortfolioProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-10">
                  {children}
                </main>
              </div>
            </PortfolioProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
