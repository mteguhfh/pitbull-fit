import { useState } from 'react';

interface Options {
  min?: number;
  max?: number;
  fallback: number;
  /** Allow fractional values (weight) instead of whole numbers only. */
  decimal?: boolean;
}

/**
 * Keeps the raw text while the user types so a field can be cleared and retyped,
 * then commits the number on blur. A plain `value={number}` with a clamp on every
 * keystroke rewrites "17" to the minimum ("100") as soon as it is typed, which is
 * why the profile fields used to jump to odd values.
 */
export function useNumericField(value: number, options: Options) {
  const { min, max, fallback, decimal = false } = options;

  const clamp = (raw: string): number => {
    const parsed = decimal ? parseFloat(raw) : parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return fallback;
    let next = parsed;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return decimal ? Math.round(next * 10) / 10 : next;
  };

  const sanitize = (raw: string): string =>
    decimal
      ? raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
      : raw.replace(/\D/g, '');

  // Same state-initializer pattern as the rest of the app: remember the last
  // committed number so external changes (unit toggle) reset the draft text.
  const [state, setState] = useState({ text: String(value), syncedValue: value });
  if (value !== state.syncedValue) {
    setState({ text: String(value), syncedValue: value });
  }

  const commit = (): number => {
    if (state.text.trim() === '') {
      setState((prev) => ({ text: String(fallback), syncedValue: prev.syncedValue }));
      return fallback;
    }
    const next = clamp(state.text);
    setState((prev) => ({ text: String(next), syncedValue: prev.syncedValue }));
    return next;
  };

  return {
    text: state.text,
    onChange: (raw: string) => setState((prev) => ({ ...prev, text: sanitize(raw) })),
    onBlur: commit,
    commit,
    setValue: (next: number) => setState({ text: String(next), syncedValue: next })
  };
}
