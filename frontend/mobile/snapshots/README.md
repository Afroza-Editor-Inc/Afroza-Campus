Snapshots and previews for UI components.

How to capture (quick):
- Mobile (Expo): run app and capture screenshots on a device or emulator.
- Web: open `http://localhost:3000` and capture screenshots.

Automated pipelines (recommended):
- Use Storybook + Chromatic or Percy for visual diffs.
- For web, use Playwright to capture deterministic screenshots (see `frontend/web/tests/snapshots.spec.ts`).
- For mobile, run Storybook for React Native and connect to Percy or use Detox/Appium for full app screenshots.

Included placeholders:
- snapshot-home.png
- snapshot-profile.png

See `CAPTURE_GUIDE.md` for details and recommended configurations.