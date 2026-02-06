# BÁO CÁO DEMO - EDU INSIGHT MEET
**Phiên bản Demo:** 1.0.0  
**Ngày cập nhật:** Tháng 1, 2025  
**URL Demo:** https://edu-insight.vercel.app

---

## 1️⃣ GIỚI THIỆU DỰ ÁN

### Edu Insight Meet là gì?

**Edu Insight Meet** là nền tảng họp video trực tuyến được thiết kế đặc biệt cho giáo dục, tích hợp AI để phát hiện và phân tích hành vi học tập của học sinh trong thời gian thực.

Khác với các công cụ họp video thông thường (Google Meet, Zoom), Edu Insight Meet tập trung vào việc cung cấp thông tin chi tiết về mức độ tập trung và tương tác của học sinh, giúp giáo viên điều chỉnh phương pháp giảng dạy phù hợp.

### Vấn đề thực tế

Trong bối cảnh học trực tuyến ngày càng phổ biến, giáo viên gặp khó khăn trong việc:

- **Đánh giá mức độ tập trung** của học sinh khi không có tương tác trực tiếp
- **Phát hiện kịp thời** các dấu hiệu mất tập trung (ngủ gật, nhìn điện thoại, rời khỏi màn hình)
- **Thu thập dữ liệu** về hiệu quả buổi học để cải thiện phương pháp giảng dạy
- **Quản lý lớp học lớn** khi không thể quan sát từng học sinh một cách chi tiết

### Đối tượng sử dụng

**Người dùng chính:**
- **Giáo viên/Giảng viên:** Người dẫn dắt buổi học, cần theo dõi học sinh
- **Học sinh/Sinh viên:** Người tham gia buổi học trực tuyến

**Người dùng phụ:**
- **Quản lý giáo dục:** Theo dõi chất lượng giảng dạy qua dữ liệu
- **Phụ huynh:** Giám sát quá trình học của con em (tính năng tương lai)

---

## 2️⃣ TỔNG QUAN KIẾN TRÚC HỆ THỐNG

### Các module chính

Hệ thống Edu Insight Meet được chia thành 3 module chính:

#### A. Dashboard & Navigation
- **Chức năng:** Giao diện điều hướng chính của ứng dụng
- **Thành phần:**
  - Trang chủ (Home)
  - Quản lý cuộc họp (Meeting)
  - Lịch sử & Phân tích (History)
  - Cài đặt (Settings)

#### B. Edu Insight Meet (Video Call Engine)
- **Chức năng:** Xử lý cuộc gọi video real-time
- **Thành phần:**
  - Pre-join: Kiểm tra thiết bị trước khi vào phòng
  - Room: Phòng họp chính với video/audio
  - Control Bar: Điều khiển camera, mic, screen share
  - Token API: Xác thực và cấp quyền truy cập

#### C. AI Behavior Analysis
- **Chức năng:** Phát hiện và phân tích hành vi học tập
- **Thành phần:**
  - AI Detector: Phát hiện pose và phân tích hành vi
  - Behavior History Panel: Hiển thị lịch sử hành vi
  - Real-time Feedback: Cảnh báo trực tiếp

### Cách các module kết nối

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (Dashboard, Meeting Pages, Settings)                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼─────────────┐
│  Video Call      │    │  AI Behavior         │
│  (LiveKit)       │◄───┤  Analysis            │
│                  │    │  (TensorFlow.js)     │
└───────┬──────────┘    └──────────────────────┘
        │
        │ WebRTC/WebSocket
        │
