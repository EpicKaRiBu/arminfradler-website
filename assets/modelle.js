/* arminfradler.at · Modelle und Werkzeuge. Liest data/wissen.json (gebaut von tools/build_wissen.py). Keine Cookies, nichts wird gespeichert. */
(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MON=['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const lang=iso=>{const[y,m,d]=iso.split('-');return `${+d}. ${MON[m-1]} ${y}`};
const kurz=iso=>{const[y,m,d]=String(iso).split('-');return d?`${+d}.${+m}.${y}`:`${MON[m-1]} ${y}`};
const LAND={at:'Österreich',de:'Deutschland',fr:'Frankreich',us:'USA',eu:'EU',intl:'verschiedene',cn:'China'};
// Ampel je Zelle: g passt, y kommt drauf an, r Vorsicht
const AMP={g:'yes',y:'mid',r:'no'};

fetch('data/wissen.json').then(r=>r.json()).then(init).catch(e=>{console.error(e);$('#m-cards').innerHTML='<p>Die Steckbriefe konnten nicht geladen werden.</p>'});

const keep=b=>document.querySelectorAll('.w-bereich a,main a[href^="nachrichten.html"],main a[href^="modelle.html"],main a[href^="wissen.html"]').forEach(a=>{const[h,x]=a.getAttribute('href').split('#');a.setAttribute('href',h.split('?')[0]+(b?'?fuer='+b:'')+(x?'#'+x:''))});
function init(D){
  const W=D.werkzeuge||{werkzeuge:[]},L=W.werkzeuge,R=D.radar,BW=R.blickwinkel,BWN=Object.fromEntries(BW.map(b=>[b.id,b]));
  const RP=Object.fromEntries(R.punkte.map((p,i)=>[p.id,{n:i+1,name:p.name}]));
  if(W.stand)$('[data-stand]').textContent='Stand '+lang(W.stand);
  let bw=new URLSearchParams(location.search).get('fuer');if(!BWN[bw])bw='';
  const box=$('#bw');
  box.innerHTML=`<button type="button" data-b="">Alle</button>`+BW.map(b=>`<button type="button" data-b="${b.id}" title="${esc(b.lang)}">${esc(b.name)}</button>`).join('');
  box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;bw=b.dataset.b;
    const u=new URL(location.href);bw?u.searchParams.set('fuer',bw):u.searchParams.delete('fuer');try{history.replaceState(null,'',u)}catch(_){}
    draw()});
  const q=x=>x&&x.u?`<a href="${esc(x.u)}" rel="noopener">${esc(x.t)}</a>`:'';
  function draw(){
    $$('button',box).forEach(x=>x.setAttribute('aria-pressed',x.dataset.b===bw));keep(bw);
    const cols=[['eu','Daten in der EU'],['training','Lernt aus Ihren Eingaben'],['kosten','Kosten'],['schule','Schule']].filter(([k])=>k!=='schule'||!['gemeinde','betrieb'].includes(bw));
    const vw=(W.vorweg||{})[bw||'alle'];if(vw)$('#m-vorweg').innerHTML=`<p class="kick">${bw?'Kurz gesagt für '+esc(BWN[bw].fuer):'Vorweg'}</p><p>${esc(vw)}</p>`;
    $('#m-tab').innerHTML=`<thead><tr><th scope="col">Werkzeug</th>${cols.map(([,n])=>`<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>${L.map(w=>`<tr><th scope="row"><a href="#${w.id}">${esc(w.name)}</a></th>${cols.map(([k,n])=>`<td data-l="${n}"${w.ampel?.[k]?` class="${AMP[w.ampel[k]]}"`:''}>${esc(w.kurz?.[k]||'–')}</td>`).join('')}</tr>`).join('')}</tbody>`;
    $('#m-cards').innerHTML=L.map(w=>{
      const ein=(bw&&w.fuer&&w.fuer[bw])||w.einschaetzung;
      const rp=w.radar&&RP[w.radar];
      return `<article class="m-card" id="${w.id}">
        <h3>${esc(w.name)}</h3><p class="m-sub">${esc(w.anbieter)}${LAND[w.land]?', '+esc(LAND[w.land]):''} · ${esc(w.art)}</p>
        ${w.gut_fuer?`<p class="m-gut"><b>Gut für</b> ${esc(w.gut_fuer)}</p>`:''}
        ${ein?`<div class="m-ein"><b>Meine Einschätzung${bw&&w.fuer&&w.fuer[bw]?' für '+esc(BWN[bw].mehrzahl):''}</b>${esc(ein)}</div>`:''}
        ${rp?`<p class="m-rp"><a class="m-r" href="wissen.html${bw?'?fuer='+bw:''}#radar-${w.radar}">→ Radar ${rp.n}: ${esc(rp.name)}</a></p>`:''}
        <details class="m-more"><summary>Alle Angaben: Modell, Neues, Daten, Konto, Kosten</summary>
        <dl>
          ${w.modell?`<dt>Modell</dt><dd>${esc(w.modell)}</dd>`:''}
          ${w.neu&&w.neu.length?`<dt>Neu</dt><dd><ul>${w.neu.map(n=>`<li><b>${esc(kurz(n.datum))}</b> ${esc(n.text)} ${q(n.q)}</li>`).join('')}</ul></dd>`:''}
          ${w.daten?`<dt>Ihre Daten</dt><dd>${esc(w.daten)}</dd>`:''}
          ${w.konto?`<dt>Konto</dt><dd>${esc(w.konto)}</dd>`:''}
          ${w.kosten&&w.kosten.length?`<dt>Kosten</dt><dd><ul>${w.kosten.map(k=>`<li>${esc(k.tarif)}: ${esc(k.preis)}</li>`).join('')}</ul></dd>`:''}
          ${w.schule?`<dt>Schule</dt><dd>${esc(w.schule)}</dd>`:''}
          ${w.werbung?`<dt>Werbung</dt><dd>${esc(w.werbung)}</dd>`:''}
        </dl>
        <p class="m-src">Nachgelesen am ${esc(kurz(w.stand||W.stand))}: ${(w.quellen||[]).map(q).join(' · ')}</p>
        </details>
      </article>`}).join('')||'<p>Die Steckbriefe sind in Arbeit.</p>';
  }
  draw();
  const h=location.hash.slice(1);if(h&&document.getElementById(h))setTimeout(()=>document.getElementById(h).scrollIntoView({block:'start'}),60);
}
})();
