/* Clari Color — panel de edición.
   Todo lo que se edita acá se guarda en Supabase y la web lo lee al cargar.
   Los límites de caracteres evitan que un texto muy largo desarme el diseño. */

const cfg = window.CLARI_CONFIG || {};
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clonar = o => JSON.parse(JSON.stringify(o));
const leer = (o, r) => r.split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);
const escribir = (o, r, v) => { const ks = r.split("."); let x = o; ks.slice(0, -1).forEach(k => { x[k] = x[k] || {}; x = x[k]; }); x[ks.at(-1)] = v; };

/* ---------- textos originales (se usan si la base todavía está vacía) ---------- */
const ORIGINAL = {
  "inicio": {
    "etiqueta": "Estilista & coach ontológica · Quilmes",
    "frase": "Transformar tu imagen también puede transformar cómo te ves.",
    "texto": "Un espacio donde la peluquería, el coaching y el oráculo se unen para acompañarte a verte y sentirte bien, por dentro y por fuera.",
    "boton1": "Conocé mi trabajo",
    "boton2": "Reservar turno",
    "titulo_servicios": "Lo que hago",
    "titulo_trabajos": "Últimos trabajos"
  },
  "cta": {
    "titulo": "¿Lista para tu cambio?",
    "boton": "Reservar turno"
  },
  "sobre": {
    "etiqueta": "Hola, soy Clari",
    "bajada": "Estilista y coach ontológica. Acompaño transformaciones por dentro y por fuera.",
    "foto": "",
    "destacado": "Siempre creí que el cabello es mucho más que pelo: es memoria, identidad y reflejo de lo que llevamos dentro.",
    "parrafo1": "Soy estilista y coach ontológica. Por eso uní la peluquería con el coaching y el oráculo, y así nació este espacio donde trabajamos por dentro y por fuera.",
    "parrafo2": "Cada clienta es única. Te escucho, te aconsejo y creamos juntas el resultado. Cada turno es una pausa, un momento para encontrarte.",
    "titulo_resenas": "Reseñas",
    "etiqueta_resenas": "Lo que dicen mis clientas"
  },
  "servicios": [
    {
      "titulo": "Color",
      "texto": "Balayage, mechas, rubios y coloración completa."
    },
    {
      "titulo": "Corte",
      "texto": "Cortes y peinados según tu rostro y tu rutina."
    },
    {
      "titulo": "Coaching",
      "texto": "Sesiones de coaching ontológico y oráculo."
    }
  ],
  "resenas": [
    {
      "texto": "Excelente colorista. Voy hace 10 años y cada día se supera. Te escucha, te interpreta y te cuida el cabello.",
      "autor": "Romina Souse"
    },
    {
      "texto": "La mejor colorista por lejos. Entiende a la perfección lo que querés y te asesora con total honestidad.",
      "autor": "Donatella Brizzola"
    },
    {
      "texto": "Me encantó conocer a Clari, y el color final de mi pelito habla por sí solo.",
      "autor": "Lisseth Toapanta"
    }
  ],
  "trabajos": {
    "etiqueta": "Mi trabajo habla por mí",
    "bajada": "Una selección de transformaciones reales: color, cortes, peinados y cambios completos."
  },
  "contacto": {
    "etiqueta": "Turnos por WhatsApp",
    "bajada": "¿Querés conocer más? Escribime y te respondo en menos de 24 horas hábiles.",
    "whatsapp": "5491123456789",
    "whatsapp_visible": "+54 9 11 2345-6789",
    "instagram": "claricolor.ok",
    "email": "hola@claricolor.com.ar",
    "ubicacion": "Quilmes, Buenos Aires",
    "horarios": "Lunes a sábado · 10 a 19 h",
    "opciones": [
      "Corte de pelo",
      "Coloración / balayage",
      "Tratamiento capilar",
      "Peinado / evento",
      "Transformación integral",
      "Sesión de coaching",
      "Oráculo",
      "Otro"
    ]
  }
};

/* ---------- qué se puede editar en cada sección ---------- */
const CATEGORIAS = [["color", "Color"], ["corte", "Cortes"], ["peinado", "Peinados"], ["trans", "Transformaciones"]];

const ICONOS = {
  inicio: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  sobre: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  servicios: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.5 8.5 20 18M8.5 15.5 20 6"/>',
  resenas: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  trabajos: '<rect x="3" y="3" width="7.5" height="9" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5"/><rect x="3" y="15" width="7.5" height="6" rx="1.5"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.5"/>',
  contacto: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>',
};

