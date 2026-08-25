"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Clock, BookOpen, Compass } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Zikirmatik",
      href: "/zikirmatik",
      icon: Sparkles,
    },
    {
      name: "Vakitler",
      href: "/vakitler",
      icon: Clock,
    },
    {
      name: "Kur'an",
      href: "/kuran",
      icon: BookOpen,
    },
    {
      name: "Kıble",
      href: "/kible",
      icon: Compass,
    },
  ];

  return (
    <nav className="bottom-nav-wrapper" aria-label="Ana Navigasyon">
      <div className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/vakitler");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
              id={`nav-link-${item.name.toLowerCase().replace(/['\s]/g, "")}`}
            >
              <div className="nav-icon">
                <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span className="nav-label">{item.name}</span>
              {isActive && <div className="active-indicator" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
