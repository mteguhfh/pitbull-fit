import { test, expect } from '@playwright/test';

const TABS = [
  { label: 'Latihan', heading: /Workout Planner|Sesi Aktif/i },
  { label: 'Gerakan', heading: /GERAKAN/i },
  { label: 'Profil', heading: /PROFIL/i },
  { label: 'Beranda', heading: /PITBULL/i },
];

test('app boots and every tab renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Skip the first-run onboarding carousel.
  await page.addInitScript(() => {
    localStorage.setItem('pitbull_settings', JSON.stringify({ hasSeenOnboarding: true }));
  });

  await page.goto('/');
  await expect(page.getByText('PITBULL')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Beranda' })).toBeVisible();

  for (const { label, heading } of TABS) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByText(heading).first()).toBeVisible();
  }

  expect(errors).toEqual([]);
});
