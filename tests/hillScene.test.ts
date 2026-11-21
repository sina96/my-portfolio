import { expect, test } from "vitest";
import { themeFrameAt } from "@/lib/theme";
import { generateHillScene, generateSun, getCelestialPosition, getTwilightFrame, getViewportHillGrid } from "@/app/(main)/utils/hillScene";

test("the seeded sun has a solid core and a transparent, dithered edge", () => {
  const sun = generateSun();
  expect(sun).toEqual(generateSun());
  expect(sun.pixels).not.toEqual(generateSun(22).pixels);
  expect(generateSun(1987, 1)).toEqual(generateSun(1987, 1));
  expect(generateSun(1987, 1).pixels).not.toEqual(sun.pixels);
  expect(generateSun(1987, 1).pixels.slice((12 * 25 + 12) * 4, (12 * 25 + 12) * 4 + 4))
    .toEqual(sun.pixels.slice((12 * 25 + 12) * 4, (12 * 25 + 12) * 4 + 4));
  expect(sun.pixels[(12 * 25 + 12) * 4 + 3]).toBe(255);
  expect(sun.pixels[3]).toBe(0);
  expect(sun.pixels.some((alpha, index) => index % 4 === 3 && alpha === 95)).toBe(true);
});

test("twilight progresses through ten discrete frames with matching endpoint palettes", () => {
  const frames = Array.from({ length: 10 }, (_, index) => getTwilightFrame(index));
  expect(frames[0]).toMatchObject({ night: 0, stars: 0, sun: 0, moon: 1, tintOpacity: 0 });
  expect(frames[9]).toMatchObject({ night: 1, stars: 1, sun: 1, moon: 0, tintOpacity: 0 });
  expect(new Set(frames.map(({ tint }) => tint)).size).toBe(10);
  expect(frames.every(({ stars }, i) => i === 0 || stars >= frames[i - 1].stars)).toBe(true);
});

test("reversing a switch starts on the current frame and returns to the source palette", () => {
  const dusk = { target: "dark" as const, started: 100, from: 0, to: 9 };
  const now = 750;
  const frame = themeFrameAt(dusk, now);
  expect(frame).toBe(4);
  const dawn = { target: "light" as const, started: now, from: frame, to: 0 };
  expect(themeFrameAt(dawn, now)).toBe(frame);
  expect(themeFrameAt(dawn, now + 150)).toBe(frame - 1);
  expect(themeFrameAt(dawn, now + 1000)).toBe(0);
});

const VIEWPORTS = [[375, 812], [390, 844], [360, 740], [1440, 900], [812, 375]] as const;

const forViewport = (width: number, height: number) => {
  const grid = getViewportHillGrid(width, height, width < 760);
  return { grid, scene: generateHillScene("night", 1987, grid) };
};

test.each(["day", "night"] as const)("%s hills retain the default reference layers", (palette) => {
  const first = generateHillScene(palette, 1987);
  expect(first).toEqual(generateHillScene(palette, 1987));
  expect(first.clouds).not.toEqual(generateHillScene(palette, 22).clouds);
  expect(first.land.pixels).toHaveLength(200 * 125 * 4);
  expect(first.shadows).toHaveLength(2);
  expect(first.clouds).toHaveLength(palette === "day" ? 7 : 3);
  expect(Boolean(first.moon)).toBe(palette === "night");
});

