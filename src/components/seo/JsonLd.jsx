import { Helmet } from 'react-helmet-async';

/**
 * JsonLd component renders JSON-LD structured data into the document head.
 * Validates the data prop before rendering. If invalid, logs a warning and skips rendering.
 *
 * @param {{ data: object }} props
 * @returns {React.ReactElement|null}
 */
function JsonLd({ data }) {
  // Validate that data is a valid object (not null, not undefined, not a primitive)
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('JsonLd: Invalid data prop. Expected a non-null object.');
    return null;
  }

  // Validate that data is serializable as valid JSON
  let jsonString;
  try {
    jsonString = JSON.stringify(data);
  } catch (error) {
    console.warn('JsonLd: Failed to serialize data to JSON.', error);
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{jsonString}</script>
    </Helmet>
  );
}

export default JsonLd;
