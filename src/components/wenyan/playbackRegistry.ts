/**
 * Cross-section playback mutex (#26 stage D-2.5).
 *
 * Module-level singleton tracking the currently-active stop fn. When a
 * new playback claims the registry, the prior owner's stop is invoked
 * first (cooperative pause-and-resume across sections).
 *
 * Both useWenyanAudio (per-clip) and useWenyanAudioSequence
 * (background / poem-body / translation sequences) participate so any
 * play action stops any other in-flight playback.
 */

let activeStop: (() => void) | null = null;

export function registerActivePlayback(stopFn: () => void): void {
  if (activeStop && activeStop !== stopFn) {
    try {
      activeStop();
    } catch {
      // Swallow — a misbehaving stop fn shouldn't block the new claim.
    }
  }
  activeStop = stopFn;
}

export function clearActivePlayback(stopFn: () => void): void {
  if (activeStop === stopFn) {
    activeStop = null;
  }
}
