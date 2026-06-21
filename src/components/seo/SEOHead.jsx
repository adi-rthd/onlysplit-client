import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SEO_DEFAULTS } from '../../constants/seoConfig';

/**
 * SEOHead — Reusable metadata component for managing document head tags.
 *
 * Renders title, meta description, keywords, canonical link, Open Graph tags,
 * and Twitter Card tags via react-helmet-async.
 *
 * Default values are drawn from SEO_DEFAULTS when a prop is not provided (undefined).
 * If a prop is explicitly set to an empty string (""), the corresponding tag is omitted entirely.
 */
function SEOHead({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  ogUrl,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
}) {
  const { pathname } = useLocation();

  // Apply defaults for undefined props
  const resolvedTitle = title === undefined ? SEO_DEFAULTS.defaultTitle : title;
  const resolvedDescription =
    description === undefined ? SEO_DEFAULTS.defaultDescription : description;
  const resolvedCanonical =
    canonical === undefined ? SEO_DEFAULTS.baseUrl + pathname : canonical;
  const resolvedOgImage =
    ogImage === undefined ? SEO_DEFAULTS.defaultImage : ogImage;
  const resolvedTwitterCard =
    twitterCard === undefined ? SEO_DEFAULTS.twitterCard : twitterCard;
  const resolvedOgType = ogType || 'website';

  // Derive OG/Twitter tags from other resolved values when not explicitly set
  const resolvedOgTitle = ogTitle === undefined ? resolvedTitle : ogTitle;
  const resolvedOgDescription =
    ogDescription === undefined ? resolvedDescription : ogDescription;
  const resolvedOgUrl = ogUrl === undefined ? resolvedCanonical : ogUrl;
  const resolvedTwitterTitle =
    twitterTitle === undefined ? resolvedOgTitle : twitterTitle;
  const resolvedTwitterDescription =
    twitterDescription === undefined ? resolvedOgDescription : twitterDescription;
  const resolvedTwitterImage =
    twitterImage === undefined ? resolvedOgImage : twitterImage;

  return (
    <Helmet>
      {/* Title */}
      {resolvedTitle !== '' && <title>{resolvedTitle}</title>}

      {/* Meta description */}
      {resolvedDescription !== '' && (
        <meta name="description" content={resolvedDescription} />
      )}

      {/* Keywords */}
      {keywords !== undefined && keywords !== '' && (
        <meta name="keywords" content={keywords} />
      )}

      {/* Canonical URL */}
      {resolvedCanonical !== '' && (
        <link rel="canonical" href={resolvedCanonical} />
      )}

      {/* Robots directive */}
      {robots !== undefined && robots !== '' && (
        <meta name="robots" content={robots} />
      )}

      {/* Open Graph tags */}
      <meta property="og:site_name" content="OnlySplit" />
      {resolvedOgType !== '' && (
        <meta property="og:type" content={resolvedOgType} />
      )}
      {resolvedOgTitle !== '' && (
        <meta property="og:title" content={resolvedOgTitle} />
      )}
      {resolvedOgDescription !== '' && (
        <meta property="og:description" content={resolvedOgDescription} />
      )}
      {resolvedOgImage !== '' && (
        <meta property="og:image" content={resolvedOgImage} />
      )}
      {resolvedOgUrl !== '' && (
        <meta property="og:url" content={resolvedOgUrl} />
      )}

      {/* Twitter Card tags */}
      {resolvedTwitterCard !== '' && (
        <meta name="twitter:card" content={resolvedTwitterCard} />
      )}
      {resolvedTwitterTitle !== '' && (
        <meta name="twitter:title" content={resolvedTwitterTitle} />
      )}
      {resolvedTwitterDescription !== '' && (
        <meta name="twitter:description" content={resolvedTwitterDescription} />
      )}
      {resolvedTwitterImage !== '' && (
        <meta name="twitter:image" content={resolvedTwitterImage} />
      )}
    </Helmet>
  );
}

export default SEOHead;
