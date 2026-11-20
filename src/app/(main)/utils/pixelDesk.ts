const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const PALETTES = {
  day: ["#f3deb8", "#e4cda6", "#a87252", "#81503e", "#f4e7c5", "#b3a084", "#0f1a24", "#97e2ba", "#b34d35", "#5b864d", "#eec278", "#97ccee", "#244455"],
  night: ["#222a49", "#293458", "#634c54", "#463b4d", "#c7b18d", "#8f786b", "#132030", "#9bf5ce", "#b15555", "#547c65", "#f3c485", "#a8d4ff", "#567e91"],
} as const;

export function generatePixelDesk(theme: keyof typeof PALETTES, seed = 1987): { fill: string; d: string }[] {
  const pixels = new Uint8Array(64 * 34);
  const offset = Math.abs(seed | 0);
  function rect(x: number, y: number, w: number, h: number, light: number, shade = light, ratio = .25): void {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        pixels[j * 64 + i] = BAYER[(j + (offset >>> 2)) & 3][(i + offset) & 3] < ratio * 16 ? shade : light;
      }
    }
  }
  rect(0, 0, 64, 34, 0, 1);
  rect(1, 27, 62, 3, 2, 3);
  rect(1, 30, 62, 2, 3);
  rect(5, 32, 3, 2, 3); rect(56, 32, 3, 2, 3);
  rect(17, 6, 28, 16, 5);
  rect(18, 5, 25, 16, 4, 5, .12);
  rect(20, 7, 21, 12, 5);
  if (theme === "night") rect(20, 7, 21, 12, 12);
  rect(21, 8, 19, 10, 6);
  // Terminal prompt and syntax-colored runs; the overlay cursor ends the last line.
  rect(23, 9, 1, 1, 7); rect(24, 10, 1, 1, 7); rect(23, 11, 1, 1, 7);
  rect(27, 10, 6, 1, 7);
  rect(25, 12, 4, 1, 11); rect(30, 12, 8, 1, 10);
  rect(27, 13, 6, 1, 10); rect(34, 13, 4, 1, 11);
  rect(27, 14, 10, 1, 7);
  rect(25, 16, 8, 1, 11);
  rect(40, 20, 1, 1, 7);
  rect(27, 22, 8, 3, 5); rect(23, 25, 16, 2, 4, 5);
  rect(13, 27, 27, 2, 4, 5, .32);
  rect(50, 21, 7, 6, 8); rect(51, 21, 4, 1, 3);
  rect(57, 22, 2, 3, 8); rect(57, 23, 1, 1, 0);
  rect(7, 21, 5, 6, 8); rect(6, 20, 7, 2, 5);
  rect(8, 13, 2, 7, 9); rect(5, 15, 3, 2, 9); rect(10, 12, 3, 3, 9);
  const paths = Array.from({ length: PALETTES[theme].length }, () => "");
  for (let y = 0; y < 34; y++) {
    for (let x = 0; x < 64;) {
      const index = pixels[y * 64 + x];
      let end = x + 1;
      while (end < 64 && pixels[y * 64 + end] === index) end++;
      const w = end - x;
      paths[index] += `M${x} ${y}h${w}v1h-${w}z`;
      x = end;
    }
  }
  return paths.map((d, index) => ({ fill: PALETTES[theme][index], d }));
}
