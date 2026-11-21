// Pixel-art technique and palettes ported from docs/specs/xp-hills/sketch.html.
const W = 200, H = 125, S = 8;                       // grid cells, px per cell (viewBox 1600x1000)
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const th = (x: number, y: number) => (BAYER[y & 3][x & 3] + 0.5) / 16;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const rgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mulberry = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

function pick(palette: readonly string[], t: number, x: number, y: number): string {
  const fraction = clamp(t, 0, 0.9999) * (palette.length - 1);
  const index = Math.floor(fraction);
  return palette[fraction - index > th(x, y) ? index + 1 : index];
}

const THEMES = {
  day: {
    sky:   ["#1747b8", "#2160d2", "#3479e0", "#4f93ea", "#76b0f1", "#a6cdf6", "#cfe4f8"],
    back:  ["#9cc488", "#86b674", "#6fa560", "#5c944f"],
    hill:  ["#b9e06a", "#94d044", "#74bd30", "#58a524", "#428c1b", "#2f7314", "#215a0e"],
    cloud: ["#ffffff", "#f3f8fd", "#e1edf9", "#c7dbef", "#a9c4e2"], cloudAlpha: 1,
    shade: "rgba(16,52,8,.38)", glint: "#e6ff9a", stars: 0,
  },
  night: {
    sky:   ["#03061a", "#060c26", "#0a1433", "#0f1d44", "#162856", "#1e3567", "#2a4677"],
    back:  ["#22403f", "#1c3636", "#162d2d", "#112424"],
    hill:  ["#2f5a3a", "#264d31", "#1f4229", "#183722", "#122c1b", "#0d2214", "#08190e"],
    cloud: ["#4a5d8c", "#3e507d", "#33446d", "#29395e", "#202e50"], cloudAlpha: .55,
    shade: "rgba(0,6,14,.35)", glint: "#d8f56a", stars: 160,
  },
};

// Landscape: big rounded hill crest left of centre, distant hill line on the right.
const frontY = (x: number) => 66 + 40 * (1 - Math.exp(-(((x - 62) / (x < 62 ? 55 : 85)) ** 2))) + 0.8 * Math.sin(x * 0.11);
const backY  = (x: number) => 84 - 16 * Math.exp(-(((x - 165) / 40) ** 2)) + 1.5 * Math.sin(x * 0.09);


type Palette = (typeof THEMES)[keyof typeof THEMES];
export type HillPalette = keyof typeof THEMES;
type Pixel = string | readonly [number, number, number, number] | null;

export interface Raster {
  width: number;
  height: number;
  pixels: Uint8ClampedArray<ArrayBuffer>;
}

interface Grid {
  width: number;
  height: number;
}

export interface ViewportHillGrid extends Grid {
  cellPx: number;
  compact: boolean;
  moonBox: { x: number; y: number; size: number };
}

/** Top-right sun/moon box in scene units for a grid `width` cells wide drawn at the given CSS size. */
function moonBoxFor(viewWidth: number, viewHeight: number, width: number): ViewportHillGrid["moonBox"] {
  const units = width * S / viewWidth;
  const moonSize = clamp(.16 * Math.min(viewWidth, viewHeight), 56, 180);
  return {
    x: Math.floor((viewWidth * .92 - moonSize) * units / S) * S,
    y: Math.ceil(viewHeight * .06 * units / S) * S,
    size: moonSize * units,
  };
}

/** Choose raster resolution and anchor the moon within the visible viewport. */
export function getViewportHillGrid(viewWidth: number, viewHeight: number, compact: boolean): ViewportHillGrid {
  const cellSize = Math.max(compact ? 7 : 5, viewWidth / 420, viewHeight / 300);
  const width = Math.max(1, Math.round(viewWidth / cellSize));
  const height = Math.max(1, Math.round(viewHeight / cellSize));
  return { width, height, cellPx: viewWidth / width, compact, moonBox: moonBoxFor(viewWidth, viewHeight, width) };
}

interface Drift {
  from: number;
  steps: number;
  duration: string;
  delay: string;
  start?: number;
}

interface Cloud {
  raster: Raster;
  y: number;
  drift: Drift;
}

