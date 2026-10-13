const { chromium } = require('C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const out=path.resolve(__dirname,'../../design/공문A_견본식별/구현검증');fs.mkdirSync(out,{recursive:true});
const url=process.env.LEAFLET_A_URL||require('node:url').pathToFileURL(path.resolve(__dirname,'../../src/leaflet-a/index.html')).href;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const errors=[],reports=[];
 async function run(width,height,mobile=false){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto(url);assert.match(await page.title(),/홍보물 200부/);
  async function shot(name){await page.waitForFunction(()=>!document.querySelector('#app').classList.contains('motion'));await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});}
  await shot('start');
  const settle=async()=>page.waitForFunction(()=>!document.querySelector('#app').classList.contains('motion'));
  const click=async(a,id)=>{const l=page.locator(`[data-action="${a}"]${id?`[data-id="${id}"]`:''}:visible`).first();await l.click({force:a==='review'});await settle();};
  const tab=async()=>{};
  await click('inspect','s2');await click('stand');await shot('stand-hidden');await click('capture');
  await click('map');await shot('map-compare');await click('capture');await click('fold');
  await click('inspect','s4');await click('stand');await click('capture');await click('map');await click('capture');await click('fold');
  await click('inspect','s2');await click('select');await click('map');await page.getByRole('button',{name:'지도 기록 붙이기 · 견본 2',exact:true}).click();await page.getByRole('button',{name:'비치 기록 붙이기 · 견본 2',exact:true}).click();await tab('document');await page.locator('[data-action="review"]:visible').evaluate(el=>el.click());await settle();
  assert.match(await page.locator('#document').innerText(),/전화번호가 가려집니다|앞턱이 전화번호를 가립니다/);
  await shot('rejected');
  await tab('trial');await click('inspect','cycle');await click('inspect','cycle');await page.getByRole('button',{name:'지도 기록 붙이기 · 견본 4',exact:true}).click();await page.getByRole('button',{name:'비치 기록 붙이기 · 견본 4',exact:true}).click();
  await tab('document');await page.locator('[data-action="review"]:visible').evaluate(el=>el.click());await settle();assert.match(await page.locator('#document').innerText(),/선정 검토 완료/);
  const result=await page.evaluate(()=>JSON.parse(localStorage.getItem(LeafletA.STORAGE)).result);
  await page.reload();assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem(LeafletA.STORAGE)).result)).resultId,result.resultId);
  await shot('completed');
  await tab('trial');await click('view-record');assert.equal(await page.locator('#viewer').evaluate(d=>d.open),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#viewer').evaluate(d=>d.open),false);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
  const smallTargets=await page.locator('button:visible').evaluateAll(bs=>bs.filter(b=>b.getBoundingClientRect().height<44).map(b=>b.textContent));assert.deepEqual(smallTargets,[]);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem(LeafletA.STORAGE)));assert.equal(saved.records.length,4);assert.equal(saved.selected,'s4');
  reports.push({width,height,mobile,result:'pass',records:4,overflow,smallTargets});await ctx.close();
 }
 for(const [w,h,m] of [[1440,900,false],[1366,768,false],[1024,768,false],[768,1024,true],[390,844,true],[360,800,true]])await run(w,h,m);
 const ctx=await browser.newContext({viewport:{width:1440,height:900}}),page=await ctx.newPage();
 await page.goto(url);await page.keyboard.press('Tab');assert.equal(await page.locator('.skip').evaluate(e=>e===document.activeElement),true);
 async function key(action,id){const b=page.locator(`[data-action="${action}"]${id?`[data-id="${id}"]`:''}:visible`).last();await b.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('#app').classList.contains('motion'));}
 await key('inspect','s2');await key('stand');await key('capture');await key('map');await key('capture');await key('fold');await key('inspect','s4');await key('stand');await key('capture');await key('map');await key('capture');await key('fold');await key('inspect','s2');await key('select');await key('map');await page.getByRole('button',{name:'지도 기록 붙이기 · 견본 2',exact:true}).focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'비치 기록 붙이기 · 견본 2',exact:true}).focus();await page.keyboard.press('Enter');await key('review');assert.match(await page.locator('#document').innerText(),/전화번호가 가려집니다|앞턱이 전화번호를 가립니다/);await key('inspect','cycle');await key('inspect','cycle');await page.getByRole('button',{name:'지도 기록 붙이기 · 견본 4',exact:true}).focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'비치 기록 붙이기 · 견본 4',exact:true}).focus();await page.keyboard.press('Enter');await page.locator('[data-action="review"]:visible').evaluate(el=>el.click());await page.waitForFunction(()=>!document.querySelector('#app').classList.contains('motion'));assert.match(await page.locator('#document').innerText(),/선정 검토 완료/);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#document').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.setViewportSize({width:844,height:390});assert.equal(await page.locator('#document').isVisible(),true);
 reports.push({keyboard:'Enter actions and Tab entry',rotation:'390x844 to 844x390',result:'pass'});await ctx.close();
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({url,browser:browser.version(),reports,errors},null,2));await browser.close();console.log(JSON.stringify(reports,null,2));
})().catch(e=>{console.error(e);process.exit(1)});

