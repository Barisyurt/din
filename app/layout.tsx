import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import HeaderInstallButton from "@/components/HeaderInstallButton";
import { Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "Din Asistanı - İbadet Rehberi, Ezan Vakitleri, Zikirmatik, Kur'an ve Kıble",
  description: "Modern, hızlı ve mobil uyumlu PWA İslami rehber uygulaması.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "İbadet",
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10B981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="İbadet" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <div className="app-container">
          <header className="app-header">
            <div className="brand-wrapper">
              <div className="brand-icon-bg">
                <Moon size={22} fill="currentColor" />
              </div>
              <div>
                <h1 className="brand-title">İslami Rehber</h1>
                <p className="brand-subtitle">Huzur ve İbadet Asistanı</p>
              </div>
            </div>

            <HeaderInstallButton />
          </header>

          <main className="app-content">{children}</main>

          <PWAInstallPrompt />
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
