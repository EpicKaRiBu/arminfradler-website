/* arminfradler.at · gemeinsame Bausteine. Keine Cookies, keine Analyse, keine fremden Dienste außer dem eigenen Blog-/Kontakt-Backend. */
(()=>{
const S=document.currentScript,ROOT=S.dataset.root||'./',PAGE=document.body.dataset.page||'';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];

/* ---------- Texturen: Tinte, Rotstift, Stempel als SVG-Filter ---------- */
document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<filter id="tx-ink" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="1" seed="9" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.3 1.5" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
<filter id="tx-pencil" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2 1.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
<filter id="tx-stamp" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".05 .09" numOctaves="3" seed="12" result="b"/><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="2" result="s"/><feComposite in="b" in2="s" operator="arithmetic" k1="0" k2=".6" k3=".6" k4="0" result="mix"/><feColorMatrix in="mix" type="matrix" values="0 0 0 0 1 0 0 0 0 .99 0 0 0 0 .96 0 0 0 -3.2 2.2" result="spots"/><feDisplacementMap in="SourceGraphic" in2="s" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="d"/><feComposite in="spots" in2="d" operator="in" result="worn"/><feMerge><feMergeNode in="d"/><feMergeNode in="worn"/></feMerge></filter>
</defs></svg>`);
document.documentElement.classList.add('tx-on');

/* ---------- Kopf und Fuß ---------- */
const NAV=[['angebot','Angebot','angebot.html'],['methode','So arbeite ich','methode.html'],['termine','Termine','termine.html'],['werkzeuge','Werkzeuge','https://mitmachen.arminfradler.at/werkzeuge/ki/'],['impulse','Impulse','impulse/'],['ueber','Über mich','ueber-mich.html']];
const head=$('#site-head');
if(head){
  head.className='site-head';
  head.innerHTML=`<div class="wrap"><a class="brand" href="${ROOT}" aria-label="Armin Fradler – Startseite"><img src="${ROOT}assets/logo/logo.svg" alt="Armin Fradler" width="238" height="40"></a>
  <button class="burger" aria-label="Menü" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
  <nav class="nav" id="nav" aria-label="Hauptmenü">${NAV.map(([k,l,h])=>`<a href="${h.startsWith('http')?h:ROOT+h}" class="${PAGE===k?'on':''}">${l}</a>`).join('')}<a class="cta" href="${ROOT}kontakt.html">Anfragen</a></nav></div>`;
  const b=$('.burger',head),n=$('#nav');
  b.onclick=()=>{const o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',o);n.classList.toggle('open',o)};
  head.insertAdjacentHTML('beforeend','<span class="progress" aria-hidden="true"></span>');
  let tk=0;
  const onScroll=()=>{tk=0;const h=document.documentElement.scrollHeight-innerHeight;head.classList.toggle('scrolled',scrollY>8);head.style.setProperty('--p',h>0?Math.min(1,scrollY/h).toFixed(3):0)};
  addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(onScroll)},{passive:true});onScroll();
}
const foot=$('#site-foot');
if(foot){
  foot.className='site-foot';
  foot.innerHTML=`<div class="wrap">
    <div><p class="bye" aria-hidden="true">Bis bald.</p><b>Armin Fradler</b><p style="margin:8px 0 0">Workshops, Vorträge und Fortbildungen für Bildungsorganisationen, Schulen und kleine Unternehmen. Aus Oberwart im Burgenland – in ganz Österreich und online.</p><p style="margin:10px 0 0"><a href="mailto:info@arminfradler.at">info@arminfradler.at</a> · <a href="tel:+4367761769100">+43 677 617 69 100</a></p></div>
    <div><ul><li><a href="${ROOT}angebot.html">Angebot</a></li><li><a href="${ROOT}methode.html">So arbeite ich</a></li><li><a href="${ROOT}termine.html">Termine</a></li><li><a href="https://mitmachen.arminfradler.at/werkzeuge/ki/">Werkzeuge</a></li><li><a href="${ROOT}impulse/">Impulse</a></li><li><a href="${ROOT}ueber-mich.html">Über mich</a></li></ul></div>
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
  'Kursausschreibung':{a:['Eine Erstfassung aus Ihren Stichworten schreiben','Varianten für Website und Social Media erstellen'],n:['Fragen: „Versteht das jemand ohne Vorwissen?“','Fehlende Pflichtangaben aufspüren'],b:['Ob der Kurs wirklich zur Zielgruppe passt','Preis und Förderhinweis eintragen','Den Text freigeben'],note:'Leitbild, Stilregeln und gute Beispiele aus dem Haus machen den Unterschied – nicht der geschickte Satz.'},
  'Sachbericht ans Land':{a:['Eine Gliederung nach den Fördervorgaben vorschlagen','Eine Erstfassung aus Stichworten schreiben'],n:['Fragen: „Was liest ein Fördergeber kritisch?“','Widersprüche zwischen Zahlen und Text finden'],b:['Prüfen, ob die Zahlen stimmen','Entscheiden, was wir ehrlich benennen','Den Bericht unterschreiben'],note:'Die Linie verläuft mitten durch die Aufgabe – nicht zwischen „KI-Aufgaben“ und „Menschen-Aufgaben“.'},
  'Feedback auswerten':{a:['Antworten zählen und nach Themen ordnen, nur zusammengefasst'],n:['Fragen: „Welche leisen Stimmen gehen unter?“','Gegenlesen: Was übersehe ich?'],b:['Entscheiden, was daraus folgt','Das Gespräch mit dem Team führen'],note:'Achtung Datenampel: Freitexte aus kleinen Gruppen machen Menschen erkennbar – auch ohne Namen.'},
  'Unterricht vorbereiten':{a:['Übungen in drei Schwierigkeitsstufen erstellen','Lösungsblätter schreiben'],n:['Fragen: „Wo bleiben Schüler:innen hängen?“','Typische Fehlvorstellungen sammeln'],b:['Entscheiden, was diese Klasse jetzt braucht','Die Beziehung zu den Schüler:innen','Die Beurteilung'],note:'Für Lernende ist dieselbe Aufgabe Übung, nicht Routine. Erledigt ist nicht gelernt.'},
  'Kundenanfrage':{a:['Einen Antwortentwurf schreiben','Den bisherigen Verlauf zusammenfassen'],n:['Fragen: „Was ist das eigentliche Anliegen?“'],b:['Zusagen machen und Preise nennen','Bei einer Beschwerde den richtigen Ton treffen'],note:'Prüfen braucht Können: Wer die Antwort freigibt, muss sie auch ohne KI geben können.'}
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


/* ---------- „Darf das in die KI?“ ---------- */
const dt=$('.dt');
if(dt){
  const card=$('.dt-card',dt),out=$('.dt-out',dt),narrow=matchMedia('(max-width:860px)'),V={g:'Grün: passt.',y:'Gelb: nur mit freigegebenem Werkzeug.',r:'Rot: nicht ohne Freigabe.'};
  $$('.dt-pick button',dt).forEach(b=>{b.setAttribute('aria-pressed','false');b.onclick=()=>{
    $$('.dt-pick button',dt).forEach(x=>x.setAttribute('aria-pressed',x===b));b.classList.add('seen');
    dt.dataset.l=b.dataset.l;$('.dt-v',card).textContent=V[b.dataset.l];$('.dt-t',card).textContent=b.dataset.t;
    if(narrow.matches){b.after(out);out.classList.remove('pop');void out.offsetWidth;out.classList.add('pop')}else if(out.parentNode!==dt)dt.append(out);
    card.classList.remove('pop','st');void card.offsetWidth;card.classList.add('pop');if(b.dataset.s)card.classList.add('st');
  }});
}


/* ---------- Handy: Erstgespräch-Knopf unten ---------- */
if(!['kontakt','impressum','datenschutz','agb'].includes(PAGE)&&head){
  document.body.insertAdjacentHTML('beforeend',`<a class="btn mcta" href="${ROOT}kontakt.html">Kostenloses Erstgespräch <span class="arr">→</span></a>`);
  const m=$('.mcta'),ft=$('#site-foot');let past=false,end=false;
  const upd=()=>m.classList.toggle('on',past&&!end);
  if('IntersectionObserver' in window){
    const top=document.createElement('span');top.style.cssText='position:absolute;top:90vh;left:0;width:1px;height:1px;pointer-events:none';top.setAttribute('aria-hidden','true');document.body.prepend(top);
    new IntersectionObserver(es=>{past=!es[0].isIntersecting&&es[0].boundingClientRect.top<0;upd()}).observe(top);
    ft&&new IntersectionObserver(es=>{end=es[0].isIntersecting;upd()},{rootMargin:'0px 0px 260px 0px'}).observe(ft);
  }
}


/* ---------- Kurzfilme: laufen nur, solange sie zu sehen sind ---------- */
$$('.clip video').forEach(v=>{
  if(RM||!('IntersectionObserver' in window)){v.controls=true;return}
  new IntersectionObserver(es=>{const e=es[0];if(e.isIntersecting){v.preload='auto';v.play().catch(()=>{v.controls=true})}else v.pause()},{threshold:.5}).observe(v);
});

})();
