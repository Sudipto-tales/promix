// ===== GRID CANVAS =====
(function() {
  const canvas = document.getElementById('grid-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, mouseX = -1000, mouseY = -1000;
  let rafId = null;

  // Network config
  const PARTICLE_COUNT = 60;
  const CONNECT_DIST = 150;
  const MOUSE_DIST = 200;
  const SPEED = 0.3;
  let particles = [];

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.5 + 0.5,
      });
    }
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    createParticles();
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const dark = isDark();
    const nodeColor = dark ? '20,184,166' : '30,64,175';
    const lineColor = dark ? '20,184,166' : '30,64,175';
    const gridColor = dark ? '255,255,255' : '15,23,42';
    const gridAlpha = dark ? 0.025 : 0.035;

    // Subtle grid
    ctx.strokeStyle = `rgba(${gridColor},${gridAlpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 80) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y <= h; y += 80) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    // Update particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > w) { p.x = w; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > h) { p.y = h; p.vy *= -1; }
    }

    // Draw connections
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        if (dist < CONNECT_DIST * CONNECT_DIST) {
          const alpha = (1 - Math.sqrt(dist) / CONNECT_DIST) * 0.15;
          ctx.strokeStyle = `rgba(${lineColor},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw mouse connections + push effect
    if (mouseX > -500) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST) {
          const alpha = (1 - dist / MOUSE_DIST) * 0.35;
          ctx.strokeStyle = `rgba(${nodeColor},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mouseX, mouseY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          // Gentle push
          const force = (1 - dist / MOUSE_DIST) * 0.02;
          p.vx += dx / dist * force;
          p.vy += dy / dist * force;
          // Clamp speed
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1) { p.vx /= speed; p.vy /= speed; }
        }
      }

      // Mouse node glow
      ctx.fillStyle = `rgba(${nodeColor},0.4)`;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = `rgba(${nodeColor},0.5)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  window._gridCanvas = {
    start: () => { if (!rafId) draw(); },
    stop: () => { cancelAnimationFrame(rafId); rafId = null; }
  };
})();

