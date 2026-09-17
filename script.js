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
  const phrase = phrases[phraseIndex];
  typeEl.textContent = phrase.slice(0, charIndex);

  if(!deleting){
    charIndex++;
    if(charIndex > phrase.length){
      deleting = true;
      setTimeout(typeLoop, 1200);
      return;
    }
  }else{
    charIndex--;
    if(charIndex < 0){
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      charIndex = 0;
    }
  }
  setTimeout(typeLoop, deleting ? 38 : 70);
}
typeLoop();

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add("visible");
  });
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const chart = document.getElementById("chart");
const tooltip = document.getElementById("chartTooltip");
const tipYear = document.getElementById("tipYear");
const tipA = document.getElementById("tipA");
const tipB = document.getElementById("tipB");

const chartData = [
  ["২০২০","16K","5K"],
  ["২০২১","8K","6K"],
  ["২০২২","36K","28K"],
  ["২০২৩","52K","60K"],
  ["২০২৪","30K","78K"],
  ["২০২৫","26K","96K"],
  ["২০২৬","130K+","Saturation"]
];

if(chart){
  chart.addEventListener("mousemove", e=>{
    const rect = chart.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0,Math.min(0.999,x/rect.width));
    const index = Math.min(chartData.length-1,Math.floor(pct*chartData.length));
    const [year,a,b] = chartData[index];

    tipYear.textContent = year;
    tipA.textContent = a;
    tipB.textContent = b;

    const left = Math.max(10,Math.min(rect.width-165,x+14));
    const top = Math.max(10,Math.min(rect.height-115,e.clientY-rect.top-70));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.right = "auto";
  });
}

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", e=>{
    const id = a.getAttribute("href");
    const target = document.querySelector(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth",block:"start"});
    }
  });
});

document.querySelectorAll(".btn").forEach(btn=>{
  btn.addEventListener("pointermove", e=>{
    const r = btn.getBoundingClientRect();
    const x = (e.clientX-r.left-r.width/2)*0.04;
    const y = (e.clientY-r.top-r.height/2)*0.04;
    btn.style.transform = `translate(${x}px,${y}px) translateY(-2px)`;
  });
  btn.addEventListener("pointerleave", ()=>{
    btn.style.transform = "";
  });
});


/* ===== Fluxcord Access Redirect ===== */
const FLUXCORD_DISCORD = "https://discord.gg/9EpdA3KpQE";

function redirectToDiscord(button) {
  if (!button || button.dataset.redirecting === "1") return;
  button.dataset.redirecting = "1";

  const original = button.innerHTML;
  button.innerHTML = "Discord-এ নিয়ে যাওয়া হচ্ছে...";

  const toast = document.createElement("div");
  toast.className = "redirect-toast";
  toast.textContent = "আপনাকে Discord সার্ভারে নিয়ে যাওয়া হচ্ছে...";
  document.body.appendChild(toast);

  setTimeout(() => {
    window.location.href = FLUXCORD_DISCORD;
  }, 1500);

  setTimeout(() => {
    button.innerHTML = original;
    button.dataset.redirecting = "0";
    toast.remove();
  }, 2200);
}

document.querySelectorAll('a[href*="discord.gg/9EpdA3KpQE"], a[href*="discord.com/invite/9EpdA3KpQE"]').forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    redirectToDiscord(el);
  });
});

/* ===== Discount Popup ===== */
const discountPopup = document.getElementById("discountPopup");
const discountClose = document.getElementById("discountClose");
const discountAccess = document.getElementById("discountAccess");

function openDiscountPopup() {
  if (!discountPopup) return;
  discountPopup.classList.add("show");
  discountPopup.setAttribute("aria-hidden", "false");
  document.body.classList.add("popup-open");
}

function closeDiscountPopup() {
  if (!discountPopup) return;
  discountPopup.classList.remove("show");
  discountPopup.setAttribute("aria-hidden", "true");
  document.body.classList.remove("popup-open");
}

if (discountPopup) {
  // Show once per browser session after the visitor lands on the page.
  setTimeout(openDiscountPopup, 700);
}

discountClose?.addEventListener("click", closeDiscountPopup);
discountPopup?.querySelector(".discount-overlay")?.addEventListener("click", closeDiscountPopup);

discountAccess?.addEventListener("click", () => {
  closeDiscountPopup();
  redirectToDiscord(discountAccess);
});

/* ===== 2020–2026 Bangladesh illustrative trend chart =====
   Values are intentionally indexed/illustrative, not presented as official
   Bangladesh layoff statistics.
*/
const fluxcordGraphData = {
  years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
  employmentRisk: [8, 10, 17, 29, 39, 51, 63],
  aiDemand: [12, 15, 27, 44, 61, 78, 92],
  unemployment: [100, 96, 91, 86, 82, 78, 74]
};

window.fluxcordGraphData = fluxcordGraphData;

/* If the existing graph exposes a Chart.js instance, update its datasets.
   Otherwise the site's existing graph code remains untouched. */
if (typeof Chart !== "undefined") {
  document.querySelectorAll("canvas").forEach((canvas) => {
    const chart = Chart.getChart(canvas);
    if (!chart || !chart.data || !chart.data.datasets) return;

    chart.data.labels = fluxcordGraphData.years;
    const datasets = chart.data.datasets;

    if (datasets[0]) {
      datasets[0].label = "কর্মসংস্থান ঝুঁকি";
      datasets[0].data = fluxcordGraphData.employmentRisk;
      datasets[0].borderColor = "#ef4444";
      datasets[0].backgroundColor = "transparent";
    }
    if (datasets[1]) {
      datasets[1].label = "AI চাহিদা";
      datasets[1].data = fluxcordGraphData.aiDemand;
      datasets[1].borderColor = "#22c55e";
      datasets[1].backgroundColor = "transparent";
    }
    if (datasets[2]) {
      datasets[2].label = "বেকারত্ব সূচক";
      datasets[2].data = fluxcordGraphData.unemployment;
      datasets[2].borderColor = "#9ca3af";
      datasets[2].backgroundColor = "transparent";
    }
    chart.update();
  });
}