const SECCIONES = [
  { id: "inicio", nombre: "Inicio", pagina: "index.html",
    intro: "La página principal. El nombre “Clari Color” y la carta de tonos son fijos.",
    tarjetas: [
      { titulo: "Presentación", campos: [
        { k: "inicio.etiqueta", l: "Etiqueta chica (arriba del nombre)", max: 60 },
        { k: "inicio.frase", l: "Frase principal", max: 110, area: true },
        { k: "inicio.texto", l: "Texto de presentación", max: 260, area: true },
        { fila: [ { k: "inicio.boton1", l: "Botón 1", max: 28 }, { k: "inicio.boton2", l: "Botón 2", max: 28 } ] },
      ]},
      { titulo: "Títulos de las secciones", campos: [
        { fila: [ { k: "inicio.titulo_servicios", l: "Título de servicios", max: 30 }, { k: "inicio.titulo_trabajos", l: "Título de trabajos", max: 30 } ] },
      ]},
      { titulo: "Franja negra del final", ayuda: "Aparece al final de Inicio, Sobre mí y Trabajos.", campos: [
        { fila: [ { k: "cta.titulo", l: "Título", max: 50 }, { k: "cta.boton", l: "Botón", max: 28 } ] },
      ]},
    ] },
  { id: "sobre", nombre: "Sobre mí", pagina: "sobre-mi.html",
    tarjetas: [
      { titulo: "Encabezado", campos: [
        { k: "sobre.etiqueta", l: "Etiqueta chica", max: 40 },
        { k: "sobre.bajada", l: "Bajada", max: 160, area: true },
      ]},
      { titulo: "Foto", foto: "sobre.foto", ayuda: "Vertical queda mejor. Se achica sola para que la web cargue rápido." },
      { titulo: "Texto", campos: [
        { k: "sobre.destacado", l: "Frase destacada (letra grande)", max: 180, area: true },
        { k: "sobre.parrafo1", l: "Párrafo 1", max: 500, area: true },
        { k: "sobre.parrafo2", l: "Párrafo 2", max: 500, area: true },
      ]},
      { titulo: "Títulos de reseñas", campos: [
        { fila: [ { k: "sobre.titulo_resenas", l: "Título", max: 30 }, { k: "sobre.etiqueta_resenas", l: "Etiqueta", max: 40 } ] },
      ]},
    ] },
  { id: "servicios", nombre: "Servicios", pagina: "index.html",
    intro: "Se muestran en Inicio y en Sobre mí. Las columnas se acomodan solas según cuántos haya.",
    lista: { k: "servicios", nombre: "Servicio", min: 1, max: 6,
      campos: [ { k: "titulo", l: "Nombre", max: 24 }, { k: "texto", l: "Descripción", max: 120, area: true } ],
      nuevo: () => ({ titulo: "", texto: "" }) } },
  { id: "resenas", nombre: "Reseñas", pagina: "sobre-mi.html",
    intro: "La primera reseña también aparece en Inicio.",
    lista: { k: "resenas", nombre: "Reseña", min: 1, max: 9,
      campos: [ { k: "texto", l: "Reseña", max: 300, area: true }, { k: "autor", l: "Nombre de la clienta", max: 40 } ],
      nuevo: () => ({ texto: "", autor: "" }) } },
  { id: "trabajos", nombre: "Trabajos", pagina: "trabajos.html", trabajos: true,
    tarjetas: [
      { titulo: "Encabezado de la página", campos: [
        { k: "trabajos.etiqueta", l: "Etiqueta chica", max: 40 },
        { k: "trabajos.bajada", l: "Bajada", max: 160, area: true },
      ]},
    ] },
  { id: "contacto", nombre: "Contacto", pagina: "contacto.html",
    tarjetas: [
      { titulo: "Encabezado", campos: [
        { k: "contacto.etiqueta", l: "Etiqueta chica", max: 40 },
        { k: "contacto.bajada", l: "Bajada", max: 160, area: true },
      ]},
      { titulo: "Datos", campos: [
        { fila: [
          { k: "contacto.whatsapp", l: "WhatsApp (para los links)", max: 15, tipo: "tel", ayuda: "Solo números, con 549 adelante. Ej: 5491123456789", validar: v => /^\d{10,15}$/.test(v.replace(/\D/g, "")) || "Revisá el número: tienen que ser entre 10 y 15 números." },
          { k: "contacto.whatsapp_visible", l: "WhatsApp (como se lee)", max: 24, ayuda: "Ej: +54 9 11 2345-6789" },
        ]},
        { fila: [
          { k: "contacto.instagram", l: "Instagram", max: 30, ayuda: "Sin @. Ej: claricolor.ok" },
          { k: "contacto.email", l: "Mail", max: 60, tipo: "email" },
        ]},
        { fila: [
          { k: "contacto.ubicacion", l: "Ubicación", max: 60 },
          { k: "contacto.horarios", l: "Horarios", max: 60 },
        ]},
      ]},
    ],
    lista: { k: "contacto.opciones", nombre: "Opción", min: 1, max: 12, simple: true, titulo: "Opciones del formulario", ayuda: "Lo que se puede elegir en “¿Qué servicio te interesa?”.",
      campos: [ { k: "", l: "Opción", max: 40 } ], nuevo: () => "" } },
];

/* ---------- estado ---------- */
let sb, datos, guardado, trabajos = [], trabajosGuardados = [], porBorrar = [], seccion = "inicio", subiendo = 0;

