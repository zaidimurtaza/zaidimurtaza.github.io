import Image from "next/image";
import { capabilities, experience, profile, projects, stats, testimonials } from "@/content/profile";
import { shippedFor } from "@/content/showcase";
import HeroVisual from "@/components/hero/HeroVisual";
import AgentChat from "@/components/chat/AgentChat";
import { AgentButton, HeroAsk } from "@/components/chat/AgentButtons";
import Work from "@/components/Work";
import NavShell from "@/components/NavShell";

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 26 26" aria-hidden="true">
      <path d="M13 3 23 8.5 13 14 3 8.5Z" fill="#2f3cf5" />
      <path d="M3 13 13 18.5 23 13" fill="none" stroke="#15171c" strokeWidth="1.6" />
      <path d="M3 17.5 13 23 23 17.5" fill="none" stroke="#15171c" strokeWidth="1.6" />
    </svg>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: ["Mohd Murtaza", "Zaidi Murtaza"],
  jobTitle: "Full-stack AI engineer",
  url: profile.site,
  email: `mailto:${profile.email}`,
  image: `${profile.site}/murtaza.jpg`,
  sameAs: [profile.github, profile.linkedin],
  knowsAbout: ["AI agents", "LLM tool calling", "Next.js", "Python", "PostgreSQL", "FastAPI", "Voice AI", "EHR integration"],
  founder: projects
    .filter((p) => p.kind === "Founder" || p.kind === "Co-founder")
    .map((p) => ({ "@type": "Organization", name: p.name, url: p.url })),
};

export default function Home() {
  const quoted = testimonials.filter((t) => t.quote);
  const others = testimonials.filter((t) => !t.quote);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <NavShell>
        <div className="wrap nav-inner">
          <a className="brand" href="#top">
            <BrandMark />
            Murtaza Zaidi
          </a>
          <nav aria-label="Sections">
            <ul className="nav-links">
              <li><a href="#proof">Clients</a></li>
              <li><a href="#work">Work</a></li>
              <li><a href="#experience">Experience</a></li>
              <li><a href={profile.resume} target="_blank" rel="noreferrer">Résumé</a></li>
            </ul>
          </nav>
          <AgentButton prompt="I'd like to book a call with Murtaza">Book a call</AgentButton>
        </div>
      </NavShell>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="hero-kicker">
                <i className="status-dot" aria-hidden="true" />
                Murtaza Zaidi. I build AI agents and MVPs for founders and small teams.
              </p>
              <h1 id="hero-title">I build the whole product, from the database to the AI agent.</h1>
              <p className="hero-lede">
                Engineer on <strong>HealOS</strong> at YC-backed Attack Capital. Founder of <strong>DM IQ</strong>, co-founder
                of <strong>BrandOye</strong>. Products with real users, shipped for teams in five countries.
              </p>
              <HeroAsk />
            </div>
            <HeroVisual />
          </div>
          <div className="wrap shipped">
            <p>Shipped for and with</p>
            <ul>
              {shippedFor.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="stats" aria-label="Results in numbers">
          <div className="wrap">
            <ul>
              {stats.map((s) => (
                <li key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section panel-sheet band" id="proof" aria-labelledby="proof-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="proof-title">What founders and clients say</h2>
              <p>Quotes are in their own words. For everyone else, this is what they valued and what was delivered.</p>
            </div>
            <div className="quotes">
              {quoted.map((t) => (
                <figure className="quote" key={t.name}>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption className="person">
                    <Image src={t.photo} alt="" width={48} height={48} />
                    <div>
                      <b>{t.name}</b>
                      <span>
                        {t.role}, {t.place}
                      </span>
                    </div>
                  </figcaption>
                  <p className="delivered">Delivered: {t.delivered}</p>
                </figure>
              ))}
            </div>
            <ul className="valued">
              {others.map((t) => (
                <li key={t.name}>
                  <Image src={t.photo} alt="" width={44} height={44} />
                  <b>{t.name}</b>
                  <span className="r">
                    {t.role}, {t.place}
                  </span>
                  <p>
                    {t.valued} <span>Delivered: {t.delivered}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section panel-sheet dark" id="work" aria-labelledby="work-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="work-title">Live products, and how each one is built</h2>
              <p>
                Real screenshots of what is running today, the problem each one solves, and the path a request takes
                through it.
              </p>
            </div>
            <Work />
            <div className="work-cta">
              <p>
                <b>Want something like this for your product?</b>
                <span>Tell me what you are building. A 15-minute call is enough to see if it is a fit.</span>
              </p>
              <div className="row">
                <a className="btn btn-primary" href={profile.cal} target="_blank" rel="noreferrer">
                  Book a 15-minute call
                </a>
                <AgentButton className="btn btn-ghost" prompt="I want to build something similar. What would it take?">Ask the agent</AgentButton>
              </div>
            </div>
          </div>
        </section>

        <section className="section caps-section" aria-labelledby="caps-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="caps-title">What you can hand to Murtaza</h2>
              <p>
                One engineer who owns the product end to end: the model and its tools, the database and queues, the
                billing, and the page the customer sees.
              </p>
            </div>
            <div className="caps">
              {capabilities.map((c) => (
                <div className="cap" key={c.title}>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                  <ul>
                    {c.tools.map((t) => (
                      <li key={t}>
                        <span className="tag">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="experience" aria-labelledby="exp-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="exp-title">Where he has worked</h2>
              <p>All remote, across time zones from New York to Stockholm. BCA in Computer Applications, 2024 to 2027.</p>
            </div>
            <ol className="timeline">
              {experience.map((e) => (
                <li key={e.period + e.org}>
                  <time>{e.period}</time>
                  <div>
                    <h3>{e.title}</h3>
                    <p className="org">
                      {e.org}, {e.place}
                    </p>
                  </div>
                  <ul>
                    {e.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section panel-sheet dark closing" aria-labelledby="closing-title">
          <div className="wrap closing-inner">
            <Image src="/murtaza.jpg" alt="Murtaza Zaidi" width={120} height={120} />
            <div>
              <h2 id="closing-title">Have something to build? Start with a 15&#8209;minute call.</h2>
              <p>{profile.availability} Ask the agent to set it up, or write to him directly.</p>
              <div className="row">
                <a className="btn btn-primary" href={profile.cal} target="_blank" rel="noreferrer">
                  Book a 15-minute call
                </a>
                <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <span>Murtaza Zaidi</span>
          <nav aria-label="Elsewhere">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={profile.resume} target="_blank" rel="noreferrer">Résumé</a>
          </nav>
        </div>
      </footer>

      <AgentChat />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
