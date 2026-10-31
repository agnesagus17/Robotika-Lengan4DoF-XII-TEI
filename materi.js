/* Halaman Materi: 12 topik pembelajaran, termasuk diagram blok dan flowchart. */
(function(){
function arrow(x1,y1,x2,y2,col,dash){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(col||'#38d2ff')+'" stroke-width="2.2"'+(dash?' stroke-dasharray="6 5"':'')+' marker-end="url(#ah)"/>';}
function box(x,y,w,h,txt,col,sub){
  var lines=txt.split('|'),t='';
  lines.forEach(function(l,i){t+='<text x="'+(x+w/2)+'" y="'+(y+h/2+(i-(lines.length-1)/2)*17+5)+'" text-anchor="middle" font-size="14" font-weight="600" fill="#e6eef9">'+l+'</text>';});
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="#0d1726" stroke="'+col+'" stroke-width="2"/>'+t;
}
var DEF='<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#38d2ff"/></marker></defs>';
function blockDiagram(){
  var s='<svg class="diagram" viewBox="0 0 960 330" role="img" aria-label="Diagram blok: barang, sensor photodioda, Arduino Uno, empat motor servo, mekanik robot, dan catu daya">'+DEF;
  s+=box(20,100,130,70,'Barang|di Pick Area','#ffd23f')+box(200,100,150,70,'Sensor|Photodioda','#c58bff')+box(400,100,150,70,'Arduino Uno|(pengendali)','#38d2ff')+box(600,100,150,70,'4 Motor Servo|(aktuator)','#4a90ff')+box(800,100,140,70,'Mekanik Robot|Base · Lengan · Gripper','#2fd67f');
  s+=arrow(150,135,198,135)+arrow(350,135,398,135)+arrow(550,135,598,135)+arrow(750,135,798,135);
  s+='<text x="175" y="124" text-anchor="middle" font-size="11" fill="#93a9c5">cahaya</text><text x="375" y="124" text-anchor="middle" font-size="11" fill="#93a9c5">ADC A0</text><text x="575" y="124" text-anchor="middle" font-size="11" fill="#93a9c5">PWM</text><text x="775" y="124" text-anchor="middle" font-size="11" fill="#93a9c5">torsi</text>';
  s+=box(600,240,150,60,'Catu Daya|5–6 V · 3 A','#ffb224')+arrow(675,240,675,172,'#ffb224');
  s+=box(400,240,150,60,'USB / Adaptor|5 V','#93a9c5')+arrow(475,240,475,172,'#93a9c5');
  s+=arrow(870,100,870,40,'#2fd67f',true)+'<path d="M870 40 H675 V98" fill="none" stroke="#2fd67f" stroke-width="2.2" stroke-dasharray="6 5" marker-end="url(#ah)"/>';
  s+='<text x="772" y="32" text-anchor="middle" font-size="11" fill="#93a9c5">umpan balik posisi (potensiometer di dalam servo)</text>';
  s+='<text x="20" y="40" font-size="12" fill="#93a9c5">MASUKAN</text><text x="400" y="40" font-size="12" fill="#93a9c5">PROSES</text><text x="600" y="62" font-size="12" fill="#93a9c5">KELUARAN</text>';
  s+='</svg>';return s;
}
function flowchart(){
  var cx=250,W=170,H=44,y=14,items=[
    ['t','MULAI'],['p','Inisialisasi: attach 4 servo,|robot ke Home Position'],['p','Baca sensor photodioda (A0)'],['d','Barang terdeteksi?|(ADC < 500)'],
    ['p','LED menyala. Base berputar|ke Pick Area (lengan terangkat)'],['p','Shoulder dan elbow turun,|gripper membuka'],['p','Gripper menutup (menjepit barang)'],
    ['p','Lengan mengangkat barang'],['p','Base berputar ke Place Area,|lengan turun'],['p','Gripper membuka (melepas barang)'],['p','Lengan naik, kembali ke Home|LED padam'],['p','Siap siklus berikutnya']
  ];
  var s='<svg class="diagram" viewBox="0 0 500 1000" role="img" aria-label="Diagram alir sistem kerja robot pick and place" style="max-width:520px;margin:0 auto">'+DEF,pos=[],i;
  for(i=0;i<items.length;i++){var h=items[i][0]==='d'?84:H;pos.push({y:y,h:h});y+=h+30;}
  items.forEach(function(it,i){
    var p=pos[i],t=it[1].split('|'),txt='',col='#38d2ff';
    t.forEach(function(l,k){txt+='<text x="'+cx+'" y="'+(p.y+p.h/2+(k-(t.length-1)/2)*16+5)+'" text-anchor="middle" font-size="13" font-weight="600" fill="#e6eef9">'+l+'</text>';});
    if(it[0]==='t')s+='<rect x="'+(cx-70)+'" y="'+p.y+'" width="140" height="'+p.h+'" rx="22" fill="#0d1726" stroke="#3de08e" stroke-width="2"/>'+txt;
    else if(it[0]==='d')s+='<polygon points="'+cx+','+p.y+' '+(cx+105)+','+(p.y+p.h/2)+' '+cx+','+(p.y+p.h)+' '+(cx-105)+','+(p.y+p.h/2)+'" fill="#0d1726" stroke="#ffb224" stroke-width="2"/>'+txt;
    else s+='<rect x="'+(cx-W/2-30)+'" y="'+p.y+'" width="'+(W+60)+'" height="'+p.h+'" rx="6" fill="#0d1726" stroke="'+col+'" stroke-width="2"/>'+txt;
    if(i<items.length-1)s+=arrow(cx,p.y+p.h,cx,pos[i+1].y-1);
  });
  var d=pos[3],r=cx+105;
  s+='<text x="'+(cx+8)+'" y="'+(d.y+d.h+20)+'" font-size="12" font-weight="700" fill="#3de08e">Ya</text>';
  s+='<polyline points="'+r+','+(d.y+d.h/2)+' 470,'+(d.y+d.h/2)+' 470,'+(pos[2].y+H/2)+' '+(cx+115)+','+(pos[2].y+H/2)+'" fill="none" stroke="#ffb224" stroke-width="2.2" marker-end="url(#ah)"/>';
  s+='<text x="'+(r+6)+'" y="'+(d.y+d.h/2-6)+'" font-size="12" font-weight="700" fill="#ffb224">Tidak</text>';
  var last=pos[pos.length-1];
  s+='<polyline points="'+(cx-115)+','+(last.y+H/2)+' 20,'+(last.y+H/2)+' 20,'+(pos[2].y+H/2)+' '+(cx-115)+','+(pos[2].y+H/2)+'" fill="none" stroke="#38d2ff" stroke-width="2.2" stroke-dasharray="6 5" marker-end="url(#ah)"/>';
  s+='</svg>';return s;
}
var items=[
['Pengertian robotika','<p>Robotika adalah cabang ilmu dan teknologi yang mempelajari perancangan, pembuatan, pemrograman, dan pengoperasian robot. Bidang ini menggabungkan tiga disiplin: <b>mekanika</b> (rangka dan gerak), <b>elektronika</b> (sensor, aktuator, pengendali), dan <b>pemrograman</b> (logika kerja).</p><p>Sistem robot sederhana terdiri dari tiga bagian: <b>sensor</b> sebagai masukan, <b>pengendali</b> sebagai pemroses, dan <b>aktuator</b> sebagai keluaran yang menggerakkan mekanik.</p>'],
['Pengertian robot manipulator','<p>Robot manipulator adalah robot berbentuk lengan yang tersusun dari beberapa <b>link</b> (batang) yang dihubungkan oleh <b>joint</b> (sendi). Ujung lengan disebut <b>end effector</b>, misalnya gripper, las, atau pengecat.</p><p>Robot manipulator banyak dipakai di industri untuk merakit, mengelas, mengecat, dan memindahkan barang (<i>pick and place</i>). Pada simulasi ini, keempat joint berputar (<i>revolute</i>) dan digerakkan motor servo.</p>'],
['Pengertian Degree of Freedom (DOF)','<p>Degree of Freedom (DOF) adalah jumlah gerakan bebas yang saling bebas pada sebuah robot. Setiap joint yang bergerak pada satu sumbu menambah satu DOF.</p><div class="scroll"><table><thead><tr><th>DOF</th><th>Nama</th><th>Gerakan</th><th>Servo</th></tr></thead><tbody><tr><td>1</td><td>Base Rotation</td><td>Berputar kiri dan kanan</td><td>Servo 1 · Pin 3</td></tr><tr><td>2</td><td>Shoulder</td><td>Lengan atas naik dan turun</td><td>Servo 2 · Pin 5</td></tr><tr><td>3</td><td>Elbow</td><td>Siku menekuk dan meluruskan</td><td>Servo 3 · Pin 6</td></tr><tr><td>4</td><td>Gripper</td><td>Penjepit membuka dan menutup</td><td>Servo 4 · Pin 9</td></tr></tbody></table></div><p style="margin-top:10px">Catatan: pada banyak buku, gripper disebut <i>end effector</i> dan tidak dihitung sebagai DOF posisi. Dalam pembelajaran ini gripper dihitung sebagai DOF ke-4 agar semua servo terhitung.</p>'],
['Pengenalan robot pemindah barang 4 DOF','<p>Robot ini memindahkan sebuah kotak kecil dari <b>Pick Area</b> (area pengambilan) ke <b>Place Area</b> (area tujuan). Setiap bagian diberi warna berbeda agar mudah dikenali:</p><ul><li><b style="color:var(--c-base)">Base</b> (abu-abu): dudukan tetap dan rumah Servo 1.</li><li><b style="color:var(--c-turret)">Turret</b> (oranye): bagian yang berputar, menopang Servo 2.</li><li><b style="color:var(--c-upper)">Lengan atas</b> (biru): panjang 14 cm pada model.</li><li><b style="color:var(--c-fore)">Lengan bawah</b> (hijau): panjang 12 cm pada model.</li><li><b style="color:var(--c-grip)">Gripper</b> (merah muda): penjepit dengan dua jari.</li></ul>'],
['Pengenalan Arduino Uno','<p>Arduino Uno adalah papan mikrokontroler berbasis <b>ATmega328P</b> yang berperan sebagai otak robot. Arduino membaca sensor, mengambil keputusan sesuai program, lalu mengirim sinyal ke servo.</p><ul><li>Tegangan kerja 5 V, clock 16 MHz.</li><li>14 pin digital (6 di antaranya mendukung PWM: 3, 5, 6, 9, 10, 11).</li><li>6 pin masukan analog A0–A5 dengan ADC 10-bit (nilai 0–1023).</li><li>Diprogram lewat USB menggunakan bahasa C++ pada Arduino IDE.</li></ul><p>Arus keluaran tiap pin terbatas (sekitar 20 mA), sehingga pin tidak boleh menyuplai motor secara langsung.</p>'],
['Pengenalan motor servo','<p>Motor servo adalah aktuator yang sudutnya dapat diatur. Di dalamnya ada <b>motor DC</b>, <b>roda gigi reduksi</b>, <b>potensiometer</b> sebagai sensor posisi, dan <b>rangkaian kontrol</b>. Rangkaian ini membandingkan sudut yang diminta dengan sudut sebenarnya, lalu memutar motor sampai keduanya sama (kendali loop tertutup).</p><ul><li>Sinyal kendali: PWM periode 20 ms (50 Hz).</li><li>Lebar pulsa sekitar 1 ms untuk 0°, 1,5 ms untuk 90°, dan 2 ms untuk 180°.</li><li>Kabel: coklat atau hitam = GND, merah = VCC (4,8–6 V), oranye atau kuning = sinyal.</li><li>Pada Arduino, perintah <code>servo.write(sudut)</code> dari library Servo.h membuat pulsa tersebut.</li></ul>'],
['Pengenalan sensor photodioda','<p>Photodioda adalah dioda semikonduktor yang peka terhadap cahaya. Saat diberi bias mundur dan terkena cahaya, arus yang mengalir sebanding dengan intensitas cahaya. Modul sensor mengubah arus ini menjadi tegangan analog yang dibaca pin A0.</p><p>Pada simulasi ini, sinar dipancarkan dari satu sisi Pick Area ke photodioda di sisi seberang. Saat sinar penuh, nilai ADC tinggi (sekitar 850). Saat barang menghalangi sinar, nilai turun (sekitar 170). Dengan ambang 500, nilai di bawah ambang berarti <b>TERDETEKSI</b>.</p><p>Arah perubahan nilai bergantung pada rangkaian modul yang dipakai, sehingga ambang selalu diuji dengan Serial Monitor sebelum dipakai.</p>'],
['Sistem kerja robot pick and place','<p>Prinsip kerjanya <b>masukan, proses, keluaran</b>: photodioda mendeteksi barang, Arduino memproses sinyal, servo menggerakkan lengan.</p><ol><li><b>Deteksi</b>: barang di Pick Area menghalangi sinar, nilai A0 turun, LED menyala.</li><li><b>Pengambilan</b>: base berputar, lengan turun, gripper membuka lalu menutup.</li><li><b>Pemindahan</b>: lengan diangkat, base berputar ke Place Area.</li><li><b>Peletakan</b>: lengan turun, gripper membuka.</li><li><b>Kembali</b>: lengan naik lalu robot ke Home Position.</li></ol><p>Urutan gerak dibuat aman: lengan <b>diangkat dahulu</b> sebelum base berputar supaya gripper atau barang tidak menabrak bagian lain. Rincian 15 langkah ada pada tab Simulasi.</p>'],
['Diagram blok sistem robot','<p>Diagram blok menunjukkan aliran sinyal antarkomponen. Garis putus-putus hijau adalah umpan balik posisi yang terjadi di dalam servo.</p>'+blockDiagram()],
['Diagram alir (flowchart) sistem kerja robot','<p>Diagram alir menggambarkan urutan keputusan dan proses pada program Arduino.</p>'+flowchart()],
['Diagram wiring rangkaian','<p>Empat servo terhubung ke pin 3, 5, 6, dan 9. Photodioda ke A0 dan LED indikator ke pin 13. Daya servo berasal dari catu daya eksternal, dengan GND yang disatukan dengan GND Arduino.</p><p><a href="#rangkaian" data-go="rangkaian" style="color:var(--cyan)">Buka halaman Rangkaian</a> untuk diagram lengkap dan tabel pin.</p>'],
['Contoh program Arduino Uno (C++)','<p>Program memakai library <code>Servo.h</code>, membaca sensor di A0, dan menggerakkan servo dengan fungsi gerak halus. Setiap bagian diberi komentar.</p><p><a href="#program" data-go="program" style="color:var(--cyan)">Buka halaman Program Arduino</a> untuk melihat dan menyalin kode lengkap.</p>']
];
window.renderMateri=function(el){
  var h='<div class="page"><div class="card"><h2>Menu pembelajaran</h2><p style="margin:0;color:var(--muted)">Buka setiap topik secara berurutan. Gunakan tab Simulasi untuk melihat konsepnya bergerak.</p></div>';
  items.forEach(function(it,i){h+='<details class="mat"'+(i===0?' open':'')+'><summary><span class="n">'+(i+1)+'</span>'+it[0]+'</summary><div class="body">'+it[1]+'</div></details>';});
  el.innerHTML=h+'</div>';
};
})();
