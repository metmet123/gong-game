const { chromium } = require('C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('url');
const path = require('path'); const fs = require('fs'); const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const issues=[];page.on('pageerror',e=>issues.push(e.message));
 const url=pathToFileURL(path.join(__dirname,'E01_묶음1_게임화면.html')).href;
 const out=path.join(__dirname,'pair_game_screens');fs.mkdirSync(out,{recursive:true});
 const click=sel=>page.locator(sel).click();
 const capture=async name=>{await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});};
 const metric=async scene=>page.evaluate(scene=>{const b=document.getElementById('board'),p=document.getElementById('primary');return{scene,width:innerWidth,height:innerHeight,pageHeight:document.documentElement.scrollHeight,pageWidth:document.documentElement.scrollWidth,boardHeight:b.clientHeight,boardContent:b.scrollHeight,primaryBottom:p.getBoundingClientRect().bottom};},scene);
 const geometry=[];
 await page.goto(url);await capture('01-budget-start');geometry.push(await metric('budget-start'));
 await click('[data-action="base"]');await click('[data-option="proof"]');await click('#primary');
 assert.match(await page.locator('.quote-note').textContent(),/단가/);
 assert(await page.locator('[data-action="topup"]').isEnabled());await capture('02-budget-event');
 // Adding 2 chips consumes all available reserve; adding an extra chip must fail visibly.
 await click('[data-action="topup"]');await click('[data-action="plus"]');assert.match(await page.locator('#message').textContent(),/부족/);
 await click('[data-option="proof"]');await click('[data-option="delivery"]');
 await click('#undo');assert.equal(await page.locator('[data-option="delivery"]').getAttribute('aria-pressed'),'false');
 await click('[data-option="stand"]');await capture('03-budget-ready');geometry.push(await metric('budget-ready'));
 await click('#primary');assert.match(await page.locator('#title').textContent(),/공문/);
 await capture('04-document-start');geometry.push(await metric('document-start'));
 await click('#primary');assert.equal(await page.locator('.bad[data-field]').count(),5);await capture('05-document-error');
 await click('[data-field="quantity"]');assert.equal(await page.locator('.source').count(),2);geometry.push(await metric('document-picker'));await capture('06-document-picker');
 await click('[data-source="150"]');assert.match(await page.locator('[data-field="quantity"]').textContent(),/150/);
 await click('[data-field="quantity"]');await click('[data-source="200"]');await click('#undo');assert.match(await page.locator('[data-field="quantity"]').textContent(),/150/);
 for(const [field,value] of Object.entries({quantity:200,unit:1100,version:2,estimate:2,specimen:2})){
  await click(`[data-field="${field}"]`);await click(`[data-source="${value}"]`);
 }
 await capture('07-document-ready');
 assert.match(await page.locator('.calc-line').textContent(),/220,000/);
 await click('#primary');assert.match(await page.locator('#title').textContent(),/완성/);await capture('08-complete');
 assert(await page.locator('#undo').isDisabled());
 // Deliberately overcommit support choices before price rise, then recover locally.
 await page.goto(url);await click('[data-action="base"]');await click('[data-option="stand"]');await click('[data-option="proof"]');await click('#primary');
 assert(await page.locator('[data-action="topup"]').isDisabled());await capture('09-budget-shortage');
 await click('[data-option="proof"]');assert(await page.locator('[data-action="topup"]').isEnabled());await click('[data-action="topup"]');await click('#primary');
 for(const size of [{width:320,height:740},{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:1440,height:1000}]){
  await page.setViewportSize(size);
  for(const [scene,query] of [['budget',''],['document','?scene=document']]){
   await page.goto(url+query);const g=await metric(scene);geometry.push(g);
   assert(g.pageWidth<=size.width,`${scene} horizontal overflow ${size.width}`);
   assert(g.primaryBottom<=size.height,`${scene} primary action not visible ${size.width}`);
   assert(g.pageHeight<=size.height+2,`${scene} page height ${size.width}`);
   if(size.width>=390)assert(g.boardContent<=g.boardHeight+2,`${scene} work area requires scrolling at ${size.width}`);
   if(size.width===390)await capture(scene+'-mobile');
   if(size.width===1440)await capture(scene+'-desktop');
   if(scene==='document'){
    const fields=await page.locator('.field').evaluateAll(list=>list.map(b=>({height:b.getBoundingClientRect().height,font:Number.parseFloat(getComputedStyle(b).fontSize)})));
    assert(fields.every(f=>f.height>=44&&f.font>=16),'document field touch and type sizes');
    await click('[data-field="unit"]');const opened=await metric('document-open');geometry.push(opened);
    if(size.width>=390)assert(opened.boardContent<=opened.boardHeight+2,'document and sources fit in one view');
    if(size.width===1440)await capture('document-picker-desktop');
   }
  }
 }
 // Portable version runs without linked JavaScript or CSS.
 await page.goto(pathToFileURL(path.join(__dirname,'E01_묶음1_휴대용시안.html')).href);await click('[data-action="base"]');assert.match(await page.locator('.print-count').textContent(),/20/);
 assert.deepEqual(issues,[]);
 const comparison=pathToFileURL(path.join(__dirname,'E01_묶음1_디자인비교.html')).href;
 await page.goto(comparison);await page.locator('summary').click();
 assert(await page.locator('img').evaluateAll(list=>list.every(i=>i.complete&&i.naturalWidth>0)),'comparison images loaded');
 await page.screenshot({path:path.join(out,'comparison-page.png'),fullPage:true});
 fs.writeFileSync(path.join(__dirname,'E01_pair_design_validation.json'),JSON.stringify({status:'passed',issues,geometry,actualUserFunTest:false,checks:['budget allocation, quote and local shortage recovery','one-action transitions','field-first source picker and local error states','undo within each stage; no undo across completed stages','complete pair path','responsive viewport geometry','portable standalone HTML']},null,2));
 console.log(JSON.stringify({status:'passed',geometry,issues},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
