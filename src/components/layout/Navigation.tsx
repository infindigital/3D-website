"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { products } from "@/config/products";
import { HERO_OPEN_EVENT, HERO_OPEN_FALLBACK_MS } from "@/utils/heroOpen";
import styles from "./Navigation.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const links = [
  { href: "/", label: "Home" },
  ...products.map((p) => ({
    href: `/products/${p.slug}`,
    label: p.shortName,
  })),
];

/**
 * Floating glass navigation. Sticky, minimal, blurs the content behind it.
 * The wordmark echoes the logo identity, white RS in green pentagons and
 * Chef'z in the logo red, and switches to the real brand logo image once
 * it lands in public/assets/brand/logo.png (gated in layout.tsx).
 */
export default function Navigation({ hasLogo = false }: { hasLogo?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroOpen, setHeroOpen] = useState(false);
  const [openOn, setOpenOn] = useState(pathname);

  /*
   * When the bar comes down. Everywhere but the home page that is straight
   * away; the home page opens on the hero's intro, and a floating bar over
   * a full-screen title card is the one thing that would give away that the
   * title card is a web page. So there it waits for the hero to say the
   * shape has landed.
   *
   * The wait is only ever a wait. A hero that fails to mount, a bundle that
   * never arrives, a reader who has asked for less motion and so is served
   * no intro at all — each of those still gets the bar, off the timer,
   * because nothing may leave a site without its navigation.
   */
  const revealed = pathname !== "/" || heroOpen;

  /* Leaving the home page arms the wait again: come back to it and the
     hero replays its intro, so the bar has to go back up for it. */
  if (openOn !== pathname) {
    setOpenOn(pathname);
    setHeroOpen(false);
  }

  useEffect(() => {
    if (pathname !== "/") return;

    const reveal = () => setHeroOpen(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.addEventListener(HERO_OPEN_EVENT, reveal);
    const timer = window.setTimeout(
      reveal,
      reduced ? 0 : HERO_OPEN_FALLBACK_MS,
    );

    return () => {
      window.removeEventListener(HERO_OPEN_EVENT, reveal);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  /*
   * The bar floats over whatever is beneath it. A section marks itself with
   * data-dark-section="true" while it is showing something the light glass
   * would sit badly on, and the bar switches to dark glass for as long as
   * that section covers the band it occupies. Nothing claims it today — the
   * site is bright throughout, the hero included — but the switch stays
   * because the cost is one querySelector and the alternative is a bar that
   * cannot survive the first dark section anyone adds.
   */
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 24);
      const dark = document.querySelector('[data-dark-section="true"]');
      const box = dark?.getBoundingClientRect();
      setOnDark(!!box && box.top <= 0 && box.bottom > 110);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -110, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: -110, opacity: 0 }}
      transition={{ duration: 1, delay: revealed ? 0.15 : 0, ease: EASE }}
    >
      <nav
        aria-label="Main"
        className={`${styles.bar} ${scrolled ? styles.scrolled : ""} ${
          onDark ? styles.onDark : ""
        }`}
      >
        <Link
          href="/"
          className={styles.brand}
          onClick={closeMenu}
          aria-label={`${siteConfig.name}, home`}
        >
          {hasLogo ? (
            <Image
              className={styles.brandLogo}
              src="/assets/brand/logo.png"
              alt=""
              width={1000}
              height={426}
              priority
              sizes="120px"
            />
          ) : (
            <span className={styles.brandMark} aria-hidden="true">
              <span className={styles.brandPents}>
                <span className={styles.brandPent}>R</span>
                <span className={styles.brandPent}>S</span>
              </span>
              <span className={styles.brandName}>Chef&apos;z</span>
            </span>
          )}
        </Link>

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${
                  pathname === link.href ? styles.linkActive : ""
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          className={styles.buyNow}
          href={siteConfig.amazonStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy Now
        </a>

        <button
          type="button"
          className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ul className={styles.overlayLinks}>
              {links.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.08 * index + 0.1,
                    ease: EASE,
                  }}
                >
                  <Link
                    href={link.href}
                    className={styles.overlayLink}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.08 * links.length + 0.1,
                  ease: EASE,
                }}
              >
                <a
                  href={siteConfig.amazonStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.overlayBuy}
                  onClick={closeMenu}
                >
                  Buy Now
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
