/* ═══════════════════════════════════════
   CONFIGURATION
═══════════════════════════════════════ */
const GITHUB_USERNAME = 'rish2311';

// EmailJS — replace these with your own from emailjs.com (free tier)
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

// Theme-aware background colours used in GSAP scroll transitions
const SCROLL_COLORS = {
  light: { bg: '#fcfaf8', bgAlt: '#000000' },
  dark:  { bg: '#111111', bgAlt: '#0a0a0a' },
};

function getScrollColors() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  return SCROLL_COLORS[theme];
}

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
function revealToSpan() {
  document.querySelectorAll('.reveal').forEach(elem => {
    const parent = document.createElement('span');
    const child  = document.createElement('span');
    parent.classList.add('parent');
    child.classList.add('child');
    child.innerHTML = elem.innerHTML;
    parent.appendChild(child);
    elem.innerHTML = '';
    elem.appendChild(parent);
  });
}

function setInitialValues() {
  gsap.set('#nav a', { y: '-100%', opacity: 0 });
  gsap.set('#home .parent .child', { y: '100%' });

  // SVG stroke animation setup — safe traversal via querySelector
  document.querySelectorAll('#Visual > g').forEach(g => {
    const path = g.querySelector('path, polyline');
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray  = `${len}px`;
    path.style.strokeDashoffset = `${len}px`;
  });
}

/* ═══════════════════════════════════════
   LOCOMOTIVE SCROLL + SCROLL TRIGGER
═══════════════════════════════════════ */
let locoScroll;

