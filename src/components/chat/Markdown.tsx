import { Fragment, type ReactNode } from "react";

// Minimal, safe markdown: paragraphs, "-"/"1." lists, **bold**, `code`, [links](url) and bare URLs.
// No HTML injection: everything renders as React text nodes.
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/) ?? [];
      const safe = /^(https?:|mailto:|\/|#)/.test(href ?? "") ? href : undefined;
      out.push(
        safe ? (
          <a key={key} href={safe} target={safe.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            {label}
          </a>
        ) : (
          label
        ),
      );
    } else if (tok.includes("@") && !tok.startsWith("http")) {
      out.push(
        <a key={key} href={`mailto:${tok}`}>
          {tok}
        </a>,
      );
    } else {
      const clean = tok.replace(/[.,]+$/, "");
      out.push(
        <a key={key} href={clean} target="_blank" rel="noreferrer">
          {clean.replace(/^https?:\/\//, "")}
        </a>,
      );
      if (clean.length < tok.length) out.push(tok.slice(clean.length));
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="md">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (!lines.length) return null;
        const isUl = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const isOl = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (isUl || isOl) {
          const Tag = isUl ? "ul" : "ol";
          return (
            <Tag key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""), `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
