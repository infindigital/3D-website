# Environment Variables

Every API token, secret and configurable value lives in environment variables.
Nothing is hardcoded in the source. This document is the single source of truth
for what each variable does and where to get it.

## Setup

1. Copy `.env.example` to `.env.local` in the project root.
2. Fill in the values below.
3. Restart the dev server after any change.

On Vercel, add the same variables under
Project Settings > Environment Variables for Production, Preview and Development.

## Required variables

### NEXT_PUBLIC_WHATSAPP_NUMBER

- Optional. The number ships as a default in `src/config/site.ts`, so the order
  buttons work without it. Set this only to point the site at a different
  number without a code change; it overrides the default when present.
- Used by: every WhatsApp order button on the home page and both product pages.
- Format: country code followed by the number, digits only. No plus sign, no spaces, no dashes.
- Example: `918548043650` for the Indian number 0854-8043650.
- The site builds a `https://wa.me/<number>?text=<prefilled message>` link from it.
- Prefixed with `NEXT_PUBLIC_` because it must be readable in the browser. It is
  a public contact number, not a secret.

### NEXT_PUBLIC_SITE_URL

- Used by: SEO metadata (canonical URLs, Open Graph, Twitter cards, sitemap).
- Format: full origin with no trailing slash.
- Local development: `http://localhost:3000`
- Production: the final domain, for example `https://rschefz.com`

## Non-secret constants

The Amazon store URL is a public link, not a credential, so it lives in
`src/config/site.ts` rather than in an environment variable.

## Adding new variables

Rules followed by this project:

1. Never hardcode a token or secret in source code.
2. Every new variable gets added to `.env.example` with a comment.
3. Every new variable gets documented in this file.
4. Server-only secrets must NOT use the `NEXT_PUBLIC_` prefix. That prefix
   inlines the value into the browser bundle.
5. When a new token is required, development stops and the owner is asked
   before continuing.

No other tokens are required at this stage of the project.
