/**
 * Generate a minimal OG image placeholder (1200x630 PNG)
 * Uses pure Node.js with zlib - no external dependencies required.
 * Creates a branded purple gradient-style image with "OnlySplit" text rendered as simple shapes.
 */

import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WIDTH = 1200;
const HEIGHT = 630;

// Create raw pixel data (RGBA)
const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);

// Fill with a gradient background (dark purple to indigo - matching OnlySplit brand)
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    const idx = (y * WIDTH + x) * 4;
    
    // Gradient from top-left (dark purple) to bottom-right (indigo)
    const gradientFactor = (x / WIDTH + y / HEIGHT) / 2;
    
    const r = Math.round(30 + gradientFactor * 40);   // 30 -> 70
    const g = Math.round(10 + gradientFactor * 20);   // 10 -> 30
    const b = Math.round(80 + gradientFactor * 80);   // 80 -> 160
    
    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = 255; // Alpha
  }
}

// Draw a centered rectangle as a "card" background
const cardX = 200;
const cardY = 150;
const cardW = 800;
const cardH = 330;
const cardRadius = 20;

for (let y = cardY; y < cardY + cardH; y++) {
  for (let x = cardX; x < cardX + cardW; x++) {
    // Simple rounded corners check
    const dx = Math.min(x - cardX, cardX + cardW - 1 - x);
    const dy = Math.min(y - cardY, cardY + cardH - 1 - y);
    if (dx < cardRadius && dy < cardRadius) {
      const dist = Math.sqrt((cardRadius - dx) ** 2 + (cardRadius - dy) ** 2);
      if (dist > cardRadius) continue;
    }
    
    const idx = (y * WIDTH + x) * 4;
    // Semi-transparent white card
    pixels[idx] = 255;
    pixels[idx + 1] = 255;
    pixels[idx + 2] = 255;
    pixels[idx + 3] = 30; // Very transparent
  }
}

// Draw "OnlySplit" text using a simple block font approach
// Each letter is defined as a 5x7 grid
const FONT = {
  'O': [
    '01110',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '01110',
  ],
  'n': [
    '00000',
    '00000',
    '11110',
    '10001',
    '10001',
    '10001',
    '10001',
  ],
  'l': [
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '01110',
  ],
  'y': [
    '00000',
    '00000',
    '10001',
    '10001',
    '01111',
    '00001',
    '01110',
  ],
  'S': [
    '01110',
    '10001',
    '10000',
    '01110',
    '00001',
    '10001',
    '01110',
  ],
  'p': [
    '00000',
    '00000',
    '11110',
    '10001',
    '11110',
    '10000',
    '10000',
  ],
  'i': [
    '00100',
    '00000',
    '00100',
    '00100',
    '00100',
    '00100',
    '00100',
  ],
  't': [
    '00100',
    '00100',
    '01110',
    '00100',
    '00100',
    '00100',
    '00011',
  ],
};

const text = 'OnlySplit';
const scale = 8; // Each pixel in the font becomes 8x8 pixels
const letterWidth = 5 * scale;
const letterSpacing = 2 * scale;
const totalTextWidth = text.length * letterWidth + (text.length - 1) * letterSpacing;
const startX = Math.round((WIDTH - totalTextWidth) / 2);
const startY = Math.round((HEIGHT - 7 * scale) / 2);

for (let charIdx = 0; charIdx < text.length; charIdx++) {
  const char = text[charIdx];
  const charDef = FONT[char];
  if (!charDef) continue;
  
  const charStartX = startX + charIdx * (letterWidth + letterSpacing);
  
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (charDef[row][col] === '1') {
        // Draw a scaled pixel block
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = charStartX + col * scale + sx;
            const py = startY + row * scale + sy;
            if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
              const idx = (py * WIDTH + px) * 4;
              pixels[idx] = 255;     // White text
              pixels[idx + 1] = 255;
              pixels[idx + 2] = 255;
              pixels[idx + 3] = 255;
            }
          }
        }
      }
    }
  }
}

// Draw a subtitle "Premium Expense Splitting" below
const subtitle = 'Premium Expense Splitting';
const subScale = 3;
const SMALL_FONT = {
  'P': ['1110', '1001', '1110', '1000', '1000'],
  'r': ['0000', '1011', '1100', '1000', '1000'],
  'e': ['0000', '0110', '1111', '1000', '0110'],
  'm': ['0000', '1111', '1011', '1001', '1001'],
  'i': ['01', '00', '01', '01', '01'],
  'u': ['0000', '0000', '1001', '1001', '0110'],
  ' ': ['00', '00', '00', '00', '00'],
  'E': ['1111', '1000', '1110', '1000', '1111'],
  'x': ['0000', '0000', '1001', '0110', '1001'],
  'p': ['0000', '1110', '1001', '1110', '1000'],
  'n': ['0000', '0000', '1110', '1001', '1001'],
  's': ['0000', '0110', '1000', '0110', '1110'],
  'S': ['0111', '1000', '0110', '0001', '1110'],
  'l': ['10', '10', '10', '10', '01'],
  't': ['010', '111', '010', '010', '001'],
  'g': ['0000', '0111', '1001', '0111', '1110'],
};

// Simple subtitle render
const subStartY = startY + 7 * scale + 30;
let subX = 0;

// Calculate subtitle width first
let subTotalWidth = 0;
for (const ch of subtitle) {
  const def = SMALL_FONT[ch];
  if (def) {
    subTotalWidth += def[0].length * subScale + subScale;
  } else {
    subTotalWidth += 3 * subScale;
  }
}
const subStartX = Math.round((WIDTH - subTotalWidth) / 2);
subX = subStartX;

for (const ch of subtitle) {
  const def = SMALL_FONT[ch];
  if (!def) {
    subX += 3 * subScale;
    continue;
  }
  
  const charWidth = def[0].length;
  for (let row = 0; row < def.length; row++) {
    for (let col = 0; col < charWidth; col++) {
      if (def[row][col] === '1') {
        for (let sy = 0; sy < subScale; sy++) {
          for (let sx = 0; sx < subScale; sx++) {
            const px = subX + col * subScale + sx;
            const py = subStartY + row * subScale + sy;
            if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
              const idx = (py * WIDTH + px) * 4;
              pixels[idx] = 200;
              pixels[idx + 1] = 200;
              pixels[idx + 2] = 230;
              pixels[idx + 3] = 255;
            }
          }
        }
      }
    }
  }
  subX += charWidth * subScale + subScale;
}

// Encode as PNG
function createPNG(width, height, rgbaPixels) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // IDAT chunk - raw pixel data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawData[rowStart] = 0; // No filter
    rgbaPixels.copy(rawData, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  
  const compressed = deflateSync(rawData, { level: 6 });
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate and write the PNG
const png = createPNG(WIDTH, HEIGHT, pixels);
const outputPath = resolve(__dirname, '..', 'public', 'og-image.png');
writeFileSync(outputPath, png);

console.log(`✓ Generated og-image.png (${WIDTH}x${HEIGHT}) at ${outputPath}`);
console.log(`  File size: ${(png.length / 1024).toFixed(1)} KB`);
