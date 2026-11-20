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

interface Drift {
  from: number;
  steps: number;
  duration: string;
  delay: string;
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

function drift(width: number, speed: number, rng: () => number, sceneWidth: number): Drift {
  const distance = sceneWidth + width;
  const duration = distance / speed;
  return { from: -width, steps: Math.round(distance / S), duration: `${duration.toFixed(1)}s`, delay: `${(-rng() * duration).toFixed(1)}s` };
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


/** Generates pixel layers and animation descriptors without DOM or canvas dependencies. */
export function generateHillScene(name: HillPalette, seed = 1987, sceneryGrid?: { width: number; height: number }) {
  const width = sceneryGrid?.width ?? W;
  const height = sceneryGrid?.height ?? H;
  const worldWidth = width * S;
  const terrainX = (x: number) => x * W / width;
  const front = (x: number) => sceneryGrid ? height * (.57 + (frontY(terrainX(x)) - 66) * .0035) : frontY(x);
  const back = (x: number) => sceneryGrid ? height * (.59 + (backY(terrainX(x)) - 68) * .004) : backY(x);
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
    return pick(T.sky, y / horizon, x, y);
  });

  const hillMask = paint(width, height, (x, y) => y >= front(x) ? "#ffffff" : null);
  const stars: Light[] = [];
  let moon: Raster | undefined;

  if (T.stars) {
    for (let i = 0; i < T.stars; i += 1) {
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
  const clouds: Cloud[] = cloudSpecs.map(([cy, cw, chPct, speed]) => {
    const cloudWidth = sceneryGrid ? Math.max(12, Math.round(cw * Math.min(width / 110, 1.2))) : cw;
    return {
      raster: cloudImage(T, rng, cloudWidth, Math.round(cloudWidth * chPct / 100)),
      y: Math.round(sceneryGrid ? height * (cy / H + .065) : cy) * S,
      drift: drift(cloudWidth * S, speed, rng, worldWidth),
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
  for (let i = 0; i < (name === "day" ? 70 : 45); i += 1) {
    const x = rng() * width | 0;
    const y = Math.ceil(front(x)) + 2 + (rng() * (height - front(x) - 2) | 0);
    if (y >= height) continue;
    glints.push({
      x: x * S, y: y * S, fill: T.glint,
      duration: `${(4 + rng() * 8).toFixed(1)}s`,
      delay: `${(-rng() * 12).toFixed(1)}s`,
    });
  }

  return { width: worldWidth, height: height * S, land, hillMask, stars, moon, clouds, shadows, glints };
}
