import { expect } from '@playwright/test';

const panoRe = /\/panos(-mobile(-6k)?)?\//i;

export async function waitForPanoRequest(page, timeout = 15000) {
  try {
    return await page.waitForResponse(
      (resp) => {
        try {
          const url = new URL(resp.url(), page.url());
          return panoRe.test(url.pathname) && resp.status() === 200;
        } catch {
          return false;
        }
      },
      { timeout }
    );
  } catch {
    return null;
  }
}

export async function waitForOverlayHidden(page) {
  const overlay = page.locator('#preloadOverlay');
  try {
    await expect(overlay).toBeHidden({ timeout: 15_000 });
  } catch {
    try {
      await expect(overlay).toHaveAttribute('aria-busy', /^(?!true)/, { timeout: 5_000 });
    } catch {
      /* ignore */
    }
  }
}

export async function ensureCanvasVisible(page) {
  const canvas = page.locator('#renderCanvas');
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  const box = await canvas.boundingBox();
  expect((box?.width || 0)).toBeGreaterThan(200);
  expect((box?.height || 0)).toBeGreaterThan(200);
}

export async function openViewer(page, params = {}) {
  const usp = new URLSearchParams({ role: 'viewer' });
  for (const [k, v] of Object.entries(params)) usp.set(k, String(v));
  await page.goto(`/?${usp.toString()}`, { waitUntil: 'load' });
  await ensureCanvasVisible(page);
  await waitForOverlayHidden(page);
  await waitForPanoRequest(page);
}

export async function openGuide(page, params = {}) {
  const usp = new URLSearchParams({ role: 'guide' });
  for (const [k, v] of Object.entries(params)) usp.set(k, String(v));
  await page.goto(`/?${usp.toString()}`, { waitUntil: 'load' });
  await waitForOverlayHidden(page);
}

