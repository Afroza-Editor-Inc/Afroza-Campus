Detox on CI notes:

- GitHub Actions runner must have an emulator available; the provided workflow uses `Pixel_3a_API_30` AVD.
- You may need to preinstall system images or use actions that provide Android emulators.
- For iOS Detox, use macOS runners with proper signing / Xcode setup.

Test: `npm run detox:build && npm run detox:test` (runs emulator and executes tests).