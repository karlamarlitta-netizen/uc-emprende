/* UC Emprende – web móvil con Supabase (rutas por hash: #/producto/ID, #/chat/ID …) */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'S/ '+(+n).toFixed(2);
const hhmm=d=>new Date(d).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
let CAT=[];
const DEFCATS=['Comida','Ropa','Útiles','Tecnología','Servicios','Otros'];
const EMO={Comida:'🍪',Ropa:'👕',Útiles:'📚',Tecnología:'🎧',Servicios:'🛠️',Otros:'🛍️',Todos:'✨'};
const ICO={
 home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6"/>',
 cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
 chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.3A8 8 0 1 1 21 12z"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'};
const I=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;
const V=h=>{$('#view').innerHTML=h};
const ok=r=>{if(r.error)throw r.error;return r.data||[]};
const catIc=n=>{const c=CAT.find(x=>x.name===n);return c?.image_url?`<img src="${esc(c.image_url)}" alt="">`:(c?.emoji||EMO[n]||'🛍️')};
const wa=n=>{n=String(n||'').replace(/\D/g,'');return n.length===9?'51'+n:n};
const safeLink=l=>/^(#\/|https:\/\/)/.test(l||'')?l:'';
const bslide=b=>{const lk=safeLink(b.link);
  const media=b.media_type==='video'?`<video src="${esc(b.media_url)}" muted loop playsinline preload="metadata"></video>`:`<img src="${esc(b.media_url)}" alt="${esc(b.title)}">`;
  const inner=`${media}${b.title||b.subtitle?`<div class="bcap"><b>${esc(b.title)}</b><span>${esc(b.subtitle)}</span></div>`:''}`;
  return `<div class="bs">${lk?`<a href="${esc(lk)}" ${lk.startsWith('http')?'target="_blank" rel="noopener"':''}>${inner}</a>`:inner}</div>`};
const bannerHTML=l=>`<div class="bn" id="bn"><div class="btrack">${l.map(bslide).join('')}</div>${l.length>1?`<div class="bdots">${l.map((_,i)=>`<button class="bd" aria-label="Banner ${i+1}"></button>`).join('')}</div>`:''}</div>`;
function initBanner(){
  const box=$('#bn');if(!box)return;
  const slides=$$('.bs',box),dots=$$('.bd',box);if(!slides.length)return;
  const go=i=>{BI=(i+slides.length)%slides.length;$('.btrack',box).style.transform=`translateX(-${BI*100}%)`;
    dots.forEach((d,k)=>d.classList.toggle('on',k===BI));
    slides.forEach((sl,k)=>{const v=$('video',sl);if(v){if(k===BI)v.play().catch(()=>{});else v.pause()}})};
  const reset=()=>{clearInterval(BT);if(slides.length>1)BT=setInterval(()=>go(BI+1),30000)};
  dots.forEach((d,k)=>d.onclick=()=>{go(k);reset()});
  let x0=null;
  box.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  box.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(BI+(dx<0?1:-1));reset()}x0=null});
  go(0);reset();
}
async function loadCats(){try{CAT=ok(await sb.from('categories').select('*').order('sort').order('name'))}catch{CAT=[]}if(!CAT.length)CAT=DEFCATS.map(name=>({name,emoji:EMO[name]}))}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400)}

let sb,me=null,prof=null,unread=0,ch=null,SQ='',AM='register',MY=[],LIST=[],LASTCAT='',BT=null,BI=0;
let F={sort:'new',min:'',max:'',stock:false};
const cart={get:()=>{try{return JSON.parse(localStorage.uc_cart||'[]')}catch{return[]}},set:v=>{localStorage.uc_cart=JSON.stringify(v);badges()}};

/* ---------- piezas de UI ---------- */
const img=p=>p.image_url?`<img loading="lazy" src="${esc(p.image_url)}" alt="">`:catIc(p.category);
const av=(u,c='')=>u?.avatar_url?`<img class="av ${c}" src="${esc(u.avatar_url)}" alt="">`:`<span class="av ${c}">${esc((u?.name||'?')[0]).toUpperCase()}</span>`;
const pcard=(p,extra='')=>`<div class="card"><a href="#/producto/${p.id}"><div class="ph">${img(p)}${p.stock<1?'<i class="soldout">Agotado</i>':''}</div><div class="cb"><b>${esc(p.name)}</b><small>${esc(p.category)}</small><span>${money(p.price)}</span></div></a>${extra}</div>`;
const tbl=(h,r)=>`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${r}</tbody></table></div>`;
const need=()=>{if(me)return true;toast('Inicia sesión para continuar');location.hash='#/perfil';return false};
function badges(){
  const m=$('#mbadge');m.hidden=!unread;m.textContent=unread;
  const n=cart.get().reduce((a,x)=>a+x.qty,0),c=$('#cbadge');c.hidden=!n;c.textContent=n;
  $('#hello').textContent=prof?`Hola, ${prof.name.split(' ')[0]} 👋`:'Bienvenido 👋';
}
function shell(){
  $('#shell').innerHTML=`<header class="top"><div><small id="hello"></small><a class="logo" href="#/">UC <span>Emprende</span></a></div><a class="ib pill" href="#/mensajes" aria-label="Mensajes">${I('chat')}<span>Mensajes</span><i id="mbadge" hidden></i></a></header><main id="view"></main>
  <nav class="nav">${[['categorias','grid','Categorías'],['vendedores','users','Vendedores'],['','home','Inicio'],['carrito','cart','Carrito'],['perfil','user','Perfil']].map(([k,i,l])=>`<a href="#/${k}" data-n="${k}" aria-label="${l}" class="${k===''?'mid':''}">${I(i)}<span>${l}</span>${k==='carrito'?'<i id="cbadge" hidden></i>':''}</a>`).join('')}</nav>`;
}

