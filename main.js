/* Navigasi tab, pengisian halaman, tautan antar halaman. */
(function(){
var views=['simulasi','rangkaian','materi','program','evaluasi'],built={};
var render={rangkaian:window.renderRangkaian,materi:window.renderMateri,program:window.renderProgram,evaluasi:window.renderEvaluasi};
function show(name,pushHash){
  if(views.indexOf(name)<0)name='simulasi';
  views.forEach(function(v){
    var sec=document.getElementById('v-'+v),tab=document.getElementById('t-'+v),on=v===name;
    sec.hidden=!on;tab.setAttribute('aria-selected',on?'true':'false');tab.tabIndex=on?0:-1;
  });
  if(!built[name]&&render[name]){render[name](document.getElementById('v-'+name));built[name]=true;bindLinks(document.getElementById('v-'+name));}
  if(window.SIM)window.SIM.setVisible(name==='simulasi');
  if(pushHash){try{history.replaceState(null,'','#'+name);}catch(e){}}
}
function bindLinks(root){
  Array.prototype.forEach.call(root.querySelectorAll('[data-go]'),function(a){a.addEventListener('click',function(ev){ev.preventDefault();show(a.getAttribute('data-go'),true);window.scrollTo(0,0);});});
}
views.forEach(function(v,i){
  var t=document.getElementById('t-'+v);
  t.addEventListener('click',function(){show(v,true);});
  t.addEventListener('keydown',function(e){
    var k=e.key==='ArrowRight'?1:(e.key==='ArrowLeft'?-1:0);if(!k)return;
    var n=views[(i+k+views.length)%views.length];show(n,true);document.getElementById('t-'+n).focus();e.preventDefault();
  });
});
var h=(location.hash||'').replace('#','');
show(views.indexOf(h)>=0?h:'simulasi',false);
})();
