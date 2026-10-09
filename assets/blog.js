/* Impulse: Die Beiträge stehen fertig im HTML (gebaut von tools/build_blog.py). Hier nur der Filter nach Thema. */
(()=>{
function filter(list,filters){
  if(!list||!filters)return;
  const btns=[...filters.querySelectorAll('button')],cards=[...list.querySelectorAll('.post')];
  const show=c=>{
    btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.c===c)));
    cards.forEach(k=>{k.hidden=!!c&&k.dataset.c!==c;if(!k.hidden)k.classList.add('in')});
  };
  btns.forEach(b=>b.onclick=()=>{show(b.dataset.c);history.replaceState(null,'',b.dataset.c?`?thema=${b.dataset.c}`:location.pathname)});
  const want=new URLSearchParams(location.search).get('thema')||'';
  if(btns.some(b=>b.dataset.c===want))show(want);
}
window.Blog={filter};
})();
