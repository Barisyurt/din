"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { getPrayerById, PostureType } from "@/lib/prayer-assistant-data";
import { usePrayerGuide } from "@/hooks/usePrayerGuide";
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  Volume2, VolumeX, Settings, X, CheckCircle2,
  Sparkles, BookOpen, ChevronRight, ChevronLeft,
  Info, Award, Sliders, Box,
} from "lucide-react";

// ── Dynamic 3D (no SSR) ───────────────────────────────────────────────────────
const PrayerScene = dynamic(() => import("@/components/3d/PrayerScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a1628]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-emerald-400 font-medium">3D sahne yükleniyor...</span>
      </div>
    </div>
  ),
});

// ─── Types ─────────────────────────────────────────────────────────────────────
type WaktId = "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi";

interface WaktDef {
  id: WaktId;
  label: string;
  arabicLabel: string;
  description: string;
  gradientFrom: string;
  glowColor: string;
  timeRange: string;
}

interface PrayerOption {
  id: string;
  label: string;
  rakat: number;
  typeLabel: string;
  badge: string;
  badgeClass: string;
  description: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const WAKTLER: WaktDef[] = [
  {
    id: "sabah",
    label: "Sabah",
    arabicLabel: "\u0627\u0644\u0635\u0628\u062d",
    description: "Fecirden güneş doğumuna kadar",
    gradientFrom: "#1e1b4b",
    glowColor: "rgba(99,102,241,0.18)",
    timeRange: "2 Bölüm • 4 Rekat",
  },
  {
    id: "ogle",
    label: "Öğle",
    arabicLabel: "\u0627\u0644\u0638\u0647\u0631",
    description: "Güneşin tepe noktasından ikindie kadar",
    gradientFrom: "#1c1400",
    glowColor: "rgba(245,158,11,0.18)",
    timeRange: "3 Bölüm • 10 Rekat",
  },
  {
    id: "ikindi",
    label: "İkindi",
    arabicLabel: "\u0627\u0644\u0639\u0635\u0631",
    description: "Öğleden güneş batımına kadar",
    gradientFrom: "#1a0e00",
    glowColor: "rgba(249,115,22,0.18)",
    timeRange: "2 Bölüm • 8 Rekat",
  },
  {
    id: "aksam",
    label: "Akşam",
    arabicLabel: "\u0627\u0644\u0645\u063a\u0631\u0628",
    description: "Güneş batımından yatsıya kadar",
    gradientFrom: "#1a0008",
    glowColor: "rgba(244,63,94,0.18)",
    timeRange: "2 Bölüm • 5 Rekat",
  },
  {
    id: "yatsi",
    label: "Yatsı",
    arabicLabel: "\u0627\u0644\u0639\u0634\u0627\u0621",
    description: "Akşam kızıllığından gece yarısına kadar",
    gradientFrom: "#051209",
    glowColor: "rgba(16,185,129,0.15)",
    timeRange: "4 Bölüm • 13 Rekat",
  },
];

const PRAYER_OPTIONS: Record<WaktId, PrayerOption[]> = {
  sabah: [
    { id:"sabah-sunnet", label:"Sabah Sünneti",      rakat:2, typeLabel:"Sünnet",     badge:"2 Rekat", badgeClass:"text-emerald-400 bg-emerald-950/60 border-emerald-500/30", description:"Sabah farzından önce kılınan 2 rekat kuvvetli sünnet." },
    { id:"sabah-farz",   label:"Sabah Farzı",         rakat:2, typeLabel:"Farz",       badge:"2 Rekat", badgeClass:"text-amber-400 bg-amber-950/60 border-amber-500/30",     description:"Sabah namazının 2 rekat farzı. Terk edilmesi günahtır." },
  ],
  ogle: [
    { id:"ogle-sunnet",     label:"Öğle İlk Sünneti", rakat:4, typeLabel:"İlk Sünnet", badge:"4 Rekat", badgeClass:"text-emerald-400 bg-emerald-950/60 border-emerald-500/30", description:"Öğle farzından önce kılınan 4 rekat sünnet." },
    { id:"ogle-farz",       label:"Öğle Farzı",        rakat:4, typeLabel:"Farz",       badge:"4 Rekat", badgeClass:"text-amber-400 bg-amber-950/60 border-amber-500/30",     description:"Öğle namazının 4 rekat farzı." },
    { id:"ogle-son-sunnet", label:"Öğle Son Sünneti",  rakat:2, typeLabel:"Son Sünnet", badge:"2 Rekat", badgeClass:"text-sky-400 bg-sky-950/60 border-sky-500/30",           description:"Öğle farzından sonra kılınan 2 rekat sünnet." },
  ],
  ikindi: [
    { id:"ikindi-sunnet", label:"İkindi Sünneti", rakat:4, typeLabel:"Sünnet", badge:"4 Rekat", badgeClass:"text-emerald-400 bg-emerald-950/60 border-emerald-500/30", description:"İkindi farzından önce kılınan 4 rekat gayri müekked sünnet." },
    { id:"ikindi-farz",   label:"İkindi Farzı",   rakat:4, typeLabel:"Farz",   badge:"4 Rekat", badgeClass:"text-amber-400 bg-amber-950/60 border-amber-500/30",     description:"İkindi namazının 4 rekat farzı." },
  ],
  aksam: [
    { id:"aksam-farz",   label:"Akşam Farzı",    rakat:3, typeLabel:"Farz",   badge:"3 Rekat", badgeClass:"text-amber-400 bg-amber-950/60 border-amber-500/30",     description:"Akşam namazının 3 rekat farzı." },
    { id:"aksam-sunnet", label:"Akşam Sünneti",   rakat:2, typeLabel:"Sünnet", badge:"2 Rekat", badgeClass:"text-emerald-400 bg-emerald-950/60 border-emerald-500/30", description:"Akşam farzından sonra kılınan 2 rekat sünnet." },
  ],
  yatsi: [
    { id:"yatsi-sunnet",     label:"Yatsı İlk Sünneti", rakat:4, typeLabel:"İlk Sünnet", badge:"4 Rekat", badgeClass:"text-emerald-400 bg-emerald-950/60 border-emerald-500/30",   description:"Yatsı farzından önce kılınan 4 rekat sünnet." },
    { id:"yatsi-farz",       label:"Yatsı Farzı",        rakat:4, typeLabel:"Farz",       badge:"4 Rekat", badgeClass:"text-amber-400 bg-amber-950/60 border-amber-500/30",       description:"Yatsı namazının 4 rekat farzı." },
    { id:"yatsi-son-sunnet", label:"Yatsı Son Sünneti",  rakat:2, typeLabel:"Son Sünnet", badge:"2 Rekat", badgeClass:"text-sky-400 bg-sky-950/60 border-sky-500/30",             description:"Yatsı farzından sonra kılınan 2 rekat sünnet." },
    { id:"vitir",            label:"Vitir Namazı",        rakat:3, typeLabel:"Vacip",      badge:"3 Rekat", badgeClass:"text-purple-400 bg-purple-950/60 border-purple-500/30",    description:"Yatsı namazından sonra kılınan 3 rekat vacip namaz." },
  ],
};

// Icon gradients keyed by waktId
const WAKT_ICON_COLORS: Record<WaktId, { bg: string; text: string }> = {
  sabah:  { bg:"#312e81", text:"#a5b4fc" },
  ogle:   { bg:"#78350f", text:"#fcd34d" },
  ikindi: { bg:"#7c2d12", text:"#fb923c" },
  aksam:  { bg:"#881337", text:"#fda4af" },
  yatsi:  { bg:"#064e3b", text:"#34d399" },
};

const WAKT_EMOJIS: Record<WaktId, string> = {
  sabah:"🌅", ogle:"☀️", ikindi:"🌤️", aksam:"🌇", yatsi:"🌙"
};

// ─── Posture SVG ──────────────────────────────────────────────────────────────
function PostureIcon({ posture }: { posture: PostureType }) {
  switch (posture) {
    case "niyet":    return (<svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>);
    case "kiyam":    return (<svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4" r="2"/><path d="M12 6v8M9 20l3-6 3 6M8 10h8"/></svg>);
    case "ruku":     return (<svg className="w-6 h-6 text-amber-400"   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="6" r="2"/><path d="M7 8l6 3h6M11 11l-3 9M16 11l-2 9"/></svg>);
    case "dogrulma": return (<svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4" r="2"/><path d="M12 6v14M8 12h8"/></svg>);
    case "secde":    return (<svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="14" r="2"/><path d="M4 18h16M7 18l4-6 5 2"/></svg>);
    case "oturus":   return (<svg className="w-6 h-6 text-amber-400"   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="6" r="2"/><path d="M12 8v5l-4 3M12 13l4 3M8 16l-3 4M16 16l3 4"/></svg>);
    case "selam":    return (<svg className="w-6 h-6 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="6" r="2"/><path d="M12 8v6M8 11l-4-1M16 11l4-1M9 20l3-6 3 6"/></svg>);
    default:         return <BookOpen className="w-6 h-6 text-emerald-400" />;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NamazKilPage() {
  const guide = usePrayerGuide();
  const [stage, setStage]               = useState<1|2|3>(1);
  const [selectedWakt, setSelectedWakt] = useState<WaktDef|null>(null);
  const [selectedOpt, setSelectedOpt]   = useState<PrayerOption|null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeMeaning, setActiveMeaning] = useState(false);
  const [show3D, setShow3D]             = useState(true);

  const currentPosture: PostureType = guide.currentStep?.posture ?? "kiyam";

  function handleWaktSelect(w: WaktDef) { setSelectedWakt(w); setSelectedOpt(null); setStage(2); }
  function handleOptSelect(o: PrayerOption) { setSelectedOpt(o); }
  function handleStartPrayer() {
    if (!selectedOpt) return;
    const p = getPrayerById(selectedOpt.id);
    if (!p) return;
    guide.startPrayer(p);
    setActiveMeaning(false);
    setStage(3);
  }
  function handleExit() { guide.exitPrayer(); setStage(1); setSelectedWakt(null); setSelectedOpt(null); }
  function handleBackToWakt() { setStage(1); setSelectedWakt(null); setSelectedOpt(null); }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 3: Full-screen prayer mode
  // ──────────────────────────────────────────────────────────────────────────
  if (stage === 3) {
    return (
      <div className="fixed inset-0 z-40 bg-[#090D16] flex flex-col overflow-hidden" style={{animation:"slideUp .3s ease"}}>

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400"><Sliders className="w-5 h-5"/><h3 className="text-lg font-semibold">Ayarlar</h3></div>
                <button onClick={()=>setShowSettings(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-slate-300">Okuma Hızı</span><span className="text-emerald-400 font-mono">{guide.speechRate.toFixed(2)}x</span></div>
                  <input type="range" min="0.7" max="1.2" step="0.05" value={guide.speechRate} onChange={e=>guide.setSpeechRate(parseFloat(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"/>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-slate-300">Adım Arası Bekleme</span><span className="text-emerald-400 font-mono">{guide.autoAdvanceDelay}s</span></div>
                  <input type="range" min="1" max="10" step="1" value={guide.autoAdvanceDelay} onChange={e=>guide.setAutoAdvanceDelay(parseInt(e.target.value,10))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"/>
                </div>
                <div className="p-3 bg-slate-800/70 rounded-2xl border border-slate-700/50 text-xs text-slate-300">
                  {guide.hasSpeechSupport ? "Tarayıcınız Türkçe seslendirmeyi destekliyor." : "Ses sentezi bulunamadı. Zamanlayıcı modu aktif."}
                </div>
              </div>
              <button onClick={()=>setShowSettings(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition">Tamam</button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <header className="px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={handleExit} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"><X className="w-5 h-5"/></button>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate">{guide.currentPrayer?.name}</h3>
              <p className="text-xs text-emerald-400 font-medium">{guide.currentStep?.rakat}. Rekat • {guide.currentStep?.postureName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={()=>setShow3D(v=>!v)} className={`p-2 rounded-xl border transition ${show3D?"bg-emerald-950/60 border-emerald-500/40 text-emerald-400":"bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`} title="3D Aç/Kapat"><Box className="w-4 h-4"/></button>
            <button onClick={guide.toggleMute} className={`p-2 rounded-xl border transition ${guide.isMuted?"bg-amber-950/40 border-amber-500/40 text-amber-400":"bg-slate-900 border-slate-800 text-slate-300 hover:text-white"}`}>{guide.isMuted?<VolumeX className="w-4 h-4"/>:<Volume2 className="w-4 h-4"/>}</button>
            <button onClick={()=>setShowSettings(true)} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"><Settings className="w-4 h-4"/></button>
          </div>
        </header>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 h-1 shrink-0">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-700" style={{width:`${guide.progressPercentage}%`}}/>
        </div>

        {/* Completion screen */}
        {guide.isCompleted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center text-emerald-400" style={{boxShadow:"0 0 40px rgba(16,185,129,0.2)"}}>
              <Award className="w-12 h-12"/>
            </div>
            <div className="space-y-2 max-w-xs">
              <h2 className="text-2xl font-bold text-white">Namaz Tamamlandı!</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="text-emerald-400 font-semibold">{guide.currentPrayer?.name}</span> kılma rehberini huşu ile tamamladınız. Allah kabul eylesin.
              </p>
            </div>
            <div className="w-full max-w-sm p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider"><Sparkles className="w-4 h-4"/><span>Namaz Sonrası Tesbihat</span></div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[["33x","Sübhânallah"],["33x","Elhamdülillâh"],["33x","Allâhu Ekber"]].map(([n,t])=>(
                  <div key={t} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50"><span className="block text-emerald-400 font-bold">{n}</span><span className="text-slate-300 text-[10px]">{t}</span></div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 w-full max-w-sm">
              <button onClick={()=>guide.restartPrayer()} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4"/>Tekrar</button>
              <button onClick={handleExit} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg transition flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/>Bitir</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 3D Panel */}
            {show3D ? (
              <div className="shrink-0 relative" style={{height:"36vh",minHeight:"190px",maxHeight:"310px"}}>
                <PrayerScene posture={currentPosture} className="w-full h-full"/>
                <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none" style={{background:"linear-gradient(to bottom,transparent,#090D16)"}}/>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-emerald-500/20 text-[11px] text-emerald-300 font-medium whitespace-nowrap">{guide.currentStep?.postureName}</div>
                <button onClick={()=>setShow3D(false)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-400 hover:text-white transition"><X className="w-3.5 h-3.5"/></button>
              </div>
            ) : (
              <button onClick={()=>setShow3D(true)} className="shrink-0 mx-4 mt-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 flex items-center justify-center gap-2"><Box className="w-4 h-4"/>3D İmam Göster</button>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2 space-y-3 max-w-2xl mx-auto w-full">
              {/* Step header */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/20 shrink-0">
                  {guide.currentStep && <PostureIcon posture={guide.currentStep.posture}/>}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">{guide.currentStep?.postureName}</span>
                    <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-800">{guide.currentStepIndex+1}/{guide.totalSteps}</span>
                  </div>
                  <h2 className="text-sm font-bold text-white leading-snug">{guide.currentStep?.title}</h2>
                </div>
              </div>

              {/* Guidance */}
              <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"/>
                <p className="text-xs text-slate-300 leading-relaxed">{guide.currentStep?.guidanceText}</p>
              </div>

              {/* Arabic reading card */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 flex flex-col text-center space-y-4">
                {guide.currentStep?.arabicText && (
                  <div className="text-xl sm:text-2xl text-amber-200 leading-loose" style={{fontFamily:"var(--font-quran,Amiri,serif)",direction:"rtl"}}>
                    {guide.currentStep.arabicText}
                  </div>
                )}
                {guide.currentStep?.transliteration && (
                  <div className="text-sm text-emerald-100 font-medium leading-relaxed border-t border-slate-800/80 pt-3">
                    {guide.currentStep.transliteration}
                  </div>
                )}
                {guide.currentStep?.meaning && (
                  <div className="pt-1">
                    <button onClick={()=>setActiveMeaning(v=>!v)} className="text-xs font-semibold text-slate-400 hover:text-emerald-300 transition inline-flex items-center gap-1">
                      <span>{activeMeaning?"Anlamı Gizle":"Türkçe Anlamı Gör"}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeMeaning?"rotate-90":""}`}/>
                    </button>
                    {activeMeaning && <p className="mt-2 text-xs text-slate-400 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left">{guide.currentStep.meaning}</p>}
                  </div>
                )}
              </div>

              {/* Audio status */}
              <div className="h-5 flex items-center justify-center text-xs">
                {guide.isSpeaking && <div className="inline-flex items-center gap-2 text-emerald-400 animate-pulse font-medium"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"/><span>Sesli rehber okunuyor...</span></div>}
                {guide.isWaitingForNext && <div className="inline-flex items-center gap-2 text-amber-400 font-medium"><span>Sonraki adıma geçiliyor ({guide.timeRemainingInStep}s)...</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        {!guide.isCompleted && (
          <footer className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 shrink-0">
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button onClick={guide.previousStep} disabled={guide.currentStepIndex===0} className="flex-1 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition flex items-center justify-center gap-1.5 text-xs font-medium"><SkipBack className="w-4 h-4"/><span className="hidden xs:inline">Önceki</span></button>
                <button onClick={guide.replayAudio} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition"><RotateCcw className="w-4 h-4"/></button>
                <button onClick={guide.togglePlayPause} className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-950/60 transition active:scale-95 shrink-0">
                  {guide.isPlaying&&!guide.isPaused?<Pause className="w-7 h-7 fill-current"/>:<Play className="w-7 h-7 fill-current ml-0.5"/>}
                </button>
                <button onClick={guide.nextStep} className="flex-1 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 text-xs font-medium"><span className="hidden xs:inline">Sonraki</span><SkipForward className="w-4 h-4"/></button>
              </div>
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-0.5" style={{scrollbarWidth:"none"}}>
                {guide.currentPrayer?.steps.map((step,idx)=>(
                  <button key={step.id} onClick={()=>guide.goToStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx===guide.currentStepIndex?"w-5 bg-emerald-400":idx<guide.currentStepIndex?"w-1.5 bg-emerald-700":"w-1.5 bg-slate-700"}`}
                    title={step.title}/>
                ))}
              </div>
            </div>
          </footer>
        )}

        <style jsx>{`
          @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 1: Vakit Seçimi
  // ──────────────────────────────────────────────────────────────────────────
  if (stage === 1) {
    return (
      <div className="min-h-screen pb-28 bg-[#090D16]" style={{animation:"fadeUp .35s ease"}}>
        <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
          {/* Hero */}
          <div className="relative overflow-hidden p-6 rounded-3xl border border-emerald-500/15" style={{background:"linear-gradient(135deg,#0a2016 0%,#090d16 60%,#0a1628 100%)"}}>
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20" style={{background:"radial-gradient(circle,#10b981,transparent)"}}/>
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <Sparkles className="w-3.5 h-3.5"/><span>3D Karakter Eşliğinde</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">Namaz Kılma Rehberi</h1>
              <p className="text-sm text-slate-400">Hangi vakti kılmak istiyorsunuz? Adım adım sesli ve 3D yönlendirme ile namaz kılın.</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">Vakit Seçin</p>

          {/* Vakit cards */}
          <div className="space-y-3">
            {WAKTLER.map((wakt) => {
              const ic = WAKT_ICON_COLORS[wakt.id];
              return (
                <button
                  key={wakt.id}
                  onClick={()=>handleWaktSelect(wakt)}
                  className="w-full group relative overflow-hidden p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:scale-[1.012] active:scale-[0.99] text-left"
                  style={{background:`linear-gradient(135deg,${wakt.gradientFrom} 0%,#0c1220 100%)`,boxShadow:`0 4px 24px ${wakt.glowColor}`}}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{background:`radial-gradient(ellipse at 10% 50%,${wakt.glowColor} 0%,transparent 60%)`}}/>
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-white/5"
                      style={{background:ic.bg,boxShadow:`0 0 20px ${wakt.glowColor}`}}>
                      {WAKT_EMOJIS[wakt.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">{wakt.label}</span>
                        <span className="text-sm opacity-40" style={{fontFamily:"var(--font-quran,Amiri,serif)"}}>{wakt.arabicLabel}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{wakt.description}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border" style={{color:ic.text,background:`${ic.bg}99`,borderColor:`${ic.text}30`}}>
                        {wakt.timeRange}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all shrink-0"/>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-600 pb-2">Her bölüm için Arapça metin, okunuş ve sesli rehber mevcuttur.</p>
        </div>

        <style jsx>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2: Rekat / Bölüm Seçimi
  // ──────────────────────────────────────────────────────────────────────────
  if (stage === 2 && selectedWakt) {
    const options = PRAYER_OPTIONS[selectedWakt.id];
    const ic = WAKT_ICON_COLORS[selectedWakt.id];
    return (
      <div className="min-h-screen pb-28 bg-[#090D16]" style={{animation:"fadeUp .3s ease"}}>
        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">
          {/* Header with back */}
          <div className="flex items-center gap-3">
            <button onClick={handleBackToWakt} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"><ChevronLeft className="w-5 h-5"/></button>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-white/5" style={{background:ic.bg}}>
                {WAKT_EMOJIS[selectedWakt.id]}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">{selectedWakt.label} Namazı</h2>
                <p className="text-xs text-slate-400">Kılmak istediğiniz bölümü seçin</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"/>

          {/* Option cards */}
          <div className="space-y-2.5">
            {options.map((opt, idx) => {
              const isSelected = selectedOpt?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={()=>handleOptSelect(opt)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 group ${
                    isSelected
                      ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Number / check */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                      isSelected?"bg-emerald-500 text-white shadow-lg shadow-emerald-900/50":"bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                    }`}>
                      {isSelected ? <CheckCircle2 className="w-4 h-4"/> : idx+1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${opt.badgeClass}`}>{opt.typeLabel}</span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">{opt.badge}</span>
                      </div>
                      <h3 className={`text-sm font-bold transition-colors ${isSelected?"text-emerald-300":"text-slate-100 group-hover:text-white"}`}>{opt.label}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{opt.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${isSelected?"text-emerald-400":"text-slate-600 opacity-0 group-hover:opacity-100"}`}/>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Start CTA */}
          <div className="sticky bottom-24 pt-2 pb-1">
            <button
              onClick={handleStartPrayer}
              disabled={!selectedOpt}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
                selectedOpt
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-2xl shadow-emerald-950/60 active:scale-[0.98]"
                  : "bg-slate-800/80 text-slate-600 cursor-not-allowed border border-slate-700"
              }`}
            >
              <Play className={`w-5 h-5 fill-current ${!selectedOpt?"opacity-40":""}`}/>
              {selectedOpt ? `${selectedOpt.label} — Başlat` : "Bir bölüm seçin"}
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  return null;
}
