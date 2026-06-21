import { Helmet } from 'react-helmet-async';

/**
 * ProtectedSEO Component
 *
 * Injects a noindex/nofollow robots directive for protected (authenticated) routes.
 * Suppresses all other SEO metadata — no OG tags, Twitter cards, canonical links,
 * or JSON-LD structured data are rendered.
 *
 * Usage: Place inside protected route layouts to ensure search engines never index
 * authenticated pages.
 */
function ProtectedSEO() {
  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
}

export default ProtectedSEO;
