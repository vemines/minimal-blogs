# Minimal Blog

Hỗ Trợ tạo **Blog** hiện đại, đơn giản, với **Vite**, **React 19**, **TypeScript** và **Tailwind CSS v4**.

---

## ✨ Tính Năng Nổi Bật

- ⚡ **Hiệu Suất Nhanh**: Xây dựng trên Vite và React cho thời gian tải trang và load module tức thì. Kích thước module chính được tách nhỏ (Code-splitting).
- 🗜️ **Nén Gzip Danh sách Blog**: Nén posts.json thành `posts.txt` bằng `gzip` và giải nén trực tiếp trong bộ nhớ RAM thông qua Web Stream API `DecompressionStream('gzip')`, giúp giảm manh dung lượng truyền tải và tải trang nhanh hơn.
- 🎨 **Giao Diện Tinh Gọn, Hiện Đại**: Hổ trợ Light and Dark mode.
- 📝 **Hỗ Trợ Markdown**:
  - Hộp cảnh báo theo chuẩn GitHub (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`).
  - Block code (), Tab Segmented (), Download card (` ```download `).
  - Responsive Table, Task checklists và hiển thị phím tắt (<kbd>Keycaps</kbd>).
  - Image viewer phóng to, thu nhỏ.
  - Mục lục (Table of Contents - TOC) với Scroll-spy + Throttling.
- 🔍 **Tìm Kiếm & Filter Tags**: Tìm kiếm theo tiêu đề, tóm tắt, Id bài viết hoặc tags (chủ đề).
- 📑 **Phân Trang**: Thiết kế thanh điều hướng đơn giản, nhấp vào dấu ba chấm (`...`) để gõ trực tiếp số trang cần chuyển đến.
- 🔖 **Bookmark Bài Viết & Xem Bài viết Ngoại Tuyến**: Lưu trữ các bài viết vào bộ nhớ máy tính (`localStorage`), cho phép xem lại khi mất mạng.
- 🖨️ **In & Tạo PDF**: Ẩn thanh điều hướng, căn lề và nén gọn dòng chữ để xuất file PDF hoặc in giấy.
- 🛡️ **Bảo Mật**: Tích hợp bộ lọc mã `rehype-sanitize` ngăn chặn tấn công Stored XSS, kiểm tra liên kết an toàn chặn đứng giao thức `javascript:` và cơ chế bắt lỗi ErrorBoundary tránh sập ứng dụng.

---

## 🛠️ Tech Stack

- **Core & Runtime**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Lucide React
- **Markdown Engine**: `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`, `rehype-slug`
- **Code Quality & Linter**: Oxlint

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt các gói phụ thuộc

```bash
# Di chuyển vào thư mục dự án
cd minimal-blog

# Cài đặt thư viện
npm install
```

### 2. Tạo dữ liệu mẫu & Nén chỉ mục bài viết

```bash
# Tạo 80 bài viết mẫu vào scripts/posts.json
npm run generate

# Nén posts.json thành posts.txt (gzip) đưa vào public/ và scripts/
npm run compress

# Hoặc thực hiện cả hai bước trên chỉ với 1 lệnh:
npm run data
```

### 3. Khởi chạy máy chủ phát triển (Dev Server)

```bash
npm run dev
```

Mở trình duyệt và truy cập: [http://localhost:5173](http://localhost:5173)

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
minimal-blog/
├── public/
│   ├── posts.txt            # Tệp nhị phân nén Gzip chỉ mục bài viết (giải nén trong RAM)
│   ├── tags.json            # Danh mục các chủ đề bài viết
│   ├── pinned.txt           # Danh sách ID các bài viết ghim lên đầu trang
│   ├── _redirects           # Cấu hình định tuyến SPA cho máy chủ web tĩnh
│   └── posts/               # Kho văn bản Markdown nội dung chi tiết (.md)
│       ├── 0.md             # Bài viết mẫu tổng hợp tất cả thành phần UI & Markdown
│       └── 1.md             # Bài viết mẫu
├── scripts/
│   ├── generate-posts.js    # Script sinh dữ liệu bài viết mẫu
│   ├── compress-data.js     # Script nén posts.json thành tệp nhị phân posts.txt
│   └── guide.txt            # Hướng dẫn chi tiết quy trình quản trị dữ liệu
└── src/
    ├── components/          # Các thành phần giao diện tái sử dụng
    │   ├── common/          # ErrorBoundary, Modal, Header
    │   ├── home/            # PostCard, Pagination, FilterDropdown
    │   └── markdown/        # Trình đọc Markdown, CodeBlock, Tabs, Callouts, TOC
    ├── services/            # API client (giải nén stream), bộ nhớ đệm cache, prefetcher
    ├── types/               # Định nghĩa kiểu dữ liệu TypeScript (PostMeta, TagItem...)
    └── views/               # Các trang: Trang chủ (HomeView), Chi tiết (PostDetailView), Bài đã lưu (SavedPostsView)
```

## 📄 Giấy Phép (License)

Dự án phát hành theo giấy phép mã nguồn mở [MIT](LICENSE).
