'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(require.resolve('playwright', { paths: ['C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'] }));
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400) errors.push(r.url() + ': ' + r.status()); });
    await page.goto(pathToFileURL(path.join(__dirname, 'E01_화면과상세기획.html')).href);
    await page.locator('.gallery').scrollIntoViewIfNeeded();
    await page.locator('.gallery img').last().scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.gallery img').count(), 8);
    const imagesLoaded = await page.locator('.gallery img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0));
    assert(imagesLoaded, 'all eight actual screen captures load');
    assert(await page.frameLocator('iframe').locator('#scene-title').isVisible(), 'interactive mockup loads in reader');
    assert.equal(errors.length, 0, errors.join('\n'));
    await page.locator('.gallery').screenshot({ path: path.join(__dirname, 'mockup_screens', 'screen-gallery.png') });
    const rules = JSON.parse(fs.readFileSync(path.join(__dirname, 'E01_mockup_validation.json')));
    const ui = JSON.parse(fs.readFileSync(path.join(__dirname, 'E01_browser_validation.json')));
    const contract = JSON.parse(fs.readFileSync(path.join(__dirname, 'E01_contract.json')));
    assert(rules.passed && ui.passed && contract.version === 2 && contract.legacyLogicReuse === false);
    console.log(JSON.stringify({ readerLoaded: true, screenshotImagesLoaded: 8, embeddedMockupLoaded: true, browserErrors: errors }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
