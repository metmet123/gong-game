const { chromium } = require('C:/Users/이현주/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');
(async () => {
 const browser = await chromium.launch({ channel:'chrome', headless:true });
 const page = await browser.newPage({viewport:{width:1250,height:900}, deviceScaleFactor:1});
 const root = path.resolve(__dirname,'../../.codex-remote-attachments/01a1295c-09a6-7c22-8a96-00670fb52620/74bb0380-ec13-4ab1-9fa9-f5747ce5a415');
 const dest = path.join(__dirname,'pair_design_refs'); fs.mkdirSync(dest,{recursive:true});
 const files = fs.readdirSync(root).filter(f => f.endsWith('.html')).sort();
 for(let i=0;i<files.length;i++) {
  await page.goto(pathToFileURL(path.join(root,files[i])).href);
  await page.locator('.phone').first().screenshot({path:path.join(dest,`reference-${i+1}.png`)});
 }
 await browser.close();
 console.log('Rendered four reference game frames.');
})().catch(e=>{console.error(e);process.exit(1)});
