"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  getSoundEnabled,
  playDreamSound,
  setSoundEnabled,
  subscribeToSoundPreference,
} from "@/components/layout/sound-effects";
import { Button } from "@/components/ui/button";

export function SoundToggle() {
  const enabled = useSyncExternalStore(
    (onStoreChange) => subscribeToSoundPreference(() => onStoreChange()),
    getSoundEnabled,
    () => true,
  );

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      sound="none"
      aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}
      title={enabled ? "Mute sounds" : "Enable sounds"}
      suppressHydrationWarning
      onClick={() => {
        const nextEnabled = !enabled;

        if (!nextEnabled) {
          playDreamSound("danger", { force: true });
        }

        setSoundEnabled(nextEnabled);
      }}
    >
      {enabled ? (
        <Volume2 className="size-4" aria-hidden="true" />
      ) : (
        <VolumeX className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
