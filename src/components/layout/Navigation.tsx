"use client";

import { useCallback, useEffect, useState } from "react";
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
 * The wordmark switches to the brand logo image once it lands in
 * public/assets/brand/logo.png.
 */
export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        className={`${styles.bar} ${scrolled ? styles.scrolled : ""}`}
      >
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <span className={styles.brandBadge} aria-hidden="true">
            RS
          </span>
          <span className={styles.brandName}>{siteConfig.name}</span>
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
