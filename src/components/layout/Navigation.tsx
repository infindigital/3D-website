"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { products } from "@/config/products";
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

  /*
   * The bar floats over whatever is beneath it, and the home page now opens
   * on the one dark section of the site. A section marks itself with
   * data-dark-section="true" while it is showing something the light glass
   * would sit badly on; the bar switches to dark glass for as long as that
   * section covers the band it occupies, and switches back on its own when
   * the hero washes out to cream at the end.
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
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: EASE }}
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