interface Light {
  x: number;
  y: number;
  fill: string;
  shape?: "single" | "double" | "plus";
  duration?: string;
  delay?: string;
}

function paint(width: number, height: number, pixel: (x: number, y: number) => Pixel): Raster {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = pixel(x, y);
      if (!value) continue;
      const [r, g, b, a = 255] = typeof value === "string" ? rgb(value) : value;
      pixels.set([r, g, b, a], (y * width + x) * 4);
    }
  }
  return { width, height, pixels };
}

function drift(width: number, speed: number, rng: () => number, sceneWidth: number, start?: number): Drift {
  const distance = sceneWidth + width;
  const duration = distance / speed;
  return {
    from: -width, steps: Math.round(distance / S), duration: `${duration.toFixed(1)}s`,
    delay: start === undefined ? `${(-rng() * duration).toFixed(1)}s` : `${(-(start + width) / speed).toFixed(3)}s`,
    ...(start === undefined ? {} : { start }),
  };
}

function cloudImage(T: Palette, rng: () => number, cw: number, ch: number): Raster {
  const blobs: [number, number, number, number][] = [];
  const n = 3 + (rng() * 3 | 0);
  for (let i = 0; i < n; i++) { const r = ch * (0.22 + rng() * 0.18);
    blobs.push([cw * (0.14 + 0.72 * i / (n - 1)), ch * 0.66, r * 1.5, r]); }
  for (let k = 0; k < 2; k++) { const r = ch * (0.28 + rng() * 0.14);
    blobs.push([cw * (0.3 + rng() * 0.4), ch * 0.46, r * 1.25, r]); }
  const base = ch * 0.84;
  return paint(cw, ch, (x, y) => {
    let v = -1;
    for (const [bx, by, rx, ry] of blobs) v = Math.max(v, 1 - ((x - bx) / rx) ** 2 - ((y - by) / ry) ** 2);
    if (v <= 0 || (y > base && th(x, y) < 0.7)) return null;
    if (v < 0.18 && v / 0.18 < th(x, y)) return null;          // dithered fluffy edge
    const c = rgb(pick(T.cloud, y / ch * 0.9 + (1 - v) * 0.25 - 0.1, x, y));
    return [...c, Math.round(255 * T.cloudAlpha)];
  });
}


