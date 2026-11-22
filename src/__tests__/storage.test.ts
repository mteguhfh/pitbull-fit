// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  STORAGE_KEYS,
  STORAGE_VERSION,
  STORAGE_VERSION_KEY,
  ensureStorageVersion,
  readJson,
  writeJson,
  removeKey
} from '../utils/storage';

class MemoryStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  key(i: number) {
    return Array.from(this.store.keys())[i] ?? null;
  }
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, String(v));
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

// @vitest-environment jsdom
describe('storage helpers', () => {
  let memory: MemoryStorage;

  beforeEach(() => {
    memory = new MemoryStorage();
    vi.stubGlobal('localStorage', memory);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes the current schema version on first run but keeps legacy data', () => {
    memory.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([{ id: 'old' }]));

    ensureStorageVersion();

    expect(memory.getItem(STORAGE_VERSION_KEY)).toBe(String(STORAGE_VERSION));
    expect(readJson(STORAGE_KEYS.HISTORY, [])).toEqual([{ id: 'old' }]);
  });

  it('wipes data written by a newer build (downgrade) instead of crashing', () => {
    memory.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION + 1));
    memory.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'light' }));

    ensureStorageVersion();

    expect(memory.getItem(STORAGE_KEYS.SETTINGS)).toBeNull();
    expect(memory.getItem(STORAGE_VERSION_KEY)).toBe(String(STORAGE_VERSION));
  });

  it('returns the fallback for corrupt JSON', () => {
    memory.setItem(STORAGE_KEYS.SETTINGS, '{not json');
    expect(readJson(STORAGE_KEYS.SETTINGS, { theme: 'dark' })).toEqual({ theme: 'dark' });
  });

  it('applies a shape validator and falls back when the payload is wrong', () => {
    memory.setItem(STORAGE_KEYS.HISTORY, JSON.stringify({ nope: true }));
    expect(readJson(STORAGE_KEYS.HISTORY, [], Array.isArray)).toEqual([]);
  });

  it('writeJson and removeKey never throw on a broken storage', () => {
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('blocked');
      }
    } as unknown as Storage;
    vi.stubGlobal('localStorage', broken);

    expect(() => writeJson(STORAGE_KEYS.SETTINGS, { theme: 'dark' })).not.toThrow();
    expect(() => removeKey(STORAGE_KEYS.SETTINGS)).not.toThrow();
    expect(() => ensureStorageVersion()).not.toThrow();
  });
});
