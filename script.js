// =============================
// BOC Stable Interactions
// =============================
document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('hide'), 500);
  });

  // Mobile nav toggle (guard if elements exist)
  const burger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav-links');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = burger.getAttribute('aria-expanded') === 'true' || false;
      burger.setAttribute('aria-expanded', (!expanded).toString());
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        e.preventDefault();
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nav?.classList.remove('open');
        burger?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Reveal on scroll
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Background canvas: stars + network
  const canvas = document.getElementById('bgCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;
    const stars = [];
    const nodes = [];

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function initParticles() {
      stars.length = 0;
      nodes.length = 0;
      const starCount = Math.max(40, Math.floor((W * H) / 18000));
      const nodeCount = Math.max(20, Math.floor((W * H) / 28000));

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.4,
          s: Math.random() * 0.4 + 0.1,
          a: Math.random() * Math.PI * 2
        });
      }
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Stars (subtle twinkle)
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.a += 0.02;
        const tw = (Math.sin(s.a) + 1) * 0.5; // 0..1
        const r = s.r * (0.6 + tw * 0.6);
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.s * 0.15;
        if (s.y > H + 5) s.y = -5;
      }

      // Network nodes + lines
      const maxDist = 140;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        // Node
        ctx.beginPath();
        ctx.fillStyle = 'rgba(34,211,238,0.8)';
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;
            const grad = ctx.createLinearGradient(n.x, n.y, m.x, m.y);
            grad.addColorStop(0, `rgba(37,99,235,${0.12 * alpha})`);
            grad.addColorStop(1, `rgba(34,211,238,${0.22 * alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    function setup() {
      resize();
      initParticles();
      draw();
    }

    setup();
    window.addEventListener('resize', () => { resize(); initParticles(); });
  }
});


// Verification logic
async function verifyAgent() {
  const input = document.getElementById('username');
  const result = document.getElementById('result');
  if(!input || !result) return;
  const username = input.value.trim().replace(/^@/, '').toLowerCase();
  try {
    const resp = await fetch('agents.json', {cache: 'no-store'});
    const data = await resp.json();
    const list = Array.isArray(data?.verifiedAgents) ? data.verifiedAgents : [];
    const normalized = list.map(x => String(x).trim().replace(/^@/, '').toLowerCase());
    if(normalized.includes(username)){
      result.innerHTML = "✅ This is a <strong>verified agent of BOC</strong>.<br><small>They are partners only and should not be paid directly.</small>";
      result.style.color = "green";
    } else {
      result.innerHTML = "❌ This username is NOT a verified agent of BOC.";
      result.style.color = "red";
    }
  } catch(e){
    result.textContent = "Error loading verification data.";
    result.style.color = "red";
  }
}


// Verification logic with fade-in result
async function verifyAgent() {
  const input = document.getElementById('username');
  const result = document.getElementById('result');
  if(!input || !result) return;
  const username = input.value.trim().replace(/^@/, '').toLowerCase();
  try {
    const resp = await fetch('agents.json', {cache: 'no-store'});
    const data = await resp.json();
    const list = Array.isArray(data?.verifiedAgents) ? data.verifiedAgents : [];
    const normalized = list.map(x => String(x).trim().replace(/^@/, '').toLowerCase());
    result.classList.remove("show");
    if(normalized.includes(username)){
      result.innerHTML = "✅ This is a <strong>verified agent of BOC</strong>.<br><small>They are partners only and should not be paid directly.</small>";
      result.style.color = "lime";
    } else {
      result.innerHTML = "❌ This username is NOT a verified agent of BOC.";
      result.style.color = "red";
    }
    setTimeout(()=> result.classList.add("show"), 50);
  } catch(e){
    result.textContent = "Error loading verification data.";
    result.style.color = "red";
    setTimeout(()=> result.classList.add("show"), 50);
  }
}
