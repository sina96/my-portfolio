import type { Metadata } from "next";
import { SITE_NAME, siteAlternates } from "@/lib/site";
import { HillScene } from "../components/HillScene";
import { XpNavLink } from "../components/XpNavLink";
import { XpWindow } from "../components/XpWindow";
import { getCVContent } from "../data/cv";
import type { CVLink } from "../data/cv";
import { CVIcon } from "./CVIcon";
import { CVToolbar } from "./CVToolbar";

const DESCRIPTION = "Read Sina Bastani’s résumé, browse experience and skills, or download the PDF.";
const MENUS = ["File", "Edit", "View", "Insert", "Format", "Help"];

export const metadata: Metadata = {
  title: "CV",
  description: DESCRIPTION,
  alternates: siteAlternates("/cv"),
  openGraph: { type: "profile", url: "/cv", title: `CV - ${SITE_NAME}`, description: DESCRIPTION },
};

function CVLinks({ links }: Readonly<{ links: CVLink[] }>) {
  return (
    <ul className="cv-links">
      {links.map(({ kind, label, href }) => (
        <li key={href}>
          <a href={href} target={kind === "email" ? undefined : "_blank"} rel={kind === "email" ? undefined : "noopener noreferrer"}>
            <CVIcon kind={kind} />{label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function CVPage() {
  const { header, sections, skills, skillsSection, languages, copyMarkdown, lastUpdated } = getCVContent();
  // Main column follows the Markdown file order.
  const orderedSkills = [
    ...skills.filter(({ label }) => !/^(certificates|languages)$/i.test(label)),
    ...skills.filter(({ label }) => /^(certificates|languages)$/i.test(label)),
  ];

  return (
    <>
      <HillScene mode="header" />
      <main id="main" className="xp-content xp-cv" tabIndex={-1}>
        <XpWindow id="cv-main" icon="cv" title="cv.doc - WordPad" className="cv-wordpad"
          statusBar={<div className="status-bar cv-status">
            <p className="status-bar-field">Page 1</p>
            {lastUpdated && <p className="status-bar-field">Last updated {lastUpdated}</p>}
            <p className="status-bar-field">For Help, press F1</p>
          </div>}>
          <div className="cv-menus" aria-hidden="true">{MENUS.map((menu) => <span key={menu}>{menu}</span>)}</div>
          <CVToolbar copyMarkdown={copyMarkdown} />
          <div className="cv-ruler" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => <span key={index}>{index + 1}</span>)}
          </div>
          <div className="cv-workspace">
            <article className="cv-paper">
              <header className="cv-paper-header">
                <h1>{header.name}</h1>
                {header.role && <p>{header.role}</p>}
                <CVLinks links={header.links} />
              </header>
              <div className="cv-columns">
                <div className="cv-main-column">
                  {sections.map(({ id, title, html }) => (
                    <section key={id} className="cv-section">
                      <h2>{title}</h2>
                      <div className="cv-document-content" dangerouslySetInnerHTML={{ __html: html }} />
                    </section>
                  ))}
                </div>
                <aside className="cv-side-column" aria-label="Contact and skills">
                  {header.links.length > 0 && <section><h2>Contact</h2><CVLinks links={header.links} /></section>}
                  {skills.length > 0 ? (
                    <section>
                      <h2>Skills</h2>
                      {orderedSkills.map(({ label, items }) => (
                        <div className="cv-skill-group" key={label}>
                          <h3>{label.replace(/^Knowledge in LLM-based coding assistants$/i, "LLM coding assistants")}</h3>
                          <ul className="cv-tags">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
                        </div>
                      ))}
                    </section>
                  ) : skillsSection && (
                    <section>
                      <h2>{skillsSection.title}</h2>
                      <div className="cv-document-content" dangerouslySetInnerHTML={{ __html: skillsSection.html }} />
                    </section>
                  )}
                  {languages && (
                    <section>
                      <h2>{languages.label}</h2>
                      <ul className="cv-tags">{languages.items.map((item, index) => <li key={index}>{item}</li>)}</ul>
                    </section>
                  )}
                </aside>
              </div>
            </article>
          </div>
          <div className="xp-actions cv-home"><XpNavLink href="/" label="Home" icon="home" /></div>
        </XpWindow>
      </main>
    </>
  );
}
