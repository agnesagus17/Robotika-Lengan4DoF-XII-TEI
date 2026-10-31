/* Halaman Evaluasi: kuis pilihan ganda 12 soal, nilai otomatis, pembahasan. */
(function(){
var Q=[
{q:'Robot pemindah barang pada simulasi memiliki empat DOF. Urutan DOF 1 sampai DOF 4 adalah ...',o:['Base Rotation, Shoulder, Elbow, Gripper','Shoulder, Base Rotation, Gripper, Elbow','Gripper, Elbow, Shoulder, Base Rotation','Elbow, Shoulder, Base Rotation, Gripper'],a:0,e:'DOF 1 adalah Base Rotation (memutar robot), DOF 2 Shoulder (lengan atas naik turun), DOF 3 Elbow (siku menekuk) dan DOF 4 Gripper (penjepit membuka dan menutup).'},
{q:'Apa yang dimaksud dengan Degree of Freedom (DOF) pada robot?',o:['Jumlah baterai yang dipakai robot','Jumlah gerakan bebas yang saling bebas pada robot','Kecepatan putar motor dalam rpm','Jumlah sensor yang terpasang'],a:1,e:'DOF menyatakan banyaknya gerakan bebas yang saling bebas. Setiap joint yang bergerak pada satu sumbu menambah satu DOF.'},
{q:'Peran Arduino Uno pada sistem robot ini adalah ...',o:['Memberi daya langsung ke semua servo','Menurunkan kecepatan motor servo','Menghasilkan cahaya untuk sensor','Membaca sensor, memproses data, dan mengirim sinyal kendali ke servo'],a:3,e:'Arduino adalah pengendali. Ia membaca sinyal photodioda, mengambil keputusan menurut program, lalu mengirim sinyal PWM ke servo. Daya servo berasal dari catu daya eksternal.'},
{q:'Pada diagram wiring, Servo Gripper dihubungkan ke pin ...',o:['3','5','6','9'],a:3,e:'Servo Base pin 3, Shoulder pin 5, Elbow pin 6, dan Gripper pin 9. Keempatnya adalah pin PWM.'},
{q:'Motor servo disebut aktuator posisi karena ...',o:['Sudut putarnya dapat diatur melalui sinyal PWM','Selalu berputar terus-menerus','Hanya dapat berputar satu arah','Tidak memerlukan catu daya'],a:0,e:'Servo berisi motor DC, gear, potensiometer, dan rangkaian kontrol. Rangkaian ini memutar poros sampai sudutnya sama dengan sudut yang diminta lewat lebar pulsa PWM.'},
{q:'Lebar pulsa PWM untuk memerintahkan servo ke sudut sekitar 90° adalah ...',o:['0,5 ms','1,5 ms','3 ms','20 ms'],a:1,e:'Sekitar 1 ms untuk 0°, 1,5 ms untuk 90°, dan 2 ms untuk 180°. Periode pulsa 20 ms (50 Hz). Angka 20 ms adalah periode, bukan lebar pulsa.'},
{q:'Fungsi sensor photodioda pada robot ini adalah ...',o:['Mengukur suhu barang','Mengukur berat barang','Mendeteksi keberadaan barang melalui perubahan intensitas cahaya','Menggerakkan gripper'],a:2,e:'Photodioda mengubah intensitas cahaya menjadi sinyal listrik. Barang yang menghalangi sinar mengubah nilai pada A0, sehingga keberadaan barang dapat dideteksi.'},
{q:'Pada simulasi, barang menghalangi sinar sensor. Apa yang terjadi pada nilai ADC A0 dan LED indikator?',o:['Nilai naik di atas ambang, LED padam','Nilai tidak berubah, LED padam','Nilai turun di bawah ambang 500, LED menyala','Nilai menjadi 0 selamanya, LED berkedip'],a:2,e:'Saat sinar terhalang, nilai ADC turun (sekitar 170) sehingga lebih kecil dari ambang 500. Program menganggap barang terdeteksi dan menyalakan LED di pin 13.'},
{q:'Urutan proses pemindahan barang yang benar adalah ...',o:['Gripper menutup, sensor mendeteksi, base berputar, gripper membuka','Base berputar ke Place Area, gripper menutup, sensor mendeteksi, kembali ke Home','Sensor mendeteksi, Arduino memproses, base berputar ke barang, gripper membuka, gripper menutup, angkat, putar ke Place Area, lepas, kembali ke Home','Gripper membuka, kembali ke Home, sensor mendeteksi, gripper menutup'],a:2,e:'Robot lebih dulu mendeteksi dan memproses sinyal. Setelah itu mengambil (putar, buka, tutup), memindahkan (angkat, putar ke Place Area), melepas, dan kembali ke Home.'},
{q:'Mengapa servo memakai catu daya eksternal dan GND-nya disatukan dengan GND Arduino?',o:['Agar servo bergerak lebih lambat','Servo menarik arus besar yang tidak sanggup disuplai pin Arduino, dan GND bersama menjadi acuan sinyal','Agar Arduino tidak perlu diprogram','Agar sensor tidak membaca cahaya'],a:1,e:'Empat servo yang bergerak bersamaan menarik arus besar. Pin Arduino hanya aman sekitar 20 mA dan pin 5V terbatas. GND yang disatukan membuat sinyal PWM punya acuan tegangan yang sama.'},
{q:'Perintah pada library Servo.h untuk mengatur sudut servo menjadi 90° adalah ...',o:['servo.read(90)','servo.attach(90)','servo.write(90)','servo.delay(90)'],a:2,e:'servo.write(sudut) mengirim pulsa PWM sesuai sudut 0–180°. attach() menghubungkan objek servo ke pin, sedangkan read() membaca sudut terakhir yang diperintahkan.'},
{q:'Dalam program, lengan robot diangkat ke pose aman sebelum base berputar. Tujuannya adalah ...',o:['Menghemat memori Arduino','Menambah kecepatan sensor','Mencegah tabrakan gripper atau barang dengan bagian robot dan benda sekitarnya','Mengurangi jumlah servo'],a:2,e:'Saat lengan terangkat, gripper dan barang berada di atas meja dan area lain, sehingga aman ketika base berputar. Urutan gerak yang aman adalah bagian dari perancangan sistem robotika.'}
];
var st={i:0,ans:[],done:false};
var el;
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function render(){
  if(st.done)return renderResult();
  var q=Q[st.i],pct=Math.round(st.i/Q.length*100),answered=st.ans.filter(function(x){return x!==undefined;}).length;
  var h='<div class="quiz card"><h2>Evaluasi pembelajaran</h2><div style="display:flex;justify-content:space-between;font-size:14px;color:var(--muted)"><span>Soal '+(st.i+1)+' dari '+Q.length+'</span><span>Terjawab '+answered+'</span></div><div class="qprog" aria-hidden="true"><b style="width:'+pct+'%"></b></div>'+
  '<p class="qtext" id="qt">'+esc(q.q)+'</p><div class="opts" role="radiogroup" aria-labelledby="qt">';
  q.o.forEach(function(o,k){h+='<button class="opt" type="button" role="radio" aria-checked="'+(st.ans[st.i]===k?'true':'false')+'" data-k="'+k+'"><span class="l">'+'ABCD'[k]+'</span><span>'+esc(o)+'</span></button>';});
  h+='</div><div class="qnav"><button class="btn" type="button" id="qPrev"'+(st.i===0?' disabled':'')+'>Sebelumnya</button>';
  var last=st.i===Q.length-1;
  h+=last?'<button class="btn" type="button" id="qFin" style="background:var(--green);border-color:var(--green);color:#052514;font-weight:600"'+(answered<Q.length?' disabled':'')+'>Selesai dan lihat nilai</button>':'<button class="btn" type="button" id="qNext"'+(st.ans[st.i]===undefined?' disabled':'')+'>Berikutnya</button>';
  h+='</div>'+(last&&answered<Q.length?'<p class="hint">Jawab semua soal untuk melihat nilai. Soal belum terjawab: '+(Q.length-answered)+'.</p>':'')+'</div>';
  el.innerHTML='<div class="page">'+h+'</div>';
  Array.prototype.forEach.call(el.querySelectorAll('.opt'),function(b){b.addEventListener('click',function(){st.ans[st.i]=parseInt(b.getAttribute('data-k'),10);render();var f=el.querySelector('.opt[aria-checked="true"]');if(f)f.focus();});});
  var p=document.getElementById('qPrev');if(p)p.addEventListener('click',function(){st.i--;render();});
  var n=document.getElementById('qNext');if(n)n.addEventListener('click',function(){st.i++;render();});
  var f=document.getElementById('qFin');if(f)f.addEventListener('click',function(){st.done=true;render();window.scrollTo(0,0);});
}
function renderResult(){
  var ok=0;Q.forEach(function(q,i){if(st.ans[i]===q.a)ok++;});
  var score=Math.round(ok/Q.length*100),msg=score>=80?'Sangat baik. Pemahaman konsep robot 4 DOF sudah kuat.':(score>=60?'Baik. Ulangi materi pada soal yang masih salah.':'Perlu mengulang materi. Pelajari kembali tab Materi dan coba simulasi.');
  var h='<div class="quiz"><div class="score"><b>'+score+'</b><div><div style="font:700 22px var(--display);letter-spacing:.06em">NILAI AKHIR</div><div>Benar '+ok+' dari '+Q.length+' soal</div><div style="color:var(--muted)">'+msg+'</div></div><button class="btn" type="button" id="qRetry" style="margin-left:auto">Ulangi kuis</button></div><div class="rev">';
  Q.forEach(function(q,i){
    var good=st.ans[i]===q.a;
    h+='<div class="it'+(good?'':' salah')+'"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="badge '+(good?'ok':'bad')+'">'+(good?'BENAR':'SALAH')+'</span><b>Soal '+(i+1)+'</b></div><p>'+esc(q.q)+'</p>'+
    (good?'':'<p>Jawabanmu: <b>'+'ABCD'[st.ans[i]]+'. '+esc(q.o[st.ans[i]])+'</b></p>')+'<p>Jawaban benar: <b style="color:var(--green)">'+'ABCD'[q.a]+'. '+esc(q.o[q.a])+'</b></p><p style="color:var(--muted)">Pembahasan: '+esc(q.e)+'</p></div>';
  });
  el.innerHTML='<div class="page">'+h+'</div></div>';
  document.getElementById('qRetry').addEventListener('click',function(){st={i:0,ans:[],done:false};render();window.scrollTo(0,0);});
}
window.renderEvaluasi=function(e){el=e;render();};
})();
