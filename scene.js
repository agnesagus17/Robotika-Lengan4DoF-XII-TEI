/* Scene 3D: lingkungan lab, meja, robot 4 DOF, area pick/place, barang.
   Satuan model ≈ cm. Robot menghadap +X saat Servo 1 = 90°. */
(function(){
var T=THREE,D=Math.PI/180;
var C={H0:9,L1:14,L2:12,GP:5,CUBE:3,R:15.5,PICK:130,PLACE:50,GAPK:0.06};
var stage=document.getElementById('stage');
var renderer;
try{renderer=new T.WebGLRenderer({antialias:true});}catch(e){
  stage.innerHTML='<p style="padding:24px;color:#93a9c5">Browser ini belum mendukung WebGL, sehingga model 3D tidak dapat ditampilkan. Halaman Rangkaian, Materi, Program, dan Evaluasi tetap dapat dipakai.</p>';
  window.RS=null;return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
stage.insertBefore(renderer.domElement,stage.firstChild);
var scene=new T.Scene();
scene.background=new T.Color(0x050a12);
scene.fog=new T.Fog(0x050a12,150,420);
var camera=new T.PerspectiveCamera(36,1,0.5,900);
var controls=new T.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.08;controls.enablePan=true;controls.maxPolarAngle=Math.PI*0.495;
var TARGET=new T.Vector3(2,10,0);controls.target.copy(TARGET);

/* Material */
function mat(c,r,m,e){return new T.MeshStandardMaterial({color:c,roughness:r==null?0.55:r,metalness:m||0,emissive:e||0x000000});}
var M={
  base:mat(0x9aa7b8,0.4,0.55),base2:mat(0x7d8a9c,0.45,0.5),turret:mat(0xff8a1f,0.45,0.15),upper:mat(0x4a90ff,0.4,0.2),fore:mat(0x2fd67f,0.4,0.2),
  grip:mat(0xff5577,0.4,0.2),servo:mat(0x16243b,0.55,0.3),metal:mat(0xc3ccd8,0.3,0.9),dark:mat(0x0d1118,0.7,0.2),plug:mat(0xe9e4d8,0.6,0),
  cube:mat(0xffd23f,0.4,0.05),table:mat(0x1b2535,0.5,0.35),tableEdge:mat(0x38d2ff,0.4,0.2,0x0a5a73),floor:mat(0x08111d,0.55,0.4),wall:mat(0x0b1626,0.8,0.1)
};
function bx(p,w,h,d,m,x,y,z){var o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x||0,y||0,z||0);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function cy(p,r1,r2,h,seg,m,x,y,z,axis){var o=new T.Mesh(new T.CylinderGeometry(r1,r2,h,seg||24),m);o.position.set(x||0,y||0,z||0);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function txtTex(txt,w,h,fg,bg,font){var c=document.createElement('canvas');c.width=512;c.height=Math.max(32,Math.round(512*h/w));var x=c.getContext('2d');
  if(bg){x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);}
  x.fillStyle=fg;x.font=(font||'700')+' '+Math.round(c.height*0.46)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,c.width/2,c.height/2);
  var t=new T.CanvasTexture(c);t.anisotropy=4;return t;}
function anchor(p,x,y,z){var o=new T.Object3D();o.position.set(x||0,y||0,z||0);p.add(o);return o;}

/* Cahaya */
scene.add(new T.HemisphereLight(0xbcd7ff,0x1a2436,0.75));
var key=new T.DirectionalLight(0xffffff,0.9);key.position.set(40,80,50);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);var sc=key.shadow.camera;sc.left=-60;sc.right=60;sc.top=60;sc.bottom=-60;sc.near=10;sc.far=220;key.shadow.bias=-0.0006;scene.add(key);
var rimL=new T.DirectionalLight(0x5aa8ff,0.35);rimL.position.set(-60,30,-40);scene.add(rimL);
var glow=new T.PointLight(0x38d2ff,0.55,120);glow.position.set(0,40,0);scene.add(glow);

/* Lab: lantai, dinding, panel */
var floor=new T.Mesh(new T.PlaneGeometry(500,500),M.floor);floor.rotation.x=-Math.PI/2;floor.position.y=-32;floor.receiveShadow=true;scene.add(floor);
var grid=new T.GridHelper(500,50,0x1d6f95,0x12304a);grid.position.y=-31.9;grid.material.transparent=true;grid.material.opacity=0.35;scene.add(grid);
var wallBack=new T.Mesh(new T.PlaneGeometry(400,140),M.wall);wallBack.position.set(0,38,-95);scene.add(wallBack);
var wallLeft=new T.Mesh(new T.PlaneGeometry(400,140),M.wall);wallLeft.rotation.y=Math.PI/2;wallLeft.position.set(-95,38,0);scene.add(wallLeft);
(function panels(){
  var lm=new T.LineBasicMaterial({color:0x1b5f86,transparent:true,opacity:0.7});
  for(var i=-4;i<=4;i++){
    var g=new T.EdgesGeometry(new T.BoxGeometry(34,46,0.2));
    var a=new T.LineSegments(g,lm);a.position.set(i*38,36,-94.8);scene.add(a);
    var b=new T.LineSegments(g,lm);b.rotation.y=Math.PI/2;b.position.set(-94.8,36,i*38);scene.add(b);
  }
  var scr=txtTex('LAB ROBOTIKA · TEI XI',16,4,'#38d2ff','#06101c','600');
  var s1=new T.Mesh(new T.PlaneGeometry(48,12),new T.MeshBasicMaterial({map:scr}));s1.position.set(-30,56,-94.6);scene.add(s1);
  var strip=new T.Mesh(new T.BoxGeometry(300,0.8,0.4),new T.MeshBasicMaterial({color:0x38d2ff}));strip.position.set(0,12,-94.5);scene.add(strip);
  var strip2=strip.clone();strip2.rotation.y=Math.PI/2;strip2.position.set(-94.5,12,0);scene.add(strip2);
})();

/* Meja */
var tableG=new T.Group();scene.add(tableG);
bx(tableG,72,2,58,M.table,-3,-1,0);
bx(tableG,72.4,0.3,58.4,M.tableEdge,-3,-1.95,0);
[[-36,-26],[-36,26],[30,-26],[30,26]].forEach(function(p){bx(tableG,3,30,3,M.dark,p[0],-17,p[1]);});

/* Robot */
var robot=new T.Group();scene.add(robot);
cy(robot,7.6,7.6,1.2,48,M.base,0,0.6,0);
cy(robot,7.9,7.9,0.25,48,mat(0x38d2ff,0.4,0.2,0x0a4a60),0,0.12,0);
cy(robot,6,6.2,4,40,M.base2,0,3.2,0);
[0,1,2,3].forEach(function(i){var a=i*Math.PI/2+Math.PI/4;cy(robot,0.35,0.35,0.3,10,M.metal,Math.cos(a)*6.6,1.35,Math.sin(a)*6.6);});
var servo1Plug=anchor(robot,-6.7,3.2,0);
bx(robot,1.2,1.4,2.6,M.plug,-6.5,3.2,0);
var s1=bx(robot,1.4,1.9,3.4,M.servo,-5.9,3.2,0);
var s1tag=anchor(robot,0,4.2,0);

var turret=new T.Group();turret.position.set(0,5.2,0);robot.add(turret);
cy(turret,5,5,0.8,40,M.turret,0,0.4,0);
bx(turret,4.2,1.2,4.8,M.turret,0,1.4,0);
[2.4,-2.4].forEach(function(z){bx(turret,4.2,3.0,0.9,M.turret,0,2.3,z);cy(turret,2.1,2.1,0.9,28,M.turret,0,3.8,z,'z');});
cy(turret,0.5,0.5,7.4,16,M.metal,0,3.8,0,'z');
var servo2=bx(turret,4.2,2.2,2.4,M.servo,0,3.8,-4.05);
bx(turret,2.2,0.06,1.2,mat(0x4a90ff,0.5,0,0x1a3a70),0,4.95,-4.05);
cy(turret,1.2,1.2,0.45,24,mat(0xf3f6fa,0.5),0,3.8,3.0,'z');
var servo2tag=anchor(turret,0,3.8,-4.05),servo2wire=anchor(turret,-2.2,3.4,-4.05);

var shoulder=new T.Group();shoulder.position.set(0,3.8,0);turret.add(shoulder);
bx(shoulder,C.L1,2.2,1.4,M.upper,C.L1/2,0,-0.9);
cy(shoulder,1.1,1.1,1.4,24,M.upper,0,0,-0.9,'z');cy(shoulder,1.1,1.1,1.4,24,M.upper,C.L1,0,-0.9,'z');
bx(shoulder,C.L1-4,0.6,0.5,mat(0x2a66c8,0.5),C.L1/2,0,-1.75);
var servo3=bx(shoulder,3.6,2.0,2.2,M.servo,C.L1-1.2,0,-2.9);
bx(shoulder,2,0.06,1.1,mat(0x2fd67f,0.5,0,0x0f5a33),C.L1-1.2,1.05,-2.9);
var servo3tag=anchor(shoulder,C.L1-1.2,0,-2.9),servo3wire=anchor(shoulder,C.L1-2.6,0.4,-2.9);
var upperTag=anchor(shoulder,C.L1*0.45,1.4,-0.9);

var elbow=new T.Group();elbow.position.set(C.L1,0,0);shoulder.add(elbow);
cy(elbow,0.45,0.45,5.2,12,M.metal,0,0,0,'z');
bx(elbow,C.L2,2.0,1.4,M.fore,C.L2/2,0,0.9);
cy(elbow,1.0,1.0,1.4,24,M.fore,0,0,0.9,'z');cy(elbow,1.0,1.0,1.4,24,M.fore,C.L2,0,0.9,'z');
bx(elbow,C.L2-4,0.55,0.5,mat(0x1fa862,0.5),C.L2/2,0,1.75);
var servo4=bx(elbow,3.4,1.9,2.2,M.servo,C.L2-3.4,0.2,2.9);
bx(elbow,1.9,0.06,1.1,mat(0xff5577,0.5,0,0x6a1a2b),C.L2-3.4,1.2,2.9);
var servo4tag=anchor(elbow,C.L2-3.4,0.2,2.9),servo4wire=anchor(elbow,C.L2-4.8,0.5,2.9);
var foreTag=anchor(elbow,C.L2*0.45,1.3,0.9);

var wrist=new T.Group();wrist.position.set(C.L2,0,0);elbow.add(wrist);
bx(wrist,1.4,2.0,1.8,M.grip,0.2,0,0.8);
bx(wrist,3.0,2.4,3.4,M.grip,1.9,0,0);
bx(wrist,0.9,1.2,4.2,mat(0xd93a5a,0.45,0.2),3.4,0,0);
var fL=new T.Group(),fR=new T.Group();wrist.add(fL);wrist.add(fR);
[fL,fR].forEach(function(f){bx(f,2.4,1.8,0.5,M.grip,5.0,0,0);bx(f,2.4,1.5,0.14,M.dark,5.0,0,0);});
var grasp=anchor(wrist,C.GP,0,0);
var gripTag=anchor(wrist,3.2,1.5,0);

/* Area pick & place */
function pad(psi,txt,col){
  var g=new T.Group();g.position.set(C.R*Math.cos(psi*D),0.04,-C.R*Math.sin(psi*D));g.rotation.y=psi*D;scene.add(g);
  var m=new T.Mesh(new T.PlaneGeometry(7.4,7.4),new T.MeshStandardMaterial({color:col,roughness:0.6,transparent:true,opacity:0.5,emissive:col,emissiveIntensity:0.25}));m.rotation.x=-Math.PI/2;m.receiveShadow=true;g.add(m);
  var e=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(7.4,0.05,7.4)),new T.LineBasicMaterial({color:col}));g.add(e);
  var t=new T.Mesh(new T.PlaneGeometry(6,1.5),new T.MeshBasicMaterial({map:txtTex(txt,6,1.5,'#ffffff',null),transparent:true}));t.rotation.x=-Math.PI/2;t.position.set(0,0.06,3.0);g.add(t);
  return g;
}
var pickPad=pad(-0+(C.PICK-90),'PICK AREA',0x3de08e);
var placePad=pad(C.PLACE-90,'PLACE AREA',0xffb224);

