// ===== GRID CANVAS (shared with index) =====
(function() {
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, mouseX = -1000, mouseY = -1000;
  let rafId = null;

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

  function getAccentRGB() {
    const style = getComputedStyle(document.documentElement);
    const hex = style.getPropertyValue('--accent').trim();
    if (hex && hex.startsWith('#')) {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return `${r},${g},${b}`;
    }
    return isDark() ? '20,184,166' : '30,64,175';
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const dark = isDark();
    const accentRGB = getAccentRGB();
    const nodeColor = accentRGB;
    const lineColor = accentRGB;
    const gridColor = dark ? '255,255,255' : '15,23,42';
    const gridAlpha = dark ? 0.025 : 0.035;

    ctx.strokeStyle = `rgba(${gridColor},${gridAlpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 80) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y <= h; y += 80) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > w) { p.x = w; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > h) { p.y = h; p.vy *= -1; }
    }

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
          const force = (1 - dist / MOUSE_DIST) * 0.02;
          p.vx += dx / dist * force;
          p.vy += dy / dist * force;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1) { p.vx /= speed; p.vy /= speed; }
        }
      }
      ctx.fillStyle = `rgba(${nodeColor},0.4)`;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = `rgba(${nodeColor},0.5)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  draw();
})();

// ===== PAGES MAIN SCRIPT =====
(function() {
  gsap.registerPlugin(ScrollTrigger);

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

  // ===== THEME =====
  const savedTheme = localStorage.getItem('promix-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('promix-theme', next);
    });
  }

  // ===== PALETTE SIDEBAR =====
  const paletteTrigger = document.getElementById('palette-trigger');
  const paletteSidebar = document.getElementById('palette-sidebar');
  const paletteClose = document.getElementById('palette-close');
  const paletteSwatches = document.querySelectorAll('.palette-swatch');
  const paletteFontBtns = document.querySelectorAll('.palette-font-btn');
  const paletteTabs = document.querySelectorAll('.palette-tab');
  const paletteTabContents = document.querySelectorAll('.palette-tab-content');

  if (paletteTrigger && paletteSidebar) {
    paletteTrigger.addEventListener('mouseenter', () => {
      paletteSidebar.classList.add('open');
    });
    paletteSidebar.addEventListener('mouseleave', (e) => {
      if (e.clientX >= window.innerWidth - 25) return;
      paletteSidebar.classList.remove('open');
    });
    if (paletteClose) {
      paletteClose.addEventListener('click', () => {
        paletteSidebar.classList.remove('open');
      });
    }

    paletteTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        paletteTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        paletteTabContents.forEach(c => {
          c.classList.toggle('active', c.dataset.tabContent === target);
        });
      });
    });

    paletteSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const palette = swatch.dataset.palette;
        if (palette) {
          document.documentElement.setAttribute('data-palette', palette);
        } else {
          document.documentElement.removeAttribute('data-palette');
        }
        localStorage.setItem('promix-palette', palette);
        paletteSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });

    paletteFontBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const font = btn.dataset.font;
        if (font) {
          document.documentElement.setAttribute('data-font', font);
        } else {
          document.documentElement.removeAttribute('data-font');
        }
        localStorage.setItem('promix-font', font);
        paletteFontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const savedPalette = localStorage.getItem('promix-palette');
    if (savedPalette) {
      document.documentElement.setAttribute('data-palette', savedPalette);
      paletteSwatches.forEach(s => {
        s.classList.toggle('active', s.dataset.palette === savedPalette);
      });
    }

    const savedFont = localStorage.getItem('promix-font');
    if (savedFont) {
      document.documentElement.setAttribute('data-font', savedFont);
      paletteFontBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.font === savedFont);
      });
    }
  }

  // ===== CURSOR GLOW =====
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
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
  }

  // ===== FOOTER TIME =====
  function updateFooterTime() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    const el = document.getElementById('footer-time');
    if (el) el.textContent = t;
  }
  updateFooterTime();
  setInterval(updateFooterTime, 1000);

  // ===== NAVBAR SHRINK ON SCROLL =====
  let navTimer = null;
  const navbar = document.getElementById('navbar');
  if (navbar) {
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
  }

  // ===== GSAP SCROLL ANIMATIONS =====
  // Page hero
  gsap.from('.page-hero-label', { y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
  gsap.from('.page-hero-heading', { y: 60, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
  gsap.from('.page-hero-desc', { y: 40, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' });

  // About hero split
  if (document.querySelector('.about-hero-split')) {
    gsap.from('.about-hero-left', { x: -60, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.about-gradient-orb', { scale: 0.5, opacity: 0, duration: 1.2, delay: 0.4, ease: 'power3.out' });
  }

  // Generic page sections
  gsap.utils.toArray('.page-section').forEach(section => {
    const label = section.querySelector('.page-section-label');
    const heading = section.querySelector('.page-section-heading');
    const body = section.querySelector('.page-section-body');

    if (label) {
      gsap.from(label, {
        y: 30, opacity: 0, duration: 0.6,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true }
      });
    }
    if (heading) {
      gsap.from(heading, {
        x: -80, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true }
      });
    }
    if (body) {
      gsap.from(body, {
        y: 30, opacity: 0, duration: 0.7, delay: 0.15,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true }
      });
    }
  });

  // Animate cards
  gsap.utils.toArray('.value-card, .about-mission-card, .showcase-card, .blog-card, .process-step').forEach((card, i) => {
    gsap.from(card, {
      y: 50, opacity: 0, duration: 0.6,
      delay: (i % 4) * 0.08,
      scrollTrigger: { trigger: card, start: 'top 88%', once: true }
    });
  });

  // ===== ABOUT PAGE — Timeline stagger reveal =====
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      y: 60, opacity: 0, duration: 0.8,
      delay: i * 0.1,
      scrollTrigger: { trigger: item, start: 'top 85%', once: true }
    });
  });

  // Timeline badge glow
  gsap.utils.toArray('.timeline-badge').forEach(badge => {
    gsap.from(badge, {
      scale: 0, opacity: 0, duration: 0.5,
      scrollTrigger: { trigger: badge, start: 'top 85%', once: true }
    });
  });

  // ===== SERVICE ACCORDION (services.html) =====
  const accordion = document.getElementById('service-accordion');
  if (accordion) {
    const items = accordion.querySelectorAll('.service-accordion-item');
    items.forEach(item => {
      const header = item.querySelector('.service-accordion-header');
      const body = item.querySelector('.service-accordion-body');
      const inner = body.querySelector('.service-accordion-body-inner');

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all
        items.forEach(other => {
          other.classList.remove('is-open');
          other.querySelector('.service-accordion-body').style.maxHeight = '0';
        });

        // Open clicked (if was closed)
        if (!isOpen) {
          item.classList.add('is-open');
          body.style.maxHeight = inner.scrollHeight + 40 + 'px';
        }
      });
    });

    // Animate accordion items on scroll
    gsap.utils.toArray('.service-accordion-item').forEach((item, i) => {
      gsap.from(item, {
        x: i % 2 === 0 ? -40 : 40, opacity: 0, duration: 0.7,
        scrollTrigger: { trigger: item, start: 'top 88%', once: true }
      });
    });
  }

  // ===== WORK PAGE FILTER =====
  const filterBtns = document.querySelectorAll('.work-filter-btn');
  const workItems = document.querySelectorAll('.work-bento-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      workItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
          item.style.position = '';
          item.style.width = '';
          item.style.height = '';
          item.style.overflow = '';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Work bento items animation
  gsap.utils.toArray('.work-bento-item').forEach((item) => {
    gsap.from(item, {
      scale: 0.85, opacity: 0, duration: 0.6,
      scrollTrigger: { trigger: item, start: 'top 90%', once: true }
    });
  });

  // ===== CONTACT FORM VALIDATION =====
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const msgEl = document.getElementById('form-message');
      const name = this.querySelector('#cf-name');
      const email = this.querySelector('#cf-email');
      const message = this.querySelector('#cf-message');

      // Clear errors
      if (msgEl) { msgEl.className = 'form-message'; msgEl.style.display = 'none'; }
      this.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      let hasError = false;

      if (!name.value.trim()) { name.classList.add('error'); hasError = true; }
      if (!email.value.trim()) { email.classList.add('error'); hasError = true; }
      if (!message.value.trim()) { message.classList.add('error'); hasError = true; }

      if (hasError) {
        if (msgEl) {
          msgEl.textContent = 'Please fill in all required fields.';
          msgEl.className = 'form-message error';
          msgEl.style.display = 'block';
        }
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) {
        email.classList.add('error');
        if (msgEl) {
          msgEl.textContent = 'Please enter a valid email address.';
          msgEl.className = 'form-message error';
          msgEl.style.display = 'block';
        }
        return;
      }

      // Success
      if (msgEl) {
        msgEl.textContent = 'Thank you! Your message has been sent. We will get back to you soon.';
        msgEl.className = 'form-message success';
        msgEl.style.display = 'block';
      }
      this.reset();
    });
  }

  // ===== TESTIMONIAL CAROUSEL (clients.html) =====
  const carouselTrack = document.getElementById('testimonial-track');
  const carouselDots = document.querySelectorAll('.testimonial-dot');
  if (carouselTrack && carouselDots.length) {
    let currentSlide = 0;
    const slideCount = carouselDots.length;
    let autoInterval = null;

    function goToSlide(index) {
      currentSlide = index;
      carouselTrack.style.transform = `translateX(-${index * 100}%)`;
      carouselDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    carouselDots.forEach(dot => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.slide));
        resetAutoRotate();
      });
    });

    function autoRotate() {
      autoInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % slideCount);
      }, 5000);
    }

    function resetAutoRotate() {
      clearInterval(autoInterval);
      autoRotate();
    }

    autoRotate();
  }

  // ===== STAT NUMBER COUNTING =====
  document.querySelectorAll('.clients-stat-num[data-count], .stat-num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
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

  // ===== PAGE CTA ANIMATION =====
  gsap.utils.toArray('.page-cta-heading').forEach(heading => {
    gsap.from(heading, {
      clipPath: 'inset(100% 0 0 0)', y: 60, opacity: 0, duration: 1.2,
      scrollTrigger: { trigger: heading, start: 'top 80%', end: 'top 40%', scrub: 1 }
    });
  });

  // ===== FOOTER ANIMATIONS =====
  const footerEl = document.getElementById('footer');
  if (footerEl) {
    const ftl = gsap.timeline({
      scrollTrigger: { trigger: '#footer', start: 'top 90%', end: 'top 50%', scrub: 1 }
    });
    ftl.fromTo('.footer-cta-heading', { clipPath: 'inset(100% 0 0 0)', y: 25, opacity: 0 }, { clipPath: 'inset(0% 0 0 0)', y: 0, opacity: 1, duration: 0.4 }, 0);
    ftl.fromTo('.footer-cta-email', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.1);
    ftl.fromTo('.footer-grid-col', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05 }, 0.2);
  }

  // ===== BUTTON TEXT FLIP =====
  document.querySelectorAll('.nav-cta, .cta-btn, .page-cta .cta-btn, .footer-cta-email, .footer-subscribe-form button, .nav-link-wrap a, .form-submit, .coming-soon-btn, .newsletter-form button').forEach(btn => {
    if (btn.querySelector('.btn-flip')) return;
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

  // ===== MOBILE MENU WITH SERVICES ACCORDION =====
  const mobileMenuHTML = `
    <div class="mobile-menu-overlay" id="mobile-menu-overlay" aria-hidden="true">
      <div class="mobile-menu-header">
        <div class="mobile-menu-brand">Pro<em>mix</em></div>
        <button class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">CLOSE</button>
      </div>
      <div class="mobile-menu-nav" role="navigation">
        <ul class="mobile-menu-list">
          <li class="mobile-menu-item">
            <a href="index.html" class="mobile-menu-link"><span>Home</span></a>
          </li>
          <li class="mobile-menu-item">
            <a href="about.html" class="mobile-menu-link"><span>About</span></a>
          </li>
          <li class="mobile-menu-item">
            <div style="display:flex;align-items:center;">
              <a href="services.html" class="mobile-menu-link"><span>Services</span></a>
              <button class="mobile-services-toggle" id="mobile-services-toggle" aria-label="Expand services">+</button>
            </div>
            <div class="mobile-services-accordion" id="mobile-services-accordion">
              <div class="mobile-services-group">
                <div class="mobile-services-group-title">AI Engineering (Featured)</div>
                <a href="coming-soon.html">Machine Learning</a>
                <a href="coming-soon.html">Generative AI</a>
                <a href="coming-soon.html">Intelligent Chatbots</a>
                <a href="coming-soon.html">Computer Vision</a>
                <a href="coming-soon.html">NLP</a>
                <a href="coming-soon.html">Deep Learning</a>
              </div>
              <div class="mobile-services-group">
                <div class="mobile-services-group-title">Data Intelligence &amp; Automation</div>
                <a href="coming-soon.html">Data Governance &amp; Analysis</a>
                <a href="coming-soon.html">Real-time Intelligence</a>
                <a href="coming-soon.html">Scalable Analytics</a>
              </div>
              <div class="mobile-services-group">
                <div class="mobile-services-group-title">Automation &amp; System Integration</div>
                <a href="coming-soon.html">Intelligent Automation</a>
                <a href="coming-soon.html">Multi-system Integration</a>
                <a href="coming-soon.html">Workflow Optimization</a>
              </div>
              <div class="mobile-services-group">
                <div class="mobile-services-group-title">Full-Stack Product Engineering</div>
                <a href="coming-soon.html">Mobile Apps (iOS &amp; Android)</a>
                <a href="coming-soon.html">Web Applications</a>
              </div>
              <div class="mobile-services-group">
                <div class="mobile-services-group-title">Digital Experience</div>
                <a href="coming-soon.html">Digital &amp; Content Marketing</a>
                <a href="coming-soon.html">SEO &amp; SMO Strategy</a>
              </div>
              <div class="mobile-services-group">
                <div class="mobile-services-group-title">Branding &amp; Identity Design</div>
                <a href="coming-soon.html">Brand Identity</a>
                <a href="coming-soon.html">Visual Design</a>
                <a href="coming-soon.html">UI/UX Design</a>
              </div>
            </div>
          </li>
          <li class="mobile-menu-item">
            <a href="work.html" class="mobile-menu-link"><span>Work</span></a>
          </li>
          <li class="mobile-menu-item">
            <a href="clients.html" class="mobile-menu-link"><span>Clients</span></a>
          </li>
          <li class="mobile-menu-item">
            <a href="blog.html" class="mobile-menu-link"><span>Blog</span></a>
          </li>
          <li class="mobile-menu-item">
            <a href="contact.html" class="mobile-menu-link mobile-menu-link--cta"><span>Contact</span></a>
          </li>
        </ul>
      </div>
      <div class="mobile-menu-footer">
        <span>&copy; 2025 Promix</span>
        <div class="mobile-menu-socials">
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="Twitter">TW</a>
          <a href="#" aria-label="LinkedIn">LI</a>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);

  // Services accordion in mobile menu
  const mobileServicesToggle = document.getElementById('mobile-services-toggle');
  const mobileServicesAccordion = document.getElementById('mobile-services-accordion');
  if (mobileServicesToggle && mobileServicesAccordion) {
    mobileServicesToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = mobileServicesAccordion.classList.contains('is-open');
      mobileServicesAccordion.classList.toggle('is-open');
      mobileServicesToggle.classList.toggle('is-open');
    });
  }

  const hamburgerBtn = document.getElementById('nav-hamburger');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  let menuOpen = false;

  function openMobileMenu() {
    menuOpen = true;
    const scrollY = window.scrollY || window.pageYOffset;
    mobileMenuOverlay.style.top = scrollY + 'px';
    mobileMenuOverlay.style.position = 'absolute';
    mobileMenuOverlay.classList.add('is-open');
    mobileMenuOverlay.setAttribute('aria-hidden', 'false');
    if (hamburgerBtn) hamburgerBtn.classList.add('is-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
    lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    menuOpen = false;
    mobileMenuOverlay.classList.remove('is-open');
    mobileMenuOverlay.setAttribute('aria-hidden', 'true');
    if (hamburgerBtn) hamburgerBtn.classList.remove('is-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    lenis.start();
    document.body.style.overflow = '';
    setTimeout(() => {
      mobileMenuOverlay.style.top = '';
      mobileMenuOverlay.style.position = '';
    }, 500);
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (menuOpen) closeMobileMenu();
      else openMobileMenu();
    });
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', e => {
      const link = e.target.closest('.mobile-menu-link');
      if (link) closeMobileMenu();
      // Also close if clicking a service sub-link
      const serviceLink = e.target.closest('.mobile-services-group a');
      if (serviceLink) closeMobileMenu();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) closeMobileMenu();
  });

  // ===== BLOG FEATURED ANIMATION =====
  const blogFeatured = document.querySelector('.blog-featured');
  if (blogFeatured) {
    gsap.from(blogFeatured, {
      y: 60, opacity: 0, duration: 1,
      scrollTrigger: { trigger: blogFeatured, start: 'top 80%', once: true }
    });
  }

  // ===== CONTACT SPLIT ANIMATION =====
  const contactLeft = document.querySelector('.contact-left');
  const contactRight = document.querySelector('.contact-right');
  if (contactLeft) {
    gsap.from(contactLeft, { x: -60, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
  }
  if (contactRight) {
    gsap.from(contactRight, { x: 60, opacity: 0, duration: 1, delay: 0.4, ease: 'power3.out' });
  }

  // ===== SERVICES TAG STRIP ANIMATION =====
  gsap.utils.toArray('.services-tag-strip .stag').forEach((tag, i) => {
    gsap.from(tag, {
      y: 20, opacity: 0, duration: 0.4,
      delay: 0.5 + i * 0.05,
      ease: 'power3.out'
    });
  });

  // ===== COMING SOON ANIMATIONS =====
  if (document.querySelector('.coming-soon-wrap')) {
    gsap.from('.coming-soon-heading', { y: 80, opacity: 0, duration: 1.2, delay: 0.1, ease: 'power3.out' });
    gsap.from('.coming-soon-dots', { scale: 0, opacity: 0, duration: 0.6, delay: 0.5, ease: 'back.out(2)' });
    gsap.from('.coming-soon-msg', { y: 30, opacity: 0, duration: 0.8, delay: 0.7, ease: 'power3.out' });
    gsap.from('.coming-soon-btn', { y: 20, opacity: 0, duration: 0.6, delay: 0.9, ease: 'power3.out' });
  }

})();
