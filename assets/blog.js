/* Impulse: Beiträge aus der bestehenden Blog-Datenbank lesen und darstellen (nur Lesen veröffentlichter Beiträge). */
(()=>{
const ROOT=document.currentScript.dataset.root||'./';
const A=()=>window.AF,esc=s=>A().esc(s);
const mins=v=>v?Math.max(1,Math.round(v>60?v/60:v)):0;
const SEL='id,title,slug,excerpt,featured_image_url,published_at,average_read_time,category:categories(name,slug)';
function card(p){
  return `<a class="post rv in" href="${ROOT}impulse/${encodeURIComponent(p.slug)}/">
    ${p.featured_image_url?`<div class="im"><img src="${esc(p.featured_image_url)}" alt="" loading="lazy"></div>`:''}
    <div class="b"><span class="cat">${esc(p.category?.name||'Impuls')}</span><h3>${esc(p.title)}</h3>${p.excerpt?`<p>${esc(p.excerpt)}</p>`:''}<span class="meta">${A().date(p.published_at)}${p.average_read_time?` · ${mins(p.average_read_time)} Min. Lesezeit`:''}</span></div></a>`;
}
async function latest(el,n){
  try{const d=await A().get(`posts?select=${SEL}&status=eq.published&order=published_at.desc&limit=${n}`);el.innerHTML=d.map(card).join('')}
  catch(e){el.innerHTML=`<p class="m">Die Beiträge sind gerade nicht erreichbar.</p>`}
}
async function list(el,filters){
  let posts=[];
  try{posts=await A().get(`posts?select=${SEL}&status=eq.published&order=published_at.desc`)}catch(e){el.innerHTML='<p class="m">Die Beiträge sind gerade nicht erreichbar.</p>';return}
  const cats=[...new Map(posts.filter(p=>p.category).map(p=>[p.category.slug,p.category.name])).entries()];
  const want=new URLSearchParams(location.search).get('thema');
  filters.innerHTML=`<button type="button" data-c="" aria-pressed="${!want}">Alle</button>`+cats.map(([s,n])=>`<button type="button" data-c="${esc(s)}" aria-pressed="${want===s}">${esc(n)}</button>`).join('');
  const draw=c=>{el.innerHTML=posts.filter(p=>!c||p.category?.slug===c).map(card).join('')};
  filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{filters.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw(b.dataset.c);history.replaceState(null,'',b.dataset.c?`?thema=${b.dataset.c}`:location.pathname)});
  draw(want||'');
}
/* Kleiner, sicherer Markdown-Renderer: erst alles maskieren, dann wenige Formate erlauben */
function inline(t){
  t=esc(t);
  t=t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
  t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(m,a,u)=>`<a href="${u}" rel="noopener" target="_blank">${a}</a>`);
  t=t.replace(/`([^`]+)`/g,'<code>$1</code>');
  return t;
}
function md(src,images){
  const lines=src.replace(/\r/g,'').split('\n');let out='',i=0,para=[];
  const flush=()=>{if(para.length){out+=`<p>${inline(para.join(' '))}</p>`;para=[]}};
  while(i<lines.length){
    const l=lines[i];
    if(!l.trim()){flush();i++;continue}
    let m;
    if(m=l.match(/^(#{1,4})\s+(.*)/)){flush();const lv=Math.min(Math.max(m[1].length,2),3);if(m[1].length>1)out+=`<h${lv}>${inline(m[2])}</h${lv}>`;i++;continue}
    if(/^---+\s*$/.test(l)){flush();out+='<hr>';i++;continue}
    if(/^>\s?/.test(l)){flush();const q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,''));out+=`<blockquote>${inline(q.join(' '))}</blockquote>`;continue}
    if(/^\s*[-*]\s+/.test(l)){flush();const it=[];while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i]))it.push(lines[i++].replace(/^\s*[-*]\s+/,''));out+=`<ul>${it.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`;continue}
    if(/^\s*\d+[.)]\s+/.test(l)){flush();const it=[];while(i<lines.length&&/^\s*\d+[.)]\s+/.test(lines[i]))it.push(lines[i++].replace(/^\s*\d+[.)]\s+/,''));out+=`<ol>${it.map(x=>`<li>${inline(x)}</li>`).join('')}</ol>`;continue}
    if(/^\|.*\|\s*$/.test(l)){flush();const rows=[];while(i<lines.length&&/^\|.*\|\s*$/.test(lines[i]))rows.push(lines[i++]);const cells=r=>r.trim().slice(1,-1).split('|').map(c=>c.trim());const body=rows.filter(r=>!/^\|[\s:|-]+\|$/.test(r.trim()));out+=`<table>${body.map((r,k)=>`<tr>${cells(r).map(c=>k?`<td>${inline(c)}</td>`:`<th>${inline(c)}</th>`).join('')}</tr>`).join('')}</table>`;continue}
    if(m=l.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/)){flush();out+=`<figure><img src="${esc(m[2])}" alt="${esc(m[1])}" loading="lazy"></figure>`;i++;continue}
    para.push(l.trim());i++;
  }
  flush();
  /* Inline-Bilder gleichmäßig zwischen Zwischenüberschriften verteilen */
  if(images&&images.length){
    const parts=out.split('<h2>');
    images.forEach((im,k)=>{const at=Math.min(parts.length-1,Math.round((k+1)*parts.length/(images.length+1)));if(at>0)parts[at]=parts[at].replace(/<\/p>/,`</p><figure><img src="${esc(im.image_url)}" alt="${esc(im.alt_text||'')}" loading="lazy">${im.alt_text?`<figcaption>${esc(im.alt_text)}</figcaption>`:''}</figure>`)});
    out=parts.join('<h2>');
  }
  return out;
}
async function post(el){
  const slug=new URLSearchParams(location.search).get('slug');
  if(!slug){location.replace(ROOT+'impulse/');return}
  let p;
  try{const d=await A().get(`posts?select=*,category:categories(name,slug)&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);p=d[0]}catch(e){}
  if(!p){el.innerHTML='<h1>Beitrag nicht gefunden</h1><p><a href="./">Zu allen Impulsen →</a></p>';return}
  let imgs=[];try{imgs=(await A().get(`post_images?select=image_url,alt_text,image_type,sort_order&post_id=eq.${p.id}&order=sort_order`)).filter(x=>x.image_type!=='featured')}catch(e){}
  document.title=p.title+' · Armin Fradler';if(p.meta_description){let m=document.querySelector('meta[name=description]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m)}m.content=p.meta_description}
  const md0=(p.content||'').replace(/^#\s+.*\n/,'');
  el.innerHTML=`<p class="kick"><a href="./${p.category?`?thema=${esc(p.category.slug)}`:''}" style="text-decoration:none">${esc(p.category?.name||'Impuls')}</a> · ${A().date(p.published_at)}${p.average_read_time?` · ${mins(p.average_read_time)} Min.`:''}</p>
    <h1 style="font-size:clamp(32px,5vw,50px);margin-bottom:22px">${esc(p.title)}</h1>
    ${new Date(p.published_at)<new Date('2026-09-01')?'<p class="archive-note">Aus dem Archiv: Dieser Beitrag ist vor über einem halben Jahr erschienen. Manche Zahlen und Produktnamen haben sich seither geändert.</p>':''}
    ${p.featured_image_url?`<figure style="margin:0 0 30px"><img src="${esc(p.featured_image_url)}" alt="" style="border-radius:4px"></figure>`:''}
    <div class="article">${md(md0,imgs)}</div>
    <hr style="border:0;border-top:1px solid var(--line);margin:46px 0 22px"><p><a href="./">← Alle Impulse</a> · <a href="${ROOT}kontakt.html">Darüber reden? Schreiben Sie mir.</a></p>`;
}
window.Blog={latest,list,post};
})();
