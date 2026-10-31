/* Halaman Rangkaian: diagram wiring Arduino Uno + 4 servo + photodioda + LED, tabel pin, catatan catu daya. */
(function(){
function wirePath(pts,col,w,dash){return '<polyline points="'+pts.map(function(p){return p.join(',');}).join(' ')+'" fill="none" stroke="'+col+'" stroke-width="'+(w||2.4)+'" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';}
function dot(x,y,c){return '<circle cx="'+x+'" cy="'+y+'" r="4" fill="'+c+'"/>';}
function pinLbl(y,txt,sub){return '<text x="284" y="'+(y+4)+'" text-anchor="end" font-size="14" font-weight="600" fill="#e6eef9">'+txt+'</text>'+(sub?'<text x="196" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="#93a9c5">'+sub+'</text>':'')+'<circle cx="300" cy="'+y+'" r="5" fill="#e6eef9"/>';}
function servoBox(y,name,col,id){
  return '<rect x="640" y="'+y+'" width="260" height="70" rx="6" fill="#0d1726" stroke="'+col+'" stroke-width="2"/>'+
  '<rect x="640" y="'+y+'" width="8" height="70" fill="'+col+'"/>'+
  '<text x="722" y="'+(y+26)+'" font-size="15" font-weight="700" fill="#e6eef9">'+name+'</text>'+
  '<text x="722" y="'+(y+46)+'" font-size="12" fill="#93a9c5">Motor servo</text>'+
  [['SIG',18,'#ff9f40'],['V+',35,'#ff6270'],['GND',52,'#cbd5e1']].map(function(t){return '<circle cx="640" cy="'+(y+t[1])+'" r="4.5" fill="'+t[2]+'"/><text x="656" y="'+(y+t[1]+4)+'" font-size="11" fill="#e6eef9">'+t[0]+'</text>';}).join('');
}
function diagram(){
  var s='<svg class="diagram" viewBox="0 0 1000 720" role="img" aria-label="Diagram wiring Arduino Uno dengan empat motor servo, sensor photodioda, LED indikator, dan catu daya eksternal">';
  /* Arduino */
  s+='<rect x="40" y="40" width="260" height="440" rx="10" fill="#0e5a73" stroke="#38d2ff" stroke-width="2"/>';
  s+='<text x="170" y="74" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">ARDUINO UNO</text>';
  s+='<text x="170" y="96" text-anchor="middle" font-size="12" fill="#bfe9f6">ATmega328P · 5 V</text>';
  s+='<rect x="64" y="420" width="70" height="44" rx="4" fill="#0a1a26"/><text x="99" y="446" text-anchor="middle" font-size="11" fill="#93a9c5">USB</text>';
  s+=pinLbl(110,'D3','~PWM · Servo 1')+pinLbl(150,'D5','~PWM · Servo 2')+pinLbl(190,'D6','~PWM · Servo 3')+pinLbl(230,'D9','~PWM · Servo 4')+pinLbl(270,'D13','LED indikator')+pinLbl(310,'A0','Photodioda (ADC)')+pinLbl(395,'5V','')+pinLbl(440,'GND','');
  /* Servo */
  s+=servoBox(60,'Servo 1 · Base','#ff8a1f')+servoBox(150,'Servo 2 · Shoulder','#4a90ff')+servoBox(240,'Servo 3 · Elbow','#2fd67f')+servoBox(330,'Servo 4 · Gripper','#ff5577');
  /* Sensor */
  s+='<rect x="640" y="410" width="260" height="80" rx="6" fill="#0d1726" stroke="#c58bff" stroke-width="2"/><rect x="640" y="410" width="8" height="80" fill="#c58bff"/>';
  s+='<text x="722" y="436" font-size="15" font-weight="700" fill="#e6eef9">Modul Photodioda</text><text x="722" y="456" font-size="12" fill="#93a9c5">Keluaran analog (AO)</text>';
  [['VCC',430,'#ff6270'],['GND',450,'#cbd5e1'],['AO',470,'#c58bff']].forEach(function(t){s+='<circle cx="640" cy="'+t[1]+'" r="4.5" fill="'+t[2]+'"/><text x="656" y="'+(t[1]+4)+'" font-size="11" fill="#e6eef9">'+t[0]+'</text>';});
  /* LED */
  s+='<rect x="640" y="510" width="260" height="70" rx="6" fill="#0d1726" stroke="#ff6270" stroke-width="2"/><rect x="640" y="510" width="8" height="70" fill="#ff6270"/>';
  s+='<text x="722" y="536" font-size="15" font-weight="700" fill="#e6eef9">LED Indikator</text><text x="722" y="556" font-size="12" fill="#93a9c5">+ resistor 220 Ω</text>';
  s+='<circle cx="640" cy="530" r="4.5" fill="#e6ff4d"/><text x="656" y="534" font-size="11" fill="#e6eef9">A (+)</text><circle cx="640" cy="555" r="4.5" fill="#cbd5e1"/><text x="656" y="559" font-size="11" fill="#e6eef9">K (–)</text>';
  /* Catu daya */
  s+='<rect x="330" y="600" width="170" height="90" rx="8" fill="#161f2e" stroke="#ffb224" stroke-width="2"/><text x="415" y="636" text-anchor="middle" font-size="15" font-weight="700" fill="#e6eef9">CATU DAYA</text><text x="415" y="656" text-anchor="middle" font-size="12" fill="#93a9c5">5–6 V DC · min. 3 A</text><text x="415" y="676" text-anchor="middle" font-size="12" fill="#93a9c5">eksternal</text>';
  s+='<circle cx="500" cy="625" r="5" fill="#ff6270"/><text x="512" y="630" font-size="13" fill="#ff6270" font-weight="700"></text><circle cx="500" cy="660" r="5" fill="#cbd5e1"/>';
  /* Rel daya */
  s+=wirePath([[500,625],[520,625],[520,95]],'#ff6270',3.2)+wirePath([[500,660],[570,660],[570,112]],'#cbd5e1',3.2);
  s+='<text x="505" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#ff6270">+ 5–6 V</text><text x="590" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#cbd5e1">GND</text>';
  [95,185,275,365].forEach(function(y){s+=wirePath([[520,y],[640,y]],'#ff6270',2.6)+dot(520,y,'#ff6270');});
  [112,202,292,382,450,555].forEach(function(y){s+=wirePath([[570,y],[640,y]],'#cbd5e1',2.6)+dot(570,y,'#cbd5e1');});
  /* Sinyal */
  s+=wirePath([[300,110],[360,110],[360,78],[640,78]],'#ff9f40',2.6);
  s+=wirePath([[300,150],[380,150],[380,168],[640,168]],'#4a90ff',2.6);
  s+=wirePath([[300,190],[400,190],[400,258],[640,258]],'#2fd67f',2.6);
  s+=wirePath([[300,230],[420,230],[420,348],[640,348]],'#ff5577',2.6);
  s+=wirePath([[300,270],[460,270],[460,530],[596,530]],'#e6ff4d',2.6)+wirePath([[624,530],[640,530]],'#e6ff4d',2.6);
  s+='<rect x="596" y="522" width="28" height="16" rx="2" fill="#0d1726" stroke="#e6ff4d" stroke-width="2"/><text x="610" y="552" text-anchor="middle" font-size="10" fill="#e6ff4d">220 Ω</text>';
  s+=wirePath([[300,310],[440,310],[440,470],[640,470]],'#c58bff',2.6);
  s+=wirePath([[300,395],[480,395],[480,430],[640,430]],'#ff6270',2.2,'6 4');
  s+=wirePath([[300,440],[570,440]],'#cbd5e1',2.6)+dot(570,440,'#cbd5e1');
  s+='<g font-size="12" fill="#93a9c5"><text x="40" y="630">GND Arduino dihubungkan</text><text x="40" y="648">ke GND catu daya</text><text x="40" y="666">(GND bersama).</text></g>';
  /* Legenda */
  s+='<g font-size="12" fill="#e6eef9"><rect x="40" y="520" width="14" height="4" fill="#ff9f40"/><text x="60" y="526">Sinyal PWM servo</text><rect x="40" y="540" width="14" height="4" fill="#c58bff"/><text x="60" y="546">Sinyal analog sensor</text><rect x="40" y="560" width="14" height="4" fill="#ff6270"/><text x="60" y="566">Daya + (rel servo; garis putus: 5 V Arduino)</text><rect x="40" y="580" width="14" height="4" fill="#cbd5e1"/><text x="60" y="586">GND bersama</text></g>';
  s+='</svg>';
  return s;
}
function tbl(rows){return '<div class="scroll"><table><thead><tr><th>Komponen</th><th>Pin komponen</th><th>Terhubung ke</th><th>Fungsi</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td><b>'+r[2]+'</b></td><td>'+r[3]+'</td></tr>';}).join('')+'</tbody></table></div>';}
window.renderRangkaian=function(el){
  var rows=[
    ['Servo 1 · Base','Signal (oranye/kuning)','Pin 3 (D3, PWM)','Mengatur sudut putar base ke kiri dan kanan.'],
    ['Servo 2 · Shoulder','Signal','Pin 5 (D5, PWM)','Mengatur lengan atas naik dan turun.'],
    ['Servo 3 · Elbow','Signal','Pin 6 (D6, PWM)','Mengatur siku menekuk dan meluruskan.'],
    ['Servo 4 · Gripper','Signal','Pin 9 (D9, PWM)','Membuka dan menutup penjepit.'],
    ['Keempat servo','V+ (merah)','+ Catu daya 5–6 V','Daya motor. Jangan diambil dari pin 5V Arduino.'],
    ['Keempat servo','GND (coklat/hitam)','GND catu daya = GND Arduino','Jalur balik arus dan acuan sinyal PWM.'],
    ['Modul photodioda','AO (keluaran analog)','Pin A0','Mengirim tegangan yang menggambarkan intensitas cahaya (ADC 0–1023).'],
    ['Modul photodioda','VCC / GND','5V / GND Arduino','Daya modul sensor.'],
    ['LED indikator','Anoda (+) lewat resistor 220 Ω','Pin 13 (D13)','Menyala saat barang terdeteksi.'],
    ['LED indikator','Katoda (–)','GND','Jalur balik arus LED.']
  ];
  el.innerHTML=
  '<div class="page">'+
  '<div class="card"><h2>Diagram wiring</h2><p style="margin:0 0 10px;color:var(--muted)">Arduino Uno ke empat motor servo, sensor photodioda, dan LED indikator. Warna kabel pada diagram sama dengan warna kabel jumper pada model 3D.</p>'+diagram()+'</div>'+
  '<div class="two">'+
  '<div class="card"><h2>Konfigurasi pin dan jalur koneksi</h2>'+tbl(rows)+'</div>'+
  '<div style="display:flex;flex-direction:column;gap:12px;min-width:0">'+
  '<div class="warn-box"><b>Catu daya servo.</b> Empat servo yang bergerak bersamaan menarik arus besar, bisa lebih dari 1 A per servo saat menahan beban. Pin 5V Arduino tidak mampu menyuplainya, sehingga Arduino bisa restart. Pakai catu daya eksternal 5–6 V, minimal 3 A, dan sambungkan GND catu daya dengan GND Arduino.</div>'+
  '<div class="card"><h3>Penjelasan fungsi pin</h3><ul style="margin:0;padding-left:18px">'+
  '<li><b>D3, D5, D6, D9</b>: pin digital dengan PWM. Library Servo.h mengirim pulsa 1–2 ms setiap 20 ms ke pin ini.</li>'+
  '<li><b>A0</b>: masukan analog. ADC 10-bit mengubah 0–5 V menjadi 0–1023.</li>'+
  '<li><b>D13</b>: keluaran digital HIGH atau LOW untuk menyalakan LED. Pin ini juga terhubung ke LED bawaan papan (L).</li>'+
  '<li><b>5V dan GND</b>: daya modul sensor. GND adalah acuan bersama semua komponen.</li></ul></div>'+
  '<div class="card"><h3>Saran perakitan</h3><ul style="margin:0;padding-left:18px">'+
  '<li>Pasang kapasitor 470–1000 µF pada rel daya servo untuk meredam lonjakan arus.</li>'+
  '<li>Sambungkan GND lebih dulu, daya terakhir.</li>'+
  '<li>Jangan memasang servo dengan polaritas terbalik.</li>'+
  '<li>Uji tiap servo satu per satu sebelum dirakit pada rangka.</li></ul></div>'+
  '</div></div></div>';
};
})();
