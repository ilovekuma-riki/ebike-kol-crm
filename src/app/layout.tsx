import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "KOL RideOps", description: "eBike KOL 全生命周期管理与效果评估" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
