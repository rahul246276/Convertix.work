/* ══════════════════════════════════════════════════
   CONVERTIX.WORK — main.js
   EmailJS Service: service_gksw664
══════════════════════════════════════════════════ */

/* EmailJS init */
(function () {
  var KEY = 'aMDt1RooSgJX6vxrh'; // ← replace with your EmailJS public key
  if (typeof emailjs !== 'undefined') { emailjs.init(KEY); }
  else { window.addEventListener('load', function(){ if(typeof emailjs!=='undefined') emailjs.init(KEY); }); }
})();
var EJ_SVC     = 'service_gksw664';
var EJ_APPLY   = 'template_cu1ev6l';
var EJ_CONTACT = 'template_cu1ev6l';

/* ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- MOBILE MENU ---------- */
  var hamburger = document.getElementById('hamburger');
  var navPanel  = document.getElementById('navLinks');
  var overlay   = document.getElementById('navOverlay');
  var closeBtn  = document.getElementById('navMobileClose');

  function openMenu() {
    if (!navPanel) return;
    navPanel.classList.add('open');
    if (overlay)   overlay.classList.add('open');
    if (hamburger) hamburger.classList.add('open');
    document.body.classList.add('nav-open');
  }

  function closeMenu() {
    if (!navPanel) return;
    navPanel.classList.remove('open');
    if (overlay)   overlay.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      navPanel && navPanel.classList.contains('open') ? closeMenu() : openMenu();
    });
  }

  if (overlay)  overlay.addEventListener('click', closeMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  if (navPanel) navPanel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });

  /* ---------- NAVBAR SHADOW ON SCROLL ---------- */
  var navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function(){
    if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* ---------- ACTIVE NAV LINK ---------- */
  var pg = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a){
    if (a.getAttribute('href') === pg) a.classList.add('active');
  });

  /* ---------- SCROLL REVEAL ---------- */
  var revObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var d = parseInt(e.target.dataset.delay||0);
        setTimeout(function(){ e.target.classList.add('up'); }, d);
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function(el){ revObs.observe(el); });

  /* ---------- STAGGER CHILDREN ---------- */
  document.querySelectorAll('.stagger-parent').forEach(function(parent){
    var kids = parent.querySelectorAll('.stagger-child');
    var obs = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){
        kids.forEach(function(c,i){
          setTimeout(function(){ c.style.opacity='1'; c.style.transform='translateY(0)'; }, i*90);
        });
        obs.unobserve(parent);
      }
    }, { threshold: 0.05 });
    kids.forEach(function(c){ c.style.opacity='0'; c.style.transform='translateY(24px)'; c.style.transition='opacity .5s ease,transform .5s ease'; });
    obs.observe(parent);
  });

  /* ---------- COUNTER ANIMATION ---------- */
  document.querySelectorAll('[data-count]').forEach(function(el){
    var target=parseFloat(el.dataset.count), sfx=el.dataset.suffix||'', pfx=el.dataset.prefix||'', started=false;
    var obs=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting && !started){
        started=true;
        var t0=performance.now();
        (function tick(now){
          var p=Math.min((now-t0)/1800,1), v=(1-Math.pow(1-p,3))*target;
          el.textContent=pfx+(target%1===0?Math.floor(v):v.toFixed(1))+sfx;
          if(p<1) requestAnimationFrame(tick); else el.textContent=pfx+target+sfx;
        })(t0);
      }
    }, { threshold:0.5 });
    obs.observe(el);
  });

  /* ---------- TABS ---------- */
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var g=btn.dataset.group, t=btn.dataset.tab;
      document.querySelectorAll('[data-group="'+g+'"].tab-btn').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('[data-group="'+g+'"].tab-panel').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      var panel=document.querySelector('[data-group="'+g+'"][data-panel="'+t+'"]');
      if(panel) panel.classList.add('active');
    });
  });

  /* ---------- WORK OPTION SELECT ---------- */
  window.selectWork = function(el){
    document.querySelectorAll('.work-opt').forEach(function(o){ o.classList.remove('active'); });
    el.classList.add('active');
  };

  /* ---------- PREMIUM MODE ---------- */
  var premBtn=document.getElementById('premiumToggleBtn'), premTxt=document.getElementById('premiumStatusText');
  if(sessionStorage.getItem('premiumMode')==='true'){
    document.body.classList.add('premium-mode');
    if(premBtn){ premBtn.classList.add('active'); premBtn.setAttribute('aria-pressed','true'); }
    if(premTxt) premTxt.textContent='ON — Premium Active';
  }
  if(premBtn) premBtn.addEventListener('click', function(){
    var on=premBtn.classList.toggle('active');
    document.body.classList.toggle('premium-mode',on);
    premBtn.setAttribute('aria-pressed',String(on));
    if(premTxt) premTxt.textContent=on?'ON — Premium Active':'OFF';
    sessionStorage.setItem('premiumMode',String(on));
  });

  /* ---------- MEMBERSHIP PLAN ---------- */
  window.selectMembership = function(card){
    document.querySelectorAll('.membership-card').forEach(function(c){ c.classList.remove('selected'); });
    card.classList.add('selected');
    var inp=document.getElementById('membershipPlanInput'); if(inp) inp.value=card.dataset.plan||'';
    var notice=document.getElementById('membershipNotice');
    if(notice){ notice.style.display='block'; notice.style.animation='none'; notice.offsetHeight; notice.style.animation='fadeSlideIn .35s ease'; }
  };

  /* ---------- EMAIL SENDER ---------- */
  async function sendEmail(payload, tpl){
    if(typeof emailjs==='undefined'){ console.warn('EmailJS not loaded'); return; }
    try {
      await emailjs.send(EJ_SVC, tpl, {
        form_type: payload.formType||'', from_name: payload.name||'', from_email: payload.email||'',
        phone: payload.phone||'N/A', city: payload.city||'N/A', state: payload.state||'N/A',
        job_category: payload.jobCategory||'N/A', work_track: payload.workTrack||'N/A',
        membership_plan: payload.membershipPlan||'None', subject: payload.subject||'Enquiry',
        message: payload.message||'—'
      });
    } catch(err){ console.error('EmailJS error:', err); }
  }

  /* ---------- APPLY FORM ---------- */
  var applyForm=document.getElementById('applyForm');
  if(applyForm) applyForm.addEventListener('submit', async function(e){
    e.preventDefault();
    var btn=applyForm.querySelector('.submit-btn'), orig=btn.textContent;
    btn.textContent='Submitting…'; btn.disabled=true;
    var fd=new FormData(applyForm);
    var work=applyForm.querySelector('.work-opt.active h5')?.textContent||'';
    var plan=document.getElementById('membershipPlanInput')?.value||'None';
    await sendEmail({ formType:'Application Form', name:fd.get('name'), email:fd.get('email'), phone:fd.get('phone'), city:fd.get('city'), state:fd.get('state'), jobCategory:fd.get('job'), workTrack:work, membershipPlan:plan }, EJ_APPLY);
    btn.textContent='✅ Application Sent!';
    var ok=document.getElementById('successMsg'); if(ok) ok.style.display='block';
    applyForm.reset();
    document.querySelectorAll('.work-opt').forEach(function(o,i){ o.classList.toggle('active',i===0); });
    document.querySelectorAll('.membership-card').forEach(function(c){ c.classList.remove('selected'); });
    var n=document.getElementById('membershipNotice'); if(n) n.style.display='none';
    var pi=document.getElementById('membershipPlanInput'); if(pi) pi.value='';
    setTimeout(function(){ btn.textContent=orig; btn.disabled=false; if(ok) ok.style.display='none'; },5000);
  });

  /* ---------- CONTACT FORM ---------- */
  var contactForm=document.getElementById('contactForm');
  if(contactForm) contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    var btn=contactForm.querySelector('.submit-btn');
    btn.textContent='Sending…'; btn.disabled=true;
    var fd=new FormData(contactForm);
    await sendEmail({ formType:'Contact Form', name:fd.get('name'), email:fd.get('email'), phone:fd.get('phone'), subject:fd.get('subject'), message:fd.get('message'), membershipPlan:'N/A' }, EJ_CONTACT);
    btn.textContent='✅ Message Sent!';
    var ok=document.getElementById('contactSuccess'); if(ok) ok.style.display='block';
    contactForm.reset();
    setTimeout(function(){ btn.textContent='Send Message →'; btn.disabled=false; if(ok) ok.style.display='none'; },5000);
  });

});