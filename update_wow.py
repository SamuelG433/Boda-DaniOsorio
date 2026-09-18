import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the old anim-gallery-item foreach in useEffect
content = re.sub(
    r"gsap\.utils\.toArray<Element>\('\.anim-gallery-item'\)\.forEach\(\(el\) => \{[^\}]*\}\);\s*",
    "",
    content,
    flags=re.DOTALL
)

# 2. Reemplazar la sección de la galería entera (en el render principal)
# Buscamos: {/* ── 4. GALERÍA ── */} hasta </section>
pattern_section = re.compile(r'\{/\* ── 4\. GALERÍA ───────────────────────────────────────────────────── \*/\}\n\s*<section className="py-24 px-4 bg-khaki-100 text-center">\n\s*<h2 className="anim-section-title font-display font-light tracking-wide text-5xl md:text-6xl text-khaki-800 mb-12">\n\s*Camina un ratico por esta historia\n\s*</h2>\n\s*<Gallery/>\n\s*</section>', re.DOTALL)

content = pattern_section.sub(r'{/* ── 4. GALERÍA ───────────────────────────────────────────────────── */}\n      <Gallery />', content)


# 3. Replace the Gallery function definition
new_gallery = """function Gallery() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const slides = gsap.utils.toArray<HTMLElement>('.gallery-slide');

      // Animación del contenedor completo para el scroll horizontal
      const scrollTween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => '+=' + (track.scrollWidth * 0.8), // Hace que el scroll dure para que sea suave
          invalidateOnRefresh: true,
        }
      });

      // Animación de parallax interno para las imágenes (movimiento contrario suave)
      slides.forEach((slide) => {
        const img = slide.querySelector('img');
        if (img) {
          gsap.to(img, {
            x: () => slide.offsetWidth * 0.4, // Se mueve 40% del ancho hacia la derecha internamente
            ease: 'none',
            scrollTrigger: {
              trigger: slide,
              containerAnimation: scrollTween,
              start: 'left right',
              end: 'right left',
              scrub: true,
              invalidateOnRefresh: true,
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen bg-khaki-900 overflow-hidden relative flex flex-col">
      <div className="absolute top-16 md:top-24 w-full text-center z-10 px-4 pointer-events-none">
        <h2 className="font-display font-light tracking-wide text-4xl md:text-5xl lg:text-6xl text-khaki-200" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          Camina un ratico por esta historia
        </h2>
      </div>
      <div className="flex-1 flex items-center mt-20">
        <div ref={trackRef} className="flex gap-6 md:gap-16 px-[10vw] md:px-[25vw] h-[60vh] md:h-[70vh] items-center">
          {GALLERY_SLIDES.map((slide, i) => (
            <div key={i} className="gallery-slide relative w-[75vw] md:w-[45vw] lg:w-[35vw] h-full shrink-0 overflow-hidden shadow-2xl bg-khaki-800 rounded-sm">
              {slide.src ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="absolute inset-0 w-[140%] max-w-none h-full object-cover -left-[20%]"
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full border border-khaki-700 flex flex-col items-center justify-center gap-2">
                  <p className="text-khaki-400 text-xs uppercase tracking-widest">{slide.alt}</p>
                  <p className="text-khaki-500 text-[10px]">foto por agregar</p>
                </div>
              )}
              <div className="absolute inset-0 bg-khaki-900/10 pointer-events-none" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}"""

pattern_gallery = re.compile(r'function Gallery\(\) \{.*?\n\}\n', re.DOTALL)
content = pattern_gallery.sub(new_gallery + '\n', content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
