import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Navigation } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import song from './imports/Carla_Morrison_-_Contigo_Live_Performance_Fender_Sessions_-_Carla_Morrison.mp3';

gsap.registerPlugin(ScrollTrigger);

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-cb9f5f97`;

// ── Fotos ─────────────────────────────────────────────────────────────────────
// Cuando tengas los archivos, descomentar el import y asignar a la constante.
// import heroPrincipal from './imports/PRINCIPAL.jpg';
// import slideSegunda  from './imports/SEGUNDA.jpg';
// import slideTercera  from './imports/TERCERA.jpg';
// import slideCuarta   from './imports/CUARTA.jpg';
// import slideQuinta   from './imports/QUINTA.jpg';
// import slideSexta    from './imports/SEXTA.jpg';

const HERO_PHOTO: string | null = null; // → heroPrincipal

const GALLERY_SLIDES: { src: string | null; alt: string }[] = [
  { src: null, alt: 'Felipe y Daniela — fotografía 2' }, // → slideSegunda
  { src: null, alt: 'Felipe y Daniela — fotografía 3' }, // → slideTercera
  { src: null, alt: 'Felipe y Daniela — fotografía 4' }, // → slideCuarta
  { src: null, alt: 'Felipe y Daniela — fotografía 5' }, // → slideQuinta
  { src: null, alt: 'Felipe y Daniela — fotografía 6' }, // → slideSexta
];

// ── Interfaces ────────────────────────────────────────────────────────────────

interface Rsvp {
  id: string;
  name: string;
  attending: string;
  diet: string | null;
  created_at: string;
}

// ── SVG components ────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="6 3 20 12 6 21 6 3"/>
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);

const ArchFrame = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 180 230" fill="none" stroke="currentColor" className={className} style={style} aria-hidden="true">
    <path d="M 22 230 L 22 92 Q 22 12 90 8 Q 158 12 158 92 L 158 230" strokeWidth="1.5"/>
    <path d="M 36 230 L 36 100 Q 36 30 90 26 Q 144 30 144 100 L 144 230" strokeWidth="0.75" opacity="0.5"/>
    <line x1="22" y1="92" x2="158" y2="92" strokeWidth="0.75" opacity="0.4"/>
    <line x1="8"  y1="230" x2="34"  y2="230" strokeWidth="1.5"/>
    <line x1="146" y1="230" x2="172" y2="230" strokeWidth="1.5"/>
    <circle cx="90" cy="8" r="3" fill="currentColor" strokeWidth="0"/>
  </svg>
);

const OrnamentDivider = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`} aria-hidden="true">
    <div className="flex-1 h-px bg-current opacity-20"/>
    <svg viewBox="0 0 14 14" width="10" height="10" fill="currentColor" aria-hidden="true">
      <rect x="7" y="0.5" width="9.2" height="9.2" rx="0.3" transform="rotate(45 7 7)"/>
    </svg>
    <div className="flex-1 h-px bg-current opacity-20"/>
  </div>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Gallery component ─────────────────────────────────────────────────────────

