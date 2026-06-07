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

type PatchPreset = {
  root: number;
  semitones: number[];
  glides?: number[];
  gains?: number[];
  starts?: number[];
  durations?: number[];
  types?: OscillatorType[];
  delay: number;
  feedback: number;
  lowpass: number;
  wet: number;
};

const defaultStarts = [0, 0.04, 0.09, 0.15];
const defaultDurations = [0.16, 0.22, 0.26, 0.3];
const defaultGains = [0.13, 0.1, 0.065, 0.04];
const defaultTypes: OscillatorType[] = ["sine", "triangle", "sine", "triangle"];

function tone(root: number, semitones: number) {
  return root * 2 ** (semitones / 12);
}

function createPatch(preset: PatchPreset): SoundPatch {
  return {
    delay: preset.delay,
    feedback: preset.feedback,
    lowpass: preset.lowpass,
    wet: preset.wet,
    notes: preset.semitones.map((semitone, index) => ({
      frequency: tone(preset.root, semitone),
      endFrequency: tone(
        preset.root,
        preset.glides?.[index] ?? semitone + (index === 0 ? 2 : -1),
      ),
      start: preset.starts?.[index] ?? defaultStarts[index] ?? 0,
      duration: preset.durations?.[index] ?? defaultDurations[index] ?? 0.2,
      gain: preset.gains?.[index] ?? defaultGains[index] ?? 0.05,
      type: preset.types?.[index] ?? defaultTypes[index] ?? "sine",
    })),
  };
}

