"use client";

import { useState } from "react";
import {
  PRAYER_LIST,
  PrayerDefinition,
  PostureType,
  getPrayerById,
} from "@/lib/prayer-assistant-data";
import { usePrayerGuide } from "@/hooks/usePrayerGuide";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  X,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Sliders,
  ChevronRight,
  Info,
  Award,
} from "lucide-react";

// ─── Posture Visual Badge Component ─────────────────────────────────────────
function PostureIcon({ posture }: { posture: PostureType }) {
  switch (posture) {
    case "niyet":
      return (
        <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      );
    case "kiyam":
      return (
        <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 6v8M9 20l3-6 3 6M8 10h8" />
        </svg>
      );
    case "ruku":
      return (
        <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="7" cy="6" r="2" />
          <path d="M7 8l6 3h6M11 11l-3 9M16 11l-2 9" />
        </svg>
      );
    case "dogrulma":
      return (
        <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 6v14M8 12h8" />
          <path d="M12 2l-3 3M12 2l3 3" />
        </svg>
      );
    case "secde":
      return (
        <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="14" r="2" />
          <path d="M4 18h16M7 18l4-6 5 2" />
        </svg>
      );
    case "oturus":
      return (
        <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="6" r="2" />
          <path d="M12 8v5l-4 3M12 13l4 3M8 16l-3 4M16 16l3 4" />
        </svg>
      );
    case "selam":
      return (
        <svg className="w-8 h-8 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="6" r="2" />
          <path d="M12 8v6M8 11l-4-1M16 11l4-1M9 20l3-6 3 6" />
        </svg>
      );
    default:
      return <BookOpen className="w-8 h-8 text-emerald-400" />;
  }
}

