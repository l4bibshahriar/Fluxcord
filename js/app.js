/* Fluxcord — Supabase-powered frontend */
const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
let supabaseClient = null;
let dbProducts = [];
let configLoaded = false;

const FALLBACK_PRODUCTS = [
  {id:'demo-1',title:'Discord Bot Development Master Prompt',category:'AI Master Prompts',price:.99,currency:'USD',image_url:'https://i.imgur.com/1t8xktU.png',description:'AI-powered master prompt for building Discord bots.',featured:true,is_active:true},
  {id:'demo-2',title:'Telegram Bot Development Master Prompt',category:'AI Master Prompts',price:.99,currency:'USD',image_url:'https://i.imgur.com/C9C07Wo.png',description:'A practical master prompt for Telegram bot development.',featured:true,is_active:true},
  {id:'demo-3',title:'Ultimate E-Book Creator Guide',category:'E-Books',price:4.99,currency:'USD',image_url:'https://i.imgur.com/x92sVrE.png',description:'A digital guide for creating better e-books.',featured:true,is_active:true},
  {id:'demo-4',title:'Discord Moderation Bot',category:'Discord Bots',price:7.99,currency:'USD',image_url:'https://i.imgur.com/4p4bYNV.png',description:'Ready-to-use Discord moderation resource.',featured:false,is_active:true},
  {id:'demo-5',title:'Telegram Auto Reply Bot',category:'Telegram Bots',price:5.99,currency:'USD',image_url:'https://i.imgur.com/C9C07Wo.png',description:'Automation resource for Telegram communities.',featured:false,is_active:true},
  {id:'demo-6',title:'Creator Portfolio Website',category:'Pre-Made Websites',price:12.99,currency:'USD',image_url:'https://i.imgur.com/ibq6soB.png',description:'A polished starter portfolio website.',featured:false,is_active:true},
  {id:'demo-7',title:'AI Freelancing Starter Pack',category:'Others',price:3.99,currency:'USD',image_url:'https://i.imgur.com/GNBtqxq.png',description:'Starter resources for digital freelancing.',featured:false,is_active:true},
  {id:'demo-8',title:'Game Server Setup Toolkit',category:'Games',price:8.99,currency:'USD',image_url:'https://i.imgur.com/bzSzLYN.jpeg',description:'Tools and guides for game server setup.',featured:false,is_active:true}
];

