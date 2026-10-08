/* arminfradler.at · gemeinsame Bausteine. Keine Cookies, keine Analyse, keine fremden Dienste außer dem eigenen Blog-/Kontakt-Backend. */
(()=>{
const S=document.currentScript,ROOT=S.dataset.root||'./',PAGE=document.body.dataset.page||'';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];

/* ---------- Kopf und Fuß ---------- */
const NAV=[['angebot','Angebot','angebot.html'],['termine','Termine','termine.html'],['werkzeuge','Werkzeuge','https://mitmachen.arminfradler.at/werkzeuge/ki/'],['impulse','Impulse','impulse/'],['ueber','Über mich','ueber-mich.html']];
const head=$('#site-head');
if(head){
  head.className='site-head';
  head.innerHTML=`<div class="wrap"><a class="brand" href="${ROOT}" aria-label="Armin Fradler – Startseite"><b>Armin Fradler</b><svg viewBox="0 0 132 9" aria-hidden="true"><path d="M2 6 C 30 2, 60 8, 90 4 S 125 5, 130 3"/></svg></a>
  <button class="burger" aria-label="Menü" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
  <nav class="nav" id="nav" aria-label="Hauptmenü">${NAV.map(([k,l,h])=>`<a href="${h.startsWith('http')?h:ROOT+h}" class="${PAGE===k?'on':''}">${l}</a>`).join('')}<a class="cta" href="${ROOT}kontakt.html">Anfragen</a></nav></div>`;
  const b=$('.burger',head),n=$('#nav');
  b.onclick=()=>{const o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',o);n.classList.toggle('open',o)};
  head.insertAdjacentHTML('beforeend','<span class="progress" aria-hidden="true"></span>');
  const onScroll=()=>{head.classList.toggle('scrolled',scrollY>8);const h=document.documentElement.scrollHeight-innerHeight;head.style.setProperty('--p',h>0?Math.min(1,scrollY/h).toFixed(4):0)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
}
const foot=$('#site-foot');
if(foot){
  foot.className='site-foot';
  foot.innerHTML=`<div class="wrap">
    <div><p class="bye" aria-hidden="true">Bis bald.</p><b>Armin Fradler</b><p style="margin:8px 0 0">Workshops, Vorträge und Fortbildungen für Bildungsorganisationen, Schulen und kleine Unternehmen. Aus Oberwart im Burgenland – vor Ort und online.</p><p style="margin:10px 0 0"><a href="mailto:info@arminfradler.at">info@arminfradler.at</a> · <a href="tel:+4367761769100">+43 677 617 69 100</a></p></div>
    <div><ul><li><a href="${ROOT}angebot.html">Angebot</a></li><li><a href="${ROOT}termine.html">Termine</a></li><li><a href="https://mitmachen.arminfradler.at/werkzeuge/ki/">Werkzeuge</a></li><li><a href="${ROOT}impulse/">Impulse</a></li><li><a href="${ROOT}ueber-mich.html">Über mich</a></li></ul></div>
    <div><ul><li><a href="${ROOT}kontakt.html">Kontakt</a></li><li><a href="https://www.linkedin.com/in/armin-fradler-a25a28359" rel="noopener">LinkedIn</a></li><li><a href="${ROOT}impressum.html">Impressum</a></li><li><a href="${ROOT}datenschutz.html">Datenschutz</a></li><li><a href="${ROOT}agb.html">AGB</a></li></ul><p class="xs" style="margin-top:12px">Keine Cookies. Keine Analyse-Tools.</p></div>
  </div>`;
}

/* ---------- Rotstift-Unterstreichungen ---------- */
$$('.mark').forEach(m=>{m.insertAdjacentHTML('beforeend','<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M1 7 C 20 3, 45 9, 70 5 S 95 6, 99 3"/></svg>')});

/* ---------- Auftauchen beim Scrollen ---------- */
const io='IntersectionObserver' in window&&!RM?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'}):null;
$$('.rv,.mark,.fan,.lights,.site-foot .bye').forEach(el=>io?io.observe(el):el.classList.add('in'));

/* ---------- Porträt: ablegen, dann sanft mit der Maus neigen ---------- */
$$('.portrait').forEach(pt=>{
  const img=$('img',pt);const place=()=>setTimeout(()=>pt.classList.add('placed'),RM?0:180);
  img&&!img.complete?img.addEventListener('load',place,{once:true}):place();
  if(!RM&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    const zone=pt.closest('.hero')||pt,ph=$('.photo',pt);
    zone.addEventListener('pointermove',e=>{const r=pt.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/innerWidth,y=(e.clientY-(r.top+r.height/2))/innerHeight;ph.style.setProperty('--ty',(x*6).toFixed(2)+'deg');ph.style.setProperty('--tx',(-y*5).toFixed(2)+'deg')});
    zone.addEventListener('pointerleave',()=>{ph.style.setProperty('--ty','0deg');ph.style.setProperty('--tx','0deg')});
  }
});

/* ---------- Hero: Schreibmaschine, dann Rotstift, dann Stempel ---------- */
const h1=$('.hero h1[data-type]');
if(h1){
  const write=$('.hero .write'),stamp=$('.hero .stamp');
  const done=()=>{write&&write.classList.add('on');stamp&&setTimeout(()=>stamp.classList.add('on'),RM?0:1600)};
  if(RM){done()}else{
    const t=h1.textContent;h1.setAttribute('aria-label',t);
    h1.innerHTML=[...t].map(c=>`<span class="ch" aria-hidden="true">${c===' '?' ':c.replace(/[&<>]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[x]))}</span>`).join('')+'<span class="caret" aria-hidden="true"></span>';
    const chs=$$('.ch',h1);let k=0;
    const tick=()=>{if(k<chs.length){chs[k++].classList.add('on');setTimeout(tick,chs[k-1].textContent===' '?70:38+Math.random()*40)}else{setTimeout(()=>{$('.caret',h1)?.remove();done()},350)}};
    setTimeout(tick,400);
  }
}

/* ---------- Maschine → Mensch: der Stift läuft durch den Satz ---------- */
const m2=$('.morph .m2');
if(m2&&!RM){
  const t=m2.textContent;m2.innerHTML=t.split(' ').map(w=>`<span class="mw">${[...w].map(c=>`<span class="ml">${c}</span>`).join('')}</span>`).join(' ');
  const L=$$('.ml',m2),n=L.length,sec=$('.morph');let raf=0,last=-1;
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  const frame=()=>{raf=0;const r=sec.getBoundingClientRect();const T=Math.min(1,Math.max(0,(innerHeight*.92-r.top)/(innerHeight*.75)));
    if(Math.abs(T-last)<.002)return;last=T;
    L.forEach((el,i)=>{const k=ease(T*1.7-(i/n)*.7);el.style.setProperty('--mono',(1-k).toFixed(3));el.style.setProperty('--casl',k.toFixed(3));el.style.setProperty('--wg',(360+300*k).toFixed(0));el.style.setProperty('--sl',(-7*k).toFixed(2));el.style.setProperty('--c',k.toFixed(3))})};
  const req=()=>{if(!raf)raf=requestAnimationFrame(frame)};
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);frame();
}

/* ---------- „Wo ziehen Sie die Linie?“ ---------- */
const LF={
  'Kursausschreibung':{a:['Erstfassung aus Stichworten','Varianten für Website und Social Media'],n:['„Wie liest das jemand ohne Vorwissen?“','Fehlende Pflichtangaben aufspüren'],b:['passt der Kurs zur Zielgruppe?','Preis und Förderhinweis','die Freigabe'],note:'Leitbild, Stilregeln und gute Beispiele aus dem Haus machen den Unterschied – nicht der geschickte Satz.'},
  'Sachbericht ans Land':{a:['Gliederung nach den Fördervorgaben','Erstfassung aus Stichworten'],n:['„Was liest ein Fördergeber kritisch?“','Widersprüche zwischen Zahlen und Text'],b:['stimmen die Zahlen?','was wir ehrlich benennen','die Unterschrift'],note:'Die Linie verläuft mitten durch die Aufgabe – nicht zwischen „KI-Aufgaben“ und „Menschen-Aufgaben“.'},
  'Feedback auswerten':{a:['Antworten zählen und ordnen – nur zusammengefasst'],n:['„Welche leisen Stimmen gehen unter?“','Gegenlesen: Was übersehe ich?'],b:['was daraus folgt','das Gespräch mit dem Team'],note:'Achtung Datenampel: Freitexte aus kleinen Gruppen machen Menschen erkennbar – auch ohne Namen.'},
  'Unterricht vorbereiten':{a:['Übungen in drei Niveaus','Lösungsblätter'],n:['„Wo bleiben Schüler:innen hängen?“','typische Fehlvorstellungen sammeln'],b:['was diese Klasse jetzt braucht','Beziehung','Beurteilung'],note:'Für Lernende ist dieselbe Aufgabe Übung, nicht Routine. Erledigt ist nicht gelernt.'},
  'Kundenanfrage':{a:['Antwortentwurf','Zusammenfassung des bisherigen Verlaufs'],n:['„Was ist das eigentliche Anliegen?“'],b:['Zusagen und Preise','der Ton bei einer Beschwerde'],note:'Prüfen braucht Können: Wer die Antwort freigibt, muss sie auch ohne KI geben können.'}
};
const lf=$('#leitfrage');
if(lf){
  const tasks=$('.lf-tasks',lf),cols={a:$('.c-ab ul',lf),n:$('.c-an ul',lf),b:$('.c-be ul',lf)},note=$('.lf-note',lf);
  $('.lf-cols',lf).insertAdjacentHTML('beforeend','<svg class="lf-line" viewBox="0 0 28 640" preserveAspectRatio="none" aria-hidden="true"><path d="M15 2 C 7 90, 22 170, 12 260 S 5 420, 17 500 S 10 590, 14 638"/></svg><span class="lf-line-label" aria-hidden="true">hier ziehen wir die Linie</span>');
  const line=$('.lf-line',lf);let seen=false;
  const drawLine=()=>{line.classList.remove('draw');void line.getBoundingClientRect();line.classList.add('draw')};
  if(io){const lo=new IntersectionObserver(es=>{if(es[0].isIntersecting){seen=true;drawLine();lo.disconnect()}},{threshold:.4});lo.observe($('.lf-cols',lf))}else{seen=true;line.classList.add('draw')}
  tasks.innerHTML=Object.keys(LF).map((t,i)=>`<button type="button" aria-pressed="${i?'false':'true'}">${t}</button>`).join('');
  const show=t=>{const d=LF[t];['a','n','b'].forEach(k=>{cols[k].innerHTML=d[k].map(x=>`<li>${x}</li>`).join('');$$('li',cols[k]).forEach((li,j)=>setTimeout(()=>li.classList.add('on'),RM?0:120+j*140+(k==='n'?160:k==='b'?320:0)))});note.textContent=d.note;if(seen&&!RM)setTimeout(drawLine,380)};
  $$('button',tasks).forEach(b=>b.onclick=()=>{$$('button',tasks).forEach(x=>x.setAttribute('aria-pressed',x===b));show(b.textContent)});
  show(Object.keys(LF)[0]);
}

/* ---------- Backend (bestehende Datenbank der bisherigen Website; öffentlicher, eingeschränkter Schlüssel) ---------- */
window.AF={
  url:'https://wztxprmmrkgghisodheh.supabase.co',
  key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dHhwcm1tcmtnZ2hpc29kaGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDY0MjQsImV4cCI6MjA4MDIyMjQyNH0.WfFqbGmfh2WScJ6OeyltpgYvvUiTWX2g0zc2ukbJMQw',
  async get(path){const r=await fetch(this.url+'/rest/v1/'+path,{headers:{apikey:this.key,Authorization:'Bearer '+this.key}});if(!r.ok)throw new Error(r.status);return r.json()},
  async insert(table,row){const r=await fetch(this.url+'/rest/v1/'+table,{method:'POST',headers:{apikey:this.key,Authorization:'Bearer '+this.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});if(!r.ok)throw new Error(r.status)},
  esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  date:d=>d?new Date(d).toLocaleDateString('de-AT',{day:'numeric',month:'long',year:'numeric'}):'',
  root:ROOT
};
})();
