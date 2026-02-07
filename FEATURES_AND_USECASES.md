# 🎓 Edu Insight Meet - Tính năng & Use Cases

## 📋 Tổng quan

**Edu Insight Meet** là nền tảng video conferencing thông minh dành riêng cho giáo dục, tích hợp AI phân tích hành vi học tập theo thời gian thực. Hệ thống giúp giáo viên theo dõi mức độ tương tác và tập trung của học sinh trong suốt buổi học trực tuyến.

---

## ✨ Tính năng chính

### 1. 🎥 Video Conferencing Real-time
- **Video call HD chất lượng cao** (720p, 30fps)
- **Audio crystal clear** với khử tiếng ồn, khử echo
- **Adaptive streaming** - tự động điều chỉnh chất lượng theo băng thông
- **Grid layout thông minh** - tự động sắp xếp video của người tham gia
- **Avatar động** - hiển thị avatar khi camera tắt

**Công nghệ:** LiveKit WebRTC

### 2. 🖥️ Chia sẻ màn hình
- **Share screen/window/tab** - chia sẻ toàn màn hình hoặc cửa sổ cụ thể
- **Priority display** - màn hình chia sẻ hiển thị ưu tiên (60% không gian)
- **Multi-view** - xem màn hình chia sẻ và video participants đồng thời
- **HD screen share** - chia sẻ màn hình với chất lượng cao

### 3. 🤖 AI Behavior Detection (Tính năng độc quyền)

#### Cho học sinh:
- **Tự phát hiện hành vi** - AI phân tích hành vi của chính mình
- **Real-time feedback** - nhận feedback tức thì về trạng thái học tập
- **Lịch sử cá nhân** - xem lại lịch sử hành vi trong buổi học

#### Cho giáo viên:
- **Phát hiện đồng thời nhiều học sinh** - AI theo dõi tất cả học sinh cùng lúc
- **Dashboard tổng quan** - xem trạng thái toàn lớp một cách trực quan
- **Thống kê chi tiết** - phân tích % tập trung/mất tập trung/buồn ngủ
- **Theo dõi từng học sinh** - click vào học sinh để xem lịch sử chi tiết

#### Các hành vi được phát hiện:
| Hành vi | Emoji | Ý nghĩa |
|---------|-------|---------|
| 🎯 Tập trung | Đang nhìn vào màn hình |
| 👂 Đang lắng nghe | Nghiêng đầu lắng nghe |
| ✋ Giơ tay | Học sinh muốn phát biểu |
| 👍 Gật đầu | Hiểu bài, đồng ý |
| 😕 Mất tập trung | Không nhìn vào màn hình |
| 😔 Cúi đầu | Có thể đang buồn ngủ hoặc làm việc khác |
| 🤔 Nghiêng đầu | Đang suy nghĩ hoặc bối rối |
| 👎 Lắc đầu | Không hiểu, không đồng ý |
| 😴 Buồn ngủ | Mệt mỏi, thiếu tập trung |

**Tần suất phát hiện:** 2 lần/giây (500ms interval)

### 4. 👥 Quản lý người tham gia

#### Hệ thống phân quyền:
- **👨‍🏫 Giáo viên (Teacher):**
  - Tạo phòng học
  - Xem danh sách tất cả học sinh (kể cả chưa mở camera)
  - Truy cập dashboard phân tích hành vi
  - Xem thống kê chi tiết từng học sinh
  
- **👨‍🎓 Học sinh (Student):**
  - Tham gia phòng học bằng mã phòng
  - Xem hành vi của chính mình
  - Tự theo dõi mức độ tập trung

#### Tính năng:
- **Hiển thị số lượng chính xác** - đếm tất cả người tham gia (dù có bật camera hay không)
- **Name badges** - hiển thị tên rõ ràng cho mỗi participant
- **Connection status** - hiển thị trạng thái kết nối
- **Participant list** - danh sách đầy đủ người trong phòng

### 5. 📊 Analytics & Statistics (Dành cho giáo viên)

#### Dashboard tổng quan:
```
┌─────────────────────────────────┐
│  👥 Học sinh: 25                │
│  ✅ Tập trung: 18 (72%)         │
│  ⚠️  Mất tập trung: 5 (20%)     │
│  😴 Buồn ngủ: 2 (8%)            │
└─────────────────────────────────┘
```

#### Chi tiết từng học sinh:
- **Timeline hành vi** - xem lịch sử 20 hành động gần nhất
- **Biểu đồ phân tích** - % tập trung trong suốt buổi học
- **Export data** - xuất dữ liệu để báo cáo

### 6. 📜 Lịch sử phát hiện

#### Cho học sinh:
- Xem **15 hành vi gần nhất** của bản thân
- Timeline với timestamp
- Color-coded theo mức độ tập trung

#### Cho giáo viên:
- Xem lịch sử **tất cả học sinh**
- Filter theo học sinh
- Statistic summary

### 7. 🎛️ Controls & Settings

