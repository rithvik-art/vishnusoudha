import { test } from '@playwright/test';
import { openViewer, ensureCanvasVisible, waitForPanoRequest } from './helpers/pano.js';

test.describe('Soak: repeated UI and navigation resilience', () => {
  test.setTimeout(180_000);

  test('stress toggles + reloads + experience switches', async ({ page }) => {
    await openViewer(page);
    const info = test.info();

    const btnMini = page.locator('#btnMini');
    const btnMirror = page.locator('#btnMirror');
    const btnLeft = page.locator('#btnLeft');
    const btnRight = page.locator('#btnRight');
    const btnUp = page.locator('#btnUp');
    const btnDown = page.locator('#btnDown');
    const zoomIn = page.locator('#btnZoomIn, #zoomIn');
    const zoomOut = page.locator('#btnZoomOut, #zoomOut');
    const sel = page.locator('#expSelectLive');

    const loops = 30;
    for (let i = 0; i < loops; i += 1) {
      if (await btnMini.isVisible().catch(() => false)) await btnMini.click().catch(() => {});
      if (await btnMirror.isVisible().catch(() => false)) await btnMirror.click().catch(() => {});
      if (await btnLeft.isVisible().catch(() => false)) await btnLeft.click().catch(() => {});
      if (await btnRight.isVisible().catch(() => false)) await btnRight.click().catch(() => {});
      if (await btnUp.isVisible().catch(() => false)) await btnUp.click().catch(() => {});
      if (await btnDown.isVisible().catch(() => false)) await btnDown.click().catch(() => {});
      if (await zoomIn.isVisible().catch(() => false)) await zoomIn.click().catch(() => {});
      if (await zoomOut.isVisible().catch(() => false)) await zoomOut.click().catch(() => {});

      if (i % 5 === 0) {
        if (await sel.isVisible().catch(() => false)) {
          const opts = await sel.locator('option').all();
          if (opts.length) {
            const pick = opts[(i / 5) % opts.length];
            const value = await pick.getAttribute('value');
            if (value) {
              await sel.selectOption(value);
              await waitForPanoRequest(page, 20_000);
            }
          }
        }
      }

      if (i % 10 === 0) {
        try {
          await page.reload({ waitUntil: 'load', timeout: 60_000 });
        } catch (error) {
          info.annotations.push({
            type: 'warning',
            description: `Reload timed out on iteration ${i}; attempting fresh navigation.`,
          });
          try {
            await page.goto(page.url(), { waitUntil: 'load', timeout: 60_000 });
          } catch {}
        }
        await ensureCanvasVisible(page);
        await waitForPanoRequest(page, 20_000);
      }
    }

    await ensureCanvasVisible(page);
  });
});
