/* Halaman Program Arduino: kode C++ berkomentar, penjelasan bagian, tombol salin. */
(function(){
var CODE=`/*
  ROBOT PEMINDAH BARANG 4 DOF (PICK AND PLACE)
  SMK Pembnas Purwodadi - Perancangan Sistem Robotika
  Kelas XI Teknik Elektronika Industri
  Guru Pengampu: Agus Supriyanto, S.T., M.T.
  Papan: Arduino Uno | Aktuator: 4 motor servo | Sensor: photodioda (A0)
*/

#include <Servo.h>   // library untuk mengendalikan motor servo

// ===== 1. DEKLARASI PIN =====
const int PIN_BASE     = 3;    // Servo 1: Base Rotation (PWM)
const int PIN_SHOULDER = 5;    // Servo 2: Shoulder (PWM)
const int PIN_ELBOW    = 6;    // Servo 3: Elbow (PWM)
const int PIN_GRIPPER  = 9;    // Servo 4: Gripper (PWM)
const int PIN_SENSOR   = A0;   // Sensor photodioda (masukan analog)
const int PIN_LED      = 13;   // LED indikator barang terdeteksi

// ===== 2. PARAMETER SENSOR =====
// Nilai ADC di bawah AMBANG berarti cahaya terhalang (ada barang).
// Sesuaikan dengan hasil pengukuran di Serial Monitor.
const int AMBANG = 500;

// ===== 3. SUDUT POSISI (derajat) =====
// Posisi awal (Home)
const int B_HOME = 90, S_HOME = 110, E_HOME = 75;
// Arah base menuju Pick Area dan Place Area
const int B_PICK = 130, B_PLACE = 50;
// Pose lengan: aman (terangkat), di atas barang, turun ke barang
const int S_AMAN  = 108, E_AMAN  = 46;
const int S_ATAS  = 66,  E_ATAS  = 59;
const int S_BAWAH = 39,  E_BAWAH = 67;
// Gripper: tutup, buka, dan menjepit barang
const int G_TUTUP = 30, G_BUKA = 100, G_JEPIT = 50;

// ===== 4. OBJEK SERVO DAN POSISI SAAT INI =====
Servo servoBase, servoShoulder, servoElbow, servoGripper;
int sB = B_HOME, sS = S_HOME, sE = E_HOME, sG = G_TUTUP;

// ===== 5. PENGATURAN SUDUT SERVO (GERAK HALUS) =====
// Menggerakkan keempat servo bersamaan, 1 derajat per langkah,
// agar gerakan tidak menyentak dan beban pada gear servo kecil.
void gerak(int bT, int sT, int eT, int gT, int jeda) {
  int langkah = max(max(abs(bT - sB), abs(sT - sS)),
                    max(abs(eT - sE), abs(gT - sG)));
  int b0 = sB, s0 = sS, e0 = sE, g0 = sG;
  for (int i = 1; i <= langkah; i++) {
    servoBase.write(b0 + (long)(bT - b0) * i / langkah);
    servoShoulder.write(s0 + (long)(sT - s0) * i / langkah);
    servoElbow.write(e0 + (long)(eT - e0) * i / langkah);
    servoGripper.write(g0 + (long)(gT - g0) * i / langkah);
    delay(jeda);               // makin besar jeda, makin lambat gerakan
  }
  sB = bT; sS = sT; sE = eT; sG = gT;   // simpan posisi terbaru
}

// ===== 6. PROSES PENGAMBILAN BARANG =====
void ambilBarang() {
  gerak(B_PICK, S_AMAN,  E_AMAN,  G_TUTUP, 15);  // base berputar, lengan terangkat
  gerak(B_PICK, S_ATAS,  E_ATAS,  G_TUTUP, 15);  // shoulder dan elbow ke atas barang
  gerak(B_PICK, S_ATAS,  E_ATAS,  G_BUKA,  10);  // gripper membuka
  gerak(B_PICK, S_BAWAH, E_BAWAH, G_BUKA,  15);  // lengan turun ke barang
  gerak(B_PICK, S_BAWAH, E_BAWAH, G_JEPIT, 20);  // gripper menjepit barang
  delay(300);                                    // beri waktu jepitan kuat
}

// ===== 7. PROSES PEMINDAHAN BARANG =====
void pindahBarang() {
  gerak(B_PICK,  S_ATAS,  E_ATAS,  G_JEPIT, 15); // angkat barang dari meja
  gerak(B_PICK,  S_AMAN,  E_AMAN,  G_JEPIT, 15); // naik ke pose aman
  gerak(B_PLACE, S_AMAN,  E_AMAN,  G_JEPIT, 20); // base berputar ke Place Area
  gerak(B_PLACE, S_ATAS,  E_ATAS,  G_JEPIT, 15); // turun ke atas Place Area
  gerak(B_PLACE, S_BAWAH, E_BAWAH, G_JEPIT, 15); // turun sampai barang menyentuh meja
}

// ===== 8. PROSES PELEPASAN BARANG =====
void lepasBarang() {
  gerak(B_PLACE, S_BAWAH, E_BAWAH, G_BUKA, 10);  // gripper membuka, barang lepas
  delay(300);
  gerak(B_PLACE, S_ATAS,  E_ATAS,  G_BUKA, 15);  // lengan naik tanpa menyenggol barang
}

// ===== 9. PENGEMBALIAN ROBOT KE POSISI AWAL =====
void keHome() {
  gerak(sB, S_AMAN, E_AMAN, G_TUTUP, 15);        // angkat dulu agar aman
  gerak(B_HOME, S_HOME, E_HOME, G_TUTUP, 15);    // kembali ke Home Position
}

// ===== INISIALISASI MOTOR SERVO =====
void setup() {
  Serial.begin(9600);
  pinMode(PIN_LED, OUTPUT);
  servoBase.attach(PIN_BASE);          // hubungkan objek servo ke pin
  servoShoulder.attach(PIN_SHOULDER);
  servoElbow.attach(PIN_ELBOW);
  servoGripper.attach(PIN_GRIPPER);
  servoBase.write(sB);                 // arahkan ke posisi awal
  servoShoulder.write(sS);
  servoElbow.write(sE);
  servoGripper.write(sG);
  delay(1000);
  Serial.println("Robot siap (Home Position)");
}

// ===== PEMBACAAN SENSOR DAN PENGAMBILAN KEPUTUSAN =====
void loop() {
  int nilai = analogRead(PIN_SENSOR);        // baca photodioda: 0..1023
  bool ada = (nilai < AMBANG);               // true jika cahaya terhalang
  digitalWrite(PIN_LED, ada ? HIGH : LOW);   // LED menyala saat barang ada
  Serial.print("ADC A0 = ");
  Serial.println(nilai);

  if (ada) {                                 // keputusan: ada barang?
    delay(300);                              // tunggu pembacaan stabil
    if (analogRead(PIN_SENSOR) < AMBANG) {   // baca ulang untuk memastikan
      ambilBarang();
      pindahBarang();
      lepasBarang();
      keHome();
    }
  }
  delay(100);
}
`;
var SEC=[
['1. Deklarasi pin','Nama pin dibuat sebagai konstanta agar program mudah dibaca dan diubah.'],
['2. Inisialisasi motor servo','Fungsi setup() menghubungkan objek Servo ke pin dengan attach() dan mengarahkan robot ke posisi awal.'],
['3. Pembacaan sensor','analogRead(A0) menghasilkan nilai 0–1023 yang dibandingkan dengan AMBANG.'],
['4. Pengambilan keputusan','Pernyataan if menjalankan proses pemindahan hanya jika barang terdeteksi dua kali berturut-turut.'],
['5. Pengaturan sudut servo','Fungsi gerak() memutar empat servo serentak, 1 derajat per langkah, memakai servo.write().'],
['6. Proses pengambilan','Base berputar, lengan turun, gripper membuka lalu menjepit.'],
['7. Proses pemindahan','Barang diangkat, lengan naik ke pose aman, baru base berputar ke Place Area.'],
['8. Proses pelepasan','Gripper membuka di Place Area, lalu lengan naik tanpa menyenggol barang.'],
['9. Kembali ke posisi awal','Lengan diangkat dahulu, kemudian semua servo kembali ke sudut Home.'],
['Keamanan gerak','Lengan selalu naik ke pose aman sebelum base berputar, sehingga tidak ada tabrakan antarbagian.']
];
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
var KW=/("[^"]*")|(\b(?:const|int|void|bool|long|if|else|for|while|return|true|false)\b)|(\b(?:Servo|Serial|HIGH|LOW|OUTPUT)\b)|(\b(?:setup|loop|pinMode|digitalWrite|analogRead|delay|abs|max|min|write|attach|begin|print|println|gerak|ambilBarang|pindahBarang|lepasBarang|keHome)\b)|(\b\d+\b)/g;
function hl(code){
  var inBlock=false;
  return code.split('\n').map(function(line){
    if(inBlock){if(line.indexOf('*/')>=0)inBlock=false;return '<span class="c">'+esc(line)+'</span>';}
    if(line.trim().indexOf('/*')===0){if(line.indexOf('*/')<0)inBlock=true;return '<span class="c">'+esc(line)+'</span>';}
    var ci=line.indexOf('//'),cd=ci>=0?line.slice(0,ci):line,cm=ci>=0?line.slice(ci):'';
    cd=esc(cd);
    cd=cd.replace(/(<span[^>]*>.*?<\/span>)|([^<]+)/g,function(m,a,b){
      if(a)return a;return b.replace(KW,function(x,q,k,t,f,n){return q?'<span class="n">'+x+'</span>':k?'<span class="k">'+x+'</span>':(t?'<span class="t">'+x+'</span>':(f?'<span class="f">'+x+'</span>':'<span class="n">'+x+'</span>'));});
    });
    cd=cd.replace(/^(\s*)#include/,'$1<span class="k">#include</span>');
    return cd+(cm?'<span class="c">'+esc(cm)+'</span>':'');
  }).join('\n');
}
window.ARDUINO_CODE=CODE;
window.renderProgram=function(el){
  el.innerHTML='<div class="page"><div class="two"><div class="card" style="min-width:0"><div class="codebar"><h2 style="margin:0">Program Arduino Uno (C++)</h2><div style="display:flex;gap:8px;align-items:center"><span class="badge" id="copyMsg" style="visibility:hidden">Tersalin</span><button class="btn" id="copyCode" type="button">Salin kode</button></div></div><pre class="code" id="codeBlock" tabindex="0" aria-label="Kode program Arduino"><code>'+hl(CODE)+'</code></pre></div>'+
  '<div style="display:flex;flex-direction:column;gap:12px;min-width:0"><div class="card"><h2>Bagian program</h2><ul class="legend">'+SEC.map(function(s){return '<li><b>'+s[0]+'</b>'+s[1]+'</li>';}).join('')+'</ul></div>'+
  '<div class="card"><h3>Tabel sudut yang dipakai</h3><div class="scroll"><table><thead><tr><th>Pose</th><th>Base</th><th>Shoulder</th><th>Elbow</th></tr></thead><tbody><tr><td>Home</td><td>90°</td><td>110°</td><td>75°</td></tr><tr><td>Aman (terangkat)</td><td>–</td><td>108°</td><td>46°</td></tr><tr><td>Di atas barang</td><td>–</td><td>66°</td><td>59°</td></tr><tr><td>Turun ke barang</td><td>–</td><td>39°</td><td>67°</td></tr><tr><td>Pick Area</td><td>130°</td><td colspan="2">–</td></tr><tr><td>Place Area</td><td>50°</td><td colspan="2">–</td></tr></tbody></table></div><p class="hint">Gripper: tutup 30°, buka 100°, menjepit 50°. Sudut ini sama dengan yang dipakai simulasi 3D. Pada robot nyata, sudut perlu dikalibrasi ulang.</p></div></div></div></div>';
  var btn=document.getElementById('copyCode'),msg=document.getElementById('copyMsg');
  btn.addEventListener('click',function(){
    function ok(m){msg.textContent=m;msg.style.visibility='visible';setTimeout(function(){msg.style.visibility='hidden';},2000);}
    function fallback(){var r=document.createRange();r.selectNodeContents(document.getElementById('codeBlock'));var s=window.getSelection();s.removeAllRanges();s.addRange(r);ok('Terpilih, tekan Ctrl+C');}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(CODE).then(function(){ok('Tersalin');},fallback);}else fallback();
  });
};
})();
