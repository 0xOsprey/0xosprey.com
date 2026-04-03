#!/usr/bin/env node
/**
 * Variable Typographic ASCII Art Generator
 * Inspired by chenglou/pretext — uses font-weight and opacity
 * variations on a proportional font to create high-definition ASCII art.
 *
 * Outputs an HTML fragment where each character is a <span> with
 * a CSS class encoding its brightness level (0-9).
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Character palette ordered by visual density (light → dark)
// Using characters that look good in Georgia/Palatino proportional font
const CHARS_BY_DENSITY = ' .·:;+*xX#@';

// 10 brightness levels, each maps to a CSS class with font-weight + opacity
// Level 0 = darkest (background), Level 9 = brightest (white)
const LEVELS = 10;

async function generateAscii(imagePath, { width = 120, invert = true } = {}) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  // Calculate height maintaining aspect ratio
  // Characters are ~2x taller than wide, so halve the height
  const aspectRatio = metadata.height / metadata.width;
  const height = Math.round(width * aspectRatio * 0.48);

  // Resize and convert to grayscale
  const { data, info } = await image
    .resize(width, height, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lines = [];

  for (let y = 0; y < info.height; y++) {
    let line = [];
    for (let x = 0; x < info.width; x++) {
      let brightness = data[y * info.width + x]; // 0-255

      // Invert so white = bird, black = background (for dark theme)
      if (invert) brightness = 255 - brightness;

      // Map to level 0-9
      const level = Math.min(LEVELS - 1, Math.floor(brightness / 256 * LEVELS));

      // Pick character based on density
      const charIdx = Math.floor(brightness / 256 * CHARS_BY_DENSITY.length);
      const ch = CHARS_BY_DENSITY[Math.min(charIdx, CHARS_BY_DENSITY.length - 1)];

      line.push({ ch, level });
    }
    lines.push(line);
  }

  return lines;
}

function toHTML(lines) {
  let html = '';
  for (const line of lines) {
    // Run-length encode spans with same level
    let i = 0;
    while (i < line.length) {
      const { ch, level } = line[i];
      let run = ch;
      let j = i + 1;
      while (j < line.length && line[j].level === level) {
        run += line[j].ch;
        j++;
      }
      if (level === 0) {
        // Background - just spaces
        html += run;
      } else {
        html += `<span class="b${level}">${run}</span>`;
      }
      i = j;
    }
    html += '\n';
  }
  return html;
}

function toPlainText(lines) {
  return lines.map(line => line.map(c => c.ch).join('')).join('\n');
}

async function main() {
  const imagePath = process.argv[2] || '/tmp/osprey_flight.jpg';
  const width = parseInt(process.argv[3] || '100');

  console.error(`Processing ${imagePath} at width ${width}...`);

  const lines = await generateAscii(imagePath, { width, invert: false });

  // Output both HTML and plain text versions
  const htmlContent = toHTML(lines);
  const plainContent = toPlainText(lines);

  fs.writeFileSync('/tmp/ascii-art.html', htmlContent);
  fs.writeFileSync('/tmp/ascii-art.txt', plainContent);

  console.error(`Generated ${lines.length} lines x ${lines[0]?.length || 0} chars`);
  console.error('HTML: /tmp/ascii-art.html');
  console.error('Plain: /tmp/ascii-art.txt');

  // Also output the CSS classes needed
  const css = `
/* Variable typographic ASCII brightness levels */
/* Font: Georgia (proportional) — weight + opacity encode brightness */
.ascii-art {
  font-family: Georgia, 'Palatino Linotype', Palatino, serif;
  font-size: 8px;
  line-height: 1.05;
  letter-spacing: 0.3px;
  white-space: pre;
  color: var(--fg);
}
.b0 { opacity: 0; }
.b1 { opacity: 0.08; font-weight: 300; }
.b2 { opacity: 0.16; font-weight: 300; }
.b3 { opacity: 0.25; font-weight: 400; }
.b4 { opacity: 0.36; font-weight: 400; }
.b5 { opacity: 0.48; font-weight: 500; }
.b6 { opacity: 0.60; font-weight: 600; font-style: italic; }
.b7 { opacity: 0.74; font-weight: 700; }
.b8 { opacity: 0.88; font-weight: 700; font-style: italic; }
.b9 { opacity: 1.0; font-weight: 800; }
`;
  fs.writeFileSync('/tmp/ascii-art.css', css);
  console.error('CSS: /tmp/ascii-art.css');
}

main().catch(console.error);
