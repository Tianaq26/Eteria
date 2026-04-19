/* ============================================================
   ETERIA — script.js
   ============================================================ */

/* ---- NAVEGACIÓN ENTRE SECCIONES ---- */
function showSection(id) {
  // Ocultar todas las secciones
  document.querySelectorAll('.page-section').forEach(s => {
    s.classList.remove('active');
  });

  // Mostrar la sección seleccionada
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  // Buscar el link correspondiente por su onclick
  document.querySelectorAll('.nav-link').forEach(link => {
    const onclick = link.getAttribute('onclick') || '';
    if (onclick.includes(`'${id}'`)) {
      link.classList.add('active');
    }
  });

  // Cerrar menú móvil si está abierto
  const navCollapse = document.getElementById('navbarNav');
  if (navCollapse && navCollapse.classList.contains('show')) {
    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
    if (bsCollapse) bsCollapse.hide();
    document.querySelector('.navbar-toggler')?.classList.add('collapsed');
  }

  // Reanimar barras de estadísticas si es dragones
  if (id === 'dragones') {
    setTimeout(animateStatBars, 400);
  }
}

/* ---- NAVBAR SCROLL ---- */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  // Botón volver arriba
  const btn = document.getElementById('backToTop');
  if (btn) btn.style.display = window.scrollY > 400 ? 'block' : 'none';
});

/* ---- CURSOR PERSONALIZADO ---- */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  }
});

// El ring sigue con suavidad (RAF)
function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Agrandar ring sobre elementos interactivos
document.querySelectorAll('a, button, .world-card, .character-card, .dragon-card-new, .gallery-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursorRing) {
      cursorRing.style.width  = '50px';
      cursorRing.style.height = '50px';
      cursorRing.style.borderColor = 'rgba(232,188,106,0.8)';
    }
  });
  el.addEventListener('mouseleave', () => {
    if (cursorRing) {
      cursorRing.style.width  = '28px';
      cursorRing.style.height = '28px';
      cursorRing.style.borderColor = 'rgba(201,147,58,0.6)';
    }
  });
});

/* ---- PARTÍCULAS ---- */
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;
let particles = [];
let W, H;

function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;
  if (canvas) { canvas.width = W; canvas.height = H; }
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.size  = Math.random() * 2 + 0.5;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = (Math.random() - 0.5) * 0.3 - 0.1;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.7
      ? `rgba(90,180,120,${this.alpha})`   // esmeralda ocasional
      : `rgba(201,147,58,${this.alpha})`;  // dorado
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 80; i++) particles.push(new Particle());
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
resizeCanvas();
initParticles();
animateParticles();

/* ---- FILTROS DE DRAGONES ---- */
function filterDragons(type, btn) {
  // Actualizar botón activo
  document.querySelectorAll('.dragon-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Filtrar tarjetas
  document.querySelectorAll('.dragon-card-new').forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.style.display = '';
      card.style.animation = 'fadeInPage 0.4s ease';
    } else {
      card.style.display = 'none';
    }
  });
}

/* ---- FILTROS DE GALERÍA ---- */
function filterGallery(cat, btn) {
  document.querySelectorAll('.gallery-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.gallery-item').forEach(item => {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.classList.remove('hidden');
      item.style.animation = 'fadeInPage 0.4s ease';
    } else {
      item.classList.add('hidden');
    }
  });
}

/* ---- LIGHTBOX ---- */
let currentLightboxIndex = 0;
let visibleItems = [];

function openLightbox(el) {
  const img     = el.querySelector('img');
  const caption = el.querySelector('.gallery-overlay span');
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lightboxImg');
  const lbCap   = document.getElementById('lightboxCaption');

  if (!lb || !lbImg) return;

  // Construir lista de visibles
  visibleItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  currentLightboxIndex = visibleItems.indexOf(el);

  lbImg.src       = img.src;
  lbCap.textContent = caption ? caption.textContent : '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(dir, e) {
  e.stopPropagation();
  currentLightboxIndex = (currentLightboxIndex + dir + visibleItems.length) % visibleItems.length;
  const item    = visibleItems[currentLightboxIndex];
  const img     = item.querySelector('img');
  const caption = item.querySelector('.gallery-overlay span');
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightboxCaption').textContent = caption ? caption.textContent : '';
}

