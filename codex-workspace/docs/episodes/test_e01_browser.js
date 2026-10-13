'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.E01_NODE_MODULES || 'C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'] }));

(async () => {
  const output = path.join(__dirname, 'mockup_screens'); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1040 }, reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [], geometry = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  const url = pathToFileURL(path.join(__dirname, 'E01_플레이목업.html')).href;
  await page.goto(url);
  const click = selector => page.locator(selector).click();
  const action = (type, id) => click('[data-action="' + type + '"]' + (id ? '[data-id="' + id + '"]' : ''));
  const capture = async stage => {
    await page.screenshot({ path: path.join(output, String(stage + 1).padStart(2, '0') + '-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, String(stage + 1).padStart(2, '0') + '-mobile.png'), fullPage: true });
    const metrics = await page.evaluate(() => ({ width: window.innerWidth, contentWidth: document.documentElement.scrollWidth, title: document.getElementById('scene-title').textContent }));
    assert(metrics.contentWidth <= metrics.width, 'mobile page must not overflow: ' + metrics.title); geometry.push(metrics);
    await page.setViewportSize({ width: 1440, height: 1040 });
  };
  const commit = async () => { await click('#check'); assert(await page.locator('#commit').isEnabled(), await page.locator('#feedback').textContent()); await click('#commit'); };
  const getSaved = () => page.evaluate(() => JSON.parse(localStorage.getItem('gong-e01-independent-mockup-v2')));
  try {
    await click('#play-mode');
    await click('[data-action="chips"][data-delta="10"]'); await click('[data-action="chips"][data-delta="10"]');
    await action('option', 'stand'); await action('quote'); await click('[data-action="chips"][data-delta="1"]'); await click('[data-action="chips"][data-delta="1"]');
    await capture(0); await commit();
    for (const field of ['quantity', 'unit', 'version', 'estimate', 'specimen']) { await click('[data-select="document"][data-id="' + field + '"]'); await click('[data-target="document"][data-field="' + field + '"]'); }
    await capture(1); await commit();
    await action('visit', 'director'); assert((await page.locator('#feedback').textContent()).includes('계장')); await action('visit', 'cooperation'); await action('visit', 'printer');
    await action('print', 'estimate-v1'); assert((await page.locator('#feedback').textContent()).includes('구버전')); await action('print', 'estimate-v2'); await action('print', 'specimen-v2');
    await action('visit', 'chief'); await action('visit', 'director'); await capture(2); await commit();
    for (let box = 1; box <= 3; box++) { await click('[data-box="' + box + '"]'); await page.locator('[data-bundle]').first().click(); await click('[data-same]'); await click('[data-classify="good"]'); }
    await click('[data-box="4"]'); await click('[data-bundle="M16"]'); await click('[data-classify="good"]');
    await click('[data-bundle="M17"]'); await click('[data-same]'); await capture(3); await click('[data-classify="bad"]');
    await action('replace'); await click('[data-box="5"]'); await page.locator('[data-bundle]').first().click(); await click('[data-same]'); await click('[data-classify="good"]'); await commit();
    for (const [slot, id] of Object.entries({ contract: 'contract', invoice: 'invoice-v2', inspection: 'inspection' })) { await click('[data-select="payment"][data-id="' + id + '"]'); await click('[data-slot="' + slot + '"]'); }
    await capture(4); await commit();
    for (const id of ['register', 'receipt', 'testimony', 'holding']) await action('clue', id);
    await page.locator('#complaint-cause').selectOption('intermediate'); await action('pickup'); await capture(5);
    // No old edit snapshot may undo an executed transfer.
    assert(await page.locator('#undo').isDisabled(), 'pickup clears draft undo');
    await click('[data-deliver="branchB"]'); await action('receipt'); assert(await page.locator('#undo').isDisabled(), 'receipt preserves committed delivery'); await commit();
    for (const row of ['R1', 'R2']) { await click('[data-select="row"][data-id="' + row + '"]'); await click('[data-link="PAY-E01-PRINT"]'); }
    await page.locator('#settlement-cause').selectOption('duplicate'); await click('[data-exclude="R2"]'); await capture(6); await commit(); await capture(7);
    let saved = await getSaved(); assert(saved.stage === 7 && saved.ledger['PAY-E01-PRINT'].amount === 220000 && saved.distribution.branchB === 60);
    await page.reload(); saved = await getSaved(); assert(saved.stage === 7 && Object.keys(saved.ledger).length === 2, 'reload preserves single payments and final result');
    // Completed scenes are read-only; return to the current stage without altering money.
    await click('[data-stage="0"]'); assert(await page.locator('[data-action="chips"][data-delta="10"]').isDisabled()); await click('[data-stage="7"]');
    await click('#gallery-mode');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (let stage = 0; stage < 8; stage++) {
        await click('[data-stage="' + stage + '"]');
        const m = await page.evaluate(() => ({ width: window.innerWidth, contentWidth: document.documentElement.scrollWidth, title: document.getElementById('scene-title').textContent }));
        assert(m.contentWidth <= m.width, 'layout overflow at ' + width + ' / ' + m.title); geometry.push(m);
      }
    }
    assert.equal(errors.length, 0, errors.join('\n'));
    const report = { passed: true, fullUiPlaythrough: 'stand', refreshRestored: true, undoCannotReverseTransfers: true, completedScenesReadOnly: true, screenshots: 16, layoutChecks: geometry, browserErrors: errors };
    fs.writeFileSync(path.join(__dirname, 'E01_browser_validation.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify({ passed: true, screenshots: 16, layoutChecks: geometry.length, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
