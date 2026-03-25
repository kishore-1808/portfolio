/* =====================================================
   KISHORE S — PORTFOLIO  |  script.js
   Particle Canvas · HUD · Scroll Animations · Nav
   ===================================================== */

// =====================================================
// 1. CUSTOM CURSOR
// =====================================================
const cursorDot  = document.createElement('div');
const cursorRing = document.createElement('div');
cursorDot.className  = 'cursor-dot';
cursorRing.className = 'cursor-ring';
document.body.appendChild(cursorDot);
document.body.appendChild(cursorRing);

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursor);
})();

// Expand cursor on links / buttons
document.querySelectorAll('a, button, .project-row, .contact-card, .achievement-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing.style.width  = '52px';
    cursorRing.style.height = '52px';
    cursorRing.style.opacity = '1';
    cursorRing.style.borderColor = '#ccff00';
  });
  el.addEventListener('mouseleave', () => {
    cursorRing.style.width  = '32px';
    cursorRing.style.height = '32px';
    cursorRing.style.opacity = '0.6';
    cursorRing.style.borderColor = '#ccff00';
  });
});

// =====================================================
// 2. HUD CLOCK
// =====================================================
function updateClock() {
  const now = new Date();
  const h  = String(now.getHours()).padStart(2, '0');
  const m  = String(now.getMinutes()).padStart(2, '0');
  const s  = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  const el = document.getElementById('hud-clock');
  if (el) el.textContent = `${h}:${m}:${s}:${ms}`;
}
setInterval(updateClock, 16);
updateClock();

// =====================================================
// 3. HUD SCROLL Y
// =====================================================
const hudScroll = document.getElementById('hud-scroll');
window.addEventListener('scroll', () => {
  if (hudScroll) hudScroll.textContent = `SCROLL_Y: ${Math.round(window.scrollY)}`;
}, { passive: true });

// =====================================================
// 4. NAVBAR — SCROLL SOLID
// =====================================================
const navbar = document.getElementById('navbar');
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (sy > 50) navbar.classList.add('scrolled');
  else           navbar.classList.remove('scrolled');
  lastScrollY = sy;
}, { passive: true });

// =====================================================
// 5. MOBILE NAV
// =====================================================
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
navToggle.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  navToggle.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
});
function closeMobileNav() {
  mobileNav.classList.remove('open');
  navToggle.textContent = '☰';
}

// =====================================================
// 6. REVEAL ON SCROLL (Intersection Observer)
// =====================================================
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObserver.observe(el));

// =====================================================
// 7. PARTICLE CANVAS BACKGROUND
// =====================================================
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');

let W, H, particles = [], mouse = { x: null, y: null };
const PARTICLE_COUNT = 140;
const MAX_DIST = 120;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize, { passive: true });

document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
document.addEventListener('mouseleave', () => {
  mouse.x = null; mouse.y = null;
});

// Nebula cloud colors
const nebulaColors = [
  { r:155, g:89, b:182, a:0.6 },  // purple
  { r:88,  g:60, b:160, a:0.5 },  // deep violet
  { r:0,   g:80, b:160, a:0.4 },  // dark blue
  { r:200, g:60, b:180, a:0.35 }, // magenta
];

// draw animated blobs in background
let blobT = 0;
function drawNebula() {
  const blobs = [
    { x: W * 0.72, y: H * 0.25, r: W * 0.28, col: nebulaColors[0] },
    { x: W * 0.15, y: H * 0.65, r: W * 0.2,  col: nebulaColors[2] },
    { x: W * 0.5,  y: H * 0.5,  r: W * 0.22, col: nebulaColors[3] },
    { x: W * 0.85, y: H * 0.75, r: W * 0.18, col: nebulaColors[1] },
  ];
  blobs.forEach((blob, i) => {
    const dx = Math.sin(blobT * 0.0003 + i * 1.7) * W * 0.04;
    const dy = Math.cos(blobT * 0.0004 + i * 2.1) * H * 0.04;
    const grad = ctx.createRadialGradient(
      blob.x + dx, blob.y + dy, 0,
      blob.x + dx, blob.y + dy, blob.r
    );
    const { r, g, b, a } = blob.col;
    grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(blob.x + dx, blob.y + dy, blob.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x  = Math.random() * (W || 1920);
    this.y  = init ? Math.random() * (H || 1080) : (Math.random() * (H || 1080));
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.size = Math.random() * 1.6 + 0.4;
    // colour: mostly lime, some white, some cyan
    const r = Math.random();
    if (r < 0.6)      this.color = `rgba(204,255,0,${Math.random()*0.4+0.3})`;
    else if (r < 0.8) this.color = `rgba(255,255,255,${Math.random()*0.25+0.1})`;
    else              this.color = `rgba(0,212,255,${Math.random()*0.3+0.2})`;
  }
  update() {
    // mouse repulsion
    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 80) {
        const force = (80 - dist) / 80 * 0.8;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }
    // damping
    this.vx *= 0.98; this.vy *= 0.98;
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Init particles
for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

// Draw connections
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < MAX_DIST) {
        const alpha = (1 - d / MAX_DIST) * 0.18;
        ctx.strokeStyle = `rgba(204,255,0,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  blobT++;
  drawNebula();
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

// =====================================================
// 8. ACTIVE NAV SECTION HIGHLIGHT
// =====================================================
const sections    = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + entry.target.id) {
          a.style.color = '#ccff00';
        }
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));

// =====================================================
// 9. PROJECT ROW CLICK — NAVIGATE TO GITHUB
// =====================================================
document.querySelectorAll('.project-row').forEach(row => {
  row.addEventListener('click', () => {
    const link = row.querySelector('.proj-link');
    if (link) window.open(link.href, '_blank');
  });
});

// =====================================================
// 10. TYPING EFFECT ON HERO HANDLE
// =====================================================
const handle = document.querySelector('.hero-handle');
if (handle) {
  const text = handle.textContent;
  handle.textContent = '';
  let i = 0;
  const typeTimer = setInterval(() => {
    handle.textContent += text[i++];
    if (i >= text.length) clearInterval(typeTimer);
  }, 80);
}
