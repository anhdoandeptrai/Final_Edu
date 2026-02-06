# 🎥 Hướng Dẫn Cấu Hình LiveKit

## ❌ Vấn Đề Hiện Tại

Ứng dụng không thể kết nối đến server vì **thiếu thông tin xác thực LiveKit**.

## ✅ Giải Pháp

### Bước 1: Đăng Ký Tài Khoản LiveKit Cloud (MIỄN PHÍ)

1. Truy cập: https://cloud.livekit.io
2. Nhấn "Sign Up" để tạo tài khoản mới
3. Xác thực email của bạn

### Bước 2: Tạo Project Mới

1. Sau khi đăng nhập, nhấn **"Create Project"**
2. Đặt tên project (ví dụ: `edu-insight-meet`)
3. Chọn region gần nhất (ví dụ: Singapore hoặc Tokyo cho Việt Nam)

### Bước 3: Lấy API Credentials

1. Trong dashboard project, tìm phần **"API Keys"** hoặc **"Settings"**
2. Copy các thông tin sau:
   - **API Key** (dạng: `APIxxxxxxxx`)
   - **API Secret** (dạng: `xxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **WebSocket URL** (dạng: `wss://your-project.livekit.cloud`)

### Bước 4: Cập Nhật File .env.local

Mở file `.env.local` ở thư mục gốc project và thay thế các giá trị:

```env
# LiveKit Cloud credentials
LIVEKIT_API_KEY=API_KEY_CUA_BAN
LIVEKIT_API_SECRET=SECRET_CUA_BAN
NEXT_PUBLIC_LIVEKIT_URL=wss://project-cua-ban.livekit.cloud
```

**Ví dụ cụ thể:**
```env
LIVEKIT_API_KEY=APIabcd1234efgh5678
LIVEKIT_API_SECRET=Kz9x8y7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g
NEXT_PUBLIC_LIVEKIT_URL=wss://edu-insight-abc123.livekit.cloud
```

### Bước 5: Khởi Động Lại Server

Sau khi cập nhật file `.env.local`:

```bash
# Dừng server hiện tại (Ctrl+C)

# Khởi động lại
npm run dev
```

## 🧪 Kiểm Tra Kết Nối

1. Mở trình duyệt và truy cập: http://localhost:3000
2. Tạo một phòng meeting mới
3. Nếu thấy video/audio được bật → **Thành công!** ✅

## ⚠️ Lưu Ý Quan Trọng

### 1. Bảo Mật
- **KHÔNG** commit file `.env.local` lên Git
- **KHÔNG** chia sẻ API Key/Secret công khai
- File `.gitignore` đã được cấu hình để bỏ qua `.env.local`

### 2. Gói Miễn Phí LiveKit Cloud
- **10,000 phút/tháng miễn phí**
- Đủ cho demo và phát triển
- Không cần thẻ tín dụng

### 3. Kiểm Tra Cấu Hình
Chạy lệnh sau để xác nhận các biến đã được load:

```bash
# PowerShell
node -e "console.log(process.env.LIVEKIT_API_KEY ? '✅ API Key loaded' : '❌ API Key missing')"
node -e "console.log(process.env.LIVEKIT_API_SECRET ? '✅ API Secret loaded' : '❌ API Secret missing')"
node -e "console.log(process.env.NEXT_PUBLIC_LIVEKIT_URL ? '✅ LiveKit URL loaded' : '❌ LiveKit URL missing')"
```

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Server configuration error"
➡️ **Nguyên nhân:** Thiếu LIVEKIT_API_KEY hoặc LIVEKIT_API_SECRET  
➡️ **Giải pháp:** Kiểm tra lại file `.env.local`

### Lỗi: "Failed to connect to server"
➡️ **Nguyên nhân:** NEXT_PUBLIC_LIVEKIT_URL không đúng  
➡️ **Giải pháp:** Kiểm tra URL có dạng `wss://...` và copy chính xác từ LiveKit dashboard

### Lỗi: "Invalid token"
➡️ **Nguyên nhân:** API Key/Secret không khớp  
➡️ **Giải pháp:** Copy lại credentials từ LiveKit dashboard

### Server không load biến môi trường
➡️ **Giải pháp:** Khởi động lại server bằng `npm run dev`

## 📚 Tài Liệu Tham Khảo

- LiveKit Documentation: https://docs.livekit.io
- LiveKit Cloud Dashboard: https://cloud.livekit.io
- LiveKit React Components: https://docs.livekit.io/reference/components/react

## 🆘 Cần Hỗ Trợ?

Nếu vẫn gặp vấn đề sau khi làm theo các bước trên, hãy kiểm tra:
1. File `.env.local` có tồn tại ở đúng thư mục gốc (`d:\Final_Edu\`)
2. Các giá trị không có khoảng trắng thừa hoặc dấu ngoặc kép
3. Server đã được khởi động lại sau khi thay đổi `.env.local`
4. Trình duyệt đã được refresh lại (Ctrl+Shift+R)

---

**Cập nhật:** File `.env.local` đã được thêm các biến cần thiết với giá trị placeholder. Bạn chỉ cần thay thế bằng credentials thực từ LiveKit Cloud.
