const phrases = [
  "-- Master AI",
  "-- Build your Future",
  "-- Upto 25% Discount",
  "-- Get Access Now",
  "-- by Labib Shahriar"
];
const typeEl = document.getElementById("typeText");
let phraseIndex = 0, charIndex = 0, deleting = false;
function typeLoop(){
  if(!typeEl) return;
  const phrase=phrases[phraseIndex]; typeEl.textContent=phrase.slice(0,charIndex);
  if(!deleting){ charIndex++; if(charIndex>phrase.length){deleting=true;setTimeout(typeLoop,1200);return;} }
  else { charIndex--; if(charIndex<0){deleting=false;phraseIndex=(phraseIndex+1)%phrases.length;charIndex=0;} }
  setTimeout(typeLoop,deleting?38:70);
}
typeLoop();
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("visible");}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const chart=document.getElementById("chart"), tooltip=document.getElementById("chartTooltip"), tipYear=document.getElementById("tipYear"), tipA=document.getElementById("tipA"), tipB=document.getElementById("tipB"), tipC=document.getElementById("tipC");
const chartData=[
 {year:"২০২০",risk:18,ai:8,unemployment:58},
 {year:"২০২১",risk:14,ai:11,unemployment:61},
 {year:"২০২২",risk:28,ai:25,unemployment:65},
 {year:"২০২৩",risk:43,ai:42,unemployment:69},
 {year:"২০২৪",risk:55,ai:60,unemployment:73},
 {year:"২০২৫",risk:70,ai:78,unemployment:77},
 {year:"২০২৬",risk:82,ai:92,unemployment:80}
];
if(chart&&tooltip){
 chart.addEventListener("mousemove",e=>{
  const rect=chart.getBoundingClientRect(), x=e.clientX-rect.left;
  const pct=Math.max(0,Math.min(.999,x/rect.width));
  const index=Math.min(chartData.length-1,Math.floor(pct*chartData.length));
  const d=chartData[index]; tipYear.textContent=d.year; tipA.textContent=d.risk+"%"; tipB.textContent=d.ai+"%"; tipC.textContent=d.unemployment+"%";
  tooltip.style.left=`${Math.max(8,Math.min(rect.width-175,x+14))}px`; tooltip.style.top=`${Math.max(8,Math.min(rect.height-125,e.clientY-rect.top-78))}px`; tooltip.style.right="auto"; tooltip.style.opacity="1";
 });
 chart.addEventListener("mouseleave",()=>tooltip.style.opacity=".92");
}

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{const id=a.getAttribute("href"),target=document.querySelector(id);if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth",block:"start"});}}));

const FLUXCORD_DISCORD="https://discord.gg/9EpdA3KpQE";
function redirectToDiscord(button){
 if(!button||button.dataset.redirecting==="1")return;
 button.dataset.redirecting="1"; const original=button.innerHTML; button.innerHTML="Discord-এ নিয়ে যাওয়া হচ্ছে...";
 const toast=document.createElement("div"); toast.className="redirect-toast"; toast.textContent="আপনাকে Discord সার্ভারে নিয়ে যাওয়া হচ্ছে..."; document.body.appendChild(toast);
 setTimeout(()=>{window.location.href=FLUXCORD_DISCORD;},1500);
}
document.querySelectorAll('a[href*="discord.gg/9EpdA3KpQE"]').forEach(el=>el.addEventListener("click",e=>{e.preventDefault();redirectToDiscord(el);}));

const discountPopup=document.getElementById("discountPopup"), discountClose=document.getElementById("discountClose"), discountAccess=document.getElementById("discountAccess");
function createConfetti(){
 const box=document.querySelector(".confetti-pieces"); if(!box)return; box.innerHTML="";
 for(let i=0;i<48;i++){const p=document.createElement("i");p.style.left=`${Math.random()*100}%`;p.style.animationDelay=`${Math.random()*.8}s`;p.style.animationDuration=`${1.8+Math.random()*1.8}s`;p.style.setProperty("--r",`${Math.random()*360}deg`);box.appendChild(p);}
}
function openDiscountPopup(){if(!discountPopup)return;createConfetti();discountPopup.classList.add("show");discountPopup.setAttribute("aria-hidden","false");document.body.classList.add("popup-open");}
function closeDiscountPopup(){if(!discountPopup)return;discountPopup.classList.remove("show");discountPopup.setAttribute("aria-hidden","true");document.body.classList.remove("popup-open");}
if(discountPopup)setTimeout(openDiscountPopup,100);
discountClose?.addEventListener("click",closeDiscountPopup);
discountPopup?.querySelector(".discount-overlay")?.addEventListener("click",closeDiscountPopup);
discountAccess?.addEventListener("click",()=>{closeDiscountPopup();redirectToDiscord(discountAccess);});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDiscountPopup();});
