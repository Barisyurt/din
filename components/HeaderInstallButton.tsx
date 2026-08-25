"use client";

import { useState, useEffect } from "react";
import { Download, CheckCircle, Info, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function HeaderInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    }

    // Capture beforeinstallprompt event for native Chrome/Android/Edge install
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
    if (deferredPrompt) {
      // Trigger native Chrome/Android PWA install dialog
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      // Show guide modal if native prompt is not available (iOS Safari or unsupported browser)
      setShowGuideModal(true);
    }
  };

  if (isStandalone) {
    return (
      <div className="header-badge">
        <span className="live-dot"></span>
        <span>Yüklendi</span>
      </div>
    );
  }

  return (
    <>
      <button
        className="header-install-btn"
        onClick={handleInstallClick}
        title="Uygulamayı Cihazınıza Yükleyin"
        id="btn-header-pwa-install"
      >
        <Download size={14} className="install-btn-icon" />
        <span>Uygulamayı Yükle</span>
      </button>

      {/* iOS / Unsupported Browser Guide Modal */}
      {showGuideModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="city-modal-card" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--emerald-light)", fontWeight: "700" }}>
                <Smartphone size={20} />
                <span>Uygulamayı Yükle</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginTop: "12px", fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "12px" }}>
                <strong>Din Asistanı</strong> uygulamasını ana ekranınıza eklemek için:
              </p>

              <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid var(--border-highlight)", padding: "12px", borderRadius: "12px", fontSize: "0.85rem" }}>
                <p style={{ fontWeight: "700", color: "var(--emerald-light)", marginBottom: "4px" }}>📱 iOS (iPhone / Safari):</p>
                <p>Safari'nin altındaki <strong>"Paylaş"</strong> düğmesine basın ve <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</p>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "12px", fontSize: "0.85rem", marginTop: "8px" }}>
                <p style={{ fontWeight: "700", color: "var(--gold-accent)", marginBottom: "4px" }}>🌐 Android / Chrome:</p>
                <p>Sağ üstteki 3 noktaya dokunun ve <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğine tıklayın.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "10px",
                borderRadius: "var(--radius-full)",
                background: "var(--emerald-primary)",
                color: "#FFFFFF",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
              }}
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
