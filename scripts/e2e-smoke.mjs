/**
 * Browser smoke test for the Lab 4 CRUD flow.
 *
 * Requires the dev server on http://localhost:8100 and a local Chrome install.
 * Run with: npm run e2e:smoke
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const CHROME =
  process.env['CHROME_PATH'] ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env['APP_URL'] ?? 'http://localhost:8100';
const SHOTS = join(process.cwd(), 'docs', 'screenshots');
const ITEM_NAME = 'Garlic Butter Shrimp';
const UPDATED_NAME = 'Garlic Butter Shrimp (Updated)';

mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 430, height: 900 },
  deviceScaleFactor: 2,
});

const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

async function shot(name) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: join(SHOTS, name), fullPage: false });
  console.log(`screenshot: docs/screenshots/${name}`);
}

try {
  // Firestore keeps a long-lived stream open, so `networkidle` never fires.
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.locator('app-tab1').waitFor();
  await page.waitForTimeout(800);
  await shot('01-add-form.png');

  await page
    .locator('ion-input[data-testid="item-name"] input')
    .fill(ITEM_NAME);
  await page
    .locator('ion-input[data-testid="item-price"] input')
    .fill('325');
  await page
    .locator('ion-textarea[data-testid="item-description"] textarea')
    .fill('Shrimp sautéed in garlic butter, served with rice.');
  await shot('02-add-form-filled.png');

  await page.locator('ion-button[data-testid="save-item"]').click();
  await page.waitForTimeout(1200);
  await shot('03-item-added.png');

  await page.locator('ion-tab-button[tab="tab2"]').click();
  await page.locator('app-tab2').waitFor();
  await page.getByText(ITEM_NAME, { exact: true }).first().waitFor();
  await shot('04-items-list.png');

  // Search enhancement.
  await page.locator('ion-searchbar[data-testid="search-items"] input').fill('shrimp');
  await page.waitForTimeout(500);
  const visibleRows = await page.locator('ion-item-sliding').count();
  if (visibleRows !== 1) {
    throw new Error(`Search should leave 1 row, found ${visibleRows}.`);
  }
  await page.locator('ion-searchbar[data-testid="search-items"] input').fill('');
  await page.waitForTimeout(400);

  // Update through the modal.
  await page.locator('ion-button[data-testid="edit-item"]').first().click();
  await page.locator('ion-modal').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await shot('05-edit-modal.png');

  await page
    .locator('ion-input[data-testid="edit-name"] input')
    .fill(UPDATED_NAME);
  await page.locator('ion-button[data-testid="save-edit"]').click();
  await page.waitForTimeout(1200);
  await page.getByText(UPDATED_NAME, { exact: true }).first().waitFor();
  await shot('06-item-updated.png');

  // Delete through the sliding option.
  await page
    .locator('ion-item-sliding')
    .first()
    .evaluate((element) => element.open('end'));
  await page.waitForTimeout(500);
  await shot('07-delete-slide.png');
  await page.locator('ion-item-option[data-testid="delete-item"]').first().click();
  await page.waitForTimeout(1200);
  if ((await page.getByText(UPDATED_NAME, { exact: true }).count()) !== 0) {
    throw new Error('Deleted item is still visible.');
  }

  // About tab.
  await page.locator('ion-tab-button[tab="tab3"]').click();
  await page.locator('app-tab3').waitFor();
  await shot('08-about.png');

  // Desktop view for the report.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('ion-tab-button[tab="tab2"]').click();
  await page.waitForTimeout(600);
  await shot('09-items-desktop.png');

  if (pageErrors.length > 0) {
    throw new Error(`Browser errors:\n${pageErrors.join('\n')}`);
  }

  console.log('CRUD smoke test passed: create, read, search, update, delete.');
} finally {
  await browser.close();
}
