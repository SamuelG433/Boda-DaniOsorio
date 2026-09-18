import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_gallery = """function Gallery() {
  const n = GALLERY_SLIDES.length;
  const [current, setCurrent] = useState(0);

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % n);
    }, 4500); // 4.5 seconds per slide
    return () => clearInterval(timer);
  }, [n]);

  const go = useCallback((index: number) => {
    setCurrent(((index % n) + n) % n);
  }, [n]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, go]);

  return (
    <div className="anim-gallery max-w-5xl mx-auto px-4">
      <div
        className="relative w-full aspect-[4/5] md:aspect-[16/9] bg-khaki-100 overflow-hidden shadow-xl border border-khaki-200/60 rounded-sm group"
        role="region"
        aria-label="Galería de fotos de Felipe y Daniela"
        aria-live="polite"
      >
        {GALLERY_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ 
              opacity: i === current ? 1 : 0, 
              zIndex: i === current ? 10 : 0,
              pointerEvents: i === current ? 'auto' : 'none'
            }}
            aria-hidden={i !== current}
          >
            {slide.src ? (
              <>
                {/* Fondo difuminado para rellenar los espacios sin recortar la foto principal */}
                <img
                  src={slide.src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110"
                  aria-hidden="true"
                />
                {/* Fotografía principal contenida, nunca cortada */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-contain p-2 md:p-6 drop-shadow-md"
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-khaki-200/30">
                <p className="text-khaki-500 text-xs uppercase tracking-widest">{slide.alt}</p>
                <p className="text-khaki-400 text-[10px]">foto por agregar</p>
              </div>
            )}
          </div>
        ))}

        {/* Arrow buttons (visibles en hover en desktop, siempre en mobile) */}
        <button
          onClick={() => go(current - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 backdrop-blur-md text-khaki-900 flex items-center justify-center hover:bg-white/70 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700 shadow-sm"
          aria-label="Foto anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          onClick={() => go(current + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 backdrop-blur-md text-khaki-900 flex items-center justify-center hover:bg-white/70 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700 shadow-sm"
          aria-label="Foto siguiente"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* Indicadores (Dots) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {GALLERY_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-khaki-800 scale-125' : 'bg-khaki-900/30 hover:bg-khaki-900/50'
              }`}
              aria-label={`Ir a foto ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}"""

pattern = re.compile(r'function Gallery\(\) \{.*?\n\}\n', re.DOTALL)
content = pattern.sub(new_gallery + '\n', content)

# Restaurar la animación inicial en el main GSAP
# Buscamos anim-gallery-item y lo cambiamos a anim-gallery si está, o lo agregamos
if '.anim-gallery-item' in content:
    content = content.replace('.anim-gallery-item', '.anim-gallery')
else:
    # Agregar la animacion de la galeria al timeline si no esta
    insertion_point = "gsap.utils.toArray<Element>('.anim-section-title').forEach((el) => {"
    if insertion_point in content:
        replacement = """gsap.from('.anim-gallery', { autoAlpha: 0, y: 30, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.anim-gallery', start: 'top 85%' } });
      gsap.utils.toArray<Element>('.anim-section-title').forEach((el) => {"""
        content = content.replace(insertion_point, replacement)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
