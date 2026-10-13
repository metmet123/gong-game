const {chromium}=require('C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('path'),fs=require('fs'),{pathToFileURL}=require('url');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage();const result=[];
 await p.goto(pathToFileURL(path.join(__dirname,'공문퍼즐_참고게임조사.html')).href);
 for(const width of [390,1440]){
  await p.setViewportSize({width,height:1000});
  const item=await p.evaluate(()=>({width:innerWidth,pageWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),cards:document.querySelectorAll('.game-card').length}));
  if(item.pageWidth>width||item.cards!==6||item.images.some(i=>!i.loaded))throw new Error('Report layout or image load failed');result.push(item);
  if(width===1440)await p.screenshot({path:path.join(__dirname,'report-preview.png'),fullPage:true});
 }
 fs.writeFileSync(path.join(__dirname,'report_validation.json'),JSON.stringify({status:'passed',checks:result,scope:'Report layout and image loads, not gameplay validation'},null,2));
 console.log('Six game images loaded; mobile and desktop report fit.');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
