/* ==========================================================================
   main.js — Baptism RSVP Site Interactivity
   Requires: GSAP 3 + ScrollTrigger, Lenis, EmailJS SDK (loaded via CDN)
   ========================================================================== */

// ---------------------------------------------------------------------------
// EmailJS Configuration — REPLACE ALL PLACEHOLDER VALUES BEFORE DEPLOYING
// ---------------------------------------------------------------------------
const EMAILJS_PUBLIC_KEY    = 'CwIbVq6Pu3B4JuoE0';
const EMAILJS_SERVICE_ID    = 'service_72o2rro';
const EMAILJS_TEMPLATE_HOST = 'template_e990196';
const EMAILJS_TEMPLATE_GUEST= 'template_cdumo2j';

// ---------------------------------------------------------------------------
// DOMContentLoaded — entry point
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  initSmoothScroll();
  initOpeningAnimation();
  initTabNavigation();
  initAttendanceToggle();
  initRSVPForm();
  initShimmer();
  initAutonomousButterflies();
});

/* ==========================================================================
   1. OPENING ANIMATION SEQUENCE
   ========================================================================== */

function initOpeningAnimation() {
  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Skip animation — reveal page immediately
    revealPageInstant();
    return;
  }

  const butterfly   = document.querySelector('.butterfly');
  const pageContent = document.querySelector('.page-content');
  const overlay     = document.querySelector('.intro-overlay');

  if (!butterfly || !pageContent) {
    revealPageInstant();
    return;
  }

  // Move butterfly out of the overlay so it isn't clipped by the polygon
  document.body.appendChild(butterfly);
  butterfly.style.position = 'fixed';
  butterfly.style.zIndex = '1002';

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Page starts visible but masked by the overlay
  gsap.set(pageContent, { opacity: 1 });

  // The overlay will be "cut away" via a clip-path that expands from the diagonal
  // We track the butterfly's progress (0→1) along the diagonal
  let progress = 0;

  // --- Sparkle canvas ---
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:1001;pointer-events:none;';
  canvas.width  = vw * devicePixelRatio;
  canvas.height = vh * devicePixelRatio;
  canvas.style.width  = vw + 'px';
  canvas.style.height = vh + 'px';
  ctx.scale(devicePixelRatio, devicePixelRatio);
  document.body.appendChild(canvas);

  const particles = [];
  const MAX_PARTICLES = 2000;
  let canvasOpacity = 1;
  let animRunning   = true;

  // The diagonal line: bottom-right → top-left
  // At any point, the butterfly is at (bx, by).
  // Sparkles ripple outward perpendicular to the diagonal from the trail.
  const bflyPos = { x: vw + 100, y: vh + 100, visible: false };

  // Diagonal direction vector (bottom-right to top-left), normalized
  const diagLen = Math.sqrt(vw * vw + vh * vh);
  const dx = -vw / diagLen;  // direction of flight
  const dy = -vh / diagLen;
  // Perpendicular (for ripple direction)
  const px = -dy;
  const py = dx;

  function spawnRippleParticles() {
    // Spawn rate intensifies as butterfly nears the edge (progress → 1)
    const intensity = 6 + Math.floor(progress * 18);
    for (let i = 0; i < intensity; i++) {
      if (particles.length >= MAX_PARTICLES) break;

      // Spawn along the diagonal path near the butterfly, spread along the perpendicular
      const alongPath = (Math.random() - 0.5) * 60;
      const side      = (Math.random() < 0.5 ? 1 : -1);
      const rippleDist = Math.random() * 20;  // initial offset

      const spawnX = bflyPos.x + dx * alongPath + px * side * rippleDist;
      const spawnY = bflyPos.y + dy * alongPath + py * side * rippleDist;

      // Ripple outward perpendicular to the diagonal
      const speed = 1.5 + Math.random() * 3;

      particles.push({
        x:       spawnX,
        y:       spawnY,
        size:    1 + Math.random() * 3.5,
        speedX:  px * side * speed + (Math.random() - 0.5) * 0.5,
        speedY:  py * side * speed + (Math.random() - 0.5) * 0.5,
        life:    1.0,
        decay:   0.006 + Math.random() * 0.01,
        phase:   Math.random() * Math.PI * 2,
        twinkle: 3 + Math.random() * 5,
      });
    }
  }

  const startTime = performance.now();

  function draw(now) {
    const elapsed = (now - startTime) / 1000;
    ctx.clearRect(0, 0, vw, vh);

    if (bflyPos.visible) spawnRippleParticles();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x    += p.speedX;
      p.y    += p.speedY;
      // Slow down over time
      p.speedX *= 0.995;
      p.speedY *= 0.995;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const twinkle = Math.max(0, Math.sin(p.phase + elapsed * p.twinkle));
      const alpha   = p.life * twinkle * canvasOpacity;
      if (alpha < 0.01) continue;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle   = `rgba(188,138,152,${alpha})`;
      ctx.shadowColor = `rgba(188,138,152,${alpha * 0.5})`;
      ctx.shadowBlur  = p.size * 4;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (animRunning || particles.length > 0) {
      requestAnimationFrame(draw);
    } else {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  }

  requestAnimationFrame(draw);

  // --- Overlay clip-path reveal ---
  // The overlay covers the page. As the butterfly moves along the diagonal,
  // we clip the overlay to reveal the page beneath.
  // We use a polygon that "opens" from the bottom-right corner along the diagonal.
  // Gradient goes from top-left (0%) to bottom-right (100%)
  // "to bottom right" in CSS = 135deg
  function updateOverlayClip() {
    const bx = bflyPos.x;
    const by = bflyPos.y;

    // How far the butterfly is from bottom-right, as a fraction of the diagonal
    // 0 = at bottom-right, 1 = at top-left
    const distFromBR = ((vw - bx) + (vh - by)) / (vw + vh);
    // Convert to percentage along the "to bottom right" gradient (0% = top-left, 100% = bottom-right)
    // The cut point is where the butterfly is — we want everything BELOW (bottom-right of) the cut to be transparent
    const cutPct = (1 - distFromBR) * 100;

    overlay.style.maskImage = `linear-gradient(to bottom right,
      black ${cutPct - 3}%,
      rgba(0,0,0,0.5) ${cutPct}%,
      transparent ${cutPct + 3}%)`;
    overlay.style.webkitMaskImage = overlay.style.maskImage;
  }

  // --- Butterfly flight: diagonal from bottom-right to top-left ---
  bflyPos.visible = true;

  const startX = vw + 80;
  const startY = vh + 80;
  const endX   = -120;
  const endY   = -120;

  gsap.set(butterfly, {
    x: startX, y: startY, scale: 1.8, opacity: 1,
    visibility: 'visible',
    transformOrigin: 'center center',
  });

  const flightDuration = 2.5;
  const tl = gsap.timeline();

  tl.to(butterfly, {
    duration: flightDuration,
    ease: 'power1.inOut',
    x: endX,
    y: endY,
    scale: 1,
    onUpdate: function () {
      const rect = butterfly.getBoundingClientRect();
      bflyPos.x = rect.left + rect.width / 2;
      bflyPos.y = rect.top + rect.height / 2;
      progress  = this.progress();
      updateOverlayClip();
    },
    onComplete: () => {
      butterfly.style.display = 'none';
      bflyPos.visible = false;
      if (overlay) {
        overlay.style.maskImage = '';
        overlay.style.webkitMaskImage = '';
        overlay.style.display = 'none';
      }
    },
  });

  // Start hero text fade-in while butterfly is still flying out
  tl.call(() => { initScrollAnimations(); }, [], flightDuration - 0.7);

  // Fade out sparkles concurrent with end of flight
  tl.to({ val: 1 }, {
    val: 0,
    duration: 0.4,
    ease: 'power1.out',
    onUpdate: function () {
      canvasOpacity = this.targets()[0].val;
    },
    onComplete: () => {
      animRunning = false;
    },
  }, flightDuration);
}

