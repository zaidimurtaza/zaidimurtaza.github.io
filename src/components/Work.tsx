import Image from "next/image";
import { projects, type Project } from "@/content/profile";
import { showcase } from "@/content/showcase";

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

const isOwn = (p: Project) => p.kind === "Founder" || p.kind === "Co-founder";

const shotAlt = (p: Project) => `${p.name} homepage${p.urlLabel ? ` at ${p.urlLabel}` : ""}: ${p.oneLiner}`;

function Browser({
  src,
  url,
  alt,
  priority,
  highlight,
}: {
  src: string;
  url?: string;
  alt: string;
  priority?: boolean;
  highlight?: string;
}) {
  return (
    <figure className="browser">
      <div className="browser-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{url ?? "private"}</span>
      </div>
      <Image src={src} alt={alt} width={1280} height={800} sizes="(max-width: 960px) 100vw, 680px" priority={priority} />
      {highlight && <figcaption className="browser-badge">{highlight}</figcaption>}
    </figure>
  );
}

function Flow({ slug }: { slug: string }) {
  const steps = showcase[slug]?.flow ?? [];
  return (
    <ol className="flow" aria-label="How it works">
      {steps.map((s) => (
        <li key={s.label}>
          <b>{s.label}</b>
          <span>{s.note}</span>
        </li>
      ))}
    </ol>
  );
}

function CaseStudy({ p, flip }: { p: Project; flip: boolean }) {
  const shot = showcase[p.slug]?.shot;
  return (
    <article className="case" id={`project-${p.slug}`} data-flip={flip}>
      <div className="case-media">
        {shot && <Browser src={shot} url={p.urlLabel} alt={shotAlt(p)} highlight={p.metrics?.[0]} />}
      </div>
      <div className="case-body">
        <p className="case-kind">
          <span data-own={isOwn(p)}>{p.kind}</span>
          {p.org && <span>{p.org}</span>}
        </p>
        <h3>{p.name}</h3>
        <p className="case-one">{p.outcome}</p>
        {p.metrics && (
          <ul className="case-metrics" aria-label="Results">
            {p.metrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        <p className="case-problem">{p.problem}</p>
        <div className="case-how">
          <h4>How it is built</h4>
          <Flow slug={p.slug} />
          <p className="case-arch">{p.architecture}</p>
          <ul className="case-stack" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="case-links">
          {p.url && (
            <a className="btn btn-dark" href={p.url} target="_blank" rel="noreferrer">
              Open {p.urlLabel}
              <Arrow />
            </a>
          )}
          {p.extraLinks?.map((l) => (
            <a key={l.url} className="btn btn-ghost" href={l.url} target="_blank" rel="noreferrer">
              {l.label.split(",")[0]}
              <Arrow />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

function SmallCard({ p }: { p: Project }) {
  const shot = showcase[p.slug]?.shot;
  return (
    <article className="small" id={`project-${p.slug}`}>
      {shot && <Browser src={shot} url={p.urlLabel} alt={shotAlt(p)} />}
      <p className="case-kind">
        <span>{p.kind}</span>
        {p.org && <span>{p.org}</span>}
      </p>
      <div className="small-top">
        <h3>{p.name}</h3>
        {p.url ? (
          <a className="pill" href={p.url} target="_blank" rel="noreferrer">
            {p.urlLabel}
            <Arrow />
          </a>
        ) : (
          <span className="pill pill-muted">{p.privateNote ?? "Private"}</span>
        )}
      </div>
      <p className="small-outcome">{p.outcome}</p>
      <dl className="small-spec">
        <div>
          <dt>Problem</dt>
          <dd>{p.problem}</dd>
        </div>
        <div>
          <dt>Architecture</dt>
          <dd>{p.architecture}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{p.stack.join(", ")}</dd>
        </div>
      </dl>
      {p.metrics && (
        <ul className="case-metrics" aria-label="Results">
          {p.metrics.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function Work() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !featured.includes(p));
  return (
    <>
      <div className="cases">
        {featured.map((p, i) => (
          <CaseStudy key={p.slug} p={p} flip={i % 2 === 1} />
        ))}
      </div>
      <h3 className="sub-head">More shipped work</h3>
      <div className="smalls">
        {rest.map((p) => (
          <SmallCard key={p.slug} p={p} />
        ))}
      </div>
    </>
  );
}
