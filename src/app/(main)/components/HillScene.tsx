"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import { finishThemeTransition, getThemeTransition, reportThemeFrame, subscribeToTheme, themeFrameAt } from "@/lib/theme";
import { useLandingVisit } from "../hooks/useLandingVisit";
import { getLandingStop, useLandingGlide } from "../hooks/useLandingGlide";
import { useWallpaperScroll } from "../hooks/useWallpaperScroll";
import { useXpWindows } from "./XpWindowManager";
import { useTheme } from "../hooks/useTheme";
import { generateHillScene, generateSun, getCelestialPosition, getTwilightFrame, getViewportHillGrid } from "../utils/hillScene";
import type { HillPalette, Raster, ViewportHillGrid } from "../utils/hillScene";

interface HillSceneProps {
  mode: "intro" | "header";
  children?: ReactNode;
}

function toImage(raster: Raster, bleed = 0): string {
  const canvas = document.createElement("canvas");
  canvas.width = raster.width;
  canvas.height = raster.height + bleed;
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.putImageData(new ImageData(raster.pixels, raster.width, raster.height), 0, 0);
  if (bleed) {
    // Extend the last row so lifting the hills never exposes a strip of sky underneath.
    context.drawImage(canvas, 0, raster.height - 1, raster.width, 1, 0, raster.height, raster.width, bleed);
  }
  return canvas.toDataURL();
}

function encodeScene(palette: HillPalette, grid: ViewportHillGrid) {
  const { land, hillMask, clouds, shadows, moon, ...geometry } = generateHillScene(palette, 1987, grid);
  const encodeCloud = ({ raster, y, drift }: (typeof clouds)[number]) => ({
    url: toImage(raster), width: raster.width * 8, height: raster.height * 8, y,
    style: {
      "--from": `${drift.from}px`, "--steps": drift.steps, "--start": drift.start === undefined ? undefined : `${drift.start}px`,
      "--duration": drift.duration, "--delay": drift.delay, "--to": `${geometry.width}px`,
    } as CSSProperties,
  });
  // Cover parallax and small height-only changes without rescaling the visible grid.
  const bleed = Math.ceil(.34 * land.height);
  return {
    palette,
    land: toImage(land, bleed),
    landHeight: geometry.height + bleed * 8,
    mask: toImage(hillMask),
    moon: moon ? toImage(moon) : undefined,
    sun: palette === "day" ? [toImage(generateSun()), toImage(generateSun(1987, 1))] : undefined,
    grid,
    clouds: clouds.map(encodeCloud),
    shadows: shadows.map(encodeCloud),
    ...geometry,
  };
}

