import { siteConfig } from "@/config/site";

/**
 * Home page. Placeholder for Phase 1.
 * Hero, brand story, 3D scenes and scroll storytelling arrive in later phases.
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
        {siteConfig.name}
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.25rem" }}>
        {siteConfig.tagline}
      </p>
      <p style={{ color: "var(--text-secondary)" }}>
        Phase 1 scaffold. The cinematic experience is on its way.
      </p>
    </main>
  );
}