const toast = (t, mal) => {
  const el = $("#toast"); el.textContent = t; el.className = "toast" + (mal ? " bad" : ""); el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3200);
};
const vista = id => ["v-login", "v-reset", "v-config", "v-panel"].forEach(v => $("#" + v).hidden = v !== id);

function preguntar(texto, si = "Sí, borrar") {
  return new Promise(res => {
    const d = $("#dlg"); $("#dlg-t").textContent = texto; $("#dlg-si").textContent = si;
    $("#dlg-si").onclick = () => { d.close(); res(true); };
    $("#dlg-no").onclick = () => { d.close(); res(false); };
    d.oncancel = () => res(false);
    d.showModal();
  });
}

/* ---------- cambios sin guardar ---------- */
const firmaTrabajos = l => JSON.stringify(l.map(({ id, titulo, categoria, detalle, foto, visible }) => ({ id, titulo, categoria, detalle, foto, visible })));
function haySucio() { return JSON.stringify(datos) !== JSON.stringify(guardado) || firmaTrabajos(trabajos) !== firmaTrabajos(trabajosGuardados); }
function marcar() {
  const sucio = haySucio();
  const bar = $("#savebar");
  if (bar.dataset.estado !== "guardando" && !(bar.dataset.estado === "ok" && !sucio)) {
    bar.dataset.estado = sucio ? "sucio" : "limpio";
    $("#save-state").textContent = sucio ? "Cambios sin guardar" : "Todo guardado";
  }
  $("#b-guardar").disabled = !sucio || subiendo > 0;
  $("#b-descartar").disabled = !sucio;
  SECCIONES.forEach(s => {
    const b = $(`#tab-${s.id}`); if (!b) return;
    b.classList.toggle("sucio", seccionSucia(s));
  });
  vistaPrevia.enviar();
}
function seccionSucia(s) {
  const claves = [];
  (s.tarjetas || []).forEach(t => { (t.campos || []).forEach(c => (c.fila || [c]).forEach(x => claves.push(x.k))); if (t.foto) claves.push(t.foto); });
  if (s.lista) claves.push(s.lista.k);
  if (claves.some(k => JSON.stringify(leer(datos, k)) !== JSON.stringify(leer(guardado, k)))) return true;
  return s.trabajos ? firmaTrabajos(trabajos) !== firmaTrabajos(trabajosGuardados) : false;
}
window.addEventListener("beforeunload", e => { if (datos && haySucio()) { e.preventDefault(); e.returnValue = ""; } });

/* ---------- dibujar ---------- */
function pintarTabs() {
  $("#tabs").innerHTML = SECCIONES.map(s =>
    `<button type="button" id="tab-${s.id}" aria-current="${s.id === seccion}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[s.id]}</svg><span>${s.nombre}</span><i class="dot" aria-hidden="true"></i></button>`).join("");
  SECCIONES.forEach(s => $(`#tab-${s.id}`).onclick = () => {
    if (seccion === s.id) return;
    seccion = s.id; pintar.animar = true; pintarTabs(); pintar(); vistaPrevia.pagina();
    $("#main").focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "smooth" });
    $(`#tab-${s.id}`).scrollIntoView({ block: "nearest", inline: "center" });
  });
  marcar();
}

function campoHTML(c, valor, id) {
  const v = valor ?? "";
  const ctrl = c.area
    ? `<textarea id="${id}" maxlength="${c.max}" rows="${c.max > 200 ? 5 : 3}">${esc(v)}</textarea>`
    : `<input id="${id}" type="${c.tipo || "text"}" maxlength="${c.max}" value="${esc(v)}"${c.tipo === "tel" ? ' inputmode="numeric"' : ""}>`;
  return `<div class="field" data-campo="${id}">
    <div class="field-top"><label for="${id}">${esc(c.l)}<span class="chip">Editado</span></label><span class="count"><span class="n">${v.length}/${c.max}</span><span class="meter" aria-hidden="true"><b style="--p:${Math.min(100, v.length / c.max * 100)}%"></b></span></span></div>
    ${ctrl}
    ${c.ayuda ? `<p class="help">${esc(c.ayuda)}</p>` : ""}
    <p class="help bad" hidden></p>
  </div>`;
}

function conectarCampo(id, c, obtener, poner) {
  const el = document.getElementById(id); if (!el) return;
  const caja = el.closest(".field"), cuenta = caja.querySelector(".count"), error = caja.querySelector(".help.bad");
  const actualizar = () => {
    let v = el.value;
    if (c.tipo === "tel") { v = v.replace(/\D/g, ""); if (el.value !== v) el.value = v; }
    poner(v);
    cuenta.querySelector(".n").textContent = `${v.length}/${c.max}`;
    cuenta.querySelector(".meter b").style.setProperty("--p", Math.min(100, v.length / c.max * 100) + "%");
    cuenta.classList.toggle("near", v.length >= c.max * 0.9);
    const msg = c.validar && v ? c.validar(v) : true;
    error.hidden = msg === true; error.textContent = msg === true ? "" : msg;
    caja.classList.toggle("cambiado", obtener(guardado) !== v);
    marcar();
  };
  el.addEventListener("input", actualizar);
  caja.classList.toggle("cambiado", obtener(guardado) !== el.value);
}