// Instant reveal used for reduced-motion or missing elements
function revealPageInstant() {
  const overlay = document.querySelector('.intro-overlay');
  if (overlay) overlay.style.display = 'none';
  initScrollAnimations();
}

/* ==========================================================================
   2. SMOOTH SCROLLING (Lenis + GSAP ticker)
   ========================================================================== */

let lenisInstance = null;

function initSmoothScroll() {
  lenisInstance = new Lenis({ lerp: 0.1, smoothWheel: true });

  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ==========================================================================
   3. TAB NAVIGATION
   ========================================================================== */

function initTabNavigation() {
  const mobileNavItems = document.querySelectorAll('.bottom-nav .nav-item[data-view]');
  const desktopNavLinks = document.querySelectorAll('header .nav-link');
  const views = document.querySelectorAll('.view');

  // Map data-view values to section IDs
  const sectionMap = { intro: 'invitation', info: 'details', rsvp: 'rsvp' };

  // Wire up anchor clicks to Lenis so scrolling is smooth and conflict-free
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target && lenisInstance) {
        lenisInstance.scrollTo(target, { offset: 0 });
      }
    });
  });

  function updateActiveNav() {
    let current = '';
    views.forEach((view) => {
      const rect = view.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) {
        current = view.dataset.view;
      }
    });
    if (current) {
      mobileNavItems.forEach((n) => {
        const isActive = n.dataset.view === current;
        n.classList.toggle('active', isActive);
        if (isActive) {
          n.classList.remove('text-deep-green/60');
          n.classList.add('text-baptism-gold');
        } else {
          n.classList.add('text-deep-green/60');
          n.classList.remove('text-baptism-gold');
        }
      });
      desktopNavLinks.forEach((link) => {
        const href = link.getAttribute('href')?.replace('#', '');
        const isActive = href === sectionMap[current];
        link.classList.toggle('active', isActive);
        if (isActive) {
          link.classList.remove('text-deep-green/60');
          link.classList.add('text-baptism-gold', 'font-bold');
        } else {
          link.classList.add('text-deep-green/60');
          link.classList.remove('text-baptism-gold', 'font-bold');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
}

/* ==========================================================================
   4. SCROLL ANIMATIONS (GSAP ScrollTrigger)
   Called after the opening animation completes.
   ========================================================================== */

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero content — fade in as one block after butterfly exits
  const heroContent = document.querySelector('#invitation .hero-content');
  if (heroContent) {
    gsap.fromTo(heroContent,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
    );
  }

  // Info cards — fade + slide up on scroll
  document.querySelectorAll('.info-card').forEach((card) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 85%' },
      }
    );
  });

  // RSVP heading + subtext
  document.querySelectorAll('.rsvp-heading, .rsvp-subtext').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });

  // RSVP form fields
  document.querySelectorAll('#rsvp-form .form-group').forEach((field) => {
    gsap.fromTo(field,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
        scrollTrigger: { trigger: field, start: 'top 90%' },
      }
    );
  });

  // Submit button
  const btn = document.querySelector('#rsvp-form .btn-primary');
  if (btn) {
    gsap.fromTo(btn,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
        scrollTrigger: { trigger: btn, start: 'top 95%' },
      }
    );
  }
}

