import { getAmazonUrl, getWhatsAppUrl } from "@/config/site";
import styles from "./BuyButtons.module.css";

interface BuyButtonsProps {
  whatsappMessage?: string;
  /**
   * Where Amazon goes. On a product's page this is that product's own store
   * page, so the button lands on the pack being read about rather than on the
   * storefront. Omitted — in the footer, say, where no one product is in
   * view — it falls back to the storefront.
   */
  amazonUrl?: string;
  className?: string;
}

/**
 * The two purchase CTAs used across the site.
 * The WhatsApp button only renders when a number is configured, see
 * getWhatsAppUrl and docs/ENVIRONMENT.md.
 */
export default function BuyButtons({
  whatsappMessage,
  amazonUrl,
  className,
}: BuyButtonsProps) {
  const whatsappUrl = getWhatsAppUrl(
    whatsappMessage ?? "Hi RS Chef'z, I would like to order your masalas.",
  );
  const shopUrl = getAmazonUrl(amazonUrl);

  return (
    <div className={className ? `${styles.row} ${className}` : styles.row}>
      {whatsappUrl && (
        <a
          className={`${styles.button} ${styles.whatsapp}`}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 18.03a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.8.82-3-.2-.31a8.08 8.08 0 0 1-1.24-4.31c0-4.48 3.64-8.12 8.12-8.12s8.12 3.64 8.12 8.12-3.64 8.13-8.12 8.13Zm4.45-6.08c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21a7.34 7.34 0 0 1-1.35-1.68c-.14-.24-.02-.38.1-.5.11-.11.25-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.65.3-.22.24-.85.83-.85 2.03s.87 2.35 1 2.51c.12.16 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
          </svg>
          Buy on WhatsApp
        </a>
      )}
      <a
        className={`${styles.button} ${styles.amazon}`}
        href={shopUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Shop on Amazon
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7" />
          <path d="M9 7h8v8" />
        </svg>
      </a>
    </div>
  );
}
