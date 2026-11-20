"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CVIcon } from "./CVIcon";

export function CVToolbar({ copyMarkdown }: Readonly<{ copyMarkdown: string }>) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fallback = useRef<HTMLDialogElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(copyMarkdown);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      fallback.current?.showModal();
      textarea.current?.focus();
      textarea.current?.select();
    }
  }

  return (
    <>
      <div className="cv-tools" role="group" aria-label="Document actions">
        <Link href="/" aria-label="Home" title="Home"><CVIcon kind="home" /><span>Home</span></Link>
        <span className="cv-tool-separator" aria-hidden="true" />
        <button type="button" aria-label="Print" title="Print" onClick={() => window.print()}>
          <CVIcon kind="print" /><span>Print</span>
        </button>
        <a href="/cv.pdf?download=1" download="Sina-Bastani-CV.pdf" aria-label="Save as PDF" title="Save as PDF">
          <CVIcon kind="save" /><span className="cv-tool-full">Save as PDF</span><span className="cv-tool-short">Save PDF</span>
        </a>
        <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" aria-label="Open PDF" title="Open PDF">
          <CVIcon kind="open" /><span>Open PDF</span>
        </a>
        <div className="cv-copy">
          <button type="button" aria-label="Copy as Markdown" title="Copy as Markdown" onClick={() => void copy()}>
            <CVIcon kind="copy" /><span className="cv-tool-full">Copy as Markdown</span><span className="cv-tool-short">Copy MD</span>
          </button>
          <div className={copied ? "cv-copy-tip" : "xp-sr-only"} role="status">
            {copied && "Copied to clipboard"}
          </div>
        </div>
      </div>
      <dialog className="window cv-copy-dialog" ref={fallback} aria-labelledby="cv-copy-title">
        <div className="title-bar"><span className="title-bar-text" id="cv-copy-title">Copy as Markdown</span></div>
        <div className="window-body">
          <label htmlFor="cv-copy-text">Copy the selected Markdown with your device’s copy command.</label>
          <textarea id="cv-copy-text" ref={textarea} rows={9} readOnly value={copyMarkdown} />
          <form method="dialog" className="xp-actions"><button type="submit">Done</button></form>
        </div>
      </dialog>
    </>
  );
}
