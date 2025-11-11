import { test, expect } from '@playwright/test';
import { ensureCanvasVisible, openViewer, waitForOverlayHidden, waitForPanoRequest } from './helpers/pano';

test.describe('Mobile smoke: viewer basic flows', () => {
  test('loads viewer, iterates experiences, toggles UI, handles reload', async ({ page, browserName }) => {
    await openViewer(page, {});

    // Toggle minimap and mirror if present
    const btnMini = page.locator('#btnMini');
    const btnMirror = page.locator('#btnMirror');
    if (await btnMini.isVisible().catch(()=>false)) { await btnMini.click().catch(()=>{}); await btnMini.click().catch(()=>{}); }
    if (await btnMirror.isVisible().catch(()=>false)) { await btnMirror.click().catch(()=>{}); await btnMirror.click().catch(()=>{}); }

    // Iterate live experience dropdown
    const sel = page.locator('#expSelectLive');
    if (await sel.isVisible().catch(()=>false)) {
      const options = await sel.locator('option').all();
      for (let i = 0; i < Math.min(5, options.length); i++) {
        const value = await options[i].getAttribute('value');
        if (!value) continue;
        await sel.selectOption(value);
        // Wait for the walkthrough and at least one pano
        await waitForPanoRequest(page, 20_000);
        await ensureCanvasVisible(page);
        await waitForOverlayHidden(page);
      }
    }

    // Orientation simulation: swap viewport size
    const size = page.viewportSize();
    if (size) {
      await page.setViewportSize({ width: size.height, height: size.width });
      await ensureCanvasVisible(page);
      await page.setViewportSize(size);
    }

    // Reload to emulate tab background/foreground recovery
    await page.reload();
    await ensureCanvasVisible(page);
    await waitForOverlayHidden(page);
    await waitForPanoRequest(page, 20_000);
  });
});
