const room=el('office'),ctx=room.getContext('2d');ctx.imageSmoothingEnabled=false;
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(t,x,y,size=14,color='#56613f',align='left'){ctx.fillStyle=color;ctx.font=`bold ${size}px 'Malgun Gothic',sans-serif`;ctx.textAlign=align;ctx.fillText(t,x,y);ctx.textAlign='left';}
__SPRITES__
function geometry(){
 const compact=el('scene-world').clientWidth<=640;
 if(compact)return {W:600,H:800,compact:true,home:{x:300,y:660},objects:{phone:{x:158,y:588},papers:{x:388,y:576},computer:{x:272,y:541},inbox:{x:483,y:432},chat:{x:174,y:340},coffee:{x:80,y:444},door:{x:514,y:205}}};
 return {W:1100,H:660,compact:false,home:{x:472,y:542},objects:{phone:{x:355,y:479},papers:{x:546,y:479},computer:{x:451,y:440},inbox:{x:867,y:346},chat:{x:254,y:345},coffee:{x:834,y:496},door:{x:983,y:246}}};
}
function resizeScene(){
 const stage=el('scene-world'),g=geometry(),scale=Math.min(stage.clientWidth/g.W,stage.clientHeight/g.H),left=(stage.clientWidth-g.W*scale)/2,top=(stage.clientHeight-g.H*scale)/2;
 sceneLayout={...g,scale,left,top};room.width=g.W;room.height=g.H;ctx.imageSmoothingEnabled=false;room.style.width=g.W*scale+'px';room.style.height=g.H*scale+'px';room.style.left=left+'px';room.style.top=top+'px';
 document.querySelectorAll('[data-object]').forEach(b=>{const p=g.objects[b.dataset.object];b.style.left=left+p.x*scale+'px';b.style.top=top+p.y*scale+'px';});playerPos={...g.home};drawOffice(0);if(!el('scene-speech').hidden){const p=g.objects[speechAnchor];el('scene-speech').style.left=(left+p.x*scale)+'px';el('scene-speech').style.top=(top+(p.y-50)*scale)+'px';}
}
function leaves(x,y,s=1){const r=(a,b,w,h,c)=>rect(x+a*s,y+b*s,w*s,h*s,c);r(9,47,32,4,'#52634722');r(12,25,24,22,'#91684b');r(15,28,18,17,'#b38762');r(16,29,3,15,'#c7a17a');r(9,22,30,6,'#c5996c');r(12,23,24,2,'#e1b787');r(22,-7,3,29,'#587446');[[0,1],[23,-11],[5,-16],[25,5]].forEach(([a,b],i)=>{r(a+4,b,14,4,'#9ab16f');r(a,b+4,22,8,i%2?'#728e58':'#809f5d');r(a+4,b+12,14,4,'#587e50');r(a+4,b+4,8,3,'#acc081');r(a+11,b+5,2,10,'#637f4e');r(a+5,b+8,6,2,'#93aa6d');});}
function chair(x,y){rect(x-25,y-8,50,28,'#354d4b');rect(x-21,y-5,42,23,'#6c8c7e');rect(x-18,y-3,36,4,'#89a58d');rect(x-21,y+22,43,10,'#425f56');rect(x-4,y+31,8,13,'#626552');rect(x-25,y+42,50,4,'#535c50');rect(x-23,y+44,7,6,'#384c46');rect(x+16,y+44,7,6,'#384c46');}
function deskDetails(x,y,w){
 for(let i=0;i<5;i++){rect(x+13+i*39,y+63,22,1,'#9c7b5260');rect(x+22+i*37,y+9,12,1,'#e2c58f70');}rect(x+7,y+91,55,21,'#aa8c66');rect(x+10,y+94,49,14,'#c0a47d');rect(x+29,y+98,13,3,'#695e4b');
 const colors=['#6f8b83','#b97a63','#b7a267'];for(let i=0;i<3;i++){rect(x+14+i*9,y+11,8,29+i%2*5,colors[i]);rect(x+16+i*9,y+15,4,2,'#e7dcc0');rect(x+16+i*9,y+32,4,1,'#d9cdac');}rect(x+12,y+44,36,4,'#80674b');
 rect(x+w-63,y+13,23,28,'#596c67');rect(x+w-61,y+15,19,23,'#f0ddb5');rect(x+w-59,y+18,15,2,'#bba77a');rect(x+w-59,y+24,12,1,'#b6ae8c');rect(x+w-59,y+29,15,1,'#b6ae8c');rect(x+w-43,y+8,3,27,'#b8664f');rect(x+w-8,y+43,4,11,'#3e534e');
 const mx=x+w*.4;rect(mx+75,y+39,10,14,'#5c746a');rect(mx+78,y+41,3,4,'#a2b19a');rect(mx+76,y+57,11,2,'#786d53');rect(mx+51,y-13,3,9,'#d1e3c2');rect(mx+9,y-4,3,3,'#d9cf81');
 rect(x+13,y+64,35,12,'#efe2b3');rect(x+17,y+67,22,2,'#87977a');rect(x+17,y+71,16,1,'#baa986');rect(x+34,y+61,4,5,'#b97862');
 // A miniature framed photo and a duck charm clipped to the screen.
 rect(x+w-91,y+16,21,25,'#95734f');rect(x+w-88,y+19,15,18,'#c0d0b5');rect(x+w-86,y+26,5,6,'#708d84');rect(x+w-80,y+24,5,8,'#b58b66');rect(x+w-85,y+23,3,3,'#e9c5a0');rect(x+w-79,y+21,3,3,'#e9c5a0');rect(mx+64,y-15,1,8,'#96784f');rect(mx+62,y-7,6,5,'#e9c77e');rect(mx+66,y-6,3,2,'#b87851');
}
function bookshelf(x,y,w=124){rect(x+7,y+8,w,133,'#5c634a33');rect(x,y,w,130,'#72624b');rect(x+5,y+5,w-10,120,'#98835d');for(let row=0;row<3;row++){for(let i=0;i<Math.floor((w-16)/13);i++){const h=23+(i*7+row*5)%12;rect(x+10+i*13,y+37+row*39-h,10,h,['#769185','#b98466','#d3bc83','#647c84'][((i+row)%4)]);rect(x+12+i*13,y+39+row*39-h,6,2,'#e7dec0');rect(x+12+i*13,y+32+row*39,6,1,'#b8c1a3');}rect(x+3,y+38+row*39,w-6,5,'#594f3f');}rect(x-3,y-5,w+6,7,'#ae9570');}
function printerArt(x,y,t){rect(x+6,y+60,95,11,'#64654d33');rect(x,y+28,92,32,'#71847a');rect(x+5,y+31,82,25,'#b9c2ad');rect(x+13,y+2,65,28,'#d8ddc6');rect(x+20,y-13,49,23,'#f0edda');rect(x+25,y-9,34,2,'#99ab95');rect(x+25,y-4,28,2,'#b4bca2');rect(x+12,y+35,63,8,'#3b5350');rect(x+75,y+14,7,4,Math.floor(t/700)%2?'#dbc979':'#9bad81');rect(x+26,y+43,43,14,'#ece8cd');rect(x+30,y+46,32,2,'#a6b59c');}
function roomDetails(g,t){const wide=!g.compact;
 // Clock, pinboard notes, calendar and shelves use the same original pixel palette.
 const cx=wide?673:308,cy=wide?67:55;rect(cx,cy,31,32,'#4c6558');rect(cx+3,cy+3,25,25,'#f5edcd');rect(cx+14,cy+7,2,10,'#536b5a');rect(cx+15,cy+15,8,2,'#536b5a');for(let i=0;i<4;i++)rect(cx+7+i%2*15,cy+6+Math.floor(i/2)*17,2,2,'#a1ad8b');
 const x=wide?856:363,y=wide?92:193;rect(x,y,51,60,'#aa8767');rect(x+3,y+5,45,51,'#f4ebcd');rect(x+3,y+5,45,12,'#799184');rect(x+13,y-3,3,11,'#6b6652');rect(x+35,y-3,3,11,'#6b6652');for(let i=0;i<12;i++)rect(x+9+i%4*10,y+24+Math.floor(i/4)*9,4,4,i===5?'#b9795e':'#aeb39a');
 if(wide){bookshelf(44,413,123);printerArt(916,390,t);rect(707,553,140,73,'#9bab86');for(let i=0;i<6;i++){rect(712,558+i*11,130,2,'#c5ceb0');}rect(711,556,3,64,'#728764');rect(840,556,3,64,'#728764');}
 else{bookshelf(37,516,70);rect(34,510,79,8,'#a89165');printerArt(433,518,t);}
 const bx=wide?690:465,by=wide?487:654;rect(bx,by+4,30,37,'#b28565');rect(bx+4,by,21,6,'#bd9571');rect(bx+4,by+10,22,22,'#c8a180');rect(bx+13,by+2,4,10,'#846952');rect(bx+4,by+27,22,3,'#9c755b');rect(bx-3,by+9,3,22,'#8a7159');rect(bx+30,by+9,3,22,'#8a7159');
 const tx=wide?191:322,ty=wide?529:710;rect(tx,ty,25,5,'#69837a');rect(tx+3,ty+5,19,24,'#9baa92');rect(tx+5,ty+8,15,18,'#78917d');for(let i=0;i<3;i++)rect(tx+7+i*4,ty+10,1,13,'#b4c0a1');rect(tx+6,ty-6,12,8,'#eee6ca');rect(tx+9,ty-8,7,6,'#d4d5b9');
 // Fine wall grain, floor scuffs and warm slanting window light.
 for(let i=0;i<110;i++){const x=30+(i*67)%(g.W-60),y=30+(i*41)%(wide?170:200);rect(x,y,2,2,'#9b916f10');}
}
function windowArt(x,y,w,h){rect(x-5,y-5,w+10,h+10,'#857d64');rect(x,y,w,h,'#b4ceba');rect(x+5,y+5,w-10,h*.45,'#d1dfbf');const buildings=Math.floor(w/35);for(let i=0;i<buildings;i++){const bh=30+(i%3)*17;rect(x+8+i*34,y+h-bh-6,26,bh,['#9cae9b','#8faba0','#a6b69b'][i%3]);for(let j=0;j<3;j++)rect(x+13+i*34,y+h-bh+5+j*13,5,6,'#d1d7b5');}rect(x+w/2-3,y,6,h,'#e4d8b6');rect(x,y+h*.48,w,5,'#e3d5b0');rect(x-8,y+h,w+16,11,'#b7a67e');for(let j=0;j<3;j++)rect(x-7,y-8+j*5,w+14,4,'#c9bb93');}
function deskArt(x,y,w=230){
 rect(x+9,y+19,w,102,'#4b493433');rect(x+12,y+60,10,61,'#796348');rect(x+w-20,y+60,10,61,'#796348');rect(x,y,w,90,'#7c6247');rect(x+4,y+4,w-8,72,'#c5a878');rect(x+4,y+73,w-8,12,'#a78b5e');rect(x+8,y+6,w-16,2,'#dac18c');
 const mx=x+w*.4;rect(mx,y-30,67,43,'#394b43');rect(mx+5,y-25,57,31,'#96b5a4');rect(mx+9,y-21,49,4,'#c3d8ba');rect(mx+9,y-12,33,3,'#638979');rect(mx+9,y-4,42,3,'#799c86');rect(mx+30,y+13,8,12,'#394b43');rect(mx+19,y+25,32,5,'#4c5b4b');rect(mx-6,y+34,77,17,'#d9d7bc');for(let i=0;i<9;i++)rect(mx+i*7,y+39,5,3,'#b1b399');
 rect(x+w-24,y+11,14,18,'#58644b');rect(x+w-21,y+2,3,22,'#486c5f');rect(x+w-16,y+7,2,17,'#dcd0ad');
 deskDetails(x,y,w);
}
function telephone(x,y,t){rect(x-25,y-12,50,30,'#3f4b3d');rect(x-22,y-10,44,23,'#57634b');rect(x-23,y-18,46,8,'#333f36');rect(x-28,y-17,11,13,'#344136');rect(x+17,y-17,11,13,'#344136');for(let j=0;j<3;j++)for(let i=0;i<3;i++)rect(x-10+i*7,y-6+j*6,4,3,'#a7b69a');if(pendingFor('phone').length){rect(x+9,y-27,5,5,'#d9bb63');if(Math.floor(t/650)%2){rect(x-34,y-21,3,10,'#e1ca7c');rect(x+31,y-21,3,10,'#e1ca7c');}}}
function paperArt(x,y,count=4){for(let i=0;i<count;i++){rect(x-23+i%2*3,y+13-i*4,47,6,'#e8e5cf');rect(x-20+i%2*3,y+13-i*4,33,1,'#afb69a');}rect(x-23,y-15,47,29,'#f5f2db');rect(x-19,y-10,32,3,'#8f9b77');rect(x-19,y-3,36,2,'#bac0a5');rect(x-19,y+3,26,2,'#bac0a5');rect(x+7,y+8,11,4,'#ba7a62');}
function cabinet(x,y){rect(x+7,y+13,105,139,'#53544233');rect(x,y,107,137,'#a4a68a');rect(x+4,y+4,99,125,'#c8c8ab');for(let i=0;i<3;i++){rect(x+8,y+9+i*39,91,35,'#b8bca1');rect(x+44,y+17+i*39,25,5,'#7e8b71');rect(x+22,y+31+i*39,62,2,'#a7ac90');}}
function tray(x,y){rect(x-38,y-13,76,43,'#4c5e47');rect(x-35,y-17,70,13,'#87a174');rect(x-35,y+9,70,8,'#738b60');const count=pendingFor('inbox').length;if(count){paperArt(x,y-8,count+2);rect(x-35,y+14,70,8,'#85996a');}}
function drawOffice(t){
 if(!sceneLayout)return;const g=sceneLayout,wide=!g.compact,W=g.W,H=g.H,done=G.todayRecords(state).length;
 rect(0,0,W,H,'#637453');rect(18,18,W-36,H-35,'#b9b896');const wallH=wide?208:240;rect(24,24,W-48,wallH,'#e4debc');rect(24,wallH,W-48,12,'#b3a27c');rect(24,wallH+12,W-48,H-wallH-40,'#d5c69f');
 for(let y=wallH+12;y<H-28;y+=37)for(let x=24;x<W-24;x+=43){rect(x,y,43,37,((Math.floor((x-24)/43)+Math.floor((y-wallH-12)/37))%2)?'#d2c19b':'#ddd0ab');rect(x,y+36,42,1,'#b5a88855');}
 for(let i=0;i<180;i++){const x=30+(i*89)%(W-60),y=wallH+17+(i*53)%(H-wallH-55);rect(x,y,3+(i%3),1,'#9f8d6b16');}ctx.fillStyle='#fff4c422';ctx.beginPath();ctx.moveTo(80,wallH+12);ctx.lineTo(wide?340:250,wallH+12);ctx.lineTo(wide?510:360,H-55);ctx.lineTo(wide?240:120,H-55);ctx.closePath();ctx.fill();
 rect(18,wallH,9,H-wallH-20,'#9e9e79');rect(W-27,wallH,9,H-wallH-20,'#9e9e79');rect(18,H-31,W-36,12,'#a59875');rect(18,H-20,W-36,9,'#5d6e4b');
 if(wide){windowArt(80,75,245,104);windowArt(402,75,245,104);rect(708,77,126,84,'#8e8058');rect(712,81,118,76,'#b69b67');for(let i=0;i<4;i++){rect(725+i%2*48,91+Math.floor(i/2)*29,34,22,i%2?'#f1e6bd':'#e5d191');rect(741+i%2*48,87+Math.floor(i/2)*29,4,6,'#b37652');}text('행정지원팀',765,189,18,'#6b7450','center');}
 else{windowArt(74,81,210,112);rect(341,89,114,91,'#8e8058');rect(345,93,106,83,'#b89e6a');for(let i=0;i<3;i++){rect(355+i%2*46,104+Math.floor(i/2)*31,32,22,i%2?'#f1e6bd':'#e6d190');rect(369+i%2*46,100+Math.floor(i/2)*31,4,5,'#b27651');}text('행정지원팀',398,209,18,'#66754b','center');}
 const door=g.objects.door;rect(door.x-39,wide?101:133,78,157,'#6e684e');rect(door.x-33,wide?107:139,66,145,'#a8966d');rect(door.x-25,wide?113:145,50,86,'#bcc6a5');rect(door.x-13,wide?132:156,27,17,'#edf0d4');text('출구',door.x,wide?145:169,12,'#6d7753','center');rect(door.x+21,wide?211:230,5,6,'#665943');
 roomDetails(g,t);const cf=state.settings.motion?Math.floor(t/240)%4:0;
 if(wide){cabinet(48,266);leaves(76,224,1.3);deskArt(170,284,215);deskArt(569,269,219);rect(825,371,98,57,'#afa988');rect(829,375,90,49,'#cbc3a2');tray(g.objects.inbox.x,g.objects.inbox.y);deskArt(316,466,265);chair(250,369);chair(653,354);chair(472,557);sprite(ctx,223,300,4.5,'coworker',cf,'type');sprite(ctx,626,285,4.5,'boss',cf,'paper');rect(761,493,133,58,'#9d8c67');rect(766,497,123,50,'#c4b285');leaves(985,491,1.6);}
 else{deskArt(79,277,206);deskArt(316,294,218);chair(175,371);chair(417,388);sprite(ctx,148,298,4.6,'coworker',cf,'type');sprite(ctx,390,314,4.6,'boss',cf,'paper');cabinet(431,450);tray(g.objects.inbox.x,g.objects.inbox.y);deskArt(118,566,320);chair(300,675);rect(50,443,104,67,'#9b8860');rect(54,447,96,59,'#bfa87a');leaves(47,667,1.2);leaves(502,677,1.4);}
 telephone(g.objects.phone.x,g.objects.phone.y,t);paperArt(g.objects.papers.x,g.objects.papers.y,Math.max(1,4-done));const cp=g.objects.coffee;rect(cp.x-13,cp.y-12,26,28,'#e4e0c5');rect(cp.x+13,cp.y-8,11,15,'#d3d4b1');rect(cp.x+15,cp.y-5,6,9,'#b7a174');rect(cp.x-8,cp.y-13,16,5,'#76543b');if(!state.coffee){rect(cp.x+2,cp.y-27,2,8,'#e9e3c266');rect(cp.x-7,cp.y-34,2,8,'#e9e3c266');}
 if(state.decor.includes('plant'))leaves(wide?572:417,wide?424:535,.75);
 if(state.decor.includes('mug')){rect(wide?335:140,wide?487:605,16,20,'#d9e1c4');rect(wide?350:155,wide?493:611,7,10,'#bbc69f');}
 if(state.decor.includes('cat')){const x=wide?700:420,y=wide?550:698;rect(x,y+12,36,15,'#c89c69');rect(x+12,y,24,20,'#d4ad7a');rect(x+12,y-5,7,9,'#bd9465');rect(x+29,y-5,7,9,'#bd9465');rect(x+17,y+8,3,2,'#43513a');rect(x+28,y+8,3,2,'#43513a');rect(x+24,y+13,3,2,'#a76d53');rect(x+35,y+19,10,5,'#bd9465');}
 let pos=playerPos||g.home,frame=state.settings.motion?Math.floor(t/140)%4:0;
 if(walking){const n=Math.min(1,(t-walking.start)/walking.duration);pos={x:walking.from.x+(walking.to.x-walking.from.x)*n,y:walking.from.y+(walking.to.y-walking.from.y)*n};playerPos=pos;if(n>=1){const cb=walking.callback;walking=null;setTimeout(cb,0);}}
 const s=g.compact?5.2:4.8,pose=walking?'walk':active?({memory:'phone',sequence:'type',sort:'stamp'}[active.p.type]||'paper'):'idle';rect(pos.x-20,pos.y+8,42,8,'#65744e33');sprite(ctx,pos.x-6*s,pos.y-17*s,s,'player',frame,pose,walking&&walking.to.x<walking.from.x?-1:1);rect(pos.x-14,pos.y-105,28,18,'#e6ca75');text('나',pos.x,pos.y-92,11,'#52603a','center');
}
function animation(t){if(t-lastDraw>90&&(state.settings.motion||walking)){drawOffice(t);drawWorkClerk(t);lastDraw=t;}else if(!state.settings.motion&&el('work-clerk')&&!el('work-clerk').dataset.drawn){drawWorkClerk(0);el('work-clerk').dataset.drawn='true';}requestAnimationFrame(animation);}
