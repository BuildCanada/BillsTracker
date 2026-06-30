/**
 * Renders a schema.org JSON-LD block. Server component — emits a single
 * <script type="application/ld+json"> tag with the serialized data.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape `<` to avoid breaking out of the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
