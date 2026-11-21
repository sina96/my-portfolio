import { afterEach, expect, test, vi } from "vitest";
import { finishThemeTransition, getThemeTransition, reportThemeFrame, setTheme, themeFrameAt } from "@/lib/theme";

afterEach(() => {
  finishThemeTransition();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubBrowser(theme: "light" | "dark") {
  vi.useFakeTimers();
  const dataset: Record<string, string> = { theme };
  vi.stubGlobal("document", { documentElement: { dataset } });
  vi.stubGlobal("window", {
    localStorage: { getItem: () => null, setItem: () => undefined },
    matchMedia: () => ({ matches: false }),
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  });
}

test("a reversal starts from the frame last drawn, not the clock's frame", () => {
  stubBrowser("light");
  const now = vi.spyOn(performance, "now").mockReturnValue(1000);
  setTheme("dark", true);
  const dusk = getThemeTransition()!;
  expect(dusk).toMatchObject({ from: 0, to: 9, started: 1000 });

  // The scene painted frame 2; the clock has crossed into frame 3 but nothing has re-rendered yet.
  reportThemeFrame(dusk.started, 2);
  now.mockReturnValue(1000 + 3 * 150 + 10);
  expect(themeFrameAt(dusk, performance.now())).toBe(3);

  setTheme("light", true);
  const dawn = getThemeTransition()!;
  expect(dawn).toMatchObject({ target: "light", from: 2, to: 0, started: 1460 });
  // Later frames keep advancing from the new start by elapsed time.
  expect(themeFrameAt(dawn, 1460 + 150)).toBe(1);
});

test("before any frame is reported, a reversal starts from the transition's first frame", () => {
  stubBrowser("light");
  const now = vi.spyOn(performance, "now").mockReturnValue(0);
  setTheme("dark", true);
  now.mockReturnValue(160);
  setTheme("light", true);
  expect(getThemeTransition()).toBeNull(); // from 0 back to 0: nothing to animate
});
