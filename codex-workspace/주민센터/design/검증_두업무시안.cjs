const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE);
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{
 const folder=path.join(__dirname,'화면','두업무');fs.mkdirSync(folder,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name,ok)=>{checks.push({name,passed:!!ok});if(!ok)throw Error(name);};
 const click=s=>page.locator(s).click();
 const shot=name=>page.locator('#app').screenshot({path:path.join(folder,name+'.png')});
 await page.goto(pathToFileURL(path.join(__dirname,'두업무_연결_시안.html')).href);
 check('처음에는 복지 정식 시작 잠금',await page.locator('#app [data-route=welfare]').isDisabled());await shot('업무선택_잠금_390');
 await click('#gate');check('시안 개방 전환',await page.locator('#app [data-route=welfare]').isEnabled());await shot('업무선택_390');
 await click('#app [data-route=movein]');await page.waitForFunction(()=>document.querySelector('.current-wrap img')?.complete);check('기존 전입 이미지 비교',await page.locator('.current-wrap img').evaluate(el=>el.naturalWidth===390));
 await click('#app [data-route=hub] >> nth=0');await click('#app [data-route=welfare]');
 check('당사자 확인 전 딸 질문 잠금',await page.locator('[data-question=S04]').isDisabled());await shot('복지자료_초기_390');
 await click('[data-question=S03]');check('새 답변이 판단을 채우지 않음',await page.locator('#claim').inputValue()==='');
 await click('[data-pin="S03:0"]');check('근거 보관이 판단을 채우지 않음',await page.locator('#claim').inputValue()==='');
 await shot('복지자료_390');await click('[data-tab=relation]');await page.locator('#claim').selectOption('alone');await page.locator('#proof').selectOption('S03:0');
 await page.locator('.board').evaluate(el=>el.scrollTo({top:0,behavior:'instant'}));await shot('복지관계_390');
 await click('[data-tab=source]');await click('[data-question=S04]');await click('[data-tab=relation]');check('자료·질문 왕복 판단 보존',await page.locator('#claim').inputValue()==='alone');
 await click('[data-action=list]');check('관계망의 인물 목록 대체',await page.locator('.personlist button').count()===3);await click('[data-action=list]');
 await click('[data-tab=plan]');await page.locator('#issue').selectOption('meal');await page.locator('#service').selectOption('meal-consult');await page.locator('#followup').selectOption('next-shift');await shot('복지계획_390');
 await click('[data-action=review]');check('계획 검토는 한글 선택값 표시',await page.locator('[role=dialog]').innerText().then(t=>t.includes('식사 준비')&&!t.includes('meal-consult')));
 await page.keyboard.press('Tab');check('검토 초점 가두기',await page.locator('[data-action=close]').evaluate(el=>el===document.activeElement));await page.keyboard.press('Escape');check('검토 닫기 초점 복귀',await page.locator('[data-action=review]').evaluate(el=>el===document.activeElement));
 await click('#app [data-route=hub]');await click('#app [data-route=welfare]');check('업무 왕복 계획 보존',await page.locator('#service').inputValue()==='meal-consult');
 for(const [w,h] of [[320,568],[390,844],[430,932]]){
  await page.setViewportSize({width:w,height:h+200});await click(`[data-size="${w},${h}"]`);
  for(const tab of ['source','relation','plan']){await click(`[data-tab=${tab}]`);check(`${w} ${tab} 가로 넘침 없음`,await page.locator(`#${tab}-panel`).evaluate(el=>el.scrollWidth<=el.clientWidth)&&await page.locator('#app').evaluate(el=>el.scrollWidth<=el.clientWidth));}
  check(`${w} 주요 버튼 44px`,await page.locator('#app button:visible').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44)));
  check(`${w} 입력 글자 16px`,await page.locator('#app select:visible').evaluateAll(els=>els.every(el=>parseFloat(getComputedStyle(el).fontSize)>=16)));
  await shot(`복지계획_${w}`);
 }
 await page.setViewportSize({width:1440,height:1100});await click('[data-size="1180,820"]');await click('[data-tab=relation]');await page.locator('#source').selectOption('S03');
 check('PC 관계와 자료 동시 표시',await page.locator('.board').isVisible()&&await page.locator('.source').isVisible());await shot('복지_PC');
 await click('[data-tab=relation]');await page.keyboard.press('ArrowRight');check('키보드 작업 탭 전환',await page.locator('[data-tab=plan]').getAttribute('aria-selected')==='true');
 check('스크립트 오류 없음',errors.length===0);
 fs.copyFileSync(path.join(__dirname,'..','docs','검증화면','첫접수','관계_390.png'),path.join(folder,'현재_전입_390.png'));
 fs.writeFileSync(path.join(folder,'시안검증.json'),JSON.stringify({verifiedAt:new Date().toISOString(),scope:'계획용 HTML만 검증; 게임 엔진·저장·실제 개방 미구현',checks,errors},null,2));
 console.log(JSON.stringify({passed:checks.length,errors,folder},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
