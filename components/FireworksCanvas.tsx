'use client';

import React, { useEffect, useRef } from 'react';

interface FireworksCanvasProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
  trail?: { x: number; y: number }[];
}

interface SparklerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
}

interface StarGlint {
  x: number;
  y: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  alphaSpeed: number;
  rotation: number;
}

export default function FireworksCanvas({ active }: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    let burstParticles: Particle[] = [];
    let fountainParticles: SparklerParticle[] = [];
    let starGlints: StarGlint[] = [];

    let lastBurstTime = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Color palettes matching the golden royal night celebration
    const GOLD_PALETTE = ['#FFFFFF', '#FFF8DB', '#FFE58F', '#FFD700', '#FFA940', '#FF7A45', '#FF4D4F'];

    // Sky fireworks burst generator
    const createSkyBurst = (originX: number, originY: number, baseColor?: string) => {
      const count = 55;
      const palette = baseColor ? [baseColor, '#FFFFFF', '#FFE58F'] : GOLD_PALETTE;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 4.2 + 1.2;
        const color = palette[Math.floor(Math.random() * palette.length)];
        burstParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          decay: Math.random() * 0.016 + 0.014,
          size: Math.random() * 2.2 + 1.2,
          gravity: 0.048,
          trail: [],
        });
      }
    };

    // Initial bursts celebrating the couple
    setTimeout(() => {
      createSkyBurst(width * 0.2, height * 0.12, '#FFD700');
      createSkyBurst(width * 0.8, height * 0.14, '#FFF8DB');
    }, 200);

    // Star glints generator
    const addStarGlint = (x: number, y: number) => {
      starGlints.push({
        x,
        y,
        size: Math.random() * 6 + 4,
        alpha: 0,
        maxAlpha: Math.random() * 0.6 + 0.4,
        alphaSpeed: Math.random() * 0.04 + 0.02,
        rotation: Math.random() * Math.PI,
      });
    };

    // Draw 4-point star glint
    const drawStar = (x: number, y: number, r: number, rot: number, alpha: number) => {
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
    };

    // ANIMATION LOOP
    const render = () => {
      // 100% CLEAR so background image stays completely sharp and bright!
      ctx.clearRect(0, 0, width, height);

      // Lighten blend mode gives natural photorealistic golden glow
      ctx.globalCompositeOperation = 'lighter';

      const now = Date.now();

      // 1. CONTINUOUS VERTICAL SPARKLER FOUNTAINS (LEFT & RIGHT COLUMNS)
      // Left fountain centered at width * 0.10, Right fountain centered at width * 0.90
      const fountainXPositions = [width * 0.10, width * 0.90];
      const fountainBaseY = height * 0.78;

      fountainXPositions.forEach((fx) => {
        // Emit 4-6 sparks per frame from each fountain
        const emitCount = 5;
        for (let k = 0; k < emitCount; k++) {
          const spawnX = fx + (Math.random() - 0.5) * (width * 0.05);
          const spawnY = fountainBaseY - Math.random() * (height * 0.35); // Distributed along the vertical plume
          const upwardSpeed = -(Math.random() * 5 + 4); // upward thrust
          const horizontalDrift = (Math.random() - 0.5) * 1.8;
          const color = GOLD_PALETTE[Math.floor(Math.random() * (GOLD_PALETTE.length - 1))];

          fountainParticles.push({
            x: spawnX,
            y: spawnY,
            vx: horizontalDrift,
            vy: upwardSpeed,
            color,
            alpha: Math.random() * 0.6 + 0.4,
            decay: Math.random() * 0.04 + 0.03,
            size: Math.random() * 2.2 + 0.9,
            gravity: 0.12,
          });
        }

        // Occasionally spawn a star glint along the fountain
        if (Math.random() < 0.08) {
          addStarGlint(fx + (Math.random() - 0.5) * 20, height * (0.15 + Math.random() * 0.4));
        }
      });

      // Update & draw fountain sparklers
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

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#FFD700';
        ctx.fill();
      }

      // 2. PERIODIC SKY FIREWORKS BURSTS (TOP NIGHT SKY)
      if (now - lastBurstTime > 1500) {
        lastBurstTime = now;
        const rx = width * (0.15 + Math.random() * 0.7);
        const ry = height * (0.07 + Math.random() * 0.18);
        createSkyBurst(rx, ry);
      }

      // Update & draw aerial burst particles
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

        // Draw spark with soft trail
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      // 3. UPDATE & DRAW STAR GLINTS
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

        drawStar(sg.x, sg.y, sg.size, sg.rotation, sg.alpha);
      }

      // Reset canvas state
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      if (ctx) ctx.clearRect(0, 0, width, height);
    };
  }, [active]);

  if (!active) return null;

  return <canvas ref={canvasRef} id="fireworks-canvas" aria-hidden="true" />;
}
