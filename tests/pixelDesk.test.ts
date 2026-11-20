import { expect, test } from "vitest";
import { generatePixelDesk } from "@/app/(main)/utils/pixelDesk";

test("pixel desk is deterministic and supports both palettes", () => {
  const day = generatePixelDesk("day");
  expect(generatePixelDesk("day")).toEqual(day);
  expect(generatePixelDesk("night")).toEqual(generatePixelDesk("night"));
  expect(generatePixelDesk("night")).not.toEqual(day);
  expect(generatePixelDesk("day", 1)).not.toEqual(day);
});

test.each(["day", "night"] as const)("%s monitor has clean terminal rows across dither seeds", (theme) => {
  const screen = (seed: number) => generatePixelDesk(theme, seed).map(({ fill, d }) => ({
    fill,
    runs: [...d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)]
      .filter(([, x, y]) => Number(x) >= 21 && Number(x) < 40 && Number(y) >= 8 && Number(y) < 18)
      .map(([run]) => run),
  })).filter(({ runs }) => runs.length);
  const rows = screen(1987);
  expect(rows).toEqual(screen(1));
  expect(rows).toHaveLength(4); // Dark background and three syntax colors.
  expect(rows.flatMap(({ runs }) => runs)).toContain("M21 8h19v1h-19z");
});
