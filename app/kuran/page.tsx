"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  Search,
  Bookmark,
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface AyahData {
  numberInSurah: number;
  number: number; // Global Ayah number (1 to 6236)
  arabicText: string;
  turkishText: string;
}

interface BookmarkData {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
}

export default function KuranPage() {
  // Navigation & View state
  const [activeSurahNumber, setActiveSurahNumber] = useState<number | null>(null);
  const [surahsList, setSurahsList] = useState<SurahMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Reader state
  const [activeSurahMeta, setActiveSurahMeta] = useState<SurahMeta | null>(null);
  const [ayahsList, setAyahsList] = useState<AyahData[]>([]);
  const [isLoadingSurahs, setIsLoadingSurahs] = useState<boolean>(true);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User Settings & Bookmark state
  const [bookmark, setBookmark] = useState<BookmarkData | null>(null);
  const [arabicFontSize, setArabicFontSize] = useState<number>(2.0); // in rem

  // Audio Playback state
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Bookmark & Preferences on Mount
  useEffect(() => {
    try {
      const savedBookmark = localStorage.getItem("kuran_bookmark");
      const savedFontSize = localStorage.getItem("kuran_font_size");

      if (savedBookmark) setBookmark(JSON.parse(savedBookmark));
      if (savedFontSize) setArabicFontSize(parseFloat(savedFontSize));
    } catch (e) {
      console.error("LocalStorage load error:", e);
    }
  }, []);

  // Fetch All 114 Surahs on Mount
  useEffect(() => {
    const fetchSurahsList = async () => {
      setIsLoadingSurahs(true);
      setErrorMsg(null);
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();
        if (data && data.code === 200 && data.data) {
          setSurahsList(data.data);
        } else {
          throw new Error("Sure listesi alınamadı");
        }
      } catch (err) {
        console.error("Surahs API Error:", err);
        setErrorMsg("Sure listesi yüklenirken bir hata oluştu.");
      } finally {
        setIsLoadingSurahs(false);
      }
    };

    fetchSurahsList();
  }, []);

  // Fetch Ayahs when a Surah is opened
  const fetchSurahAyahs = async (surahNum: number) => {
    setIsLoadingAyahs(true);
    setErrorMsg(null);
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,tr.diyanet`
      );
      const data = await response.json();

      if (data && data.code === 200 && data.data && data.data.length >= 2) {
        const uthmaniEdition = data.data[0].ayahs;
        const diyanetEdition = data.data[1].ayahs;

        const mergedAyahs: AyahData[] = uthmaniEdition.map((item: { numberInSurah: number; number: number; text: string }, idx: number) => ({
          numberInSurah: item.numberInSurah,
          number: item.number,
          arabicText: item.text,
          turkishText: diyanetEdition[idx] ? diyanetEdition[idx].text : "",
        }));

        setAyahsList(mergedAyahs);
      } else {
        throw new Error("Ayet verileri alınamadı");
      }
    } catch (err) {
      console.error("Ayahs API Error:", err);
      setErrorMsg("Sure ayetleri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoadingAyahs(false);
    }
  };

  // Open Surah Reader View
  const handleOpenSurah = (surah: SurahMeta, targetAyahNum?: number) => {
    setActiveSurahNumber(surah.number);
    setActiveSurahMeta(surah);
    fetchSurahAyahs(surah.number);

    if (targetAyahNum) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyahNum}`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 800);
    }
  };

  // Back to Surah List
  const handleBackToList = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingAyahNumber(null);
    setActiveSurahNumber(null);
    setActiveSurahMeta(null);
    setAyahsList([]);
  };

  // Bookmark Ayah
  const handleBookmarkAyah = (ayahNumberInSurah: number) => {
    if (!activeSurahMeta) return;

    const newBookmark: BookmarkData = {
      surahNumber: activeSurahMeta.number,
      surahName: activeSurahMeta.englishName,
      ayahNumber: ayahNumberInSurah,
    };

    setBookmark(newBookmark);
    localStorage.setItem("kuran_bookmark", JSON.stringify(newBookmark));
  };

  // Font Size Adjustments
  const handleChangeFontSize = (delta: number) => {
    const newSize = Math.max(1.4, Math.min(3.2, parseFloat((arabicFontSize + delta).toFixed(1))));
    setArabicFontSize(newSize);
    localStorage.setItem("kuran_font_size", newSize.toString());
  };

  // Audio Play / Pause
  const handleToggleAudio = (globalAyahNumber: number) => {
    if (playingAyahNumber === globalAyahNumber) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAyahNumber(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.play().catch((e) => console.warn("Audio play error:", e));
      setPlayingAyahNumber(globalAyahNumber);

      audio.onended = () => {
        // Auto play next ayah if available in list
        const currentIdx = ayahsList.findIndex((a) => a.number === globalAyahNumber);
        if (currentIdx !== -1 && currentIdx < ayahsList.length - 1) {
          handleToggleAudio(ayahsList[currentIdx + 1].number);
        } else {
          setPlayingAyahNumber(null);
        }
      };
    }
  };

  // Filter surahs list for search
  const filteredSurahs = useMemo(() => {
    return surahsList.filter(
      (s) =>
        s.englishName.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
        s.englishNameTranslation.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
        s.number.toString().includes(searchQuery)
    );
  }, [surahsList, searchQuery]);

  return (
    <div className="kuran-wrapper">
      {/* ------------------------------------------------------------------ */}
      {/* SURAH READER VIEW                                                  */}
      {/* ------------------------------------------------------------------ */}
      {activeSurahNumber !== null && activeSurahMeta ? (
        <div className="surah-reader-container">
          {/* Reader Sticky Header Bar */}
          <div className="reader-header-bar">
            <button className="btn-back-list" onClick={handleBackToList} id="btn-back-to-surahs">
              <ChevronLeft size={18} />
              <span>Sureler</span>
            </button>

            <div className="reader-surah-title">
              {activeSurahMeta.number}. {activeSurahMeta.englishName}
            </div>

            {/* Font Size Adjuster */}
            <div className="font-size-controls" title="Arapça Yazı Boyutu">
              <button
                className="btn-font-size"
                onClick={() => handleChangeFontSize(-0.2)}
                title="Küçült"
              >
                A-
              </button>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {arabicFontSize}
              </span>
              <button
                className="btn-font-size"
                onClick={() => handleChangeFontSize(0.2)}
                title="Büyüt"
              >
                A+
              </button>
            </div>
          </div>

          {/* Bismillah Header (Except Surah At-Tawbah #9) */}
          {activeSurahNumber !== 9 && (
            <div className="bismillah-card">
              <div className="bismillah-text">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
            </div>
          )}

          {/* Loading Ayahs State */}
          {isLoadingAyahs ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "var(--text-secondary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <RefreshCw size={28} className="spin-icon" style={{ animation: "spin 1.5s linear infinite" }} />
              <span>Ayetler ve Mealler Yükleniyor...</span>
            </div>
          ) : errorMsg ? (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "var(--radius-md)",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#F87171",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          ) : (
            /* Ayahs List */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ayahsList.map((ayah) => {
                const isBookmarked =
                  bookmark?.surahNumber === activeSurahMeta.number &&
                  bookmark?.ayahNumber === ayah.numberInSurah;
                const isPlaying = playingAyahNumber === ayah.number;

                return (
                  <div
                    key={ayah.numberInSurah}
                    id={`ayah-${ayah.numberInSurah}`}
                    className={`ayah-card-item ${isPlaying ? "playing" : ""}`}
                  >
                    <div className="ayah-header-row">
                      <div className="ayah-number-badge">
                        <span>Ayet {ayah.numberInSurah}</span>
                      </div>

                      <div className="ayah-actions-right">
                        {/* Audio Play Button */}
                        <button
                          className={`btn-ayah-action ${isPlaying ? "active" : ""}`}
                          onClick={() => handleToggleAudio(ayah.number)}
                          title={isPlaying ? "Durdur" : "Dinle"}
                          id={`btn-play-ayah-${ayah.numberInSurah}`}
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>

                        {/* Bookmark Button */}
                        <button
                          className={`btn-ayah-action ${isBookmarked ? "bookmarked" : ""}`}
                          onClick={() => handleBookmarkAyah(ayah.numberInSurah)}
                          title={isBookmarked ? "Kaldığın Yer" : "Yer İmi Ekle"}
                          id={`btn-bookmark-ayah-${ayah.numberInSurah}`}
                        >
                          <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div
                      className="ayah-arabic-text"
                      style={{ fontSize: `${arabicFontSize}rem` }}
                    >
                      {ayah.arabicText}
                    </div>

                    {/* Turkish Diyanet Translation */}
                    <div className="ayah-translation-text">{ayah.turkishText}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* MAIN SURAH LIST VIEW                                               */
        /* ------------------------------------------------------------------ */
        <>
          {/* Last Read Bookmark Hero Banner */}
          {bookmark && (
            <div className="last-read-card">
              <div className="last-read-left">
                <div className="bookmark-icon-bg">
                  <Bookmark size={24} fill="currentColor" />
                </div>
                <div>
                  <div className="last-read-title">Kaldığın Yerden Devam Et</div>
                  <div className="last-read-surah-name">
                    {bookmark.surahName} Suresi
                  </div>
                  <div className="last-read-ayah-num">{bookmark.ayahNumber}. Ayet</div>
                </div>
              </div>

              <button
                className="btn-resume-read"
                onClick={() => {
                  const targetSurah = surahsList.find((s) => s.number === bookmark.surahNumber);
                  if (targetSurah) {
                    handleOpenSurah(targetSurah, bookmark.ayahNumber);
                  }
                }}
                id="btn-resume-bookmark"
              >
                <span>Devam Et</span>
              </button>
            </div>
          )}

          {/* Surahs Search Bar */}
          <div className="surah-search-card">
            <div className="search-box-wrapper">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                className="search-input-field"
                placeholder="Sure adı veya numarası ara (Örn: Yasin, Fatiha, 36...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Loading Surahs State */}
          {isLoadingSurahs ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "var(--text-secondary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <RefreshCw size={28} className="spin-icon" style={{ animation: "spin 1.5s linear infinite" }} />
              <span>Sure Listesi Yükleniyor...</span>
            </div>
          ) : errorMsg ? (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "var(--radius-md)",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#F87171",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          ) : (
            /* 114 Surahs Grid List */
            <div className="surahs-grid-container">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  className="surah-card-item"
                  onClick={() => handleOpenSurah(surah)}
                  id={`surah-card-${surah.number}`}
                >
                  <div className="surah-card-left">
                    <div className="surah-number-badge">{surah.number}</div>
                    <div>
                      <div className="surah-title-tr">{surah.englishName}</div>
                      <div className="surah-meta-tags">
                        <span className="revelation-badge">
                          {surah.revelationType === "Meccan" ? "Mekkî" : "Medenî"}
                        </span>
                        <span>• {surah.numberOfAyahs} Ayet</span>
                      </div>
                    </div>
                  </div>

                  <div className="surah-title-ar">{surah.name}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
