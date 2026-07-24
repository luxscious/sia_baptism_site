/* ==========================================================================
   main.js — Baptism RSVP Site Interactivity
   Requires: GSAP 3 + ScrollTrigger, Lenis, EmailJS SDK (loaded via CDN)
   ========================================================================== */

// ---------------------------------------------------------------------------
// EmailJS Configuration — REPLACE ALL PLACEHOLDER VALUES BEFORE DEPLOYING
// ---------------------------------------------------------------------------
const EMAILJS_PUBLIC_KEY    = 'YOUR_PUBLIC_KEY';       // TODO: Replace with your EmailJS public key
const EMAILJS_SERVICE_ID    = 'YOUR_SERVICE_ID';       // TODO: Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_HOST = 'YOUR_HOST_TEMPLATE_ID'; // TODO: Replace with host notification template ID
const EMAILJS_TEMPLATE_GUEST= 'YOUR_GUEST_TEMPLATE_ID';// TODO: Replace with guest auto-reply template ID

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
      initScrollAnimations();
    },
  });

  // Fade out sparkles after flight
  tl.to({ val: 1 }, {
    val: 0,
    duration: 1.5,
    ease: 'power1.out',
    onUpdate: function () {
      canvasOpacity = this.targets()[0].val;
    },
    onComplete: () => {
      animRunning = false;
      if (overlay) overlay.style.display = 'none';
      overlay.style.maskImage = '';
      overlay.style.webkitMaskImage = '';
    },
  }, flightDuration - 0.3);
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

function initSmoothScroll() {
  const lenis = new Lenis();

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ==========================================================================
   3. TAB NAVIGATION
   ========================================================================== */

function initTabNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-view]');

  if (!navItems.length) return;

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetView = item.dataset.view;

      // Update active state on nav
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');

      // Scroll to the section
      const targetEl = document.getElementById(targetView);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Update active nav item based on scroll position
  const views = document.querySelectorAll('.view');
  window.addEventListener('scroll', () => {
    let current = '';
    views.forEach((view) => {
      const rect = view.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) {
        current = view.id;
      }
    });
    if (current) {
      navItems.forEach((n) => {
        n.classList.toggle('active', n.dataset.view === current);
      });
    }
  });
}

/* ==========================================================================
   4. SCROLL ANIMATIONS (GSAP ScrollTrigger)
   Called after the opening animation completes.
   ========================================================================== */

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero text — play immediately (already in view)
  const heroItems = document.querySelectorAll('#intro .hero-content > *');
  if (heroItems.length) {
    gsap.fromTo(heroItems,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
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
      form.style.display = 'none';
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
  // Try a shared .form-message element first, then type-specific ones
  let el = document.querySelector(`.form-message.${type}`);
  if (!el) el = document.querySelector('.form-message');
  if (!el) {
    // Create one dynamically if the HTML doesn't include it
    el = document.createElement('p');
    el.className = `form-message ${type}`;
    const form = document.querySelector('#rsvp-form');
    if (form) form.parentNode.insertBefore(el, form.nextSibling);
  }

  // Reset classes and set the correct state
  el.classList.remove('success', 'error', 'hidden');
  el.classList.add(type);
  el.textContent = text;
  el.style.display = 'block';

  // Animate in
  gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
}
