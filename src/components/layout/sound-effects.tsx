"use client";

import { useEffect } from "react";

export type DreamSound =
  | "tap"
  | "nav"
  | "reaction"
  | "save"
  | "share"
  | "toggle"
  | "danger";

const SOUND_STORAGE_KEY = "dreamshare-sound";
const SOUND_EVENT = "dreamshare:sound-preference";

type SoundNote = {
  frequency: number;
  start: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
};

const soundMap: Record<DreamSound, SoundNote[]> = {
  tap: [{ frequency: 620, start: 0, duration: 0.055, gain: 0.055, type: "triangle" }],
  nav: [
    { frequency: 360, start: 0, duration: 0.06, gain: 0.042, type: "sine" },
    { frequency: 540, start: 0.035, duration: 0.075, gain: 0.038, type: "triangle" },
  ],
  reaction: [
    { frequency: 740, start: 0, duration: 0.06, gain: 0.06, type: "triangle" },
    { frequency: 990, start: 0.045, duration: 0.075, gain: 0.046, type: "sine" },
  ],
  save: [
    { frequency: 520, start: 0, duration: 0.07, gain: 0.052, type: "triangle" },
    { frequency: 780, start: 0.052, duration: 0.09, gain: 0.044, type: "triangle" },
  ],
  share: [
    { frequency: 440, start: 0, duration: 0.055, gain: 0.044, type: "sine" },
    { frequency: 660, start: 0.04, duration: 0.065, gain: 0.04, type: "sine" },
    { frequency: 880, start: 0.085, duration: 0.075, gain: 0.034, type: "triangle" },
  ],
  toggle: [
    { frequency: 300, start: 0, duration: 0.065, gain: 0.044, type: "sine" },
    { frequency: 600, start: 0.05, duration: 0.085, gain: 0.042, type: "triangle" },
  ],
  danger: [{ frequency: 190, start: 0, duration: 0.11, gain: 0.045, type: "sawtooth" }],
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextConstructor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

export function getSoundEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "on" : "off");
  window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { enabled } }));

  if (enabled) {
    playDreamSound("toggle", { force: true });
  }
}

export function subscribeToSoundPreference(listener: (enabled: boolean) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handlePreference = (event: Event) => {
    listener(
      event instanceof CustomEvent && typeof event.detail?.enabled === "boolean"
        ? event.detail.enabled
        : getSoundEnabled(),
    );
  };

  window.addEventListener(SOUND_EVENT, handlePreference);
  window.addEventListener("storage", handlePreference);

  return () => {
    window.removeEventListener(SOUND_EVENT, handlePreference);
    window.removeEventListener("storage", handlePreference);
  };
}

export function playDreamSound(
  sound: DreamSound = "tap",
  options: { force?: boolean } = {},
) {
  if (!options.force && !getSoundEnabled()) {
    return;
  }

  const context = getAudioContext();

  if (!context) {
    return;
  }

  const play = () => {
    const notes = soundMap[sound] ?? soundMap.tap;
    const now = context.currentTime;

    for (const note of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + note.start;
      const end = start + note.duration;

      oscillator.type = note.type ?? "sine";
      oscillator.frequency.setValueAtTime(note.frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(80, note.frequency * 0.72),
        end,
      );

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }
  };

  if (context.state === "suspended") {
    void context.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

function getSoundFromElement(element: HTMLElement) {
  const sound = element.dataset.sound;

  if (
    sound === "tap" ||
    sound === "nav" ||
    sound === "reaction" ||
    sound === "save" ||
    sound === "share" ||
    sound === "toggle" ||
    sound === "danger"
  ) {
    return sound;
  }

  return null;
}

function isDisabledControl(element: HTMLElement) {
  return (
    element.getAttribute("aria-disabled") === "true" ||
    (element instanceof HTMLButtonElement && element.disabled) ||
    (element instanceof HTMLInputElement && element.disabled)
  );
}

export function SoundEffects() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const element = target.closest<HTMLElement>("[data-sound]");

      if (!element || isDisabledControl(element)) {
        return;
      }

      const sound = getSoundFromElement(element);

      if (sound) {
        playDreamSound(sound);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
