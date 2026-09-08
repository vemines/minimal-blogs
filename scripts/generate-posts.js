import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleTopics = [
  {
    title: "UI & Component Showcase: Markdown Styling & Component System",
    summary: "Interactive demonstration of all supported rich markdown elements, alerts, code blocks, tab switchers, and media components.",
    tags: [15, 16, 17]
  },
  {
    title: "Exploring Modern Frontend Architectures and Micro-Frontends",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: [2, 5, 21]
  },
  {
    title: "Understanding Native Browser DecompressionStream for High-Speed Web Apps",
    summary: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    tags: [1, 4, 20]
  },
  {
    title: "A Deep Dive into React 19 Compiler, Actions, and Server Primitives",
    summary: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    tags: [7, 8, 20]
  },
  {
    title: "Optimizing Tailwind CSS v4 Engine for Lightning Fast Builds",
    summary: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    tags: [15, 16, 21]
  },
  {
    title: "Designing Accessible & Minimalist Interfaces for Technical Readers",
    summary: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra.",
    tags: [1, 18, 22]
  },
  {
    title: "Building Resilient Offline-First Web Applications with Local Storage and Caching",
    summary: "Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus.",
    tags: [2, 6, 21]
  },
  {
    title: "Effective State Management Strategies in Large-Scale TypeScript Codebases",
    summary: "Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus vestibulum volutpat sapien arcu sed augue.",
    tags: [2, 13, 20]
  },
  {
    title: "Benchmarking JavaScript Runtimes: Node.js, Bun, and Deno in 2026",
    summary: "Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.",
    tags: [10, 11, 21]
  },
  {
    title: "Mastering Git Workflows, Clean Commits, and Automated Release Pipelines",
    summary: "Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.",
    tags: [2, 14, 22]
  },
  {
    title: "Securing Modern Web Apps: Content Security Policy, Sanitization, and XSS Defense",
    summary: "Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.",
    tags: [8, 9, 21]
  },
  {
    title: "High Performance Data Structures and Algorithms in Modern Web Development",
    summary: "Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.",
    tags: [6, 18, 21]
  },
  {
    title: "Zero-Latency Client-Side Routing and Speculative Prefetching Techniques",
    summary: "Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales.",
    tags: [4, 6, 20]
  },
  {
    title: "Clean Code Principles: Refactoring Smells into Elegant TypeScript Solutions",
    summary: "Pellentesque posuere. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus.",
    tags: [7, 19, 22]
  },
  {
    title: "Typography & High-Contrast Design in Developer Documentation",
    summary: "Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae.",
    tags: [15, 17, 22]
  },
  {
    title: "Memory Profiling and Garbage Collection Optimization in Single Page Apps",
    summary: "Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus.",
    tags: [18, 19, 21]
  },
  {
    title: "Practical Guide to Asynchronous Concurrency and Cancellation in JavaScript",
    summary: "Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.",
    tags: [2, 8, 20]
  },
  {
    title: "CSS Containment, Layout Thrashing, and Frame Budget Engineering",
    summary: "Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a.",
    tags: [18, 20, 22]
  },
  {
    title: "The Evolution of Component-Driven Design Systems in Modern Web",
    summary: "Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula.",
    tags: [3, 15, 16]
  },
  {
    title: "Continuous Integration & Automated Testing Patterns for Minimalist Blogs",
    summary: "Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui.",
    tags: [1, 19, 22]
  }
];

const totalCount = process.argv.includes('--all') ? 80 : 2;
const posts = [];