function $(s){return document.querySelector(s)}
function $all(s){return [...document.querySelectorAll(s)]}
function toast(message, type='info'){
  let box=$('#fluxToast');
  if(!box){box=document.createElement('div');box.id='fluxToast';box.style.cssText='position:fixed;right:20px;bottom:20px;z-index:9999;max-width:380px;padding:14px 16px;border:1px solid #ffffff18;border-radius:12px;background:#11141c;color:#f4f4f6;box-shadow:0 18px 50px #0008;font:600 14px/1.4 DM Sans,Arial,sans-serif';document.body.appendChild(box)}
  box.textContent=message;box.style.borderColor=type==='error'?'#ef4444':type==='success'?'#22c55e':'#ffffff18';clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>box.remove(),4200)
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function getCart(){try{return JSON.parse(localStorage.getItem('fluxcord_cart')||'{}')}catch{return{}}}
function saveCart(c){localStorage.setItem('fluxcord_cart',JSON.stringify(c));updateCartCount()}
function updateCartCount(){let n=Object.values(getCart()).reduce((a,b)=>a+Number(b||0),0);$all('#cartCount').forEach(e=>e.textContent=n)}
function normalizeProduct(p){return {id:p.id,title:p.title||p.name||'Untitled',name:p.title||p.name||'Untitled',category:p.category||p.cat||'Others',cat:p.category||p.cat||'Others',price:Number(p.price||0),currency:p.currency||'USD',image_url:p.image_url||'',description:p.description||'',download_url:p.download_url||'',is_active:p.is_active!==false,featured:!!p.featured,rating:Number(p.rating||5),badge:p.badge||'NEW',tag:p.tag||((p.category||p.cat||'DIGITAL').toUpperCase())}}
async function loadSupabase(){
  if(configLoaded)return supabaseClient;
  configLoaded=true;
  try{
    const r=await fetch('/api/config',{cache:'no-store'});
    if(!r.ok)throw new Error('Config endpoint unavailable');
    const cfg=await r.json();
    if(!cfg.url||!cfg.key)throw new Error('Supabase environment variables are missing in Vercel.');
    if(!window.supabase || typeof window.supabase.createClient !== 'function') await new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=SUPABASE_CDN;
      s.async=false;
      s.onload=()=> (window.supabase && typeof window.supabase.createClient==='function') ? resolve() : reject(new Error('Supabase client loaded but createClient is unavailable'));
      s.onerror=()=>reject(new Error('Could not load Supabase client'));
      document.head.appendChild(s);
    });
    if(!window.supabase || typeof window.supabase.createClient !== 'function') throw new Error('Supabase client is unavailable.');
    supabaseClient=window.supabase.createClient(cfg.url,cfg.key);
    return supabaseClient;
  }catch(e){console.error(e);toast(e.message||'Supabase could not be initialized.','error');return null}
}
async function initProducts(){
  const sb=await loadSupabase();
  if(!sb){dbProducts=FALLBACK_PRODUCTS.map(normalizeProduct);return dbProducts}
  const {data,error}=await sb.from('products').select('*').eq('is_active',true).order('created_at',{ascending:false});
  if(error){console.error(error);dbProducts=FALLBACK_PRODUCTS.map(normalizeProduct);return dbProducts}
  dbProducts=(data||[]).map(normalizeProduct);
  return dbProducts;
}
async function currentUser(){const sb=await loadSupabase();if(!sb)return null;const {data}=await sb.auth.getUser();return data?.user||null}
async function currentProfile(){const sb=await loadSupabase();const u=await currentUser();if(!sb||!u)return null;const {data,error}=await sb.from('profiles').select('*').eq('id',u.id).single();if(error)return null;return data}
function productCard(p){p=normalizeProduct(p);const img=p.image_url?`<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy">`:`<div class="mock">${escapeHtml(p.tag)}</div>`;return `<article class="product"><div class="product-img"><span class="badge">${escapeHtml(p.badge)}</span>${img}</div><div class="product-body"><span class="category-label">${escapeHtml(p.cat)}</span><h3>${escapeHtml(p.name)}</h3><div class="stars">★★★★★ <small>${p.rating.toFixed(1)}</small></div><div class="product-foot"><span class="price">$${p.price.toFixed(2)}</span><button class="add" onclick="addToCart('${escapeHtml(p.id)}')">Add to Cart</button></div></div></article>`}
async function renderHome(){
  if(!$('#featured')&&!$('#newArrivals'))return;
  const list=await initProducts();
  if($('#featured'))$('#featured').innerHTML=list.filter(p=>p.featured).slice(0,6).map(productCard).join('')||list.slice(0,6).map(productCard).join('');
  if($('#newArrivals'))$('#newArrivals').innerHTML=list.slice(0,8).map(productCard).join('');
}
async function addToCart(id){
  const list=dbProducts.length?dbProducts:await initProducts();
  const p=list.find(x=>String(x.id)===String(id));
  if(!p){toast('This product is not available.','error');return}
  let c=getCart();c[id]=(c[id]||0)+1;saveCart(c);toast('Added to cart.','success')
}
function getCartProducts(){return Object.entries(getCart()).map(([id,q])=>{const p=dbProducts.find(x=>String(x.id)===String(id))||FALLBACK_PRODUCTS.map(normalizeProduct).find(x=>String(x.id)===String(id));return p?{...p,q:Number(q)}:null}).filter(Boolean)}
async function hydrateCartProducts(){if(!dbProducts.length)await initProducts();return getCartProducts()}
async function renderCart(){const area=$('#cartArea');if(!area)return;const items=await hydrateCartProducts();if(!items.length){area.innerHTML='<div class="panel" style="text-align:center;padding:70px"><div style="font-size:50px">🛍️</div><h2>Your cart is empty</h2><p>Start shopping for premium digital resources.</p><a class="btn" href="shop.html">Start Shopping</a></div>';return}let total=items.reduce((s,p)=>s+p.price*p.q,0);area.innerHTML=`<div class="cart-layout"><section class="panel"><div class="cart-row" style="font-weight:700;color:#9090a8"><span>Product</span><span></span><span>Qty</span><span>Subtotal</span><span></span></div>${items.map(p=>`<div class="cart-row"><div class="thumb">◈</div><div><b>${escapeHtml(p.name)}</b><small style="display:block;color:#9090a8">${escapeHtml(p.cat)}</small></div><div class="qty"><button onclick="changeQty('${escapeHtml(p.id)}',-1)">−</button><input value="${p.q}" onchange="setQty('${escapeHtml(p.id)}',this.value)"><button onclick="changeQty('${escapeHtml(p.id)}',1)">+</button></div><strong>$${(p.price*p.q).toFixed(2)}</strong><button class="remove" onclick="removeItem('${escapeHtml(p.id)}')">×</button></div>`).join('')}<a class="btn outline" href="shop.html">← Continue Shopping</a></section><aside class="panel summary"><h2>Order Summary</h2><div><span>Subtotal</span><strong>$${total.toFixed(2)}</strong></div><hr style="border-color:#ffffff12"><div><strong>Total</strong><strong class="price">$${total.toFixed(2)}</strong></div><a class="btn full" href="checkout.html">Proceed to Checkout</a></aside></div>`}
function changeQty(id,n){let c=getCart();c[id]=Math.max(1,Math.min(99,(c[id]||1)+n));saveCart(c);renderCart()}
function setQty(id,n){let c=getCart();c[id]=Math.max(1,Math.min(99,Number(n)||1));saveCart(c);renderCart()}
function removeItem(id){let c=getCart();delete c[id];saveCart(c);renderCart()}
async function renderCheckout(){const area=$('#checkoutSummary');if(!area)return;const items=await hydrateCartProducts();if(!items.length){area.innerHTML='<p>Your cart is empty.</p><a class="btn" href="shop.html">Shop Now</a>';return}const total=items.reduce((s,p)=>s+p.price*p.q,0);area.innerHTML=items.map(p=>`<div><span>${escapeHtml(p.name)} × ${p.q}</span><strong>$${(p.price*p.q).toFixed(2)}</strong></div>`).join('')+`<hr style="border-color:#ffffff12"><div><b>Total</b><b class="price">$${total.toFixed(2)}</b></div>`}
async function placeOrder(){
  const sb=await loadSupabase();if(!sb){toast('Supabase is not connected.','error');return}
  const user=await currentUser();if(!user){location.href='login.html?next=checkout.html';return}
  const items=await hydrateCartProducts();if(!items.length){toast('Your cart is empty.','error');return}
  const method=$('#payment')?.value||'Manual Payment',reference=$('#reference')?.value.trim()||'',note=$('textarea')?.value.trim()||'';
  if(!reference){toast('Enter your transaction / payment reference.','error');return}
  const payload=items.map(p=>({product_id:p.id,quantity:p.q}));
  const {data,error}=await sb.rpc('create_order',{p_items:payload,p_payment_method:method,p_payment_reference:reference,p_customer_note:note});
  if(error){console.error(error);toast(error.message||'Could not create order.','error');return}
  localStorage.removeItem('fluxcord_cart');updateCartCount();toast('Order submitted successfully.','success');location.href='account.html?order='+encodeURIComponent(data)}
