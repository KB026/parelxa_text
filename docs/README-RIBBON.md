# Tuning Guide: Parlexa 3D Hero Ribbon Component (`ParlexaRibbon.tsx`)

The `ParlexaRibbon` component is a typed React Three Fiber (R3F) 3D showcase component (`components/hero/ParlexaRibbon.tsx`) featuring a 5-lobed mobius loop, glass transmission material, procedural glowing inner thread layer, and GSAP ScrollTrigger state controls (`assembled`, `loosen`, `dissolve`).

---

## Key Tuning Parameters

All shape and shader parameters are defined inside `components/hero/ParlexaRibbon.tsx`:

### 1. Shape & Curve Geometry
- **`LOBES`** (default `5`): Number of outer lobes forming the pentagon-flower centerline.
- **`SEGMENTS`** (default `400`): Curve sampling resolution.
- **`R0`** (default `2.05`): Base radius of the loop.
- **`RVAR`** (default `0.62`): Amplitude of radius variation per lobe.
- **`ZAMP`** (default `0.35`): Vertical Z-axis wave height.

### 2. Ribbon Cross-Section & Twists
- **`TWISTS`** (default `1.5`): Number of full/half Mobius twists around the loop. Increasing this creates more light-catching turns.
- **`RIBBON_W`** (default `0.62`): Width of the ribbon (major axis).
- **`RIBBON_T`** (default `0.30`): Thickness of the ribbon (minor axis).
- **`TUBE_SEGS`** (default `480`): Tube segment resolution.

### 3. Gradient Stop Colors (`gradientStops`)
The ribbon surface is colored via a vertex-interpolated brand gradient:
```typescript
const gradientStops = [
  new THREE.Color(0x0a2472), // deep blue
  new THREE.Color(0x2e5cff), // electric blue
  new THREE.Color(0x7c3aed), // purple
  new THREE.Color(0xd946ef), // magenta
  new THREE.Color(0xff6ec7), // pink
  new THREE.Color(0x0a2472), // wrap back
];
```

### 4. Inner Thread Shader (`threadMaterial`)
- **`strands`** (default `60.0`): Density of glowing procedural fiber threads in the fragment shader.
- **`flow`** (`vUv.x * 10.0 - uTime * 1.4`): Speed and frequency of flowing energy strands along the ribbon length.

### 5. Scroll State Transitions
- Driven via `progress` prop ($0 \rightarrow 1$) or GSAP ScrollTrigger:
  - **`0.0` (`assembled`)**: Solid intact ribbon loop.
  - **`0.5` (`loosen`)**: Vertices begin loosening and vibrating with smooth procedural jitter.
  - **`1.0` (`dissolve`)**: Vertices expand outwards and dissolve into glowing energy particle threads.

---

## Lazy-Loading & Performance
- Canvas is dynamically loaded via `ParlexaRibbonWrapper.tsx` using `next/dynamic({ ssr: false })` with a zero-LCP static placeholder image.
- Render loop automatically pauses when scrolled off-screen via `IntersectionObserver`.
