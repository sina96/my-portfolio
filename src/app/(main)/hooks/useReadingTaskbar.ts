import { useEffect, useState } from "react";

const TOP_ZONE = 80;
const UPWARD_REVEAL = 24;

/** Track reading direction outside React; render only when the bar changes visibility. */
export function useReadingTaskbar(enabled: boolean, windows: readonly object[]) {
  const [hiddenFor, setHiddenFor] = useState<readonly object[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let previous = Math.max(0, window.scrollY);
    let high = previous;
    let frame = 0;
    function update(): void {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const bottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (y <= TOP_ZONE || bottom) {
        setHiddenFor(null);
        high = y;
      } else if (y > previous) {
        high = y;
        setHiddenFor(windows);
      } else if (high - y >= UPWARD_REVEAL) {
        setHiddenFor(null);
      }
      previous = y;
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    queue();
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(frame);
    };
  }, [enabled, windows]);

  // A closed disclosure unregisters its window, immediately invalidating the hidden state.
  return { reading: hiddenFor === windows, reveal: () => setHiddenFor(null) };
}
