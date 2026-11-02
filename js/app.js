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

/* ---------- reseñas estilo Google Maps ---------- */
const TONOS_AV = ["#563823", "#8c6239", "#c49a63", "#3e2a1f", "#a77d4c"];
function tarjetaResena(r, i) {
  const ini = String(r.autor || "?").trim().split(/\s+/).slice(0, 2).map(p => p[0] || "").join("").toUpperCase() || "?";
  const cuando = lleno(r.cuando) ? `${esc(r.cuando)} · Google` : "Google";
  return `<article class="rv-card">
    <div class="rv-head"><span class="rv-av" style="background:${TONOS_AV[i % TONOS_AV.length]}">${esc(ini)}</span><span class="rv-who"><b>${esc(r.autor || "Clienta")}</b><small>${cuando}</small></span></div>
    <span class="stars" role="img" aria-label="5 de 5 estrellas">★★★★★</span>
    <p class="rv-txt">${esc(r.texto)}</p>
  </article>`;
}

function prepararResenas() {
  document.querySelectorAll("[data-resenas]").forEach(bloque => {
    const track = bloque.querySelector(".rv-track");
    const prev = bloque.querySelector(".rv-prev"), next = bloque.querySelector(".rv-next");
    if (!track) return;
    const tarjetas = () => [...track.querySelectorAll(".rv-card")];
    const cards = tarjetas();

    // "Leer más" solo en las reseñas que no entran completas
    cards.forEach(c => {
      const txt = c.querySelector(".rv-txt");
      c.querySelector(".rv-more")?.remove();
      c.classList.remove("abierta");
      if (txt.scrollHeight > txt.clientHeight + 2) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "rv-more"; b.textContent = "Leer más";
        b.onclick = () => { const a = c.classList.toggle("abierta"); b.textContent = a ? "Leer menos" : "Leer más"; };
        c.appendChild(b);
      }
    });

    // puntitos
    let dots = bloque.querySelector(".rv-dots");
    if (!dots) { dots = document.createElement("div"); dots.className = "rv-dots"; dots.setAttribute("aria-hidden", "true"); track.after(dots); }
    const paso = () => { const c = tarjetas(); return (c[1] ? c[1].offsetLeft - c[0].offsetLeft : track.clientWidth) || 1; };
    const visibles = () => Math.max(1, Math.round(track.clientWidth / paso()));
    const paginas = () => Math.max(1, tarjetas().length - visibles() + 1);

    const actualizar = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      const n = paginas(), i = Math.min(n - 1, Math.round(track.scrollLeft / paso()));
      if (dots.children.length !== n) dots.innerHTML = n > 1 ? "<i></i>".repeat(n) : "";
      [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
      bloque.querySelector(".rv-nav").hidden = n <= 1;
    };
    if (!track.dataset.listo) {
      track.dataset.listo = "1";
      prev && (prev.onclick = () => track.scrollBy({ left: -paso(), behavior: "smooth" }));
      next && (next.onclick = () => track.scrollBy({ left: paso(), behavior: "smooth" }));
      track.addEventListener("scroll", () => requestAnimationFrame(actualizar), { passive: true });
      track.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: paso(), behavior: "smooth" }); }
        if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -paso(), behavior: "smooth" }); }
      });
      window.addEventListener("resize", actualizar);
      window.addEventListener("load", actualizar);
    }
    actualizar();
  });
}
prepararResenas();

/* ---------- aplicar el contenido del panel ---------- */
function aplicarContenido(d) {
  if (!d) return;

  document.querySelectorAll("[data-c]").forEach(el => {
    if (!("orig" in el.dataset)) el.dataset.orig = el.textContent;
    const v = leer(d, el.dataset.c);
    el.textContent = lleno(v) ? v.trim() : el.dataset.orig;
  });

  const servicios = (d.servicios || []).filter(s => lleno(s.titulo));
  if (servicios.length) document.querySelectorAll('[data-list="servicios"]').forEach(el => {
    el.innerHTML = servicios.map(s => `<div><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></div>`).join("");
  });

  const resenas = (d.resenas || []).filter(r => lleno(r.texto));
  if (resenas.length) document.querySelectorAll('[data-list="resenas"]').forEach(el => {
    el.innerHTML = resenas.map(tarjetaResena).join("");
    el.scrollLeft = 0;
  });
  if (resenas.length) prepararResenas();

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

/* ---------- vista previa del panel ----------
   Cuando el panel abre la web adentro (con ?vista-previa), la página no lee la base:
   muestra lo que Anto está escribiendo, antes de guardar. */
const VISTA_PREVIA = new URLSearchParams(location.search).has("vista-previa") && window.parent !== window;

if (VISTA_PREVIA) {
  const st = document.createElement("style");
  st.textContent = `.pv-foco{outline:2px solid #3FC2BB;outline-offset:6px;border-radius:6px;animation:pvFoco 1.4s ease-out}
    @keyframes pvFoco{0%{outline-color:rgba(63,194,187,0);outline-offset:18px}40%{outline-color:#3FC2BB;outline-offset:6px}}
    .pv-cambio{animation:pvCambio .9s ease-out}
    @keyframes pvCambio{0%{background:rgba(63,194,187,.35)}100%{background:transparent}}
    a{pointer-events:none}`;
  document.head.appendChild(st);
  pintarTeaser();
  renderGaleria();
  let foco = null;
  window.addEventListener("message", e => {
    if (e.source !== window.parent) return;
    if (location.protocol !== "file:" && e.origin !== location.origin) return;
    const m = e.data || {};
    if (m.tipo === "clari-contenido") {
      const antes = new Map([...document.querySelectorAll("[data-c]")].map(el => [el, el.textContent]));
      aplicarContenido(m.contenido);
      TRABAJOS = MUESTRA;
      aplicarTrabajos((m.trabajos || []).filter(t => t.visible && t.foto && (t.titulo || "").trim()));
      pintarTeaser();
      renderGaleria();
      antes.forEach((txt, el) => { if (el.textContent !== txt) { el.classList.remove("pv-cambio"); void el.offsetWidth; el.classList.add("pv-cambio"); } });
    }
    if (m.tipo === "clari-foco") {
      if (foco) foco.classList.remove("pv-foco");
      foco = m.selector ? document.querySelector(m.selector) : null;
      if (foco) {
        foco.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block: "center" });
        void foco.offsetWidth; foco.classList.add("pv-foco");
      }
    }
  });
  window.parent.postMessage({ tipo: "clari-lista" }, location.protocol === "file:" ? "*" : location.origin);
} else {
  desdeCache();
  pintarTeaser();
  renderGaleria();
  desdeBase();
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