const soundPresets: Record<DreamSound, PatchPreset[]> = {
  tap: [
    { root: 261.63, semitones: [0, 7], glides: [2, 9], delay: 0.13, feedback: 0.2, lowpass: 4300, wet: 0.18 },
    { root: 293.66, semitones: [0, 5, 12], glides: [2, 7, 14], delay: 0.15, feedback: 0.22, lowpass: 4600, wet: 0.2 },
    { root: 329.63, semitones: [0, 3, 10], glides: [1, 5, 12], delay: 0.16, feedback: 0.2, lowpass: 5200, wet: 0.19 },
    { root: 392, semitones: [0, 7, 14], glides: [2, 9, 16], delay: 0.12, feedback: 0.18, lowpass: 5800, wet: 0.17 },
    { root: 440, semitones: [0, 4, 11], glides: [2, 6, 12], delay: 0.14, feedback: 0.21, lowpass: 5400, wet: 0.2 },
  ],
  nav: [
    { root: 220, semitones: [0, 7, 12], glides: [2, 9, 14], delay: 0.18, feedback: 0.24, lowpass: 5200, wet: 0.22 },
    { root: 246.94, semitones: [0, 5, 9, 14], glides: [2, 7, 11, 16], delay: 0.2, feedback: 0.26, lowpass: 5000, wet: 0.24 },
    { root: 261.63, semitones: [0, 4, 7, 12], glides: [1, 5, 9, 14], delay: 0.21, feedback: 0.25, lowpass: 5600, wet: 0.23 },
    { root: 329.63, semitones: [0, 3, 7, 15], glides: [2, 5, 10, 17], delay: 0.17, feedback: 0.23, lowpass: 6200, wet: 0.22 },
    { root: 349.23, semitones: [0, 7, 10, 17], glides: [2, 9, 12, 19], delay: 0.19, feedback: 0.27, lowpass: 5900, wet: 0.25 },
  ],
  reaction: [
    { root: 277.18, semitones: [0, 7, 12, 19], glides: [3, 10, 15, 21], delay: 0.2, feedback: 0.32, lowpass: 6200, wet: 0.28 },
    { root: 293.66, semitones: [0, 5, 12, 17], glides: [2, 9, 14, 21], delay: 0.22, feedback: 0.34, lowpass: 6500, wet: 0.3 },
    { root: 329.63, semitones: [0, 4, 11, 16], glides: [2, 7, 14, 19], delay: 0.19, feedback: 0.31, lowpass: 6800, wet: 0.28 },
    { root: 392, semitones: [0, 3, 10, 15], glides: [2, 5, 12, 17], delay: 0.21, feedback: 0.35, lowpass: 7000, wet: 0.31 },
    { root: 415.3, semitones: [0, 7, 14, 21], glides: [3, 10, 17, 19], delay: 0.23, feedback: 0.33, lowpass: 7200, wet: 0.29 },
    { root: 466.16, semitones: [0, 5, 9, 16], glides: [2, 7, 12, 19], delay: 0.18, feedback: 0.3, lowpass: 7600, wet: 0.27 },
  ],
  save: [
    { root: 196, semitones: [0, 7, 12, 19], glides: [2, 9, 14, 21], delay: 0.24, feedback: 0.34, lowpass: 5600, wet: 0.3 },
    { root: 220, semitones: [0, 5, 12, 17], glides: [2, 7, 14, 19], delay: 0.27, feedback: 0.36, lowpass: 5400, wet: 0.32 },
    { root: 261.63, semitones: [0, 4, 9, 16], glides: [2, 7, 11, 19], delay: 0.25, feedback: 0.33, lowpass: 6000, wet: 0.3 },
    { root: 293.66, semitones: [0, 3, 10, 15], glides: [2, 5, 12, 17], delay: 0.28, feedback: 0.37, lowpass: 5800, wet: 0.33 },
  ],
  share: [
    { root: 220, semitones: [0, 7, 12, 16], glides: [2, 9, 14, 19], delay: 0.16, feedback: 0.28, lowpass: 6400, wet: 0.26 },
    { root: 246.94, semitones: [0, 5, 9, 17], glides: [2, 7, 12, 19], delay: 0.18, feedback: 0.29, lowpass: 6800, wet: 0.27 },
    { root: 293.66, semitones: [0, 7, 10, 19], glides: [2, 9, 14, 21], delay: 0.15, feedback: 0.27, lowpass: 7000, wet: 0.25 },
    { root: 329.63, semitones: [0, 4, 11, 18], glides: [2, 6, 14, 21], delay: 0.17, feedback: 0.3, lowpass: 7200, wet: 0.28 },
  ],
  toggle: [
    { root: 174.61, semitones: [0, 7, 12], glides: [2, 9, 14], delay: 0.22, feedback: 0.26, lowpass: 5000, wet: 0.24 },
    { root: 196, semitones: [0, 5, 12], glides: [2, 7, 14], delay: 0.24, feedback: 0.28, lowpass: 4800, wet: 0.25 },
    { root: 261.63, semitones: [0, 4, 9], glides: [2, 6, 11], delay: 0.21, feedback: 0.25, lowpass: 5400, wet: 0.24 },
    { root: 329.63, semitones: [0, 3, 10], glides: [1, 5, 12], delay: 0.23, feedback: 0.29, lowpass: 5600, wet: 0.26 },
  ],
  danger: [
    {
      root: 110,
      semitones: [12, 5, 0],
      glides: [8, 3, -3],
      gains: [0.12, 0.08, 0.06],
      types: ["sawtooth", "sine", "triangle"],
      delay: 0.1,
      feedback: 0.16,
      lowpass: 2600,
      wet: 0.12,
    },
    {
      root: 123.47,
      semitones: [12, 7, -2],
      glides: [10, 4, -5],
      gains: [0.11, 0.075, 0.055],
      types: ["sawtooth", "triangle", "sine"],
      delay: 0.12,
      feedback: 0.18,
      lowpass: 2400,
      wet: 0.14,
    },
  ],
};

const soundMap = Object.fromEntries(
  Object.entries(soundPresets).map(([sound, presets]) => [
    sound,
    presets.map(createPatch),
  ]),
) as Record<DreamSound, SoundPatch[]>;

export const DREAM_SOUND_VARIANT_COUNT = Object.values(soundMap).reduce(
  (total, patches) => total + patches.length,
  0,
);

let lastPatchIndexBySound: Partial<Record<DreamSound, number>> = {};

function selectSoundPatch(sound: DreamSound) {
  const patches = soundMap[sound] ?? soundMap.tap;

  if (patches.length === 1) {
    return patches[0];
  }

  const previousIndex = lastPatchIndexBySound[sound];
  let nextIndex = Math.floor(Math.random() * patches.length);

  if (previousIndex !== undefined && nextIndex === previousIndex) {
    nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (patches.length - 1))) % patches.length;
  }

  lastPatchIndexBySound = {
    ...lastPatchIndexBySound,
    [sound]: nextIndex,
  };

  return patches[nextIndex] ?? patches[0];
}

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
    const patch = selectSoundPatch(sound);
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
