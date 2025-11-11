import { test, expect } from '@playwright/test';
import { openGuide, openViewer, waitForPanoRequest } from './helpers/pano.js';

test.describe('Guide ↔ Viewer sync smoke (best effort)', () => {
  test.setTimeout(120_000);

  test('viewer follows guide node changes (if WS available)', async ({ browser }) => {
    const room = `pw-${Math.random().toString(36).slice(2, 8)}`;

    const guideCtx = await browser.newContext();
    const viewerCtx = await browser.newContext();
    const guide = await guideCtx.newPage();
    const viewer = await viewerCtx.newPage();

    await openGuide(guide, { room });
    await openViewer(viewer, { room });

    const btn = guide.locator('#tourToggle, #tourPause');
    if (await btn.count()) {
      await btn.click().catch(() => {});
    } else {
      await guide.evaluate(async () => {
        try {
          const tour = window.__tour;
          if (tour?.start) await tour.start();
        } catch {
          /* ignore */
        }
      });
    }

    const resp = await waitForPanoRequest(viewer, 25_000);
    expect.soft(!!resp).toBeTruthy();

    await guideCtx.close();
    await viewerCtx.close();
  });
});

