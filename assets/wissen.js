/* arminfradler.at · Wissen. Liest data/wissen.json (gebaut von tools/build_wissen.py). Keine Cookies, nichts wird gespeichert. */
(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dat=iso=>{if(!iso)return'';const[y,m,d]=iso.split('-');return `${+d}.${+m}.${y}`};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const COL={team:'var(--t-team)',lernen:'var(--t-lernen)',sicher:'var(--t-sicher)',werkzeuge:'var(--t-werkzeuge)',markt:'var(--t-markt)',aufmerksamkeit:'var(--t-aufmerksamkeit)'};
const HEX={team:'#2F4B7C',lernen:'#2E6B66',sicher:'#C0392B',werkzeuge:'#B07A22'};
const LAND={at:'Österreich',de:'Deutschland',ch:'Schweiz',eu:'EU',uk:'Großbritannien',nl:'Niederlande',dk:'Dänemark',no:'Norwegen',pl:'Polen',tr:'Türkei',fr:'Frankreich',us:'USA',kr:'Südkorea',cn:'China',ee:'Estland',al:'Albanien',ng:'Nigeria',intl:'International'};
const REG=[['oesterreich','Österreich'],['dach','Deutschland und Schweiz'],['europa','Europa'],['welt','Welt']];
const ART=[['studie','Studie und Zahlen'],['gesetz','Gesetz und Regeln'],['werkzeug','Werkzeug'],['vorfall','Vorfall']];
const FTHEMA=[['lernen','Lernen und Denken'],['team','KI im Team'],['sicher','Sicher mit Hausverstand'],['werkzeuge','Werkzeuge und Agenten'],['markt','Entwicklung und Markt'],['aufmerksamkeit','Aufmerksamkeit und Schule']];
const TODAY=new Date().toISOString().slice(0,10);

Promise.all([fetch('data/wissen.json').then(r=>r.json()),fetch('data/weltkarte.json').then(r=>r.json()).catch(()=>null)]).then(([d,k])=>init(d,k)).catch(e=>{console.error(e);$('#radar-detail').innerHTML='<p>Die Daten konnten nicht geladen werden.</p>'});

const keep=b=>document.querySelectorAll('.w-bereich a,main a[href^="nachrichten.html"],main a[href^="modelle.html"],main a[href^="wissen.html"]').forEach(a=>{const[h,x]=a.getAttribute('href').split('#');a.setAttribute('href',h.split('?')[0]+(b?'?fuer='+b:'')+(x?'#'+x:''))});
function init(D,K){
  const R=D.radar,P=R.punkte,F=D.fakten,FB=Object.fromEntries(F.map(f=>[f.id,f]));
  const TH=Object.fromEntries(R.themen.map(t=>[t.id,t])),RG=Object.fromEntries(R.ringe.map((r,i)=>[r.id,{...r,i}]));
  P.forEach((p,i)=>p.n=i+1);
  const stand=new Date(R.stand);
  $('[data-stand]').textContent='Stand '+stand.getDate()+'. '+stand.toLocaleDateString('de-AT',{month:'long'})+' '+stand.getFullYear();
  $('[data-n=fakten]').textContent=F.length;$('[data-n=radar]').textContent=P.length;
  if(D.nachrichten&&D.nachrichten.stand)$('[data-n=woche]').textContent=dat(D.nachrichten.stand).replace(/\d{4}$/,'');

  /* ---------- Begriffe im Text: antippen erklärt ---------- */
  const TERMS=R.begriffe.flatMap(b=>[b.name,...(b.auch||[])].map(w=>[w,b])).sort((a,b)=>b[0].length-a[0].length);
  const TRX=new RegExp('(^|[^\\wäöüÄÖÜß-])('+TERMS.map(([w])=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![\\wäöüÄÖÜß])','g');
  const TBY=Object.fromEntries(TERMS.map(([w,b])=>[w.toLowerCase(),b]));
  function T(text){const seen=new Set();return esc(text).replace(TRX,(m,pre,w)=>{const b=TBY[w.toLowerCase()];if(!b||seen.has(b.id))return m;seen.add(b.id);return `${pre}<button type="button" class="w-tb" data-term="${b.id}">${w}</button>`})}
  const pop=document.createElement('div');pop.className='w-pop';pop.setAttribute('role','dialog');pop.hidden=true;document.body.appendChild(pop);
  let popFor=null;
  const closePop=()=>{pop.hidden=true;if(popFor){popFor.setAttribute('aria-expanded','false');popFor=null}};
  document.addEventListener('click',e=>{const b=e.target.closest('button[data-term]');
    if(b){e.stopPropagation();if(popFor===b){closePop();return}closePop();const t=R.begriffe.find(x=>x.id===b.dataset.term);
      pop.innerHTML=`<p class="w-pop-h">${esc(t.name)}</p><p>${esc(t.satz)}</p><a href="#b-${t.id}" class="w-pop-a">Alle Begriffe</a>`;pop.setAttribute('aria-label',t.name);
      pop.hidden=false;popFor=b;b.setAttribute('aria-expanded','true');const r=b.getBoundingClientRect(),w=Math.min(320,innerWidth-24);
      pop.style.width=w+'px';pop.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left+r.width/2-w/2))+scrollX+'px';pop.style.top=r.bottom+scrollY+8+'px';return}
    if(!e.target.closest('.w-pop'))closePop();else if(e.target.closest('.w-pop-a'))closePop()},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&popFor){const b=popFor;closePop();b.focus()}});

  /* ---------- Radar zeichnen ---------- */
  const RAD=[0,138,204,256,300],DOT=innerWidth<700?23:13,GAP=DOT*2+8,QA=[[180,270],[270,360],[0,90],[90,180]];
  const svg=$('#radar-svg');
  const el=(t,a,p=svg)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
  for(let i=4;i>=1;i--)el('circle',{r:RAD[i],class:'r-ring'+(i===1?' in0':'')});
  el('path',{d:'M-318 0H318M0-318V318',class:'r-axis'});
  R.ringe.forEach((r,i)=>{const t=el('text',{x:0,y:i?-(RAD[i]+RAD[i+1])/2+7:-RAD[1]+26,class:'r-rl','text-anchor':'middle'});t.textContent=r.name});
  const qpos=[[-318,-300,'start'],[318,-300,'end'],[318,312,'end'],[-318,312,'start']];
  R.themen.forEach((t,i)=>{const[x,y,a]=qpos[i];const tx=el('text',{x,y,'text-anchor':a,class:'r-ql',fill:HEX[t.id]});tx.textContent=t.name});
  /* Blickwinkel: ?fuer=betrieb im Link, sonst alle. Nichts wird gespeichert. */
  const BW=R.blickwinkel,BWN=Object.fromEntries(BW.map(b=>[b.id,b]));
  let bw=new URLSearchParams(location.search).get('fuer');if(!BWN[bw])bw='';
  let focusT=null,cur=-1;
  const ringOf=p=>(bw&&p.fuer[bw]&&p.fuer[bw].ring)||p.ring;
  const hausOf=p=>(bw&&p.fuer[bw]&&p.fuer[bw].haus)||p.haus;
  const offFor=p=>!!bw&&(p.fuer.aus||[]).includes(bw);
  const pos={},lim={};
  function layout(){
    const groups={};P.forEach(p=>{const k=p.thema+'|'+ringOf(p);(groups[k]=groups[k]||[]).push(p)});
    Object.entries(groups).forEach(([k,list])=>{
      const[th,rg]=k.split('|'),qi=R.themen.findIndex(t=>t.id===th),ri=RG[rg].i;
      const[a0,a1]=QA[qi],r0=RAD[ri]+(ri?20:30),r1=RAD[ri+1]-20;
      list.forEach((p,j)=>{
        const m0=a0===270?24:15,m1=a1===270?24:15,a=(a0+m0+(a1-a0-m0-m1)*(list.length===1?.5:j/(list.length-1)))*Math.PI/180;
        const rr=list.length>2?(j%2?r0+(r1-r0)*.72:r0+(r1-r0)*.28):(r0+r1)/2;
        pos[p.id]=[Math.cos(a)*rr,Math.sin(a)*rr];
        lim[p.id]=[r0,r1,(a0+(a0===270?22:12))*Math.PI/180,(a1-(a1===270?22:12))*Math.PI/180];
      });
    });
    // sanft auseinanderschieben, damit sich keine Punkte überdecken
    const ids=Object.keys(pos);
    for(let it=0;it<60;it++){
      for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
        const A=pos[ids[i]],C=pos[ids[j]],dx=C[0]-A[0],dy=C[1]-A[1],d=Math.hypot(dx,dy)||.01;
        if(d<GAP){const k=(GAP-d)/2/d;A[0]-=dx*k;A[1]-=dy*k;C[0]+=dx*k;C[1]+=dy*k}
      }
      ids.forEach(id=>{const[r0,r1,b0,b1]=lim[id],P2=pos[id];let r=Math.hypot(P2[0],P2[1]),a=Math.atan2(P2[1],P2[0]);if(a<0)a+=2*Math.PI;
        if(b1>2*Math.PI-.01&&a<b0-1)a+=2*Math.PI;
        r=Math.min(r1,Math.max(r0,r));a=Math.min(b1,Math.max(b0,a));P2[0]=Math.cos(a)*r;P2[1]=Math.sin(a)*r});
    }
  }
  layout();
  const dots={};
  P.forEach((p,i)=>{
    const[x,y]=pos[p.id];
    const g=el('g',{class:'r-dot',tabindex:0,role:'button','data-id':p.id,style:`--i:${i}`,transform:`translate(${x.toFixed(1)} ${y.toFixed(1)})`});
    const b=el('g',{class:'b'},g);
    el('circle',{r:DOT,class:'r-halo'},b);el('circle',{r:DOT,fill:HEX[p.thema]},b);
    el('text',{},b).textContent=p.n;
    if(p.bewegt){const t=el('text',{x:16,y:-12,class:'r-new'},b);t.textContent=p.bewegt}
    g.addEventListener('click',()=>pick(p.id,false));
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(p.id,false)}});
    dots[p.id]=g;
  });
  function redraw(){
    layout();
    P.forEach(p=>{const g=dots[p.id],[x,y]=pos[p.id];g.setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      g.setAttribute('aria-label',`${p.n}. ${p.name}, ${RG[ringOf(p)].name}`+(offFor(p)?', für diesen Blickwinkel eher am Rand':''));
      g.classList.toggle('dim',offFor(p)||(!!focusT&&p.thema!==focusT))});
  }
  // Mini-Radar im Kopf
  const md=$('.w-mini .md');P.forEach((p,i)=>{const[x,y]=pos[p.id];const c=document.createElementNS(NS,'circle');c.setAttribute('cx',(x/3).toFixed(1));c.setAttribute('cy',(y/3).toFixed(1));c.setAttribute('r',4.2);c.setAttribute('fill',HEX[p.thema]);c.style.transitionDelay=(300+i*45)+'ms';md.appendChild(c)});
  requestAnimationFrame(()=>$('.w-mini').classList.add('in'));
  const fig=$('.w-radar');
  if('IntersectionObserver' in window&&!RM){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){fig.classList.add('in');io.disconnect()}}),{rootMargin:'0px 0px -15% 0px'});io.observe(fig)}else fig.classList.add('in');

  /* Legende als Filter */
  const leg=document.createElement('div');leg.className='w-legend';leg.setAttribute('role','group');leg.setAttribute('aria-label','Thema hervorheben');
  leg.innerHTML=R.themen.map(t=>`<button type="button" aria-pressed="false" data-t="${t.id}" style="--c:${COL[t.id]}"><i></i>${esc(t.name)}</button>`).join('');
  fig.after(leg);fig.parentNode.parentNode.insertBefore(leg,$('#radar-list'));
  leg.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;focusT=focusT===b.dataset.t?null:b.dataset.t;
    $$('button',leg).forEach(x=>x.setAttribute('aria-pressed',x.dataset.t===focusT));
    redraw();
    if(focusT){const first=P.find(p=>p.thema===focusT);if(first)pick(first.id,false)}});

  /* Liste nach Ringen (auch für Screenreader und Handy) */
  const drawList=()=>{$('#radar-list').innerHTML=R.ringe.map(r=>`<div><h3>${esc(r.name)}</h3><p>${esc(r.satz)}</p><ul>${P.filter(p=>ringOf(p)===r.id&&!offFor(p)).map(p=>`<li><button type="button" data-id="${p.id}" style="--c:${COL[p.thema]}"><i></i>${p.n}. ${esc(p.name)}</button></li>`).join('')}</ul></div>`).join('')};
  $('#radar-list').addEventListener('click',e=>{const b=e.target.closest('button');if(b)pick(b.dataset.id,true)});

  const bwBox=$('#bw');
  bwBox.innerHTML=`<button type="button" data-b="">Alle</button>`+BW.map(b=>`<button type="button" data-b="${b.id}" title="${esc(b.lang)}">${esc(b.name)}</button>`).join('');
  let ready=false;
  function setBw(v,push){bw=v;keep(bw);const ok=$('#bw-ok');ok.hidden=!bw;ok.innerHTML=bw?`Die ganze Seite zeigt jetzt, was für ${esc(BWN[bw].fuer)} zählt: <a href="#kurz">das Wichtigste in fünf Punkten ↓</a>`:'';$$('button',bwBox).forEach(x=>x.setAttribute('aria-pressed',x.dataset.b===bw));
    const tag=$('#bwtag');tag.hidden=!bw;tag.innerHTML=bw?`Blick: ${esc(BWN[bw].name)} <small>ändern</small>`:'';tag.title='Blickwinkel ändern';
    if(push){const u=new URL(location.href);bw?u.searchParams.set('fuer',bw):u.searchParams.delete('fuer');history.replaceState(null,'',u)}
    redraw();drawList();if(cur>=0)pick(P[cur].id,false);if(ready){st.alle=false;st.n=N0;list();drawWeeks();drawKurz();drawCta()}}
  $('#bwtag').addEventListener('click',()=>{$('.w-bw').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});const b=$('#bw button[aria-pressed=true]')||$('#bw button');setTimeout(()=>b.focus({preventScroll:true}),RM?0:450)});
  bwBox.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setBw(b.dataset.b,true)});
  const det=$('#radar-detail');
  det.innerHTML=`<p class="tag">So lesen Sie das Radar</p><p class="hint">Innen: lohnt sich jetzt.<br>Außen: lieber noch warten.</p><p class="s">Jeder Punkt hat eine Einordnung, einen Vorschlag für Ihr Haus und die Befunde dahinter. Tippen Sie auf eine Nummer.</p>`;
  function pick(id,scroll){
    const p=P.find(q=>q.id===id);cur=P.indexOf(p);
    $$('.r-dot',svg).forEach(g=>g.classList.toggle('on',g.dataset.id===id));
    const bel=p.belege.map(fid=>FB[fid]).filter(Boolean);
    det.style.setProperty('--c',COL[p.thema]);
    det.innerHTML=`<p class="tag"><i></i>${esc(TH[p.thema].name)} · Nr. ${p.n}</p><h3>${esc(p.name)}</h3><p class="ring">${esc(RG[ringOf(p)].name)}</p>${bw&&ringOf(p)!==p.ring?`<p class="alle">Ohne Blickwinkel: ${esc(RG[p.ring].name)}</p>`:''}${offFor(p)?`<p class="alle">Für ${esc(BWN[bw].mehrzahl)} eher am Rand.</p>`:''}<p>${T(p.satz)}</p>
      <div class="haus"><b>Für ${esc(bw?BWN[bw].fuer:'Ihr Haus')}</b>${T(hausOf(p))}</div>
      ${bel.length?`<p class="xs m" style="margin:14px 0 0">Was dahinter steht (${bel.length})</p><ul class="bel">${bel.map(f=>`<li><a href="#${f.id}" data-f="${f.id}" data-from="${p.id}">${esc(cut(f.text,120))}</a> <span class="xs m">· ${esc(f.guete_name)}, geprüft ${dat(f.geprueft)}</span></li>`).join('')}</ul>`:''}
      ${p.impuls&&D.impulse[p.impuls]?`<p class="s" style="margin:14px 0 0">Ausführlich im Impuls: <a href="impulse/${p.impuls}/">${esc(D.impulse[p.impuls])}</a></p>`:''}
      <div class="nav2"><button type="button" data-d="-1">← voriger</button><button type="button" data-d="1">nächster →</button></div>`;
    if(scroll&&innerWidth<980)det.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
    else if(scroll)$('.w-radar').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  }
  det.addEventListener('click',e=>{const b=e.target.closest('button[data-d]');if(b){pick(P[(cur+ +b.dataset.d+P.length)%P.length].id,false);return}
    const a=e.target.closest('a[data-f]');if(a){e.preventDefault();showFact(a.dataset.f,{r:a.dataset.from})}});
  window.wissenPick=pick;

  /* ---------- Das Wichtigste, je Blickwinkel ---------- */
  const ARTK={'Pflicht':'regeln','Jetzt tun':'tun','Neu':'neu','Vorsicht':'vorsicht','Lernen':'lernen','Geld':'geld','Noch warten':'warten'};
  function drawKurz(){
    const L=(D.kurz||{})[bw||'alle']||[];
    $('#kurz-kick').textContent=bw?'Kurz und bündig · für '+BWN[bw].mehrzahl:'Kurz und bündig · für alle';
    $('#kurz-h').textContent=bw?`Das Wichtigste für ${BWN[bw].fuer}`:'Das Wichtigste jetzt, in fünf Punkten';
    $('#kurz-hint').innerHTML=bw?'':'Gilt für fast jedes Haus. Wählen Sie oben, woher Sie kommen, dann stehen hier fünf Punkte für Bildungshaus, Schule, Gemeinde oder Betrieb.';
    $('#kurz-hint').hidden=!!bw;
    $('#kurz-list').innerHTML=L.map(k=>{
      const rad=(k.radar||[]).map(id=>P.find(p=>p.id===id)).filter(Boolean);
      const bel=(k.belege||[]).filter(id=>FB[id]);
      return `<li><span class="w-stamp a-${ARTK[k.art]||'neu'}">${esc(k.art)}</span><h3>${esc(k.titel)}</h3><p>${T(k.text)}</p>${rad.length||bel.length?`<p class="go">${rad.map(p=>`<button type="button" data-r="${p.id}">→ Radar ${p.n}: ${esc(p.name)}</button>`).join('')}${bel.map((id,i)=>`<a href="#${id}" data-f="${id}">${bel.length>1?'Beleg '+(i+1):'Beleg ansehen'}</a>`).join('')}</p>`:''}</li>`}).join('');
    const sd=D.kurz&&D.kurz.stand;$('#kurz-stand').textContent=(sd?'Stand '+dat(sd)+' · ':'')+'eingeordnet von Armin Fradler · arminfradler.at/wissen'+(bw?'?fuer='+bw:'');
  }
  $('#kurz-list').addEventListener('click',e=>{const r=e.target.closest('button[data-r]');if(r){pick(r.dataset.r,true);return}
    const a=e.target.closest('a[data-f]');if(a){e.preventDefault();showFact(a.dataset.f,{k:true})}});
  $('#kurz-print').addEventListener('click',()=>print());
  const ctaDef=[$('#cta-h').textContent,$('#cta-t').textContent];
  function drawCta(){$('#cta-h').textContent=bw?`Und was heißt das für ${BWN[bw].fuer}?`:ctaDef[0];$('#cta-t').textContent=bw?BWN[bw].cta:ctaDef[1]}

  /* ---------- Nachrichten: die fünf wichtigsten am Schaukasten ---------- */
  const NN=D.nachrichten||{meldungen:[],wochen:[]};
  const tagMon=iso=>{const[y,m,d]=iso.split('-');return `${+d}.${+m}.`};
  const GW={wichtig:2,gut:1,laut:0};
  const note=p=>{const rp=p.radar&&P.find(q=>q.id===p.radar);
    return `<article class="w-note${p.gewicht==='laut'?' calm':''}"><p class="w-note-d"><span>${tagMon(p.datum)}</span> ${esc(NN.arten[p.art]||'')}${p.verfuegbar&&p.verfuegbar!=='allgemein'?` · <em>${esc(p.verfuegbar==='vorschau'?'erst als Vorschau':p.verfuegbar==='angekuendigt'?'angekündigt':p.verfuegbar)}</em>`:''}</p><h4><a href="nachrichten.html${bw?'?fuer='+bw:''}#${p.id}">${esc(p.titel)}</a></h4><p>${T(p.was)}</p><p class="f">${esc(p.einordnung)}</p><p class="src">${p.quellen.map(q=>`<a href="${esc(q.u)}" rel="noopener">${esc(cut(q.t,64))}</a>`).join(' · ')}${rp?` · <button class="more" type="button" data-r="${rp.id}">Radar ${rp.n}</button>`:''}</p></article>`};
  function drawWeeks(){
    const st0=NN.stand,grenze=st0?new Date(new Date(st0)-28*864e5).toISOString().slice(0,10):'';
    const pool=NN.meldungen.filter(m=>m.datum>=grenze&&m.gewicht!=='laut'&&(!bw||m.fuer.includes(bw)));
    const top=pool.sort((a,b)=>GW[b.gewicht]-GW[a.gewicht]||b.datum.localeCompare(a.datum)).slice(0,5).sort((a,b)=>b.datum.localeCompare(a.datum));
    $('#board').innerHTML=`<div class="w-week rv in"><h3>Stand ${st0?dat(st0):''} <small>${bw?'für '+esc(BWN[bw].mehrzahl)+', ':''}aus den letzten vier Wochen</small></h3>${top.length?`<div class="w-notes">${top.map(note).join('')}</div>`:`<p class="w-empty">In den letzten vier Wochen war nichts dabei, was ${esc(bw?BWN[bw].mehrzahl:'alle')} besonders betrifft.</p>`}</div>`;
    $('#alle-n').href='nachrichten.html'+(bw?'?fuer='+bw:'');
    $('#alle-n').innerHTML=`Alle ${NN.meldungen.length} KI-Nachrichten <span class="arr">→</span>`;
  }
  $('#board').addEventListener('click',e=>{const b=e.target.closest('button[data-r]');if(b)pick(b.dataset.r,true)});

  /* ---------- Nachgeschaut ---------- */
  const N0=innerWidth<700?5:10;
  const GO=['B','G','P','A','U','H','S'].filter(g=>F.some(f=>f.guete===g));
  let st={t:'',g:'',q:'',a:'',r:'',l:'',n:N0,hl:null,alle:false,back:null};
  const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  // Ein Befund passt, wenn er alle Filter erfüllt. "ohne" lässt einen Filter weg, damit die Zahlen an den Knöpfen stimmen.
  const pass=(f,ohne)=>{const q=norm(st.q);return (ohne==='t'||!st.t||f.tags.includes(st.t))&&(ohne==='g'||!st.g||f.guete===st.g)&&(ohne==='a'||!st.a||f.art===st.a)&&(ohne==='r'||((!st.r||f.region===st.r)&&(!st.l||f.land===st.l)))
    &&(!bw||st.alle||f.fuer.includes(bw)||f.id===st.hl)&&(!q||norm(f.text+' '+f.grenzen+' '+f.quellen.map(x=>x.t).join(' ')).includes(q))};
  const chips=(box,key,all,items,col)=>{const n=id=>F.filter(f=>pass(f,key)&&(!id||(key==='t'?f.tags.includes(id):key==='a'?f.art===id:key==='g'?f.guete===id:f.region===id))).length;
    $(box).innerHTML=`<button type="button" aria-pressed="${!st[key]}" data-v="">${all} <small>${n('')}</small></button>`+items.map(([id,name])=>{const k=n(id);return `<button type="button" aria-pressed="${st[key]===id}" data-v="${id}"${col?` style="--c:${COL[id]}"`:''}${k||st[key]===id?'':' disabled'}>${col?'<i></i>':''}${esc(name)} <small>${k}</small></button>`}).join('')};
  function list(){
    const fit=f=>f.kern===bw?2:f.fuer.includes(bw)?1:0;
    const hit=F.filter(f=>pass(f)).sort((a,b)=>(bw?fit(b)-fit(a):0)||(b.radar?1:0)-(a.radar?1:0)||(b.geprueft||'').localeCompare(a.geprueft||''));
    if(st.hl){const i=hit.findIndex(f=>f.id===st.hl);if(i>=st.n)st.n=i+1}
    chips('#chips-thema','t','Alle Themen',FTHEMA,true);chips('#chips-art','a','jede Art',ART);chips('#chips-region','r','überall',REG);
    chips('#chips-guete','g','jede Güte',GO.map(g=>[g,D.guete[g]]));
    $('#count').innerHTML=esc(`${hit.length} ${hit.length===1?'Befund':'Befunde'}`+(bw&&!st.alle?` für ${BWN[bw].mehrzahl}`:'')+(st.q?` zu „${st.q}“`:''))
      +(st.l?` aus <button type="button" class="w-x" id="land-x" aria-label="Filter ${esc(LAND[st.l])} aufheben">${esc(LAND[st.l])} <b aria-hidden="true">×</b></button>`:'')
      +(bw?` · <button type="button" class="more" id="alle-x">${st.alle?`nur die für ${esc(BWN[bw].mehrzahl)}`:`alle ${F.length} zeigen`}</button>`:'');
    $$('.m-c,.m-b',$('#map')).forEach(e=>e.classList.toggle('on',e.dataset.l===st.l));
    $('#facts').innerHTML=hit.slice(0,st.n).map(card).join('')||`<p class="w-empty">Nichts gefunden. Versuchen Sie ein anderes Wort${bw&&!st.alle?' oder zeigen Sie alle Befunde':''}.</p>`;
    $('#more').hidden=hit.length<=st.n;$('#more').textContent=`Mehr zeigen (noch ${Math.max(0,hit.length-st.n)})`;
  }
  function card(f){
    const due=f.faellig&&f.faellig<TODAY;
    const rad=(f.radar||[]).map(id=>P.find(p=>p.id===id)).filter(Boolean);
    return `<article class="w-fact${st.hl===f.id?' hl':''}" id="${f.id}" style="--c:${COL[f.tags[0]]}"><p>${esc(f.text)}</p>
      <div class="meta"><span class="g g${f.guete}" title="Güte der Quelle">${esc(f.guete_name)}</span><span>geprüft ${dat(f.geprueft)}</span><span class="herk">${esc(LAND[f.land]||'')} · ${esc((ART.find(a=>a[0]===f.art)||['',''])[1])}</span>${due?'<span class="due">wird nachgeprüft</span>':''}</div>
      ${f.grenzen?`<p class="lim"><b>Grenzen:</b> ${esc(f.grenzen)}</p>`:''}
      <div class="links">${f.quellen.map(q=>`<a href="${esc(q.u)}" rel="noopener">${esc(cut(q.t,48))}</a>`).join('')}${(f.impulse||[]).filter(s=>D.impulse[s]).map(s=>`<a href="impulse/${s}/">Impuls: ${esc(cut(D.impulse[s],46))}</a>`).join('')}${rad.map(p=>`<button class="r" type="button" data-r="${p.id}">→ Radar ${p.n}: ${esc(p.name)}</button>`).join('')}</div>${st.hl===f.id&&st.back?`<p class="w-back"><button type="button" data-back>← zurück ${st.back.r?`zu Radarpunkt ${P.find(p=>p.id===st.back.r)?.n}`:'zum Wichtigsten'}</button></p>`:''}</article>`;
  }
  const chipKey={'chips-thema':'t','chips-guete':'g','chips-art':'a','chips-region':'r'};
  $('#filt').addEventListener('click',e=>{const b=e.target.closest('.w-chips button');if(!b)return;const k=chipKey[b.parentNode.id];st[k]=b.dataset.v;if(k==='r')st.l='';st.n=N0;st.hl=null;list()});
  let tq;$('#q').addEventListener('input',e=>{clearTimeout(tq);tq=setTimeout(()=>{st.q=e.target.value.trim();st.n=N0;st.hl=null;list()},120)});
  $('#more').addEventListener('click',()=>{st.n+=10;list()});
  $('#nachgeschaut').addEventListener('click',e=>{const x=e.target.closest('#land-x,#alle-x,[data-back]');if(!x)return;
    if(x.id==='land-x'){st.l='';list()}
    else if(x.id==='alle-x'){st.alle=!st.alle;st.n=N0;list()}
    else{const bk=st.back;st.back=null;st.hl=null;list();if(bk&&bk.r)pick(bk.r,true);else $('#kurz').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}});
  if(innerWidth<700)$('#filt').open=false;
  /* ---------- Weltkarte ---------- */
  const byL={};F.forEach(f=>byL[f.land]=(byL[f.land]||0)+1);
  const nAT=byL.at||0,nUS=byL.us||0;
  $('#map-big').innerHTML=`<b>${nAT}</b> von ${F.length} Befunden stammen aus Österreich, <b>${nUS}</b> aus den USA.`;
  $('#map-small').textContent='Die meiste Forschung zu KI kommt aus Amerika. Darum suche ich gezielt nach Zahlen aus Österreich und sage dazu, wenn eine Studie woanders gemacht wurde. Tippen Sie auf ein Land, dann sehen Sie nur dessen Befunde.';
  if(K){
    const ms=$('#map'),mk=(t,a,p=ms)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
    mk('path',{d:K.sphere,class:'m-sea'});mk('path',{d:K.land,class:'m-land'});
    const L=K.lupe,[lx,ly]=L.c,[ex,ey]=K.europa;
    // Europa auf der Weltkarte markieren und mit der Lupe verbinden
    mk('circle',{cx:ex,cy:ey,r:22,class:'m-eu-ring'});
    const dx=lx-ex,dy=ly-ey,dd=Math.hypot(dx,dy);
    mk('path',{d:`M${ex+dx/dd*22} ${ey+dy/dd*22}L${lx-dx/dd*(L.r+4)} ${ly-dy/dd*(L.r+4)}`,class:'m-link'});
    const defs=mk('defs',{}),cp=mk('clipPath',{id:'lupe-clip'},defs);mk('circle',{cx:lx,cy:ly,r:L.r},cp);
    mk('circle',{cx:lx,cy:ly,r:L.r+6,class:'m-lupe-rim'});
    mk('circle',{cx:lx,cy:ly,r:L.r,class:'m-lupe'});
    const lg=mk('g',{'clip-path':'url(#lupe-clip)'});
    mk('path',{d:L.land,class:'m-land'},lg);
    const country=(k,v,p)=>{if(!byL[k])return;const e=mk('path',{d:v.d,class:'m-c'+(k==='at'?' at':''),'data-l':k},p);e.addEventListener('click',()=>setLand(k))};
    Object.entries(K.laender).forEach(([k,v])=>country(k,v,ms));
    Object.entries(L.laender).forEach(([k,v])=>country(k,v,lg));
    const S=innerWidth<700?1.55:1,top=mk('g',{class:'m-top'});
    const lt=mk('text',{x:lx-L.r-12,y:ly+L.r-14,class:'m-l m-lupe-t','text-anchor':'end'},top);lt.textContent='Europa, vergrößert';
    // EU sitzt als Abzeichen am Rand der Lupe, nicht auf einem Land
    const EUpos=[lx-Math.cos(Math.PI/6)*L.r,ly+Math.sin(Math.PI/6)*L.r];
    const at=k=>k==='eu'?EUpos:k==='intl'?[452,392]:(L.laender[k]||K.laender[k]||{}).c;
    const inL=k=>!!L.laender[k];
    const B=Object.entries(byL).map(([k,n])=>{const p=at(k);if(!p)return null;
      const r=S*(inL(k)?Math.max(10,Math.min(21,6+Math.sqrt(n)*3.3)):Math.max(12,Math.min(32,8+Math.sqrt(n)*4.4)));
      return {k,n,x:p[0],y:p[1],x0:p[0],y0:p[1],r}}).filter(Boolean).sort((a,b)=>b.n-a.n);
    // Blasen in der Lupe sanft auseinanderschieben, Österreich bleibt, wo es ist
    const LB=B.filter(o=>inL(o.k));
    for(let it=0;it<80;it++){
      for(let i=0;i<LB.length;i++)for(let j=i+1;j<LB.length;j++){
        const A=LB[i],C=LB[j],dx=C.x-A.x,dy=C.y-A.y,d=Math.hypot(dx,dy)||.01,m=A.r+C.r+2;
        if(d<m){const f=(m-d)/d,wa=A.k==='at'?0:C.k==='at'?1:.5;A.x-=dx*f*wa;A.y-=dy*f*wa;C.x+=dx*f*(1-wa);C.y+=dy*f*(1-wa)}
      }
      LB.forEach(o=>{const dx=o.x-lx,dy=o.y-ly,d=Math.hypot(dx,dy),m=L.r-o.r-3;if(d>m){o.x=lx+dx/d*m;o.y=ly+dy/d*m}});
    }
    B.forEach(({k,n,x,y,x0,y0,r})=>{
      if(Math.hypot(x-x0,y-y0)>r*.6)mk('path',{d:`M${x0} ${y0}L${x} ${y}`,class:'m-pin'},lg);
      const g=mk('g',{class:'m-b '+k,'data-l':k,tabindex:0,role:'button','aria-label':`${LAND[k]}: ${n} ${n===1?'Befund':'Befunde'}`,transform:`translate(${x} ${y})`});
      mk('title',{},g).textContent=`${LAND[k]}: ${n} ${n===1?'Befund':'Befunde'}`;
      mk('circle',{r},g);mk('text',{},g).textContent=n;
      const name={at:'Österreich',eu:'EU',intl:'International',us:'USA'}[k]||(!inL(k)&&S===1?LAND[k]:'');
      if(name){const lab=mk('text',{x:k==='at'?x:(k==='eu'||k==='cn')?x-r-6:x+r+5,y:k==='at'?y+r+20*S:y+5*S,class:'m-l'+(k==='at'?' at':''),'text-anchor':k==='at'?'middle':(k==='eu'||k==='cn')?'end':'start'},top);lab.textContent=name}
      g.addEventListener('click',()=>setLand(k));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setLand(k)}});
    });
    ms.appendChild(top);
  } else $('.w-map-fig').hidden=true;
  function setLand(k){st.l=st.l===k?'':k;st.r='';st.n=N0;st.hl=null;list();$('#count').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'})}
  $('#facts').addEventListener('click',e=>{const b=e.target.closest('button[data-r]');if(b)pick(b.dataset.r,true)});
  function showFact(id,back){
    st={t:'',g:'',q:'',a:'',r:'',l:'',n:N0,hl:id,alle:st.alle,back:back||null};$('#q').value='';
    list();const c=document.getElementById(id);if(c)c.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  }
  ready=true;setBw(bw,false);

  /* ---------- Begriffe ---------- */
  $('#terms').innerHTML=R.begriffe.map((b,i)=>`<div class="w-term rv${i>=6?' w-term-x':''}" id="b-${b.id}"><h3>${esc(b.name)}</h3><p>${esc(b.satz)}</p>${b.radar.map(id=>{const p=P.find(q=>q.id===id);return p?`<button type="button" data-r="${p.id}">→ ${p.n}. ${esc(p.name)}</button>`:''}).join('')}</div>`).join('');
  $('#terms').addEventListener('click',e=>{const b=e.target.closest('button[data-r]');if(b)pick(b.dataset.r,true)});
  observe($$('#terms .rv'));
  // Auf dem Handy zuerst sechs Begriffe, der Rest auf Wunsch
  $('#terms').insertAdjacentHTML('afterend',`<p class="w-terms-more"><button type="button" class="btn light">Alle ${R.begriffe.length} Begriffe zeigen</button></p>`);
  const allTerms=()=>{$('#terms').classList.add('open');const m=$('.w-terms-more');if(m)m.hidden=true};
  $('.w-terms-more button').addEventListener('click',allTerms);
  document.addEventListener('click',e=>{if(e.target.closest('.w-pop-a'))allTerms()},true);

  /* Reiter oben mitführen */
  const tabs=$$('.w-tabs a'),secs=tabs.map(a=>$(a.getAttribute('href')));
  addEventListener('scroll',()=>{let k=-1;secs.forEach((s,i)=>{if(s.getBoundingClientRect().top<170)k=i});tabs.forEach((a,i)=>a.classList.toggle('on',i===k))},{passive:true});

  // Deep-Link #radar-<id>
  const h=location.hash.match(/^#radar-(.+)/);if(h&&P.some(p=>p.id===h[1]))pick(h[1],true);
}
function cut(s,n){s=String(s);return s.length>n?s.slice(0,s.lastIndexOf(' ',n-1)>n*.6?s.lastIndexOf(' ',n-1):n-1)+' …':s}
function observe(els){if(!('IntersectionObserver' in window)||RM){els.forEach(e=>e.classList.add('in'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});els.forEach(e=>io.observe(e))}
})();
