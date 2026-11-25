import { expect, test, vi } from "vitest";
import { parseCV } from "@/app/(main)/data/cv";

const FIXTURE = `---
name: Example Person
header:
  - text: <span>Software Developer</span>
  - text: '<span data-icon="tabler:phone"></span> (+46) 701234567'
  - text: Call me
    link: tel:+46701234567
  - text: <span></span> person@example.com
    link: mailto:person@example.com
  - text: Github
    link: https://github.com/example
  - text: Site
    link: https://example.com
---
<!-- LAST UPDATED: 2 May 2026 -->
<!-- private comment -->
## Profile
Built a few things. [Ring me](tel:+46701234567)

## Job experiences
**Example Job**
  ~ 06/2025 - *Present*

- Improved reliability.

## Skills & Merits
**Certificates:** First, Second

**Tools and Frameworks:** React, Git.
`;

test("extracts header links and excludes phone from both public views", () => {
  const cv = parseCV(FIXTURE);
  expect(cv.header).toMatchObject({ name: "Example Person", role: "Software Developer" });
  expect(cv.header.links.map((link) => link.kind)).toEqual(["email", "github", "site"]);
  expect(cv.copyMarkdown).toMatch(/^# Example Person\n\nSoftware Developer/);
  expect(cv.copyMarkdown).not.toMatch(/701234567|tel:|<!--|^---|name: Example Person|Ring me/);
  expect(JSON.stringify(cv)).not.toMatch(/701234567|tel:/);
});

test("splits sections in source order, parses skills and reads the updated date", () => {
  const cv = parseCV(FIXTURE);
  expect(cv.sections.map(({ id }) => id)).toEqual(["profile", "job-experiences"]);
  expect(cv.sections[1].html).toContain('class="cv-entry-meta"');
  expect(cv.skillsSection?.id).toBe("skills-merits");
  expect(cv.skills).toEqual([{ label: "Certificates", items: ["First", "Second"] }, { label: "Tools and Frameworks", items: ["React", "Git"] }]);
  expect(cv.lastUpdated).toBe("2 May 2026");
});

test("returns a harmless fallback for malformed YAML", () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const cv = parseCV("---\nheader: [\n---\n## Profile\nExample");
    expect(cv.header.links).toEqual([]);
    expect(cv.sections).toEqual([]);
    expect(warning).toHaveBeenCalledOnce();
  } finally {
    warning.mockRestore();
  }
});

test("retains sanitized skills HTML when tag parsing fails", () => {
  const cv = parseCV(FIXTURE.replace("**Certificates:** First, Second", "- A certificate\n<script>secret()</script>"));
  expect(cv.skills).toEqual([]);
  expect(cv.skillsSection?.html).toContain("A certificate");
  expect(cv.skillsSection?.html).not.toContain("secret()");
});

const NEW_FORMAT = `---
name: Example Person
header:
  - text: <span>Software Engineer | Backend</span>
  - text: <span class="iconify" data-icon="tabler:phone"></span> (+46) 701234567
  - text: person@example.com
    link: mailto:person@example.com
---
<!-- LAST UPDATED: update before exporting -->
## Profile
Builds things.

## Professional Experience
**Example Consulting**
  ~ 2020 - *Present*

### Client — Team
  ~ 06/2025 - *Present*

*Backend Developer*

- Shipped a migration.

## Core Skills
**Backend:** Java, Spring

**Cloud:** AWS S3, SQS

## Education & Certifications
**Example University** — B.S.
  ~ Stockholm, SE | 2017 - 2020

## Languages

Swedish (fluent), English (fluent)
`;

test("supports Core Skills, a standalone Languages list and meta lines under h3 headings", () => {
  const cv = parseCV(NEW_FORMAT);
  expect(cv.header.role).toBe("Software Engineer | Backend");
  expect(cv.sections.map(({ id }) => id)).toEqual(["profile", "professional-experience", "education-certifications"]);
  expect(cv.skillsSection?.id).toBe("core-skills");
  expect(cv.skills).toEqual([{ label: "Backend", items: ["Java", "Spring"] }, { label: "Cloud", items: ["AWS S3", "SQS"] }]);
  expect(cv.languages).toEqual({ label: "Languages", items: ["Swedish (fluent)", "English (fluent)"] });
  const experience = cv.sections[1].html;
  expect(experience).toContain('<p class="cv-entry-meta">06/2025 - <em>Present</em></p>');
  expect(experience).toContain('<span class="cv-entry-meta">2020 - <em>Present</em></span>');
  expect(experience).not.toMatch(/>\s*~/);
  expect(cv.sections[2].html).toContain('<span class="cv-entry-meta">Stockholm, SE | 2017 - 2020</span>');
  expect(cv.lastUpdated).toBeUndefined();
  expect(JSON.stringify(cv)).not.toMatch(/701234567|tel:/);
});

test("keeps parenthetical skill details together in one tag", () => {
  const cv = parseCV(NEW_FORMAT.replace("AWS S3, SQS", "AWS S3, Cloudflare (DNS, Zero Trust, Workers, R2); OpenTofu"));
  expect(cv.skills.find(({ label }) => label === "Cloud")?.items).toEqual([
    "AWS S3", "Cloudflare (DNS, Zero Trust, Workers, R2)", "OpenTofu",
  ]);
});

test("keeps a Languages section with more than a plain list in the main column", () => {
  const cv = parseCV(NEW_FORMAT.replace("Swedish (fluent), English (fluent)", "- Swedish\n- English"));
  expect(cv.languages).toBeUndefined();
  expect(cv.sections.at(-1)?.id).toBe("languages");
});

test("removes formatted national phone numbers from the body but keeps date ranges", () => {
  const source = NEW_FORMAT.replace("Builds things.", "Builds things.\n\nPhone: 070-012 82 99\n\nOr call 08.123 456 78 any time.");
  const cv = parseCV(source);
  const output = `${JSON.stringify(cv.sections)}\n${cv.copyMarkdown}`;
  expect(output).not.toMatch(/070-012|82 99|08\.123|456 78|Phone:/);
  expect(output).toContain("Or call");
  expect(output).toContain("06/2025 - *Present*");
  expect(cv.sections[1].html).toContain("06/2025 - <em>Present</em>");
  expect(cv.sections[2].html).toContain("Stockholm, SE | 2017 - 2020");
});
