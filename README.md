# Pitbull Fit

Aplikasi strength training untuk web dan mobile — program latihan beban, anatomi otot interaktif, rest timer, dan tracking progres. Dibangun dengan React + TypeScript, jalan sebagai PWA di browser dan sebagai app native lewat Capacitor.

## Fitur

- **Program latihan** — sesi workout per hari dengan set, rep, dan beban yang bisa diatur.
- **Anatomi interaktif** — peta otot SVG yang menyala sesuai otot yang dilatih.
- **Rest timer** — timer istirahat antar set, lengkap dengan notifikasi suara.
- **Riwayat & progres** — volume latihan, streak, dan ringkasan sesi.
- **Recovery & kalender mingguan** — pantau hari latihan dan istirahat.
- **Panduan gerakan** — modal detail dan video contoh per exercise.
- **Share story** — ekspor ringkasan sesi jadi gambar untuk dibagikan.
- **Tema gelap/terang** — tema liquid glass, plus dukungan bahasa (i18n).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Capacitor · Vitest

## Menjalankan

```bash
npm install
npm run dev        # web dev server
npm test           # unit tests
npm run build      # build production (web)
```

Build mobile:

```bash
npm run cap:build
npx cap open android   # atau: npx cap open ios
```

## Struktur

```
src/
  components/   UI views & modal
  context/      state global (workout, settings)
  data/         data exercise & anatomi
  hooks/        custom hooks
  utils/        helper (i18n, bmi, format, audio)
  __tests__/    unit test
```

## Lisensi

Belum ditentukan.
