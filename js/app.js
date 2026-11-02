/* Clari Color — interacciones del sitio.
   Los textos, fotos y trabajos se cargan desde el panel (Supabase).
   Si la base no responde, la página muestra los textos que ya trae el HTML. */

let WA = "5491123456789"; // se reemplaza por el número que cargue Anto en el panel

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lleno = v => typeof v === "string" && v.trim() !== "";
const leer = (obj, ruta) => ruta.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

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

/* ---------- trabajos ---------- */
// Trabajos de respaldo: se muestran si la base no responde.
// Los que se ven normalmente son los que carga Anto desde el panel.
const MUESTRA = [
  {t:"Balayage beige con ondas",c:"color",d:"Balayage",img:"img/trabajos/trabajo-01.webp"},
  {t:"Rubio frío",c:"color",d:"Color + ondas",img:"img/trabajos/trabajo-02.webp"},
  {t:"Balayage lacio",c:"color",d:"Balayage",img:"img/trabajos/trabajo-03.webp"},
  {t:"Rubio miel",c:"color",d:"Color + ondas",img:"img/trabajos/trabajo-04.webp"},
  {t:"Castaño con reflejos",c:"color",d:"Reflejos",img:"img/trabajos/trabajo-05.webp"}
];
let TRABAJOS = MUESTRA;

const degradado = x => `radial-gradient(110% 60% at 30% 15%,${x.g[2]} 0%,transparent 55%),linear-gradient(160deg,${x.g[0]},${x.g[1]} 55%,${x.g[2]})`;
const miniatura = (x, extra = "") => x.img
  ? `<img class="ph" src="${esc(x.img)}" alt="${esc(x.t)}" loading="lazy" decoding="async">`
  : `<span class="ph" style="${extra}background:${degradado(x)}"></span>`;

function pintarTeaser() {
  const teaser = document.getElementById("teaser");
  if (!teaser) return;
  const lista = TRABAJOS.slice(0, 3);
  teaser.innerHTML = lista.map(x =>
    `<a href="trabajos.html">${miniatura(x)}<span class="tag">${esc(x.t)}</span></a>`).join("");
}

const grid = document.getElementById("grid");
let renderGaleria = () => {};
if (grid) {
  const lb = document.getElementById("lb");
  const lbph = document.getElementById("lb-ph");
  let visibles = [], actual = 0, filtro = "todos";

  function mostrar(i) {
    actual = (i + visibles.length) % visibles.length;
    const x = visibles[actual];
    lbph.innerHTML = x.img ? `<img src="${esc(x.img)}" alt="${esc(x.t)}">` : "";
    lbph.style.background = x.img ? "#000" : degradado(x);
    document.getElementById("lb-t").textContent = x.d ? `${x.t} · ${x.d}` : x.t;
  }

  renderGaleria = () => {
    grid.innerHTML = "";
    visibles = TRABAJOS.filter(x => filtro === "todos" || x.c === filtro);
    visibles.forEach((x, i) => {
      const b = document.createElement("button");
      b.className = "item";
      b.type = "button";
      b.style.animationDelay = (i * 40) + "ms";
      b.innerHTML = `${miniatura(x, `aspect-ratio:1/${x.h || 1};`)}<span class="tag">${esc(x.t)}${x.d ? `<em>${esc(x.d)}</em>` : ""}</span>`;
      b.onclick = () => { mostrar(i); lb.showModal(); };
      grid.appendChild(b);
    });
    if (!visibles.length) grid.innerHTML = `<p class="note">Todavía no hay trabajos en esta categoría.</p>`;
    const nota = document.getElementById("demo-note");
    if (nota) nota.hidden = TRABAJOS.every(x => x.img);
  };

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
    filtro = b.dataset.f;
    renderGaleria();
  });
}

