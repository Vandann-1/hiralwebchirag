/**
 * HIRAL & CHIRAG ROYAL WEDDING INVITATION — JAVASCRIPT ENGINE
 * Proper Red Velvet Envelope + Clean Manual Card Navigation (No Auto Clutter)
 */

(function () {
  'use strict';

  const TOTAL_SCENES = 6;
  let currentScene = 1;
  let isEnvelopeOpen = false;
  let isTransitioning = false;
  let autoTimer = null;
  const AUTO_ADVANCE_DELAY = 4000; // 4 seconds auto per scene

  let touchStartX = 0;
  let touchStartY = 0;

  // DOM Elements
  const appContainer = document.getElementById('invitation-app');
  const envelopeScreen = document.getElementById('royal-envelope-screen');
  const envelopeTopFlap = document.getElementById('envelope-top-flap');
  const envelopeSlidingCard = document.getElementById('envelope-sliding-card');
  const envelopeBadgeTrigger = document.getElementById('envelope-badge-trigger');
  const envelopeTapPill = document.getElementById('envelope-tap-pill');

  const cardsStage = document.getElementById('cards-stage-container');
  const cardSlides = document.querySelectorAll('.invitation-card-slide');
  const btnPrevCard = document.getElementById('btn-prev-card');
  const btnNextCard = document.getElementById('btn-next-card');

  const btnReplay = document.getElementById('btn-replay-envelope');
  const btnCalendar = document.getElementById('btn-download-ics');
  const btnMaps = document.getElementById('btn-open-location');
  const btnShare = document.getElementById('btn-share-invite');

  // Audio Elements
  const audioEl = document.getElementById('wedding-audio');
  const minimalMusicBtn = document.getElementById('minimal-music-btn');
  const musicBars = document.getElementById('music-bars');

  // AUDIO MANAGER
  class WeddingAudioManager {
    constructor() {
      this.audio = audioEl;
      this.isPlaying = false;
      this.synthContext = null;
      this.synthActive = false;
      if (this.audio) this.audio.volume = 0.65;
    }

    start() {
      if (this.isPlaying) return;
      if (this.audio) {
        const p = this.audio.play();
        if (p !== undefined) {
          p.then(() => this.setPlayingState(true))
           .catch(() => {
             this.startAmbientSynth();
             this.setPlayingState(true);
           });
        }
      } else {
        this.startAmbientSynth();
        this.setPlayingState(true);
      }
    }

    toggle() {
      if (this.isPlaying) this.pause();
      else this.play();
    }

    play() {
      if (this.synthActive) {
        if (this.synthContext && this.synthContext.state === 'suspended') {
          this.synthContext.resume();
        }
        this.setPlayingState(true);
        return;
      }
      if (this.audio) {
        this.audio.play()
          .then(() => this.setPlayingState(true))
          .catch(() => {
            this.startAmbientSynth();
            this.setPlayingState(true);
          });
      }
    }

    pause() {
      if (this.audio) this.audio.pause();
      if (this.synthContext && this.synthContext.state === 'running') {
        this.synthContext.suspend();
      }
      this.setPlayingState(false);
    }

    setPlayingState(playing) {
      this.isPlaying = playing;
      if (musicBars) {
        if (playing) {
          musicBars.classList.remove('is-muted');
          musicBars.classList.add('is-playing');
        } else {
          musicBars.classList.remove('is-playing');
          musicBars.classList.add('is-muted');
        }
      }
    }

    startAmbientSynth() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.synthContext = new AudioCtx();
        const ctx = this.synthContext;
        this.synthActive = true;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
        masterGain.connect(ctx.destination);

        // Tanpura Root & Fifth Drones (C# Indian tuning)
        const notes = [138.59, 207.65, 277.18, 415.30];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.2 + idx * 0.1, ctx.currentTime);
          lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();

          gain.gain.setValueAtTime(0.04 / (idx + 1), ctx.currentTime);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();
        });
      } catch (e) {
        console.warn('Web Audio synth fallback error:', e);
      }
    }
  }

  const audioManager = new WeddingAudioManager();

  // OPEN ENVELOPE HANDLER
  function handleOpenEnvelope() {
    if (isEnvelopeOpen) return;
    envelopeScreen.classList.add('is-opening');
    if (envelopeTopFlap) envelopeTopFlap.classList.add('flap-folded-open');
    if (envelopeSlidingCard) envelopeSlidingCard.classList.add('card-slides-up');
    if (envelopeBadgeTrigger) envelopeBadgeTrigger.classList.add('badge-activated');
    if (envelopeTapPill) envelopeTapPill.style.display = 'none';

    audioManager.start();

    setTimeout(() => {
      isEnvelopeOpen = true;
      envelopeScreen.style.display = 'none';
      if (cardsStage) cardsStage.style.display = 'flex';
      goToScene(1);
    }, 1400);
  }

  // REPLAY INVITATION (RETURNS TO ENVELOPE)
  function handleReplayInvitation() {
    if (autoTimer) clearTimeout(autoTimer);
    isEnvelopeOpen = false;
    currentScene = 1;
    if (cardsStage) cardsStage.style.display = 'none';
    if (envelopeScreen) {
      envelopeScreen.style.display = 'flex';
      envelopeScreen.classList.remove('is-opening');
    }
    if (envelopeTopFlap) envelopeTopFlap.classList.remove('flap-folded-open');
    if (envelopeSlidingCard) envelopeSlidingCard.classList.remove('card-slides-up');
    if (envelopeBadgeTrigger) envelopeBadgeTrigger.classList.remove('badge-activated');
    if (envelopeTapPill) envelopeTapPill.style.display = 'flex';
    if (fireworksActive) stopFireworks();
  }

  // 4 SECONDS AUTOMATIC SCENE PROGRESSION ("4, 4 auto all those")
  function resetAutoTimer() {
    if (autoTimer) clearTimeout(autoTimer);
    if (!isEnvelopeOpen || currentScene >= TOTAL_SCENES) return;
    autoTimer = setTimeout(() => {
      handleNext();
    }, AUTO_ADVANCE_DELAY);
  }

  // CARD NAVIGATION
  function goToScene(targetIndex) {
    if (isTransitioning) return;
    if (targetIndex < 1 || targetIndex > TOTAL_SCENES) return;

    isTransitioning = true;
    currentScene = targetIndex;

    cardSlides.forEach((slide) => {
      const idx = parseInt(slide.dataset.scene, 10);
      slide.classList.remove('slide-active', 'slide-past', 'slide-future');
      if (idx === currentScene) {
        slide.classList.add('slide-active');
      } else if (idx < currentScene) {
        slide.classList.add('slide-past');
      } else {
        slide.classList.add('slide-future');
      }
    });

    // Update Arrows visibility
    if (btnPrevCard) btnPrevCard.style.display = currentScene > 1 ? 'flex' : 'none';
    if (btnNextCard) btnNextCard.style.display = currentScene < TOTAL_SCENES ? 'flex' : 'none';

    // Fireworks on Scene 6
    if (currentScene === 6) {
      startFireworks();
    } else {
      stopFireworks();
    }

    resetAutoTimer();

    setTimeout(() => {
      isTransitioning = false;
    }, 550);
  }

  function handlePrev() {
    if (currentScene > 1) goToScene(currentScene - 1);
  }

  function handleNext() {
    if (currentScene < TOTAL_SCENES) goToScene(currentScene + 1);
  }

  // SCREEN TAP (Left 40% = Prev, Right 60% = Next)
  function handleScreenTap(e) {
    if (!isEnvelopeOpen) return;
    if (e.target.closest('.interactive-action') || e.target.closest('.minimal-music-btn') || e.target.closest('.minimal-nav-arrow') || e.target.closest('.top-dot')) {
      return;
    }

    const rect = appContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX < rect.width * 0.4) {
      handlePrev();
    } else {
      handleNext();
    }
  }

  // CALENDAR (.ics) DOWNLOAD
  function handleDownloadCalendar(e) {
    if (e) e.stopPropagation();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hiral and Chirag Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:ganesh-stapan-20270211@hiralxchirag.wedding',
      'DTSTART:20270211T023000Z',
      'DTEND:20270211T033000Z',
      'SUMMARY:Ganesh Stapan — Hiral & Chirag Wedding',
      'LOCATION:Residence, Laxmipura, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:haldi-ceremony-20270211@hiralxchirag.wedding',
      'DTSTART:20270211T053000Z',
      'DTEND:20270211T073000Z',
      'SUMMARY:Haldi Ceremony — Hiral & Chirag Wedding',
      'LOCATION:Residence Laxmipura, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:mameru-20270211@hiralxchirag.wedding',
      'DTSTART:20270211T094500Z',
      'DTEND:20270211T123000Z',
      'SUMMARY:Mameru — Hiral & Chirag Wedding',
      'LOCATION:Residence Laxmipura, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:hast-milap-20270212@hiralxchirag.wedding',
      'DTSTART:20270212T063000Z',
      'DTEND:20270212T080000Z',
      'SUMMARY:Hast Milap / Lagan — Hiral & Chirag Wedding',
      'LOCATION:Brahmin Samaj Vadi, Village Laxmipura, Taluka Khedbrahma, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Hiral_and_Chirag_Wedding_Events.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // GOOGLE MAPS
  function handleOpenMaps(e) {
    if (e) e.stopPropagation();
    const venueQuery = encodeURIComponent('Laxmipura, Khedbrahma, Gujarat');
    window.open(`https://www.google.com/maps/search/?api=1&query=${venueQuery}`, '_blank');
  }

  // WHATSAPP SHARE
  function handleShareWhatsApp(e) {
    if (e) e.stopPropagation();
    const shareText = encodeURIComponent(
      '✨ Royal Wedding Invitation ✨\n\n' +
      'Together with the blessings of our families, we joyfully invite you to celebrate the wedding of\n' +
      '👑 HIRAL & CHIRAGKUMAR 👑\n\n' +
      '📅 11th & 12th February 2027\n' +
      '📍 Laxmipura, Khedbrahma, Gujarat\n\n' +
      'Click to open our royal invitation envelope:\n' +
      window.location.href
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  }

  // GOLD DUST PARTICLES CANVAS
  const particleCanvas = document.getElementById('particle-canvas');
  let pCtx = null;
  let particles = [];
  let pAnimationId = null;

  function initParticles() {
    if (!particleCanvas) return;
    pCtx = particleCanvas.getContext('2d');
    resizeCanvas(particleCanvas);

    particles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        radius: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2,
        alpha: Math.random() * 0.6 + 0.3,
        alphaDir: Math.random() > 0.5 ? 0.008 : -0.008,
      });
    }

    function renderParticles() {
      if (!pCtx) return;
      pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir;
        if (p.alpha <= 0.1 || p.alpha >= 0.8) p.alphaDir = -p.alphaDir;

        if (p.y < -10) {
          p.y = particleCanvas.height + 10;
          p.x = Math.random() * particleCanvas.width;
        }

        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(255, 230, 150, ${p.alpha})`;
        pCtx.shadowBlur = 6;
        pCtx.shadowColor = 'rgba(212, 175, 55, 0.7)';
        pCtx.fill();
      });

      pAnimationId = requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  // FIREWORKS CANVAS FOR SCENE 6 (FOUNTAINS + SKY BURSTS + STAR GLINTS)
  let fireworksCanvas = document.getElementById('fireworks-canvas');
  let fCtx = null;
  let burstParticles = [];
  let fountainParticles = [];
  let starGlints = [];
  let fAnimationId = null;
  let fireworksActive = false;
  let lastBurstTime = 0;

  const GOLD_PALETTE = ['#FFFFFF', '#FFF8DB', '#FFE58F', '#FFD700', '#FFA940', '#FF7A45', '#FF4D4F'];

  function resizeCanvas(canvas) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    }
  }

  function createSkyBurst(originX, originY) {
    const count = 50;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4.2 + 1.2;
      const color = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
      burstParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.016 + 0.014,
        size: Math.random() * 2.2 + 1.2,
        gravity: 0.048,
      });
    }
  }

  function addStarGlint(x, y) {
    starGlints.push({
      x: x,
      y: y,
      size: Math.random() * 6 + 4,
      alpha: 0,
      maxAlpha: Math.random() * 0.6 + 0.4,
      alphaSpeed: Math.random() * 0.04 + 0.02,
      rotation: Math.random() * Math.PI,
    });
  }

  function drawStar(ctx, x, y, r, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FFD700';

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(Math.cos((i * Math.PI) / 2) * r, Math.sin((i * Math.PI) / 2) * r);
      ctx.lineTo(
        Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (r * 0.22),
        Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (r * 0.22)
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function startFireworks() {
    fireworksCanvas = document.getElementById('fireworks-canvas');
    if (!fireworksCanvas) return;
    fCtx = fireworksCanvas.getContext('2d');
    resizeCanvas(fireworksCanvas);
    fireworksActive = true;
    burstParticles = [];
    fountainParticles = [];
    starGlints = [];
    lastBurstTime = Date.now();

    const w = fireworksCanvas.getBoundingClientRect().width;
    const h = fireworksCanvas.getBoundingClientRect().height;
    setTimeout(() => {
      createSkyBurst(w * 0.2, h * 0.12);
      createSkyBurst(w * 0.8, h * 0.14);
    }, 200);

    function renderFireworks() {
      if (!fireworksActive || !fCtx) return;
      const rect = fireworksCanvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Crystal clear transparent canvas over photo
      fCtx.clearRect(0, 0, width, height);
      fCtx.globalCompositeOperation = 'lighter';

      const now = Date.now();

      // 1. VERTICAL SPARKLER FOUNTAINS (LEFT & RIGHT)
      const fountainXPositions = [width * 0.10, width * 0.90];
      const fountainBaseY = height * 0.78;

      fountainXPositions.forEach((fx) => {
        const emitCount = 5;
        for (let k = 0; k < emitCount; k++) {
          const spawnX = fx + (Math.random() - 0.5) * (width * 0.05);
          const spawnY = fountainBaseY - Math.random() * (height * 0.35);
          const upwardSpeed = -(Math.random() * 5 + 4);
          const horizontalDrift = (Math.random() - 0.5) * 1.8;
          const color = GOLD_PALETTE[Math.floor(Math.random() * (GOLD_PALETTE.length - 1))];

          fountainParticles.push({
            x: spawnX,
            y: spawnY,
            vx: horizontalDrift,
            vy: upwardSpeed,
            color: color,
            alpha: Math.random() * 0.6 + 0.4,
            decay: Math.random() * 0.04 + 0.03,
            size: Math.random() * 2.2 + 0.9,
            gravity: 0.12,
          });
        }

        if (Math.random() < 0.08) {
          addStarGlint(fx + (Math.random() - 0.5) * 20, height * (0.15 + Math.random() * 0.4));
        }
      });

      // Update fountains
      for (let i = fountainParticles.length - 1; i >= 0; i--) {
        const sp = fountainParticles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += sp.gravity;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0 || sp.y > height) {
          fountainParticles.splice(i, 1);
          continue;
        }

        fCtx.beginPath();
        fCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        fCtx.fillStyle = sp.color;
        fCtx.globalAlpha = sp.alpha;
        fCtx.shadowBlur = 6;
        fCtx.shadowColor = '#FFD700';
        fCtx.fill();
      }

      // 2. PERIODIC SKY BURSTS
      if (now - lastBurstTime > 1500) {
        lastBurstTime = now;
        const rx = width * (0.15 + Math.random() * 0.7);
        const ry = height * (0.07 + Math.random() * 0.18);
        createSkyBurst(rx, ry);
      }

      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.vx *= 0.98;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          burstParticles.splice(i, 1);
          continue;
        }

        fCtx.beginPath();
        fCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fCtx.fillStyle = p.color;
        fCtx.globalAlpha = p.alpha;
        fCtx.shadowBlur = 10;
        fCtx.shadowColor = p.color;
        fCtx.fill();
      }

      // 3. STAR GLINTS
      for (let i = starGlints.length - 1; i >= 0; i--) {
        const sg = starGlints[i];
        sg.alpha += sg.alphaSpeed;
        sg.rotation += 0.02;

        if (sg.alpha >= sg.maxAlpha) {
          sg.alphaSpeed = -Math.abs(sg.alphaSpeed);
        }

        if (sg.alpha <= 0) {
          starGlints.splice(i, 1);
          continue;
        }

        drawStar(fCtx, sg.x, sg.y, sg.size, sg.rotation, sg.alpha);
      }

      fCtx.globalAlpha = 1;
      fCtx.shadowBlur = 0;
      fCtx.globalCompositeOperation = 'source-over';

      fAnimationId = requestAnimationFrame(renderFireworks);
    }

    renderFireworks();
  }

  function stopFireworks() {
    fireworksActive = false;
    if (fAnimationId) cancelAnimationFrame(fAnimationId);
    if (fCtx && fireworksCanvas) {
      const w = fireworksCanvas.getBoundingClientRect().width;
      const h = fireworksCanvas.getBoundingClientRect().height;
      fCtx.clearRect(0, 0, w, h);
    }
  }

  // ATTACH EVENT LISTENERS
  function setupEvents() {
    if (envelopeScreen) envelopeScreen.addEventListener('click', handleOpenEnvelope);
    if (envelopeBadgeTrigger) envelopeBadgeTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      handleOpenEnvelope();
    });

    if (minimalMusicBtn) minimalMusicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audioManager.toggle();
    });

    if (btnPrevCard) btnPrevCard.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePrev();
    });

    if (btnNextCard) btnNextCard.addEventListener('click', (e) => {
      e.stopPropagation();
      handleNext();
    });

    if (cardsStage) {
      cardsStage.addEventListener('click', handleScreenTap);

      cardsStage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      cardsStage.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) handleNext();
          else handlePrev();
        }
      }, { passive: true });
    }

    window.addEventListener('keydown', (e) => {
      if (!isEnvelopeOpen) {
        if (e.key === ' ' || e.key === 'Enter') handleOpenEnvelope();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'm' || e.key === 'M') audioManager.toggle();
    });

    if (btnReplay) btnReplay.addEventListener('click', handleReplayInvitation);
    if (btnCalendar) btnCalendar.addEventListener('click', handleDownloadCalendar);
    if (btnMaps) btnMaps.addEventListener('click', handleOpenMaps);
    if (btnShare) btnShare.addEventListener('click', handleShareWhatsApp);

    window.addEventListener('resize', () => {
      if (particleCanvas) resizeCanvas(particleCanvas);
      if (fireworksCanvas) resizeCanvas(fireworksCanvas);
    });
  }

  // INIT
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    setupEvents();
  });
})();
