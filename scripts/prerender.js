// scripts/prerender.js
// Prerenders public routes at build time using Puppeteer.
// Generates static HTML snapshots in dist/ for SEO crawlability.

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { PUBLIC_ROUTES } from '../src/constants/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const PORT = 4173;
const MIN_FILE_SIZE = 1024; // 1KB minimum

/**
 * Create a simple static file server for the dist/ folder.
 * Serves files with correct MIME types and falls back to index.html for SPA routes.
 */
function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

    // If the file doesn't exist, serve index.html (SPA fallback)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return server;
}

/**
 * Determine the output file path for a given route.
 * "/" -> dist/index.html
 * "/features" -> dist/features/index.html
 */
function getOutputPath(route) {
  if (route === '/') {
    return path.join(DIST_DIR, 'index.html');
  }
  // Strip leading slash and create directory structure
  const routePath = route.replace(/^\//, '');
  return path.join(DIST_DIR, routePath, 'index.html');
}

/**
 * Main prerender function.
 * Starts a local server, launches Puppeteer, and prerenders each public route.
 */
async function prerender() {
  // Verify dist/ directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: dist/ directory not found. Run "vite build" first.');
    process.exit(1);
  }

  const server = createStaticServer();
  let browser = null;

  try {
    // Start the static file server
    await new Promise((resolve, reject) => {
      server.listen(PORT, (err) => {
        if (err) reject(err);
        else resolve();
      });
      server.on('error', reject);
    });

    console.log(`Static server started on http://localhost:${PORT}`);

    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const results = [];

    for (const route of PUBLIC_ROUTES) {
      const url = `http://localhost:${PORT}${route}`;
      const outputPath = getOutputPath(route);

      try {
        console.log(`Prerendering: ${route} ...`);

        const page = await browser.newPage();

        // Navigate and wait for network to be idle
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });

        // Get the full rendered HTML
        const html = await page.content();
        await page.close();

        // Validate file size
        const sizeBytes = Buffer.byteLength(html, 'utf-8');
        if (sizeBytes < MIN_FILE_SIZE) {
          console.error(
            `Error: Prerendered HTML for "${route}" is too small (${sizeBytes} bytes, minimum ${MIN_FILE_SIZE} bytes).`
          );
          process.exit(1);
        }

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write the prerendered HTML
        fs.writeFileSync(outputPath, html, 'utf-8');

        results.push({ route, outputPath, size: sizeBytes });
        console.log(`  ✓ ${route} -> ${path.relative(DIST_DIR, outputPath)} (${sizeBytes} bytes)`);
      } catch (err) {
        console.error(`Error prerendering route "${route}": ${err.message}`);
        process.exit(1);
      }
    }

    // Print summary
    console.log('\n─── Prerender Summary ───');
    console.log(`Routes prerendered: ${results.length}`);
    results.forEach(({ route, size }) => {
      console.log(`  ${route} — ${(size / 1024).toFixed(1)} KB`);
    });
    console.log('─────────────────────────');
    console.log('Prerendering completed successfully.');
  } catch (err) {
    console.error(`Prerender failed: ${err.message}`);
    process.exit(1);
  } finally {
    // Clean up
    if (browser) {
      await browser.close();
    }
    server.close();
  }
}

prerender();
