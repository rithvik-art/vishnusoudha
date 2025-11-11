import { test } from '@playwright/test';
import { ensureCanvasVisible, openViewer, waitForOverlayHidden, waitForPanoRequest } from './helpers/pano.js';

test.describe('Mobile smoke: viewer basic flows', () => {
  test('loads viewer, switches experiences, toggles UI, handles reload', async ({ page }) => {
    await openViewer(page);

    const btnMini = page.locator('#btnMini');
    const btnMirror = page.locator('#btnMirror');

    if (await btnMini.isVisible().catch(() => false)) {
      await btnMini.click().catch(() => {});
      await btnMini.click().catch(() => {});
    }
    if (await btnMirror.isVisible().catch(() => false)) {
      await btnMirror.click().catch(() => {});
      await btnMirror.click().catch(() => {});
    }

    const sel = page.locator('#expSelectLive');
    if (await sel.isVisible().catch(() => false)) {
      const options = await sel.locator('option').all();
      for (let i = 0; i < Math.min(5, options.length); i += 1) {
        const value = await options[i].getAttribute('value');
        if (!value) continue;
        await sel.selectOption(value);
        await waitForPanoRequest(page, 20_000);
        await ensureCanvasVisible(page);
        await waitForOverlayHidden(page);
      }
    }

    const size = page.viewportSize();
    if (size) {
      await page.setViewportSize({ width: size.height, height: size.width });
      await ensureCanvasVisible(page);
      await page.setViewportSize(size);
    }

    await page.reload();
    await ensureCanvasVisible(page);
    await waitForOverlayHidden(page);
    await waitForPanoRequest(page, 20_000);
  });
});

