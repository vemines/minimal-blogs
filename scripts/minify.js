import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Danh sách các thư mục kiểm tra data.json để minify thành posts.json
const TARGET_DIRS = [
  path.join(rootDir, 'deloy', 'blogs'),
  path.join(rootDir, 'deloy', 'helpdesk'),
  path.join(rootDir, 'scripts'),
  path.join(rootDir, 'public')
];

function minifyFile(dirPath) {
  const dataPath = path.join(dirPath, 'data.json');
  const postsPath = path.join(dirPath, 'posts.json');

  if (!fs.existsSync(dataPath)) {
    return;
  }

  try {
    const rawContent = fs.readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(rawContent);

    // Minify bằng JSON.stringify không kèm khoảng trắng thụt lề
    const minified = JSON.stringify(parsed);
    fs.writeFileSync(postsPath, minified, 'utf-8');

    const originalBytes = Buffer.byteLength(rawContent, 'utf-8');
    const minifiedBytes = Buffer.byteLength(minified, 'utf-8');
    const savedPercent = originalBytes > 0 ? (((originalBytes - minifiedBytes) / originalBytes) * 100).toFixed(1) : 0;

    const relDataPath = path.relative(rootDir, dataPath);
    const relPostsPath = path.relative(rootDir, postsPath);

    console.log(`[MINIFY SUCCESS] ${relDataPath} -> ${relPostsPath}`);
    console.log(`  Gốc: ${(originalBytes / 1024).toFixed(2)} KB | Minified: ${(minifiedBytes / 1024).toFixed(2)} KB (Giảm ${savedPercent}%)\n`);
  } catch (err) {
    console.error(`[MINIFY ERROR] Không thể minify file ${dataPath}:`, err.message);
  }
}

console.log('=== BẮT ĐẦU MINIFY DATA.JSON -> POSTS.JSON ===\n');

for (const dir of TARGET_DIRS) {
  minifyFile(dir);
}

console.log('=== HOÀN TẤT ===');
