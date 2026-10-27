/* Clari Color — interacciones del sitio.
   Cada bloque se activa solo si la página tiene ese elemento. */
const WA = "5491123456789"; // número de WhatsApp de Clari (cambiar por el real)

/* ---------- carta de tonos (inicio) ---------- */
const strip = document.getElementById("strip");
if (strip) {
  const tone = document.getElementById("tone");
  const tonos = [["#1b1513","Negro"],["#2c1e18","Castaño muy oscuro"],["#3e2a1f","Castaño oscuro"],["#563823","Castaño medio"],["#6f4a2c","Castaño claro"],["#8c6239","Rubio oscuro"],["#a77d4c","Rubio medio"],["#c49a63","Rubio claro"],["#dbbb88","Rubio muy claro"],["#eedcb5","Rubio clarísimo"]];
  tonos.forEach(([color, nombre], i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.style.background = color;
    b.setAttribute("aria-label", `Nivel ${i + 1}, ${nombre}`);
    b.setAttribute("aria-pressed", "false");
    b.innerHTML = `<b>${i + 1}</b>`;
    const elegir = () => {
      strip.querySelectorAll("button").forEach(o => o.setAttribute("aria-pressed", String(o === b)));
      tone.textContent = `Nivel ${i + 1} · ${nombre}`;
    };
    b.addEventListener("mouseenter", elegir);
    b.addEventListener("click", elegir);
    b.addEventListener("focus", elegir);
    strip.appendChild(b);
  });
}

/* ---------- tijeras que cortan la línea al aparecer ---------- */
const cortes = document.querySelectorAll(".cut");
if (cortes.length) {
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("go"); cio.unobserve(e.target); }
  }), { threshold: 1 });
  cortes.forEach(c => cio.observe(c));
}

/* ---------- trabajos (galería) ---------- */
const TRABAJOS = [
  {t:"Honey Balayage",c:"color",d:"Color",g:["#3a2618","#9c6b3c","#e2b979"],h:1.25},
  {t:"Ash Blonde frío",c:"color",d:"Color",g:["#6e6a63","#bdb7aa","#ebe7de"],h:1.05},
  {t:"Bronde",c:"trans",d:"Color + corte",g:["#3e2a1f","#8a6440","#cfa877"],h:1.3},
  {t:"Chin Bob clásico",c:"corte",d:"Corte",g:["#1d1511","#3d2a1f","#6b4a32"],h:.95},
  {t:"Golden Blonde Curls",c:"peinado",d:"Color + peinado",g:["#7a5a2e","#d1a75e","#f1d9a2"],h:1.2},
  {t:"Copper Red",c:"color",d:"Color",g:["#4f1b0e","#a3441f","#dd7b45"],h:1.1},
  {t:"Recogido clásico",c:"peinado",d:"Peinado",g:["#2c1e18","#5b3f2c","#9a7652"],h:1},
  {t:"Long Layers U-Shape",c:"corte",d:"Corte",g:["#160f0c","#3a271c","#5e4130"],h:1.3},
  {t:"Transformación total",c:"trans",d:"Transformación",g:["#2a1c15","#a3794c","#ecd2a2"],h:1.05},
  {t:"Romantic Half Up",c:"peinado",d:"Peinado",g:["#4a3020","#9b7048","#d9b484"],h:1.15},
  {t:"Beach Waves Balayage",c:"color",d:"Color + peinado",g:["#3a2718","#a17646","#e6c590"],h:1},
  {t:"Shag en capas",c:"corte",d:"Corte",g:["#1b1513","#47301f","#7a5537"],h:1.15}
];
// Cuando estén las fotos, agregá a cada trabajo  img:"img/trabajos/archivo.jpg"
const fondo = x => x.img
  ? `url("${x.img}") center/cover`
  : `radial-gradient(110% 60% at 30% 15%,${x.g[2]} 0%,transparent 55%),linear-gradient(160deg,${x.g[0]},${x.g[1]} 55%,${x.g[2]})`;

const teaser = document.getElementById("teaser");
if (teaser) {
  [0, 5, 2].forEach(i => {
    const x = TRABAJOS[i];
    teaser.insertAdjacentHTML("beforeend",
      `<a href="trabajos.html"><span class="ph" style="background:${fondo(x)}"></span><span class="tag">${x.t}</span></a>`);
  });
}

const grid = document.getElementById("grid");
if (grid) {
  const lb = document.getElementById("lb");
  let visibles = [], actual = 0;

  function mostrar(i) {
    actual = (i + visibles.length) % visibles.length;
    const x = visibles[actual];
    document.getElementById("lb-ph").style.background = fondo(x);
    document.getElementById("lb-t").textContent = `${x.t} · ${x.d}`;
  }

  function render(filtro) {
    grid.innerHTML = "";
    visibles = TRABAJOS.filter(x => filtro === "todos" || x.c === filtro);
    visibles.forEach((x, i) => {
      const b = document.createElement("button");
      b.className = "item";
      b.type = "button";
      b.style.animationDelay = (i * 40) + "ms";
      b.innerHTML = `<span class="ph" style="aspect-ratio:1/${x.h};background:${fondo(x)}"></span><span class="tag">${x.t}<em>${x.d}</em></span>`;
      b.onclick = () => { mostrar(i); lb.showModal(); };
      grid.appendChild(b);
    });
  }

  document.getElementById("lb-x").onclick = () => lb.close();
  document.getElementById("lb-p").onclick = () => mostrar(actual - 1);
  document.getElementById("lb-n").onclick = () => mostrar(actual + 1);
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });

  document.querySelectorAll(".filters button").forEach(b => b.onclick = () => {
    document.querySelectorAll(".filters button").forEach(o => o.setAttribute("aria-pressed", String(o === b)));
    render(b.dataset.f);
  });
  render("todos");
}

/* ---------- formulario de contacto → WhatsApp ---------- */
const form = document.getElementById("f");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const servicio = document.getElementById("servicio").value;
    const msg = document.getElementById("msg").value;
    const texto = `Hola Clari! Soy ${nombre}. Me interesa: ${servicio}. ${msg}`.trim();
    const out = document.getElementById("out");
    out.hidden = false;
    out.innerHTML = `Tu mensaje está listo. <a href="https://wa.me/${WA}?text=${encodeURIComponent(texto)}" target="_blank" rel="noopener">Abrir WhatsApp</a>`;
  });
}
