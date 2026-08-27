"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PrayerDefinition, PrayerStep, getPrayerById } from "@/lib/prayer-assistant-data";

export interface PrayerGuideState {
  currentPrayer: PrayerDefinition | null;
  currentStepIndex: number;
  currentStep: PrayerStep | null;
  totalSteps: number;
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isWaitingForNext: boolean;
  timeRemainingInStep: number;
  speechRate: number;
  autoAdvanceDelay: number; // Audio bitiminden sonraki bekleme süresi (sn)
  isCompleted: boolean;
  hasSpeechSupport: boolean;
}

export function usePrayerGuide() {
  const [currentPrayer, setCurrentPrayer] = useState<PrayerDefinition | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isWaitingForNext, setIsWaitingForNext] = useState<boolean>(false);
  const [timeRemainingInStep, setTimeRemainingInStep] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(0.95); // 0.8 to 1.2
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState<number>(3); // 3 seconds pause after audio
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

  // Refs for state inside async listeners & intervals
  const isPlayingRef = useRef(isPlaying);
  const isPausedRef = useRef(isPaused);
  const isMutedRef = useRef(isMuted);
  const speechRateRef = useRef(speechRate);
  const autoAdvanceDelayRef = useRef(autoAdvanceDelay);
  const currentStepIndexRef = useRef(currentStepIndex);
  const currentPrayerRef = useRef(currentPrayer);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const trVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Sync refs
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    autoAdvanceDelayRef.current = autoAdvanceDelay;
  }, [autoAdvanceDelay]);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    currentPrayerRef.current = currentPrayer;
  }, [currentPrayer]);

  // Check speech synthesis support & load Turkish voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setHasSpeechSupport(false);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(
        (v) => v.lang.toLowerCase().includes("tr") || v.lang.toLowerCase().includes("tr_tr")
      );
      if (trVoice) {
        trVoiceRef.current = trVoice;
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Clear timers & speech
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    activeUtteranceRef.current = null;
  }, []);

  // Play audio or start timer fallback for step
  const playCurrentStep = useCallback(
    (stepIndex: number) => {
      clearTimers();
      stopSpeech();

      const prayer = currentPrayerRef.current;
      if (!prayer || stepIndex < 0 || stepIndex >= prayer.steps.length) return;

      const step = prayer.steps[stepIndex];
      setIsWaitingForNext(false);

      // Function to start delay countdown before advancing
      const startPostAudioDelay = (delaySec: number) => {
        setIsSpeaking(false);
        setIsWaitingForNext(true);
        setTimeRemainingInStep(delaySec);

        let remaining = delaySec;
        countdownIntervalRef.current = setInterval(() => {
          if (isPausedRef.current) return;
          remaining -= 1;
          setTimeRemainingInStep(Math.max(0, remaining));
          if (remaining <= 0) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          }
        }, 1000);

        timerRef.current = setTimeout(() => {
          if (!isPlayingRef.current || isPausedRef.current) return;
          
          // Advance to next step
          const nextIdx = stepIndex + 1;
          if (nextIdx < prayer.steps.length) {
            setCurrentStepIndex(nextIdx);
            playCurrentStep(nextIdx);
          } else {
            // Completed prayer
            setIsPlaying(false);
            setIsCompleted(true);
            setIsWaitingForNext(false);
          }
        }, delaySec * 1000);
      };

      // If muted or Speech API not supported -> fallback timer
      if (isMutedRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) {
        const stepTime = (step.durationSeconds || 10) + autoAdvanceDelayRef.current;
        startPostAudioDelay(stepTime);
        return;
      }

      // Web Speech API execution
      try {
        window.speechSynthesis.cancel(); // Reset queue

        const utterance = new SpeechSynthesisUtterance(step.audioText);
        utterance.lang = "tr-TR";
        utterance.rate = speechRateRef.current;
        utterance.pitch = 1.0;

        if (trVoiceRef.current) {
          utterance.voice = trVoiceRef.current;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsWaitingForNext(false);
        };

        utterance.onend = () => {
          if (!isPlayingRef.current) return;
          startPostAudioDelay(autoAdvanceDelayRef.current);
        };

        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis error:", e);
          if (!isPlayingRef.current) return;
          startPostAudioDelay(autoAdvanceDelayRef.current);
        };

        activeUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("SpeechSynthesis launch failed:", err);
        startPostAudioDelay((step.durationSeconds || 10) + autoAdvanceDelayRef.current);
      }
    },
    [clearTimers, stopSpeech]
  );

  // ─── Actions ─────────────────────────────────────────────────────────────
  const selectPrayer = useCallback((prayerOrId: PrayerDefinition | string) => {
    clearTimers();
    stopSpeech();
    const prayer = typeof prayerOrId === "string" ? getPrayerById(prayerOrId) : prayerOrId;
    if (prayer) {
      setCurrentPrayer(prayer);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setIsPaused(false);
      setIsCompleted(false);
      setIsWaitingForNext(false);
      setTimeRemainingInStep(0);
    }
  }, [clearTimers, stopSpeech]);

  const startPrayer = useCallback(
    (prayerOrId?: PrayerDefinition | string) => {
      let prayer = currentPrayer;
      if (prayerOrId) {
        prayer = typeof prayerOrId === "string" ? getPrayerById(prayerOrId) || null : prayerOrId;
        setCurrentPrayer(prayer);
      }

      if (!prayer) return;

      // Chrome mobile audio unlocks on user gesture
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }

      setCurrentStepIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
      setIsCompleted(false);

      // Play 1st step
      playCurrentStep(0);
    },
    [currentPrayer, playCurrentStep]
  );

  const pause = useCallback(() => {
    setIsPaused(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else if (!isSpeaking && !isWaitingForNext) {
        playCurrentStep(currentStepIndexRef.current);
      }
    }
  }, [isSpeaking, isWaitingForNext, playCurrentStep]);

  const togglePlayPause = useCallback(() => {
    if (!isPlaying) {
      if (isCompleted) {
        startPrayer();
      } else {
        setIsPlaying(true);
        resume();
      }
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPlaying, isPaused, isCompleted, startPrayer, resume, pause]);

  const goToStep = useCallback(
    (index: number) => {
      if (!currentPrayer || index < 0 || index >= currentPrayer.steps.length) return;
      setCurrentStepIndex(index);
      setIsCompleted(false);
      if (isPlaying) {
        setIsPaused(false);
        playCurrentStep(index);
      }
    },
    [currentPrayer, isPlaying, playCurrentStep]
  );

  const nextStep = useCallback(() => {
    if (!currentPrayer) return;
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < currentPrayer.steps.length) {
      goToStep(nextIdx);
    } else {
      clearTimers();
      stopSpeech();
      setIsPlaying(false);
      setIsCompleted(true);
    }
  }, [currentPrayer, currentStepIndex, goToStep, clearTimers, stopSpeech]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, goToStep]);

  const restartPrayer = useCallback(() => {
    if (currentPrayer) {
      startPrayer(currentPrayer);
    }
  }, [currentPrayer, startPrayer]);

  const exitPrayer = useCallback(() => {
    clearTimers();
    stopSpeech();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setIsCompleted(false);
  }, [clearTimers, stopSpeech]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (nextMuted) {
        stopSpeech();
      } else if (isPlaying && !isPaused) {
        playCurrentStep(currentStepIndexRef.current);
      }
      return nextMuted;
    });
  }, [isPlaying, isPaused, stopSpeech, playCurrentStep]);

  const replayAudio = useCallback(() => {
    if (currentPrayer) {
      playCurrentStep(currentStepIndex);
    }
  }, [currentPrayer, currentStepIndex, playCurrentStep]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      stopSpeech();
    };
  }, [clearTimers, stopSpeech]);

  const currentStep = currentPrayer ? currentPrayer.steps[currentStepIndex] || null : null;
  const totalSteps = currentPrayer ? currentPrayer.steps.length : 0;
  const progressPercentage = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  return {
    currentPrayer,
    currentStepIndex,
    currentStep,
    totalSteps,
    isPlaying,
    isPaused,
    isMuted,
    isSpeaking,
    isWaitingForNext,
    timeRemainingInStep,
    speechRate,
    autoAdvanceDelay,
    isCompleted,
    hasSpeechSupport,
    progressPercentage,

    // Actions
    selectPrayer,
    startPrayer,
    pause,
    resume,
    togglePlayPause,
    nextStep,
    previousStep,
    goToStep,
    restartPrayer,
    exitPrayer,
    toggleMute,
    setSpeechRate,
    setAutoAdvanceDelay,
    replayAudio
  };
}