function viewportStars(width: number, height: number, skyline: (x: number) => number, moonBox: ViewportHillGrid["moonBox"], rng: () => number, cellPx: number, phonePortrait: boolean): Light[] {
  const skyCells = Array.from({ length: width }, (_, x) => Math.floor(skyline(x)))
    .reduce((sum, cells) => sum + cells, 0);
  const total = Math.max(phonePortrait ? 10 : 0, Math.round(skyCells * cellPx ** 2 / 17_500));
  if (total === 0) return [];
  const skyHeight = Math.floor(skyCells / width);
  // The portrait hero occupies most of the middle sky. Give the unobstructed top
  // strip its own strata, leaving a few spots near the outside edges and lower sky.
  const samplingHeight = phonePortrait ? Math.floor(height * .17) : skyHeight;
  const columns = Math.min(total, Math.max(1, Math.round(Math.sqrt(total * width / Math.max(1, samplingHeight)))));
  const rows = Math.ceil(total / columns);
  const stars: Light[] = [];

  // Jitter within strata, then reject occupied or clipped positions. Try other strata if needed.
  for (let attempt = 0; stars.length < total && attempt < rows * columns * 10; attempt++) {
    const stratum = attempt % (rows * columns);
    const x = Math.floor((stratum % columns + .1 + .8 * rng()) * width / columns);
    const row = Math.floor(stratum / columns);
    const sample = (row + .1 + (row === 0 ? .65 : .8) * rng()) / rows;
    const upper = phonePortrait && attempt < rows * columns * 5 && stratum < Math.ceil(total * .8);
    const y = Math.floor(sample * (upper ? samplingHeight : skyHeight));
    if (phonePortrait && attempt < rows * columns * 7 && y >= samplingHeight && y < height * .55 &&
        x > 2 && x < width - 3) continue;
    if (x < 1 || x + 2 >= width || y < 1 || y + 2 >= height ||
        y + 2 >= Math.min(skyline(x - 1), skyline(x), skyline(x + 1))) continue;
    if ((x + 2) * S > moonBox.x && (x - 1) * S < moonBox.x + moonBox.size &&
        (y + 2) * S > moonBox.y && (y - 1) * S < moonBox.y + moonBox.size) continue;
    if (stars.some((star) => Math.hypot(star.x / S - x, star.y / S - y) < 6)) continue;
    stars.push({ x: x * S, y: y * S, fill: rng() < .5 ? "#c9d6ff" : "#a3b7ea", shape: "single" });
  }

  // Shuffle styling separately so larger stars and twinkles don't gather in the first row.
  const order = stars.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const plusCount = phonePortrait ? Math.min(3, Math.round(stars.length / 5)) : Math.min(5, Math.round(stars.length / 9));
  const inIconClearance = ({ x, y }: Light) => (x / S - 1) * cellPx < 120 && (y / S - 1) * cellPx < 130;
  // Keep bright crosses away from the closed hero's top-left shortcut.
  order.sort((a, b) => Number(inIconClearance(stars[a])) - Number(inIconClearance(stars[b])) ||
    (phonePortrait ? Number(stars[a].y >= samplingHeight * S) - Number(stars[b].y >= samplingHeight * S) : 0));
  const doubleCount = Math.round(stars.length * .18);
  order.forEach((index, i) => {
    const star = stars[index];
    if (i < plusCount && !inIconClearance(star)) {
      star.shape = "plus";
      star.fill = "#fff7d6";
    } else if (i < plusCount + doubleCount) {
      star.shape = "double";
    }
    if (i < Math.round(stars.length * .18)) {
      star.duration = `${(3 + rng() * 6).toFixed(1)}s`;
      star.delay = `${(-rng() * 9).toFixed(1)}s`;
    }
  });
  return stars;
}