test.each(VIEWPORTS)("%i × %i viewport is seeded and keeps the moon inside the safe box", (width, height) => {
  const { grid, scene } = forViewport(width, height);
  expect(generateHillScene("night", 1987, grid)).toEqual(scene);
  expect(generateHillScene("night", 22, grid).stars).not.toEqual(scene.stars);
  expect(width / grid.width).toBeCloseTo(width < 760 ? 7 : 5, 0);
  expect(scene.land.width).toBe(grid.width);
  expect(scene.moon?.width).toBe(25);
  const frames = Array.from({ length: 10 }, (_, i) => getTwilightFrame(i));
  const dayToNight = frames.map(({ sun }) => getCelestialPosition(grid, sun));
  const nightToDay = [...frames].reverse().map(({ sun }) => getCelestialPosition(grid, sun));
  expect(dayToNight[0]).toEqual(grid.moonBox);
  expect(nightToDay.at(-1)).toEqual(grid.moonBox);
  expect(getCelestialPosition(grid, frames[9].moon)).toEqual(grid.moonBox);
  for (const { sun, moon } of frames) for (const descent of [sun, moon]) {
    const box = getCelestialPosition(grid, descent);
    expect(box.x).toBeGreaterThanOrEqual(scene.width / 2);
    expect(box.x * width / scene.width >= 120 || box.y * width / scene.width >= 130).toBe(true);
  }
  const scale = width / scene.width;
  const { x, y, size } = scene.moonBox;
  expect(y * scale).toBeGreaterThanOrEqual(.06 * height);
  expect(width - (x + size) * scale).toBeGreaterThanOrEqual(.08 * width);
  expect(size * scale).toBeCloseTo(Math.min(180, Math.max(56, Math.min(width, height) * .16)));
  if (width < height) {
    const crest = Array.from({ length: grid.height }, (_, i) => i).find((i) =>
      scene.hillMask.pixels.subarray(i * grid.width * 4, (i + 1) * grid.width * 4).some(Boolean));
    expect(crest! / grid.height).toBeGreaterThanOrEqual(.52);
    expect(crest! / grid.height).toBeLessThanOrEqual(.62);
    expect(scene.clouds.length).toBeGreaterThanOrEqual(2);
    expect(scene.clouds.length).toBeLessThanOrEqual(3);
  }
});

const NIGHT_SKY = new Set(["3,6,26", "6,12,38", "10,20,51", "15,29,68", "22,40,86", "30,53,103", "42,70,119"]);

function countSkyCells(pixels: Uint8ClampedArray): number {
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) count += Number(NIGHT_SKY.has(pixels.subarray(i, i + 3).join(",")));
  return count;
}

test.each(VIEWPORTS)("%i × %i stars are spaced apart, safely above terrain and outside the moon", (width, height) => {
  const { scene, grid } = forViewport(width, height);
  const onSky = (x: number, y: number) => {
    const i = (y * grid.width + x) * 4;
    return NIGHT_SKY.has(scene.land.pixels.subarray(i, i + 3).join(","));
  };
  expect(new Set(scene.stars.map(({ shape }) => shape))).toEqual(new Set(["single", "double", "plus"]));
  expect(scene.stars.filter(({ duration }) => duration)).toHaveLength(Math.round(scene.stars.length * .18));
  scene.stars.forEach((star, i) => {
    const { x, y, size } = scene.moonBox;
    if (star.shape === "plus") {
      const scale = width / scene.width;
      expect((star.x - 8) * scale >= 120 || (star.y - 8) * scale >= 130).toBe(true);
    }
    expect(star.x + 16 <= x || star.x - 8 >= x + size || star.y + 16 <= y || star.y - 8 >= y + size).toBe(true);
    for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
      expect(onSky(star.x / 8 + dx, star.y / 8 + dy)).toBe(true);
    }
    for (const other of scene.stars.slice(0, i)) {
      expect(Math.hypot(star.x - other.x, star.y - other.y)).toBeGreaterThanOrEqual(48);
    }
  });
});

test("phone skies have visible stars at comparable CSS-pixel density to desktop", () => {
  const density = (width: number, height: number) => {
    const { scene, grid } = forViewport(width, height);
    return scene.stars.length / (countSkyCells(scene.land.pixels) * grid.cellPx ** 2);
  };
  const desktopDensity = density(1440, 900);
  for (const [width, height] of VIEWPORTS.filter(([width]) => width < 760)) {
    const { scene, grid } = forViewport(width, height);
    expect(scene.stars.length).toBeGreaterThanOrEqual(10);
    expect(scene.stars.length).toBeLessThanOrEqual(14);
    expect(scene.stars.filter(({ y }) => y < scene.height * .17).length / scene.stars.length).toBeGreaterThan(.65);
    expect(scene.stars.filter(({ shape }) => shape === "plus")).toHaveLength(2);
    expect(density(width, height) / desktopDensity).toBeGreaterThan(.7);
    expect(density(width, height) / desktopDensity).toBeLessThan(1.3);
    const day = generateHillScene("day", 1987, grid);
    expect(day.clouds).toHaveLength(3);
    expect(day.clouds.every(({ raster, y }) => raster.width * grid.cellPx >= 65 && y < day.height * .17)).toBe(true);
  }
});
