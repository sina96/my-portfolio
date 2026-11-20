import { expect, test } from "vitest";
import { generateHillScene } from "@/app/(main)/utils/hillScene";

test.each(["day", "night"] as const)("%s hills are deterministic and contain the reference layers", (palette) => {
  const first = generateHillScene(palette, 1987);
  expect(first).toEqual(generateHillScene(palette, 1987));
  expect(first.clouds).not.toEqual(generateHillScene(palette, 22).clouds);
  expect(first.land.pixels).toHaveLength(200 * 125 * 4);
  expect(first.shadows).toHaveLength(2);
  expect(first.clouds).toHaveLength(palette === "day" ? 7 : 3);
  expect(Boolean(first.moon)).toBe(palette === "night");
});

test.each([
  ["night", 75, 162], ["day", 78, 169], ["night", 154, 205], ["day", 162, 75],
] as const)("%s scenery (%i × %i) preserves terrain proportions and determinism", (palette, width, height) => {
  const grid = { width, height };
  const scene = generateHillScene(palette, 1987, grid);
  expect(generateHillScene(palette, 1987, grid)).toEqual(scene);
  expect(scene.land.width).toBe(width);
  expect(scene.moon?.width).toBe(palette === "night" ? 25 : undefined);
  const alpha = scene.hillMask.pixels;
  const crest = Array.from({ length: grid.height }, (_, y) => y)
    .find((y) => alpha.subarray(y * width * 4, (y + 1) * width * 4).some((value) => value !== 0));
  expect(crest! / grid.height).toBeGreaterThanOrEqual(.55);
  expect(crest! / grid.height).toBeLessThan(.65);
});
