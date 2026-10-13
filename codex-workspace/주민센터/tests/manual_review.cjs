const {chromium}=require('C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'); const path=require('path'); const readline=require('readline');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 context.setDefaultTimeout(5000);
 const page=await context.newPage();
 await page.goto(require('url').pathToFileURL(path.resolve('주민센터/주민센터_두업무.html')).href);
 let frame=page; let seq=0;
 const dir=path.resolve('주민센터/design/화면/사용자플레이검토_20261011'); fs.mkdirSync(dir,{recursive:true});
 console.log('READY\n'+await page.locator('body').innerText());
 const rl=readline.createInterface({input:process.stdin});
 for await(const line of rl){try{
  const cmd=JSON.parse(line);
  if(cmd.action==='click') await frame.locator(cmd.selector).click();
  if(cmd.action==='select') await frame.locator(cmd.selector).selectOption(cmd.value);
  if(cmd.action==='host') frame=page;
  if(cmd.action==='frame') frame=await page.locator('#desk iframe').contentFrame();
  if(cmd.action==='viewport') await page.setViewportSize(cmd.size);
  if(cmd.action==='scroll') await frame.locator(cmd.selector).evaluate((el,y)=>el.scrollTop=y,cmd.y);
  if(cmd.action==='shot') await page.screenshot({path:path.join(dir,cmd.name+'.png')});
  if(cmd.action==='quit'){await browser.close();break;}
  await page.waitForTimeout(180);
  if(frame!==page && !(await page.locator('#desk iframe').count())) frame=page;
  const visible=await frame.locator('body').innerText();
  const controls=await frame.locator('button:visible,select:visible').evaluateAll(els=>els.map(el=>({tag:el.tagName,id:el.id,text:el.innerText,disabled:el.disabled,attrs:[...el.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value]),options:el.tagName==='SELECT'?[...el.options].map(o=>({text:o.text,value:o.value})):undefined})));
  const record={seq:++seq,cmd,visible,controls};fs.appendFileSync(path.join(dir,'interaction.jsonl'),JSON.stringify(record)+'\n');
  console.log(JSON.stringify({seq:record.seq,visible:record.visible,controls:record.controls}));
 }catch(e){fs.appendFileSync(path.join(dir,'tool-errors.jsonl'),JSON.stringify({error:e.message})+'\n');console.log('ERROR '+e.message);}}
})();