for (let i = 0; i < totalCount; i++) {
  const template = sampleTopics[i % sampleTopics.length];
  const dateNum = (1 + (i % 28)).toString().padStart(2, '0');
  const monthNum = (1 + ((i * 3) % 12)).toString().padStart(2, '0');
  const hour = (8 + (i % 14)).toString().padStart(2, '0');
  const min = ((i * 17) % 60).toString().padStart(2, '0');
  const sec = ((i * 23) % 60).toString().padStart(2, '0');
  const year = 2026;
  const datetimeStr = `${year}-${monthNum}-${dateNum} ${hour}:${min}:${sec}`;

  if (i === 0) {
    posts.push({
      id: 0,
      title: template.title,
      summary: template.summary,
      datetime: `2026-03-12 10:30:00`,
      tags: [15, 16, 17]
    });
  } else {
    let title = template.title;
    if (i >= sampleTopics.length) {
      const variantSuffix = Math.floor(i / sampleTopics.length) + 1;
      title = `${template.title} (Part ${variantSuffix})`;
    }

    const baseTags = template.tags.slice(0, 3);
    const extraTag = ((i * 5) % 22) + 1;
    const finalTags = Array.from(new Set([...baseTags, extraTag]));

    posts.push({
      id: i,
      title: title,
      summary: template.summary,
      datetime: datetimeStr,
      tags: finalTags
    });
  }
}

// Write to scripts/posts.json, scripts/data.json, and public/posts.json
const postsJsonPath = path.join(__dirname, 'posts.json');
const dataJsonPath = path.join(__dirname, 'data.json');
const publicJsonPath = path.join(__dirname, '../public/posts.json');

fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf-8');
fs.writeFileSync(dataJsonPath, JSON.stringify(posts, null, 2), 'utf-8');
fs.writeFileSync(publicJsonPath, JSON.stringify(posts, null, 2), 'utf-8');

// Ensure markdown files exist for all generated posts (preserving custom 0.md and 1.md)
const publicPostsDir = path.join(__dirname, '../public/posts');
if (!fs.existsSync(publicPostsDir)) {
  fs.mkdirSync(publicPostsDir, { recursive: true });
}

// Remove extra markdown files that are not in the current posts list
const existingMdFiles = fs.readdirSync(publicPostsDir);
for (const file of existingMdFiles) {
  if (file.endsWith('.md')) {
    const fileId = parseInt(file.replace('.md', ''), 10);
    if (!isNaN(fileId) && !posts.some(p => p.id === fileId)) {
      fs.unlinkSync(path.join(publicPostsDir, file));
    }
  }
}

let generatedMdCount = 0;
for (const p of posts) {
  const mdPath = path.join(publicPostsDir, `${p.id}.md`);
  if (!fs.existsSync(mdPath)) {
    const mdContent = `# ${p.title}

${p.summary}

---

## 1. Tổng Quan Kiến Trúc & Chi Tiết Kỹ Thuật

Tài liệu hướng dẫn kỹ thuật chi tiết dành cho chủ đề **${p.title}**. Nội dung này được tối ưu hóa cho hệ thống đọc tài liệu chuẩn tối giản, hỗ trợ bộ nhớ đệm ngoại tuyến và tốc độ tải trang 0ms.

> [!NOTE]
> Bài viết #${p.id} - Cập nhật lúc: \`${p.datetime}\`.

---

## 2. Hướng Dẫn Thao Tác & Quy Trình

1. **Khởi tạo môi trường**: Kiểm tra cấu hình và các tham số vận hành chuẩn.
2. **Triển khai**: Áp dụng các bước theo khuyến nghị tối ưu hiệu năng và độ ổn định.
3. **Giám sát & Bảo trì**: Theo dõi số liệu hoạt động và ghi nhật ký định kỳ.

\`\`\`typescript title="example-${p.id}.ts"
// Cấu hình tài liệu cho ${p.title}
export const documentMeta = {
  id: ${p.id},
  title: "${p.title}",
  updatedAt: "${p.datetime}",
  status: "published"
};
\`\`\`

---

## 3. Tổng Kết

Nếu cần thêm thông tin hoặc hỗ trợ chuyên sâu, vui lòng tham khảo các chủ đề liên quan trong mục tìm kiếm.
`;
    fs.writeFileSync(mdPath, mdContent, 'utf-8');
    generatedMdCount++;
  }
}

console.log(`Successfully generated ${posts.length} posts with datetime (YYYY-MM-DD HH:mm:ss) in:\n- ${postsJsonPath}\n- ${dataJsonPath}\n- ${publicJsonPath}`);
if (generatedMdCount > 0) {
  console.log(`- Created ${generatedMdCount} markdown files in ${publicPostsDir}`);
}
