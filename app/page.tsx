import Link from "next/link";
import { Sparkles, Clock, BookOpen, Compass, ChevronRight } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Zikirmatik",
      desc: "Zikirlerinizi ve tesbihatlarınızı sayın, kaydedin ve takip edin.",
      href: "/zikirmatik",
      icon: Sparkles,
      color: "rgba(16, 185, 129, 0.15)",
      accent: "#10B981",
    },
    {
      title: "Ezan Vakitleri",
      desc: "Konumunuza göre günlük namaz vakitlerini görüntüleyin.",
      href: "/vakitler",
      icon: Clock,
      color: "rgba(245, 158, 11, 0.15)",
      accent: "#F59E0B",
    },
    {
      title: "Kur'an-ı Kerim",
      desc: "Ayetleri, sureleri ve mealleri okuyun, dinleyin.",
      href: "/kuran",
      icon: BookOpen,
      color: "rgba(99, 102, 241, 0.15)",
      accent: "#818CF8",
    },
    {
      title: "Kıble Pusulası",
      desc: "Kabe yönünü hassas pusula ile anında belirleyin.",
      href: "/kible",
      icon: Compass,
      color: "rgba(236, 72, 153, 0.15)",
      accent: "#F472B6",
    },
  ];

  return (
    <div className="page-container">
      <div className="hero-card">
        <div className="hero-icon-wrapper">
          <Sparkles size={28} />
        </div>
        <h2 className="hero-title">Hoş Geldiniz</h2>
        <p className="hero-description">
          İslami Rehber uygulamasına hoş geldiniz. Alt menüden dilediğiniz modüle kolayca erişebilirsiniz.
        </p>
        <span className="feature-badge">Adım 1: Temel İskelet Hazır</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderRadius: "18px",
                background: "rgba(22, 31, 48, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.accent,
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "2px" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