/* ---------- sesión, mensajes en vivo ---------- */
async function setUser(u){
  me=u||null;prof=null;unread=0;
  if(me){prof=(await sb.from('profiles').select('*').eq('id',me.id).single()).data;
    const r=await sb.from('messages').select('id',{count:'exact',head:true}).eq('receiver_id',me.id).eq('read',false);unread=r.count||0}
  if(ch){sb.removeChannel(ch);ch=null}
  if(me)ch=sb.channel('m'+me.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'receiver_id=eq.'+me.id},p=>{
    const m=p.new;
    if(location.hash==='#/chat/'+m.sender_id){addBubble(m);sb.from('messages').update({read:true}).eq('id',m.id)}
    else{unread++;badges();toast('💬 Nuevo mensaje')}}).subscribe();
  badges();
}
function addBubble(m){const t=$('#thread');if(!t)return;t.insertAdjacentHTML('beforeend',`<div class="b ${m.sender_id===me.id?'out':'in'}">${esc(m.body)}<small>${hhmm(m.created_at)}</small></div>`);window.scrollTo(0,document.body.scrollHeight)}

/* ---------- páginas ---------- */
async function home(){
  SQ='';
  let bans=[];try{bans=ok(await sb.from('banners').select('*').eq('active',true).order('created_at'))}catch{}
  const ps=ok(await sb.from('products').select('*').order('created_at',{ascending:false}).limit(40));
  const fe=ps.filter(p=>p.featured),top=(fe.length?fe:ps).slice(0,6),rest=ps.filter(p=>!top.includes(p)).slice(0,8);
  V(`${bans.length?bannerHTML(bans):`<section class="hero"><div><h1>Compra y vende entre universitarios</h1><a class="btn light" href="#/categoria/Todos">Explorar</a></div><span>🎓</span></section>`}
  <form class="search" data-form="search">${I('search')}<input name="q" placeholder="Buscar productos…"></form>
  <div class="sh"><h2>Categorías</h2><a href="#/categorias">Ver todo</a></div>
  <div class="cats">${CAT.map(c=>`<a class="cat" href="#/categoria/${encodeURIComponent(c.name)}"><b>${catIc(c.name)}</b>${esc(c.name)}</a>`).join('')}</div>
  <div class="sh"><h2>⭐ Destacados</h2></div><div class="grid">${top.map(p=>pcard(p)).join('')||'<p class="empty">Aún no hay productos. ¡Sé el primero en publicar!</p>'}</div>
  ${rest.length?`<div class="sh"><h2>Recién publicados</h2><a href="#/categoria/Todos">Ver más</a></div><div class="grid">${rest.map(p=>pcard(p)).join('')}</div>`:''}`);
  initBanner();
}
const categorias=()=>V(`<h2 class="pt">Categorías</h2><div class="grid">${[{name:'Todos'},...CAT].map(c=>`<a class="card ccard" href="#/categoria/${encodeURIComponent(c.name)}"><div class="ph">${catIc(c.name)}</div><div class="cb"><b>${esc(c.name)}</b></div></a>`).join('')}</div>`);
const applyF=()=>{let l=LIST.filter(p=>(!F.stock||p.stock>0)&&(F.min===''||p.price>=+F.min)&&(F.max===''||p.price<=+F.max)&&p.name.toLowerCase().includes(SQ.toLowerCase()));
  if(F.sort==='asc')l.sort((a,b)=>a.price-b.price);if(F.sort==='desc')l.sort((a,b)=>b.price-a.price);return l};
