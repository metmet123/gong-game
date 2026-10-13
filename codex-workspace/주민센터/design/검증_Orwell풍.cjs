const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE);
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{
 const folder=path.join(__dirname,'화면','Orwell풍');fs.mkdirSync(folder,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 function check(name,ok){checks.push({name,passed:!!ok});if(!ok)throw Error(name);}
 const click=selector=>page.locator(selector).click();
 const shot=async name=>{await page.locator('.toast').evaluateAll(els=>els.forEach(el=>el.remove()));await page.locator('#app').screenshot({path:path.join(folder,name+'.png')});};
 await page.goto(pathToFileURL(path.join(__dirname,'관계추론_Orwell풍_시안.html')).href);
 check('초기 답 없음',await page.locator('.resident').count()===0&&await page.locator('#relation').count()===0);
 await shot('새시안_초기_390');
 await click('[data-tab="source"]');await click('[data-pin="보람이랑 저는 이번에 새집으로 이사를 마쳤어요."]');
 check('근거 보관은 답을 입력하지 않음',await page.locator('.pinlog').innerText().then(t=>t.includes('이사를'))&&await page.locator('.resident').count()===0);
 await shot('새시안_자료_390');
 await click('[data-source="ledger"]');await shot('새시안_이전기록_390');
 await click('[data-tab="graph"]');await click('[data-action="move"]');await click('[data-action="head"]');await click('.node[data-person="bo"]');await click('[data-action="move"]');
 check('배치·기준 뒤에도 관계 답은 빈 값',await page.locator('#relation').inputValue()==='');
 await page.locator('.board').evaluate(el=>el.scrollTop=130);await shot('새시안_관계_390');
 await page.locator('#relation').selectOption('자녀');await click('[data-action="review"]');
 check('검토에 실제 오답 기록',await page.locator('.draft-card').innerText().then(t=>t.includes('자녀')));
 await click('[data-reason="copy"]');await click('[data-action="submit"]');
 check('오답 유지·근거 안내',await page.locator('.feedback').innerText().then(t=>t.includes('이전 주소 기록'))&&await page.locator('.draft-card').innerText().then(t=>t.includes('자녀')));
 await shot('새시안_오답_390');await click('[data-action="back"]');
 check('자료 왕복 후 초안 유지',await page.locator('#relation').inputValue()==='자녀');
 await click('[data-tab="source"]');await click('[data-tab="graph"]');check('탭 왕복 후 값 유지',await page.locator('#relation').inputValue()==='자녀');
 await click('[data-action="head"]');check('기준 변경으로 관계 무효화',await page.locator('#relation').inputValue()==='');
 await click('.resident[data-person="ga"]');await click('[data-action="head"]');await page.locator('#relation').selectOption('형제자매');await click('[data-action="review"]');await click('[data-reason="new"]');await click('[data-action="submit"]');
 check('완료는 올바른 직접 판단 후',await page.locator('.feedback.success').count()===1);await shot('새시안_완료_390');
 await click('#reset');await click('[data-action="help"]');check('도움 초점',await page.locator('[data-action="close-help"]').evaluate(el=>el===document.activeElement));
 await page.keyboard.press('Tab');check('도움 초점 유지',await page.locator('[data-action="close-help"]').evaluate(el=>el===document.activeElement));
 await page.keyboard.press('Escape');check('도움 닫고 초점 복귀',await page.locator('[data-action="help"]').evaluate(el=>el===document.activeElement));
 await click('[data-tab="graph"]');await page.keyboard.press('ArrowLeft');check('탭 키보드 이동',await page.locator('[data-tab="source"]').getAttribute('aria-selected')==='true');
 for(const [w,h] of [[320,568],[390,844],[430,932]]){
   await page.setViewportSize({width:w,height:h+180});await click(`[data-size="${w},${h}"]`);await click('#reset');
   for(const tab of ['source','graph','review']){await click(`[data-tab="${tab}"]`);check(`${w} ${tab} 가로 넘침 없음`,await page.locator('#app').evaluate(el=>el.scrollWidth<=el.clientWidth)&&await page.locator(`#${tab==='graph'?'graph':tab==='review'?'review':'source'}-panel`).evaluate(el=>el.scrollWidth<=el.clientWidth));}
   await click('[data-tab="graph"]');await click('[data-action="move"]');await click('[data-action="head"]');await click('.node[data-person="bo"]');await click('[data-action="move"]');
   await page.locator('#relation').scrollIntoViewIfNeeded();check(`${w} 관계 입력 16px`,await page.locator('#relation').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)===16));
   check(`${w} 앱 주요 버튼 44px`,await page.locator('#app button:visible').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)));
   await shot(`새시안_관계_${w}`);await page.locator('.board').evaluate(el=>el.scrollTo({top:0,behavior:'instant'}));await shot(`새시안_판단_${w}`);
 }
 await page.setViewportSize({width:1440,height:1100});await click('[data-size="1180,820"]');await click('#reset');await click('[data-action="move"]');await click('[data-action="head"]');await click('.node[data-person="bo"]');await click('[data-action="move"]');await click('[data-source="ledger"]');
 check('PC 그래프와 자료 동시 표시',await page.locator('.board').isVisible()&&await page.locator('.source').isVisible());
 check('PC 영역 넘침 없음',await page.locator('#app').evaluate(el=>el.scrollWidth<=el.clientWidth));await shot('새시안_PC');
 await click('[data-tab="source"]');check('PC 자료 탭에서도 그래프 유지',await page.locator('.board').isVisible());
 await click('#compare');await page.waitForFunction(()=>document.querySelector('img.before')?.complete);check('현재 화면 비교',await page.locator('img.before').evaluate(el=>el.complete&&el.naturalWidth===390));
 await click('#compare');await click('[data-size="320,568"]');await click('[data-tab="graph"]');await page.addStyleTag({content:'#app button,#app label,#app p,#app h2,#app select{font-size:200%!important}'});await page.waitForFunction(()=>document.querySelector('#app').classList.contains('text-flow'));check('200% 글자에서 내부 스크롤로 조작 접근',await page.locator('[data-action="review"]').isVisible()&&await page.locator('#app').evaluate(el=>el.scrollHeight>el.clientHeight));await page.locator('#relation').scrollIntoViewIfNeeded();await shot('새시안_확대_320');
 check('스크립트 오류 없음',errors.length===0);
 fs.copyFileSync(path.join(__dirname,'..','docs','검증화면','첫접수','관계_390.png'),path.join(folder,'현재_관계_390.png'));
 fs.writeFileSync(path.join(folder,'검증결과.json'),JSON.stringify({verifiedAt:new Date().toISOString(),scope:'별도 HTML 시안; 실제 게임·저장·배포 검증 아님',checks,errors},null,2));
 console.log(JSON.stringify({passed:checks.length,errors,folder},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