/* Barang */
var cube=new T.Mesh(new T.BoxGeometry(C.CUBE,C.CUBE,C.CUBE),M.cube);cube.castShadow=true;cube.receiveShadow=true;
cube.add(new T.LineSegments(new T.EdgesGeometry(cube.geometry),new T.LineBasicMaterial({color:0x7a5a00})));
cube.visible=false;scene.add(cube);

/* API */
var RS={T:T,C:C,scene:scene,camera:camera,renderer:renderer,controls:controls,stage:stage,mat:mat,M:M,bx:bx,cy:cy,txtTex:txtTex,anchor:anchor,TARGET:TARGET,
  robot:robot,turret:turret,shoulder:shoulder,elbow:elbow,wrist:wrist,grasp:grasp,cube:cube,pickPad:pickPad,placePad:placePad,
  anchors:{servo1:servo1Plug,servo2:servo2wire,servo3:servo3wire,servo4:servo4wire},
  tagAnchors:{s1:s1tag,s2:servo2tag,s3:servo3tag,s4:servo4tag,upper:upperTag,fore:foreTag,grip:gripTag}};
RS.setPose=function(b,s,e,g){
  turret.rotation.y=(b-90)*D;shoulder.rotation.z=s*D;elbow.rotation.z=(e-180)*D;
  var z=C.GAPK*g/2+0.25;fL.position.z=z;fR.position.z=-z;
};
RS.fk=function(s,e){
  var a1=s*D,a2=a1+(e-180)*D,el=[C.L1*Math.cos(a1),C.H0+C.L1*Math.sin(a1)];
  function p(l){return [el[0]+l*Math.cos(a2),el[1]+l*Math.sin(a2)];}
  return {elbow:el,wrist:p(C.L2),grasp:p(C.L2+C.GP),tip:p(C.L2+C.GP+1.2)};
};
RS.minY=function(s,e){var f=RS.fk(s,e);return Math.min(f.elbow[1],f.wrist[1],f.tip[1],f.grasp[1]-1);};
RS.padPos=function(pad){return pad.position.clone();};
window.RS=RS;
})();
