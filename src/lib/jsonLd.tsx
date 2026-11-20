interface JsonLdProps {
  value: Record<string, unknown>;
}

/** Embeds structured data without allowing text fields to terminate the script tag. */
export function JsonLd({ value }: Readonly<JsonLdProps>) {
  const json = JSON.stringify(value).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