function initScroll() {
  gsap.registerPlugin(ScrollTrigger);

  locoScroll = new LocomotiveScroll({
    el: document.querySelector('.main'),
    smooth: true,
  });

  locoScroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy('.main', {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector('.main').style.transform ? 'transform' : 'fixed',
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.refresh();
}

/* ═══════════════════════════════════════
   LOADER ANIMATION
═══════════════════════════════════════ */
function initLoader() {
  const tl = gsap.timeline();

  tl.from('#blackLoader .child span', {
    x: 100, stagger: 0.1, opacity: 0, duration: 1, ease: 'power3.inOut',
  });

  tl.from('#blackLoader #topHeading', {
    x: '-100%', delay: -1, opacity: 0, duration: 1, ease: 'power3.inOut',
  });

  tl.to('#blackLoader .parent .child', {
    y: '-100%', duration: 0.8, ease: 'expo.inOut',
  });

  tl.to('#blackLoader', {
    height: 0, duration: 1, ease: 'expo.inOut',
  });

  tl.to('#greenLoader', {
    height: '100%', top: 0, duration: 1, delay: -1, ease: 'expo.inOut',
  });

  tl.to('#greenLoader', {
    height: '0%', duration: 1.1, delay: -0.6, ease: 'expo.inOut',
  }, 'fadeOut');

  tl.to('.main', {
    backgroundColor: getScrollColors().bg,
    onComplete: runEntranceAnimation,
  }, 'fadeOut');
}

/* ═══════════════════════════════════════
   HOME ENTRANCE (runs once)
═══════════════════════════════════════ */
function runEntranceAnimation() {
  const tl = gsap.timeline();

  tl.to('#nav a', {
    y: 0, opacity: 1, stagger: 0.1, ease: 'expo.inOut',
  });

  tl.to('#home .parent .child', {
    y: 0, stagger: 0.1, duration: 1.5, ease: 'expo.inOut', delay: -0.5,
  });

  tl.to('#Visual > g > g > path, #Visual > g > g > polyline', {
    strokeDashoffset: 0, duration: 2.5,
  });

  registerScrollAnimations();
}

/* ═══════════════════════════════════════
   SCROLL-TRIGGERED BG TRANSITIONS
   (killed & re-registered on theme toggle)
═══════════════════════════════════════ */
let bgScrollTriggers = [];

function registerScrollAnimations() {
  // Kill previous instances before re-registering
  bgScrollTriggers.forEach(st => st.kill());
  bgScrollTriggers = [];

  const { bg, bgAlt } = getScrollColors();

  // Heading parallax
  const home2 = gsap.timeline();
  home2.to('.row .head1', {
    x: -200,
    scrollTrigger: {
      trigger: '.row .head1',
      scroller: '.main',
      start: 'top 25%',
      end: 'top -200%',
      scrub: 1,
    },
  }, 'anim');
  home2.to('.row .head2', {
    x: 200,
    scrollTrigger: {
      trigger: '.row .head1',
      scroller: '.main',
      start: 'top 25%',
      end: 'top -200%',
      scrub: 1,
    },
  }, 'anim');

  // About — background goes dark
  const aboutST = ScrollTrigger.create({
    trigger: '#about',
    scroller: '.main',
    start: 'top 70%',
    end: 'top 0%',
    scrub: 1,
    onUpdate(self) {
      gsap.to('.main', { backgroundColor: self.progress > 0.5 ? bgAlt : bg, overwrite: 'auto' });
      gsap.to('#about',  { opacity: self.progress > 0.5 ? 1 : 0, overwrite: 'auto' });
    },
  });
  bgScrollTriggers.push(aboutST);

  // Skills — background comes back
  const skillsST = ScrollTrigger.create({
    trigger: '#skills',
    scroller: '.main',
    start: 'top 30%',
    end: 'top -50',
    scrub: 1,
    onUpdate(self) {
      gsap.to('.main',   { backgroundColor: self.progress > 0.5 ? bg : bgAlt, overwrite: 'auto' });
      gsap.to('#skills', { opacity: self.progress > 0.5 ? 1 : 0, overwrite: 'auto' });
      gsap.to('#about',  { opacity: self.progress > 0.5 ? 0 : 1, overwrite: 'auto' });
      gsap.to('#circle', {
        rotate: 0, borderColor: '#dadada', overwrite: 'auto',
        ease: 'expo.inOut',
      });
    },
  });
  bgScrollTriggers.push(skillsST);

  // Projects — background goes dark again
  const projST = ScrollTrigger.create({
    trigger: '#projects',
    scroller: '.main',
    start: 'top 60%',
    end: 'top 0%',
    scrub: 1,
    onUpdate(self) {
      gsap.to('.main',     { backgroundColor: self.progress > 0.5 ? bgAlt : bg, overwrite: 'auto' });
      gsap.to('#projects', { opacity: self.progress > 0.5 ? 1 : 0, overwrite: 'auto' });
      gsap.to('#skills',   { opacity: self.progress > 0.5 ? 0 : 1, overwrite: 'auto' });
    },
  });
  bgScrollTriggers.push(projST);
}

/* ═══════════════════════════════════════
   ABOUT — animated elements
═══════════════════════════════════════ */
function initAboutAnimations() {
  gsap.to('.aboutLeft h4', {
    x: 100, color: '#14cf93', duration: 1, repeat: -1, yoyo: true,
  });
  gsap.to('.aboutLeft a', {
    wordSpacing: '0.8vw', duration: 1, repeat: -1, yoyo: true,
  });
}

/* ═══════════════════════════════════════
   SKILLS WHEEL
═══════════════════════════════════════ */
function initSkillsWheel() {
  const active   = 3; // 0-indexed centre stripe
  const navDots  = document.querySelectorAll('.navDots');
  const seconds  = document.querySelectorAll('.second');

  // Highlight default active dot
  gsap.to(navDots[active], { opacity: 0.8, backgroundColor: '#14cf93', height: '3vh', width: '3vh' });
  gsap.to(seconds[active], { opacity: 1 });

  navDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      gsap.to('#circle', { rotate: (3 - index) * 10, ease: 'expo.inOut', duration: 1 });
      gsap.to(navDots, { opacity: 0.15, backgroundColor: 'black', height: '1.5vh', width: '1.5vh' });
      gsap.to(seconds, { opacity: 0.2 });
      gsap.to(navDots[index], { opacity: 0.9, backgroundColor: '#14cf93', height: '3vh', width: '3vh' });
      gsap.to(seconds[index], { opacity: 1, duration: 1 });
    });
  });
}

/* ═══════════════════════════════════════
   PROJECT CURSOR EFFECT
═══════════════════════════════════════ */
function initProjectCursor() {
  const crsr  = document.querySelector('.followCursor');
  const boxes = document.querySelectorAll('.box');

  boxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
      const img = box.getAttribute('data-image');
      crsr.style.width           = '440px';
      crsr.style.height          = '210px';
      crsr.style.borderRadius    = '0';
      crsr.style.backgroundImage = `url(${img})`;
      crsr.style.backgroundSize  = 'cover';
      crsr.style.backgroundRepeat= 'no-repeat';
    });
    box.addEventListener('mouseleave', () => {
      crsr.style.width           = '30px';
      crsr.style.height          = '30px';
      crsr.style.borderRadius    = '50%';
      crsr.style.backgroundImage = 'none';
    });
  });
}

