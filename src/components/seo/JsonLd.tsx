/**
 * One JSON-LD document, emitted as a script tag.
 *
 * A server component with no client cost: the JSON is serialised at build
 * time and shipped as text, so the structured data is in the HTML a crawler
 * receives rather than something it has to run JavaScript to find.
 */
export default function JsonLd({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      // The content is JSON.stringify output over our own config, never user
      // input; React would otherwise escape the quotes and break the parse.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
