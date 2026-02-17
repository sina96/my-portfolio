import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const pdfPath = path.join(process.cwd(), "src/content/cv/sina-cv-pdf.pdf");

  try {
    const pdf = await readFile(pdfPath);

    return new Response(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=\"Sina-Bastani-CV.pdf\"",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.warn("[CV] Failed to read PDF:", error);
    return new Response("CV PDF not found", { status: 404 });
  }
}