async function handleLogin(e){e.preventDefault();const sb=await loadSupabase();if(!sb)return;const email=$('#loginEmail').value.trim(),password=$('#loginPassword').value;const {error}=await sb.auth.signInWithPassword({email,password});if(error){toast(error.message,'error');return}const next=new URLSearchParams(location.search).get('next');if(next){location.href=next;return}const profile=await currentProfile();location.href=profile?.role==='admin'?'admin.html':'account.html'}
async function handleRegister(e){e.preventDefault();const sb=await loadSupabase();if(!sb)return;const first=$('#firstName').value.trim(),last=$('#lastName').value.trim(),email=$('#registerEmail').value.trim(),password=$('#registerPassword').value,confirm=$('#registerConfirm').value;if(password!==confirm){toast('Passwords do not match.','error');return}const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:`${first} ${last}`.trim(),name:`${first} ${last}`.trim()}}});if(error){toast(error.message,'error');return}if(data.session)location.href='account.html';else toast('Account created. Check your email to confirm the account, then log in.','success')}
async function logout(){const sb=await loadSupabase();if(sb)await sb.auth.signOut();location.href='index.html'}
async function requireUser(){const u=await currentUser();if(!u){location.href='login.html?next='+encodeURIComponent(location.pathname.split('/').pop());return null}return u}
async function renderAccount(){const user=await requireUser();if(!user)return;const profile=await currentProfile();if($('#accountName'))$('#accountName').textContent=profile?.full_name||user.email?.split('@')[0]||'Customer';if($('#accountEmail'))$('#accountEmail').textContent=user.email||'';if($('#accountAvatar'))$('#accountAvatar').textContent=(profile?.full_name||user.email||'U').slice(0,2).toUpperCase();
 const sb=await loadSupabase();const {data:orders}=await sb.from('orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false});const rows=orders||[];const delivered=rows.filter(o=>o.status==='delivered').length,total=rows.reduce((s,o)=>s+Number(o.total||0),0);if($('#totalOrders'))$('#totalOrders').textContent=rows.length;if($('#deliveredOrders'))$('#deliveredOrders').textContent=delivered;if($('#totalSpent'))$('#totalSpent').textContent='$'+total.toFixed(2);const box=$('#ordersList');if(box)box.innerHTML=rows.length?rows.map(o=>`<div class="order-card"><div><b>Order #${escapeHtml(o.id.slice(0,8))}</b><small>${new Date(o.created_at).toLocaleString()}</small></div><span class="status ${escapeHtml(o.status)}">${escapeHtml(o.status.replace('_',' '))}</span><strong>$${Number(o.total).toFixed(2)}</strong></div>`).join(''):'<p>No orders yet. Start shopping to see your purchases here.</p>';}
async function renderShop(){const grid=$('#shopGrid');if(!grid)return;const list=await initProducts();const q=new URLSearchParams(location.search),cat=q.get('cat')||'';if(cat&&$('#category'))$('#category').value=cat;const min=$('#priceMin'),max=$('#priceMax');function draw(){let a=Number(min?.value||0),b=Number(max?.value||100);if(a>b){if(document.activeElement===min){a=b;min.value=a}else{b=a;max.value=b}}if($('#priceMinLabel'))$('#priceMinLabel').textContent='$'+a.toFixed(2);if($('#priceMaxLabel'))$('#priceMaxLabel').textContent='$'+b.toFixed(2);let arr=list.filter(p=>(!$('#category')?.value||p.cat===$('#category').value)&&p.price>=a&&p.price<=b);const sort=$('#sort')?.value;if(sort==='low')arr.sort((x,y)=>x.price-y.price);if(sort==='high')arr.sort((x,y)=>y.price-x.price);if(sort==='rating')arr.sort((x,y)=>y.rating-x.rating);if($('#results'))$('#results').textContent=`Showing 1-${Math.min(9,arr.length)} of ${arr.length} results`;grid.innerHTML=arr.length?arr.map(productCard).join(''):'<div class="panel"><h2>No products found</h2><p>Clear your filters and try again.</p></div>'}min?.addEventListener('input',draw);max?.addEventListener('input',draw);$('#category')?.addEventListener('change',draw);$('#sort')?.addEventListener('change',draw);draw();window.clearFilters=()=>{if($('#category'))$('#category').value=cat;if(min)min.value=0;if(max)max.value=100;draw()}}
async function requireAdmin(){const u=await requireUser();if(!u)return null;const profile=await currentProfile();if(profile?.role!=='admin'){toast('Admin access required.','error');location.href='account.html';return null}return {user:u,profile}}
async function renderAdmin(){const auth=await requireAdmin();if(!auth)return;const sb=await loadSupabase();await loadAdminProducts();await loadAdminOrders();const {count:customers}=await sb.from('profiles').select('id',{count:'exact',head:true});const {data:orders}=await sb.from('orders').select('status,total');const list=orders||[];if($('#adminCustomers'))$('#adminCustomers').textContent=customers??0;if($('#adminOrders'))$('#adminOrders').textContent=list.length;if($('#adminSales'))$('#adminSales').textContent='$'+list.reduce((s,o)=>s+Number(o.total||0),0).toFixed(2);['pending','under_review','delivered','cancelled','refunded'].forEach(st=>{const el=$('#count_'+st);if(el)el.textContent=list.filter(o=>o.status===st).length})}
async function loadAdminProducts(){const sb=await loadSupabase();const {data,error}=await sb.from('products').select('*').order('created_at',{ascending:false});if(error){toast(error.message,'error');return}const box=$('#adminProducts');if(!box)return;box.innerHTML=(data||[]).map(p=>`<div class="admin-product"><div><b>${escapeHtml(p.title)}</b><small>${escapeHtml(p.category)} · $${Number(p.price).toFixed(2)} · ${p.is_active?'Active':'Hidden'}</small></div><div><button class="btn small" onclick="editProduct('${p.id}')">Edit</button> <button class="btn small outline" onclick="deleteProduct('${p.id}')">Delete</button></div></div>`).join('')||'<p>No products yet.</p>';window.__adminProducts=data||[]}
function openProductForm(p=null){const f=$('#productForm');if(!f)return;f.reset();$('#productId').value=p?.id||'';$('#productTitle').value=p?.title||'';$('#productCategory').value=p?.category||'Others';$('#productPrice').value=p?.price??'';$('#productImage').value=p?.image_url||'';$('#productDownload').value=p?.download_url||'';$('#productDescription').value=p?.description||'';$('#productActive').checked=p?.is_active!==false;$('#productFeatured').checked=!!p?.featured;$('#productModal').style.display='flex'}
function closeProductForm(){if($('#productModal'))$('#productModal').style.display='none'}
function editProduct(id){openProductForm((window.__adminProducts||[]).find(p=>p.id===id)||null)}
async function saveProduct(e){e.preventDefault();const sb=await loadSupabase();const id=$('#productId').value;const payload={title:$('#productTitle').value.trim(),slug:$('#productTitle').value.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),category:$('#productCategory').value,price:Number($('#productPrice').value||0),currency:'USD',image_url:$('#productImage').value.trim()||null,download_url:$('#productDownload').value.trim()||null,description:$('#productDescription').value.trim()||null,is_active:$('#productActive').checked,featured:$('#productFeatured').checked};if(!payload.title){toast('Product title is required.','error');return}const q=id?sb.from('products').update(payload).eq('id',id):sb.from('products').insert(payload);const {error}=await q;if(error){toast(error.message,'error');return}closeProductForm();toast(id?'Product updated.':'Product created.','success');await loadAdminProducts();await initProducts()}
async function deleteProduct(id){if(!confirm('Delete this product?'))return;const sb=await loadSupabase();const {error}=await sb.from('products').delete().eq('id',id);if(error){toast(error.message,'error');return}toast('Product deleted.','success');loadAdminProducts()}
async function loadAdminOrders(){const sb=await loadSupabase();const {data,error}=await sb.from('orders').select('*, profiles(email,full_name), order_items(*)').order('created_at',{ascending:false});if(error){toast(error.message,'error');return}const box=$('#adminOrdersList');if(!box)return;box.innerHTML=(data||[]).map(o=>`<div class="admin-order"><div class="admin-order-head"><div><b>#${o.id.slice(0,8)}</b><small>${escapeHtml(o.profiles?.email||'')} · ${new Date(o.created_at).toLocaleString()}</small></div><strong>$${Number(o.total).toFixed(2)}</strong></div><div class="admin-order-items">${(o.order_items||[]).map(i=>`<span>${escapeHtml(i.product_title)} × ${i.quantity}</span>`).join('')}</div><div class="admin-order-actions"><select onchange="updateOrderStatus('${o.id}',this.value)">${['pending','under_review','delivered','cancelled','refunded'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s.replace('_',' ')}</option>`).join('')}</select><input id="note_${o.id}" value="${escapeHtml(o.admin_note||'')}" placeholder="Admin note"><button class="btn small" onclick="saveOrderNote('${o.id}')">Save Note</button></div></div>`).join('')||'<p>No orders yet.</p>'}
async function updateOrderStatus(id,status){const sb=await loadSupabase();const {data:order,error:getErr}=await sb.from('orders').select('user_id,status').eq('id',id).single();if(getErr){toast(getErr.message,'error');return}const patch={status};if(status==='delivered')patch.delivered_at=new Date().toISOString();if(status==='cancelled')patch.cancelled_at=new Date().toISOString();if(status==='refunded')patch.refunded_at=new Date().toISOString();if(status==='delivered')patch.payment_status='verified';if(status==='cancelled')patch.payment_status='failed';if(status==='refunded')patch.payment_status='refunded';const {error}=await sb.from('orders').update(patch).eq('id',id);if(error){toast(error.message,'error');return}const messages={delivered:'Your order has been delivered. Your download is available in your order details.',cancelled:'Your order has been cancelled.',refunded:'Your order has been refunded.',under_review:'Your payment is under review.',pending:'Your order is pending review.'};await sb.from('notifications').insert({user_id:order.user_id,title:`Order ${status.replace('_',' ')}`,message:messages[status]||'Your order status was updated.',type:'order',order_id:id});toast('Order status updated.','success');loadAdminOrders()}
async function saveOrderNote(id){const sb=await loadSupabase();const note=$('#note_'+id)?.value.trim()||null;const {error}=await sb.from('orders').update({admin_note:note}).eq('id',id);if(error)toast(error.message,'error');else toast('Note saved.','success')}
async function boot(){
  updateCartCount();
  if($('#featured')||$('#newArrivals'))renderHome();
  if($('#shopGrid'))renderShop();
  if($('#cartArea'))renderCart();
  if($('#checkoutSummary'))renderCheckout();
  if($('#accountName'))renderAccount();
  if($('#adminProducts')||$('#adminOrdersList'))renderAdmin();
  if($('#countdown')){let end=Date.now()+86400000;setInterval(()=>{let x=Math.max(0,end-Date.now()),h=Math.floor(x/3600000),m=Math.floor(x/60000)%60,s=Math.floor(x/1000)%60;$('#countdown').textContent=[h,m,s].map(n=>String(n).padStart(2,'0')).join(':')},1000)}
}
document.addEventListener('DOMContentLoaded',boot);
