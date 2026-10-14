const path=require('path'),fs=require('fs'),cp=require('child_process');
const builder=path.resolve(__dirname,'../../build_release.py');
if(!fs.existsSync(builder))throw Error('Use the consolidated source workspace build_release.py. This release includes narrative and independent desks; the old baseline-only budget builder is retired.');
cp.execFileSync('python',[builder],{stdio:'inherit'});