export function HillScene({ mode, children }: Readonly<HillSceneProps>) {
  const { windows, restore, scenery, sceneryEntering, finishSceneryEntry, homeRequest, goHome } = useXpWindows();
  const { theme } = useTheme();
  const palette = theme === "dark" ? "night" : theme === "light" ? "day" : null;
  const [scenes, setScenes] = useState<Partial<Record<HillPalette, ReturnType<typeof encodeScene>>>>({});
  const transition = useSyncExternalStore(subscribeToTheme, getThemeTransition, () => null);
  const [tick, setTick] = useState<{ started: number; step: number }>();
  const headerRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const landing = mode === "intro";
  const [grid, setGrid] = useState<ViewportHillGrid>();

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return;
    let measured: { width: number; height: number } | undefined;
    let orientationChanged = false;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      if (!orientationChanged && measured && measured.width === width &&
          Math.abs(height - measured.height) < measured.height * .25) return;
      measured = { width, height };
      orientationChanged = false;
      setGrid(getViewportHillGrid(width, height, window.matchMedia("(width < 760px)").matches));
    });
    const onOrientation = () => { orientationChanged = true; };
    window.screen.orientation?.addEventListener("change", onOrientation);
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.screen.orientation?.removeEventListener("change", onOrientation);
    };
  }, []);
  useLandingVisit(mode === "intro");
  useLandingGlide(headerRef, mode === "intro" && !scenery, homeRequest);
  const maskId = useId();

  useEffect(() => {
    if (!grid) return;
    const frame = requestAnimationFrame(() => {
      setScenes({ day: encodeScene("day", grid), night: encodeScene("night", grid) });
    });
    return () => cancelAnimationFrame(frame);
  }, [grid]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (landing || scenery || !scene) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rest = window.scrollY >= 80;
      if (rest && scene.dataset.wallpaper !== "rest") scene.dataset.wallpaper = "rest";
      else if (!rest && scene.dataset.wallpaper) delete scene.dataset.wallpaper;
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    return () => {
      window.removeEventListener("scroll", queue);
      cancelAnimationFrame(frame);
      delete scene.dataset.wallpaper;
    };
  }, [landing, scenery]);

  useEffect(() => {
    if (!landing || !transition) return;
    let frame = 0;
    let previous = -1;
    function advance(now: number): void {
      if (!transition) return;
      const step = themeFrameAt(transition, now);
      if (step !== previous) {
        previous = step;
        setTick({ started: transition.started, step });
      }
      if (step !== transition.to) frame = requestAnimationFrame(advance);
    }
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [landing, transition]);
  useEffect(() => {
    // Runs after the frame is committed, so the theme store reverses from what is actually on screen.
    if (tick) reportThemeFrame(tick.started, tick.step);
  }, [tick]);
  useEffect(() => {
    if (landing) return () => finishThemeTransition();
  }, [landing]);

  const active = landing && transition && scenes.day && scenes.night ? transition : null;
  const visible = active ? scenes.day : palette ? scenes[palette] : undefined;
  const night = active ? scenes.night : undefined;
  const step = active && tick?.started === active.started ? tick.step : active?.from ?? 0;
  const twilight = active ? getTwilightFrame(step) : null;
  const sun = visible?.sun;
  const moon = night?.moon ?? visible?.moon;
  const sunBox = visible && sun ? getCelestialPosition(visible.grid, twilight?.sun ?? 0) : undefined;
  const moonBox = visible && moon ? getCelestialPosition(visible.grid, twilight?.moon ?? 0) : undefined;
  useWallpaperScroll(headerRef, sceneRef, landing && !scenery, visible?.height ?? 0);
  const clouds = (layers: NonNullable<typeof visible>["clouds"]) => layers.map((layer, index) => (
    <image key={index} className="hill-drift" href={layer.url} y={layer.y} width={layer.width}
      height={layer.height} preserveAspectRatio="none" style={layer.style} />
  ));
  const lights = (points: NonNullable<typeof visible>["stars"], effect: string) => points.map((light, index) => (
    <g key={index} className={light.duration ? effect : undefined} transform={`translate(${light.x} ${light.y})`}
      style={{ "--duration": light.duration, "--delay": light.delay } as CSSProperties}>
      {light.shape === "plus" && <path d="M-8 0h24v8H-8zM0-8h8v24H0z" fill={light.fill} opacity=".43" />}
      <rect width={light.shape === "double" ? 16 : 8} height={8} fill={light.fill} />
    </g>
  ));

  return (
    <header ref={headerRef} className={`hill-header hill-header-${mode}`} aria-hidden={children ? undefined : true} tabIndex={mode === "intro" ? -1 : undefined}>
      <div ref={sceneRef} className="hill-scene" aria-hidden="true" data-entering={sceneryEntering || undefined}
        data-theme-ready={landing && scenes.day && scenes.night ? "" : undefined}
        data-twilight-step={twilight ? step : undefined}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === "xp-grow-hill") {
            finishSceneryEntry();
          }
        }}>
        {visible?.land && (
          <svg className="hill-wallpaper-grid"
            viewBox={`0 0 ${visible.width} ${visible.height}`} preserveAspectRatio="xMidYMid slice" focusable="false">
            <defs>
              {[visible, night].map((layer) => layer && <mask key={layer.palette} id={`${maskId}-${layer.palette}`} maskUnits="userSpaceOnUse" x="0" y="0" width={layer.width} height={layer.height}>
                <image href={layer.mask} width={layer.width} height={layer.height} preserveAspectRatio="none" />
              </mask>)}
              <clipPath id={`${maskId}-sky`}><path d={visible.skyPath} /></clipPath>
            </defs>
            {[visible, night].map((layer) => layer && (
              <g key={layer.palette} opacity={layer === night ? twilight?.night : undefined}>
                <g className="hill-land-depth">
                  <image href={layer.land} width={layer.width} height={layer.landHeight} preserveAspectRatio="none" />
                </g>
              </g>
            ))}
            <g className="hill-land-depth">
              <g clipPath={`url(#${maskId}-sky)`}>
                {twilight && <rect width={visible.width} height={visible.height} fill={twilight.tint} opacity={twilight.tintOpacity} />}
                <g className="hill-twilight-lights">
                  {lights(twilight && night ? night.stars.slice(0, Math.round(night.stars.length * twilight.stars)) : visible.stars, twilight ? "" : "hill-twinkle")}
                  {sunBox && sun && <g className="hill-sun">
                    <image href={sun[0]} x={sunBox.x} y={sunBox.y} width={sunBox.size} height={sunBox.size} />
                    <image className="hill-sun-rays" href={sun[1]} x={sunBox.x} y={sunBox.y} width={sunBox.size} height={sunBox.size} />
                  </g>}
                  {moonBox && <image className="hill-moon" href={moon}
                    x={moonBox.x} y={moonBox.y} width={moonBox.size} height={moonBox.size} />}
                </g>
              </g>
            </g>
            {[visible, night].map((layer) => layer && (
              <g key={layer.palette} opacity={twilight ? layer === night ? twilight.night : 1 - twilight.night : undefined}>
                <g className="hill-cloud-depth">{clouds(layer.clouds)}</g>
                <g className="hill-land-depth">
                  <g mask={`url(#${maskId}-${layer.palette})`}>{clouds(layer.shadows)}</g>
                  {lights(layer.glints, "hill-blink")}
                </g>
              </g>
            ))}
          </svg>
        )}
        {!scenery && <div className="hill-dim" style={twilight ? {
          background: `color-mix(in srgb, #0b1030 ${twilight.night * 100}%, #e8f1fb)`,
        } : undefined} />}
      </div>
      {children && <div className="hill-hero">{children}</div>}
      {mode === "intro" && !scenery && (
        <button type="button" className="hill-hint" onClick={() => {
          const header = headerRef.current;
          if (!header) return;
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (!reduce && window.matchMedia("(min-width: 760px)").matches) {
            goHome();
            return;
          }
          const scrollToContent = () => {
            document.getElementById("main")?.focus({ preventScroll: true });
            window.scrollTo({ top: getLandingStop(header), behavior: reduce ? "instant" : "smooth" });
          };
          if (!windows.some(({ state }) => state !== "open")) return scrollToContent();
          // Like the desktop glide (via goHome), reopen windows first; wait for the restored layout and
          // run after restore's own focus handoff so focus still lands on the content.
          restore();
          requestAnimationFrame(() => requestAnimationFrame(scrollToContent));
        }}>▼ SCROLL</button>
      )}
      {mode === "intro" && <span className="hill-nav-sentinel" aria-hidden="true" />}
    </header>
  );
}