// Cerrar lightbox con ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeWorldModal();
  }
  if (e.key === 'ArrowRight') lightboxNav(1, e);
  if (e.key === 'ArrowLeft')  lightboxNav(-1, e);
});

/* ---- MODAL DEL MUNDO ---- */
const worldData = {
  valkar: {
    img:   'imgs/nat4.png',
    tag:   'Ciudad Principal',
    title: 'Valkar',
    desc:  'La ciudad principal de Eteria. Hogar del General Arturo, de Sebastián, y punto de partida de toda gran aventura. Sus llanuras están llenas de dragones de todo tipo, y su mercado es el corazón comercial de la isla. Valkar es la joya de Eteria… hasta que Drakmor decide atacarla.'
  },
  skarn: {
    img:   'imgs/nat5.png',
    tag:   'Región Natural',
    title: 'Llanura de Skarn',
    desc:  'Vasta llanura que lleva el nombre de los imponentes dragones Skarn que la habitan. Criaturas enormes, perfectas en combate. Aquí se encuentra el camino que lleva al Santuario. Es también donde Arturo y Sebastián hablan de dragones y de la vida, de camino al gran día.'
  },
  santuario: {
    img:   'imgs/nat1.png',
    tag:   'Lugar Sagrado',
    title: 'El Santuario',
    desc:  'Un lugar sagrado que no aparece en ningún mapa conocido. Solo los domadores y sus compañeros saben encontrarlo. Aquí, los jóvenes eruditos de Eteria tienen la oportunidad de elegir a su primer dragón compañero — un momento que cambia sus vidas para siempre.'
  },
  castillo: {
    img:   'imgs/sabrinafondo1.png',
    tag:   'Castillo Real',
    title: 'Jardín del Castillo',
    desc:  'El hermoso jardín del castillo real, hogar de la princesa Sabrina y del Rey Roan. Entre sus flores y árboles centenarios se han tomado algunas de las decisiones más importantes de la historia de Eteria. También fue aquí donde Sebastián y Sabrina tuvieron esa conversación que ninguno de los dos olvidará.'
  },
  chirripo: {
    img:   'imgs/nat2.png',
    tag:   'Región Montañosa',
    title: 'Monte Chirripó',
    desc:  'En la cima de esta majestuosa montaña vive un sabio anciano que ha estudiado la historia de Eteria durante siglos. Conoce cada dragón, cada región, cada secreto. Arturo le dice a Sebastián que debe visitarlo — especialmente después de lo que le sucede a Valkar.'
  },
  norim: {
    img:   'imgs/nat8.png',
    tag:   'Región del Norte',
    title: 'Norim',
    desc:  'La región del norte de Eteria. Tierra de hielos, nieve y vientos cortantes. Los dragones Alaska — como Nevado — provienen de aquí. Son criaturas raras, poderosas y profundamente ligadas al frío. Norim guarda secretos que ni siquiera el sabio del Chirripó conoce del todo.'
  }
};

function openWorldModal(key) {
  const data  = worldData[key];
  const modal = document.getElementById('worldModal');
  if (!data || !modal) return;

  document.getElementById('worldModalImg').src          = data.img;
  document.getElementById('worldModalTag').textContent  = data.tag;
  document.getElementById('worldModalTitle').textContent = data.title;
  document.getElementById('worldModalDesc').textContent  = data.desc;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWorldModal(e) {
  if (e && e.target !== document.getElementById('worldModal')) return;
  document.getElementById('worldModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---- ANIMAR BARRAS DE STATS ---- */
function animateStatBars() {
  document.querySelectorAll('.stat-fill:not(.mystery-fill)').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 50);
  });
}

/* ---- HERO BG PARALLAX LEVE ---- */
window.addEventListener('mousemove', e => {
  const heroBg = document.getElementById('heroBg');
  if (!heroBg) return;
  const rx = (e.clientX / window.innerWidth  - 0.5) * 3;
  const ry = (e.clientY / window.innerHeight - 0.5) * 3;
  heroBg.style.transform = `scale(1.06) translate(${rx}px, ${ry}px)`;
});

/* ---- INICIALIZACIÓN ---- */
document.addEventListener('DOMContentLoaded', () => {
  showSection('inicio');
});