/** Generates pixel layers and animation descriptors without DOM or canvas dependencies. */
export function generateHillScene(name: HillPalette, seed = 1987, sceneryGrid?: Grid & Partial<ViewportHillGrid>) {
  const width = sceneryGrid?.width ?? W;
  const height = sceneryGrid?.height ?? H;
  const worldWidth = width * S;
  const terrainX = (x: number) => x * W / width;
  const portrait = Boolean(sceneryGrid) && height > width;
  const phonePortrait = portrait && Boolean(sceneryGrid?.compact);
  const peak = (x: number, center: number, spread: number) => Math.exp(-(((x / width - center) / spread) ** 2));
  const front = (x: number) => portrait
    ? height * (.81 - .22 * peak(x, .28, .43))
    : sceneryGrid ? height * (.57 + (frontY(terrainX(x)) - 66) * .0035) : frontY(x);
  const back = (x: number) => portrait
    ? height * (.70 - .145 * peak(x, .82, .40))
    : sceneryGrid ? height * (.59 + (backY(terrainX(x)) - 68) * .004) : backY(x);
  const far = (x: number) => portrait ? height * (.626 - .135 * peak(x, .52, .39)) : height;
  const farPalette = name === "day" ? ["#9ac9d4", "#89b9c4", "#77a9b2"] : ["#243a63", "#203355", "#192943"];
  // Without a supplied box, derive it from this grid's own size and cell scale (not a re-picked grid).
  const cellPx = sceneryGrid?.cellPx ?? 5;
  const moonBox = sceneryGrid?.moonBox ?? (sceneryGrid
    ? moonBoxFor(width * cellPx, height * cellPx, width)
    : { x: 1120, y: 64, size: 200 });
  const T = THEMES[name];
  const rng = mulberry(seed);
  const horizon = sceneryGrid ? height * .68 : 92;
  const land = paint(width, height, (x, y) => {
    const fy = front(x), by = back(x);
    const tx = terrainX(x);
    if (y >= fy) {
      const depth = (y - fy) / (height - fy + 1), side = clamp((tx - 30) / 170);
      let t = 0.12 + 0.38 * depth + 0.42 * side + 0.07 * Math.sin(x * 0.05 + y * 0.13);
      if (y - fy < 1.2 && tx < 150) t -= 0.25; // Sunlit crest rim.
      return pick(T.hill, t, x, y);
    }
    if (y >= by) return pick(T.back, (y - by) / 14 + clamp((tx - 120) / 160) * 0.3, x, y);
    const ridge = far(x);
    if (y >= ridge) return pick(farPalette, (y - ridge) / (height * .16), x, y);
    return pick(T.sky, y / horizon, x, y);
  });

  const skyPath = sceneryGrid ? `M0 ${-height * S}H${worldWidth}${Array.from({ length: width }, (_, i) => {
    const x = width - 1 - i;
    return `V${Math.ceil(Math.min(front(x), back(x), far(x))) * S}h-${S}`;
  }).join("")}Z` : "";
  const hillMask = paint(width, height, (x, y) => y >= front(x) ? "#ffffff" : null);
  const stars: Light[] = [];
  let moon: Raster | undefined;

  if (T.stars) {
    if (sceneryGrid) {
      stars.push(...viewportStars(width, height, (x) => Math.min(front(x), back(x), far(x)), moonBox, mulberry(seed ^ 0x73746172), cellPx, phonePortrait));
    }
    for (let i = 0; !sceneryGrid && i < T.stars; i += 1) {
      const x = rng() * width | 0, y = rng() * (sceneryGrid ? height * .57 : 80) | 0;
      if (y >= Math.min(front(x), back(x)) - 2) continue;
      const big = rng() < 0.12;
      const light: Light = { x: x * S, y: y * S, fill: big ? "#fff7d6" : rng() < 0.5 ? "#c9d6ff" : "#8fa3d9" };
      if (rng() < 0.45) {
        light.duration = `${(3 + rng() * 6).toFixed(1)}s`;
        light.delay = `${(-rng() * 9).toFixed(1)}s`;
      }
      stars.push(light);
    }
    const mx = 12, my = 12, mr = 7;
    moon = paint(25, 25, (x, y) => {
      const d = Math.hypot(x - mx, y - my);
      if (d <= mr) {
        const crater = Math.hypot(x - mx + 2, y - my - 2) < 2 || Math.hypot(x - mx - 3, y - my + 1) < 1.3;
        return crater ? "#d9cfa8" : (x - mx > 3 && th(x + 140, y + 8) < 0.5 ? "#e4dab6" : "#f6efd0");
      }
      if (d <= mr + 5 && (d - mr) / 5 < th(x + 140, y + 8) * 0.9) return [246, 239, 208, 40];
      return null;
    });
  }

  const cloudSpecs = name === "day"
    ? [[8, 24, 30, 6], [14, 30, 36, 7], [5, 40, 44, 9], [22, 34, 40, 8], [11, 52, 48, 11], [30, 46, 46, 10], [18, 60, 50, 13]]
    : [[10, 30, 36, 5], [22, 44, 44, 7], [6, 56, 50, 9]];
  const cloudCount = phonePortrait && name === "day" ? 3 : sceneryGrid
    ? Math.min(name === "day" ? 7 : 5, Math.max(2, Math.round(width / (name === "day" ? 36 : 55)) + 1))
    : cloudSpecs.length;
  const clouds: Cloud[] = Array.from({ length: cloudCount }, (_, i) => {
    const [cy, cw, chPct, speed] = cloudSpecs[i % cloudSpecs.length];
    const cloudWidth = phonePortrait && name === "day" ? [12, 15, 10][i] : sceneryGrid ? Math.max(1, Math.round(cw * Math.min(width / 150, 1.2))) : cw;
    const start = phonePortrait && name === "day" ? Math.round(width * [.08, .52, .76][i]) * S : sceneryGrid ? Math.round(((i + .32) * width / cloudCount) - cloudWidth / 2) * S : undefined;
    return {
      raster: cloudImage(T, rng, cloudWidth, Math.round(cloudWidth * chPct / 100)),
      y: Math.round(phonePortrait && name === "day" ? height * [.055, .105, .035][i] : sceneryGrid ? height * (cy / H + .065) : cy) * S,
      drift: drift(cloudWidth * S, speed, rng, worldWidth, start),
    };
  });

  const [r, g, b, alpha] = T.shade.match(/[\d.]+/g)!.map(Number);
  const shadows: Cloud[] = Array.from({ length: 2 }, (_, i) => {
    const shadowWidth = sceneryGrid ? Math.max(16, Math.round(width * .48)) : 70;
    const shadowHeight = sceneryGrid ? Math.round(height * .16) : 26;
    const raster = paint(shadowWidth, shadowHeight, (x, y) => {
      const v = 1 - ((x - shadowWidth / 2) / (shadowWidth / 2)) ** 2 - ((y - shadowHeight / 2) / (shadowHeight / 2)) ** 2;
      return v > 0 && v * 1.6 > th(x, y) ? [r, g, b, Math.round(255 * alpha)] : null;
    });
    return { raster, y: Math.round(sceneryGrid ? height * (.65 + i * .17) : 78 + i * 22) * S, drift: drift(shadowWidth * S, 10 + i * 3, rng, worldWidth) };
  });

  const glints: Light[] = [];
  const referenceGlints = name === "day" ? 70 : 45;
  const glintCount = sceneryGrid ? Math.min(referenceGlints, Math.ceil(referenceGlints * width * height / (W * H))) : referenceGlints;
  for (let i = 0; i < glintCount; i += 1) {
    const x = rng() * width | 0;
    const y = Math.ceil(front(x)) + 2 + (rng() * (height - front(x) - 2) | 0);
    if (y >= height) continue;
    glints.push({
      x: x * S, y: y * S, fill: T.glint,
      duration: `${(4 + rng() * 8).toFixed(1)}s`,
      delay: `${(-rng() * 12).toFixed(1)}s`,
    });
  }

  return { width: worldWidth, height: height * S, land, hillMask, stars, moon, moonBox, clouds, shadows, glints, skyPath };
}