function tarjetaCampos(t) {
  const filas = t.campos.map(c => c.fila
    ? `<div class="two">${c.fila.map(x => campoHTML(x, leer(datos, x.k), "c-" + x.k.replace(/\./g, "-"))).join("")}</div>`
    : campoHTML(c, leer(datos, c.k), "c-" + c.k.replace(/\./g, "-"))).join("");
  return `<section class="card"><h2>${esc(t.titulo)}</h2>${t.ayuda ? `<p class="muted">${esc(t.ayuda)}</p>` : ""}${filas}</section>`;
}

function tarjetaFoto(t) {
  const url = leer(datos, t.foto) || "";
  return `<section class="card"><h2>${esc(t.titulo)}</h2>
    <div class="photo">
      <div class="thumb" id="th-${t.foto.replace(/\./g, "-")}" style="${url ? `background-image:url('${encodeURI(url)}')` : ""}">${url ? "" : "Sin foto"}</div>
      <div class="photo-actions">
        <span class="btn small file">${url ? "Cambiar foto" : "Subir foto"}<input type="file" accept="image/*" data-foto="${t.foto}" aria-label="Elegir foto"></span>
        ${url ? `<button class="btn small ghost" type="button" data-quitar="${t.foto}">Quitar</button>` : ""}
        <p class="help" style="flex-basis:100%">${esc(t.ayuda || "")}</p>
      </div>
    </div></section>`;
}

function tarjetaLista(L) {
  const arr = leer(datos, L.k) || [];
  const items = arr.map((it, i) => `<div class="item">
      <div class="item-head"><b>${esc(L.nombre)} ${i + 1}</b>
        <div class="tools">
          <button class="icon" type="button" data-mover="${i}" data-dir="-1" aria-label="Subir" ${i === 0 ? "disabled" : ""}>↑</button>
          <button class="icon" type="button" data-mover="${i}" data-dir="1" aria-label="Bajar" ${i === arr.length - 1 ? "disabled" : ""}>↓</button>
          <button class="icon del" type="button" data-borrar="${i}" aria-label="Borrar" ${arr.length <= L.min ? "disabled" : ""}>✕</button>
        </div></div>
      ${L.campos.map(c => campoHTML(c, L.simple ? it : it[c.k], `l-${L.k.replace(/\./g, "-")}-${i}-${c.k || "v"}`)).join("")}
    </div>`).join("");
  return `<section class="card" data-lista="${L.k}">
    ${L.titulo ? `<h2>${esc(L.titulo)}</h2>` : ""}${L.ayuda ? `<p class="muted">${esc(L.ayuda)}</p>` : ""}
    <div class="items">${items}</div>
    ${arr.length < L.max ? `<button class="btn small ghost add" type="button" data-agregar>+ Agregar ${L.nombre.toLowerCase()}</button>` : `<p class="help">Máximo ${L.max}.</p>`}
  </section>`;
}

function conectarLista(L) {
  const card = document.querySelector(`[data-lista="${L.k}"]`); if (!card) return;
  const arr = () => leer(datos, L.k);
  arr().forEach((it, i) => L.campos.forEach(c => {
    const id = `l-${L.k.replace(/\./g, "-")}-${i}-${c.k || "v"}`;
    conectarCampo(id, c,
      o => { const a = leer(o, L.k) || []; return L.simple ? (a[i] ?? "") : (a[i]?.[c.k] ?? ""); },
      v => { if (L.simple) arr()[i] = v; else arr()[i][c.k] = v; });
  }));
  card.querySelectorAll("[data-mover]").forEach(b => b.onclick = () => {
    const i = +b.dataset.mover, j = i + +b.dataset.dir, a = arr();
    [a[i], a[j]] = [a[j], a[i]]; pintar(); marcar();
  });
  card.querySelectorAll("[data-borrar]").forEach(b => b.onclick = async () => {
    if (await preguntar(`¿Borrar ${L.nombre.toLowerCase()} ${+b.dataset.borrar + 1}?`)) { arr().splice(+b.dataset.borrar, 1); pintar(); marcar(); }
  });
  const add = card.querySelector("[data-agregar]");
  if (add) add.onclick = () => {
    arr().push(L.nuevo()); pintar(); marcar();
    document.querySelector(`[data-lista="${L.k}"] .item:last-child`)?.classList.add("nuevo");
    const nuevos = document.querySelectorAll(`[data-lista="${L.k}"] .item`);
    nuevos[nuevos.length - 1]?.querySelector("input,textarea")?.focus();
  };
}

