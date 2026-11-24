'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  currentScene: number;
}

export default function ParticleCanvas({ currentScene }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize gold dust particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * (width || 400),
      y: Math.random() * (height || 800),
      radius: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseVal: Math.random() * Math.PI,
    }));

    // Initialize floating rose petals
    const petals = Array.from({ length: 12 }, () => ({
      x: Math.random() * (width || 400),
      y: Math.random() * -(height || 800),
      size: Math.random() * 10 + 8,
      speedY: Math.random() * 1.1 + 0.6,
      speedX: Math.random() * 0.8 - 0.4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      color: Math.random() > 0.4 ? '#B2182B' : '#E65C74',
      alpha: Math.random() * 0.5 + 0.4,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render shimmering gold dust
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulseVal += p.pulseSpeed;
        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulseVal));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(247, 229, 169, ${currentAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
      }

      ctx.shadowBlur = 0;

      // Render floating rose petals
      if ([1, 2, 4, 6, 7, 8].includes(currentScene)) {
        for (let j = 0; j < petals.length; j++) {
          const pt = petals[j];
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot);
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.alpha;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(pt.size / 2, -pt.size / 2, pt.size, pt.size / 2, 0, pt.size);
          ctx.bezierCurveTo(-pt.size, pt.size / 2, -pt.size / 2, -pt.size / 2, 0, 0);
          ctx.fill();

          ctx.restore();

          pt.x += pt.speedX + Math.sin(pt.rot) * 0.5;
          pt.y += pt.speedY;
          pt.rot += pt.rotSpeed;

          if (pt.y > height + 20) {
            pt.y = -20;
            pt.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentScene]);

  return <canvas ref={canvasRef} id="particle-canvas" aria-hidden="true" />;
}
