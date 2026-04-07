describe('App', () => {
  it('opens and shows feed', async () => {
    await device.launchApp();
    await expect(element(by.text('Accueil — Feed (placeholder)'))).toBeVisible();
  });
});