function seccionTrabajos() {
  const tarjetas = trabajos.map((t, i) => `<article class="work${t.visible ? "" : " oculto"}${t.nuevo && !t.foto ? " nuevo" : ""}" style="--i:${i}">
      <div class="pic" style="${t.foto ? `background-image:url('${encodeURI(t.foto)}')` : ""}">
        ${t.foto ? "" : "Sin foto"}
        ${t.visible ? "" : `<span class="badge">Oculto</span>`}
        <span class="btn small file">${t.subiendo ? "Subiendo…" : t.foto ? "Cambiar foto" : "Subir foto"}<input type="file" accept="image/*" data-tfoto="${i}" aria-label="Foto del trabajo ${i + 1}" ${t.subiendo ? "disabled" : ""}></span>
      </div>
      <div class="body">
        ${campoHTML({ l: "Título", max: 40 }, t.titulo, `t-${i}-titulo`)}
        <div class="two">
          <label for="t-${i}-cat">Categoría<select id="t-${i}-cat">${CATEGORIAS.map(([v, n]) => `<option value="${v}" ${t.categoria === v ? "selected" : ""}>${n}</option>`).join("")}</select></label>
          ${campoHTML({ l: "Detalle", max: 30 }, t.detalle, `t-${i}-detalle`)}
        </div>
        <label class="check"><input type="checkbox" id="t-${i}-vis" ${t.visible ? "checked" : ""}> Mostrar en la web</label>
      </div>
      <div class="row-tools">
        <div class="tools">
          <button class="icon" type="button" data-tmover="${i}" data-dir="-1" aria-label="Mover antes" ${i === 0 ? "disabled" : ""}>←</button>
          <button class="icon" type="button" data-tmover="${i}" data-dir="1" aria-label="Mover después" ${i === trabajos.length - 1 ? "disabled" : ""}>→</button>
        </div>
        <button class="icon del" type="button" data-tborrar="${i}" aria-label="Borrar trabajo">✕</button>
      </div>
    </article>`).join("");
  return `<section class="card">
    <div class="field-top"><h2>Trabajos</h2><span class="count">${trabajos.length} cargados</span></div>
    <p class="muted">El orden de acá es el orden de la web. Los 3 primeros aparecen en Inicio.</p>
    <button class="btn solid add" type="button" id="t-nuevo">+ Agregar trabajo</button>
    ${trabajos.length ? `<div class="works">${tarjetas}</div>` : `<div class="empty">Todavía no hay trabajos. Tocá “Agregar trabajo” para subir el primero.</div>`}
  </section>`;
}

function conectarTrabajos() {
  $("#t-nuevo").onclick = () => {
    trabajos.unshift({ id: crypto.randomUUID(), titulo: "", categoria: "color", detalle: "", foto: "", visible: true, nuevo: true });
    pintar(); marcar(); $("#t-0-titulo")?.focus();
  };
  trabajos.forEach((t, i) => {
    const prev = o => (o === guardado ? trabajosGuardados.find(x => x.id === t.id) : t) || {};
    conectarCampo(`t-${i}-titulo`, { max: 40 }, o => prev(o).titulo ?? "", v => t.titulo = v);
    conectarCampo(`t-${i}-detalle`, { max: 30 }, o => prev(o).detalle ?? "", v => t.detalle = v);
    $(`#t-${i}-cat`).onchange = e => { t.categoria = e.target.value; marcar(); };
    $(`#t-${i}-vis`).onchange = e => { t.visible = e.target.checked; pintar(); marcar(); };
  });
  document.querySelectorAll("[data-tmover]").forEach(b => b.onclick = () => {
    const i = +b.dataset.tmover, j = i + +b.dataset.dir;
    [trabajos[i], trabajos[j]] = [trabajos[j], trabajos[i]]; pintar(); marcar();
  });
  document.querySelectorAll("[data-tborrar]").forEach(b => b.onclick = async () => {
    const t = trabajos[+b.dataset.tborrar];
    if (await preguntar(`¿Borrar “${t.titulo || "este trabajo"}”? Se borra también su foto.`)) {
      trabajos.splice(+b.dataset.tborrar, 1); pintar(); marcar();
    }
  });
  document.querySelectorAll("[data-tfoto]").forEach(inp => inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    const t = trabajos[+inp.dataset.tfoto];
    t.subiendo = true; subiendo++; pintar(); marcar();
    try { t.foto = await subirFoto(f, "trabajos"); toast("Foto lista. Acordate de guardar."); }
    catch (e) { toast(e.message || "No se pudo subir la foto.", true); }
    t.subiendo = false; subiendo--; pintar(); marcar();
  });
}

