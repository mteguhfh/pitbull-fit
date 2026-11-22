# Panduan Kontribusi

Terima kasih sudah mau membantu. Ikuti langkah di bawah supaya perubahan mudah
direview dan tidak merusak build.

## Lingkungan

- Node.js 20 atau lebih baru
- npm (lockfile yang dipakai: `package-lock.json`)

```bash
npm ci
npm run dev
```

## Sebelum membuka Pull Request

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript tanpa emit
npm test            # unit test (vitest)
npm run build       # pastikan production build sukses
npm run test:e2e    # smoke test Playwright (opsional, butuh browser)
```

CI menjalankan semua langkah di atas, kecuali `lint` dan `typecheck` yang saat ini
dipisah agar bisa dijalankan cepat secara lokal.

## Gaya kode

- TypeScript strict, tanpa `any` baru bila masih bisa dihindari.
- Format otomatis dengan Prettier: `npm run format`.
- Satu komponen per file di `src/components`, hook di `src/hooks`, helper murni di `src/utils`.
- Teks UI baru harus punya entri di `src/utils/i18n.ts` untuk bahasa Indonesia dan Inggris.

## Data lokal

Semua state pengguna disimpan di `localStorage` dengan prefix `pitbull_` melalui
`src/utils/storage.ts`. Kalau mengubah bentuk data yang tersimpan:

1. Naikkan `STORAGE_VERSION` di `src/utils/storage.ts`.
2. Tambahkan fungsi migrasi di objek `MIGRATIONS` untuk versi sebelumnya.
3. Tambahkan tes di `src/__tests__/storage.test.ts`.

## Commit dan rilis

- Commit memakai [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Catat perubahan yang terlihat pengguna di `docs/CHANGELOG.md` bagian `Unreleased`.
- Rilis: naikkan versi di `package.json`, pindahkan catatan changelog ke versi baru,
  lalu buat tag `vX.Y.Z`.
