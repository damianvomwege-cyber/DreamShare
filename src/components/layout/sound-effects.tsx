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
  endFrequency?: number;
};

type SoundPatch = {
  notes: SoundNote[];
  delay: number;
  feedback: number;
  lowpass: number;
  wet: number;
};

const soundMap: Record<DreamSound, SoundPatch> = {
  tap: {
    delay: 0.13,
    feedback: 0.2,
    lowpass: 4200,
    wet: 0.18,
    notes: [
      { frequency: 523.25, endFrequency: 587.33, start: 0, duration: 0.11, gain: 0.15, type: "sine" },
      { frequency: 1046.5, endFrequency: 1174.66, start: 0.018, duration: 0.16, gain: 0.08, type: "triangle" },
    ],
  },
  nav: {
    delay: 0.18,
    feedback: 0.24,
    lowpass: 5200,
    wet: 0.22,
    notes: [
      { frequency: 329.63, endFrequency: 392, start: 0, duration: 0.15, gain: 0.12, type: "sine" },
      { frequency: 659.25, endFrequency: 783.99, start: 0.03, duration: 0.2, gain: 0.1, type: "triangle" },
      { frequency: 1318.51, endFrequency: 1567.98, start: 0.07, duration: 0.22, gain: 0.055, type: "sine" },
    ],
  },
  reaction: {
    delay: 0.2,
    feedback: 0.32,
    lowpass: 6200,
    wet: 0.28,
    notes: [
      { frequency: 554.37, endFrequency: 830.61, start: 0, duration: 0.17, gain: 0.14, type: "triangle" },
      { frequency: 1108.73, endFrequency: 1661.22, start: 0.035, duration: 0.22, gain: 0.1, type: "sine" },
      { frequency: 2217.46, endFrequency: 1661.22, start: 0.09, duration: 0.28, gain: 0.045, type: "sine" },
    ],
  },
  save: {
    delay: 0.24,
    feedback: 0.34,
    lowpass: 5600,
    wet: 0.3,
    notes: [
      { frequency: 392, endFrequency: 523.25, start: 0, duration: 0.18, gain: 0.13, type: "sine" },
      { frequency: 783.99, endFrequency: 1046.5, start: 0.055, duration: 0.24, gain: 0.1, type: "triangle" },
      { frequency: 1567.98, endFrequency: 2093, start: 0.12, duration: 0.26, gain: 0.05, type: "sine" },
    ],
  },
  share: {
    delay: 0.16,
    feedback: 0.28,
    lowpass: 6400,
    wet: 0.26,
    notes: [
      { frequency: 440, endFrequency: 554.37, start: 0, duration: 0.13, gain: 0.12, type: "sine" },
      { frequency: 659.25, endFrequency: 880, start: 0.055, duration: 0.15, gain: 0.11, type: "triangle" },
      { frequency: 987.77, endFrequency: 1318.51, start: 0.11, duration: 0.2, gain: 0.08, type: "sine" },
      { frequency: 1760, endFrequency: 2349.32, start: 0.17, duration: 0.2, gain: 0.04, type: "sine" },
    ],
  },
  toggle: {
    delay: 0.22,
    feedback: 0.26,
    lowpass: 5000,
    wet: 0.24,
    notes: [
      { frequency: 261.63, endFrequency: 392, start: 0, duration: 0.18, gain: 0.12, type: "sine" },
      { frequency: 523.25, endFrequency: 784, start: 0.045, duration: 0.22, gain: 0.1, type: "triangle" },
    ],
  },
  danger: {
    delay: 0.1,
    feedback: 0.16,
    lowpass: 2600,
    wet: 0.12,
    notes: [
      { frequency: 220, endFrequency: 146.83, start: 0, duration: 0.18, gain: 0.12, type: "sawtooth" },
      { frequency: 110, endFrequency: 92.5, start: 0.03, duration: 0.24, gain: 0.08, type: "sine" },
    ],
  },
};

let audioContext: AudioContext | null = null;
let masterOutput: GainNode | null = null;

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

function getMasterOutput(context: AudioContext) {
  if (masterOutput) {
    return masterOutput;
  }

  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();

  master.gain.value = 0.92;
  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 7;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.18;

  master.connect(compressor);
  compressor.connect(context.destination);
  masterOutput = master;

  return masterOutput;
}

function createDreamBus(context: AudioContext, patch: SoundPatch) {
  const input = context.createGain();
  const dry = context.createGain();
  const delay = context.createDelay(0.6);
  const feedback = context.createGain();
  const filter = context.createBiquadFilter();
  const wet = context.createGain();
  const output = getMasterOutput(context);

  dry.gain.value = 0.92;
  delay.delayTime.value = patch.delay;
  feedback.gain.value = patch.feedback;
  filter.type = "lowpass";
  filter.frequency.value = patch.lowpass;
  wet.gain.value = patch.wet;

  input.connect(dry);
  dry.connect(output);

  input.connect(delay);
  delay.connect(filter);
  filter.connect(wet);
  wet.connect(output);
  filter.connect(feedback);
  feedback.connect(delay);

  return input;
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
    const patch = soundMap[sound] ?? soundMap.tap;
    const bus = createDreamBus(context, patch);
    const now = context.currentTime;
    const maxEnd = Math.max(
      ...patch.notes.map((note) => note.start + note.duration),
    );

    for (const note of patch.notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + note.start;
      const end = start + note.duration;

      oscillator.type = note.type ?? "sine";
      oscillator.frequency.setValueAtTime(note.frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(80, note.endFrequency ?? note.frequency * 0.72),
        end,
      );

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(bus);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }

    window.setTimeout(() => {
      bus.disconnect();
    }, Math.ceil((maxEnd + 0.9) * 1000));
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
