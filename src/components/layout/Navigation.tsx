"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { products } from "@/config/products";
import {
  HERO_BACKSTOP_MS,
  HERO_BRAND_EVENT,
  HERO_CLAIM_MS,
  HERO_HOLD_EVENT,
  HERO_OPEN_EVENT,
  markNavigated,
} from "@/utils/heroOpen";
import styles from "./Navigation.module.css";

/* Listening has to be in place before the hero's layout effect runs, and a
   layout effect on the server is a warning about nothing. */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const EASE = [0.22, 1, 0.36, 1] as const;

const links = [
  { href: "/", label: "Home" },
  ...products.map((p) => ({
    href: `/products/${p.slug}`,
    label: p.shortName,
  })),
];

/**
 * One spelling for one page.
 *
 * Which link is the current one is decided by comparing paths, so the two
 * have to agree on how a path is written. They do on Vercel, where the URL
 * is always the clean one. They need not on Apache, where the same page also
 * answers to a trailing slash and to the .html the file actually has — and a
 * bar that marks nothing, or marks the wrong thing, is the visible result of
 * that disagreement.
 */
function samePage(a: string, b: string): boolean {
  const tidy = (path: string) => {
    const clean = path.replace(/\.html$/i, "").replace(/\/+$/, "");
    return clean === "" ? "/" : clean;
  };
  return tidy(a) === tidy(b);
}

/**
 * Floating glass navigation. Sticky, minimal, blurs the content behind it.
 * The wordmark echoes the logo identity, white RS in green pentagons and
 * Chef'z in the logo red, and switches to the real brand logo image once
 * it lands in public/assets/brand/logo.png (gated in layout.tsx).
 */