#### Meeting Controls:
- 🎤 **Microphone toggle** - bật/tắt mic
- 📹 **Camera toggle** - bật/tắt camera
- 🖥️ **Screen share** - chia sẻ màn hình
- 📋 **Copy room code** - copy mã phòng
- 📞 **Disconnect** - rời phòng an toàn

#### AI Controls:
- 🤖 **AI ON/OFF** - bật/tắt AI detection
- 📊 **Analytics toggle** - ẩn/hiện panel phân tích

### 8. 🔐 Authentication & User Management
- **Đăng ký/Đăng nhập** với email/password
- **Phân quyền rõ ràng** - Teacher/Student
- **Session management** - lưu trạng thái đăng nhập
- **User profile** - quản lý thông tin cá nhân

---

## 💡 Use Cases

### Use Case 1: Giáo viên dạy lớp học trực tuyến

**Actors:** Giáo viên (Teacher), Học sinh (Students)

**Luồng chính:**
1. **Giáo viên tạo phòng học:**
   - Đăng nhập với tài khoản giáo viên
   - Click "Tạo cuộc họp mới"
   - Hệ thống tạo mã phòng (VD: `ABC123`)
   - Giáo viên chia sẻ mã phòng với học sinh

2. **Học sinh tham gia:**
   - Đăng nhập với tài khoản học sinh
   - Nhập mã phòng `ABC123`
   - Kiểm tra camera/micro trước khi vào
   - Click "Tham gia" để vào phòng

3. **Trong buổi học:**
   - Giáo viên giảng bài, chia sẻ màn hình PowerPoint
   - AI tự động phát hiện hành vi của tất cả học sinh
   - Dashboard giáo viên hiển thị:
     - 25/30 học sinh đang tập trung
     - 3 học sinh đang buồn ngủ
     - 2 học sinh mất tập trung

4. **Giáo viên theo dõi học sinh cụ thể:**
   - Click vào "Nguyễn Văn A" trong danh sách
   - Xem timeline: 
     - 10:05 - Tập trung ✅
     - 10:08 - Giơ tay ✋
     - 10:15 - Cúi đầu 😔
     - 10:20 - Tập trung ✅
   - Nhận thấy học sinh A buồn ngủ lúc 10:15, chủ động hỏi thăm

5. **Kết thúc buổi học:**
   - Giáo viên xuất báo cáo tham gia
   - Xem thống kê tổng quan lớp
   - Disconnect an toàn

**Kết quả:** Giáo viên nắm bắt được mức độ tập trung của lớp, can thiệp kịp thời với học sinh cần hỗ trợ.

---

### Use Case 2: Học sinh tự học và tự theo dõi

**Actor:** Học sinh

**Luồng chính:**
1. **Tham gia buổi học:**
   - Đăng nhập và vào phòng học
   - Bật camera và microphone
   - AI bắt đầu phát hiện hành vi

2. **Trong quá trình học:**
   - Panel bên trái hiển thị trạng thái hiện tại:
     - 🎯 Đang tập trung
   - Xem lịch sử hành vi của mình
   - Tự nhận biết khi mất tập trung

3. **Tự điều chỉnh:**
   - Nhận thấy nhiều lần "Mất tập trung" trong lịch sử
   - Tự điều chỉnh tư thế, tập trung hơn
   - Theo dõi cải thiện qua timeline

**Kết quả:** Học sinh nâng cao ý thức tự giác, cải thiện khả năng tập trung.

---

### Use Case 3: Họp nhóm làm việc

**Actors:** Nhóm sinh viên (3-5 người)

**Luồng chính:**
1. **Tạo phòng họp:**
   - Một thành viên tạo phòng (role: teacher để có dashboard)
   - Chia sẻ mã phòng cho nhóm

2. **Làm việc nhóm:**
   - Thành viên A chia sẻ màn hình để present ý tưởng
   - Các thành viên khác xem và thảo luận
   - AI theo dõi mức độ engaged của mọi người

3. **Đánh giá tham gia:**
   - Trưởng nhóm xem dashboard:
     - Thành viên B: 85% tập trung
     - Thành viên C: 60% tập trung
   - Nhận xét đóng góp của từng người

**Kết quả:** Đánh giá khách quan mức độ tham gia của từng thành viên.

---

### Use Case 4: Phỏng vấn trực tuyến

**Actors:** Nhà tuyển dụng (Teacher), Ứng viên (Student)

**Luồng chính:**
1. **Setup phỏng vấn:**
   - Nhà tuyển dụng tạo phòng
   - Gửi mã phòng cho ứng viên

2. **Trong phỏng vấn:**
   - Ứng viên trình bày về bản thân
   - AI phát hiện:
     - Giơ tay → Tự tin
     - Gật đầu → Tích cực
     - Cúi đầu → Nervous
     - Mất tập trung → Thiếu focus

3. **Đánh giá sau phỏng vấn:**
   - Nhà tuyển dụng xem lại timeline
   - Phân tích body language qua AI
   - So sánh với ghi chú của mình

