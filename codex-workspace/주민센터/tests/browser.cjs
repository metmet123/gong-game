'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.join(root,'전입신고_퍼즐시안.html')).href);
    await page.screenshot({path:path.join(root,'전입신고_시안_PC.png'),fullPage:true});
    const cases=await page.evaluate(()=>MoveIn.cases.map(c=>({id:c.id,movers:c.movers,mode:c.mode,head:c.head,address:c.newAddress,relations:c.relations})));
    async function read(){for(const doc of ['report','identity']){await page.locator(`[data-doc="${doc}"]`).click();assert(await page.locator('#info-dialog').isVisible());await page.locator('#dialog-done').click();}}
    async function draft(c){await page.locator(`[data-case="${c.id}"]`).click();await read();for(const id of c.movers)await page.locator(`[data-select="${id}"]`).click();await page.locator('#move-btn').click();await page.locator('#new-address').selectOption(c.address);await page.locator(`[data-mode="${c.mode}"]`).click();if(c.mode==='new')await page.locator('#head-select').selectOption(c.head);for(const id of c.movers.filter(id=>id!==c.head))await page.locator(`[data-relation="${id}"]`).selectOption(c.relations[id]);}
    for(const c of cases){await draft(c);await page.locator('#check-btn').click();assert(await page.locator('#submit-btn').isVisible());await page.locator('#submit-btn').click();assert(await page.locator('#result-dialog').isVisible());assert((await page.locator('#result-body').innerText()).includes('새 주소에 도착했습니다.'));await page.locator('[data-result="back"]').click();console.log('PASS browser completion '+c.id);}
    await draft(cases[1]);await page.locator('#new-address').selectOption('모퉁이로 12 · 201호');await page.locator('#check-btn').click();assert(await page.locator('[data-target="address"]').isVisible());assert(!await page.locator('#submit-btn').isVisible());await page.locator('#new-address').selectOption(cases[1].address);await page.locator('#check-btn').click();assert(await page.locator('#submit-btn').isVisible());await page.screenshot({path:path.join(root,'전입신고_시안_검토.png'),fullPage:true});await page.locator('[data-return="bo"]').click();assert(!await page.locator('#submit-btn').isVisible());await page.locator('#undo-btn').click();assert(await page.locator('[data-return="bo"]').isVisible());console.log('PASS browser correction and undo');
    await page.locator('[data-case="part"]').click();await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(root,'전입신고_시안_모바일.png'),fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    await draft(cases[1]);assert(await page.locator('#after-board').isVisible());assert(!await page.locator('#before-board').isVisible());await page.locator('#check-btn').click();await page.locator('#submit-btn').click();assert(await page.locator('#result-dialog').isVisible());await page.locator('[data-result="next"]').click();assert((await page.locator('#desk-title').innerText()).includes('친구'));console.log('PASS mobile completion and next resident');
    assert.deepEqual(errors,[]);console.log('PASS no browser script errors');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
