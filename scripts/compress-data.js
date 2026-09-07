import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'posts.json');
const outputScriptPath = path.join(__dirname, 'posts.txt');
const outputPublicPath = path.join(__dirname, '../public/posts.txt');

if (!fs.existsSync(inputPath)) {
  console.error(`Error: Cannot find input file at ${inputPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(inputPath, 'utf-8');
const compressedBuffer = zlib.gzipSync(Buffer.from(rawData, 'utf-8'), { level: 9 });

// Write to scripts/posts.txt
fs.writeFileSync(outputScriptPath, compressedBuffer);

// Write to public/posts.txt
fs.writeFileSync(outputPublicPath, compressedBuffer);

const originalKb = (Buffer.byteLength(rawData, 'utf-8') / 1024).toFixed(2);
const compressedKb = (compressedBuffer.length / 1024).toFixed(2);
const ratio = ((1 - compressedBuffer.length / Buffer.byteLength(rawData, 'utf-8')) * 100).toFixed(1);

console.log(`[GZIP COMPRESS] Success!`);
console.log(`- Source: ${inputPath} (${originalKb} KB)`);
console.log(`- Target (Scripts): ${outputScriptPath} (${compressedKb} KB)`);
console.log(`- Target (Public):  ${outputPublicPath} (${compressedKb} KB)`);
console.log(`- Compression: -${ratio}% reduction in size.`);
