const PREFIX = 'pitbull_';

export const STORAGE_VERSION = 1;
export const STORAGE_VERSION_KEY = `${PREFIX}storage_version`;

export const STORAGE_KEYS = {
  SETTINGS: `${PREFIX}settings`,
  EXERCISES: `${PREFIX}custom_exercises`,
  ROUTINES: `${PREFIX}routines`,
  HISTORY: `${PREFIX}workout_history`,
  ACTIVE: `${PREFIX}active_workout`,
} as const;

/**
 * Per-version data migrations. Key is the version being migrated FROM,
 * value receives the stored payload and returns the migrated payload.
 */
const MIGRATIONS: Record<number, (payload: unknown) => unknown> = {};

/** Remove every key this app owns. Used by the error screen reset button. */
export function clearAppStorage(): void {
  clearAll();
}

function clearAll() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {}
}

/**
 * Normalize the stored data version before anything reads it.
 * - No version marker: legacy payload from an older build, accept it.
 * - Version newer than this build: the user downgraded, reset instead of crashing.
 * - Version older: run registered migrations.
 */
export function ensureStorageVersion(): void {
  try {
    const raw = localStorage.getItem(STORAGE_VERSION_KEY);
    const version = raw === null ? 0 : Number(raw);

    if (!Number.isFinite(version) || version < 0) {
      clearAll();
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      return;
    }

    if (version > STORAGE_VERSION) {
      clearAll();
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      return;
    }

    if (version < STORAGE_VERSION) {
      for (let v = version; v < STORAGE_VERSION; v++) {
        const migrate = MIGRATIONS[v];
        if (!migrate) continue;
        for (const key of Object.values(STORAGE_KEYS)) {
          const payload = readJson<unknown>(key, null);
          if (payload !== null) writeJson(key, migrate(payload));
        }
      }
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
    }
  } catch {
    /* storage unavailable (private mode / quota) — app runs with defaults */
  }
}

/** Read and parse a JSON value, returning the fallback when the payload is unusable. */
export function readJson<T>(key: string, fallback: T, isValid?: (value: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (isValid && !isValid(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/** Write a JSON value, ignoring quota or serialization failures. */
export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage blocked */
  }
}

/** Remove a stored value, ignoring storage failures. */
export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage blocked */
  }
}
