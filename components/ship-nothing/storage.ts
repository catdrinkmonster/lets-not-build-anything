import {
  INITIAL_ROTATION_STATE,
  type VariantRotationState,
} from "@/lib/build-nothing";

export const ROTATION_STATE_STORAGE_KEY = "lets-not-build-anything-rotation-state-v2";

export function loadRotationState(): VariantRotationState {
  if (typeof window === "undefined") {
    return INITIAL_ROTATION_STATE;
  }

  const storedState = window.localStorage.getItem(ROTATION_STATE_STORAGE_KEY);

  if (!storedState) {
    return INITIAL_ROTATION_STATE;
  }

  try {
    const parsed = JSON.parse(storedState) as Partial<VariantRotationState>;

    return {
      initial: Array.isArray(parsed.initial)
        ? parsed.initial
        : INITIAL_ROTATION_STATE.initial,
      middle: Array.isArray(parsed.middle)
        ? parsed.middle
        : INITIAL_ROTATION_STATE.middle,
      final: Array.isArray(parsed.final)
        ? parsed.final
        : INITIAL_ROTATION_STATE.final,
    };
  } catch {
    window.localStorage.removeItem(ROTATION_STATE_STORAGE_KEY);
    return INITIAL_ROTATION_STATE;
  }
}