┌───────▼──────────────────────────────────────┐
│         LiveKit Cloud (SFU Server)           │
│  - STUN/TURN servers                         │
│  - Media routing                             │
│  - Global edge network                       │
└──────────────────────────────────────────────┘
```

**Luồng hoạt động:**
1. User tương tác với Dashboard để tạo/tham gia cuộc họp
2. Video Call module kết nối với LiveKit Cloud qua WebRTC
3. AI module lấy video stream từ camera local
4. AI phân tích và gửi kết quả về Behavior History
5. Giáo viên xem real-time feedback và lịch sử

---

## 3️⃣ CÔNG NGHỆ LÕI SỬ DỤNG

### Frontend Framework
**Next.js 14 (React 18)**
- **Vai trò:** Framework chính để xây dựng giao diện người dùng
- **Lý do chọn:** 
  - Server-side rendering cho SEO và performance
  - App Router cho routing hiện đại
  - API Routes tích hợp sẵn
  - TypeScript support mạnh mẽ

### Real-time Communication
**LiveKit Cloud + livekit-client SDK**
- **Vai trò:** Xử lý video/audio call real-time giữa nhiều người dùng
- **Lý do chọn:**
  - SFU architecture (Selective Forwarding Unit) - hiệu quả hơn P2P
  - TURN servers có sẵn (99% success rate qua NAT/firewall)
  - Không cần tự host infrastructure
  - Free tier đủ cho demo và MVP
  - Hỗ trợ simulcast, adaptive bitrate

**Kiến trúc WebRTC:**
```
Browser A ←→ LiveKit Cloud (SFU) ←→ Browser B
                   ↓
         TURN servers (built-in)
         Global edge network
```

### AI / Computer Vision
**TensorFlow.js + MoveNet (Pose Detection)**
- **Vai trò:** Phát hiện tư thế và phân tích hành vi người dùng
- **Lý do chọn:**
  - Chạy hoàn toàn trên browser (không cần server AI)
  - MoveNet Lightning: nhanh, nhẹ (2-3 FPS trên laptop thường)
  - Privacy-first: video không gửi lên server
  - Không cần GPU mạnh

**Các hành vi phát hiện được:**
- ✅ Đang lắng nghe (tư thế chuẩn)
- 😴 Đang ngủ (đầu cúi xuống vai)
- 👀 Mất tập trung (quay đầu sang hướng khác)
- 📱 Cúi đầu (nhìn điện thoại)
- ⚠️ Nghiêng đầu
- ✋ Giơ tay (muốn phát biểu)
- 👍 Gật đầu (đồng ý)
- 👎 Lắc đầu (không đồng ý)

### Backend / API
**Next.js API Routes**
- **Vai trò:** Xử lý logic server-side
- **Endpoint chính:**
  - `POST /api/meet/token`: Tạo JWT token cho LiveKit authentication

**LiveKit Server SDK**
- **Vai trò:** Tạo access token với quyền hạn cụ thể
- **Bảo mật:** API Key/Secret được lưu trong environment variables

### Database / Auth
**Hiện tại:** Không có database persistent
- Session storage cho user settings (tên, camera/mic state)
- In-memory storage cho behavior history (mất khi reload)

**Lý do:** Demo MVP tập trung vào core functionality trước

### Deployment
**Vercel (Production)**
- **Vai trò:** Host ứng dụng Next.js
- **Lý do chọn:**
  - Tích hợp native với Next.js
  - Auto-deploy từ Git
  - Edge network toàn cầu
  - Environment variables management
  - Free tier đủ dùng

**URL:** https://edu-insight.vercel.app

---

## 4️⃣ CÁCH HỆ THỐNG HOẠT ĐỘNG (WORKFLOW DEMO)

### Luồng demo thực tế

#### Bước 1: Truy cập ứng dụng
- Người dùng mở https://edu-insight.vercel.app
- Giao diện dashboard hiển thị với sidebar navigation

#### Bước 2: Tạo cuộc họp (Giáo viên)
- Click "Tạo cuộc họp" trên trang chủ hoặc trang Meeting
- Hệ thống tạo mã phòng ngẫu nhiên (10 ký tự, VD: `kFp5j3o8vv`)
- Chuyển đến trang Pre-join

#### Bước 3: Chuẩn bị thiết bị (Pre-join)
- Hệ thống yêu cầu quyền truy cập camera/microphone
- Hiển thị preview video để kiểm tra
- Người dùng:
  - Nhập tên
  - Bật/tắt camera và mic
  - Xem trạng thái thiết bị (✓ Camera OK, ✓ Mic OK)
- Click "Tham gia ngay"

#### Bước 4: Vào phòng họp
**Backend:**
- Client gửi request `POST /api/meet/token` với roomName và participantName
- Server tạo JWT token với LiveKit API Key/Secret
- Token chứa quyền: join room, publish/subscribe media

**Frontend:**
- LiveKitRoom component kết nối với LiveKit Cloud
- Thiết lập WebRTC connection (ICE negotiation, STUN/TURN)
- Publish local camera/mic tracks
- Subscribe to remote participants' tracks

#### Bước 5: Học sinh tham gia
- Học sinh mở cùng URL
- Click "Tham gia cuộc họp"
- Nhập mã phòng (VD: `kFp5j3o8vv`)
- Làm tương tự bước 3-4

#### Bước 6: AI phát hiện hành vi
**Khởi động AI:**
- AIBehaviorDetector component tự động khởi tạo
- Load TensorFlow.js và MoveNet model (~2-3 giây)
- Tìm video element của local participant

**Vòng lặp phát hiện:**
```
Mỗi 500ms (2 FPS):
1. Lấy frame từ video element
2. MoveNet detect pose → 17 keypoints
3. Phân tích keypoints:
   - Vị trí đầu so với vai
   - Góc nghiêng tai
   - Vị trí tay
   - Chuyển động đầu (buffer 15 frames)
