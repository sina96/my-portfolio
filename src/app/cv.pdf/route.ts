import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const pdfPath = path.join(process.cwd(), "src/content/cv/sina-cv-pdf.pdf");
  const { searchParams } = new URL(request.url);
  const shouldDownload = searchParams.get("download") === "1";
  const disposition = shouldDownload ? "attachment" : "inline";

  try {
    const pdf = await readFile(pdfPath);
    const body = new Uint8Array(pdf);

    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename=\"Sina-Bastani-CV.pdf\"`,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.warn("[CV] Failed to read PDF:", error);
    return new Response("CV PDF not found", { status: 404 });
  }
}
