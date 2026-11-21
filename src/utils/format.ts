import type { Language } from './i18n';

const LOCALE: Record<Language, string> = {
  id: 'id-ID',
  en: 'en-US',
};

export function formatNumber(value: number, language: Language = 'id'): string {
  return Math.round(value).toLocaleString(LOCALE[language] ?? 'id-ID');
}

export function formatVolume(value: number, language: Language = 'id'): string {
  return formatNumber(value, language);
}

export function formatWeight(value: number, language: Language = 'id'): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded.toLocaleString(LOCALE[language] ?? 'id-ID', {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

/** Compact session length: `45m`, `1h 39m`, `4h 0m`. Never shows `240:12`. */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatVolumeShort(value: number, language: Language = 'id'): string {
  if (value < 10000) return formatNumber(value, language);
  return `${formatWeight(value / 1000, language)}k`;
}
