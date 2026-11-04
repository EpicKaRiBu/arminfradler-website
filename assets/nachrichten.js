/* arminfradler.at · KI-Nachrichten. Liest data/wissen.json (gebaut von tools/build_wissen.py). Keine Cookies, nichts wird gespeichert. */
(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MON=['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const lang=iso=>{const[y,m,d]=iso.split('-');return `${+d}. ${MON[m-1]} ${y}`};
const kurz=iso=>{const[,m,d]=iso.split('-');return `${+d}.${+m}.`};
const von_bis=(a,b)=>{const[ya,ma,da]=a.split('-'),[yb,mb]=b.split('-');return ya!==yb?`${lang(a)} bis ${lang(b)}`:ma===mb?`${+da}. bis ${lang(b)}`:`${+da}. ${MON[ma-1]} bis ${lang(b)}`};
const LAND={at:'Österreich',de:'Deutschland',ch:'Schweiz',eu:'EU',us:'USA',intl:'International',uk:'Großbritannien',fr:'Frankreich',dk:'Dänemark',cn:'China'};
const VERF={vorschau:'erst als Vorschau',angekuendigt:'angekündigt','nicht in der EU':'nicht in der EU'};
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

fetch('data/wissen.json').then(r=>r.json()).then(init).catch(e=>{console.error(e);$('#n-list').innerHTML='<p>Die Nachrichten konnten nicht geladen werden.</p>'});

const keep=b=>document.querySelectorAll('.w-bereich a,main a[href^="nachrichten.html"],main a[href^="modelle.html"],main a[href^="wissen.html"]').forEach(a=>{const[h,x]=a.getAttribute('href').split('#');a.setAttribute('href',h.split('?')[0]+(b?'?fuer='+b:'')+(x?'#'+x:''))});
function init(D){
  const N=D.nachrichten,M=N.meldungen,R=D.radar,BW=R.blickwinkel,BWN=Object.fromEntries(BW.map(b=>[b.id,b]));
  const RP=Object.fromEntries(R.punkte.map((p,i)=>[p.id,{n:i+1,name:p.name}]));
  if(N.stand)$('[data-stand]').textContent='Stand '+lang(N.stand);
  let bw=new URLSearchParams(location.search).get('fuer');if(!BWN[bw])bw='';
  const st={a:'',q:'',laut:false,alle:false};

  const box=$('#bw');
  box.innerHTML=`<button type="button" data-b="">Alle</button>`+BW.map(b=>`<button type="button" data-b="${b.id}" title="${esc(b.lang)}">${esc(b.name)}</button>`).join('');
  box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;bw=b.dataset.b;st.alle=false;
    const u=new URL(location.href);bw?u.searchParams.set('fuer',bw):u.searchParams.delete('fuer');try{history.replaceState(null,'',u)}catch(_){}
    draw()});

  const pass=(m,ohne)=>(ohne==='a'||!st.a||m.art===st.a)&&(st.laut||m.gewicht!=='laut')&&(!bw||st.alle||m.fuer.includes(bw))
    &&(!st.q||norm(m.titel+' '+m.was+' '+m.einordnung+' '+m.quellen.map(q=>q.t).join(' ')).includes(norm(st.q)));
  function chips(){
    const n=id=>M.filter(m=>pass(m,'a')&&(!id||m.art===id)).length;
    $('#chips-art').innerHTML=`<button type="button" aria-pressed="${!st.a}" data-v="">Alles <small>${n('')}</small></button>`+Object.entries(N.arten).map(([id,name])=>{const k=n(id);return `<button type="button" aria-pressed="${st.a===id}" data-v="${id}"${k||st.a===id?'':' disabled'}>${esc(name)} <small>${k}</small></button>`}).join('');
  }
  const card=m=>{
    const rp=m.radar&&RP[m.radar];
    const v=VERF[m.verfuegbar];
    return `<article class="n-item g-${m.gewicht}" id="${m.id}">
      <p class="n-date"><time datetime="${m.datum}">${kurz(m.datum)}</time></p>
      <div class="n-body">
        <p class="n-meta"><span class="n-g"><i class="g-${m.gewicht}"></i>${esc(N.gewicht[m.gewicht])}</span><span>${esc(N.arten[m.art])}</span>${LAND[m.land]?`<span>${esc(LAND[m.land])}</span>`:''}${v?`<span class="n-v">${esc(v)}</span>`:''}</p>
        <h3><a href="#${m.id}">${esc(m.titel)}</a></h3>
        <p>${esc(m.was)}</p>
        <div class="n-ein"><b>Was das heißt</b>${esc(m.einordnung)}</div>
        <p class="n-src">${m.quellen.map(q=>`<a href="${esc(q.u)}" rel="noopener">${esc(q.t)}</a>`).join(' · ')}${rp?` · <a class="n-r" href="wissen.html${bw?'?fuer='+bw:''}#radar-${m.radar}">→ Radar ${rp.n}: ${esc(rp.name)}</a>`:''}</p>
      </div></article>`};
  function draw(){
    $$('button',box).forEach(x=>x.setAttribute('aria-pressed',x.dataset.b===bw));keep(bw);
    chips();
    const hit=M.filter(m=>pass(m));
    const nBw=bw?M.filter(m=>m.fuer.includes(bw)).length:0;
    $('#count').innerHTML=esc(`${hit.length} ${hit.length===1?'Meldung':'Meldungen'}`+(bw&&!st.alle?` für ${BWN[bw].mehrzahl}`:'')+(st.q?` zu „${st.q}“`:''))
      +(bw?` · <button type="button" class="more" id="alle-x">${st.alle?`nur die für ${esc(BWN[bw].mehrzahl)}`:`alle ${M.length} zeigen`}</button>`:'');
    void nBw;
    $('#n-list').innerHTML=N.wochen.map(w=>{const ms=hit.filter(m=>m.woche===w.id);if(!ms.length)return '';
      const kw=w.id.replace(/^\d{4}-KW0?/,'KW ');
      const offen=w.bis>w.stand;const titel=offen?`Seit ${lang(w.von)}`:von_bis(w.von,w.bis);
      return `<div class="n-week" role="group" aria-label="${esc(titel)}"><h2>${esc(titel)} <small>${kw} · ${offen?'laufende Woche, ':''}nachgeschaut am ${esc(kurz(w.stand))}</small></h2>${ms.map(card).join('')}</div>`}).join('')
      ||`<p class="w-empty">Nichts gefunden. Versuchen Sie ein anderes Wort${bw&&!st.alle?' oder zeigen Sie alle Meldungen':''}.</p>`;
  }
  $('#chips-art').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;st.a=b.dataset.v;draw()});
  let tq;$('#q').addEventListener('input',e=>{clearTimeout(tq);tq=setTimeout(()=>{st.q=e.target.value.trim();draw()},120)});
  $('#laut').addEventListener('change',e=>{st.laut=e.target.checked;draw()});
  $('#count').addEventListener('click',e=>{if(e.target.id==='alle-x'){st.alle=!st.alle;draw()}});
  draw();
  // Direktlink auf eine Meldung: sichtbar machen, auch wenn ein Filter sie verbirgt
  const h=location.hash.slice(1);
  if(h&&M.some(m=>m.id===h)){if(!document.getElementById(h)){st.alle=true;st.laut=true;$('#laut').checked=true;draw()}
    const el=document.getElementById(h);el.classList.add('hl');setTimeout(()=>el.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),80)}
}
})();