function Gallery() {
  const n = GALLERY_SLIDES.length;
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set([0]));
  const touchStartX = useRef(0);

  const go = useCallback((index: number) => {
    const next = ((index % n) + n) % n;
    setCurrent(next);
    setRevealed((prev) => { const s = new Set(prev); s.add(next); return s; });
  }, [n]);

  // Keyboard navigation — functional setState avoids stale closure
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrent((c) => { const next = (c - 1 + n) % n; setRevealed((p) => { const s = new Set(p); s.add(next); return s; }); return next; });
      }
      if (e.key === 'ArrowRight') {
        setCurrent((c) => { const next = (c + 1) % n; setRevealed((p) => { const s = new Set(p); s.add(next); return s; }); return next; });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [n]);

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="relative aspect-[4/5] md:aspect-[4/3] overflow-hidden bg-khaki-200/50"
        role="region"
        aria-label="Galería de fotos de Felipe y Daniela"
        aria-live="polite"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 40) go(current + (delta < 0 ? 1 : -1));
        }}
      >
        {GALLERY_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            {revealed.has(i) ? (
              slide.src ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full border border-khaki-300/50 flex flex-col items-center justify-center gap-2">
                  <p className="text-khaki-500 text-xs uppercase tracking-widest">{slide.alt}</p>
                  <p className="text-khaki-400 text-[10px]">foto por agregar</p>
                </div>
              )
            ) : null}
          </div>
        ))}

        {/* Counter */}
        <div
          className="absolute bottom-3 right-3 bg-khaki-900/60 backdrop-blur-sm text-khaki-100 text-xs font-light px-2.5 py-1 rounded-full"
          aria-label={`Foto ${current + 1} de ${n}`}
        >
          {current + 1} / {n}
        </div>

        {/* Arrow buttons */}
        <button
          onClick={() => go(current - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-khaki-900/50 backdrop-blur-sm text-khaki-100 text-xl flex items-center justify-center hover:bg-khaki-900/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-300"
          aria-label="Foto anterior"
        >
          ‹
        </button>
        <button
          onClick={() => go(current + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-khaki-900/50 backdrop-blur-sm text-khaki-100 text-xl flex items-center justify-center hover:bg-khaki-900/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-300"
          aria-label="Foto siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadingRef = useRef<HTMLDivElement>(null);
  const mainRef    = useRef<HTMLDivElement>(null);

  // Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date('2026-12-13T19:00:00Z');
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Loading screen GSAP
  useEffect(() => {
    if (hasEntered || !loadingRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from('.anim-arch',          { autoAlpha: 0, scale: 0.82, duration: 1.4, ease: 'power3.out', transformOrigin: 'center bottom' })
        .from('.anim-letter-f',      { autoAlpha: 0, y: 28, duration: 0.85, ease: 'power2.out' }, '-=0.75')
        .from('.anim-letter-amp',    { autoAlpha: 0, y: 20, duration: 0.75, ease: 'power2.out' }, '-=0.6')
        .from('.anim-letter-d',      { autoAlpha: 0, y: 28, duration: 0.85, ease: 'power2.out' }, '-=0.6')
        .from('.anim-loading-tagline', { autoAlpha: 0, y: 10, duration: 0.6,  ease: 'power2.out' }, '-=0.3')
        .from('.anim-loading-btn',   { autoAlpha: 0, y: 10, scale: 0.95, duration: 0.55, ease: 'back.out(1.4)' }, '-=0.25');
    }, loadingRef);
    return () => ctx.revert();
  }, [hasEntered]);

  // Main content GSAP
  useEffect(() => {
    if (!hasEntered || !mainRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ delay: 0.2 });
      heroTl
        .from('.anim-hero-arch-photo', { autoAlpha: 0, scale: 0.88, duration: 1.2, ease: 'power2.out', transformOrigin: 'center bottom' })
        .from('.anim-hero-quote',      { autoAlpha: 0, y: 22, duration: 0.9, ease: 'power2.out' }, '-=0.8')
        .from('.anim-hero-title',      { autoAlpha: 0, scale: 0.9, duration: 1.0, ease: 'power2.out', transformOrigin: 'center' }, '-=0.5')
        .from('.anim-hero-sub',        { autoAlpha: 0, y: 8, duration: 0.65, ease: 'power2.out' }, '-=0.45')
        .from('.anim-hero-date',       { autoAlpha: 0, y: 14, duration: 0.65, ease: 'power2.out' }, '-=0.35')
        .from('.anim-hero-divider',    { autoAlpha: 0, scaleX: 0, duration: 0.5, transformOrigin: 'center' }, '-=0.25');

      gsap.from('.anim-player',      { autoAlpha: 0, y: 24, duration: 0.7, delay: 1.1, ease: 'power2.out' });
      gsap.from('.anim-header-logo', { autoAlpha: 0, x: -12, duration: 0.7, delay: 0.5, ease: 'power2.out' });

      gsap.utils.toArray<Element>('.anim-section-title').forEach((el) => {
        gsap.from(el, { autoAlpha: 0, y: 32, duration: 0.85, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
      gsap.from('.anim-countdown-block', {
        autoAlpha: 0, y: 20, scale: 0.9, duration: 0.6, ease: 'back.out(1.2)', stagger: 0.1,
        scrollTrigger: { trigger: '.anim-countdown-row', start: 'top 82%' },
      });
      gsap.from('.anim-countdown-text', { autoAlpha: 0, y: 14, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: '.anim-countdown-text', start: 'top 88%' } });
      gsap.from('.anim-location-card', { autoAlpha: 0, y: 28, duration: 0.7, ease: 'power2.out', stagger: 0.18, scrollTrigger: { trigger: '.anim-location-grid', start: 'top 80%' } });
      gsap.utils.toArray<Element>('.anim-timeline-item').forEach((el, i) => {
        gsap.from(el, { autoAlpha: 0, x: i % 2 === 0 ? -22 : 22, duration: 0.65, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
      });
      gsap.from('.anim-timeline-mobile-item', { autoAlpha: 0, x: -18, duration: 0.6, ease: 'power2.out', stagger: 0.12, scrollTrigger: { trigger: '.anim-timeline-mobile', start: 'top 80%' } });
      gsap.from('.anim-dresscode',   { autoAlpha: 0, y: 20, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: '.anim-dresscode',  start: 'top 82%' } });
      gsap.from('.anim-rsvp-inner',  { autoAlpha: 0, y: 20, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: '.anim-rsvp-inner', start: 'top 82%' } });
      gsap.from('.anim-footer-logo', { autoAlpha: 0, y: 16, duration: 0.75, ease: 'power2.out', scrollTrigger: { trigger: '.anim-footer-logo', start: 'top 90%' } });

      ScrollTrigger.refresh();
    }, mainRef);
    return () => ctx.revert();
  }, [hasEntered]);

  // Admin panel
  const [showAdmin, setShowAdmin] = useState(false);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const adminClickCount = useRef(0);
  const adminClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    adminClickCount.current += 1;
    if (adminClickTimer.current) clearTimeout(adminClickTimer.current);
    adminClickTimer.current = setTimeout(() => { adminClickCount.current = 0; }, 2000);
    if (adminClickCount.current >= 5) { adminClickCount.current = 0; setShowAdmin(true); }
  };

  useEffect(() => {
    if (!showAdmin) return;
    setAdminLoading(true);
    fetch(`${SERVER_BASE}/rsvps`, { headers: { Authorization: `Bearer ${publicAnonKey}` } })
      .then((r) => r.json())
      .then((data) => setRsvps(data.rsvps ?? []))
      .catch(() => setRsvps([]))
      .finally(() => setAdminLoading(false));
  }, [showAdmin]);

  const downloadCsv = () => {
    const header = ['Nombre', 'Asistencia', 'Restricciones alimenticias', 'Fecha'];
    const rows = rsvps.map((r) => [
      r.name,
      r.attending === 'yes' ? 'Sí' : 'No',
      r.diet ?? '',
      r.created_at ? new Date(r.created_at).toLocaleString('es-CO') : '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'confirmados_boda_FyD.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Hero 5-click → /invitados
  const heroClickCount = useRef(0);
  const heroClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleHeroClick = () => {
    heroClickCount.current += 1;
    if (heroClickTimer.current) clearTimeout(heroClickTimer.current);
    heroClickTimer.current = setTimeout(() => { heroClickCount.current = 0; }, 2000);
    if (heroClickCount.current >= 5) { heroClickCount.current = 0; navigate('/invitados'); }
  };

  // Audio
  const handleEnter = () => {
    setHasEntered(true);
    setIsPlaying(true);
    audioRef.current?.play().catch(() => setIsPlaying(false));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }
  };

  // ── Admin panel ─────────────────────────────────────────────────────────────
  if (showAdmin) {
    const attending    = rsvps.filter((r) => r.attending === 'yes').length;
    const notAttending = rsvps.filter((r) => r.attending === 'no').length;
    return (
      <div className="min-h-screen bg-khaki-50 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-cursive text-4xl text-khaki-800">Admin — F & D</h1>
              <p className="text-khaki-700 text-sm mt-1">Panel de confirmaciones de asistencia</p>
            </div>
            <button
              onClick={() => setShowAdmin(false)}
              className="text-sm uppercase tracking-wider text-khaki-700 border border-khaki-300 px-4 py-3 hover:bg-khaki-100 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
            >
              ← Volver
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[{ label: 'Total', value: rsvps.length }, { label: 'Confirman', value: attending }, { label: 'No asisten', value: notAttending }].map((s) => (
              <div key={s.label} className="bg-white border border-khaki-200 rounded-sm p-6 text-center shadow-sm">
                <p className="text-3xl font-light text-khaki-800">{s.value}</p>
                <p className="text-xs uppercase tracking-widest text-khaki-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mb-4 gap-3">
            <button
              type="button"
              onClick={() => {
                setAdminLoading(true);
                fetch(`${SERVER_BASE}/rsvps`, { headers: { Authorization: `Bearer ${publicAnonKey}` } })
                  .then((r) => r.json()).then((data) => setRsvps(data.rsvps ?? [])).catch(() => {}).finally(() => setAdminLoading(false));
              }}
              className="text-sm uppercase tracking-wider text-khaki-700 border border-khaki-300 px-4 py-3 hover:bg-khaki-100 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={rsvps.length === 0}
              className="text-sm uppercase tracking-wider bg-khaki-800 text-white px-4 py-3 hover:bg-khaki-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
            >
              Descargar Excel (.csv)
            </button>
          </div>
          <div className="bg-white border border-khaki-200 rounded-sm shadow-sm overflow-x-auto">
            {adminLoading ? (
              <div className="py-16 text-center text-khaki-500 text-sm uppercase tracking-widest">Cargando...</div>
            ) : rsvps.length === 0 ? (
              <div className="py-16 text-center text-khaki-500 text-sm uppercase tracking-widest">Sin confirmaciones aún</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-khaki-100 bg-khaki-50">
                    {['Nombre', 'Asistencia', 'Restricciones', 'Fecha'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-khaki-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r, i) => (
                    <tr key={i} className="border-b border-khaki-50 hover:bg-khaki-50/50 transition-colors">
                      <td className="px-4 py-3 text-khaki-900">{r.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.attending === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.attending === 'yes' ? 'Sí asiste' : 'No asiste'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-khaki-700">{r.diet || '—'}</td>
                      <td className="px-4 py-3 text-khaki-500 whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleString('es-CO') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (!hasEntered) {
    return (
      <div ref={loadingRef} className="size-full flex flex-col items-center justify-center bg-khaki-100">
        <div className="text-center space-y-8">
          <div
            className="relative flex items-center justify-center w-64 h-80 md:w-80 md:h-96 mx-auto cursor-pointer select-none"
            onClick={handleLogoClick}
            role="presentation"
          >
            <ArchFrame className="anim-arch absolute inset-0 w-full h-full text-khaki-500" style={{ opacity: 0.3 }}/>
            <div className="relative z-10 flex items-center gap-3 md:gap-4">
              <span className="anim-letter-f   font-cursive text-7xl md:text-9xl text-khaki-800">F</span>
              <span className="anim-letter-amp font-cursive text-5xl md:text-7xl text-khaki-500">&</span>
              <span className="anim-letter-d   font-cursive text-7xl md:text-9xl text-khaki-800">D</span>
            </div>
          </div>
          <p className="anim-loading-tagline tracking-widest uppercase text-sm md:text-base text-khaki-800 font-light">
            Tenemos una invitación para ti
          </p>
          <button
            onClick={handleEnter}
            className="anim-loading-btn mt-8 px-8 py-3 bg-khaki-800 text-khaki-100 rounded-full uppercase tracking-wider text-sm hover:bg-khaki-900 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-800 focus-visible:ring-offset-2 focus-visible:ring-offset-khaki-100"
          >
            Abrir Invitación
          </button>
        </div>
      </div>
    );
  }

  // ── Main landing ────────────────────────────────────────────────────────────
  return (
    <div ref={mainRef} className="min-h-screen bg-background">
      <audio ref={audioRef} loop>
        <source src={song} type="audio/mpeg"/>
      </audio>

      {/* SVG clip-path definition — silhouette del arco colonial */}
      <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id="hero-arch-clip" clipPathUnits="objectBoundingBox">
            {/* Derived from ArchFrame viewBox 180×230: x/180, y/230 */}
            <path d="M0.122,1 L0.122,0.4 Q0.122,0.052 0.5,0.035 Q0.878,0.052 0.878,0.4 L0.878,1 Z"/>
          </clipPath>
        </defs>
      </svg>

      {/* ── Sticky Header ────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-khaki-50/95 backdrop-blur-sm border-b border-khaki-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <span className="anim-header-logo hidden md:block font-cursive text-2xl text-khaki-800 shrink-0">
            Felipe & Daniela
          </span>
          <nav className="flex items-center justify-center md:justify-end gap-2 md:gap-4 w-full md:w-auto">
            {[
              { mobile: 'Fecha',     desktop: 'Fecha',                  href: '#countdown' },
              { mobile: 'Lugares',   desktop: 'Ubicación y lugares',    href: '#ubicacion' },
              { mobile: 'Confirmar', desktop: 'Confirma tu asistencia', href: '#rsvp' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 text-xs uppercase tracking-wider text-khaki-700 hover:text-khaki-900 transition-colors px-2 py-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
              >
                <span className="md:hidden">{item.mobile}</span>
                <span className="hidden md:inline">{item.desktop}</span>
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Floating Music Player ─────────────────────────────────────────── */}
      <div
        className="anim-player fixed right-4 md:right-6 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-khaki-200 flex items-center gap-3"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
      >
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-khaki-800 font-semibold leading-tight">¡Ponle música a este momento!</span>
          <span className="text-xs text-khaki-700 font-light">Contigo · Carla Morrison</span>
        </div>
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-khaki-800 text-white flex items-center justify-center hover:bg-khaki-900 transition-all shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700 focus-visible:ring-offset-2"
          aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
          {isPlaying ? <PauseIcon/> : <PlayIcon/>}
        </button>
      </div>

      {/* ── 2. HERO ──────────────────────────────────────────────────────── */}
      <section className="min-h-screen px-6 md:px-16 py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:grid md:grid-cols-2 items-center justify-center gap-12 md:gap-16 min-h-[calc(100vh-14rem)]">

          {/* Foto — encima en mobile · columna izquierda en desktop */}
          <div className="anim-hero-arch-photo flex justify-center md:justify-end">
            <div className="relative w-52 md:w-72" style={{ aspectRatio: '180/230' }}>
              {/* Foto recortada en la silueta del arco */}
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'url(#hero-arch-clip)' }}>
                {HERO_PHOTO ? (
                  <img
                    src={HERO_PHOTO}
                    alt="Felipe y Daniela"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-khaki-200/70 flex flex-col items-center justify-center gap-2">
                    <p className="text-khaki-500 text-xs uppercase tracking-widest">PRINCIPAL</p>
                    <p className="text-khaki-400 text-[10px]">foto por agregar</p>
                  </div>
                )}
              </div>
              {/* Marco del arco superpuesto */}
              <ArchFrame className="absolute inset-0 w-full h-full text-khaki-600 pointer-events-none" style={{ opacity: 0.55 }}/>
            </div>
          </div>

          {/* Texto — debajo en mobile · columna derecha en desktop */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
            <p className="anim-hero-quote max-w-md text-khaki-700 font-light leading-relaxed italic text-lg md:text-xl">
              Hay amores que empiezan con un encuentro.<br/>
              El nuestro también.<br/><br/>
              Pero con el tiempo entendimos que amar no se trata<br className="hidden md:block"/>
              solamente de encontrarse, sino de{' '}
              <span className="font-medium not-italic">permanecer</span>.
            </p>

            <div>
              <h1
                onClick={handleHeroClick}
                className="anim-hero-title font-cursive text-6xl md:text-8xl text-khaki-800 mb-3 select-none cursor-default"
              >
                Felipe & Daniela
              </h1>
              <p className="anim-hero-sub uppercase tracking-[0.3em] text-khaki-700 text-sm md:text-base">
                ¡Nos casamos!
              </p>
            </div>

            <div className="anim-hero-date border-t border-b border-khaki-300/70 py-5 px-8 md:px-10 w-full max-w-sm">
              <p className="text-xl md:text-2xl text-khaki-700 font-light tracking-wide">
                Domingo, 13 de Diciembre de 2026
              </p>
              <p className="text-xs uppercase tracking-[0.25em] text-khaki-500 mt-2">
                Rionegro, Antioquia
              </p>
            </div>

            <OrnamentDivider className="anim-hero-divider text-khaki-500 w-28"/>
          </div>
        </div>
      </section>

      {/* ── 3. CUENTA REGRESIVA ──────────────────────────────────────────── */}
      <section id="countdown" className="scroll-mt-14 py-24 bg-khaki-800 text-khaki-100 px-4 text-center">
        <h2 className="anim-section-title font-cursive text-4xl md:text-6xl text-khaki-300 mb-12">
          Faltan muy pocos días para decir &ldquo;Sí, acepto&rdquo;
        </h2>

        <div className="anim-countdown-row flex justify-center gap-4 md:gap-10 mb-12">
          {[
            { value: timeLeft.days,    label: 'Días' },
            { value: timeLeft.hours,   label: 'Horas' },
            { value: timeLeft.minutes, label: 'Minutos' },
            { value: timeLeft.seconds, label: 'Segundos' },
          ].map(({ value, label }) => (
            <div key={label} className="anim-countdown-block text-center">
              <div className="text-4xl md:text-6xl font-light text-khaki-100 tabular-nums w-16 md:w-24">
                {String(value).padStart(2, '0')}
              </div>
              <div className="text-xs uppercase tracking-widest text-khaki-400 mt-2">{label}</div>
            </div>
          ))}
        </div>

        <p className="anim-countdown-text max-w-lg mx-auto text-base font-light text-khaki-200/80 leading-relaxed italic">
          Falta poco para celebrar el amor, la risa, el café compartido, la música y el inicio de esta nueva etapa junto a las personas que más amamos.
        </p>
      </section>

      {/* ── 4. GALERÍA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-khaki-100 text-center">
        <h2 className="anim-section-title font-cursive text-5xl md:text-6xl text-khaki-800 mb-12">
          Camina un ratico por esta historia
        </h2>
        <Gallery/>
      </section>

      {/* ── 5. UBICACIÓN ─────────────────────────────────────────────────── */}
      <section id="ubicacion" className="scroll-mt-14 py-24 px-4 bg-khaki-50 text-center">
        <h2 className="anim-section-title font-cursive text-5xl md:text-6xl text-khaki-800 mb-16">Ubicación y lugares</h2>
        <div className="anim-location-grid max-w-3xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Ceremonia */}
          <div className="anim-location-card space-y-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-khaki-200 flex items-center justify-center text-khaki-700 mb-2">
              <MapPin size={20} aria-hidden="true"/>
            </div>
            <p className="text-xs uppercase tracking-widest text-khaki-500">01.</p>
            <h3 className="text-xl tracking-widest uppercase text-khaki-900">La Ceremonia Religiosa</h3>
            <p className="text-base text-khaki-700 font-light">
              Parroquia María Madre de Dios<br/>Rionegro, Antioquia
            </p>
            <p className="text-base text-khaki-700 font-medium">2:00 PM</p>
            <div className="flex gap-3 mt-2">
              <a
                href="https://share.google/JjINDr8rsXG3Sz2cv"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-khaki-300 text-khaki-700 text-xs uppercase tracking-wider hover:bg-khaki-100 transition-colors min-h-[44px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
              >
                <MapPin size={14} aria-hidden="true"/> Google Maps
              </a>
              <a
                href="https://waze.com/ul/hd3475hd9n"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-khaki-300 text-khaki-700 text-xs uppercase tracking-wider hover:bg-khaki-100 transition-colors min-h-[44px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
              >
                <Navigation size={14} aria-hidden="true"/> Waze
              </a>
            </div>
          </div>

          {/* Recepción */}
          <div className="anim-location-card space-y-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-khaki-200 flex items-center justify-center text-khaki-700 mb-2">
              <MapPin size={20} aria-hidden="true"/>
            </div>
            <p className="text-xs uppercase tracking-widest text-khaki-500">02.</p>
            <h3 className="text-xl tracking-widest uppercase text-khaki-900">La Celebración</h3>
            <p className="text-base text-khaki-700 font-light">
              Galilea Campestre<br/>Rionegro, Antioquia
            </p>
            <p className="text-base text-khaki-700 font-medium">4:00 PM</p>
            <div className="flex gap-3 mt-2">
              <a
                href="https://share.google/uLAv8mbrSxQUNVpfd"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-khaki-300 text-khaki-700 text-xs uppercase tracking-wider hover:bg-khaki-100 transition-colors min-h-[44px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
              >
                <MapPin size={14} aria-hidden="true"/> Google Maps
              </a>
              <a
                href="https://waze.com/ul/hd3474grur"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-khaki-300 text-khaki-700 text-xs uppercase tracking-wider hover:bg-khaki-100 transition-colors min-h-[44px] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
              >
                <Navigation size={14} aria-hidden="true"/> Waze
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. ITINERARIO ────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <h2 className="anim-section-title font-cursive text-5xl md:text-6xl text-khaki-800 mb-16 text-center">Timeline</h2>

        {/* Desktop: winding path grid */}
        <div className="hidden md:block max-w-2xl mx-auto">
          <div className="anim-timeline relative grid grid-cols-2" style={{ gridTemplateRows: 'repeat(4, 120px)' }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 50 12 C 82 19, 82 31, 50 38 C 18 45, 18 56, 50 63 C 82 70, 82 81, 50 88" fill="none" stroke="#848867" strokeWidth="0.8" vectorEffect="non-scaling-stroke"/>
              {([
                [50, 12], [50, 38], [50, 63], [50, 88],
              ] as [number, number][]).map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="2.2" fill="#EBE4D3" stroke="#848867" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
              ))}
            </svg>
            {[
              { time: '1:30 PM', event: 'Llegada de Invitados', sub: 'Llegada a la Parroquia',         col: 1, row: 1, align: 'right' as const },
              { time: '2:00 PM', event: 'Ceremonia',            sub: '',                               col: 2, row: 2, align: 'left'  as const },
              { time: '4:00 PM', event: 'Recepción',            sub: 'Nos vemos en Galilea Campestre', col: 1, row: 3, align: 'right' as const },
              { time: '9:00 PM', event: 'Fin de una noche inolvidable', sub: '',                       col: 2, row: 4, align: 'left'  as const },
            ].map((item) => (
              <div
                key={item.time}
                className={`anim-timeline-item flex items-center ${item.align === 'right' ? 'justify-end pr-10 text-right' : 'pl-10 text-left'}`}
                style={{ gridColumn: item.col, gridRow: item.row }}
              >
                <div>
                  <p className="text-xs text-khaki-500 font-semibold tracking-widest">{item.time}</p>
                  <h4 className="text-lg text-khaki-800 mt-0.5">{item.event}</h4>
                  {item.sub && <p className="text-xs text-khaki-700 italic mt-0.5">{item.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked with wavy line */}
        <div className="anim-timeline-mobile md:hidden max-w-xs mx-auto relative pl-10">
          <svg className="absolute left-3 top-2 pointer-events-none" style={{ width: '2px', height: 'calc(100% - 8px)' }} viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 2 0 C 4 17, 0 33, 2 50 C 4 67, 0 83, 2 100" fill="none" stroke="#848867" strokeWidth="2"/>
          </svg>
          <div className="space-y-14">
            {[
              { time: '1:30 PM', event: 'Llegada de Invitados', sub: 'Llegada a la Parroquia' },
              { time: '2:00 PM', event: 'Ceremonia',            sub: '' },
              { time: '4:00 PM', event: 'Recepción',            sub: 'Nos vemos en Galilea Campestre' },
              { time: '9:00 PM', event: 'Fin de una noche inolvidable', sub: '' },
            ].map((item, i) => (
              <div key={i} className="anim-timeline-mobile-item relative">
                <div className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-khaki-500 bg-khaki-50"/>
                <p className="text-xs text-khaki-500 font-semibold tracking-widest">{item.time}</p>
                <h4 className="text-lg text-khaki-800 mt-0.5">{item.event}</h4>
                {item.sub && <p className="text-xs text-khaki-700 italic mt-0.5">{item.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. DRESS CODE ────────────────────────────────────────────────── */}
      <section className="py-24 bg-khaki-800 text-khaki-100 px-4 text-center">
        <div className="anim-dresscode">
          <h2 className="anim-section-title font-cursive text-5xl md:text-6xl text-khaki-300 mb-8">Dress Code: Formal Campestre</h2>
          <div className="max-w-sm mx-auto space-y-4 mb-10">
            <p className="text-base font-light text-khaki-200/90">
              <span className="uppercase tracking-widest text-xs text-khaki-400 block mb-1">Ellas</span>
              Vestido largo.{' '}
              <em className="opacity-80">Por favor evitar tonos beige o plateado.</em>
            </p>
            <p className="text-base font-light text-khaki-200/90">
              <span className="uppercase tracking-widest text-xs text-khaki-400 block mb-1">Ellos</span>
              Traje oscuro.
            </p>
          </div>
          <a
            href="https://pin.it/4AUfgiAHh"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center min-h-[44px] px-8 py-3 border border-khaki-400 text-khaki-200 text-sm uppercase tracking-widest hover:bg-khaki-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-300"
          >
            Ver inspiración
          </a>
        </div>
      </section>

      {/* ── 8. RSVP ──────────────────────────────────────────────────────── */}
      <section id="rsvp" className="scroll-mt-14 py-24 px-4 bg-khaki-100 text-center">
        <div className="anim-rsvp-inner max-w-xl mx-auto">
          <h2 className="font-cursive text-5xl md:text-6xl text-khaki-800 mb-6">¡Queremos celebrar contigo!</h2>
          <p className="text-base text-khaki-700 font-light leading-relaxed mb-10 max-w-md mx-auto">
            Tu presencia hace que este día sea aún más bonito. Si aún no has registrado tu asistencia en el enlace, por favor confirma si nos acompañas:
          </p>
          <a
            href="https://forms.gle/o1WMqJfurmPN5SCH7"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-10 py-3.5 bg-khaki-800 text-khaki-100 uppercase tracking-widest text-sm hover:bg-khaki-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700 focus-visible:ring-offset-2 focus-visible:ring-offset-khaki-100"
          >
            <CheckIcon/> Confirmar mi Asistencia
          </a>
        </div>
      </section>

      {/* ── 9. FOOTER ────────────────────────────────────────────────────── */}
      <footer className="bg-khaki-900 text-khaki-300 px-4 py-14">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="anim-footer-logo">
            <h3 className="font-cursive text-4xl text-khaki-100 mb-1">Felipe & Daniela</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-khaki-500">13.12.2026</p>
          </div>

          <OrnamentDivider className="text-khaki-600 max-w-xs mx-auto"/>

          <div className="grid sm:grid-cols-3 gap-6 text-sm text-left sm:text-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-khaki-500 mb-2">Confirmación</p>
              <a
                href="https://forms.gle/o1WMqJfurmPN5SCH7"
                target="_blank" rel="noopener noreferrer"
                className="text-khaki-400 hover:text-khaki-100 transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-400 rounded-sm"
              >
                Confirmar Asistencia
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-khaki-500 mb-2">Timeline</p>
              <p className="text-khaki-400 leading-relaxed">
                1:30 PM Llegada · 2:00 PM Ceremonia<br/>
                4:00 PM Recepción · 9:00 PM Cierre
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-khaki-500 mb-2">Dresscode</p>
              <p className="text-khaki-400 leading-relaxed">
                Vestido largo (Ellas) · Traje oscuro (Ellos)<br/>
                <em>Evitar beige y plateado.</em>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
