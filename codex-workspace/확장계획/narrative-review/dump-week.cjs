const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/candidate/index.html','utf8');
const start=html.indexOf('const Narrative='),marker="if(typeof module!=='undefined')module.exports=Week;";
const c=vm.createContext({module:{exports:{}}});
vm.runInContext(html.slice(start,html.indexOf(marker,start)+marker.length),c);
const w=c.module.exports;
console.log(JSON.stringify({days:w.DAYS.map(x=>({news:x.news,tasks:x.tasks})),collab:w.COLLAB,decor:w.DECOR,ach:w.ACH},null,2));
