import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_gallery = """function Gallery() {
  return (
    <div className="max-w-6xl mx-auto px-2 md:px-8">
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 md:gap-6">
        {GALLERY_SLIDES.map((slide, i) => (
          <div 
            key={i} 
            className="anim-gallery-item break-inside-avoid mb-4 md:mb-6 overflow-hidden bg-khaki-200/30 group relative"
          >
            {slide.src ? (
              <img
                src={slide.src}
                alt={slide.alt}
                loading={i < 3 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full aspect-[4/5] border border-khaki-300/50 flex flex-col items-center justify-center gap-2">
                <p className="text-khaki-500 text-xs uppercase tracking-widest">{slide.alt}</p>
                <p className="text-khaki-400 text-[10px]">foto por agregar</p>
              </div>
            )}
            <div className="absolute inset-0 bg-khaki-900/0 group-hover:bg-khaki-900/10 transition-colors duration-500 pointer-events-none" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}"""

pattern = re.compile(r'function Gallery\(\) \{.*?\n\}\n', re.DOTALL)
content = pattern.sub(new_gallery + '\n', content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
