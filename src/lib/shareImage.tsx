import { ImageResponse } from "next/og";
import { PNG } from "pngjs";
import { generateHillScene } from "@/app/(main)/utils/hillScene";

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };
let background: string | undefined;

function hillsPng(): string {
  if (background) return background;

  const { land } = generateHillScene("day");
  const scale = SHARE_IMAGE_SIZE.width / land.width;
  const image = new PNG({ width: land.width * scale, height: land.height * scale });
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const source = (Math.floor(y / scale) * land.width + Math.floor(x / scale)) * 4;
      const target = (y * image.width + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) {
        image.data[target + channel] = land.pixels[source + channel];
      }
    }
  }
  background = `data:image/png;base64,${PNG.sync.write(image).toString("base64")}`;
  return background;
}

interface ShareImageOptions {
  title: string;
  heading?: string;
  subtitle: string;
}

/** Renders a social preview with the same day hills as the desktop. */
export function shareImage({ title, heading, subtitle }: Readonly<ShareImageOptions>): ImageResponse {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#76b0f1" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders native image elements via Satori. */}
      <img src={hillsPng()} alt="" width={1200} height={750} style={{ position: "absolute", left: 0, top: -60 }} />
      <div style={{ display: "flex", flexDirection: "column", width: 920, border: "4px solid #1853b6", borderRadius: "14px 14px 0 0", overflow: "hidden", boxShadow: "12px 12px 0 #06132a88", background: "#ece9d8" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, background: "linear-gradient(#1b61cd, #0c3f9e)", color: "white", padding: "14px 20px", fontSize: heading ? 24 : 38, fontWeight: 700 }}>
          <span style={{ display: "flex", flexShrink: 1 }}>{title}</span>
          <span style={{ display: "flex", flexShrink: 0, gap: 5 }}>
            {["minimize", "maximize", "close"].map((control) => (
              <span key={control} style={{ display: "flex", width: 28, height: 28, alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid white", borderRadius: 5, background: control === "close" ? "#b9361e" : "#2765ca" }}>
                {control === "close" ? "×" : <span style={{ display: "flex", width: 12, height: control === "minimize" ? 2 : 11, border: "1px solid white", marginTop: control === "minimize" ? 8 : 0 }} />}
              </span>
            ))}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: "32px 36px", color: "#14204a", fontSize: 27 }}>
          {heading && <span style={{ display: "flex", fontSize: 68, fontWeight: 700, marginBottom: 10 }}>{heading}</span>}
          <span style={{ display: "flex" }}>{subtitle}</span>
        </div>
      </div>
    </div>,
    SHARE_IMAGE_SIZE,
  );
}