const listHTML=()=>{const l=applyF();return`<p class="cnt">${l.length} producto${l.length===1?'':'s'}</p><div class="grid">${l.map(p=>pcard(p)).join('')||'<p class="empty">No hay productos con esos filtros</p>'}</div>`};
async function categoria(c){
  if(c!==LASTCAT){F={sort:'new',min:'',max:'',stock:false};LASTCAT=c}
  let q=sb.from('products').select('*').order('created_at',{ascending:false});if(c!=='Todos')q=q.eq('category',c);
  LIST=ok(await q);
  V(`<h2 class="pt">${esc(c)}</h2><div class="chips">${['Todos',...CAT.map(x=>x.name)].map(x=>`<a class="chip ${x===c?'on':''}" href="#/categoria/${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div>
  <div class="filters"><input data-f="q" placeholder="Buscar…" value="${esc(SQ)}"><select data-f="sort"><option value="new">Más recientes</option><option value="asc" ${F.sort==='asc'?'selected':''}>Precio: menor a mayor</option><option value="desc" ${F.sort==='desc'?'selected':''}>Precio: mayor a menor</option></select>
  <input data-f="min" type="number" min="0" placeholder="S/ mín" value="${F.min}"><input data-f="max" type="number" min="0" placeholder="S/ máx" value="${F.max}"><label class="chk"><input data-f="stock" type="checkbox" ${F.stock?'checked':''}> Solo disponibles</label></div><div id="list">${listHTML()}</div>`);
}
async function producto(id){
  const {data:p}=await sb.from('products').select('*, seller:profiles(id,name,career,avatar_url)').eq('id',id).single();
  if(!p)return V('<p class="empty">Producto no encontrado</p>');
  const mine=me?.id===p.seller_id;
  const [rr,ro]=await Promise.all([sb.from('reviews').select('*, user:profiles(id,name,avatar_url)').eq('product_id',id).order('created_at',{ascending:false}),
    me?sb.from('orders').select('id').eq('product_id',id).eq('buyer_id',me.id).neq('status','cancelado').limit(1):Promise.resolve({data:[]})]);
  const rv=ok(rr),bought=ok(ro).length>0,done=!!me&&rv.some(r=>r.user_id===me.id),avg=rv.length?rv.reduce((a,r)=>a+r.rating,0)/rv.length:0;
  const revHTML=`<h4>Opiniones ${rv.length?`<span class="stars">★</span> ${avg.toFixed(1)} (${rv.length})`:''}</h4>
  ${bought&&!done?`<form data-form="review" data-pid="${p.id}"><select name="rating"><option value="5">★★★★★ Excelente</option><option value="4">★★★★☆ Muy bueno</option><option value="3">★★★☆☆ Regular</option><option value="2">★★☆☆☆ Malo</option><option value="1">★☆☆☆☆ Muy malo</option></select><textarea name="body" rows="2" placeholder="Cuéntanos cómo fue tu compra…"></textarea><button class="btn full">Publicar opinión</button></form>`:`<p class="desc">${done?'Ya opinaste sobre este producto.':'Solo quienes compraron este producto pueden opinar.'}</p>`}
  ${rv.map(r=>`<div class="rev"><div class="rh">${av(r.user,'sm')}<b>${esc(r.user?.name)}</b><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>${r.user_id===me?.id?`<button class="x" data-act="delRev" data-id="${r.id}">✕</button>`:''}</div><p class="desc">${esc(r.body)}</p><small>${new Date(r.created_at).toLocaleDateString('es-PE')}</small></div>`).join('')}`;
  V(`<div class="dhero"><button class="circle" data-act="back" aria-label="Volver">${I('back')}</button><span class="tag">${esc(p.category)}</span><div class="dimg">${img(p)}</div></div>
  <div class="sheet"><div class="trow"><h1>${esc(p.name)}</h1>${p.stock>0?`<div class="qty"><button data-act="dq" data-d="-1">−</button><b id="dq">1</b><button data-act="dq" data-d="1" data-max="${p.stock}">+</button></div>`:''}</div>
  <div class="trow"><div class="price">${money(p.price)}</div><small class="${p.stock?'ok':'bad'}">${p.stock?p.stock+' disponibles':'Agotado'}</small></div>
  <h4>Descripción</h4><p class="desc">${esc(p.description)||'Sin descripción'}</p>
  <a class="seller" href="#/vendedor/${p.seller.id}">${av(p.seller)}<div><b>${esc(p.seller.name)}</b><small>${esc(p.seller.career)||'Estudiante UC'}</small></div><span>Ver perfil ›</span></a>${revHTML}</div>
  <div class="bar">${mine?'<a class="btn" href="#/vender">Editar en mis productos</a>':`<button class="ghost" data-act="msg" data-id="${p.seller.id}">${I('chat')} Mensaje</button><button class="btn" data-act="add" data-id="${p.id}" ${p.stock<1?'disabled':''}>Agregar al carrito</button>`}</div>`);
}
async function vendedores(){
  const [r1,r2]=await Promise.all([sb.from('profiles').select('*').in('role',['vendedor','admin']),sb.from('products').select('seller_id,category')]);const us=ok(r1),ps=ok(r2);
  const rows=us.map(u=>({u,c:[...new Set(ps.filter(p=>p.seller_id===u.id).map(p=>p.category))]})).filter(x=>x.c.length);
  V(`<h2 class="pt">Vendedores</h2>${rows.map(({u,c})=>`<div class="seller2"><a class="sl" href="#/vendedor/${u.id}">${av(u)}<div><b>${esc(u.name)}</b><small>Vende: ${esc(c.join(' · '))}</small></div></a>${u.whatsapp?`<a class="wa" target="_blank" rel="noopener" href="https://wa.me/${wa(u.whatsapp)}">WhatsApp</a>`:''}</div>`).join('')||'<p class="empty">Aún no hay vendedores con productos</p>'}`);
}
async function profile(id){
  const isMe=me?.id===id;
  const [r1,r2]=await Promise.all([sb.from('profiles').select('*').eq('id',id).single(),sb.from('products').select('*').eq('seller_id',id).order('created_at',{ascending:false})]);const u=r1.data,ps=ok(r2);
  if(!u)return V('<p class="empty">Perfil no encontrado</p>');
  const seller=u.role!=='comprador';
  const btns=isMe?`<div class="row"><button class="btn" data-act="toggleEdit">Editar perfil</button>${u.role==='comprador'?'<button class="ghost" data-act="beSeller">Quiero vender</button>':'<a class="ghost" href="#/vender">Mis productos</a>'}<a class="ghost" href="#/pedidos">Pedidos</a>${u.role==='admin'?'<a class="ghost" href="#/admin">Panel admin</a>':''}<button class="ghost danger" data-act="logout">Salir</button></div>`
    :`<div class="row"><button class="btn" data-act="msg" data-id="${id}">${I('chat')} Enviar mensaje</button>${seller&&u.whatsapp?`<a class="ghost wab" target="_blank" rel="noopener" href="https://wa.me/${wa(u.whatsapp)}">WhatsApp</a>`:''}</div>`;
  const edit=isMe?`<form id="ef" data-form="profile" hidden><label>Foto de portada</label><input name="cover" type="file" accept="image/*"><label>Foto de perfil</label><input name="avatar" type="file" accept="image/*"><label>Nombre</label><input name="name" value="${esc(u.name)}" required><label>Carrera</label><input name="career" value="${esc(u.career)}">${seller?`<label>WhatsApp (lo verán los compradores)</label><input name="whatsapp" type="tel" value="${esc(u.whatsapp)}" placeholder="999999999">`:''}<label>Descripción</label><textarea name="bio" rows="4" placeholder="Cuéntales quién eres y qué vendes…">${esc(u.bio)}</textarea><div class="row"><button type="button" class="ghost" data-act="toggleEdit">Cancelar</button><button class="btn">Guardar</button></div></form>`:'';
  V(`<section class="pcard2"><div class="cover" ${u.cover_url?`style="background-image:url('${esc(u.cover_url)}')"`:''}></div>${av(u,'xl')}<h1>${esc(u.name)}</h1><span class="tag">${u.role}</span><p class="mu">${esc(u.career)}</p><p class="bio">${esc(u.bio)||'<span class="mu">Sin descripción todavía</span>'}</p>${btns}${edit}</section>
  ${u.role==='comprador'?'':`<div class="sh"><h2>${isMe?'Mis productos publicados':'Productos de '+esc(u.name.split(' ')[0])}</h2></div><div class="grid">${ps.map(p=>pcard(p)).join('')||'<p class="empty">Aún no hay productos</p>'}</div>`}`);
}
const authView=()=>V(`<div class="authw"><div class="brand">UC <span>Emprende</span></div><p class="tagl">La tienda de los estudiantes universitarios</p><section class="auth"><h1>${AM==='login'?'Ingresa a tu cuenta':'Crea tu cuenta'}</h1>
  <div class="seg"><button data-act="am" data-id="register" class="${AM==='register'?'on':''}">Registrarme</button><button data-act="am" data-id="login" class="${AM==='login'?'on':''}">Ya tengo cuenta</button></div>
  <form data-form="${AM}">${AM==='register'?'<label>Nombre completo</label><input name="name" required><label>Carrera</label><input name="career" placeholder="Ej. Ingeniería">':''}
  <label>Correo</label><input name="email" type="email" required><label>Contraseña</label><input name="password" type="password" minlength="6" required>
  ${AM==='register'?'<label>Quiero</label><select name="role"><option value="comprador">Comprar</option><option value="vendedor">Vender y comprar</option></select>':''}
  <button class="btn">${AM==='login'?'Ingresar':'Crear cuenta'}</button></form></section></div>`);
const perfil=()=>profile(me.id);
const vender=async()=>{
  if(!need())return;
  if(prof.role==='comprador')return V('<p class="empty">Activa tu cuenta de vendedor desde tu perfil.<br><a class="btn" href="#/perfil">Ir a mi perfil</a></p>');
  MY=(await sb.from('products').select('*').eq('seller_id',me.id).order('created_at',{ascending:false})).data||[];
  V(`<div class="sh"><h2>Mis productos</h2><button class="btn sm" data-act="newProd">${I('plus')} Publicar</button></div><div class="grid">${MY.map(p=>pcard(p,`<div class="row"><button class="ghost sm" data-act="editProd" data-id="${p.id}">Editar</button><button class="ghost sm danger" data-act="delProd" data-id="${p.id}">Borrar</button></div>`)).join('')||'<p class="empty">Aún no publicas nada. ¡Toca “Publicar”!</p>'}</div>`);
};
function openProd(id){
  const p=MY.find(x=>x.id===id)||{name:'',price:'',stock:1,category:'Otros',description:''};
  $('#dlg').innerHTML=`<h2>${id?'Editar':'Nuevo'} producto</h2><form data-form="product"><input type="hidden" name="id" value="${id||''}">
  <label>Foto</label><input name="photo" type="file" accept="image/*"><label>Nombre</label><input name="name" value="${esc(p.name)}" required>
  <div class="two"><div><label>Precio (S/)</label><input name="price" type="number" step="0.01" min="0" value="${p.price}" required></div><div><label>Stock</label><input name="stock" type="number" min="0" value="${p.stock}" required></div></div>
  <label>Categoría</label><select name="category">${CAT.map(c=>`<option ${c.name===p.category?'selected':''}>${esc(c.name)}</option>`).join('')}</select>
  <label>Descripción</label><textarea name="description" rows="3">${esc(p.description)}</textarea>
  <div class="row"><button type="button" class="ghost" data-act="closeDlg">Cancelar</button><button class="btn">Guardar</button></div></form>`;
  $('#dlg').showModal();
}
let PT={};
async function carrito(){
  const c=cart.get();
  if(!c.length)return V('<h2 class="pt">Mi carrito</h2><p class="empty">Tu carrito está vacío<br><a class="btn" href="#/categoria/Todos">Ver productos</a></p>');
  const ps=ok(await sb.from('products').select('*, seller:profiles(id,name,avatar_url)').in('id',c.map(x=>x.id)));
  const rows=c.map(x=>({...x,p:ps.find(p=>p.id===x.id)})).filter(x=>x.p);
  const groups={};rows.forEach(x=>(groups[x.p.seller_id]??={s:x.p.seller,items:[]}).items.push(x));
  V(`<h2 class="pt">Mi carrito</h2><p class="cnt">Tus productos se agrupan por vendedor. Cada grupo se coordina en su propio chat.</p>${Object.entries(groups).map(([sid,g])=>{
    const sub=g.items.reduce((a,x)=>a+x.p.price*x.qty,0),own=me?.id===sid;
    return `<div class="grp"><div class="hd">${av(g.s,'sm')}<b>${esc(g.s.name)}</b><a class="tag" href="#/vendedor/${sid}">Ver perfil</a></div>
    ${g.items.map(x=>`<div class="line"><div class="th">${img(x.p)}</div><div class="li"><b>${esc(x.p.name)}</b><small>${money(x.p.price)}</small><div class="qty"><button data-act="cq" data-id="${x.id}" data-d="-1">−</button><b>${x.qty}</b><button data-act="cq" data-id="${x.id}" data-d="1">+</button></div></div><button class="x" data-act="crm" data-id="${x.id}">✕</button></div>`).join('')}
    <div class="sub"><span>Subtotal</span><span>${money(sub)}</span></div>
    ${own?'<p class="note">Este es tu propio producto.</p>':`<input data-pt="${sid}" placeholder="📍 Punto de entrega (ej. biblioteca, puerta 2)" value="${esc(PT[sid]||'')}"><button class="btn" data-act="checkout" data-id="${sid}">${I('chat')} Pedir y chatear con ${esc(g.s.name.split(' ')[0])}</button>`}</div>`}).join('')}
  <p class="note">El pago y la entrega se coordinan en el chat con cada vendedor.</p>`);
}
async function pedidos(){
  if(!need())return;
  const data=ok(await sb.from('orders').select('*, buyer:profiles!buyer_id(id,name), seller:profiles!seller_id(id,name)').order('created_at',{ascending:false}));
  V(`<h2 class="pt">Pedidos</h2>${data.map(o=>{const buy=o.buyer_id===me.id,ot=buy?o.seller:o.buyer;
    return`<div class="line"><div class="li"><b>${esc(o.product_name)} ×${o.qty}</b><small>${buy?'Compra a':'Venta a'} <a href="#/vendedor/${ot.id}">${esc(ot.name)}</a> · ${new Date(o.created_at).toLocaleDateString('es-PE')}</small><div><span class="st ${o.status}">${o.status}</span> <b>${money(o.total)}</b></div></div>
    <div class="acts"><a class="ghost sm" href="#/chat/${ot.id}">${I('chat')}</a>${o.status==='pendiente'?(buy?'':`<button class="ghost sm" data-act="ost" data-id="${o.id}" data-s="entregado">Entregar</button>`)+`<button class="ghost sm danger" data-act="ost" data-id="${o.id}" data-s="cancelado">Cancelar</button>`:''}</div></div>`}).join('')||'<p class="empty">Aún no hay pedidos</p>'}`);
}
async function mensajes(){
  if(!need())return;
  const data=ok(await sb.from('messages').select('*').or(`sender_id.eq.${me.id},receiver_id.eq.${me.id}`).order('created_at',{ascending:false}).limit(300));
  const last={};data.forEach(m=>{const o=m.sender_id===me.id?m.receiver_id:m.sender_id;(last[o]??=({m,n:0})).n+=(m.receiver_id===me.id&&!m.read?1:0)});
  const ids=Object.keys(last),us=ids.length?(await sb.from('profiles').select('id,name,avatar_url').in('id',ids)).data||[]:[];
  V(`<h2 class="pt">Mensajes</h2>${ids.map(id=>{const u=us.find(x=>x.id===id),{m,n}=last[id];return`<a class="conv" href="#/chat/${id}">${av(u)}<div><b>${esc(u?.name)}</b><small>${m.sender_id===me.id?'Tú: ':''}${esc(m.body)}</small></div>${n?`<i class="dot"></i>`:`<small>${hhmm(m.created_at)}</small>`}</a>`}).join('')||'<p class="empty">Aún no hablas con nadie.<br>Entra al perfil de un vendedor y toca “Enviar mensaje”.</p>'}`);
}
async function chat(id){
  if(!need())return;
  const [ru,rm]=await Promise.all([sb.from('profiles').select('id,name,avatar_url').eq('id',id).single(),
    sb.from('messages').select('*').or(`and(sender_id.eq.${me.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${me.id})`).order('created_at')]);const u=ru.data,ms=ok(rm);
  V(`<div class="chh"><button class="circle" data-act="back">${I('back')}</button>${av(u,'sm')}<a href="#/vendedor/${id}"><b>${esc(u?.name)}</b></a></div>
  <div class="thread" id="thread"></div><div class="qk">${['📍 ¿Dónde nos vemos?','🕒 ¿A qué hora te queda bien?','✅ Listo, gracias'].map(t=>`<button data-act="qk" data-id="${t}">${t}</button>`).join('')}</div><form class="chf" data-form="chat" data-to="${id}"><input name="body" placeholder="Escribe un mensaje…" autocomplete="off"><button aria-label="Enviar">${I('send')}</button></form>`);
  ms.forEach(addBubble);
  await sb.from('messages').update({read:true}).eq('sender_id',id).eq('receiver_id',me.id).eq('read',false);
  const r=await sb.from('messages').select('id',{count:'exact',head:true}).eq('receiver_id',me.id).eq('read',false);unread=r.count||0;badges();
}
async function admin(){
  if(prof?.role!=='admin')return V('<p class="empty">Solo administradores</p>');
  const [r1,r2,r3]=await Promise.all([sb.from('profiles').select('*').order('created_at'),sb.from('products').select('*, seller:profiles(name)').order('created_at',{ascending:false}),sb.from('banners').select('*').order('created_at')]);const us=ok(r1),ps=ok(r2),bans=ok(r3);
  V(`<h2 class="pt">Panel de administración</h2>
  <h3>Banner de inicio (${bans.length})</h3>
  <form class="boxf" data-form="newban"><label>Imagen o video (máx. 25 MB)</label><input name="media" type="file" accept="image/*,video/*" required><div class="two"><div><label>Título</label><input name="title" maxlength="60"></div><div><label>Subtítulo</label><input name="subtitle" maxlength="90"></div></div><label>Enlace (opcional)</label><input name="link" placeholder="#/categoria/Comida  o  https://…"><button class="btn full">Agregar al banner</button></form>
  <div class="grid">${bans.map(b=>`<div class="card"><div class="ph">${b.media_type==='video'?`<video src="${esc(b.media_url)}" muted playsinline preload="metadata"></video>`:`<img src="${esc(b.media_url)}" alt="">`}</div><div class="cb"><b>${esc(b.title)||'(sin título)'}</b><small>${b.media_type==='video'?'🎬 Video':'🖼️ Imagen'}</small><label class="chk2"><input type="checkbox" data-banact="${b.id}" ${b.active?'checked':''}> Activo</label></div><div class="row"><button class="ghost sm danger" data-act="delBan" data-id="${b.id}">Borrar</button></div></div>`).join('')}</div>
  <h3>Categorías (${CAT.length})</h3>
  <form class="boxf" data-form="newcat"><div class="two"><div><label>Nombre</label><input name="name" required></div><div><label>Emoji</label><input name="emoji" placeholder="🍕" maxlength="4"></div></div><label>Foto (opcional)</label><input name="photo" type="file" accept="image/*"><button class="btn full">Agregar categoría</button></form>
  <div class="grid">${CAT.filter(c=>c.id).map(c=>`<div class="card"><div class="ph">${catIc(c.name)}</div><div class="cb"><b>${esc(c.name)}</b></div><div class="row"><label class="ghost sm fl">Cambiar foto<input type="file" accept="image/*" data-catimg="${c.id}" hidden></label><button class="ghost sm danger" data-act="delCat" data-id="${c.id}">Borrar</button></div></div>`).join('')}</div>
  <h3>Usuarios (${us.length})</h3>${tbl(['Nombre','Carrera','Rol'],us.map(u=>`<tr><td><a href="#/vendedor/${u.id}">${esc(u.name)}</a></td><td>${esc(u.career)}</td><td><select data-role="${u.id}" ${u.id===me.id?'disabled':''}>${['admin','vendedor','comprador'].map(r=>`<option ${r===u.role?'selected':''}>${r}</option>`).join('')}</select></td></tr>`).join(''))}
  <h3>Productos (${ps.length})</h3>${tbl(['Producto','Vendedor','⭐ Destacado',''],ps.map(p=>`<tr><td><a href="#/producto/${p.id}">${esc(p.name)}</a></td><td>${esc(p.seller?.name)}</td><td><input type="checkbox" data-feat="${p.id}" ${p.featured?'checked':''}></td><td><button class="ghost sm danger" data-act="delProd" data-id="${p.id}">Borrar</button></td></tr>`).join(''))}`);
}

/* ---------- rutas ---------- */
const PAGES={'':home,categorias,categoria,vendedores,vendedor:profile,producto,carrito,perfil,mensajes,chat,vender,pedidos,admin};
const NAVMAP={'':'',categorias:'categorias',categoria:'categorias',vendedores:'vendedores',vendedor:'vendedores',carrito:'carrito',perfil:'perfil',vender:'perfil',pedidos:'perfil',admin:'perfil'};
async function route(){
  const [,page='',arg='']=location.hash.slice(1).split('/');
  clearInterval(BT);
  if(!me){document.body.dataset.page='auth';window.scrollTo(0,0);return authView()}
  document.body.dataset.page=page;
  $$('.nav a').forEach(a=>a.classList.toggle('on',a.dataset.n===(NAVMAP[page]??'x')));
  window.scrollTo(0,0);V('<div class="load">Cargando…</div>');
  try{await loadCats();await (PAGES[page]||home)(decodeURIComponent(arg))}catch(e){V(`<p class="empty">No se pudo cargar: <b>${esc(e.message)}</b><br><small>Si dice “relation … does not exist” o “permission denied”, falta ejecutar supabase.sql (ver README).</small></p>`)}
}

/* ---------- fotos ---------- */
const shrink=(f,max=900,sq=false)=>new Promise(res=>{const i=new Image();i.onload=()=>{let sx=0,sy=0,sw=i.width,sh=i.height;if(sq){const m=Math.min(sw,sh);sx=(sw-m)/2;sy=(sh-m)/2;sw=sh=m}const r=Math.min(1,max/Math.max(sw,sh)),c=document.createElement('canvas');c.width=sw*r;c.height=sh*r;c.getContext('2d').drawImage(i,sx,sy,sw,sh,0,0,c.width,c.height);c.toBlob(res,'image/jpeg',.82)};i.src=URL.createObjectURL(f)});
async function upload(file,max=900,sq=false){
  toast('Subiendo foto…');const path=`${me.id}/${Date.now()}.jpg`;
  const {error}=await sb.storage.from('media').upload(path,await shrink(file,max,sq),{contentType:'image/jpeg'});if(error)throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

async function uploadVideo(file){
  if(file.size>25*1024*1024)throw new Error('El video pesa más de 25 MB. Usa uno más corto o comprímelo.');
  toast('Subiendo video…');
  const ext=(file.name.split('.').pop()||'mp4').toLowerCase().replace(/[^a-z0-9]/g,'')||'mp4',path=`${me.id}/${Date.now()}.${ext}`;
  const {error}=await sb.storage.from('media').upload(path,file,{contentType:file.type||'video/mp4'});if(error)throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

/* ---------- acciones y formularios ---------- */
const ACT={
  back:()=>history.length>1?history.back():(location.hash='#/'),
  am:id=>{AM=id;route()},closeDlg:()=>$('#dlg').close(),
  logout:async()=>{await sb.auth.signOut();toast('Sesión cerrada')},
  toggleEdit:()=>{const f=$('#ef');f.hidden=!f.hidden;if(!f.hidden)f.scrollIntoView({behavior:'smooth'})},
  beSeller:async()=>{const {error}=await sb.from('profiles').update({role:'vendedor'}).eq('id',me.id);if(error)return toast(error.message);await setUser(me);toast('¡Ya puedes vender!');route()},
  msg:id=>{if(!need())return;if(id===me.id)return toast('Ese eres tú 😅');location.hash='#/chat/'+id},
  dq:(_,t)=>{const el=$('#dq'),max=+$('[data-act=dq][data-max]').dataset.max;el.textContent=Math.min(max,Math.max(1,+el.textContent+ +t.dataset.d))},
  add:id=>{const c=cart.get(),q=+($('#dq')?.textContent||1),x=c.find(i=>i.id===id);x?x.qty+=q:c.push({id,qty:q});cart.set(c);toast('Agregado al carrito 🛒')},
  cq:(id,t)=>{const c=cart.get(),x=c.find(i=>i.id===id);x.qty=Math.max(1,x.qty+ +t.dataset.d);cart.set(c);route()},
  crm:id=>{cart.set(cart.get().filter(i=>i.id!==id));route()},
  checkout:async sid=>{
    if(!need())return;
    const items=cart.get(),ps=ok(await sb.from('products').select('*, seller:profiles(id,name)').in('id',items.map(x=>x.id)));
    const g=items.map(x=>({q:x.qty,p:ps.find(p=>p.id===x.id)})).filter(x=>x.p&&x.p.seller_id===sid&&sid!==me.id);
    if(!g.length)return toast('No hay productos para pedir');
    const {error}=await sb.from('orders').insert(g.map(({q,p})=>({product_id:p.id,buyer_id:me.id,seller_id:sid,product_name:p.name,qty:q,total:p.price*q})));
    if(error)return toast(error.message);
    const total=g.reduce((a,{q,p})=>a+q*p.price,0),pt=(PT[sid]||'').trim();
    const body=`Hola ${g[0].p.seller.name.split(' ')[0]} 👋 Quiero hacer este pedido en UC Emprende:\n\n${g.map(({q,p})=>`• ${q} × ${p.name} — ${money(p.price*q)}`).join('\n')}\n\nTotal: ${money(total)}${pt?`\n📍 Punto de entrega: ${pt}`:''}\n\n¿Coordinamos la entrega?`;
    const r=await sb.from('messages').insert({sender_id:me.id,receiver_id:sid,body});
    if(r.error)toast('Pedido enviado, pero no se pudo enviar el mensaje');
    cart.set(items.filter(x=>!g.some(y=>y.p.id===x.id)));delete PT[sid];
    toast('¡Pedido enviado! Coordina con el vendedor');location.hash='#/chat/'+sid},
  ost:async(id,t)=>{const {error}=await sb.from('orders').update({status:t.dataset.s}).eq('id',id);if(error)toast(error.message);route()},
  delBan:async id=>{if(!confirm('¿Quitar este banner?'))return;const {error}=await sb.from('banners').delete().eq('id',id);if(error)toast(error.message);route()},
  delCat:async id=>{if(!confirm('¿Borrar esta categoría? Los productos no se eliminan.'))return;const {error}=await sb.from('categories').delete().eq('id',id);if(error)toast(error.message);route()},
  qk:t=>{const i=$('.chf input');i.value=t;i.focus()},
  delRev:async id=>{if(!confirm('¿Borrar tu opinión?'))return;const {error}=await sb.from('reviews').delete().eq('id',id);if(error)toast(error.message);route()},
  newProd:()=>openProd(),editProd:id=>openProd(id),
  delProd:async id=>{if(!confirm('¿Borrar este producto?'))return;const {error}=await sb.from('products').delete().eq('id',id);if(error)toast(error.message);route()}
};
const FORMS={
  search:fd=>{SQ=fd.get('q');location.hash='#/categoria/Todos'},
  review:async(fd,f)=>{const {error}=await sb.from('reviews').insert({product_id:f.dataset.pid,user_id:me.id,rating:+fd.get('rating'),body:fd.get('body').trim()});if(error)throw error;toast('¡Gracias por tu opinión!');route()},
  login:async fd=>{const {error}=await sb.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});if(error)throw error;toast('¡Bienvenido!')},
  register:async fd=>{const {data,error}=await sb.auth.signUp({email:fd.get('email'),password:fd.get('password'),options:{data:{name:fd.get('name'),career:fd.get('career'),role:fd.get('role')}}});
    if(error)throw error;toast(data.session?'¡Cuenta creada!':'Revisa tu correo para confirmar tu cuenta')},
  profile:async fd=>{const row={name:fd.get('name'),career:fd.get('career'),bio:fd.get('bio')},a=fd.get('avatar'),cv=fd.get('cover');
    if(fd.has('whatsapp'))row.whatsapp=(fd.get('whatsapp')||'').replace(/\D/g,'');
    if(a&&a.size)row.avatar_url=await upload(a);
    if(cv&&cv.size)row.cover_url=await upload(cv,1400);
    const {error}=await sb.from('profiles').update(row).eq('id',me.id);if(error)throw error;await setUser(me);toast('Perfil actualizado');route()},
  newban:async fd=>{const f=fd.get('media'),lk=fd.get('link').trim();
    if(!f||!f.size)throw new Error('Elige una imagen o un video');
    if(lk&&!safeLink(lk))throw new Error('El enlace debe empezar con #/ o https://');
    const vid=f.type.startsWith('video/'),url=vid?await uploadVideo(f):await upload(f,1600);
    const {error}=await sb.from('banners').insert({media_url:url,media_type:vid?'video':'image',title:fd.get('title').trim(),subtitle:fd.get('subtitle').trim(),link:lk,active:true});
    if(error)throw error;toast('Banner agregado');route()},
  newcat:async fd=>{const f=fd.get('photo'),row={name:fd.get('name').trim(),emoji:fd.get('emoji').trim()||'🛍️',sort:CAT.length+1};
    if(f&&f.size)row.image_url=await upload(f,600,true);
    const {error}=await sb.from('categories').insert(row);if(error)throw error;toast('Categoría agregada');route()},
  product:async fd=>{const id=fd.get('id'),row={name:fd.get('name'),price:+fd.get('price'),stock:+fd.get('stock'),category:fd.get('category'),description:fd.get('description')},f=fd.get('photo');
    if(f&&f.size)row.image_url=await upload(f);
    const r=id?await sb.from('products').update(row).eq('id',id):await sb.from('products').insert({...row,seller_id:me.id});
    if(r.error)throw r.error;$('#dlg').close();toast('Producto guardado ✅');route()},
  chat:async(fd,f)=>{const body=fd.get('body').trim();if(!body)return;
    const {data,error}=await sb.from('messages').insert({sender_id:me.id,receiver_id:f.dataset.to,body}).select().single();if(error)throw error;f.reset();addBubble(data)}
};
document.addEventListener('click',async e=>{const t=e.target.closest('[data-act]');if(!t)return;
  try{await ACT[t.dataset.act]?.(t.dataset.id,t)}catch(err){toast(err.message)}});
document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,fn=FORMS[f.dataset.form];if(!fn)return;
  const b=f.querySelector('button:not([type=button])');b&&(b.disabled=true);
  try{await fn(new FormData(f),f)}catch(err){toast(err.message||'Error')}finally{b&&(b.disabled=false)}});
document.addEventListener('input',e=>{if(e.target.dataset.pt!==undefined){PT[e.target.dataset.pt]=e.target.value;return}const k=e.target.dataset.f;if(!k)return;
  if(k==='q')SQ=e.target.value;else F[k]=e.target.type==='checkbox'?e.target.checked:e.target.value;$('#list').innerHTML=listHTML()});
document.addEventListener('change',async e=>{const t=e.target;
  if(t.dataset.role){const {error}=await sb.from('profiles').update({role:t.value}).eq('id',t.dataset.role);toast(error?error.message:'Rol actualizado')}
  if(t.dataset.feat){const {error}=await sb.from('products').update({featured:t.checked}).eq('id',t.dataset.feat);toast(error?error.message:'Listo')}
  if(t.dataset.banact){const {error}=await sb.from('banners').update({active:t.checked}).eq('id',t.dataset.banact);toast(error?error.message:'Listo')}
  if(t.dataset.catimg&&t.files[0]){try{const url=await upload(t.files[0],600,true);const {error}=await sb.from('categories').update({image_url:url}).eq('id',t.dataset.catimg);toast(error?error.message:'Foto actualizada');route()}catch(err){toast(err.message)}}});

/* ---------- inicio ---------- */
(async function init(){
  shell();
  if(SUPABASE_URL.startsWith('PEGA')){return V('<div class="auth"><h1>Falta configurar</h1><p class="mu">Abre <b>js/config.js</b> y pega la URL y la clave de tu proyecto Supabase (ver README).</p></div>')}
  sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const {data:{session}}=await sb.auth.getSession();await setUser(session?.user);
  sb.auth.onAuthStateChange((_e,s)=>{if((s?.user?.id||null)!==(me?.id||null))setUser(s?.user).then(()=>{location.hash='#/';route()})});
  addEventListener('hashchange',route);route();
})();
