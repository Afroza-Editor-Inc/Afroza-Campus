import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { toMatchSnapshot: { threshold: 0.2 } },
  use: { headless: true },
});