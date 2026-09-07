import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Predefined tag sets
const TECH_TAGS = [
  { id: 1, name: "Performance" },
  { id: 2, name: "Frontend" },
  { id: 3, name: "Design System" },
  { id: 4, name: "Browser API" },
  { id: 5, name: "Architecture" },
  { id: 6, name: "Offline Cache" },
  { id: 7, name: "React 19" },
  { id: 8, name: "Security" },
  { id: 9, name: "Web APIs" },
  { id: 10, name: "Node.js" },
  { id: 11, name: "Runtimes" },
  { id: 12, name: "Engineering" },
  { id: 13, name: "TypeScript" },
  { id: 14, name: "DevOps" },
  { id: 15, name: "Components" },
  { id: 16, name: "Tailwind CSS" },
  { id: 17, name: "Markdown" },
  { id: 18, name: "UI / UX" },
  { id: 19, name: "Clean Code" },
  { id: 20, name: "JavaScript" },
  { id: 21, name: "Web Development" },
  { id: 22, name: "Best Practices" },
  { id: 23, name: "Testing" },
  { id: 24, name: "Vite" }
];

const LOREM_TAGS = [
  { id: 1, name: "Lorem" },
  { id: 2, name: "Ipsum" },
  { id: 3, name: "Dolor" },
  { id: 4, name: "Sit" },
  { id: 5, name: "Amet" },
  { id: 6, name: "Consectetur" },
  { id: 7, name: "Adipiscing" },
  { id: 8, name: "Elit" },
  { id: 9, name: "Tempor" },
  { id: 10, name: "Incididunt" },
  { id: 11, name: "Labore" },
  { id: 12, name: "Dolore" },
  { id: 13, name: "Magna" },
  { id: 14, name: "Aliqua" },
  { id: 15, name: "Components" },
  { id: 16, name: "Showcase" },
  { id: 17, name: "Markdown" },
  { id: 18, name: "Veniam" },
  { id: 19, name: "Nostrud" },
  { id: 20, name: "Exercitation" },
  { id: 21, name: "Ullamco" },
  { id: 22, name: "Laboris" }
];

const isLoremMode = process.argv.includes('--lorem');
const tagsToGenerate = isLoremMode ? LOREM_TAGS : TECH_TAGS;

const publicTagsPath = path.resolve(__dirname, '../public/tags.json');
const distTagsPath = path.resolve(__dirname, '../dist/tags.json');

const jsonContent = JSON.stringify(tagsToGenerate, null, 2) + '\n';

fs.writeFileSync(publicTagsPath, jsonContent, 'utf-8');
console.log(`Generated ${tagsToGenerate.length} tags (${isLoremMode ? 'Lorem Ipsum' : 'Tech Blog'}) in ${publicTagsPath}`);

if (fs.existsSync(path.resolve(__dirname, '../dist'))) {
  fs.writeFileSync(distTagsPath, jsonContent, 'utf-8');
  console.log(`Updated ${distTagsPath}`);
}
