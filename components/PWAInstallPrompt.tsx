"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("Service Worker registration failed:", err);
          });
      });
    }

    // 2. Capture Chrome / Mobile PWA Install Prompt Event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("User accepted PWA install");
    }
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || isDismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "440px",
        zIndex: 9999,
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(4, 120, 87, 0.98))",
        color: "#FFFFFF",
        padding: "12px 16px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.3s ease-out forwards",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Smartphone size={20} />
        </div>
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>Din Asistanı'nı Yükle</div>
          <div style={{ fontSize: "0.725rem", opacity: 0.9 }}>Ana ekrana ekleyip çevrimdışı kullanın</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={handleInstallClick}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            background: "#FFFFFF",
            color: "#047857",
            fontWeight: "700",
            fontSize: "0.8rem",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            whiteSpace: "nowrap",
          }}
          id="btn-pwa-install-banner"
        >
          <Download size={14} />
          <span>Yükle</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.8)",
            cursor: "pointer",
            padding: "4px",
          }}
          title="Kapat"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