function pintar() {
  const s = SECCIONES.find(x => x.id === seccion);
  let html = `<header class="head"><div class="head-row"><p class="kicker">Editando</p>
      <a href="${s.pagina}" target="_blank" rel="noopener">Abrir la página ↗</a></div>
    <h1>${s.nombre}</h1><span class="tone-line" aria-hidden="true"></span>
    ${s.intro ? `<p>${esc(s.intro)}</p>` : ""}
    <button class="link solo-cel" type="button" id="b-salir-cel">Salir del panel</button></header>`;
  (s.tarjetas || []).forEach(t => html += t.foto ? tarjetaFoto(t) : tarjetaCampos(t));
  if (s.trabajos) html += seccionTrabajos();
  if (s.lista) html += tarjetaLista(s.lista);
  const main = $("#main");
  main.innerHTML = html;
  main.querySelectorAll(":scope > .card").forEach((c, i) => c.style.setProperty("--i", i));
  if (pintar.animar) {
    main.classList.remove("entrando"); void main.offsetWidth; main.classList.add("entrando");
    clearTimeout(pintar.t); pintar.t = setTimeout(() => main.classList.remove("entrando"), 900);
    pintar.animar = false;
  }
  $("#b-salir-cel").onclick = () => $("#b-salir").click();

  (s.tarjetas || []).forEach(t => (t.campos || []).forEach(c => (c.fila || [c]).forEach(x =>
    conectarCampo("c-" + x.k.replace(/\./g, "-"), x, o => leer(o, x.k) ?? "", v => escribir(datos, x.k, v)))));
  if (s.lista) conectarLista(s.lista);
  if (s.trabajos) conectarTrabajos();

  document.querySelectorAll("[data-foto]").forEach(inp => inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    const k = inp.dataset.foto, th = document.getElementById("th-" + k.replace(/\./g, "-"));
    th.textContent = "Subiendo…"; subiendo++; marcar();
    try { escribir(datos, k, await subirFoto(f, "sitio")); toast("Foto lista. Acordate de guardar."); }
    catch (e) { toast(e.message || "No se pudo subir la foto.", true); }
    subiendo--; pintar(); marcar();
  });
  document.querySelectorAll("[data-quitar]").forEach(b => b.onclick = () => { escribir(datos, b.dataset.quitar, ""); pintar(); marcar(); });
}

/* ---------- vista previa en vivo ----------
   Abre la página real dentro del panel y le manda lo que se está escribiendo, sin guardar. */
const vistaPrevia = (() => {
  let lista = false, t = null, dev = "cel", actual = "";
  const DEV = { cel: { w: 390, h: 844 }, pc: { w: 1280, h: 860 } };
  const NOMBRES = { "index.html": "Inicio", "sobre-mi.html": "Sobre mí", "trabajos.html": "Trabajos", "contacto.html": "Contacto" };
  const frame = () => $("#pv-frame");
  // en un servidor solo le habla a la misma web; abierto como archivo local no hay origen fijo
  const destino = () => location.protocol === "file:" ? "*" : location.origin;

  function medir() {
    const stage = $("#pv-stage"), device = $("#device"), f = frame();
    if (!stage || !stage.clientWidth) return;
    const d = DEV[dev], pad = dev === "cel" ? 20 : 12, top = dev === "cel" ? 0 : 20;
    const k = Math.min((stage.clientWidth - 32 - pad) / d.w, (stage.clientHeight - 32 - pad - top) / d.h, 1);
    f.style.width = d.w + "px"; f.style.height = d.h + "px"; f.style.transform = `scale(${k})`;
    device.style.width = d.w * k + pad + "px"; device.style.height = d.h * k + pad + top + "px";
    device.className = "device " + dev + (lista ? "" : " cargando");
  }

  function pagina() {
    const s = SECCIONES.find(x => x.id === seccion);
    if (!s || actual === s.pagina) return;
    actual = s.pagina; lista = false;
    $("#pv-pagina").textContent = "· " + (NOMBRES[s.pagina] || "");
    medir();
    frame().src = s.pagina + "?vista-previa=1";
  }

  function mandarAhora() {
    if (!lista || !datos || !frame().contentWindow) return;
    frame().contentWindow.postMessage({ tipo: "clari-contenido", contenido: clonar(datos), trabajos: clonar(trabajos.filter(x => !x.subiendo)) }, destino());
  }
  function enviar() { clearTimeout(t); t = setTimeout(mandarAhora, 120); }

  function foco(selector) {
    if (!lista || !frame().contentWindow) return;
    frame().contentWindow.postMessage({ tipo: "clari-foco", selector }, destino());
  }

  function iniciar() {
    window.addEventListener("message", e => {
      if (e.source !== frame().contentWindow) return;
      if (e.data?.tipo === "clari-lista") { lista = true; medir(); mandarAhora(); }
    });
    document.querySelectorAll(".seg button").forEach(b => b.onclick = () => {
      dev = b.dataset.dev;
      document.querySelectorAll(".seg button").forEach(o => o.setAttribute("aria-pressed", String(o === b)));
      medir();
    });
    new ResizeObserver(medir).observe($("#pv-stage"));
    $("#pv-abrir").onclick = () => { $("#preview").classList.add("abierta"); requestAnimationFrame(medir); };
    $("#pv-cerrar").onclick = () => $("#preview").classList.remove("abierta");
    document.addEventListener("keydown", e => { if (e.key === "Escape") $("#preview").classList.remove("abierta"); });

    // al tocar un campo, la vista previa va a ese lugar de la página
    $("#main").addEventListener("focusin", e => {
      const id = e.target.id || "";
      let sel = null;
      if (id.startsWith("c-")) {
        const clave = id.slice(2).replace(/-/g, ".");
        sel = clave === "contacto.whatsapp" ? "[data-wa]:not(.wa-top)" : clave === "contacto.instagram" ? "[data-ig]" : `[data-c="${clave}"]`;
      } else if (id.startsWith("l-servicios")) sel = '[data-list="servicios"]';
      else if (id.startsWith("l-resenas")) sel = '[data-list="resenas"]';
      else if (id.startsWith("l-contacto-opciones")) sel = '[data-list="opciones"]';
      else if (id.startsWith("t-")) sel = "#grid";
      else if (e.target.dataset?.foto) sel = `[data-foto="${e.target.dataset.foto}"]`;
      if (sel) foco(sel);
    });
    pagina();
  }
  return { iniciar, enviar, pagina, medir };
})();