/* ---------- aplicar el contenido del panel ---------- */
function aplicarContenido(d) {
  if (!d) return;

  document.querySelectorAll("[data-c]").forEach(el => {
    const v = leer(d, el.dataset.c);
    if (lleno(v)) el.textContent = v.trim();
  });

  const servicios = (d.servicios || []).filter(s => lleno(s.titulo));
  if (servicios.length) document.querySelectorAll('[data-list="servicios"]').forEach(el => {
    el.innerHTML = servicios.map(s => `<div><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></div>`).join("");
  });

  const resenas = (d.resenas || []).filter(r => lleno(r.texto));
  if (resenas.length) {
    document.querySelectorAll('[data-list="resenas"]').forEach(el => {
      el.innerHTML = resenas.map(r => `<figure><span class="stars" aria-label="5 de 5">★★★★★</span><blockquote>${esc(r.texto)}</blockquote><figcaption><b>${esc(r.autor)}</b> · Google</figcaption></figure>`).join("");
    });
    const q = document.querySelector("[data-quote]");
    if (q) {
      q.querySelector("blockquote").textContent = resenas[0].texto;
      q.querySelector("figcaption").innerHTML = `${esc(resenas[0].autor)} · reseña en Google · <a href="sobre-mi.html">ver más reseñas</a>`;
    }
  }

  const opciones = (d.contacto?.opciones || []).filter(lleno);
  if (opciones.length) document.querySelectorAll('[data-list="opciones"]').forEach(el => {
    el.innerHTML = opciones.map(o => `<option>${esc(o)}</option>`).join("");
  });

  const c = d.contacto || {};
  const num = String(c.whatsapp || "").replace(/\D/g, "");
  if (num.length >= 8) {
    WA = num;
    document.querySelectorAll("[data-wa]").forEach(a => a.href = `https://wa.me/${WA}`);
  }
  const ig = String(c.instagram || "").replace(/^@/, "").trim();
  if (ig) document.querySelectorAll("[data-ig]").forEach(a => {
    a.href = `https://www.instagram.com/${encodeURIComponent(ig)}/`;
    a.textContent = "@" + ig;
  });

  document.querySelectorAll("[data-foto]").forEach(el => {
    const url = leer(d, el.dataset.foto);
    if (lleno(url)) {
      el.style.background = `#2a1b14 url("${encodeURI(url)}") center/cover no-repeat`;
      const marca = el.querySelector("span");
      if (marca) marca.remove();
    }
  });
}

function aplicarTrabajos(filas) {
  if (!Array.isArray(filas) || !filas.length) return;
  TRABAJOS = filas.map(f => ({ t: f.titulo, c: f.categoria, d: f.detalle, img: f.foto, h: 1 }));
}

/* Primero se muestra lo último guardado en este navegador (carga instantánea)
   y después se actualiza con lo que hay en la base. */
const CACHE = "clari-contenido-v1";
function desdeCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (c) { aplicarContenido(c.contenido); aplicarTrabajos(c.trabajos); }
  } catch (e) {}
}

async function desdeBase() {
  const cfg = window.CLARI_CONFIG || {};
  if (!cfg.url || !cfg.key) return;
  const h = { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` };
  try {
    const [rc, rt] = await Promise.all([
      fetch(`${cfg.url}/rest/v1/contenido?id=eq.sitio&select=datos`, { headers: h }),
      fetch(`${cfg.url}/rest/v1/trabajos?visible=eq.true&select=titulo,categoria,detalle,foto&order=orden.asc`, { headers: h })
    ]);
    if (!rc.ok || !rt.ok) return;
    const contenido = (await rc.json())[0]?.datos || null;
    const trabajos = await rt.json();
    aplicarContenido(contenido);
    aplicarTrabajos(trabajos);
    pintarTeaser();
    renderGaleria();
    try { localStorage.setItem(CACHE, JSON.stringify({ contenido, trabajos })); } catch (e) {}
  } catch (e) { /* sin conexión: queda lo que ya se ve */ }
}

desdeCache();
pintarTeaser();
renderGaleria();
desdeBase();

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
