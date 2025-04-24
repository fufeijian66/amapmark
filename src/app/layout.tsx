import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "高德地图标记",
  description: "基于高德地图API的标记点管理应用",
};

// 声明高德地图安全密钥配置类型
declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string;
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 配置高德地图安全密钥 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window._AMapSecurityConfig = {
              securityJsCode: '${process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || ''}'
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