**Kết quả:** Có thêm dữ liệu khách quan để đánh giá ứng viên.

---

### Use Case 5: Đào tạo từ xa của doanh nghiệp

**Actors:** Giảng viên đào tạo (Teacher), Nhân viên (Students)

**Luồng chính:**
1. **Khóa đào tạo:**
   - 50 nhân viên tham gia buổi training online
   - Giảng viên chia sẻ slide về sản phẩm mới

2. **Theo dõi engagement:**
   - Dashboard hiển thị real-time:
     - 42/50 đang tập trung (84%)
     - 5 người buồn ngủ (10%)
     - 3 người mất tập trung (6%)
   - Giảng viên điều chỉnh:
     - Nghỉ giải lao khi thấy nhiều người mệt
     - Tăng tương tác khi phát hiện mất tập trung

3. **Báo cáo sau đào tạo:**
   - Export dữ liệu tham gia của từng nhân viên
   - Gửi HR để đánh giá
   - Lên kế hoạch đào tạo lại cho nhóm kém tập trung

**Kết quả:** Nâng cao hiệu quả đào tạo, tiết kiệm chi phí.

---

## 🎯 Đối tượng sử dụng

### 1. Giáo viên / Giảng viên
- Giáo viên phổ thông (THCS, THPT)
- Giảng viên đại học
- Giáo viên dạy kèm online
- Huấn luyện viên (coaching)

### 2. Học sinh / Sinh viên
- Học sinh phổ thông (từ lớp 6 trở lên)
- Sinh viên đại học
- Học viên các khóa học online
- Người tự học muốn theo dõi hiệu suất

### 3. Doanh nghiệp
- Phòng đào tạo (Training Department)
- Phòng nhân sự (HR)
- Team leader muốn theo dõi meeting
- Remote teams

### 4. Tổ chức giáo dục
- Trường học, đại học
- Trung tâm đào tạo
- Học viện online
- Nền tảng e-learning

---

## 📊 Lợi ích của từng nhóm

### Cho Giáo viên:
✅ **Giảm stress** - Không phải đoán xem học sinh có tập trung hay không  
✅ **Can thiệp kịp thời** - Nhận biết học sinh cần hỗ trợ ngay lập tức  
✅ **Điều chỉnh giảng dạy** - Thay đổi phương pháp khi thấy lớp mất tập trung  
✅ **Báo cáo khách quan** - Có dữ liệu cụ thể để báo cáo phụ huynh/nhà trường  

### Cho Học sinh:
✅ **Tự nhận thức** - Biết được mình có đang tập trung hay không  
✅ **Tự cải thiện** - Theo dõi và cải thiện khả năng tập trung  
✅ **Học hiệu quả hơn** - Duy trì focus tốt hơn khi có feedback  
✅ **Công bằng** - Được đánh giá dựa trên dữ liệu, không subjective  

### Cho Doanh nghiệp:
✅ **ROI cao hơn** - Đảm bảo nhân viên thực sự tham gia training  
✅ **Tiết kiệm chi phí** - Phát hiện sớm training không hiệu quả  
✅ **Đánh giá nhân viên** - Dữ liệu để đánh giá attitude và engagement  
✅ **Cải thiện liên tục** - Có metrics để optimize training programs  

### Cho Tổ chức:
✅ **Nâng cao chất lượng** - Cải thiện chất lượng đào tạo trực tuyến  
✅ **Competitive advantage** - Khác biệt với các nền tảng khác  
✅ **Dữ liệu phân tích** - Insights về behavior patterns  
✅ **Tuân thủ** - Có proof về attendance và engagement  

---

## 🚀 Công nghệ sử dụng

- **Frontend:** Next.js 14, React, TypeScript
- **Video:** LiveKit WebRTC
- **AI:** TensorFlow.js (Face Landmarks Detection)
- **Styling:** CSS-in-JS
- **State Management:** React Hooks, Context API
- **Authentication:** JWT, Local Storage
- **Deployment:** Vercel

---

## 📈 Roadmap tương lai

### Phase 2:
- [ ] Tích hợp voice detection (phát hiện giọng nói)
- [ ] Emotion detection (phát hiện cảm xúc)
- [ ] Recording & playback
- [ ] Breakout rooms cho làm việc nhóm

### Phase 3:
- [ ] Mobile app (iOS/Android)
- [ ] AI suggestions cho giáo viên
- [ ] Gamification cho học sinh
- [ ] Integration với LMS (Moodle, Canvas)

### Phase 4:
- [ ] Advanced analytics dashboard
- [ ] Predictive analytics
- [ ] Automated attendance
- [ ] Multi-language support

---

## 📞 Liên hệ & Hỗ trợ

- **Email:** support@eduinsightmeet.com
- **Documentation:** https://docs.eduinsightmeet.com
- **GitHub:** https://github.com/anhdoandeptrai/Final_Edu

---

**© 2026 Edu Insight Meet - Revolutionizing Online Education with AI**
