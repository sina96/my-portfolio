"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useLandingVisit } from "../hooks/useLandingVisit";
import { getLandingStop, useLandingGlide } from "../hooks/useLandingGlide";
import { useXpWindows } from "./XpWindowManager";
import { useTheme } from "../hooks/useTheme";
import { generateHillScene } from "../utils/hillScene";
import type { HillPalette, Raster } from "../utils/hillScene";

const DESKTOP = "(min-width: 760px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

interface HillSceneProps {
  mode: "intro" | "header";
  children?: ReactNode;
}

function toImage(raster: Raster): string {
  const canvas = document.createElement("canvas");
  canvas.width = raster.width;
  canvas.height = raster.height;
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.putImageData(new ImageData(raster.pixels, raster.width, raster.height), 0, 0);
  return canvas.toDataURL();
}

function encodeScene(palette: HillPalette, portrait?: { width: number; height: number }) {
  const { land, hillMask, clouds, shadows, moon, ...geometry } = generateHillScene(palette, 1987, portrait);
  const encodeCloud = ({ raster, y, drift }: (typeof clouds)[number]) => ({
    url: toImage(raster), width: raster.width * 8, height: raster.height * 8, y,
    style: {
      "--from": `${drift.from}px`, "--steps": drift.steps,
      "--duration": drift.duration, "--delay": drift.delay, "--to": `${geometry.width}px`,
    } as CSSProperties,
  });
  return {
    palette,
    land: toImage(land),
    mask: toImage(hillMask),
    moon: moon ? toImage(moon) : undefined,
    clouds: clouds.map(encodeCloud),
    shadows: shadows.map(encodeCloud),
    ...geometry,
  };
}

export function HillScene({ mode, children }: Readonly<HillSceneProps>) {
  const { scenery, sceneryEntering, finishSceneryEntry, homeRequest, goHome } = useXpWindows();
  const { theme } = useTheme();
  const palette = theme === "dark" ? "night" : theme === "light" ? "day" : null;
  const [scene, setScene] = useState<ReturnType<typeof encodeScene>>();
  const cache = useRef<Partial<Record<HillPalette, ReturnType<typeof encodeScene>>>>({});
  const headerRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [sceneryGrid, setSceneryGrid] = useState<{ width: number; height: number }>();
  const grid = scenery ? sceneryGrid : undefined;

  useEffect(() => {
    const element = sceneRef.current;
    if (!scenery || !element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Use roughly square five-pixel cells at any scenery viewport aspect.
      const cellSize = Math.max(5, width / 420, height / 300);
      const next = {
        width: Math.max(1, Math.round(width / cellSize)),
        height: Math.max(1, Math.round(height / cellSize)),
      };
      setSceneryGrid((current) => current?.width === next?.width && current?.height === next?.height ? current : next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [scenery]);
  useLandingVisit(mode === "intro");
  useLandingGlide(headerRef, mode === "intro" && !scenery, homeRequest);
  const maskId = useId();

  useEffect(() => {
    if (!palette) return;
    const frame = requestAnimationFrame(() => {
      setScene(grid ? encodeScene(palette, grid) : (cache.current[palette] ??= encodeScene(palette)));
    });
    return () => cancelAnimationFrame(frame);
  }, [palette, grid]);

  useEffect(() => {
    const header = headerRef.current;
    if (mode !== "intro" || !header) return;
    const desktop = window.matchMedia(DESKTOP);
    const motion = window.matchMedia(REDUCED_MOTION);
    let frame = 0;
    let stop = getLandingStop(header);
    const measure = () => { if (header) stop = getLandingStop(header); queue(); };
    const properties = ["--hill-height", "--hill-fade", "--hill-shift", "--hero-opacity", "--hero-shift"];
    function update() {
      if (!header) return;
      frame = 0;
      const head = Math.round(window.innerHeight * 0.42);
      const travel = window.innerHeight - head;
      const y = Math.max(0, window.scrollY);
      const p = Math.min(y / Math.max(travel, 1), 1);
      const ease = p * p * (3 - 2 * p);
      const exit = Math.min(1, Math.max(0, (y - travel) / Math.max(stop - travel, 1)));
      const hillShift = exit * head + Math.max(0, y - stop);
      const values = [
        `${Math.round(window.innerHeight - travel * p)}px`,
        `${(ease * 45).toFixed(1)}%`,
        `${-hillShift}px`,
        String(Math.max(0, 1 - p * 1.8)),
        `${-p * 60}px`,
      ];
      properties.forEach((property, i) => header.style.setProperty(property, values[i]));
      header.parentElement?.style.setProperty("--landing-content-opacity", String(Math.max(0, (p - .45) / .55)));
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    const unbind = () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
      frame = 0;
      properties.forEach((property) => header.style.removeProperty(property));
      header.parentElement?.style.removeProperty("--landing-content-opacity");
    };
    const bind = () => {
      unbind();
      if (!desktop.matches || motion.matches) return;
      window.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", measure);
      measure();
    };
    bind();
    desktop.addEventListener("change", bind);
    motion.addEventListener("change", bind);
    return () => {
      unbind();
      desktop.removeEventListener("change", bind);
      motion.removeEventListener("change", bind);
    };
  }, [mode]);

  const visible = scene?.palette === palette ? scene : undefined;
  const clouds = (layers: NonNullable<typeof visible>["clouds"]) => layers.map((layer, index) => (
    <image key={index} className="hill-drift" href={layer.url} y={layer.y} width={layer.width}
      height={layer.height} preserveAspectRatio="none" style={layer.style} />
  ));
  const lights = (points: NonNullable<typeof visible>["stars"], effect: string) => points.map((light, index) => (
    <rect key={index} className={light.duration ? effect : undefined}
      x={light.x} y={light.y} width={8} height={8} fill={light.fill}
      style={{ "--duration": light.duration, "--delay": light.delay } as CSSProperties} />
  ));

  return (
    <header ref={headerRef} className={`hill-header hill-header-${mode}`} aria-hidden={children ? undefined : true} tabIndex={mode === "intro" ? -1 : undefined}>
      <div ref={sceneRef} className="hill-scene" aria-hidden="true" data-entering={sceneryEntering || undefined}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === "xp-grow-hill") finishSceneryEntry();
        }}>
        {visible?.land && (
          <svg viewBox={`0 0 ${visible.width} ${visible.height}`} preserveAspectRatio="xMidYMid slice" focusable="false">
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={visible.width} height={visible.height}>
                <image href={visible.mask} width={visible.width} height={visible.height} preserveAspectRatio="none" />
              </mask>
            </defs>
            <image href={visible.land} width={visible.width} height={visible.height} preserveAspectRatio="none" />
            {lights(visible.stars, "hill-twinkle")}
            {!scenery && visible.moon && <image href={visible.moon} x={1120} y={64} width={200} height={200} />}
            {clouds(visible.clouds)}
            <g mask={`url(#${maskId})`}>{clouds(visible.shadows)}</g>
            {lights(visible.glints, "hill-blink")}
          </svg>
        )}
        {scenery && visible?.moon && (
          <svg className="hill-scenery-moon" viewBox="0 0 25 25" focusable="false">
            <image href={visible.moon} width={25} height={25} />
          </svg>
        )}
      </div>
      {children && <div className="hill-hero">{children}</div>}
      {mode === "intro" && <button type="button" className="hill-hint" onClick={goHome}>▼ SCROLL</button>}
      {mode === "intro" && <span className="hill-nav-sentinel" aria-hidden="true" />}
    </header>
  );
}