/* ═══════════════════════════════════════
   CURSOR FOLLOW
═══════════════════════════════════════ */
function initCursorFollow() {
  const crsr = document.querySelector('.followCursor');
  document.addEventListener('mousemove', e => {
    crsr.style.left = e.clientX + 20 + 'px';
    crsr.style.top  = e.clientY + 20 + 'px';
  });
}

/* ═══════════════════════════════════════
   FOOTER ANIMATION
═══════════════════════════════════════ */
function initFooterAnimation() {
  const mq = window.matchMedia('(min-width: 768px)');

  function run(x) {
    const unit = x.matches ? 'vw' : 'vh';
    const tl = gsap.timeline();
    tl.to('.firstName h1', {
      fontSize: `5${unit}`, repeat: -1, yoyo: true, stagger: 0.1,
    }, 'name');
    tl.to('.lastName h1', {
      fontSize: `3${unit}`, repeat: -1, yoyo: true, stagger: 0.1,
    }, 'name');
  }

  run(mq);
  mq.addEventListener('change', run);
}

/* ═══════════════════════════════════════
   DARK / LIGHT MODE TOGGLE
═══════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('portfolio-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);

    // Re-register scroll triggers so GSAP uses updated bg colours
    registerScrollAnimations();
    locoScroll.update();
    ScrollTrigger.refresh();
  });
}

/* ═══════════════════════════════════════
   DYNAMIC COPYRIGHT YEAR
═══════════════════════════════════════ */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════
   GITHUB STATS
═══════════════════════════════════════ */
async function fetchGitHubStats() {
  const BASE = 'https://api.github.com';

  function setValue(id, val) {
    const el = document.querySelector(`#${id} .gh-value`);
    if (el) el.textContent = val;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`${BASE}/users/${GITHUB_USERNAME}`),
      fetch(`${BASE}/users/${GITHUB_USERNAME}/repos?per_page=100`),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API error');

    const user  = await userRes.json();
    const repos = await reposRes.json();

    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);

    setValue('gh-repos',     user.public_repos);
    setValue('gh-stars',     totalStars);
    setValue('gh-followers', user.followers);
    setValue('gh-following', user.following);

    // Animate values counting up
    document.querySelectorAll('.gh-value').forEach(el => {
      const target = parseInt(el.textContent, 10);
      if (isNaN(target)) return;
      gsap.from(el, { textContent: 0, duration: 1.5, ease: 'power2.out', snap: { textContent: 1 }, delay: 0.2 });
    });

  } catch (err) {
    console.warn('GitHub stats fetch failed:', err.message);
  }
}

/* ═══════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════ */
function initContactForm() {
  // Initialise EmailJS — replace YOUR_PUBLIC_KEY in the config at the top
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  const form    = document.getElementById('contactForm');
  const submit  = document.getElementById('contactSubmit');
  const errMsg  = document.getElementById('formError');

  const btnText    = submit.querySelector('.btn-text');
  const btnSending = submit.querySelector('.btn-sending');
  const btnSent    = submit.querySelector('.btn-sent');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    // UI: sending state
    submit.disabled    = true;
    btnText.hidden     = true;
    btnSending.hidden  = false;
    errMsg.hidden      = true;

    try {
      if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');

      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);

      btnSending.hidden = true;
      btnSent.hidden    = false;
      form.reset();

      // Reset button after 3s
      setTimeout(() => {
        btnSent.hidden    = true;
        btnText.hidden    = false;
        submit.disabled   = false;
      }, 3000);

    } catch (err) {
      console.error('EmailJS error:', err);
      btnSending.hidden = true;
      btnText.hidden    = false;
      submit.disabled   = false;
      errMsg.hidden     = false;
    }
  });
}

/* ═══════════════════════════════════════
   BOOTSTRAP
═══════════════════════════════════════ */
(function bootstrap() {
  // Set dynamic year immediately
  setYear();

  // Apply saved theme before anything paints
  initTheme();

  // Prepare reveal animation spans
  revealToSpan();

  // Setup Locomotive + ScrollTrigger
  initScroll();

  // Set initial GSAP values, then run loader
  setInitialValues();
  initLoader();

  // Independent initialisations
  initCursorFollow();
  initAboutAnimations();
  initSkillsWheel();
  initProjectCursor();
  initFooterAnimation();
  initThemeToggle();

  // Async — non-blocking
  fetchGitHubStats();
  initContactForm();
})();
