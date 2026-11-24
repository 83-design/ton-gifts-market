'use client';

import { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  tint: string;
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function initStars() {
      const stars: Star[] = [];
      // Layer 1: far distant stars (120)
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.5 + Math.random() * 0.5,
          opacity: 0.25 + Math.random() * 0.25,
          speed: 0.02 + Math.random() * 0.03,
          twinkleSpeed: 0.3 + Math.random() * 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          tint: '244, 244, 245',
        });
      }
      // Layer 2: mid stars (60)
      for (let i = 0; i < 60; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.0 + Math.random() * 0.5,
          opacity: 0.45 + Math.random() * 0.25,
          speed: 0.05 + Math.random() * 0.05,
          twinkleSpeed: 0.5 + Math.random() * 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          tint: i % 5 === 0 ? '220, 180, 180' : '244, 244, 245',
        });
      }
      // Layer 3: near brighter stars (30)
      for (let i = 0; i < 30; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.5 + Math.random() * 1.0,
          opacity: 0.65 + Math.random() * 0.35,
          speed: 0.08 + Math.random() * 0.07,
          twinkleSpeed: 0.8 + Math.random() * 0.7,
          twinklePhase: Math.random() * Math.PI * 2,
          tint: i % 4 === 0 ? '210, 140, 140' : '244, 244, 245',
        });
      }
      starsRef.current = stars;
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    }

    let time = 0;

    function render() {
      time += 0.016;

      // Deep cosmic background (#050507)
      ctx!.fillStyle = '#050507';
      ctx!.fillRect(0, 0, width, height);

      // Subtle dark-burgundy cosmic haze in the depth
      const haze1 = ctx!.createRadialGradient(
        width * 0.25,
        height * 0.3,
        0,
        width * 0.25,
        height * 0.3,
        Math.max(width, height) * 0.55
      );
      haze1.addColorStop(0, 'rgba(69, 10, 10, 0.16)');
      haze1.addColorStop(1, 'rgba(5, 5, 7, 0)');
      ctx!.fillStyle = haze1;
      ctx!.fillRect(0, 0, width, height);

      const haze2 = ctx!.createRadialGradient(
        width * 0.78,
        height * 0.75,
        0,
        width * 0.78,
        height * 0.75,
        Math.max(width, height) * 0.45
      );
      haze2.addColorStop(0, 'rgba(38, 6, 10, 0.14)');
      haze2.addColorStop(1, 'rgba(5, 5, 7, 0)');
      ctx!.fillStyle = haze2;
      ctx!.fillRect(0, 0, width, height);

      // Draw stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.x += star.speed;
        star.y += star.speed * 0.28;

        if (star.x > width + 4) star.x = -4;
        if (star.y > height + 4) star.y = -4;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const alpha = Math.max(0.1, Math.min(1, star.opacity + twinkle * 0.14));

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${star.tint}, ${alpha})`;
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
