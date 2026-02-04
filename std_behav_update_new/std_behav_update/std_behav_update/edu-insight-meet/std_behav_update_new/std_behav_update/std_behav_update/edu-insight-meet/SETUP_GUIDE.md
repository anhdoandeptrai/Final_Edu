# Hướng dẫn Setup Chi Tiết - Edu Insight Meet

## A) Kiến trúc và Lý do Lựa chọn

### Tại sao LiveKit Cloud (SFU) thay vì P2P thuần?

| Tiêu chí | P2P thuần | LiveKit SFU |
|----------|-----------|-------------|
| NAT traversal | ~70% success | ~99% success |
| TURN server | Phải tự host | Có sẵn global |
| Scale lên group | Khó | Dễ |
| Bandwidth client | N-1 upload streams | 1 upload stream |
| Complexity | Cao | Thấp |

### Tại sao TURN bắt buộc?

```
Máy A (NAT type: Symmetric) ←--X--→ Máy B (NAT type: Symmetric)
                    ↓
              STUN FAIL!
                    ↓
         Cần TURN relay traffic
```

- STUN chỉ hoạt động với Cone NAT (~70% cases)
- Symmetric NAT (phổ biến ở 4G, corporate) cần TURN
- LiveKit Cloud có TURN servers ở nhiều regions

## B) File Tree

```
edu-insight-meet/
├── src/
│   └── app/
│       ├── layout.tsx          # Root layout
│       ├── globals.css         # Styles
│       ├── page.tsx            # Home: create/join meeting
│       ├── meet/
│       │   └── [code]/
│       │       ├── page.tsx    # Pre-join: check devices
│       │       └── room/
│       │           └── page.tsx # Live room
│       └── api/
│           └── meet/
│               └── token/
│                   └── route.ts # Issue LiveKit token
├── .env.local.example
├── package.json
├── tsconfig.json
└── next.config.js
```

## C) Cấu hình ICE (LiveKit Cloud)

LiveKit Cloud tự động cấu hình ICE servers. Khi connect, client nhận:

```javascript
// Tự động từ LiveKit Cloud
iceServers: [
  { urls: 'stun:stun.livekit.cloud:3478' },
  { 
    urls: 'turn:turn.livekit.cloud:3478',
    username: 'auto-generated',
    credential: 'auto-generated'
  },
  {
    urls: 'turns:turn.livekit.cloud:443',  // TLS fallback
    username: 'auto-generated', 
    credential: 'auto-generated'
  }
]
```

### Test TURN hoạt động

1. Mở Chrome DevTools → Network → WS
2. Tìm connection tới `*.livekit.cloud`
3. Hoặc dùng https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

## D) Debug Checklist

### Lỗi "2 máy không vào được"

1. **Kiểm tra cùng room code**
   - Console log: `Joining room: xxx`
   - Phải giống nhau

2. **Kiểm tra token**
   - Network tab → POST /api/meet/token
   - Response phải có `{ token: "..." }`

3. **Kiểm tra WebSocket**
   - Network → WS → phải có connection tới `wss://xxx.livekit.cloud`
   - Status: 101 Switching Protocols

4. **Kiểm tra ICE**
   ```javascript
   // Trong console
   room.localParticipant.on('connectionQualityChanged', (q) => console.log('Quality:', q))
   ```

5. **Firewall check**
   - Port 443 (HTTPS/WSS) - thường OK
   - Port 3478 (STUN/TURN UDP) - có thể bị block
   - LiveKit có fallback qua 443 TLS

### Bật full ICE logging

Thêm vào room options:
```javascript
<LiveKitRoom
  options={{
    publishDefaults: { simulcast: true },
    adaptiveStream: true,
    dynacast: true,
  }}
  onConnected={() => {
    console.log('ICE State:', room.engine.pcManager?.publisher?.pc.iceConnectionState)
  }}
/>
```

## E) Test với 2 máy khác mạng

### Bước 1: Setup ngrok

```bash
# Cài ngrok (1 lần)
npm install -g ngrok
# hoặc download từ https://ngrok.com

# Chạy app
npm run dev

# Mở terminal khác, expose port 3000
ngrok http 3000
```

Output:
```
Forwarding  https://a1b2c3d4.ngrok.io -> http://localhost:3000
```

### Bước 2: Test

**Máy 1 (Laptop - WiFi):**
1. Mở `https://a1b2c3d4.ngrok.io`
2. Click "Tạo cuộc họp"
3. Nhập tên, click "Tham gia ngay"
4. Copy mã phòng (VD: `abc123xyz`)

**Máy 2 (Điện thoại - 4G):**
1. Tắt WiFi, dùng 4G
2. Mở `https://a1b2c3d4.ngrok.io`
3. Nhập mã phòng `abc123xyz`
4. Nhập tên, click "Tham gia ngay"

### Bước 3: Verify

- [ ] Cả 2 thấy video của nhau
- [ ] Audio hoạt động (nói nghe được)
- [ ] Toggle mic/cam hoạt động
- [ ] Hang up hoạt động

## F) Tiêu chí Hoàn thành

✅ 2 thiết bị khác mạng join được và nhìn thấy nhau trong 3 lần thử liên tiếp

Test matrix:
| Lần | Máy 1 | Máy 2 | Kết quả |
|-----|-------|-------|---------|
| 1 | Laptop WiFi | Phone 4G | ⬜ |
| 2 | Laptop WiFi | Phone 4G | ⬜ |
| 3 | Laptop WiFi | Phone 4G | ⬜ |

## G) Self-host LiveKit (Optional)

Nếu muốn tự host thay vì dùng Cloud:

```yaml
# docker-compose.yml
version: '3'
services:
  livekit:
    image: livekit/livekit-server:latest
    ports:
      - "7880:7880"   # HTTP
      - "7881:7881"   # RTC/UDP
      - "7882:7882"   # RTC/TCP
    environment:
      - LIVEKIT_KEYS=APIxxxxxxxx: secretxxxxxxxx
    command: --config /etc/livekit.yaml
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml

  turn:
    image: coturn/coturn:latest
    ports:
      - "3478:3478/udp"
      - "3478:3478/tcp"
    command: >
      -n --log-file=stdout
      --realm=your-domain.com
      --user=user:password
      --lt-cred-mech
```

Nhưng khuyến nghị dùng LiveKit Cloud cho MVP vì:
- Free tier đủ dùng
- Không cần lo TURN/infrastructure
- Global edge network