export default function Navigation({ hasLogo = false }: { hasLogo?: boolean }) {
  const routerPath = usePathname();

  /*
   * Which page the bar believes it is on.
   *
   * Seeded from the router, which is right, and then kept honest against the
   * address bar, which is the thing the reader can actually see. A client
   * reported the red mark staying on HOME after moving to a product page —
   * that is this value going stale, and it is the only way the bar can be
   * wrong about which page it is on.
   *
   * I could not reproduce it, so this is not a diagnosis; it is a floor. The
   * router still drives the common case and nothing here waits on it. There
   * is no event for a pushState navigation, so the check has to be a poll,
   * and it costs one string comparison twice a second.
   */
  const [pathname, setPathname] = useState(routerPath);

  useEffect(() => {
    const read = () =>
      setPathname((prev) => {
        const now = window.location.pathname;
        return prev === now ? prev : now;
      });

    read();
    window.addEventListener("popstate", read);
    const tick = window.setInterval(read, 500);

    return () => {
      window.removeEventListener("popstate", read);
      window.clearInterval(tick);
    };
  }, [routerPath]);

  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /*
   * Who owns the bar.
   *
   *   "waiting"  a hero might be about to claim it, and we are giving it
   *              until HERO_CLAIM_MS to say so
   *   "held"     a hero has claimed it and will release it on its own beats
   *   "none"     nobody is playing an intro; the bar is simply the bar
   *
   * Only the first paint of the home page starts out waiting. Every other
   * page starts at "none", which is what puts the bar in the served HTML
   * rather than leaving the page with no navigation at all until the
   * JavaScript has finished arriving — on a six-times throttled phone that
   * gap was six and a half seconds.
   */
  /* State rather than a ref: this is read while rendering, and it is a
     constant for the life of the page either way. */
  const [firstPath] = useState(pathname);
  const openingHome = pathname === "/" && firstPath === "/";
  const [owner, setOwner] = useState<"waiting" | "held" | "none">(
    openingHome ? "waiting" : "none",
  );
  const [opened, setOpened] = useState(false);
  const [landed, setLanded] = useState(false);
  const [was, setWas] = useState(pathname);

  /*
   * When the bar comes down, and when the mark on it arrives.
   *
   * Both are the hero's to say. It opens with the logo standing in the
   * middle of the film and flies it up here, so the bar keeps its own place
   * empty until that one has landed on it — two of the same mark on screen
   * at once is the one thing that would show the join.
   *
   * Neither is on a timer that competes with the intro. See heroOpen.ts:
   * the timer that used to do this ran on wall-clock time while the intro
   * ran on animation frames, and on a slow phone the bar slid down on top of
   * an orange sheet that had not finished closing.
   */
  const revealed = owner === "none" || opened;
  const branded = owner === "none" || landed;

  /*
   * Exactly one link is the current one, decided once here rather than by
   * each link deciding for itself.
   *
   * A client reported the bar showing two pages marked at the same time —
   * HOME still lit on a product page, with the product lit beside it. Asking
   * each link the same question independently is what makes that shape of
   * fault expressible at all; picking a single winner first means the bar
   * cannot say it twice, whatever the path turns out to be. The longest
   * match wins, so a product page is never answered by the home link.
   */
  const activeHref = links.reduce<string | null>(
    (best, link) =>
      samePage(pathname, link.href) &&
      (best === null || link.href.length > best.length)
        ? link.href
        : best,
    null,
  );

  /* Moving between pages hands the bar back. The intro plays on a page load
     rather than on every visit to "/", so arriving here from somewhere else
     must not take the navigation away again. */
  if (was !== pathname) {
    markNavigated();
    setWas(pathname);
    setOwner("none");
    setOpened(false);
    setLanded(false);
  }

  useIsoLayoutEffect(() => {
    if (owner === "none") return;

    /* A reader who has asked for less motion is served no intro at all, so
       there is nothing to wait for and nothing to wait with. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOwner("none");
      return;
    }

    /* The hero claims the bar from a layout effect of its own, which runs
       after this one, so the listener is always in place in time. */
    const claim = () => setOwner("held");
    const reveal = () => setOpened(true);
    const land = () => setLanded(true);

    window.addEventListener(HERO_HOLD_EVENT, claim);
    window.addEventListener(HERO_OPEN_EVENT, reveal);
    window.addEventListener(HERO_BRAND_EVENT, land);

    /* Nothing may leave a site without its navigation. If no hero speaks up
       there is no intro to wait for; if one does and then dies, the backstop
       is long enough that it cannot be mistaken for a slow intro. */
    const release = () => {
      setOwner("none");
      window.removeEventListener(HERO_HOLD_EVENT, claim);
    };
    const timer = window.setTimeout(
      release,
      owner === "held" ? HERO_BACKSTOP_MS : HERO_CLAIM_MS,
    );

    return () => {
      window.removeEventListener(HERO_HOLD_EVENT, claim);
      window.removeEventListener(HERO_OPEN_EVENT, reveal);
      window.removeEventListener(HERO_BRAND_EVENT, land);
      window.clearTimeout(timer);
    };
  }, [owner]);

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
    <>
      {/*
        The home page serves its bar off screen, because script is about to
        cover the room with the intro. If script never arrives, nothing ever
        brings it back — and a site with no navigation at all is a worse
        answer than one whose bar did not make an entrance. An !important
        declaration in the sheet outranks the inline style the animation
        leaves behind, so this needs nothing to run.
      */}
      <noscript>
        <style>{`.${styles.header}{opacity:1!important;transform:none!important}`}</style>
      </noscript>

    <motion.header
      className={styles.header}
      /* What the server writes, and so what a visitor sees before any of
         this has loaded: off screen only where an intro is about to cover
         the room, and in place everywhere else. */
      initial={openingHome ? { y: -110, opacity: 0 } : { y: 0, opacity: 1 }}
      animate={revealed ? { y: 0, opacity: 1 } : { y: -110, opacity: 0 }}
      /* Coming down is the designed entrance. Going back up is not an
         animation at all — it only ever happens before the first paint, as
         the hero takes the room. */
      transition={
        revealed ? { duration: 1, delay: 0.15, ease: EASE } : { duration: 0 }
      }
    >
      <nav
        aria-label="Main"
        className={`${styles.bar} ${scrolled ? styles.scrolled : ""} ${
          onDark ? styles.onDark : ""
        }`}
      >
        <Link
          href="/"
          className={`${styles.brand} ${branded ? "" : styles.brandHeld}`}
          /* Where the hero's flying logo is aiming. */
          data-brand-anchor="true"
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
                  link.href === activeHref ? styles.linkActive : ""
                }`}
                aria-current={link.href === activeHref ? "page" : undefined}
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
    </>
  );
}
