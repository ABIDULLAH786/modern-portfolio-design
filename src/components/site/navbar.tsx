"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface NavLink {
  key: string;
  label: string;
}

const anchor = (key: string) => (key === "hero" ? "home" : key);

export function Navbar({ name, initials, links, toggle }: { name: string; initials: string; links: NavLink[]; toggle: null | { defaultMode: "dark" | "light" } }) {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === "/preview";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [mode, setMode] = useState<"dark" | "light" | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Scroll-spy (home only).
  useEffect(() => {
    if (!onHome) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let cur = "";
      for (const l of links) {
        const el = document.getElementById(anchor(l.key));
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = l.key;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [links, onHome]);

  // Close the mobile menu on Esc / outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (!toggle) return;
    const attr = document.documentElement.getAttribute("data-visitor-mode");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read pre-paint attribute once after hydration
    setMode(attr === "light" || attr === "dark" ? attr : toggle.defaultMode);
  }, [toggle]);

  const flipMode = useCallback(() => {
    const next = (mode ?? toggle?.defaultMode) === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-visitor-mode", next);
    try {
      localStorage.setItem("visitorMode", next);
    } catch {
      /* storage blocked */
    }
    setMode(next);
    window.dispatchEvent(new Event("themechange"));
  }, [mode, toggle]);

  const go = (e: React.MouseEvent, key: string) => {
    setOpen(false);
    if (!onHome) return; // let the link navigate to /#key
    const el = document.getElementById(anchor(key));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", key === "hero" ? "/" : `#${anchor(key)}`);
  };

  return (
    <nav className="site-nav" aria-label="Main">
      <div className="container nav-inner" ref={navRef}>
        <Link href="/" className="logo" onClick={(e) => go(e, "hero")}>
          <span className="logo-mark" aria-hidden="true">
            {initials}
          </span>
          <span className="logo-name">{name}</span>
          <span className="sr-only">, back to top</span>
        </Link>
        <ul className={`nav-links${open ? " open" : ""}`} id="nav-links">
          {links.map((l) => (
            <li key={l.key}>
              <a href={`/#${anchor(l.key)}`} onClick={(e) => go(e, l.key)} aria-current={active === l.key ? "true" : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {toggle ? (
            <button type="button" className="icon-btn" onClick={flipMode} aria-label={(mode ?? toggle.defaultMode) === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
              {(mode ?? toggle.defaultMode) === "dark" ? <Sun /> : <Moon />}
            </button>
          ) : null}
          <button
            ref={btnRef}
            type="button"
            className="icon-btn burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-links"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