/* ==========================================================================
   5. RSVP FORM HANDLING
   ========================================================================== */

// --- Attendance toggle ---
function initAttendanceToggle() {
  const radios          = document.querySelectorAll('input[name="attending"]');
  const guestCountGroup = document.querySelector('.guest-count-group');

  if (!radios.length || !guestCountGroup) return;

  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'yes' && radio.checked) {
        guestCountGroup.classList.remove('hidden');
      } else if (radio.value === 'no' && radio.checked) {
        guestCountGroup.classList.add('hidden');
      }
    });
  });
}

// --- Form submission ---
function initRSVPForm() {
  const form         = document.querySelector('#rsvp-form');
  const submitBtn    = form ? form.querySelector('[type="submit"]') : null;
  const formMessage  = document.querySelector('.form-message');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Collect & validate required fields
    const nameEl      = form.querySelector('[name="name"]');
    const emailEl     = form.querySelector('[name="email"]');
    const attendingEl = form.querySelector('input[name="attending"]:checked');
    const guestsEl    = form.querySelector('[name="guests"]');
    const dietaryEl   = form.querySelector('[name="dietary"]');
    const messageEl   = form.querySelector('[name="message"]');

    if (!nameEl?.value.trim() || !emailEl?.value.trim() || !attendingEl) {
      showFormMessage('error', 'Please fill in all required fields.');
      return;
    }

    const formData = {
      name:     nameEl.value.trim(),
      email:    emailEl.value.trim(),
      attending: attendingEl.value,
      guests:   guestsEl?.value  || '1',
      dietary:  dietaryEl?.value || 'None',
      message:  messageEl?.value || 'No message',
      to_email: emailEl.value.trim(), // for guest auto-reply template
    };

    // 2. Disable submit, show loading state
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    try {
      // 3 & 4. Send host notification
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_HOST, formData);

      // 5. If attending, send guest confirmation
      if (formData.attending === 'yes') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_GUEST, formData);
      }

      // 6. Success
      form.classList.add('hidden');
      showFormMessage('success', 'Thank you for your RSVP!');

    } catch (err) {
      console.error('EmailJS error:', err);
      // 7. Error
      showFormMessage('error', 'Something went wrong. Please try again.');

      // 8. Re-enable submit
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send RSVP';
    }
  });
}

