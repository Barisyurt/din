"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Compass,
  MapPin,
  CheckCircle2,
  Navigation,
  Info,
  ShieldCheck,
  RotateCw,
  LocateFixed,
  Search,
  X,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  calculateQiblaBearing,
  calculateDistanceToKaaba,
  getCardinalDirection,
  CITY_COORDINATES,
} from "@/utils/qiblaCalculator";

interface UserLocation {
  name: string;
  lat: number;
  lng: number;
  isGPS: boolean;
}

const TURKEY_CITIES = Object.keys(CITY_COORDINATES);
const POPULAR_CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Konya", "Antalya", "Gaziantep", "Adana"];

export default function KiblePage() {
  const [userLocation, setUserLocation] = useState<UserLocation>({
    name: "İstanbul",
    lat: 41.0082,
    lng: 28.9784,
    isGPS: false,
  });

  const [qiblaBearing, setQiblaBearing] = useState<number>(152.4);
  const [distanceKm, setDistanceKm] = useState<number>(2410);
  const [compassHeading, setCompassHeading] = useState<number>(0);

  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [needIOSPermission, setNeedIOSPermission] = useState<boolean>(false);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // City modal state
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Manual angle rotation slider for desktop testing
  const [manualRotation, setManualRotation] = useState<number>(0);
  const [isDesktopMode, setIsDesktopMode] = useState<boolean>(false);

  const prevAlignedRef = useRef<boolean>(false);

  // Recalculate Qibla Bearing and Distance whenever location changes
  const updateLocationAndBearing = useCallback((lat: number, lng: number, name: string, isGPS: boolean) => {
    const bearing = calculateQiblaBearing(lat, lng);
    const dist = calculateDistanceToKaaba(lat, lng);

    setUserLocation({ name, lat, lng, isGPS });
    setQiblaBearing(parseFloat(bearing.toFixed(1)));
    setDistanceKm(dist);
  }, []);

  // Get initial location on mount
  useEffect(() => {
    // Check saved city or default to İstanbul
    const savedCity = localStorage.getItem("vakit_selected_city") || "İstanbul";
    const cityCoords = CITY_COORDINATES[savedCity] || CITY_COORDINATES["İstanbul"];

    updateLocationAndBearing(cityCoords.lat, cityCoords.lng, savedCity, false);

    // Try requesting GPS silently
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocationAndBearing(pos.coords.latitude, pos.coords.longitude, "Mevcut Konum (GPS)", true);
          setLocationNotice(null);
        },
        () => {
          // GPS not available on PC, keep city fallback silently
        },
        { timeout: 5000 }
      );
    }
  }, [updateLocationAndBearing]);

  // Handle Device Orientation Events
  useEffect(() => {
    let sensorTriggered = false;

    if (
      typeof window !== "undefined" &&
      "DeviceOrientationEvent" in window &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: Function }).requestPermission === "function"
    ) {
      setNeedIOSPermission(true);
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = 0;

      const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === "number" && !isNaN(webkitHeading)) {
        heading = webkitHeading;
        sensorTriggered = true;
        setHasSensor(true);
        setIsDesktopMode(false);
        setCompassHeading(parseFloat(heading.toFixed(1)));
      } else if (e.alpha !== null && e.alpha !== undefined && (e.beta !== null || e.gamma !== null)) {
        heading = (360 - e.alpha) % 360;
        sensorTriggered = true;
        setHasSensor(true);
        setIsDesktopMode(false);
        setCompassHeading(parseFloat(heading.toFixed(1)));
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    }

    const timeoutId = setTimeout(() => {
      if (!sensorTriggered) {
        setIsDesktopMode(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation, true);
        window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      }
    };
  }, []);

  // Calculate Alignment and Trigger Haptic Vibration
  const currentHeading = isDesktopMode ? manualRotation : compassHeading;
  const deviation = Math.abs(((qiblaBearing - currentHeading + 540) % 360) - 180);

  useEffect(() => {
    const alignedNow = deviation <= 3;
    setIsAligned(alignedNow);

    if (alignedNow && !prevAlignedRef.current) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }
    }
    prevAlignedRef.current = alignedNow;
  }, [deviation]);

  // Request iOS Sensor Permission
  const requestIOSPermission = async () => {
    if (
      typeof window !== "undefined" &&
      "DeviceOrientationEvent" in window &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: Function }).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as unknown as { requestPermission: Function }).requestPermission();
        if (response === "granted") {
          setNeedIOSPermission(false);
        } else {
          alert("Pusula sensörü erişim izni reddedildi.");
        }
      } catch (err) {
        console.error("iOS permission error:", err);
      }
    }
  };

  // Explicit Konum Al (GPS Request) Button Handler with desktop PC fallback
  const handleRefreshLocation = () => {
    setIsLocating(true);
    setLocationNotice(null);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          updateLocationAndBearing(pos.coords.latitude, pos.coords.longitude, "Mevcut Konum (GPS)", true);
          setLocationNotice(null);
        },
        (err) => {
          setIsLocating(false);
          console.warn("GPS error on PC:", err);
          setLocationNotice("Masaüstü bilgisayarınızda GPS donanımı bulunamadı veya konum izni verilmedi. Aşağıdaki Şehir Seçimi ile ilinizi belirleyebilirsiniz.");
          setShowCityModal(true);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      setLocationNotice("Tarayıcınız konum servisini desteklemiyor. Şehir seçimi yapabilirsiniz.");
      setShowCityModal(true);
    }
  };

  // Select city from modal
  const handleSelectCity = (cityName: string) => {
    const coords = CITY_COORDINATES[cityName] || CITY_COORDINATES["İstanbul"];
    localStorage.setItem("vakit_selected_city", cityName);
    updateLocationAndBearing(coords.lat, coords.lng, cityName, false);
    setShowCityModal(false);
    setLocationNotice(null);
  };

  const filteredCities = TURKEY_CITIES.filter((c) =>
    c.toLocaleLowerCase("tr").includes(searchQuery.toLocaleLowerCase("tr"))
  );

  return (
    <div className="kible-wrapper">
      {/* Location Bar */}
      <div className="location-bar-card">
        <div className="location-info-left">
          <div className="location-icon-bg">
            <Compass size={22} />
          </div>
          <div>
            <div className="location-city-name">
              <span>{userLocation.name}</span>
            </div>
            <div className="location-status-tag">
              <span className="live-dot" style={{ width: "5px", height: "5px" }}></span>
              <span>{userLocation.isGPS ? "GPS Hassas Konum" : "Kayıtlı Şehir Koordinatı"}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn-location-action gps-btn"
            onClick={handleRefreshLocation}
            disabled={isLocating}
            title="Konumu Yenile"
            id="btn-refresh-qibla-gps"
          >
            {isLocating ? (
              <RefreshCw size={15} className="spin-icon" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <LocateFixed size={15} />
            )}
            <span>{isLocating ? "Aranıyor..." : "Konum Al"}</span>
          </button>

          <button
            className="btn-location-action"
            onClick={() => setShowCityModal(true)}
            id="btn-open-qibla-city-modal"
          >
            <span>Şehir Seç</span>
          </button>
        </div>
      </div>

      {/* Location Notice Banner if PC has no GPS */}
      {locationNotice && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#FBBF24",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{locationNotice}</span>
        </div>
      )}

      {/* Alignment Status Card */}
      <div className={`alignment-status-card ${isAligned ? "aligned" : ""}`}>
        {isAligned ? (
          <>
            <div className="aligned-pulse-dot" />
            <CheckCircle2 size={20} color="var(--emerald-light)" />
            <span>Kıble Yönüne Hizalandınız! (Kabe Doğrultusu)</span>
          </>
        ) : (
          <>
            <Navigation size={18} color="var(--gold-accent)" />
            <span>
              {isDesktopMode
                ? "Pusula Kadranını Çevirerek Kıble Yönünü İnceleyin"
                : "Cihazınızı Kabe İbresi Üst Üste Gelecek Şekilde Çevirin"}
            </span>
          </>
        )}
      </div>

      {/* Main 3D Compass View */}
      <div className="compass-center-section">
        <div className="compass-outer-wrapper">
          {/* Dial Ring (Rotates inversely to heading) */}
          <div
            className={`compass-dial-ring ${isAligned ? "aligned" : ""}`}
            style={{
              transform: `rotate(${-currentHeading}deg)`,
            }}
          >
            <span className="cardinal-label north">K</span>
            <span className="cardinal-label east">D</span>
            <span className="cardinal-label south">G</span>
            <span className="cardinal-label west">B</span>
          </div>

          {/* Kaaba Pointer Needle (Points to Qibla Angle relative to North) */}
          <div
            className="compass-needle-wrapper"
            style={{
              transform: `rotate(${qiblaBearing - currentHeading}deg)`,
            }}
          >
            <div className={`kaaba-pointer-marker ${isAligned ? "aligned" : ""}`}>
              <div className="kaaba-icon-head" title="Kabe-i Muazzama">
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>🕋</span>
              </div>
              <div className={`needle-line ${isAligned ? "aligned" : ""}`} />
            </div>
          </div>

          {/* Compass Center Pivot */}
          <div className={`compass-center-cap ${isAligned ? "aligned" : ""}`} />
        </div>
      </div>

      {/* iOS Safari Permission Request Banner */}
      {needIOSPermission && (
        <button className="btn-permission-request" onClick={requestIOSPermission}>
          <ShieldCheck size={18} />
          <span>iOS Pusula Sensör İznini Etkinleştir</span>
        </button>
      )}

      {/* Desktop / Sensorless Notice Banner & Interactive Simulator */}
      {isDesktopMode && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="sensor-notice-banner">
            <Info size={22} style={{ flexShrink: 0 }} />
            <div>
              <strong>Masaüstü / Sensörsüz Görünüm:</strong> Masaüstü bilgisayarlarda fiziksel yön sensörü bulunmadığı için Kıble açınız <strong>{userLocation.name}</strong> şehrine göre sabit <strong>{qiblaBearing}°</strong> derecedir. Aşağıdaki kaydırıcı ile pusulayı test edebilirsiniz.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "rgba(22, 31, 48, 0.6)",
              border: "1px solid var(--border-color)",
            }}
          >
            <RotateCw size={18} color="var(--emerald-light)" />
            <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
              Pusula Simülasyonu:
            </span>
            <input
              type="range"
              min="0"
              max="360"
              value={manualRotation}
              onChange={(e) => setManualRotation(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--emerald-light)" }}
            />
            <span style={{ fontSize: "0.85rem", fontWeight: "700", minWidth: "42px" }}>
              {manualRotation}°
            </span>
          </div>
        </div>
      )}

      {/* Degree Stats Card */}
      <div className="degree-display-card">
        <div className="degree-stats-row">
          <div className="stat-box">
            <span className="stat-title">Kıble Açısı (Açı)</span>
            <span className="stat-value highlight">{qiblaBearing}°</span>
          </div>

          <div className="stat-box">
            <span className="stat-title">Ana Yön</span>
            <span className="stat-value gold">{getCardinalDirection(qiblaBearing)}</span>
          </div>
        </div>

        <div className="degree-stats-row">
          <div className="stat-box">
            <span className="stat-title">Mevcut Pusula Açısı</span>
            <span className="stat-value">{currentHeading}°</span>
          </div>

          <div className="stat-box">
            <span className="stat-title">Kabe Mesafesi</span>
            <span className="stat-value">{distanceKm.toLocaleString("tr")} km</span>
          </div>
        </div>
      </div>

      {/* City Selector Modal */}
      {showCityModal && (
        <div className="modal-overlay">
          <div className="city-modal-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 className="modal-title" style={{ fontSize: "1.25rem" }}>
                Şehir Seçimi (Kıble İçin)
              </h3>
              <button
                onClick={() => setShowCityModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Field */}
            <div className="search-box-wrapper">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                className="search-input-field"
                placeholder="Şehir ara (Örn: İstanbul, Bursa, Konya...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Popular Cities Quick Chips */}
            <div>
              <div className="popular-cities-label">Popüler Şehirler</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    className={`chip-btn ${userLocation.name === city ? "active" : ""}`}
                    onClick={() => handleSelectCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Cities Grid */}
            <div>
              <div className="popular-cities-label">Tüm Şehirler</div>
              <div className="cities-scroll-grid">
                {filteredCities.map((city) => {
                  const isSelected = userLocation.name === city;
                  return (
                    <button
                      key={city}
                      className={`city-item-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectCity(city)}
                      id={`qibla-city-btn-${city.toLowerCase()}`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
