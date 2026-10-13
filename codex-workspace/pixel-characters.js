// Original 24-pixel character silhouettes, with four walk frames and task poses.
function sprite(c,x,y,s=3,who='player',frame=0,pose='idle',direction=1){
 s=Math.round(s);
 const hair=who==='boss'?'#44403e':who==='coworker'?'#694831':'#293746',shirt=who==='player'?'#507894':who==='boss'?'#79746a':'#72918a',skin='#efc39d';
 const f=frame%4,bob=pose==='walk'?[0,-1,0,-1][f]:pose==='idle'&&f===3?1:0;
 const r=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x+(direction<0?12-a-w:a)*s),Math.round(y+(b+bob)*s),w*s,h*s);};
 r(2,16,9,2,'#283f3e30');r(3,0,6,1,'#1f2b32');r(2,1,8,1,hair);r(1,2,10,4,hair);r(2,3,8,5,skin);r(1,4,1,3,'#c99379');r(10,4,1,3,'#c99379');r(2,2,8,2,hair);r(2,4,2,1,hair);r(9,3,1,2,hair);r(3,1,3,1,who==='coworker'?'#926a46':'#485564');r(3,5,1,1,'#353f43');r(8,5,1,1,'#353f43');r(2,6,2,1,'#df9e8d');r(8,6,2,1,'#df9e8d');r(5,7,2,1,'#a66a57');r(4,8,4,1,skin);
 if(who==='coworker'){r(0,4,2,4,hair);r(1,8,2,2,hair);}if(who==='boss'){r(2,5,3,2,'#777b72');r(7,5,3,2,'#777b72');r(3,5,1,1,'#dde2c9');r(8,5,1,1,'#dde2c9');r(5,5,2,1,'#777b72');}
 r(2,9,8,5,shirt);r(2,9,1,4,'#a9b9b1');r(3,9,2,2,'#eceadd');r(7,9,2,2,'#eceadd');r(5,9,2,4,'#e9e2ce');r(5,10,1,3,'#b7805a');r(8,11,1,2,'#c6d7d1');r(8,11,1,1,'#e4c66f');r(3,13,6,1,'#344f62');
 const arm=pose==='walk'?[0,-1,0,1][f]:0;r(1,10+arm,2,3,shirt);r(9,10-arm,2,3,shirt);r(1,13+arm,2,1,skin);r(9,13-arm,2,1,skin);
 if(pose==='phone'){r(0,7,2,5,shirt);r(0,6,2,2,skin);r(0,3,1,5,'#2c3939');r(0,3,2,1,'#2c3939');}
 if(pose==='type'){const a=f%2;r(1,11,3,2,shirt);r(8,11,3,2,shirt);r(3,12-a,2,1,skin);r(7,11+a,2,1,skin);r(3,14,6,1,'#bcc6b6');}
 if(pose==='paper'||pose==='stamp'){r(1,11,2,3,skin);r(8,11-(f%2),2,2,skin);r(3,11,6,4,'#f5edcd');r(4,12,4,1,'#93a69b');r(4,14,2,1,'#bc775f');if(pose==='stamp'){r(8,9+(f%2)*2,2,3,'#a64e48');r(7,12+(f%2)*2,4,1,'#9c5147');}}
 if(pose==='celebrate'){r(0,8,2,3,shirt);r(0,7,2,1,skin);r(10,8,2,3,shirt);r(10,7,2,1,skin);}
 const stride=pose==='walk'?[0,1,0,-1][f]:0;r(3,14,3,2,'#3c4859');r(6,14,3,2,'#47556a');r(3,16+stride,3,1,'#263341');r(6,16-stride,3,1,'#263341');r(3,16+stride,1,1,'#9d9b89');r(6,16-stride,1,1,'#9d9b89');
}
function drawAvatar(canvas,who){if(!canvas)return;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,32,32);sprite(c,4,0,2,who);}
