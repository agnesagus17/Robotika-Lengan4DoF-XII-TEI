/* Elektronika 3D: Arduino Uno, catu daya, sensor photodioda + LED indikator, kabel jumper, label, kamera. */
(function(){
var RS=window.RS;if(!RS)return;
var T=RS.T,scene=RS.scene,camera=RS.camera,controls=RS.controls,stage=RS.stage,M=RS.M,bx=RS.bx,cy=RS.cy,anchor=RS.anchor,mat=RS.mat,C=RS.C;

/* Arduino Uno */
var A=new T.Group();A.position.set(-19,0,5);A.rotation.y=-Math.PI/2;A.scale.set(1.5,1.5,1.5);scene.add(A);
bx(A,10.4,0.6,8.2,M.dark,0,0.3,0);
bx(A,9.6,0.3,7.4,mat(0x0f6f87,0.45,0.1),0,0.75,0);
bx(A,3.4,2.4,3.0,M.metal,-4.6,2.1,-1.6);
bx(A,2.8,2.0,3.0,M.dark,-4.9,1.9,2.2);
bx(A,8.4,0.9,0.6,M.dark,0.6,1.35,-3.2);
bx(A,4.0,0.9,0.6,M.dark,-2.6,1.35,3.2);
bx(A,5.2,0.9,0.6,M.dark,2.0,1.35,3.2);
bx(A,3.6,0.5,1.0,M.dark,1.6,1.15,0.4);
bx(A,1.0,0.4,0.5,M.metal,-1.0,1.1,0.0);
cy(A,0.45,0.45,0.4,14,mat(0xd9323f,0.5),-3.4,1.1,-2.1);
var onboardLed=bx(A,0.7,0.25,0.5,mat(0x4a3200,0.5),1.8,0.98,-2.3);
var lbl=new T.Mesh(new T.PlaneGeometry(5.6,1.4),new T.MeshBasicMaterial({map:RS.txtTex('ARDUINO UNO',5.6,1.4,'#ffffff',null),transparent:true}));
lbl.rotation.x=-Math.PI/2;lbl.position.set(0.9,0.93,-1.0);A.add(lbl);
function pin(x,z,col){bx(A,0.3,0.6,0.3,mat(col,0.4,0,col),x,2.0,z);return anchor(A,x,2.1,z);}
var P={D3:pin(2.4,-3.2,0xff8a1f),D5:pin(1.2,-3.2,0x4a90ff),D6:pin(0.6,-3.2,0x2fd67f),D9:pin(-0.8,-3.2,0xff5577),D13:pin(-2.6,-3.2,0xe6ff4d),
  A0:pin(0.6,3.2,0xc58bff),GND:pin(-2.6,3.2,0x5b6575)};
var ardTag=anchor(A,0,3.4,0);

/* Catu daya */
var PS=new T.Group();PS.position.set(-19,0,-14);scene.add(PS);
bx(PS,11,5,7.5,mat(0x232c3a,0.5,0.6),0,2.5,0);
var pl=new T.Mesh(new T.PlaneGeometry(9,3),new T.MeshBasicMaterial({map:RS.txtTex('CATU DAYA 5–6 V · 3 A',9,3,'#38d2ff','#0b1624','600'),transparent:true}));
pl.rotation.x=-Math.PI/2;pl.position.set(-0.2,5.02,0);PS.add(pl);
bx(PS,1.0,1.2,1.0,mat(0xd92b2b,0.5),5.8,2.6,-1.6);bx(PS,1.0,1.2,1.0,M.dark,5.8,2.6,1.6);
bx(PS,0.3,0.5,0.5,mat(0x3de08e,0.5,0,0x3de08e),5.6,4.0,0);
var psPlus=anchor(PS,6.5,2.9,-1.6),psTag=anchor(PS,0,6,0);

/* Sensor photodioda + LED indikator (di area pick) */
var pp=RS.pickPad;
bx(pp,1.2,5,1.2,M.dark,0,2.5,-5.9);bx(pp,1.2,5,1.2,M.dark,0,2.5,5.9);
bx(pp,1.5,1.5,0.7,mat(0x1d9bc7,0.4,0.2,0x0a5a73),0,1.5,-5.1);
var recHead=new T.Mesh(new T.SphereGeometry(0.62,18,12),mat(0x7a6cff,0.2,0.1,0x1a1670));recHead.position.set(0,1.5,5.0);pp.add(recHead);
bx(pp,2.4,0.2,3.0,mat(0x1f8a55,0.6),0,5.1,5.9);
bx(pp,0.9,0.5,0.9,M.dark,0,5.4,5.5);
var ledMat=mat(0x5a1018,0.3,0,0x000000);
var ledMesh=new T.Mesh(new T.SphereGeometry(0.55,18,12),ledMat);ledMesh.position.set(0,5.95,6.3);pp.add(ledMesh);
var ledLight=new T.PointLight(0xff3040,0,26);ledLight.position.set(0,6.2,6.3);pp.add(ledLight);
var sensorAnchor=anchor(pp,0,5.0,5.9),ledAnchor=anchor(pp,0,5.9,6.3),sensTag=anchor(pp,0,2.2,5.9);
var beamGeo=new T.CylinderGeometry(0.11,0.11,1,8);beamGeo.rotateX(Math.PI/2);
var beamMat=new T.MeshBasicMaterial({color:0x38d2ff,transparent:true,opacity:0.85});
var beam=new T.Mesh(beamGeo,beamMat);pp.add(beam);
RS.setSensor=function(blocked){
  var z0=-4.7,z1=blocked?-C.CUBE/2:4.7,L=z1-z0;beam.scale.set(1,1,L);beam.position.set(0,1.5,z0+L/2);
  beamMat.color.setHex(blocked?0xff6270:0x38d2ff);
  recHead.material.emissiveIntensity=blocked?0.2:1.2;
};
RS.setLed=function(on){
  ledMat.emissive.setHex(on?0xff2a3a:0x000000);ledMat.emissiveIntensity=on?1.6:0;ledLight.intensity=on?1.4:0;
  onboardLed.material.emissive.setHex(on?0xffb224:0x000000);onboardLed.material.emissiveIntensity=on?1.5:0;
};
RS.setSensor(false);RS.setLed(false);

/* Kabel jumper */
var wires=[];
var wTag=new T.Object3D();scene.add(wTag);
function wire(a,b,col,sag){
  var m=new T.Mesh(new T.BufferGeometry(),new T.MeshStandardMaterial({color:col,roughness:0.5,emissive:col,emissiveIntensity:0.18}));m.frustumCulled=false;scene.add(m);
  wires.push({a:a,b:b,m:m,sag:sag,la:new T.Vector3(1e9,0,0),lb:new T.Vector3(),pa:new T.Vector3(),pb:new T.Vector3()});
}
var AN=RS.anchors;
wire(P.D3,AN.servo1,0xff8a1f,3.0);wire(P.D5,AN.servo2,0x4a90ff,4.5);wire(P.D6,AN.servo3,0x2fd67f,6.0);wire(P.D9,AN.servo4,0xff5577,7.5);
wire(P.A0,sensorAnchor,0xc58bff,2.5);wire(P.D13,ledAnchor,0xe6ff4d,3.5);
wire(psPlus,AN.servo1,0xff2b2b,2.0);wire(psPlus,AN.servo2,0xff2b2b,3.5);wire(psPlus,AN.servo3,0xff2b2b,5.0);wire(psPlus,AN.servo4,0xff2b2b,6.5);
wire(psPlus,P.GND,0x5b6575,1.5);
var pm=new T.Vector3(),pc=new T.Vector3();
RS.updateWires=function(){
  wires.forEach(function(w,i){
    w.a.getWorldPosition(w.pa);w.b.getWorldPosition(w.pb);
    if(w.pa.distanceToSquared(w.la)<1e-4&&w.pb.distanceToSquared(w.lb)<1e-4)return;
    w.la.copy(w.pa);w.lb.copy(w.pb);
    pm.addVectors(w.pa,w.pb).multiplyScalar(0.5);pc.copy(pm);pc.y=Math.max(w.pa.y,w.pb.y)+w.sag*0.9+w.pa.distanceTo(w.pb)*0.04;
    var curve=new T.QuadraticBezierCurve3(w.pa.clone(),pc.clone(),w.pb.clone());
    w.m.geometry.dispose();w.m.geometry=new T.TubeGeometry(curve,18,0.15,5,false);
    if(i===0)curve.getPoint(0.5,wTag.position);
  });
};
RS.setWiresVisible=function(v){wires.forEach(function(w){w.m.visible=v;});};

/* Label komponen */
var tagsEl=document.getElementById('tags'),tagList=[],tagsOn=true;
function addTag(txt,obj,col,opt){
  var d=document.createElement('div');d.className='tag';d.innerHTML='<i style="background:'+(col||'var(--cyan)')+'"></i>'+txt;tagsEl.appendChild(d);
  tagList.push({el:d,obj:obj,vis:opt&&opt.vis,dx:(opt&&opt.dx)||6,dy:(opt&&opt.dy)||-9});
}
var TA=RS.tagAnchors,turretTop=anchor(RS.robot,0,7.2,0);
addTag('Arduino Uno',ardTag);addTag('Catu Daya',psTag);
addTag('Servo 1 · Base',TA.s1,'var(--c-turret)',{dx:14,dy:4});addTag('Servo 2 · Shoulder',TA.s2,'var(--c-upper)',{dx:-150,dy:-26});
addTag('Servo 3 · Elbow',TA.s3,'var(--c-fore)',{dx:-120,dy:-30});addTag('Servo 4 · Gripper',TA.s4,'var(--c-grip)',{dx:10,dy:-30});
addTag('Lengan Atas',TA.upper,'var(--c-upper)',{dx:-100,dy:-4});addTag('Lengan Bawah',TA.fore,'var(--c-fore)',{dx:10,dy:-9});addTag('Gripper',TA.grip,'var(--c-grip)',{dx:10,dy:6});
addTag('Photodioda',sensTag,'#c58bff',{dx:10,dy:10});addTag('LED Indikator',ledAnchor,'#ff6270',{dx:10,dy:-14});addTag('Kabel Jumper',wTag,'#e6ff4d',{dx:6,dy:-20});
addTag('Barang',RS.cube,'#ffd23f',{vis:function(){return RS.cube.visible;}});
var pickTag=anchor(RS.pickPad,0,0.5,-2.4),placeTag=anchor(RS.placePad,0,0.5,-2.4);
addTag('Pick Area',pickTag,'#3de08e');addTag('Place Area',placeTag,'#ffb224');
var tv=new T.Vector3();
RS.setTags=function(v){tagsOn=v;tagsEl.style.display=v?'block':'none';};
RS.updateTags=function(){
  if(!tagsOn)return;var W=stage.clientWidth,H=stage.clientHeight;
  tagList.forEach(function(t){
    t.obj.getWorldPosition(tv);tv.project(camera);
    var show=tv.z<1&&(!t.vis||t.vis());
    if(!show){t.el.style.display='none';return;}
    t.el.style.display='flex';
    t.el.style.transform='translate('+Math.round((tv.x*0.5+0.5)*W+t.dx)+'px,'+Math.round((-tv.y*0.5+0.5)*H+t.dy)+'px)';
  });
};

/* Kamera */
var camPresets={iso:[54,40,60],front:[92,24,0.01],side:[0.01,24,92],top:[0.01,112,0.1]};
var camTw=null;
RS.camTo=function(name){var p=camPresets[name];if(!p)return;camTw={from:camera.position.clone(),to:new T.Vector3(p[0],p[1],p[2]),t:0};};
RS.camTo('iso');camera.position.set(54,40,60);camTw=null;
controls.addEventListener('start',function(){camTw=null;});
RS.resize=function(){var w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;RS.renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
  var base=w/h<1.2?1.35:1;camera.fov=36*base;camera.updateProjectionMatrix();};
if(window.ResizeObserver)new ResizeObserver(RS.resize).observe(stage);else window.addEventListener('resize',RS.resize);
RS.render=function(dt){
  if(camTw){camTw.t=Math.min(1,camTw.t+dt/0.9);var k=camTw.t*camTw.t*(3-2*camTw.t);camera.position.lerpVectors(camTw.from,camTw.to,k);if(camTw.t>=1)camTw=null;}
  controls.update();RS.updateWires();RS.updateTags();RS.renderer.render(scene,camera);
};
RS.resize();
})();
