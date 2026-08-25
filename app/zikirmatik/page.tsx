"use client";

import { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Minus,
  Volume2,
  VolumeX,
  Vibrate,
  Plus,
  Sparkles,
  Award,
  CheckCircle2,
  X,
} from "lucide-react";

interface DhikrItem {
  id: string;
  title: string;
  arabic?: string;
  meaning?: string;
  defaultTarget: number;
}

const INITIAL_PRESETS: DhikrItem[] = [
  {
    id: "subhanallah",
    title: "Sübhanallah",
    arabic: "سُبْحَانَ ٱللَّٰهِ",
    meaning: "Allah her türlü eksiklikten münezzehtir.",
    defaultTarget: 33,
  },
  {
    id: "elhamdulillah",
    title: "Elhamdülillah",
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    meaning: "Hamd ve övgü yalnız Allah'a mahsustur.",
    defaultTarget: 33,
  },
  {
    id: "allahuekber",
    title: "Allahü Ekber",
    arabic: "ٱللَّٰهُ أَكْبَرُ",
    meaning: "Allah en büyüktür.",
    defaultTarget: 33,
  },
  {
    id: "lailaheillallah",
    title: "Lâ ilâhe illallâh",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
    meaning: "Allah'tan başka ilâh yoktur.",
    defaultTarget: 100,
  },
  {
    id: "estagfirullah",
    title: "Estağfirullah",
    arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
    meaning: "Allah'tan bağışlanma dilerim.",
    defaultTarget: 100,
  },
  {
    id: "salavat",
    title: "Salavat-ı Şerife",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    meaning: "Allah'ım Peygamberimiz Hz. Muhammed'e salat eyle.",
    defaultTarget: 100,
  },
];