4. Xác định hành vi
5. Hiển thị badge real-time
6. Lưu vào history panel
```

**Hiển thị:**
- Badge góc trên bên trái: Hành vi hiện tại (VD: "✅ Đang lắng nghe")
- Sidebar bên phải: Lịch sử hành vi với timestamp

#### Bước 7: Tương tác trong phòng
**Giáo viên có thể:**
- Xem video của tất cả học sinh (grid layout)
- Quan sát AI feedback real-time
- Xem lịch sử hành vi trong sidebar
- Bật/tắt camera, mic
- Chia sẻ màn hình
- Copy mã phòng để chia sẻ

**Học sinh có thể:**
- Xem video giáo viên và bạn học
- Bật/tắt camera, mic của mình
- Giơ tay (AI sẽ phát hiện)

#### Bước 8: Kết thúc buổi học
- Click nút đỏ "📞" (Disconnect)
- Hệ thống:
  - Stop tất cả local tracks
  - Disconnect khỏi LiveKit room
  - Clear session storage
  - Redirect về trang chủ

---

## 5️⃣ CÁC CHỨC NĂNG HIỆN TẠI CỦA BẢN DEMO

### ✅ Tính năng ĐANG HOẠT ĐỘNG đầy đủ

#### Video Call Core
- ✅ Tạo phòng họp với mã ngẫu nhiên
- ✅ Tham gia phòng bằng mã
- ✅ Video call 1-1 real-time (có thể mở rộng nhiều người)
- ✅ Audio call real-time
- ✅ Bật/tắt camera trong phòng
- ✅ Bật/tắt microphone trong phòng
- ✅ Screen sharing (chia sẻ màn hình)
- ✅ Disconnect/hang up
- ✅ Hoạt động qua NAT/firewall (TURN servers)
- ✅ Adaptive bitrate (tự động điều chỉnh chất lượng theo mạng)

#### Pre-join Experience
- ✅ Preview camera/mic trước khi vào
- ✅ Kiểm tra trạng thái thiết bị
- ✅ Bật/tắt camera/mic trước khi join
- ✅ Nhập tên người dùng
- ✅ Debug logs (có thể bật/tắt)

#### AI Behavior Detection
- ✅ Phát hiện 8 loại hành vi:
  - Đang lắng nghe
  - Đang ngủ
  - Mất tập trung
  - Cúi đầu (nhìn điện thoại)
  - Nghiêng đầu
  - Giơ tay
  - Gật đầu
  - Lắc đầu
- ✅ Real-time feedback (badge hiển thị ngay)
- ✅ Lịch sử hành vi với timestamp
- ✅ Bật/tắt AI on-demand
- ✅ Chạy hoàn toàn trên browser (privacy-first)

#### UI/UX
- ✅ Dashboard với sidebar navigation
- ✅ Responsive design cơ bản
- ✅ Video grid layout (1-2 người)
- ✅ Participant name badges
- ✅ Connection status indicator
- ✅ Copy room code button
- ✅ Analytics sidebar (có thể ẩn/hiện)

### 🔶 Tính năng ở mức MVP/Prototype

#### Dashboard Pages
- 🔶 Trang History: UI có nhưng chưa lưu data persistent
- 🔶 Trang Settings: UI có nhưng settings chưa apply thực tế
- 🔶 Trang Meeting: Duplicate với Home page (cần merge)

#### AI Analytics
- 🔶 Behavior history: Chỉ lưu trong memory (mất khi reload)
- 🔶 Statistics: UI có nhưng data hardcoded (0)

### ❌ Những gì demo này KHÔNG làm

#### Chức năng chưa có
- ❌ Đăng nhập/đăng ký người dùng (authentication)
- ❌ Lưu trữ lịch sử cuộc họp vào database
- ❌ Export báo cáo hành vi (PDF/CSV)
- ❌ Recording cuộc họp
- ❌ Chat text trong phòng
- ❌ Whiteboard/annotation
- ❌ Breakout rooms
- ❌ Quản lý lớp học/khóa học
- ❌ Tích hợp với LMS (Moodle, Canvas)
- ❌ Mobile app native
- ❌ Notification system
- ❌ Calendar integration

#### Giới hạn kỹ thuật
- ❌ Chưa optimize cho group call lớn (>5 người)
- ❌ Chưa có bandwidth management cho mạng yếu
- ❌ AI chỉ phát hiện 1 người (local participant)
- ❌ Chưa có AI model training/fine-tuning
- ❌ Chưa có data analytics dashboard cho giáo viên

---

## 6️⃣ ĐIỂM NỔI BẬT CỦA DEMO

### So với Google Meet / Zoom

| Tiêu chí | Google Meet/Zoom | Edu Insight Meet |
|----------|------------------|------------------|
| **Mục đích** | Họp chung chung | Chuyên biệt cho giáo dục |
| **AI Behavior** | Không có | Có (8 loại hành vi) |
| **Real-time Feedback** | Không | Có (badge + history) |
| **Privacy** | Video gửi lên server | AI chạy local (privacy-first) |
| **Tập trung vào giáo dục** | Không | Có (thiết kế cho giáo viên-học sinh) |
| **Dữ liệu học tập** | Không thu thập | Thu thập để cải thiện giảng dạy |

### Vai trò của AI trong demo

**1. Phát hiện tự động (Automation)**
- Giáo viên không cần quan sát từng học sinh thủ công
- AI làm việc 24/7 không mệt mỏi
- Phát hiện nhanh hơn con người (500ms/lần)

**2. Dữ liệu khách quan (Objectivity)**
- Không bị ảnh hưởng bởi cảm xúc
- Đo lường consistent
- Có thể so sánh giữa các buổi học

**3. Cảnh báo sớm (Early Warning)**
- Phát hiện ngủ gật ngay lập tức
- Cảnh báo mất tập trung kéo dài
- Giúp giáo viên can thiệp kịp thời

**4. Insights cho giáo viên (Analytics)**
- Thời điểm nào học sinh tập trung nhất
- Phần nào của bài giảng gây mất tập trung
- Học sinh nào cần hỗ trợ thêm

### Vì sao demo này có giá trị

**1. Proof of Concept thành công**
- Chứng minh AI có thể phát hiện hành vi real-time
- Chứng minh WebRTC hoạt động ổn định qua mạng
- Chứng minh tích hợp được nhiều công nghệ phức tạp

**2. Foundation vững chắc**
- Kiến trúc có thể scale
- Code structure rõ ràng, dễ mở rộng
- Công nghệ hiện đại, được support tốt

**3. User Experience tốt**
- Giao diện trực quan, dễ sử dụng
- Latency thấp (real-time)
- Hoạt động ổn định

**4. Giá trị thực tế**
- Giải quyết vấn đề thực của giáo viên
- Có thể demo ngay cho khách hàng
- Có thể thu thập feedback để cải thiện

---

## 7️⃣ HẠN CHẾ HIỆN TẠI CỦA DEMO

### Giới hạn kỹ thuật

**1. AI Model**
- **Độ chính xác:** ~70-80% trong điều kiện tốt (ánh sáng đủ, camera rõ)
- **False positives:** Có thể nhầm lẫn khi người dùng di chuyển nhanh
- **Chỉ phát hiện 1 người:** AI chỉ analyze local participant, chưa analyze remote
- **Yêu cầu phần cứng:** Cần laptop/PC có CPU tương đối (AI chạy trên CPU)
- **Lighting sensitive:** Hoạt động kém trong môi trường tối

**2. Video Call**
- **Số người:** Chưa test với >5 người cùng lúc
- **Bandwidth:** Chưa có fallback cho mạng rất yếu (<1 Mbps)
- **Mobile:** Chưa optimize cho điện thoại (UI, battery)
- **Browser support:** Chỉ test trên Chrome/Edge (chưa test Safari, Firefox)

**3. Data Persistence**
- **Không có database:** Tất cả data mất khi reload
- **Không có user accounts:** Không lưu lịch sử cá nhân
- **Không có analytics:** Không có dashboard tổng hợp

### Giới hạn tính năng

**1. Thiếu tính năng giáo dục cơ bản**
- Không có quản lý lớp học
- Không có assignment/homework
- Không có grading system
- Không có attendance tracking

**2. Thiếu tính năng collaboration**
- Không có chat
- Không có whiteboard
- Không có file sharing
- Không có breakout rooms

**3. Thiếu tính năng admin**
- Không có user management
- Không có role-based access
- Không có reporting
- Không có billing/subscription

### Phạm vi demo

**Demo này phù hợp cho:**
- ✅ Proof of concept cho investor/mentor
- ✅ Technical demo cho đội ngũ kỹ thuật
- ✅ User testing với 2-3 người
- ✅ Showcase tại hackathon/competition

**Demo này CHƯA phù hợp cho:**
- ❌ Production deployment cho trường học
- ❌ Sử dụng với lớp học >10 người
- ❌ Sử dụng lâu dài (thiếu data persistence)
- ❌ Thay thế hoàn toàn Google Meet/Zoom

### Roadmap để production-ready

**Phase 1: Core Improvements (1-2 tháng)**
- Thêm authentication (Firebase/Supabase)
- Thêm database (PostgreSQL)
- Optimize AI cho mobile
- Test với 10-20 người

**Phase 2: Education Features (2-3 tháng)**
- Class management
- Attendance tracking
- Basic analytics dashboard
- Export reports

**Phase 3: Scale & Polish (3-4 tháng)**
- Advanced AI (multi-person detection)
- Chat + whiteboard
- Recording
- Mobile app

---

## 📊 TỔNG KẾT

### Điểm mạnh
- ✅ Core functionality hoạt động ổn định
- ✅ AI real-time detection thành công
- ✅ UX/UI trực quan, dễ sử dụng
- ✅ Công nghệ hiện đại, có thể scale
- ✅ Privacy-first (AI chạy local)

### Điểm cần cải thiện
- 🔶 Thiếu data persistence
- 🔶 Chưa optimize cho mobile
- 🔶 AI accuracy cần cải thiện
- 🔶 Thiếu nhiều tính năng giáo dục

### Giá trị cốt lõi
**Edu Insight Meet chứng minh rằng:**
1. AI có thể hỗ trợ giáo viên trong việc theo dõi học sinh
2. Real-time behavior detection là khả thi
3. Privacy có thể được đảm bảo (AI local)
4. Công nghệ có thể cải thiện chất lượng giáo dục trực tuyến

---

## 📞 THÔNG TIN LIÊN HỆ & DEMO

**Demo URL:** https://edu-insight.vercel.app

**Cách test demo:**
1. Mở URL trên 2 thiết bị khác nhau
2. Thiết bị 1: Tạo cuộc họp → Copy mã phòng
3. Thiết bị 2: Tham gia với mã phòng
4. Quan sát AI phát hiện hành vi real-time

**Lưu ý khi demo:**
- Cần ánh sáng đủ để AI hoạt động tốt
- Cho phép quyền camera/mic trên browser
- Khuyến nghị dùng Chrome/Edge
- Cần kết nối internet ổn định (>2 Mbps)

---

**Báo cáo này được tạo để giới thiệu demo hiện tại của Edu Insight Meet. Mọi thông tin phản ánh đúng trạng thái của dự án tại thời điểm viết báo cáo.**
