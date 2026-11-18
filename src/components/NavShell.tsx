"use client";

import { useEffect, useState } from "react";

// Full-width bar at the top of the page; after scrolling it condenses into a centred floating pill.
export default function NavShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-scrolled={scrolled}>
      {children}
    </header>
  );
}
