"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { layers } from "@/content/showcase";
import { projects } from "@/content/profile";

const StackScene = dynamic(() => import("./StackScene"), { ssr: false, loading: () => null });

const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getRM = () => window.matchMedia(RM).matches;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const nameOf = (slug: string) => projects.find((p) => p.slug === slug)?.name ?? slug;

/* Static isometric drawing of the same tower, shown until WebGL is ready (or if it never is). */
function FallbackStack() {
  const plates = layers.map((_, i) => 70 + i * 46);
  return (
    <svg className="stage-fallback" viewBox="0 0 400 400" aria-hidden="true">
      <ellipse cx="170" cy="345" rx="120" ry="26" fill="rgba(0,0,0,0.08)" />
      {plates.map((y, i) => (
        <g key={i}>
          <polygon points={`170,${y} 285,${y + 40} 170,${y + 80} 55,${y + 40}`} fill="#fbfbf7" stroke="#1b1e25" strokeOpacity="0.35" />
          <polygon points={`55,${y + 40} 170,${y + 80} 170,${y + 86} 55,${y + 46}`} fill="#e7e7e0" />
          <polygon points={`170,${y + 80} 285,${y + 40} 285,${y + 46} 170,${y + 86}`} fill="#d9d9d1" />
        </g>
      ))}
    </svg>
  );
}

export default function HeroVisual() {
  const stageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const explodeRef = useRef(0);
  const [mount3d, setMount3d] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const reduced = useSyncExternalStore(subscribeRM, getRM, () => false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [auto, setAuto] = useState<string | null>(null);
  const autoIndex = useRef(-1);
  const autoStarted = useRef(false);
  const userDriven = hovered !== null || focused !== null;
  const active = hovered ?? focused ?? auto;

  // Auto-tour: once the tower is built, each layer takes focus in turn.
  // Hover or keyboard focus pauses it; it resumes from the next layer shortly after.
  useEffect(() => {
    if (reduced || !ready3d || !visible || !pageVisible || userDriven) return;
    let interval: number | undefined;
    const tick = () => {
      autoIndex.current = (autoIndex.current + 1) % layers.length;
      setAuto(layers[autoIndex.current].id);
    };
    const first = window.setTimeout(
      () => {
        tick();
        interval = window.setInterval(tick, 2400);
      },
      autoStarted.current ? 1200 : 1500,
    );
    autoStarted.current = true;
    return () => {
      window.clearTimeout(first);
      if (interval) window.clearInterval(interval);
    };
  }, [reduced, ready3d, visible, pageVisible, userDriven]);

  useEffect(() => {
    // three.js loads only after the page is idle, and only if WebGL works.
    const start = () => hasWebGL() && setMount3d(true);
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1200 })
      : window.setTimeout(start, 500);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);

    // Scroll opens the stack: 0 at the top of the page, 1 once the hero is half scrolled.
    const onScroll = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = 1 - (r.top + r.height * 0.5) / (window.innerHeight * 0.75);
      explodeRef.current = Math.max(0, Math.min(1, 0.25 + p));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("scroll", onScroll);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle as number);
    };
  }, []);

  // Pause rendering whenever the hero is off screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const activeLayer = layers.find((l) => l.id === active);

  return (
    <div className="stage-wrap">
      <div ref={stageRef} className="stage" role="img" aria-label="An exploded stack of the six layers Murtaza builds, from interface to infrastructure">
        {!ready3d && <FallbackStack />}
        {mount3d && (
          <StackScene
            active={active}
            onHover={setHovered}
            running={visible && pageVisible}
            reducedMotion={reduced}
            explodeRef={explodeRef}
            labelRefs={labelRefs}
            onReady={() => setReady3d(true)}
          />
        )}
        {ready3d && (
          <div className="stage-labels" aria-hidden="true">
            {layers.map((l, i) => (
              <div
                key={l.id}
                className="stage-label-item"
                data-active={active === l.id}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
              >
                <b>{l.name}</b>
                <span>{l.tech}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="stage-readout" aria-live={userDriven ? "polite" : "off"}>
        {activeLayer ? (
          <p>
            <b>{activeLayer.name}</b> in {activeLayer.used.map(nameOf).join(", ")}
          </p>
        ) : (
          <p>Every layer, one engineer. Hover a layer to see where he built it.</p>
        )}
        <ul className="layer-keys" aria-label="Layers of the stack">
          {layers.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                data-active={active === l.id}
                onMouseEnter={() => setHovered(l.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setFocused(l.id)}
                onBlur={() => setFocused(null)}
              >
                {l.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
