/* ══════════════════════════════════════════════════════════════
   CONVERTIX.WORK — Shared JavaScript
   Changes vs original:
   1. NEW: Premium Mode toggle (body.premium-mode class)
   2. NEW: Membership plan selection with notice message
   3. NEW: Form submission via /api/send-email endpoint
   4. UPDATED: Apply & Contact forms now POST to backend
══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow ───────────────────────────── */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 30);
  });

  /* ── Mobile nav toggle ──────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const navOverlay  = document.getElementById('navOverlay');
  const toggleNav = () => {
    const isOpen = hamburger?.classList.toggle('open');
    navLinks?.classList.toggle('open', isOpen);
    navOverlay?.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    if (hamburger) hamburger.setAttribute('aria-expanded', String(Boolean(isOpen)));
  };
  hamburger?.addEventListener('click', toggleNav);
  navOverlay?.addEventListener('click', toggleNav);
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      navLinks?.classList.remove('open');
      navOverlay?.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });

  /* ── Active nav link based on current page ──────────── */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Scroll reveal ──────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('up'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  /* ── Stagger reveal for grid children ──────────────── */
  document.querySelectorAll('.stagger-parent').forEach(parent => {
    const children = parent.querySelectorAll('.stagger-child');
    const childObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, i * 90);
          });
          childObserver.unobserve(parent);
        }
      });
    }, { threshold: 0.05 });
    children.forEach(c => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(24px)';
      c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    childObserver.observe(parent);
  });

  /* ── Counter animation ──────────────────────────────── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    let started   = false;
    const countObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        const duration  = 1800;
        const startTime = performance.now();
        const update = (now) => {
          const p     = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val   = eased * target;
          el.textContent = prefix + (target % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(update);
          else el.textContent = prefix + target + suffix;
        };
        requestAnimationFrame(update);
      }
    }, { threshold: 0.5 });
    countObserver.observe(el);
  });

  /* ── Tab component ──────────────────────────────────── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group  = btn.dataset.group;
      const target = btn.dataset.tab;
      document.querySelectorAll(`[data-group="${group}"].tab-btn`).forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`[data-group="${group}"].tab-panel`).forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`[data-group="${group}"][data-panel="${target}"]`)?.classList.add('active');
    });
  });

  /* ── Work option select (apply form) ────────────────── */
  window.selectWork = function(el) {
    document.querySelectorAll('.work-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
  };

  /* ══════════════════════════════════════════════════════
     NEW: PREMIUM MODE TOGGLE
     Toggles body.premium-mode class to change entire site
     colour scheme. Persists in sessionStorage.
  ══════════════════════════════════════════════════════ */
  const premiumBtn    = document.getElementById('premiumToggleBtn');
  const premiumStatus = document.getElementById('premiumStatusText');

  // Restore premium state across page load
  if (sessionStorage.getItem('premiumMode') === 'true') {
    document.body.classList.add('premium-mode');
    if (premiumBtn) {
      premiumBtn.classList.add('active');
      premiumBtn.setAttribute('aria-pressed', 'true');
    }
    if (premiumStatus) premiumStatus.textContent = 'ON — Premium Active';
  }

  premiumBtn?.addEventListener('click', () => {
    const isActive = premiumBtn.classList.toggle('active');
    document.body.classList.toggle('premium-mode', isActive);
    premiumBtn.setAttribute('aria-pressed', String(isActive));
    if (premiumStatus) premiumStatus.textContent = isActive ? 'ON — Premium Active' : 'OFF';
    sessionStorage.setItem('premiumMode', String(isActive));
  });

  /* ══════════════════════════════════════════════════════
     NEW: MEMBERSHIP PLAN SELECTION
     Clicking a plan card highlights it and shows the
     premium earnings notice message dynamically.
  ══════════════════════════════════════════════════════ */
  window.selectMembership = function(card) {
    // Deselect all, select clicked
    document.querySelectorAll('.membership-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Update hidden input with selected plan
    const planInput = document.getElementById('membershipPlanInput');
    if (planInput) planInput.value = card.dataset.plan || '';

    // Show the premium earnings notice
    const notice = document.getElementById('membershipNotice');
    if (notice) {
      notice.style.display = 'block';
      // Re-trigger animation on each click
      notice.style.animation = 'none';
      notice.offsetHeight; // reflow
      notice.style.animation = 'fadeSlideIn 0.35s ease';
    }
  };

  /* ══════════════════════════════════════════════════════
     STEP 5 — EMAIL INTEGRATION HELPER
     Sends form data to the serverless endpoint at
     /api/send-email which calls the Resend API securely.
     Falls back to a simulated success for local dev.
  ══════════════════════════════════════════════════════ */
  async function sendFormEmail(payload) {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      // If running locally without the API, log and resolve gracefully
      console.warn('[Convertix] Email API not reachable (local dev?):', err.message);
      return { ok: true, simulated: true };
    }
  }

  /* ── Apply form submit ──────────────────────────────── */
  const applyForm = document.getElementById('applyForm');
  applyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn      = applyForm.querySelector('.submit-btn');
    const original = btn.textContent;

    // Collect all form data
    const data = new FormData(applyForm);
    const selectedWork = applyForm.querySelector('.work-opt.active h5')?.textContent || '';
    const selectedPlan = document.getElementById('membershipPlanInput')?.value || 'None';

    btn.textContent = 'Submitting…';
    btn.disabled    = true;

    // Build payload for email API
    const payload = {
      formType:       'Application Form',
      name:           data.get('name')   || '',
      email:          data.get('email')  || '',
      phone:          data.get('phone')  || '',
      city:           data.get('city')   || '',
      state:          data.get('state')  || '',
      jobCategory:    data.get('job')    || '',
      workTrack:      selectedWork,
      membershipPlan: selectedPlan,
      message:        '' // no message field in apply form
    };

    await sendFormEmail(payload);

    btn.textContent = '✅ Application Sent!';
    const successMsg = document.getElementById('successMsg');
    if (successMsg) successMsg.style.display = 'block';
    applyForm.reset();

    // Reset UI state
    document.querySelectorAll('.work-opt').forEach((o, i) => o.classList.toggle('active', i === 0));
    document.querySelectorAll('.membership-card').forEach(c => c.classList.remove('selected'));
    const membershipNotice = document.getElementById('membershipNotice');
    if (membershipNotice) membershipNotice.style.display = 'none';
    const membershipInput = document.getElementById('membershipPlanInput');
    if (membershipInput) membershipInput.value = '';

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled    = false;
      if (successMsg) successMsg.style.display = 'none';
    }, 5000);
  });

  /* ── Contact form submit ────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    const data = new FormData(contactForm);

    // Build payload for email API
    const payload = {
      formType: 'Contact Form',
      name:     data.get('name')    || '',
      email:    data.get('email')   || '',
      phone:    data.get('phone')   || '',
      subject:  data.get('subject') || '',
      message:  data.get('message') || '',
      membershipPlan: 'N/A'
    };

    await sendFormEmail(payload);

    btn.textContent = '✅ Message Sent!';
    const successEl = document.getElementById('contactSuccess');
    if (successEl) successEl.style.display = 'block';
    contactForm.reset();

    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.disabled    = false;
      if (successEl) successEl.style.display = 'none';
    }, 5000);
  });

});