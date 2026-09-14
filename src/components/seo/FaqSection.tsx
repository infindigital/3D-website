import styles from "./FaqSection.module.css";

export interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: Faq[];
  /** The product's accent, so the eyebrow belongs to the page it sits on */
  accentColor?: string;
  heading?: string;
}

/**
 * The questions, visible and open.
 *
 * This renders the same array the page's FAQPage JSON-LD is built from.
 * That is the requirement rather than a nicety: FAQ structured data is only
 * eligible when the question and answer are both present on the page for a
 * reader, and building both from one source is the only way to be sure they
 * stay that way as the copy changes.
 *
 * The H2 is the section's, and every question is an H3 under it, so the
 * outline runs H1 → H2 → H3 without a skipped level.
 */
export default function FaqSection({
  faqs,
  accentColor,
  heading = "Frequently asked questions",
}: FaqSectionProps) {
  if (!faqs.length) return null;

  return (
    <section
      className={styles.faq}
      style={accentColor ? ({ "--accent": accentColor } as React.CSSProperties) : undefined}
      aria-labelledby="faq-heading"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Questions</p>
        <h2 className={styles.heading} id="faq-heading">
          {heading}
        </h2>

        <div className={styles.list}>
          {faqs.map((faq) => (
            <div className={styles.item} key={faq.question}>
              <h3 className={styles.question}>{faq.question}</h3>
              <p className={styles.answer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
