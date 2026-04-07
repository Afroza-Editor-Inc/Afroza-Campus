Guide rapide — Capturer des snapshots UI

Objectif: automatiser et standardiser les screenshots UI pour revue visuelle.

Options recommandées (rapide):

1) Storybook + Chromatic / Percy
- Installer Storybook pour React Native (ou Storybook for Web pour la version web).
- Créer stories pour composants clés (`PostCard`, `StoryList`, `Header`, `Profile`).
- Intégrer Chromatic (getstorybook.com) ou Percy pour PR visual diffs.

2) Playwright (Web)
- Installer Playwright: `npm i -D @playwright/test`.
- Exemple de test `frontend/web/tests/snapshots.spec.ts` (see repo) qui capture `page.screenshot()`.
- Commande: `npx playwright test --project=chromium --update-snapshots`.

3) App snapshots (Mobile)
- For native mobile: use `Detox` (Android/iOS) or `Appium`.
- Alternative simpler: run on emulator and capture screenshots via `adb` / `xcrun simctl io booted screenshot`.

Tips:
- Keep a stable data set (mock data) to ensure deterministic visuals.
- Use consistent screen sizes and device pixel ratios for snapshots.
- Automate as part of CI to run on PRs and block unexpected visual regressions.

Examples: add Storybook stories for `PostCard` and `Profile` then connect to Percy or Chromatic for automatic diffs.