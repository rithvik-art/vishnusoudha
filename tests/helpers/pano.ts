import { Page, Response, expect } from '@playwright/test';

export async function waitForPanoRequest(page: Page, timeout = 15000): Promise<Response | null> {
  const match = (url: string) => /\/panos(\-mobile(\-6k)?)?\//i.test(new URL(url, page.url()).pathname);
  try {
    const resp = await page.waitForResponse(
      (r) => match(r.url()) && r.status() === 200,
      { timeout }
    );
    return resp;
  } catch {
    return null;
  }
}

export async function waitForOverlayHidden(page: Page) {
  const overlay = page.locator('#preloadOverlay');
  try {
    await expect(overlay).toBeHidden({ timeout: 15_000 });
  } catch {
    // If overlay exists but is displayed via aria-busy, wait for it to clear
    try { await expect(overlay).toHaveAttribute('aria-busy', /^(?!true)/, { timeout: 5_000 }); } catch {}
  }
}

export async function ensureCanvasVisible(page: Page) {
  const canvas = page.locator('#renderCanvas');
  await expect(canvas).toBeVisible({ timeout: 15000 });
  const box = await canvas.boundingBox();
  expect(box?.width || 0).toBeGreaterThan(200);
  expect(box?.height || 0).toBeGreaterThan(200);
}

export async function openViewer(page: Page, params: Record<string,string|number|boolean> = {}){
  const usp = new URLSearchParams({ role: 'viewer', ...Object.fromEntries(Object.entries(params).map(([k,v])=>[k,String(v)])) });
  const url = `/?${usp.toString()}`;
  await page.goto(url, { waitUntil: 'load' });
  await ensureCanvasVisible(page);
  await waitForOverlayHidden(page);
  await waitForPanoRequest(page);
}

export async function openGuide(page: Page, params: Record<string,string|number|boolean> = {}){
  const usp = new URLSearchParams({ role: 'guide', ...Object.fromEntries(Object.entries(params).map(([k,v])=>[k,String(v)])) });
  const url = `/?${usp.toString()}`;
  await page.goto(url, { waitUntil: 'load' });
  await waitForOverlayHidden(page);
}