// ===== MAIN SCRIPT =====
(function() {
  gsap.registerPlugin(ScrollTrigger);

  // ===== FORCE SCROLL TO TOP ON LOAD =====
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // ===== LENIS SMOOTH SCROLL =====
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Lock scroll during intro
  lenis.stop();
  document.body.style.overflow = 'hidden';

  // ===== GALLERY 3D CARDS =====
  const cardData = [
    { tag: 'Analytics', title: 'Data-Driven Growth', desc: 'Turn raw metrics into actionable strategies' },
    { tag: 'Development', title: 'Custom Software', desc: 'Scalable solutions built for your vision' },
    { tag: 'Marketing', title: 'Brand Strategy', desc: 'Amplify your reach across every channel' },
    { tag: 'Design', title: 'UI/UX Excellence', desc: 'Interfaces that users love to interact with' },
    { tag: 'Strategy', title: 'Business Growth', desc: 'Strategic planning for measurable results' },
    { tag: 'Team', title: 'Collaboration', desc: 'Building synergy across distributed teams' },
    { tag: 'Tech', title: 'Cloud Architecture', desc: 'Modern infrastructure that scales with you' },
    { tag: 'Code', title: 'Full-Stack Dev', desc: 'End-to-end engineering with clean code' },
    { tag: 'Social', title: 'Digital Presence', desc: 'Dominate the social media landscape' },
    { tag: 'Innovation', title: 'Creative Solutions', desc: 'Pushing boundaries with fresh ideas' },
    { tag: 'SEO', title: 'Search Visibility', desc: 'Rank higher and drive organic traffic' },
    { tag: 'Startup', title: 'Launch Fast', desc: 'From MVP to market in record time' },
    { tag: 'Branding', title: 'Visual Identity', desc: 'Logos, colors, and stories that stick' },
    { tag: 'Consulting', title: 'Expert Guidance', desc: 'Navigate complexity with confidence' },
    { tag: 'AI', title: 'Smart Automation', desc: 'Leverage AI to work smarter, not harder' },
    { tag: 'E-Commerce', title: 'Online Sales', desc: 'Convert browsers into loyal customers' },
    { tag: 'Content', title: 'Storytelling', desc: 'Content that connects and converts' },
    { tag: 'Security', title: 'Cyber Defense', desc: 'Protect your digital assets 24/7' },
    { tag: 'Mobile', title: 'App Development', desc: 'Native experiences on every device' },
    { tag: 'Performance', title: 'Speed Matters', desc: 'Blazing fast load times, always' },
  ];
  document.querySelectorAll('.hero-gallery .g-item').forEach((item, i) => {
    const data = cardData[i % cardData.length];
    if (!item.querySelector('.g-card')) {
      const card = document.createElement('div');
      card.className = 'g-card';
      card.innerHTML = `<div class="g-card-tag">${data.tag}</div><div class="g-card-title">${data.title}</div><div class="g-card-desc">${data.desc}</div>`;
      item.appendChild(card);
    }
  });

  // ===== THEME =====
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('promix-theme', next);
  });
  const savedTheme = localStorage.getItem('promix-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  // ===== WORD FLIP =====
  const wordsToRotate = ["Strategy", "Marketing", "Technology", "Growth"];
  let wordIndex = 0;
  function startWordFlip() {
    const inner = document.getElementById('flip-inner');
    const front = document.getElementById('flip-front');
    const back = document.getElementById('flip-back');
    let isFlipped = false;
    setInterval(() => {
      wordIndex = (wordIndex + 1) % wordsToRotate.length;
      const nextWord = wordsToRotate[wordIndex];
      if (!isFlipped) { back.textContent = nextWord; inner.style.transform = 'rotateX(180deg)'; }
      else { front.textContent = nextWord; inner.style.transform = 'rotateX(0deg)'; }
      isFlipped = !isFlipped;
    }, 3000);
  }

  // ===== INTRO SEQUENCE =====
  function startSequence() {
    const gallery = document.getElementById('hero-gallery');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Calculate scale to cover full viewport from gallery's CSS position
    const galleryRect = gallery.getBoundingClientRect();
    const scaleX = (vw * 1.1) / galleryRect.width;
    const scaleY = (vh * 1.3) / galleryRect.height;
    const coverScale = Math.max(scaleX, scaleY);

    const galCenterX = galleryRect.left + galleryRect.width / 2;
    const galCenterY = galleryRect.top + galleryRect.height / 2;
    const offsetX = (vw / 2 - galCenterX);
    const offsetY = (vh / 2 - galCenterY);

    // Pause heavy background elements during intro
    if (window._gridCanvas) window._gridCanvas.stop();
    document.querySelectorAll('.math-shapes').forEach(el => { el.style.display = 'none'; });

    // Set gallery to fullscreen state using only transforms
    gsap.set(gallery, {
      scale: coverScale,
      rotation: 0,
      x: offsetX,
      y: offsetY,
      opacity: 1,
      zIndex: 10001,
      willChange: 'transform',
      maskImage: 'none',
      webkitMaskImage: 'none',
    });

    // Hide 3D tilts and disable glass cards during intro
    const gImgs = gallery.querySelectorAll('.g-item img');
    const gCards = gallery.querySelectorAll('.g-card');
    gsap.set(gImgs, { transform: 'none', borderRadius: '8px' });
    gCards.forEach(c => { c.style.display = 'none'; });

    // Pause CSS scroll animations during intro
    const scrollTracks = gallery.querySelectorAll('.scroll-track, .scroll-track-reverse');
    scrollTracks.forEach(track => {
      track.style.animationPlayState = 'paused';
      track.style.animation = 'none';
    });

    // Allow overflow during intro so items can start off-screen
    const cols = gallery.querySelectorAll('.scroll-col');
    cols.forEach(col => { col.style.overflow = 'visible'; });
    gallery.style.overflow = 'visible';
    const introItems = [];
    cols.forEach(col => {
      const items = col.querySelectorAll('.g-item');
      const topItems = [items[0], items[1]];
      const bottomItems = [items[2], items[3]];
      introItems.push({ topItems, bottomItems });
      gsap.set(topItems, { y: -window.innerHeight, opacity: 0 });
      gsap.set(bottomItems, { y: window.innerHeight, opacity: 0 });
      // Hide the rest (duplicates for loop)
      for (let i = 4; i < items.length; i++) {
        gsap.set(items[i], { opacity: 0 });
      }
    });

    // Text scramble effect
    const preloaderOverlay = document.getElementById('preloader-overlay');
    const preloaderTextEl = document.getElementById('preloader-text');
    const targetWord = 'PROMIX';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let solved = 0;

    preloaderTextEl.textContent = Array.from({ length: targetWord.length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    const scrambleInterval = setInterval(() => {
      let display = '';
      for (let i = 0; i < targetWord.length; i++) {
        if (i < solved) {
          display += targetWord[i];
        } else {
          display += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      preloaderTextEl.textContent = display;
    }, 30);

    const solveInterval = setInterval(() => {
      solved++;
      if (solved >= targetWord.length) {
        clearInterval(scrambleInterval);
        clearInterval(solveInterval);
        preloaderTextEl.textContent = targetWord;
      }
    }, 100);

    const tl = gsap.timeline({ onComplete: () => {
      startWordFlip();
      // Unlock scrolling after intro completes
      lenis.start();
      document.body.style.overflow = '';
    } });

    // Animate top items sliding down and bottom items sliding up to meet
    introItems.forEach(({ topItems, bottomItems }, colIdx) => {
      tl.to(topItems, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
      }, 0.03 * colIdx);
      tl.to(bottomItems, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
      }, 0.03 * colIdx);
    });

    // Brief hold then vanish
    tl.to({}, { duration: 0.3 });

    // Text vanishes then overlay fades
    tl.to(preloaderTextEl, {
      opacity: 0,
      filter: 'blur(20px)',
      letterSpacing: '0.5em',
      duration: 0.7,
      ease: 'power3.in',
    });
    tl.to(preloaderOverlay, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => { preloaderOverlay.style.display = 'none'; }
    }, '-=0.2');

    // Reveal remaining items and start continuous scroll
    tl.add(() => {
      // Restore overflow hidden
      cols.forEach(col => { col.style.overflow = 'hidden'; });
      gallery.style.overflow = '';
      // Show all items
      cols.forEach(col => {
        const items = col.querySelectorAll('.g-item');
        for (let i = 4; i < items.length; i++) {
          gsap.set(items[i], { opacity: 1 });
        }
      });
      // Clear intro transforms and start CSS scroll animations
      gallery.querySelectorAll('.g-item').forEach(item => {
        gsap.set(item, { clearProps: 'y,opacity' });
      });
      scrollTracks.forEach(track => {
        track.style.animation = '';
      });
    }, '-=0.3');

    // Let continuous scroll play fullscreen for a moment
    tl.to({}, { duration: 1.0 });

    // Phase 2: Smoothly animate transform back to identity
    tl.to(gallery, {
      scale: 1,
      rotation: 15,
      x: 0,
      y: 0,
      duration: 2.2,
      ease: 'power3.inOut',
    });

    // Apply mask halfway through the zoom
    tl.add(() => {
      gallery.style.maskImage = 'linear-gradient(to bottom, transparent 2%, black 15%, black 85%, transparent 98%)';
      gallery.style.webkitMaskImage = gallery.style.maskImage;
    }, '-=1.2');

    // Restore everything at the end
    tl.add(() => {
      gsap.set(gallery, { zIndex: 2, willChange: 'auto', clearProps: 'maskImage,webkitMaskImage' });
      document.querySelectorAll('.math-shapes').forEach(el => { el.style.display = ''; });
      if (window._gridCanvas) window._gridCanvas.start();
    });

    // Restore 3D tilts and glass cards
    tl.add(() => {
      gsap.set(gImgs, { clearProps: 'transform,borderRadius' });
      gCards.forEach(c => { c.style.display = ''; });
    }, '-=0.5');

    // Phase 3: Navbar sweeps in during the zoom-out
    tl.set('#navbar', { visibility: 'visible', clipPath: 'inset(0 100% 0 0)', xPercent: -50 }, '-=1.6');
    tl.to('#navbar', { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.inOut' }, '-=1.5');
    tl.to('#main-logo', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
    tl.to('.nav-links a', { y: 0, stagger: 0.08, duration: 0.7, ease: 'power4.out' }, '-=0.5');
    tl.to('#nav-cta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
    tl.to('.theme-toggle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.5');

    // Phase 4: Hero text slides in
    gsap.set('#line1', { x: -120, opacity: 0 });
    gsap.set('#line2', { x: 120, opacity: 0 });
    gsap.set('#line3', { x: -120, opacity: 0 });
    gsap.set('#line4', { x: 120, opacity: 0 });

    tl.to(['#line1', '#line2'], { x: 0, opacity: 1, duration: 1, ease: 'power4.out' }, '-=1');
    tl.to(['#line3', '#line4'], { x: 0, opacity: 1, duration: 1, ease: 'power4.out' }, '-=0.7');
    tl.to('#hero-sub', { opacity: 1, duration: 0.8 }, '-=0.5');
    tl.to('#hero-tagline', { opacity: 1, duration: 0.8 }, '-=0.5');
    tl.to('#scroll-hint', { opacity: 1, duration: 0.8 }, '-=0.3');
  }

  startSequence();

  // Navbar shrink while scrolling, expand when stopped
  let navTimer = null;
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 0,
    onUpdate: () => {
      if (ScrollTrigger.isScrolling()) {
        navbar.classList.add('nav-shrunk');
        clearTimeout(navTimer);
        navTimer = setTimeout(() => {
          navbar.classList.remove('nav-shrunk');
        }, 600);
      }
    }
  });

  // ===== SECTION SCROLL ANIMATIONS =====
  // About section — scroll-scrubbed parallax animations
  const aboutTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#about',
      start: 'top 85%',
      end: 'top 20%',
      scrub: 1,
    }
  });
  aboutTl.from('.about-label', { y: 50, opacity: 0 }, 0);
  aboutTl.fromTo('.about-heading', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'none' }, 0.05);
  aboutTl.from('.about-body', { x: -100, opacity: 0 }, 0.15);
  aboutTl.from('.about-illus-wrap', { x: 80, opacity: 0, scale: 0.85 }, 0.1);

  // Stat boxes — scroll-scrubbed entry
  const statsTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-stats',
      start: 'top 90%',
      end: 'top 40%',
      scrub: 1,
    }
  });
  gsap.utils.toArray('.stat-box').forEach((box, i) => {
    statsTl.from(box, { y: 50, opacity: 0, duration: 0.25 }, i * 0.08);
  });

  // Number counting animation — triggered once when stats enter view
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  statNums.forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: function() {
            el.innerHTML = Math.round(this.targets()[0].val) + '<span>' + suffix + '</span>';
          }
        });
      }
    });
  });

  const termTl = gsap.timeline({
    scrollTrigger: { trigger: '#terminal-section', start: 'top 85%', end: 'top 30%', scrub: 1 }
  });
  termTl.fromTo('.terminal-left .section-label', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0);
  termTl.fromTo('.terminal-left h2', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'none' }, 0.1);
  termTl.fromTo('.terminal-left p', { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.2);
  termTl.fromTo('.terminal-window', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.15);

  let terminalTriggered = false;
  ScrollTrigger.create({
    trigger: '#terminal-section',
    start: 'top 65%',
    once: true,
    onEnter: () => {
      if (terminalTriggered) return;
      terminalTriggered = true;
      document.querySelectorAll('.terminal-line').forEach(line => {
        const delay = parseInt(line.dataset.delay) || 0;
        setTimeout(() => {
          line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          line.style.opacity = '1';
          line.style.transform = 'translateY(0)';
        }, delay);
      });
    }
  });

  // ===== INTERACTIVE FULLSCREEN TERMINAL =====
  const terminalWin = document.getElementById('terminal-window');
  const fsOverlay = document.getElementById('terminal-fs-overlay');
  const fsWin = document.getElementById('terminal-fs-win');
  const fsBody = document.getElementById('terminal-fs-body');
  const fsInput = document.getElementById('terminal-input');
  const fsCloseBtn = document.getElementById('terminal-close');
  let terminalOpen = false;

  const terminalCommands = {
    'help': 'Available commands: whoami, ls marketing/, ls tech/, ls tech-stack/, cat mission.txt, echo $STATUS, services, contact, clear, exit',
    'whoami': 'Promix — Marketing & Technology company since 2020',
    'ls marketing/': 'Brand Strategy / Social Media / SEO & Ads / Content Marketing',
    'ls tech/': 'Websites / Web Apps / Custom Software / E-Commerce',
    'ls tech-stack/': 'React / Next.js / Node.js / Python / Flutter',
    'cat mission.txt': 'Strength in strategy, Power in Progress.\nWe market your brand and build the tech behind it.',
    'echo $status': 'Accepting new clients — let\'s grow your business.',
    'echo $STATUS': 'Accepting new clients — let\'s grow your business.',
    'services': 'Marketing: Brand Strategy, Social Media, SEO & Ads, Content Marketing\nTechnology: Websites, Web Apps, Custom Software, E-Commerce',
    'contact': 'Email: hello@promix.com\nWebsite: promix.com\nReady to work together? Let\'s talk.',
    'date': new Date().toLocaleString(),
    'pwd': '/home/promix',
    'ls': 'marketing/  tech/  tech-stack/  mission.txt  README.md',
    'cat README.md': 'Welcome to Promix.\nWe market your brand and build the tech behind it.\nType "help" for available commands.',
  };

  function openTerminal() {
    if (terminalOpen) return;
    terminalOpen = true;
    lenis.stop();
    document.body.style.overflow = 'hidden';

    // Copy existing terminal content into fullscreen body
    fsBody.innerHTML = document.getElementById('terminal-body').innerHTML;
    // Make all lines visible in fullscreen
    fsBody.querySelectorAll('.terminal-line').forEach(l => {
      l.style.opacity = '1';
      l.style.transform = 'translateY(0)';
    });

    // Get inline terminal position for animation start
    const rect = terminalWin.getBoundingClientRect();
    fsOverlay.classList.add('active');

    gsap.set(fsWin, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: '12px',
    });

    gsap.to(fsWin, {
      top: 0, left: 0, width: '100%', height: '100%',
      borderRadius: 0,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => {
        fsInput.focus();
      }
    });
  }

  function closeTerminal() {
    if (!terminalOpen) return;

    const rect = terminalWin.getBoundingClientRect();

    gsap.to(fsWin, {
      top: rect.top, left: rect.left,
      width: rect.width, height: rect.height,
      borderRadius: '12px',
      duration: 0.5,
      ease: 'power3.inOut',
      onComplete: () => {
        fsOverlay.classList.remove('active');
        fsBody.innerHTML = '';
        terminalOpen = false;
        lenis.start();
        document.body.style.overflow = '';
      }
    });
  }

  terminalWin.addEventListener('click', () => {
    if (!terminalOpen) openTerminal();
  });

  fsCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTerminal();
  });

  function addTerminalOutput(cmd, output) {
    const cmdLine = document.createElement('div');
    cmdLine.className = 'terminal-line';
    cmdLine.style.opacity = '1';
    cmdLine.style.transform = 'translateY(0)';
    cmdLine.innerHTML = `<span class="terminal-prompt">~ $</span> <span class="terminal-cmd">${cmd}</span>`;
    fsBody.appendChild(cmdLine);

    if (output) {
      const outLine = document.createElement('div');
      outLine.className = 'terminal-line';
      outLine.style.opacity = '1';
      outLine.style.transform = 'translateY(0)';
      outLine.innerHTML = `<span class="terminal-output">${output.replace(/\n/g, '<br>')}</span>`;
      fsBody.appendChild(outLine);
    }
    fsBody.scrollTop = fsBody.scrollHeight;
  }

  fsInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const cmd = fsInput.value.trim();
    fsInput.value = '';
    if (!cmd) return;

    if (cmd.toLowerCase() === 'exit') {
      addTerminalOutput(cmd, 'Goodbye!');
      setTimeout(closeTerminal, 400);
      return;
    }

    if (cmd.toLowerCase() === 'clear') {
      fsBody.innerHTML = '';
      return;
    }

    const output = terminalCommands[cmd] || terminalCommands[cmd.toLowerCase()] || `command not found: ${cmd}. Type "help" for available commands.`;
    addTerminalOutput(cmd, output);
  });

  document.querySelectorAll('.service-card').forEach(card => {
    const cardTl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 85%', end: 'top 40%', scrub: 1 }
    });
    const left = card.querySelector('.card-left');
    const right = card.querySelector('.card-right');
    if (left) cardTl.fromTo(left, { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 0);
    if (right) cardTl.fromTo(right, { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 0.1);
  });

  gsap.utils.toArray('.work-item').forEach((item, i) => {
    gsap.fromTo(item,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'none',
        scrollTrigger: { trigger: item, start: 'top 90%', end: 'top 50%', scrub: 1 }
      }
    );
  });

  document.querySelectorAll('.work-item').forEach(item => {
    const img = item.querySelector('.work-cursor-img');
    if (!img) return;
    let imgX = 0, imgY = 0, curX = 0, curY = 0;
    let rafId = null;

    function lerp() {
      imgX += (curX - imgX) * 0.15;
      imgY += (curY - imgY) * 0.15;
      img.style.left = imgX + 'px';
      img.style.top = imgY + 'px';
      rafId = requestAnimationFrame(lerp);
    }

    item.addEventListener('mouseenter', (e) => {
      const rect = item.getBoundingClientRect();
      imgX = e.clientX - rect.left;
      imgY = e.clientY - rect.top;
      curX = imgX;
      curY = imgY;
      rafId = requestAnimationFrame(lerp);
    });

    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      curX = e.clientX - rect.left;
      curY = e.clientY - rect.top;
    });

    item.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
    });
  });

  let testimonialsTriggered = false;
  ScrollTrigger.create({
    trigger: '#testimonials',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      if (testimonialsTriggered) return;
      testimonialsTriggered = true;
      const inner = document.querySelector('.testimonials-inner');
      const innerRect = inner.getBoundingClientRect();
      const centerX = innerRect.width / 2;
      const centerY = innerRect.height / 2;

      document.querySelectorAll('.t-float-card').forEach(card => {
        const delay = parseInt(card.dataset.tdelay) || 0;
        const cardRect = card.getBoundingClientRect();
        const cardCX = cardRect.left - innerRect.left + cardRect.width / 2;
        const cardCY = cardRect.top - innerRect.top + cardRect.height / 2;
        const dx = centerX - cardCX;
        const dy = centerY - cardCY;

        gsap.set(card, { x: dx, y: dy, scale: 0.3, opacity: 0 });
        gsap.to(card, {
          x: 0, y: 0, scale: 1, opacity: 1,
          duration: 0.8, delay: delay / 1000,
          ease: 'back.out(1.4)',
          onComplete: () => {
            card.classList.add('visible');
            gsap.to(card, {
              y: '+=10', duration: 3 + Math.random() * 3,
              repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
          }
        });
      });
      document.querySelectorAll('.t-connector').forEach(c => {
        setTimeout(() => c.classList.add('visible'), 400);
      });

      // Drag-and-snap-back for cards
      document.querySelectorAll('.t-float-card').forEach(card => {
        let isDragging = false, startX, startY, cardX, cardY;
        card.addEventListener('mousedown', e => {
          isDragging = true;
          gsap.killTweensOf(card);
          startX = e.clientX;
          startY = e.clientY;
          const t = gsap.getProperty(card, 'x');
          const ty = gsap.getProperty(card, 'y');
          cardX = typeof t === 'number' ? t : 0;
          cardY = typeof ty === 'number' ? ty : 0;
          card.style.zIndex = 10;
        });
        window.addEventListener('mousemove', e => {
          if (!isDragging) return;
          gsap.set(card, {
            x: cardX + (e.clientX - startX),
            y: cardY + (e.clientY - startY)
          });
        });
        window.addEventListener('mouseup', () => {
          if (!isDragging) return;
          isDragging = false;
          card.style.zIndex = 2;
          gsap.to(card, {
            x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)',
            onComplete: () => {
              gsap.to(card, {
                y: '+=10', duration: 3 + Math.random() * 3,
                repeat: -1, yoyo: true, ease: 'sine.inOut'
              });
            }
          });
        });
      });
    }
  });
  gsap.fromTo('.testimonial-quote',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1,
      scrollTrigger: { trigger: '#testimonials', start: 'top 75%', end: 'top 35%', scrub: 1 }
    }
  );

  // Testimonial carousel
  const testimonials = [
    { text: '"Companies everywhere need great marketing and solid tech, but finding a team that does both is nearly impossible — <em>Promix handles our campaigns and our entire platform, and they nail both every time.</em>"', name: 'Arjun Kapoor', role: 'CEO, NovaPay', initials: 'AK' },
    { text: '"They ran our Instagram and Google Ads while simultaneously rebuilding our website from scratch. <em>Our revenue doubled in 4 months — I didn\'t know one team could move that fast.</em>"', name: 'Sarah Chen', role: 'Founder, GreenLeaf Organics', initials: 'SC' },
    { text: '"We needed a custom dashboard AND a marketing push for our launch. <em>Promix delivered the software on time and the launch campaign brought in 3,000 signups in the first week.</em>"', name: 'Marcus Reid', role: 'CTO, PayFlow', initials: 'MR' }
  ];
  let currentTestimonial = 0;
  const tqText = document.getElementById('tq-text');
  const tqName = document.getElementById('tq-name');
  const tqRole = document.getElementById('tq-role');
  const tqAvatar = document.getElementById('tq-avatar');
  const tDots = document.querySelectorAll('.testimonial-dot');

  function switchTestimonial(idx) {
    if (idx === currentTestimonial) return;
    currentTestimonial = idx;
    const t = testimonials[idx];
    gsap.to('#testimonial-quote', {
      opacity: 0, y: 15, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        tqText.innerHTML = t.text;
        tqName.textContent = t.name;
        tqRole.textContent = t.role;
        tqAvatar.textContent = t.initials;
        gsap.fromTo('#testimonial-quote', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      }
    });
    tDots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  tDots.forEach(dot => { dot.addEventListener('click', () => switchTestimonial(parseInt(dot.dataset.index))); });
  setInterval(() => { switchTestimonial((currentTestimonial + 1) % testimonials.length); }, 6000);

  // Services heading — scrub on scroll
  const svcHeadTl = gsap.timeline({
    scrollTrigger: { trigger: '.services-header', start: 'top 85%', end: 'top 40%', scrub: 1 }
  });
  svcHeadTl.fromTo('.services-heading', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'none' }, 0);
  svcHeadTl.fromTo('.services-desc', { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, 0.2);

  // Approach section — scrub on scroll
  const approachTl = gsap.timeline({
    scrollTrigger: { trigger: '#approach', start: 'top 80%', end: 'top 30%', scrub: 1 }
  });
  approachTl.fromTo('.approach-top h2', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'none' }, 0);
  gsap.utils.toArray('.step').forEach((step, i) => {
    gsap.fromTo(step,
      { rotateX: -90, scaleY: 0, opacity: 0, transformOrigin: 'top center' },
      { rotateX: 0, scaleY: 1, opacity: 1, duration: 0.5, ease: 'none',
        scrollTrigger: { trigger: step, start: 'top 90%', end: 'top 50%', scrub: 1 }
      }
    );
  });

  // CTA heading — scrub on scroll
  gsap.fromTo('.cta-heading',
    { clipPath: 'inset(100% 0 0 0)', y: 60, opacity: 0 },
    { clipPath: 'inset(0% 0 0 0)', y: 0, opacity: 1,
      scrollTrigger: { trigger: '#cta', start: 'top 80%', end: 'top 40%', scrub: 1 }
    }
  );

  const cards = gsap.utils.toArray('.service-card');
  cards.forEach((card, i) => {
    if (i !== cards.length - 1) {
      gsap.to(card, { scale: 0.92, opacity: 0.55, scrollTrigger: { trigger: card, start: 'top top', end: 'bottom top', scrub: true } });
    }
  });

  const footerTl = gsap.timeline({
    scrollTrigger: { trigger: '#footer', start: 'top 90%', end: 'top 50%', scrub: 1 }
  });
  footerTl.fromTo('.footer-cta-heading', { clipPath: 'inset(100% 0 0 0)', y: 25, opacity: 0 }, { clipPath: 'inset(0% 0 0 0)', y: 0, opacity: 1, duration: 0.4 }, 0);
  footerTl.fromTo('.footer-cta-email', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.1);
  footerTl.fromTo('.footer-grid-col', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05 }, 0.2);

  // Footer clock
  function updateFooterTime() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    const el = document.getElementById('footer-time');
    if (el) el.textContent = t;
  }
  updateFooterTime();
  setInterval(updateFooterTime, 1000);



  // ===== CURSOR GLOW =====
  const cursorGlow = document.getElementById('cursor-glow');
  let glowX = 0, glowY = 0, currentX = 0, currentY = 0;
  document.addEventListener('mousemove', (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
    cursorGlow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
  });
  (function animateGlow() {
    currentX += (glowX - currentX) * 0.15;
    currentY += (glowY - currentY) * 0.15;
    cursorGlow.style.left = currentX + 'px';
    cursorGlow.style.top = currentY + 'px';
    requestAnimationFrame(animateGlow);
  })();

  // ===== BUTTON TEXT FLIP =====
  document.querySelectorAll('.nav-cta, .cta-btn, .footer-cta-email, .footer-subscribe-form button, .nav-link-wrap a').forEach(btn => {
    const nodes = [...btn.childNodes];
    let textContent = '';
    const textNodes = [];
    nodes.forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        textContent += n.textContent.trim();
        textNodes.push(n);
      }
    });
    if (!textContent) return;
    const wrapper = document.createElement('span');
    wrapper.className = 'btn-flip';
    const inner = document.createElement('span');
    inner.className = 'btn-flip-text';
    inner.textContent = textContent;
    inner.setAttribute('data-text', textContent);
    wrapper.appendChild(inner);
    textNodes.forEach(n => n.remove());
    btn.insertBefore(wrapper, btn.firstChild);
  });

})();
