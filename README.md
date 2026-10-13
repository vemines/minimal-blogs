# Minimal Blogs

Nền tảng tạo **Blog** hiện đại, tinh gọn với **Vite**, **React 19**, **TypeScript** và **Tailwind CSS v4**.

---

## ✨ Tính Năng Nổi Bật

- ⚡ **Hiệu Suất Vượt Trội**: Xây dựng trên nền tảng Vite 8 và React 19, tải trang nhanh chóng.
- 📄 **Quản Lý Dữ Liệu Thuần JSON**: Sử dụng trực tiếp `posts.json` và Markdown (`.md`), dễ dàng tạo mới và chỉnh sửa trực tiếp trên giao diện GitHub Web UI.
- 🌐 **Tách Rời Kho Dữ Liệu (Decoupled Data Backend)**: Có thể lưu trữ dữ liệu tại chính thư mục `public/` hoặc đưa lên GitHub Pages / CDN / Cloudflare R2 riêng biệt thông qua biến môi trường `VITE_DATA_URL`.
- 🎨 **Giao Diện Tinh Gọn, Hiện Đại**: Hỗ trợ đầy đủ Light Mode và Dark Mode.
- 📝 **Hỗ Trợ Markdown Nâng Cao**:
  - Khối thông báo theo chuẩn GitHub Alert (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`).
  - Phân màu mã nguồn (Code Block) với nút Copy 1 chạm và tiêu đề file.
  - Tab chuyển đổi nhiều bước/hệ điều hành (Tab Switcher).
  - Thẻ tải tệp đính kèm (` ```download `).
  - Bảng responsive, Task list và phím tắt (<kbd>Keycaps</kbd>).
  - Phóng to/thu nhỏ ảnh (Image zoom modal).
  - Mục lục tự động (Table of Contents - TOC) với Scroll-spy.
- 🔍 **Tìm Kiếm & Bộ Lọc**: Tìm kiếm theo tiêu đề, tóm tắt, ID bài viết và lọc theo thẻ (tags).
- 📑 **Phân Trang Tiện Lợi**: Chuyển trang nhanh, bấm vào dấu ba chấm (`...`) để nhập trực tiếp số trang.
- 🔖 **Bookmark & Offline Storage**: Lưu bài viết vào `localStorage`, tự động cache để đọc lại khi mất mạng.
- 🖨️ **Tối Ưu Bản In / Xuất PDF**: Tự động ẩn thanh điều hướng, căn lề văn bản khi in hoặc lưu dạng PDF.
- 🛡️ **Bảo Mật Cao**: Tích hợp bộ lọc `rehype-sanitize` chống Stored XSS, kiểm tra liên kết an toàn và ErrorBoundary bắt lỗi giao diện.

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
# Cài đặt thư viện
npm install
```

### 2. Khởi chạy máy chủ phát triển (Dev Server)

```bash
npm run dev
```

Mở trình duyệt và truy cập: [http://localhost:5173](http://localhost:5173)

### 3. Đóng gói cho Production

```bash
npm run build
```

### 4. Minify Dữ Liệu Bài Viết (Tùy chọn)

```bash
npm run minify
```

*(Tự động nén các file `data.json` có thụt lề thành `posts.json` dạng siêu nhẹ để tối ưu dung lượng tải).*

---

## 🌐 Cấu Hình Kết Nối Kho Dữ Liệu Tách Biệt

Nếu bạn muốn lưu trữ dữ liệu bài viết trên một GitHub repository riêng biệt (được kích hoạt GitHub Pages):

Tạo hoặc chỉnh sửa file `.env` (hoặc `.env.production`):

```env
# URL trỏ tới GitHub Pages hoặc CDN chứa data (posts.json, tags.json, pinned.txt, posts/*.md)
VITE_DATA_URL="https://<your-username>.github.io/<data-repo>"
```

*(Nếu không thiết lập, ứng dụng sẽ mặc định nạp dữ liệu từ thư mục `public/` nội bộ).*

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
minimal-blogs/
├── public/                  # Dữ liệu tĩnh nội bộ mặc định
│   ├── data.json            # Dữ liệu bài viết gốc dễ đọc (dùng trong DEV mode)
│   ├── posts.json           # Danh mục metadata bài viết (chế độ local/production)
│   ├── tags.json            # Danh mục các chủ đề bài viết
│   ├── pinned.txt           # Danh sách ID bài viết ghim đầu trang
│   ├── _redirects           # Cấu hình định tuyến SPA cho máy chủ web
│   └── posts/               # Thư mục chứa các file Markdown (.md)
│       └── 0.md             # Bài viết mẫu tổng hợp tất cả thành phần UI & Markdown
├── scripts/                 # Bộ khung dữ liệu mẫu & công cụ tiện ích
│   ├── data.json            # File dữ liệu mẫu có format dễ chỉnh sửa
│   ├── posts.json           # File dữ liệu đã minify
│   ├── tags.json            # File danh mục tag mẫu
│   ├── pinned.txt           # Danh sách bài ghim mẫu
│   ├── minify.js            # Script minify data.json -> posts.json (npm run minify)
│   ├── posts/               # Các bài viết Markdown mẫu
│   └── README.md            # Hướng dẫn chi tiết triển khai kho dữ liệu
```

---

## 📄 Giấy Phép (License)

Dự án phát hành theo giấy phép mã nguồn mở [MIT](LICENSE).
