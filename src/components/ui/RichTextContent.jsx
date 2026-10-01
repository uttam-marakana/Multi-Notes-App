import { sanitizeRichText } from "../../utils/helpers";

export default function RichTextContent({ value = "", className = "" }) {
  const raw = String(value || "");
  const html = sanitizeRichText(raw);
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(raw);

  if (!isHtml) {
    return <div className={`rich-content ${className}`.trim()}>{raw || "No content"}</div>;
  }

  return (
    <div
      className={`rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html || "<p>No content</p>" }}
    />
  );
}
