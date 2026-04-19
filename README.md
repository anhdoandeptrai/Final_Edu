# Edu Insight Meet - Final_Edu

Video call 1-1 real-time với WebRTC + LiveKit Cloud và phát hiện hành vi học sinh bằng AI.

## Quick Start

### 1. Cài đặt
```bash
cd edu-insight-meet
npm install
```

### 2. Tạo LiveKit Cloud account (FREE)
1. Vào https://cloud.livekit.io
2. Đăng ký tài khoản miễn phí
3. Tạo project mới
4. Copy API Key, API Secret, và WebSocket URL

### 3. Cấu hình
```bash
cp .env.example .env.local
```

Sửa `.env.local`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/final_edu?schema=public
LIVEKIT_API_KEY=APIxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

### 4. Chạy
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Mở http://localhost:3000

## Demo Login (PostgreSQL)

- Teacher: `teacher.demo@final-edu.local` / `123456`
- Student: `student.demo@final-edu.local` / `123456`

## Migrate dữ liệu LMS cũ từ JSON

Nếu bạn đã có dữ liệu cũ trong `data/lms-store.json`:

```bash
npm run db:migrate-json
```

## Test với 2 máy khác mạng

### Cách 1: Dùng ngrok (đơn giản nhất)
```bash
# Terminal 1: chạy app
npm run dev

# Terminal 2: expose ra internet
npx ngrok http 3000
```

Ngrok sẽ cho URL như `https://abc123.ngrok.io` - dùng URL này trên cả 2 máy.

### Cách 2: Deploy lên Vercel
```bash
npm i -g vercel
vercel
```

## Test checklist

1. Máy 1 (laptop WiFi): Mở URL → Tạo cuộc họp → Copy mã phòng
2. Máy 2 (điện thoại 4G): Mở URL → Nhập mã phòng → Tham gia
3. Cả 2 nhìn thấy nhau = SUCCESS

## Debug

- Mở DevTools Console để xem logs
- Click "Logs" ở góc trái dưới trong room
- Kiểm tra ICE connection state trong console

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| Token error | Sai API key/secret | Kiểm tra .env.local |
| Connection failed | Firewall block | LiveKit Cloud đã có TURN, thử mạng khác |
| No video | Permission denied | Cho phép camera trong browser |
| Không thấy người kia | Chưa join cùng room | Kiểm tra mã phòng giống nhau |

## Kiến trúc

```
Browser A ←→ LiveKit Cloud (SFU) ←→ Browser B
                   ↓
            TURN servers (built-in)
```

LiveKit Cloud đã bao gồm:
- STUN servers
- TURN servers (UDP/TCP/TLS)
- Global edge network

Không cần tự cấu hình ICE servers.
