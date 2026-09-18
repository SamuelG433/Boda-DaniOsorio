import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
imports_to_add = """import slideSegunda from './imports/SEGUNDA.JPEG';
import slideTercera from './imports/TERCERA.JPEG';
import slideSexta from './imports/SEXTA.JPEG';
import img2176 from './imports/IMG_2176.JPEG';
import img2198 from './imports/IMG_2198.JPEG';"""

if 'import slideSegunda' not in content:
    content = content.replace("import slideCuarta from './imports/CUARTA.JPEG';", imports_to_add + "\nimport slideCuarta from './imports/CUARTA.JPEG';")

# 2. Update GALLERY_SLIDES array
new_gallery_slides = """const GALLERY_SLIDES: { src: string | null; alt: string }[] = [
  { src: slideSegunda, alt: 'Felipe y Daniela — fotografía 2' },
  { src: slideTercera, alt: 'Felipe y Daniela — fotografía 3' },
  { src: slideCuarta, alt: 'Felipe y Daniela — fotografía 4' },
  { src: slideQuinta, alt: 'Felipe y Daniela — fotografía 5' },
  { src: slideSexta, alt: 'Felipe y Daniela — fotografía 6' },
  { src: img2176, alt: 'Felipe y Daniela — fotografía 2176' },
  { src: img2182, alt: 'Felipe y Daniela — fotografía' },
  { src: img2186, alt: 'Felipe y Daniela — fotografía' },
  { src: img2187, alt: 'Felipe y Daniela — fotografía' },
  { src: img2189, alt: 'Felipe y Daniela — fotografía' },
  { src: img2192, alt: 'Felipe y Daniela — fotografía' },
  { src: img2194, alt: 'Felipe y Daniela — fotografía' },
  { src: img2198, alt: 'Felipe y Daniela — fotografía' },
  { src: img2199, alt: 'Felipe y Daniela — fotografía' },
];"""

content = re.sub(r'const GALLERY_SLIDES: \{ src: string \| null; alt: string \}.*?\];', new_gallery_slides, content, flags=re.DOTALL)

# 3. New Gallery Implementation: Interactive Filmstrip (Carousel)
new_gallery_impl = """function Gallery() {
  const n = GALLERY_SLIDES.length;
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const go = useCallback((index: number) => {
    let next = index;
    if (next < 0) next = n - 1;
    if (next >= n) next = 0;
    setCurrent(next);
    
    // Scroll the track smoothly
    if (trackRef.current) {
      const slideEl = trackRef.current.children[next] as HTMLElement;
      if (slideEl) {
        const trackCenter = trackRef.current.offsetWidth / 2;
        const slideCenter = slideEl.offsetLeft + slideEl.offsetWidth / 2;
        trackRef.current.scrollTo({
          left: slideCenter - trackCenter,
          behavior: 'smooth'
        });
      }
    }
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

  // Update current based on native scroll (Snap observation)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    
    let isScrolling: any;
    const handleScroll = () => {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        // Find the most centered child
        const trackCenter = track.scrollLeft + track.offsetWidth / 2;
        let closestIndex = 0;
        let minDistance = Infinity;
        
        Array.from(track.children).forEach((child, i) => {
          const childCenter = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
          const distance = Math.abs(trackCenter - childCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        });
        
        if (closestIndex !== current) {
          setCurrent(closestIndex);
        }
      }, 100);
    };
    
    track.addEventListener('scroll', handleScroll);
    return () => track.removeEventListener('scroll', handleScroll);
  }, [current]);

  return (
    <div className="anim-gallery max-w-[100vw] mx-auto overflow-hidden pb-12 pt-6 relative">
      <div 
        ref={trackRef}
        className="flex gap-4 md:gap-8 px-[10vw] md:px-[30vw] overflow-x-auto snap-x snap-mandatory hide-scrollbar items-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {GALLERY_SLIDES.map((slide, i) => {
          const isActive = i === current;
          return (
            <div
              key={i}
              onClick={() => go(i)}
              className={`snap-center shrink-0 transition-all duration-700 ease-out cursor-pointer select-none rounded-md overflow-hidden relative shadow-2xl
                ${isActive ? 'w-[80vw] md:w-[40vw] aspect-[4/5] opacity-100 scale-100' : 'w-[70vw] md:w-[30vw] aspect-[4/5] opacity-40 scale-[0.85] grayscale-[30%] hover:opacity-70'}
              `}
            >
              {slide.src ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full border border-khaki-300/50 flex flex-col items-center justify-center gap-2 bg-khaki-200/50">
                  <p className="text-khaki-500 text-xs uppercase tracking-widest">{slide.alt}</p>
                </div>
              )}
              {/* Inner frame overlay for elegance */}
              <div className="absolute inset-0 border border-white/20 pointer-events-none mix-blend-overlay rounded-md" aria-hidden="true" />
            </div>
          );
        })}
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-6 mt-8 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); go(current - 1); }}
          className="w-10 h-10 rounded-full border border-khaki-300 text-khaki-700 flex items-center justify-center hover:bg-khaki-200 transition-colors pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
          aria-label="Anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="text-xs uppercase tracking-widest text-khaki-500 tabular-nums">
          {String(current + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); go(current + 1); }}
          className="w-10 h-10 rounded-full border border-khaki-300 text-khaki-700 flex items-center justify-center hover:bg-khaki-200 transition-colors pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki-700"
          aria-label="Siguiente"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}"""

content = re.sub(r'function Gallery\(\) \{.*?\n\}\n', new_gallery_impl + '\n', content, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
