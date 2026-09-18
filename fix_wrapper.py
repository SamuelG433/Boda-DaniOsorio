import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'\{/\* ── 4\. GALERÍA ───────────────────────────────────────────────────── \*/\}\n\s*<Gallery />', re.DOTALL)

replacement = """{/* ── 4. GALERÍA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-khaki-100 text-center">
        <h2 className="anim-section-title font-display font-light tracking-wide text-5xl md:text-6xl text-khaki-800 mb-12">
          Camina un ratico por esta historia
        </h2>
        <Gallery />
      </section>"""

content = pattern.sub(replacement, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