/** Original pixel sun with a seeded, dithered outer glow. */
export function generateSun(seed = 1987, frame: 0 | 1 = 0): Raster {
  const next = mulberry(seed);
  return paint(25, 25, (x, y) => {
    const d = Math.hypot(x - 12, y - 12);
    if (d <= 7) return d > 6 ? "#fff5bf" : "#ffd478";
    const dx = Math.abs(x - 12), dy = Math.abs(y - 12);
    if ((Math.min(dx, dy) === 0 && d >= 9 && d <= 10 + frame) || (dx === dy && dx === 7 + frame)) return "#ffdc82";
    const glow = next();
    if (d < 12 && glow < (12 - d) / 9) return [255, 194, 91, 95];
    return null;
  });
}

/** Position a body on the right-hand arc; zero is exactly the shared resting box. */
export function getCelestialPosition(grid: ViewportHillGrid, descent: number) {
  const { moonBox: box, width, height, cellPx } = grid;
  const worldWidth = width * S;
  const worldHeight = height * S;
  const phonePortrait = grid.compact && height > width;
  const snap = (offset: number) => Math.round(offset / S) * S;
  // On narrow portraits, move toward the outer edge while still above the hero.
  const sideways = phonePortrait ? Math.max(0, worldWidth - 12 * S / cellPx - box.x) : worldWidth * .055;
  return {
    ...box,
    x: box.x + snap(sideways * Math.min(1, descent * (phonePortrait ? 5 : 1))),
    y: box.y + snap(worldHeight * .83 * descent ** (phonePortrait ? 2.15 : 1.7)),
  };
}

const TWILIGHT = [
  ["#ffc27d", 0], ["#ffc079", .37], ["#ff995e", .63], ["#ec7688", .71], ["#bc699e", .67],
  ["#8264b5", .58], ["#524b9e", .48], ["#343877", .30], ["#292e64", .15], ["#151c42", 0],
] as const;

/** Ten reversible frames shared by dawn and dusk. */
export function getTwilightFrame(step: number) {
  const index = Math.round(clamp(step, 0, 9));
  const [tint, tintOpacity] = TWILIGHT[index];
  return {
    tint, tintOpacity,
    night: index / 9,
    stars: clamp((index - 3) / 5),
    sun: Math.min(1, index / 5),
    moon: Math.min(1, (9 - index) / 5),
  };
}