// Helper — show/hide form message banner
function showFormMessage(type, text) {
  // Hide all form messages first
  document.querySelectorAll('.form-message').forEach(el => {
    el.classList.add('hidden');
    el.style.display = 'none';
  });

  let el = document.querySelector(`.form-message.${type}`);
  if (!el) return;

  el.classList.remove('hidden');
  el.style.display = 'block';
  el.textContent = text;

  gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
}

/* ==========================================================================
   6. SHIMMER BACKGROUND
   ========================================================================== */
function initShimmer() {
  const container = document.getElementById('shimmer-container');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'shimmer-particle';
    const size = Math.random() * 3 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
    particle.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
    particle.style.setProperty('--duration', (Math.random() * 10 + 10) + 's');
    particle.style.animationDelay = Math.random() * 20 + 's';
    container.appendChild(particle);
  }
}

/* ==========================================================================
   7. AUTONOMOUS BUTTERFLIES
   ========================================================================== */
function initAutonomousButterflies() {
  const BUTTERFLY_GIF = 'https://i.pinimg.com/originals/a6/03/b2/a603b225534bcedd37ab3e527b68fb55.gif';

  function spawnButterfly() {
    const b = document.createElement('div');
    b.className = 'butterfly-auto';
    const img = document.createElement('img');
    img.src = BUTTERFLY_GIF;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;';
    b.appendChild(img);

    const startX = Math.random() > 0.5 ? -60 : window.innerWidth + 60;
    const startY = Math.random() * window.innerHeight;
    let posX = startX, posY = startY;
    b.style.left = posX + 'px';
    b.style.top = posY + 'px';
    document.body.appendChild(b);

    const speed = 1 + Math.random() * 2;
    // direction: 1 = flying right, -1 = flying left
    const direction = startX < 0 ? 1 : -1;
    let angle = (Math.random() - 0.5) * Math.PI / 4;
    let time = 0;

    function fly() {
      time += 0.05;
      posX += speed * Math.cos(angle) * direction;
      posY += speed * Math.sin(angle) + Math.sin(time * 2) * 2;
      angle += (Math.random() - 0.5) * 0.06;

      // Flip image horizontally if flying right (direction === 1)
      const flipX = direction === 1 ? -1 : 1;
      b.style.transform = `translate(-50%,-50%) scaleX(${flipX})`;
      b.style.left = posX + 'px';
      b.style.top = posY + 'px';

      if (posX < -120 || posX > window.innerWidth + 120 || posY < -120 || posY > window.innerHeight + 120) {
        b.remove();
      } else {
        requestAnimationFrame(fly);
      }
    }
    fly();
    setTimeout(spawnButterfly, 8000 + Math.random() * 10000);
  }
  setTimeout(spawnButterfly, 6000);
  setTimeout(spawnButterfly, 14000);
}