export default function NamazKilPage() {
  const guide = usePrayerGuide();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeMeaning, setActiveMeaning] = useState<boolean>(false);

  const categories = [
    { id: "all", label: "Tüm Vakitler" },
    { id: "sabah", label: "Sabah" },
    { id: "ogle", label: "Öğle" },
    { id: "ikindi", label: "İkindi" },
    { id: "aksam", label: "Akşam" },
    { id: "yatsı", label: "Yatsı" },
    { id: "vitir", label: "Vitir" },
  ];

  const filteredPrayers =
    selectedCategory === "all"
      ? PRAYER_LIST
      : PRAYER_LIST.filter((p) => p.category === selectedCategory);

  const isFocusMode = guide.currentPrayer && (guide.isPlaying || guide.currentStepIndex > 0 || guide.isCompleted);

  return (
    <div className="min-h-screen pb-24 text-slate-100 bg-[#090D16]">
      {/* ─── SETTINGS MODAL ─────────────────────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sliders className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Ses & Akış Ayarları</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Voice Speed */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Okuma Hızı (Sesli Rehber)</span>
                  <span className="text-emerald-400 font-mono font-medium">{guide.speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.2"
                  step="0.05"
                  value={guide.speechRate}
                  onChange={(e) => guide.setSpeechRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
                  <span>Yavaş (0.7x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Hızlı (1.2x)</span>
                </div>
              </div>

              {/* Auto Advance Pause Duration */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Adım Arası Bekleme Süresi</span>
                  <span className="text-emerald-400 font-mono font-medium">{guide.autoAdvanceDelay} saniye</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={guide.autoAdvanceDelay}
                  onChange={(e) => guide.setAutoAdvanceDelay(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Seslendirme bittikten sonra bir sonraki adıma geçmeden önce tanınan hareket süresi.
                </p>
              </div>

              {/* Status Notice */}
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-medium text-slate-200">
                    {guide.hasSpeechSupport
                      ? "Tarayıcınız Türkçe Seslendirmeyi (Web Speech) Destekliyor."
                      : "Tarayıcınızda canlı ses sentezi bulunamadı. Otomatik zamanlayıcı modu aktif."}
                  </p>
                  <p className="text-slate-400">
                    Seslendirmeyi duraklatıp manuel butonlarla adımları takip edebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/40 transition"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* ─── 1. SELECTION SCREEN (NOT IN FOCUS MODE) ─────────────────────────── */}
      {!isFocusMode && (
        <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/20 shadow-xl shadow-emerald-950/20">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Yeni Başlayanlar İçin</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                  Sesli Namaz Kıldırıcı
                </h2>
                <p className="text-sm text-slate-300 max-w-md">
                  Vakit veya rekat seçerek namaz kılmayı adım adım, sesli yönlendirmeler ve okunuşlar eşliğinde öğrenin.
                </p>
              </div>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition shrink-0"
                title="Ayarlar"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40 scale-105"
                    : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Prayer Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPrayers.map((prayer) => (
              <div
                key={prayer.id}
                className="group relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-800/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700/60">
                      {prayer.categoryName} • {prayer.typeName}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {prayer.rakatCount} Rekat
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition">
                    {prayer.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {prayer.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {prayer.steps.length} Adım • ~{prayer.rakatCount * 2.5} dk
                  </span>
                  <button
                    onClick={() => guide.startPrayer(prayer)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition group-hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Başlat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. FULL-SCREEN FOCUS MODE (WHEN PRAYER IS ACTIVE) ────────────────── */}
      {isFocusMode && (
        <div className="fixed inset-0 z-40 bg-[#090D16] flex flex-col justify-between overflow-hidden animate-fadeIn">
          {/* TOP NAVIGATION BAR */}
          <header className="px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={guide.exitPrayer}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {guide.currentPrayer?.name}
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  {guide.currentStep?.rakat}. Rekat • {guide.currentStep?.postureName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={guide.toggleMute}
                className={`p-2 rounded-xl border transition ${
                  guide.isMuted
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-400"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                }`}
                title={guide.isMuted ? "Sesi Aç" : "Sesi Kapat"}
              >
                {guide.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* PROGRESS BAR */}
          <div className="w-full bg-slate-900 h-1.5 relative overflow-hidden shrink-0">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500"
              style={{ width: `${guide.progressPercentage}%` }}
            />
          </div>

          {/* MAIN CONTENT CONTAINER */}
          {guide.isCompleted ? (
            /* ─── COMPLETION CARD ─── */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-scaleUp">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-sm">
                <h2 className="text-2xl font-bold text-white">
                  Namaz Tamamlandı!
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Tebrikler, <span className="text-emerald-400 font-semibold">{guide.currentPrayer?.name}</span> kılma rehberini huşu ile tamamladınız. Allah kabul eylesin.
                </p>
              </div>

              {/* Post-prayer Tesbihat Reminders */}
              <div className="w-full max-w-sm p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Namaz Sonrası Tesbihatı</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="block text-emerald-400 font-bold">33 Defa</span>
                    <span className="text-slate-300">Sübhânallah</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="block text-emerald-400 font-bold">33 Defa</span>
                    <span className="text-slate-300">Elhamdülillâh</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="block text-emerald-400 font-bold">33 Defa</span>
                    <span className="text-slate-300">Allâhu Ekber</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full max-w-sm">
                <button
                  onClick={guide.restartPrayer}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar Kıl</span>
                </button>
                <button
                  onClick={guide.exitPrayer}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tamamla</span>
                </button>
              </div>
            </div>
          ) : (
            /* ─── ACTIVE STEP DISPLAY ─── */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between max-w-2xl mx-auto w-full space-y-4">
              {/* Step Posture Header Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 shrink-0">
                  {guide.currentStep && <PostureIcon posture={guide.currentStep.posture} />}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      {guide.currentStep?.postureName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-800">
                      Adım {guide.currentStepIndex + 1} / {guide.totalSteps}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {guide.currentStep?.title}
                  </h2>
                </div>
              </div>

              {/* Guidance Instruction Card */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-slate-200 text-sm leading-relaxed flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p>{guide.currentStep?.guidanceText}</p>
              </div>

              {/* Main Reading Card (Arabic & Transliteration) */}
              <div className="flex-1 min-h-[220px] p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl flex flex-col justify-center text-center space-y-6">
                {/* Arabic Text */}
                {guide.currentStep?.arabicText && (
                  <div
                    className="text-2xl sm:text-3xl md:text-4xl text-amber-200 leading-loose font-serif dir-rtl"
                    style={{ fontFamily: "var(--font-quran, Amiri, serif)" }}
                  >
                    {guide.currentStep.arabicText}
                  </div>
                )}

                {/* Turkish Transliteration */}
                {guide.currentStep?.transliteration && (
                  <div className="text-base sm:text-lg text-emerald-100 font-medium leading-relaxed tracking-wide border-t border-slate-800/80 pt-4">
                    {guide.currentStep.transliteration}
                  </div>
                )}

                {/* Meaning Toggle / Display */}
                {guide.currentStep?.meaning && (
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveMeaning((prev) => !prev)}
                      className="text-xs font-semibold text-slate-400 hover:text-emerald-300 transition inline-flex items-center gap-1"
                    >
                      <span>{activeMeaning ? "Anlamı Gizle" : "Türkçe Anlamını Gör"}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeMeaning ? "rotate-90" : ""}`} />
                    </button>
                    {activeMeaning && (
                      <p className="mt-2 text-xs text-slate-400 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800 animate-fadeIn">
                        {guide.currentStep.meaning}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Audio Status & Auto-advance Indicator */}
              <div className="h-6 flex items-center justify-center text-xs">
                {guide.isSpeaking && (
                  <div className="inline-flex items-center gap-2 text-emerald-400 animate-pulse font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Sesli rehber okunuyor...</span>
                  </div>
                )}
                {guide.isWaitingForNext && (
                  <div className="inline-flex items-center gap-2 text-amber-400 font-medium">
                    <span>Sonraki adıma geçiliyor ({guide.timeRemainingInStep}s)...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM PLAYER CONTROLS */}
          {!guide.isCompleted && (
            <footer className="p-4 bg-slate-950/90 border-t border-slate-800 shrink-0">
              <div className="max-w-md mx-auto space-y-3">
                {/* Control Buttons */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={guide.previousStep}
                    disabled={guide.currentStepIndex === 0}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition"
                    title="Önceki Adım"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={guide.replayAudio}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition"
                    title="Sesi Tekrar Çal"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={guide.togglePlayPause}
                    className="p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-950/80 transition-transform active:scale-95"
                    title={guide.isPlaying && !guide.isPaused ? "Duraklat" : "Devam Et"}
                  >
                    {guide.isPlaying && !guide.isPaused ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={guide.nextStep}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
                    title="Sonraki Adım"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Step Dots Stepper */}
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1">
                  {guide.currentPrayer?.steps.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => guide.goToStep(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === guide.currentStepIndex
                          ? "w-6 bg-emerald-400"
                          : idx < guide.currentStepIndex
                          ? "w-2 bg-emerald-700"
                          : "w-2 bg-slate-800"
                      }`}
                      title={step.title}
                    />
                  ))}
                </div>
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
