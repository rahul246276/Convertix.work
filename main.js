/* ── CONVERTIX.WORK — Shared JS ── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow ── */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 30);
  });

  /* ── Mobile nav toggle ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks?.classList.remove('open');
    });
  });

  /* ── Active nav link based on current page ── */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Scroll reveal ── */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('up'), parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  /* ── Stagger reveal for grid children ── */
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

  /* ── Counter animation ── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    let started = false;
    const countObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        let start = 0; const duration = 1800;
        const startTime = performance.now();
        const update = (now) => {
          const p = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = eased * target;
          el.textContent = prefix + (target % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(update);
          else el.textContent = prefix + target + suffix;
        };
        requestAnimationFrame(update);
      }
    }, { threshold: 0.5 });
    countObserver.observe(el);
  });

  /* ── Tab component ── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      const target = btn.dataset.tab;
      document.querySelectorAll(`[data-group="${group}"].tab-btn`).forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`[data-group="${group}"].tab-panel`).forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`[data-group="${group}"][data-panel="${target}"]`)?.classList.add('active');
    });
  });

  /* ── Work option select (apply form) ── */
  document.querySelectorAll('.work-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.work-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });

  /* ── Apply form submit ── */
  const applyForm = document.getElementById('applyForm');
  applyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = applyForm.querySelector('.submit-btn');
    const original = btn.textContent;
    btn.textContent = 'Submitting…'; btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✅ Application Sent!';
      document.getElementById('successMsg').style.display = 'block';
      applyForm.reset();
      document.querySelectorAll('.work-opt').forEach((o,i) => o.classList.toggle('active', i === 0));
      setTimeout(() => {
        btn.textContent = original; btn.disabled = false;
        document.getElementById('successMsg').style.display = 'none';
      }, 5000);
    }, 1400);
  });

  /* ── Contact form submit ── */
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    btn.textContent = 'Sending…'; btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✅ Message Sent!';
      document.getElementById('contactSuccess').style.display = 'block';
      contactForm.reset();
      setTimeout(() => { btn.textContent = 'Send Message'; btn.disabled = false; document.getElementById('contactSuccess').style.display = 'none'; }, 5000);
    }, 1200);
  });

});
