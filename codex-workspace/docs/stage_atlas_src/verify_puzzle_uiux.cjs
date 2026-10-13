const {chromium}=require('C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const root=__dirname,url=pathToFileURL(path.join(root,'공무원키우기_3단계시안_퍼즐우선계획.html')).href;
const registry=JSON.parse(fs.readFileSync(path.join(root,'puzzle_uiux_v1_2.json'),'utf8'));
const result={version:'1.2',date:'2026-10-11',scope:'Design atlas and planning contracts only; not playable engine, measured novice usability, or actual Android validation',checks:[],layout:[],errors:[],network:[]};
function ck(name,pass,detail=''){result.checks.push({name,pass:!!pass,detail});if(!pass)console.log('FAIL',name,detail);}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const page=await browser.newPage({viewport:{width:1600,height:1040},reducedMotion:'reduce'});
 page.on('pageerror',e=>result.errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))result.network.push(r.url());});await page.goto(url);
 ck('24 puzzle contracts and 9 official sources',registry.puzzles.length===24&&registry.references.length===9);
 ck('72 revised puzzle frames; 57 retained place frames',await page.locator('.app-stage').count()===72&&await page.locator('.stage-card:not(.app-stage)').count()===57);
 ck('Each puzzle has reference, 3-step flow, failure and completion cue',await page.locator('.item:not([data-group="places"])').evaluateAll(items=>items.length===24&&items.every(i=>i.querySelector('.ux-reference a')&&i.querySelectorAll('.ux-flow li').length===3&&i.querySelectorAll('.ux-feedback>div').length===2)));
 ck('Every frame has first action, active step, type-specific tool, primary and undo',await page.locator('.app-screen').evaluateAll(items=>items.every(i=>i.querySelector('.app-first')&&i.querySelector('.app-stepper .active')&&i.querySelector('.app-segment .active,.app-dpad,.app-doc.picked')&&i.querySelectorAll('.app-cta').length===1&&i.querySelector('.app-undo'))));
 ck('Mock actions clearly illustrative, not inert actual buttons',await page.locator('.app-screen button').count()===0&&await page.locator('.app-stage .mock-caption').evaluateAll(x=>x.every(e=>e.textContent.includes('실행 기능 없음'))));
 ck('Official reference URLs in atlas match registry',await page.locator('.ux-sources li a').evaluateAll(x=>x.map(e=>e.href)).then(urls=>registry.references.every(r=>urls.includes(r.url))));
 await page.locator('#search').fill('Canva');ck('App-name search finds report and appropriate future designs',await page.locator('.item:visible').count()===3&&await page.locator('#puzzle-brief').isVisible());await page.locator('#search').fill('');
 const ids=await page.locator('.app-stage').evaluateAll(x=>[...new Set(x.map(e=>e.closest('.item').id))]);
 for(const width of [320,360,390,412,768,1280,1600]){
  await page.setViewportSize({width,height:width<500?844:1040});
  for(const id of ids){
   await page.locator('#'+id).scrollIntoViewIfNeeded();
   const failures=await page.locator('#'+id+' .app-screen').evaluateAll(frames=>frames.flatMap(f=>{
    const b=f.getBoundingClientRect();const a=[];
    for(const e of f.querySelectorAll('.app-titlebar,.app-objective,.app-panel,.app-calendar,.budget-sheet,.app-report,.app-segment,.app-canvas,.app-main-actions')){
     const r=e.getBoundingClientRect();if(r.right>b.right+1||r.left<b.left-1)a.push(e.className);
    }
    if(f.scrollWidth>f.clientWidth+2)a.push('screen inner overflow');return a;
   }));
   if(failures.length)result.layout.push({width,id,failures});
  }
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))result.layout.push({width,outerOverflow:true});
 }
 ck('All 24 designs fit frames and page at 7 viewport widths',result.layout.length===0,JSON.stringify(result.layout));
 await page.addStyleTag({content:'.topbar{visibility:hidden!important}'});
 await page.setViewportSize({width:1600,height:1040});
 for(const id of ['rules','brief','approval','macro']){
  await page.locator('#puzzle-'+id).screenshot({path:path.join(root,'퍼즐UI_'+id+'_3단계.png')});
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#puzzle-rules .detail').screenshot({path:path.join(root,'퍼즐UI_규정_모바일.png')});
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844},reducedMotion:'reduce'});const n=await ctx.newPage();await n.goto(url);
 ck('JS blocked: 72 app frames and 24 flow descriptions visible',await n.locator('.app-stage:visible').count()===72&&await n.locator('.ux-flow:visible').count()===24);
 await n.locator('.ux-sources summary').click();ck('JS blocked: native reference disclosure shows all 9 sources',await n.locator('.ux-sources li:visible').count()===9);
 await n.locator('.index-mobile summary').click();await n.locator('.index-mobile a[href="#puzzle-brief"]').click();ck('JS blocked: anchor opens report design',await n.evaluate(()=>location.hash==='#puzzle-brief'));
 const plan=fs.readFileSync(path.join(root,'PUZZLE_FIRST_V1_1.md'),'utf8');
 ck('Existing PF roadmap links new UX contract',plan.includes('PUZZLE_UIUX_V1_2.md')&&plan.includes('확인 후 수정 시 재확인')&&plan.includes('신규 사용자 5명 시험 목표'));
 ck('Original rule content and witness data preserved',registry.puzzles.every(p=>p.error&&p.success&&p.firstAction&&p.references.every(r=>registry.references.some(s=>s.id===r))));
 ck('Browser errors and resource requests absent',result.errors.length===0&&result.network.length===0);
 // A printable overview: detail-state specimens with per-type app references.
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'stage_catalog.json'),'utf8'));
 await page.setViewportSize({width:1680,height:1100});
 const cells=[];
 for(const item of catalog.puzzles.slice(0,8)){
  const el=await page.locator('#puzzle-'+item.id+' .detail .app-screen').evaluate(e=>e.outerHTML);
  const ui=registry.puzzles.find(p=>p.id===item.id);
  cells.push(`<article class="gallery-cell app-stage detail"><h2>${item.name}</h2><p>${ui.references.map(id=>registry.references.find(r=>r.id===id).name).join(' · ')} 참고</p>${el}</article>`);
 }
 const styles=await page.locator('style').first().textContent();const defs=await page.locator('.svg-defs').evaluate(e=>e.outerHTML);
 const gallery=`<!doctype html><html lang="ko"><meta charset="utf-8"><title>신규 퍼즐8종 앱 참고 시안</title><style>${styles}
 body{background:#f4f3ed;padding:28px}.gallery-title{max-width:1624px;margin:auto;padding:8px 4px 25px}.gallery-title h1{font-size:29px;margin:0 0 10px}.gallery-title p{font-size:14px;color:#758478;margin:0}.gallery{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.gallery-cell{padding:14px;background:white;border:1px solid #d6dfd6;border-radius:14px}.gallery-cell h2{font-size:18px;margin:0 0 3px}.gallery-cell>p{font-size:11px;color:#8a988a;margin:0 0 12px}.gallery-cell .app-screen{height:100%;min-height:760px}.gallery-cell{display:flex;flex-direction:column}.gallery-cell .app-workarea{flex:1}.gallery-footer{font-size:12px;margin:20px 4px 0;color:#7b8877}</style><body>${defs}<header class="gallery-title"><h1>공무원 키우기 · 앱 참고 퍼즐 디자인</h1><p>신규8종의 디테일 UI 제안 · 목표 → 선택 → 작업 → 확인 · 설명용 편집 예시</p></header><main class="gallery">${cells.join('')}</main><p class="gallery-footer">UI v1.2 · 2026.10.11 · 공식 앱 자료의 작업 패턴을 참고한 독자 시안 · 실제 게임 실행/직관성 사용자 시험은 이후 구현 단계</p></body></html>`;
 await page.setContent(gallery);await page.screenshot({path:path.join(root,'퍼즐8종_앱참고_디자인.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.setContent(`<html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}body{padding:18px;background:#f6f5f0}.gallery-cell{padding:0}.gallery-cell h2{font-size:20px;margin-bottom:3px}.gallery-cell>p{font-size:11px;color:#80908b;margin-bottom:14px}</style><body>${cells[0]}</body></html>`);
 await page.screenshot({path:path.join(root,'퍼즐UI_규정_모바일.png'),fullPage:true});
 result.passed=result.checks.filter(c=>c.pass).length;result.total=result.checks.length;fs.writeFileSync(path.join(root,'puzzle_uiux_validation_v1_2.json'),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({passed:result.passed,total:result.total,layout:result.layout,errors:result.errors}));if(result.passed!==result.total)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
