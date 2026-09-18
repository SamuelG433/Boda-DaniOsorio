#!/bin/bash
sed -i "s|// import heroPrincipal from './imports/PRINCIPAL.jpg';|import heroPrincipal from './imports/PRINCIPAL.JPEG';|g" src/App.tsx
sed -i "s|// import slideCuarta   from './imports/CUARTA.jpg';|import slideCuarta from './imports/CUARTA.JPEG';\nimport slideQuinta from './imports/QUINTA.JPEG';\nimport img2182 from './imports/IMG_2182.JPEG';\nimport img2186 from './imports/IMG_2186.JPEG';\nimport img2187 from './imports/IMG_2187.JPEG';\nimport img2189 from './imports/IMG_2189.JPEG';\nimport img2192 from './imports/IMG_2192.JPEG';\nimport img2194 from './imports/IMG_2194.JPEG';\nimport img2199 from './imports/IMG_2199.JPEG';|g" src/App.tsx

sed -i "s|const HERO_PHOTO: string | null = null; // → heroPrincipal|const HERO_PHOTO: string | null = heroPrincipal;|g" src/App.tsx
