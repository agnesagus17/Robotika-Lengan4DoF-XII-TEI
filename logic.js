/* Logika simulasi: servo, sensor photodioda, barang, mesin proses otomatis (15 langkah), monitoring, kontrol. */
(function(){
var RS=window.RS;
var $=function(id){return document.getElementById(id);};
var D=Math.PI/180;
var HOME={b:90,s:110,e:75,g:30};
var POSE={ // sudut hasil perhitungan kinematika terbalik (sama dengan kode Arduino)
  safe:{s:108,e:46},hover:{s:66,e:59},grab:{s:39,e:67},
  GOPEN:100,GGRIP:50,GCLOSE:30};
var THR=500;
var STEP_FULL=['Robot berada pada posisi awal (Home Position).','Barang diletakkan pada area pengambilan (Pick Area).','Sensor photodioda mendeteksi keberadaan barang.','Arduino Uno menerima sinyal dari sensor.','Arduino memproses sinyal dan memberikan perintah kepada motor servo.','Base robot berputar menuju arah barang.','Shoulder dan elbow bergerak menuju posisi pengambilan.','Gripper membuka untuk mempersiapkan penjepitan.','Gripper menutup untuk mengambil barang.','Lengan robot bergerak mengangkat barang.','Base robot berputar menuju area tujuan (Place Area).','Lengan robot bergerak menuju posisi peletakan.','Gripper membuka dan melepaskan barang.','Robot kembali ke posisi awal.','Sistem siap melakukan siklus pemindahan barang berikutnya.'];
var STEP_SHORT=['Home Position','Barang di Pick Area','Sensor mendeteksi barang','Arduino menerima sinyal','Arduino memproses, perintah ke servo','Base berputar ke barang','Shoulder & elbow ke posisi ambil','Gripper membuka','Gripper menutup, ambil barang','Lengan mengangkat barang','Base berputar ke Place Area','Lengan ke posisi peletakan','Gripper membuka, lepas barang','Kembali ke Home','Siap siklus berikutnya'];

/* Daftar langkah */
var stepsEl=$('steps');
STEP_SHORT.forEach(function(t,i){var li=document.createElement('li');li.className='step';li.innerHTML='<span class="n">'+(i+1)+'</span><span>'+t+'</span>';stepsEl.appendChild(li);});
var stepLis=stepsEl.children;

/* Keadaan */
var S={b:HOME.b,s:HOME.s,e:HOME.e,g:HOME.g},Tg={b:HOME.b,s:HOME.s,e:HOME.e,g:HOME.g};
var cubeSt={mode:'none',vy:0,counted:false};
var sensorVal=850,speed=1,count=0,pickSt='MENUNGGU',moveSt='MENUNGGU',curStep=0,finished=false,idleNote='MANUAL',holdMsg=0;
var A={on:false,paused:false,i:0,t:0,from:null,repeat:false,list:null,stopped:false};
var cache={};
function setTxt(id,txt,cls){var k=id+'|'+txt+'|'+(cls||'');if(cache[id]===k)return;cache[id]=k;var el=$(id);el.textContent=txt;if(cls!==undefined){el.className='badge'+(cls?' '+cls:'');}}

function toast(msg){
  if(!RS)return;var old=RS.stage.querySelector('.toast');if(old)old.remove();
  var d=document.createElement('div');d.className='toast';d.textContent=msg;RS.stage.appendChild(d);setTimeout(function(){d.remove();},2600);
}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function ease(x){return x*x*(3-2*x);}

/* Barang */
function padXZ(p){return {x:p.position.x,z:p.position.z};}
function spawnCube(){
  var p=RS.pickPad.position;cubeSt.mode='free';cubeSt.vy=0;cubeSt.counted=false;
  RS.cube.visible=true;RS.cube.position.set(p.x,9,p.z);RS.cube.rotation.set(0,RS.pickPad.rotation.y,0);
}
function restCube(){var p=RS.pickPad.position;cubeSt.mode='free';cubeSt.vy=0;cubeSt.counted=false;RS.cube.visible=true;RS.cube.position.set(p.x,1.5,p.z);RS.cube.rotation.set(0,RS.pickPad.rotation.y,0);}
function removeCube(){cubeSt.mode='none';RS.cube.visible=false;}
function releaseCube(){
  if(cubeSt.mode!=='held')return;cubeSt.mode='free';cubeSt.vy=0;
  var pl=padXZ(RS.placePad),c=RS.cube.position;
  if(Math.hypot(c.x-pl.x,c.z-pl.z)<3.8&&c.y<4.5&&!cubeSt.counted){cubeSt.counted=true;count++;toast('Barang dipindahkan ke Place Area');}
}
function cubeAtPick(){
  if(cubeSt.mode!=='free'||!RS.cube.visible)return false;var p=padXZ(RS.pickPad),c=RS.cube.position;
  return Math.hypot(c.x-p.x,c.z-p.z)<3.3&&c.y<4.2;
}
var gp=new RS.T.Vector3();
function cubeUpdate(dt){
  if(!RS.cube.visible)return;
  RS.grasp.getWorldPosition(gp);
  if(cubeSt.mode==='free'){
    if(S.g<=53&&gp.distanceTo(RS.cube.position)<2.4){cubeSt.mode='held';}
  }else if(cubeSt.mode==='held'&&S.g>=57){releaseCube();}
  if(cubeSt.mode==='held'){RS.cube.position.copy(gp);RS.cube.rotation.y=(S.b-90)*D;}
  else if(cubeSt.mode==='free'){
    var c=RS.cube.position,onTable=c.x>-38&&c.x<32&&c.z>-28&&c.z<28,floor=onTable?1.5:-30.5;
    if(c.y>floor||cubeSt.vy!==0){cubeSt.vy-=90*dt;c.y+=cubeSt.vy*dt;if(c.y<=floor){c.y=floor;cubeSt.vy=0;}}
  }
}

/* Daftar fase otomatis. Setiap fase milik satu langkah (1-15). */
function maxDiff(t){var m=0;['b','s','e','g'].forEach(function(k){if(t[k]!==undefined)m=Math.max(m,Math.abs(t[k]-S[k]));});return m;}
var PH=[
 {step:1,dur:0.8,t:{b:HOME.b,s:HOME.s,e:HOME.e,g:HOME.g},ard:'SIAGA',pos:'HOME',pick:'MENUNGGU',move:'MENUNGGU',onStart:function(p){p.dur=Math.max(0.8,maxDiff(p.t)/70);}},
 {step:2,dur:1.1,ard:'SIAGA',pos:'HOME',pick:'MENUNGGU',move:'MENUNGGU',onStart:function(){if(!cubeAtPick())spawnCube();}},
 {step:3,dur:0.6,ard:'MEMBACA SENSOR A0',pos:'HOME',pick:'MENUNGGU',move:'MENUNGGU',wait:function(){return sensorVal<THR;},waitMax:5},
 {step:4,dur:0.9,ard:'MENERIMA SINYAL',pos:'HOME',pick:'MENUNGGU',move:'MENUNGGU'},
 {step:5,dur:1.0,ard:'MEMPROSES DATA',pos:'HOME',pick:'MENUNGGU',move:'MENUNGGU'},
 {step:6,dur:1.6,t:{b:130,s:POSE.safe.s,e:POSE.safe.e,g:POSE.GCLOSE},ard:'MENGGERAKKAN SERVO',pos:'MENUJU PICK AREA',pick:'PROSES',move:'MENUNGGU'},
 {step:7,dur:1.2,t:{s:POSE.hover.s,e:POSE.hover.e},ard:'MENGGERAKKAN SERVO',pos:'MENUJU PICK AREA',pick:'PROSES',move:'MENUNGGU'},
 {step:8,dur:0.8,t:{g:POSE.GOPEN},ard:'MENGGERAKKAN SERVO',pos:'DI PICK AREA',pick:'PROSES',move:'MENUNGGU'},
 {step:9,dur:1.2,t:{s:POSE.grab.s,e:POSE.grab.e},ard:'MENGGERAKKAN SERVO',pos:'DI PICK AREA',pick:'PROSES',move:'MENUNGGU'},
 {step:9,dur:0.9,t:{g:POSE.GGRIP},ard:'MENGGERAKKAN SERVO',pos:'DI PICK AREA',pick:'PROSES',move:'MENUNGGU'},
 {step:10,dur:1.2,t:{s:POSE.hover.s,e:POSE.hover.e},ard:'MENGGERAKKAN SERVO',pos:'MEMBAWA BARANG',pick:'SELESAI',move:'PROSES'},
 {step:10,dur:0.9,t:{s:POSE.safe.s,e:POSE.safe.e},ard:'MENGGERAKKAN SERVO',pos:'MEMBAWA BARANG',pick:'SELESAI',move:'PROSES'},
 {step:11,dur:2.0,t:{b:50},ard:'MENGGERAKKAN SERVO',pos:'MENUJU PLACE AREA',pick:'SELESAI',move:'PROSES'},
 {step:12,dur:1.0,t:{s:POSE.hover.s,e:POSE.hover.e},ard:'MENGGERAKKAN SERVO',pos:'MENUJU PLACE AREA',pick:'SELESAI',move:'PROSES'},
 {step:12,dur:1.2,t:{s:POSE.grab.s,e:POSE.grab.e},ard:'MENGGERAKKAN SERVO',pos:'DI PLACE AREA',pick:'SELESAI',move:'PROSES'},
 {step:13,dur:0.9,t:{g:POSE.GOPEN},ard:'MENGGERAKKAN SERVO',pos:'DI PLACE AREA',pick:'SELESAI',move:'PROSES'},
 {step:14,dur:0.9,t:{s:POSE.hover.s,e:POSE.hover.e},ard:'MENGGERAKKAN SERVO',pos:'DI PLACE AREA',pick:'SELESAI',move:'SELESAI'},
 {step:14,dur:2.0,t:{b:HOME.b,s:HOME.s,e:HOME.e,g:HOME.g},ard:'MENGGERAKKAN SERVO',pos:'KEMBALI KE HOME',pick:'SELESAI',move:'SELESAI'},
 {step:15,dur:1.0,ard:'SIAP',pos:'HOME',pick:'SELESAI',move:'SELESAI'}
];
var PH_HOME=[{step:0,dur:0.8,t:{b:HOME.b,s:HOME.s,e:HOME.e,g:HOME.g},ard:'MENGGERAKKAN SERVO',pos:'KEMBALI KE HOME',pick:null,move:null,onStart:function(p){p.dur=Math.max(0.8,maxDiff(p.t)/70);}}];
var curPh=null;

function startPhase(list,i){
  A.list=list;A.i=i;A.t=0;A.from={b:S.b,s:S.s,e:S.e,g:S.g};curPh=list[i];
  if(curPh.onStart)curPh.onStart(curPh);
  if(curPh.step)curStep=curPh.step;
  if(curPh.pick)pickSt=curPh.pick;if(curPh.move)moveSt=curPh.move;
}
function stopAuto(){A.on=false;A.paused=false;Tg.b=S.b;Tg.s=S.s;Tg.e=S.e;Tg.g=S.g;}
function phaseDone(){
  var list=A.list;
  if(A.i+1<list.length){startPhase(list,A.i+1);return;}
  if(list===PH&&A.repeat){curStep=0;startPhase(PH,1);return;}
  A.on=false;Tg.b=S.b;Tg.s=S.s;Tg.e=S.e;Tg.g=S.g;
  if(list===PH){finished=true;idleNote='SELESAI';curStep=15;toast('Siklus selesai. Sistem siap.');}else{idleNote='MANUAL';}
}
function autoUpdate(dt){
  if(!A.on||A.paused)return;
  var p=curPh;A.t+=dt*speed;var u=p.dur?clamp(A.t/p.dur,0,1):1,k=ease(u);
  if(p.t){for(var key in p.t){S[key]=A.from[key]+(p.t[key]-A.from[key])*k;}}
  var ok=A.t>=p.dur;
  if(ok&&p.wait&&!p.wait()&&A.t<p.waitMax)ok=false;
  if(ok)phaseDone();
}

/* Tombol otomatis */
function startAuto(){
  if(!RS)return;
  if(A.on&&A.paused){A.paused=false;syncBtns();return;}
  if(A.on)return;
  if(cubeSt.mode==='held')releaseCube();
  finished=false;idleNote='OTOMATIS';curStep=1;pickSt='MENUNGGU';moveSt='MENUNGGU';
  Tg.b=S.b;Tg.s=S.s;Tg.e=S.e;Tg.g=S.g;
  A.on=true;A.paused=false;startPhase(PH,0);syncBtns();
}
function pauseAuto(){if(!A.on)return;A.paused=!A.paused;syncBtns();}
function stopBtn(){if(!A.on&&!A.paused)return;stopAuto();idleNote='BERHENTI';A.repeat=false;syncBtns();toast('Proses dihentikan');}
function homeBtn(){
  if(!RS)return;if(cubeSt.mode==='held'){releaseCube();toast('Barang dilepas sebelum kembali ke Home');}
  A.repeat=false;A.paused=false;idleNote='MANUAL';A.on=true;curStep=0;startPhase(PH_HOME,0);syncBtns();
}
function resetBtn(){
  A.on=false;A.paused=false;A.repeat=false;finished=false;idleNote='MANUAL';
  S.b=HOME.b;S.s=HOME.s;S.e=HOME.e;S.g=HOME.g;Tg.b=S.b;Tg.s=S.s;Tg.e=S.e;Tg.g=S.g;
  count=0;pickSt='MENUNGGU';moveSt='MENUNGGU';curStep=0;
  if(RS)restCube();syncBtns();toast('Simulasi di-reset');
}
function repeatBtn(){
  A.repeat=!A.repeat;
  if(A.repeat&&!A.on){startAuto();}
  syncBtns();
}
function syncBtns(){
  var p=$('cPause');p.setAttribute('aria-pressed',A.paused?'true':'false');p.textContent=A.paused?'LANJUT':'PAUSE';
  $('cRepeat').setAttribute('aria-pressed',A.repeat?'true':'false');
  ['sB','sS','sE','sG'].forEach(function(id){$(id).setAttribute('aria-describedby','');});
}
$('cStart').addEventListener('click',startAuto);$('cPause').addEventListener('click',pauseAuto);$('cStop').addEventListener('click',stopBtn);
$('cHome').addEventListener('click',homeBtn);$('cReset').addEventListener('click',resetBtn);$('cRepeat').addEventListener('click',repeatBtn);
$('speed').addEventListener('change',function(e){speed=parseFloat(e.target.value)||1;});
$('cPut').addEventListener('click',function(){if(!RS)return;if(cubeSt.mode==='held'){toast('Lepaskan barang dari gripper terlebih dahulu');return;}spawnCube();});
$('cTake').addEventListener('click',function(){if(!RS)return;removeCube();});
$('bTags').addEventListener('click',function(e){var v=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',v?'true':'false');if(RS)RS.setTags(v);});
$('bWires').addEventListener('click',function(e){var v=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',v?'true':'false');if(RS)RS.setWiresVisible(v);});
Array.prototype.forEach.call(document.querySelectorAll('[data-cam]'),function(b){b.addEventListener('click',function(){if(RS)RS.camTo(b.getAttribute('data-cam'));});});

/* Kontrol manual */
var SL={b:'sB',s:'sS',e:'sE',g:'sG'};
Object.keys(SL).forEach(function(k){
  var el=$(SL[k]);
  el.addEventListener('input',function(){
    var v=parseFloat(el.value);
    if(A.on){stopAuto();idleNote='MANUAL';finished=false;syncBtns();}
    var s=k==='s'?v:Tg.s,e=k==='e'?v:Tg.e;
    if((k==='s'||k==='e')&&RS&&RS.minY(s,e)<0.2){el.value=Tg[k];toast('Batas aman: lengan akan menyentuh meja');return;}
    Tg[k]=v;idleNote='MANUAL';
  });
});
function sliderSync(){
  Object.keys(SL).forEach(function(k){var el=$(SL[k]);if(document.activeElement!==el||A.on)el.value=Math.round(S[k]);});
}

/* Tampilan monitoring */
function monitor(){
  var det=sensorVal<THR,adc=Math.round(sensorVal);
  setTxt('adcVal','ADC A0 = '+adc);$('adcBar').style.width=(adc/1023*100).toFixed(1)+'%';$('adcThr').style.left=(THR/1023*100).toFixed(1)+'%';
  setTxt('mSen',det?'TERDETEKSI':'TIDAK TERDETEKSI',det?'ok':'');
  $('mLed').className='led'+(det?' on':'');setTxt('mLedT',det?'MENYALA':'MATI');
  var ard;if(A.on&&A.paused)ard='JEDA';else if(A.on&&curPh)ard=curPh.ard;else if(idleNote==='BERHENTI')ard='BERHENTI';else ard=det?'BARANG TERDETEKSI':'SIAGA';
  setTxt('mArd',ard,ard==='JEDA'||ard==='BERHENTI'?'warn':(ard==='SIAGA'?'info':'ok'));
  [['B','b',180],['S','s',180],['E','e',180],['G','g',180]].forEach(function(r){var v=Math.round(S[r[1]]);setTxt('d'+r[0],v+'°');setTxt('v'+r[0],v+'°');$('b'+r[0]).style.width=(v/r[2]*100).toFixed(1)+'%';});
  var held=cubeSt.mode==='held',gs=held?'MENJEPIT BARANG':(S.g>=75?'TERBUKA':(S.g<=38?'TERTUTUP':'SETENGAH TERBUKA'));
  setTxt('mGrip',gs,held?'ok':(S.g>=75?'warn':''));
  var pos;if(A.on&&curPh)pos=curPh.pos;else{
    var hd=Math.abs(S.b-HOME.b)+Math.abs(S.s-HOME.s)+Math.abs(S.e-HOME.e);var f=RS.fk(S.s,S.e),low=f.grasp[1]<6;
    if(hd<4)pos='HOME';else if(Math.abs(S.b-130)<4&&low)pos='DI PICK AREA';else if(Math.abs(S.b-50)<4&&low)pos='DI PLACE AREA';else pos='GERAK MANUAL';}
  setTxt('mPos',pos,'info');
  var ps=A.on||finished?pickSt:(held?'SELESAI':pickSt),ms=A.on||finished?moveSt:(held?'PROSES':moveSt);
  setTxt('mPick',ps,ps==='SELESAI'?'ok':(ps==='PROSES'?'warn':''));setTxt('mMove',ms,ms==='SELESAI'?'ok':(ms==='PROSES'?'warn':''));
  var mode=A.on?(A.paused?'JEDA':(A.repeat?'OTOMATIS · REPEAT':(A.list===PH?'OTOMATIS':'KE HOME'))):idleNote;
  setTxt('mMode',mode,A.on?(A.paused?'warn':'ok'):(mode==='BERHENTI'?'bad':(mode==='SELESAI'?'ok':'')));
  setTxt('mCount',String(count));
  for(var i=0;i<stepLis.length;i++){var c='step'+((i+1<curStep||(finished&&!A.on))?' done':'')+((A.on&&A.list===PH&&i+1===curStep)||(!A.on&&!finished&&i+1===curStep)?' now':'');if(stepLis[i].className!==c)stepLis[i].className=c;}
  var nt=curStep>0?('Langkah '+curStep+' dari 15: '+STEP_FULL[curStep-1]):'Tekan START untuk memulai simulasi otomatis, atau gerakkan servo secara manual.';
  setTxt('nowtxt',finished&&!A.on?'Siklus selesai. Sistem siap melakukan siklus pemindahan barang berikutnya.':nt);
  setTxt('hStep',curStep>0?('Langkah '+(finished&&!A.on?15:curStep)+'/15'):'Mode manual');
}

/* Loop utama */
var clock=new RS.T.Clock(),visible=true;
window.SIM={setVisible:function(v){visible=v;if(v&&RS){RS.resize();clock.getDelta();}}};
function tick(){
  requestAnimationFrame(tick);
  if(!visible)return;
  var dt=Math.min(clock.getDelta(),0.05);
  autoUpdate(dt);
  if(!A.on){var kk=Math.min(1,dt*7);['b','s','e','g'].forEach(function(k){var d=Tg[k]-S[k];S[k]=Math.abs(d)<0.05?Tg[k]:S[k]+d*kk;});}
  else{Tg.b=S.b;Tg.s=S.s;Tg.e=S.e;Tg.g=S.g;}
  RS.setPose(S.b,S.s,S.e,S.g);
  RS.scene.updateMatrixWorld(true);
  cubeUpdate(dt);
  var blocked=cubeAtPick();
  var target=blocked?(170+Math.random()*20):(850+Math.random()*20);
  sensorVal+=(target-sensorVal)*Math.min(1,dt*9);
  RS.setSensor(blocked);RS.setLed(sensorVal<THR);
  sliderSync();monitor();
  RS.render(dt);
}
if(RS){RS.setPose(S.b,S.s,S.e,S.g);restCube();sensorVal=170;syncBtns();tick();}
else{['cStart','cPause','cStop','cHome','cReset','cRepeat','cPut','cTake'].forEach(function(id){$(id).disabled=true;});}
window.ROBOT_POSE=POSE;
})();
