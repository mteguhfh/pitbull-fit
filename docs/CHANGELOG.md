# Changelog

Semua perubahan penting pada proyek ini dicatat di file ini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan
versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

### Akan datang

- Backup otomatis data latihan.

## [1.0.1] - 2026-11-22

### Diperbaiki

- Field umur, tinggi badan, dan berat badan di onboarding tidak bisa dihapus atau
  diketik ulang; setiap digit yang diketik langsung diganti ke batas minimum
  (mis. 17 menjadi 100), sehingga nilai tersimpan jadi tidak masuk akal.
  Input sekarang menyimpan teks sementara dan baru dibatasi saat field ditinggalkan
  atau saat profil disimpan.
- Field BMI & komposisi tubuh di Pengaturan punya bug yang sama, sekarang ikut diperbaiki
  dan ikut diperbarui ke satuan lbs saat unit diganti.
- Data lokal tidak lagi bisa membuat aplikasi gagal memuat: payload rusak atau dari
  build yang lebih baru dibuang, bukan dipakai mentah.
- Import backup divalidasi bentuknya sebelum dipakai.

### Ditambahkan

- Storage schema versioning (`pitbull_storage_version`) dengan jalur migrasi.
- ErrorBoundary dengan tombol muat ulang dan reset data lokal.
- Toast "versi baru tersedia" saat service worker baru menunggu.
- ESLint + Prettier (`npm run lint`, `npm run format`).
- Open Graph dan Twitter card (`public/og-image.png`), `robots.txt`, `sitemap.xml`.
- Tes untuk storage helper dan hook input angka (87 tes total).
- Dependabot dengan pengabaian upgrade major.

## [1.0.0] - 2026-11-22

### Ditambahkan

- Rilis pertama: program latihan, anatomi otot interaktif, rest timer, riwayat dan
  progres, kalender mingguan, panduan gerakan, share story, tema gelap/terang.
- PWA installable dengan dukungan offline.
- Build native Android dan iOS via Capacitor.
- CI (test, build, e2e smoke test) dan deploy otomatis ke GitHub Pages.
