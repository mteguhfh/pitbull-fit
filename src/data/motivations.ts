import { Language } from '../utils/i18n';

export interface FitnessMotivation {
  id: string;
  en: string;
  id_lang: string;
}

export const FITNESS_MOTIVATIONS: FitnessMotivation[] = [
  {
    id: 'm1',
    en: 'Discipline is the bridge between goals and accomplishment.',
    id_lang: 'Disiplin adalah jembatan antara tujuan dan pencapaian nyata.'
  },
  {
    id: 'm2',
    en: "Today's heavy load is tomorrow's warmup. Keep pushing!",
    id_lang: 'Beban berat hari ini adalah pemanasanmu esok hari. Terus berjuang!'
  },
  {
    id: 'm3',
    en: 'Consistency beats motivation. Finish that final set!',
    id_lang: 'Konsistensi selalu mengalahkan motivasi. Tuntaskan set terakhirmu!'
  },
  {
    id: 'm4',
    en: 'The last rep when you want to quit is where true growth begins.',
    id_lang: 'Satu repetisi lagi saat ingin menyerah adalah tempat otot bertumbuh.'
  },
  {
    id: 'm5',
    en: "Your body can stand almost anything; it's your mind you have to convince.",
    id_lang: 'Tubuhmu sanggup melewati apa pun; pikiranmu yang perlu diyakinkan.'
  },
  {
    id: 'm6',
    en: 'The pain of discipline is temporary, the pride of progress lasts forever.',
    id_lang: 'Rasa lelah latihan bersifat sementara, kebanggaan hasil bertahan selamanya.'
  },
  {
    id: 'm7',
    en: 'Small daily improvements over time lead to stunning transformations.',
    id_lang: 'Kemajuan kecil setiap hari menghasilkan lompatan besar dari waktu ke waktu.'
  },
  {
    id: 'm8',
    en: "Don't compete with others. Beat the person you were yesterday.",
    id_lang: 'Jangan bandingkan dirimu dengan orang lain. Kalahkan dirimu yang kemarin.'
  },
  {
    id: 'm9',
    en: 'Showing up on the days you do not feel like it builds true champions.',
    id_lang: 'Tetap hadir berlatih saat sedang malas adalah kunci mental juara sejati.'
  },
  {
    id: 'm10',
    en: 'Every single drop of sweat is an investment in your best self.',
    id_lang: 'Setiap tetes keringat adalah investasi menuju versi terbaik dari dirimu.'
  },
  {
    id: 'm11',
    en: 'Strength is not given. It is forged rep by rep, day by day.',
    id_lang: 'Kekuatan tidak datang gratis. Ia ditempa set demi set, hari demi hari.'
  },
  {
    id: 'm12',
    en: 'Action creates motivation, never wait for motivation to act.',
    id_lang: 'Aksi melahirkan motivasi, jangan tunggu termotivasi baru mulai bergerak.'
  }
];

export function getDailyMotivationIndex(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return Math.abs(dayOfYear) % FITNESS_MOTIVATIONS.length;
}

export function getMotivationText(index: number, lang: Language): string {
  const item = FITNESS_MOTIVATIONS[index % FITNESS_MOTIVATIONS.length] || FITNESS_MOTIVATIONS[0];
  return lang === 'id' ? item.id_lang : item.en;
}