/* ---------- fotos: se achican en el navegador antes de subir ---------- */
async function achicar(file, maxLado = 1600) {
  if (!file.type.startsWith("image/")) throw new Error("Ese archivo no es una imagen.");
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bmp) throw new Error("No se pudo leer la imagen. Probá con una JPG o PNG.");
  const k = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, "image/webp", 0.85));
  if (blob && blob.type === "image/webp") return { blob, ext: "webp" };
  return { blob: await new Promise(r => c.toBlob(r, "image/jpeg", 0.86)), ext: "jpg" };
}
async function subirFoto(file, carpeta) {
  const { blob, ext } = await achicar(file);
  const ruta = `${carpeta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("fotos").upload(ruta, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw new Error("No se pudo subir la foto. Revisá la conexión y probá de nuevo.");
  return sb.storage.from("fotos").getPublicUrl(ruta).data.publicUrl;
}
const rutaDeUrl = url => { const m = String(url || "").split("/storage/v1/object/public/fotos/")[1]; return m ? decodeURIComponent(m) : null; };

/* ---------- validar y guardar ---------- */
function validar() {
  const errores = [];
  const wa = String(datos.contacto?.whatsapp || "");
  if (wa && !/^\d{10,15}$/.test(wa)) errores.push(["contacto", "El número de WhatsApp no es válido."]);
  if (trabajos.some(t => t.visible && !t.foto)) errores.push(["trabajos", "Hay trabajos para mostrar sin foto. Subile una foto o destildá “Mostrar en la web”."]);
  if (trabajos.some(t => !t.titulo.trim())) errores.push(["trabajos", "Hay trabajos sin título."]);
  return errores;
}

async function guardar() {
  const errores = validar();
  if (errores.length) {
    seccion = errores[0][0]; pintarTabs(); pintar();
    toast(errores[0][1], true); return;
  }
  const bar = $("#savebar");
  bar.dataset.estado = "guardando"; $("#save-state").textContent = "Guardando…"; $("#b-guardar").disabled = true;
  try {
    // limpiar espacios de más en todos los textos
    const limpio = JSON.parse(JSON.stringify(datos), (k, v) => typeof v === "string" ? v.trim() : v);
    limpio.servicios = (limpio.servicios || []).filter(s => s.titulo);
    limpio.resenas = (limpio.resenas || []).filter(r => r.texto);
    limpio.contacto.opciones = (limpio.contacto.opciones || []).filter(Boolean);

    const r1 = await sb.from("contenido").upsert({ id: "sitio", datos: limpio, actualizado: new Date().toISOString() });
    if (r1.error) throw r1.error;

    const filas = trabajos.map((t, i) => ({ id: t.id, titulo: t.titulo.trim(), categoria: t.categoria, detalle: t.detalle.trim(), foto: t.foto, visible: t.visible, orden: i }));
    if (filas.length) { const r2 = await sb.from("trabajos").upsert(filas); if (r2.error) throw r2.error; }
    const quitados = trabajosGuardados.filter(g => !trabajos.some(t => t.id === g.id));
    if (quitados.length) { const r3 = await sb.from("trabajos").delete().in("id", quitados.map(q => q.id)); if (r3.error) throw r3.error; }

    // fotos que ya no se usan
    const usadas = new Set([limpio.sobre?.foto, ...trabajos.map(t => t.foto)].filter(Boolean));
    const viejas = [guardado.sobre?.foto, ...trabajosGuardados.map(t => t.foto)].filter(u => u && !usadas.has(u)).map(rutaDeUrl).filter(Boolean);
    if (viejas.length) await sb.storage.from("fotos").remove(viejas);

    datos = limpio; guardado = clonar(limpio);
    trabajos.forEach(t => delete t.nuevo);
    trabajosGuardados = clonar(trabajos);
    bar.dataset.estado = "ok";
    $("#save-state").textContent = "Guardado. La web ya está actualizada";
    pintar(); marcar();
    clearTimeout(guardar.t);
    guardar.t = setTimeout(() => { if (bar.dataset.estado === "ok") { bar.dataset.estado = "limpio"; marcar(); } }, 2200);
  } catch (e) {
    console.error(e);
    bar.dataset.estado = "error";
    $("#save-state").textContent = "No se pudo guardar. Revisá la conexión y probá de nuevo.";
    $("#b-guardar").disabled = false;
  }
}

async function descartar() {
  if (!(await preguntar("¿Descartar todos los cambios sin guardar?", "Sí, descartar"))) return;
  datos = clonar(guardado); trabajos = clonar(trabajosGuardados);
  pintar(); marcar();
}

/* ---------- cargar ---------- */
function completar(base, extra) {
  // Toma los textos guardados y rellena lo que falte con los originales
  const out = clonar(base);
  for (const [k, v] of Object.entries(extra || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) out[k] = completar(out[k] || {}, v);
    else if (Array.isArray(v) ? v.length : v !== undefined) out[k] = v;
  }
  return out;
}

async function cargarPanel() {
  $("#main").innerHTML = `<p class="muted">Cargando…</p>`;
  vista("v-panel");
  const [c, t] = await Promise.all([
    sb.from("contenido").select("datos").eq("id", "sitio").maybeSingle(),
    sb.from("trabajos").select("id,titulo,categoria,detalle,foto,visible,orden").order("orden"),
  ]);
  if (c.error || t.error) { $("#main").innerHTML = `<p class="help bad">No se pudo cargar el contenido. Recargá la página.</p>`; return; }
  datos = completar(ORIGINAL, c.data?.datos);
  guardado = clonar(datos);
  trabajos = (t.data || []).map(x => ({ ...x, titulo: x.titulo || "", detalle: x.detalle || "", foto: x.foto || "" }));
  trabajosGuardados = clonar(trabajos);
  pintar.animar = true;
  pintarTabs(); pintar(); marcar();
  if (!cargarPanel.listo) { vistaPrevia.iniciar(); cargarPanel.listo = true; } else vistaPrevia.pagina();
}

async function entrar(session) {
  if (!session) { vista("v-login"); return; }
  const { data: ok, error } = await sb.rpc("es_admin");
  if (error || !ok) {
    await sb.auth.signOut();
    vista("v-login");
    const m = $("#l-msg"); m.className = "msg bad"; m.textContent = "Esta cuenta no tiene permiso para editar la web.";
    return;
  }
  cargarPanel();
}

/* ---------- inicio ---------- */
(async function iniciar() {
  if (!cfg.url || !cfg.key || !window.supabase) { vista("v-config"); return; }
  sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

  let recuperando = false;
  sb.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") { recuperando = true; vista("v-reset"); } });

  $("#f-login").onsubmit = async e => {
    e.preventDefault();
    const m = $("#l-msg"), b = $("#l-btn");
    b.disabled = true; m.className = "msg"; m.textContent = "Entrando…";
    const { data, error } = await sb.auth.signInWithPassword({ email: $("#l-email").value.trim(), password: $("#l-pass").value });
    b.disabled = false;
    if (error) { m.className = "msg bad"; m.textContent = "Mail o contraseña incorrectos."; return; }
    m.textContent = ""; entrar(data.session);
  };
  $("#l-olvide").onclick = async () => {
    const email = $("#l-email").value.trim(), m = $("#l-msg");
    if (!email) { m.className = "msg bad"; m.textContent = "Escribí tu mail arriba y tocá de nuevo."; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split("#")[0] });
    m.className = error ? "msg bad" : "msg ok";
    m.textContent = error ? "No se pudo enviar el mail. Probá en unos minutos." : "Te mandamos un mail para crear una contraseña nueva.";
  };
  $("#f-reset").onsubmit = async e => {
    e.preventDefault();
    const { error } = await sb.auth.updateUser({ password: $("#r-pass").value });
    const m = $("#r-msg");
    if (error) { m.className = "msg bad"; m.textContent = "No se pudo cambiar. Usá al menos 8 caracteres."; return; }
    recuperando = false; toast("Contraseña cambiada."); history.replaceState(null, "", location.pathname);
    entrar((await sb.auth.getSession()).data.session);
  };
  $("#b-salir").onclick = async () => {
    if (haySucio() && !(await preguntar("Tenés cambios sin guardar. ¿Salir igual?", "Salir sin guardar"))) return;
    datos = null; await sb.auth.signOut(); vista("v-login");
  };
  $("#b-guardar").onclick = guardar;
  $("#b-descartar").onclick = descartar;
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && datos) { e.preventDefault(); if (!$("#b-guardar").disabled) guardar(); }
  });

  const { data } = await sb.auth.getSession();
  if (!recuperando) entrar(data.session);
})();
