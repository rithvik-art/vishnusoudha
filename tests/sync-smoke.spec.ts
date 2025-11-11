import { test, expect, chromium, webkit, BrowserContext } from '@playwright/test';
import { openGuide, openViewer, waitForPanoRequest } from './helpers/pano';

test.describe('Guide ↔ Viewer sync smoke (best effort)', () => {
  test.setTimeout(120_000);

  test('viewer follows guide node changes (if WS available)', async ({ browser }) => {
    const room = 'pw-' + Math.random().toString(36).slice(2, 8);

    const guide = await browser.newContext();
    const viewer = await browser.newContext();
    const gp = await guide.newPage();
    const vp = await viewer.newPage();

    // Open pages
    await openGuide(gp, { room });
    await openViewer(vp, { room });

    // Try to start tour from Guide UI
    const btn = gp.locator('#tourToggle, #tourPause');
    if (await btn.count()) {
      await btn.click().catch(()=>{});
    } else {
      // Fallback: try to call into exposed tour API if present
      await gp.evaluate(async () => { try { // @ts-ignore
        const t = (window as any).__tour; if (t && t.start) await t.start();
      } catch {} });
    }

    // During a short period, expect the viewer to fetch additional panos
    const resp = await waitForPanoRequest(vp, 25_000);
    expect.soft(!!resp).toBeTruthy(); // Soft: don’t fail entire suite if WS infra is down

    await guide.close();
    await viewer.close();
  });
});