export default function ZikirmatikPage() {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem>(INITIAL_PRESETS[0]);
  const [customPresets, setCustomPresets] = useState<DhikrItem[]>([]);
  
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState<boolean>(true);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for new custom dhikr
  const [newTitle, setNewTitle] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newTarget, setNewTarget] = useState(33);

  // Web Audio Context reference for zero-latency click feedback
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem("zikir_count");
      const savedTarget = localStorage.getItem("zikir_target");
      const savedDhikr = localStorage.getItem("zikir_selected");
      const savedCustom = localStorage.getItem("zikir_custom_list");
      const savedSound = localStorage.getItem("zikir_sound");
      const savedVib = localStorage.getItem("zikir_vibration");

      if (savedCount !== null) setCount(parseInt(savedCount, 10));
      if (savedTarget !== null) setTarget(parseInt(savedTarget, 10));
      if (savedDhikr !== null) setSelectedDhikr(JSON.parse(savedDhikr));
      if (savedCustom !== null) setCustomPresets(JSON.parse(savedCustom));
      if (savedSound !== null) setIsSoundEnabled(savedSound === "true");
      if (savedVib !== null) setIsVibrationEnabled(savedVib === "true");
    } catch (e) {
      console.error("LocalStorage load error:", e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("zikir_count", count.toString());
      localStorage.setItem("zikir_target", target.toString());
      localStorage.setItem("zikir_selected", JSON.stringify(selectedDhikr));
      localStorage.setItem("zikir_custom_list", JSON.stringify(customPresets));
      localStorage.setItem("zikir_sound", isSoundEnabled.toString());
      localStorage.setItem("zikir_vibration", isVibrationEnabled.toString());
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }
  }, [count, target, selectedDhikr, customPresets, isSoundEnabled, isVibrationEnabled]);

  // Audio Click Generator using Web Audio API
  const playClickSound = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (err) {
      console.warn("Audio Context sound error:", err);
    }
  };

  // Celebration Sound when Target is hit
  const playSuccessSound = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (err) {
      console.warn("Success sound error:", err);
    }
  };

  const triggerVibration = (pattern: number | number[] = 40) => {
    if (isVibrationEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleIncrement = () => {
    const nextCount = count + 1;
    setCount(nextCount);

    if (target > 0 && nextCount === target) {
      triggerVibration([150, 100, 200, 100, 300]);
      playSuccessSound();
      setShowSuccessModal(true);
    } else {
      triggerVibration(40);
      playClickSound();
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount(count - 1);
      triggerVibration(30);
      playClickSound();
    }
  };

  const handleReset = () => {
    setCount(0);
    triggerVibration([50, 50]);
  };

  const handleSelectPreset = (dhikr: DhikrItem) => {
    setSelectedDhikr(dhikr);
    setTarget(dhikr.defaultTarget);
    setCount(0);
    triggerVibration(40);
  };

  const handleAddCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: DhikrItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      arabic: newArabic.trim() || undefined,
      meaning: newMeaning.trim() || undefined,
      defaultTarget: newTarget || 33,
    };

    setCustomPresets([...customPresets, newItem]);
    setSelectedDhikr(newItem);
    setTarget(newItem.defaultTarget);
    setCount(0);
    
    // Reset form
    setNewTitle("");
    setNewArabic("");
    setNewMeaning("");
    setNewTarget(33);
    setShowAddModal(false);
  };

  // Circular progress calculations
  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = target > 0 ? Math.min(count / target, 1) : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  const allPresets = [...INITIAL_PRESETS, ...customPresets];

  return (
    <div className="zikirmatik-wrapper">
      {/* Active Dhikr Header Card */}
      <div className="dhikr-info-card">
        {selectedDhikr.arabic && (
          <div className="arabic-text">{selectedDhikr.arabic}</div>
        )}
        <h2 className="dhikr-title-main">{selectedDhikr.title}</h2>
        {selectedDhikr.meaning && (
          <p className="dhikr-meaning">"{selectedDhikr.meaning}"</p>
        )}
        
        <div className="target-progress-text">
          <Sparkles size={14} />
          <span>
            {target > 0
              ? `Hedef: ${count} / ${target} (${Math.round(progressPercent * 100)}%)`
              : `Hedef: Sınırsız (${count} Çekildi)`}
          </span>
        </div>
      </div>

      {/* Main Counter Ring & Touch Button */}
      <div className="counter-center-section">
        <div className="counter-ring-container">
          <svg className="counter-ring-svg" viewBox="0 0 240 240">
            <circle
              className="ring-bg"
              cx="120"
              cy="120"
              r={radius}
              strokeWidth="10"
              fill="transparent"
            />
            {target > 0 && (
              <circle
                className="ring-progress"
                cx="120"
                cy="120"
                r={radius}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            )}
          </svg>

          <button
            className="counter-touch-button"
            onClick={handleIncrement}
            id="btn-zikir-count"
            aria-label="Zikir Sayacını Artır"
          >
            <span className="count-number">{count}</span>
            <span className="count-label">Dokun</span>
          </button>
        </div>

        {/* Quick Actions & Settings */}
        <div className="quick-controls-row">
          <button
            className="btn-icon-control danger"
            onClick={handleReset}
            title="Sıfırla"
            id="btn-reset-counter"
          >
            <RotateCcw size={20} />
          </button>

          <button
            className="btn-icon-control"
            onClick={handleDecrement}
            title="1 Eksilt"
            id="btn-decrement-counter"
          >
            <Minus size={22} />
          </button>

          <button
            className={`btn-icon-control ${isSoundEnabled ? "active" : ""}`}
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            title={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            id="btn-toggle-sound"
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            className={`btn-icon-control ${isVibrationEnabled ? "active" : ""}`}
            onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
            title={isVibrationEnabled ? "Titreşimi Kapat" : "Titreşimi Aç"}
            id="btn-toggle-vibration"
          >
            <Vibrate size={20} />
          </button>
        </div>
      </div>

      {/* Target Selection Chips */}
      <div style={{ textAlign: "center", marginTop: "4px" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 500 }}>
          Hızlı Hedef Seçimi
        </p>
        <div className="target-chips-container">
          {[33, 99, 500, 1000, 0].map((t) => (
            <button
              key={t}
              className={`chip-btn ${target === t ? "active" : ""}`}
              onClick={() => {
                setTarget(t);
                triggerVibration(30);
              }}
            >
              {t === 0 ? "Sınırsız" : `${t} Zikir`}
            </button>
          ))}
        </div>
      </div>

      {/* Preset & Custom Dhikrs List */}
      <div className="preset-section-container">
        <div className="section-header">
          <h3 className="section-title">Zikir Listesi</h3>
          <button
            className="btn-add-custom"
            onClick={() => setShowAddModal(true)}
            id="btn-open-add-modal"
          >
            <Plus size={16} />
            <span>Özel Ekle</span>
          </button>
        </div>

        <div className="preset-grid">
          {allPresets.map((dhikr) => {
            const isSelected = selectedDhikr.id === dhikr.id;
            return (
              <div
                key={dhikr.id}
                className={`preset-card ${isSelected ? "active" : ""}`}
                onClick={() => handleSelectPreset(dhikr)}
                id={`preset-${dhikr.id}`}
              >
                {dhikr.arabic && (
                  <div className="preset-card-arabic">{dhikr.arabic}</div>
                )}
                <div className="preset-card-title">{dhikr.title}</div>
                <div className="preset-card-target">
                  Default Hedef: {dhikr.defaultTarget}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Reached Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon-badge">
              <Award size={36} />
            </div>
            <h3 className="modal-title">Tebrikler!</h3>
            <p className="modal-subtitle">
              <strong>{selectedDhikr.title}</strong> zikriniz için belirlenen{" "}
              <strong>{target}</strong> adede ulaştınız.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setShowSuccessModal(false);
                setCount(0);
              }}
              id="btn-modal-restart"
            >
              Yeniden Başla (Sıfırla)
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowSuccessModal(false)}
              id="btn-modal-continue"
            >
              Devam Et
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Dhikr Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <h3 className="modal-title" style={{ fontSize: "1.2rem" }}>
                Özel Zikir Ekle
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form
              onSubmit={handleAddCustomDhikr}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div className="input-group">
                <label className="input-label">Zikir Adı *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Örn: Ya Şafi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Arapça Yazılışı (Opsiyonel)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Örn: يا شافي"
                  value={newArabic}
                  onChange={(e) => setNewArabic(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Anlamı (Opsiyonel)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Örn: Şifa veren"
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Varsayılan Hedef</label>
                <input
                  type="number"
                  className="input-field"
                  value={newTarget}
                  onChange={(e) => setNewTarget(parseInt(e.target.value, 10) || 0)}
                  min="0"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn-primary" id="btn-submit-custom-dhikr">
                  Kaydet ve Seç
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
