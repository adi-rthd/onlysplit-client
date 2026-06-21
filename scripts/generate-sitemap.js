// scripts/generate-sitemap.js
// Generates an XML sitemap for all public routes at dist/sitemap.xml

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PUBLIC_ROUTES, AUTH_ROUTES } from '../src/constants/routes.js';
import { ROUTE_SEO } from '../src/constants/seoConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://onlysplit.in';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'dist');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'sitemap.xml');

function generateSitemap() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const urlEntries = PUBLIC_ROUTES.map((route) => {
      const seoConfig = ROUTE_SEO[route] || {};
      const changefreq = seoConfig.changefreq || 'monthly';
      const priority = seoConfig.priority !== undefined ? seoConfig.priority : 0.5;
      const loc = route === '/' ? `${BASE_URL}/` : `${BASE_URL}${route}`;

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;

    // Create dist directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');

    console.log(`Sitemap generated successfully with ${PUBLIC_ROUTES.length} URLs at ${OUTPUT_PATH}`);
  } catch (error) {
    console.error(`Sitemap generation failed: ${error.message}`);
    process.exit(1);
  }
}

generateSitemap();
