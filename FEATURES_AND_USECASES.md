# 🎓 Edu Insight Meet - Tính năng & Use Cases

## 📋 Tổng quan

**Edu Insight Meet** là nền tảng video conferencing thông minh dành riêng cho giáo dục, tích hợp AI phân tích hành vi học tập theo thời gian thực. Hệ thống giúp giáo viên theo dõi mức độ tương tác và tập trung của học sinh trong suốt buổi học trực tuyến.

---

## 🚀 Quick Start for New Developers

### First Time Setup
```bash
# 1. Clone and navigate
cd Final_Edu

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Visit http://localhost:3000
```

### Test the app (Manual Testing):
```javascript
// Test Account 1 (Teacher)
- Email: teacher@test.com
- Password: teacher123
- Role: Teacher

// Test Account 2 (Student)  
- Email: student@test.com
- Password: student123
- Role: Student
```

**Quick Test Flow:**
1. Login as teacher → "New Meeting" → Share code
2. Open new browser/incognito → Login as student → Enter room code
3. Grant camera permissions
4. Teacher should see student in dashboard
5. AI should detect behavior (watch console for `[AI]` logs)

### Key Files to Know
| File | Purpose | Status |
|------|---------|--------|
| `src/contexts/MeetingContext.tsx` | Global meeting + behavior state | ✅ Core |
| `src/contexts/AuthContext.tsx` | Authentication | ✅ Core |
| `src/lib/ai-detector.ts` | AI algorithm | ✅ Core |
| `src/components/AIBehaviorDetector.tsx` | AI UI + detection | ✅ Core |
| `src/app/meet/[code]/room/page.tsx` | Main video room | ✅ Core |
| `src/app/dashboard/page.tsx` | Teacher dashboard | ✅ Working |
| `src/app/history/page.tsx` | Analytics page | ❌ Incomplete |
| `src/app/settings/page.tsx` | Settings | ❌ Not functional |

---

## �️ Project Architecture Overview

### Folder Structure
```
src/
├── app/                          # Next.js pages & routes
│   ├── api/meet/token/           # LiveKit token generation API
│   ├── auth/page.tsx             # Login/Register
│   ├── dashboard/page.tsx        # Teacher dashboard (main hub)
│   ├── history/page.tsx          # Analytics & history (INCOMPLETE)
│   ├── meet/[code]/              # Room selection
│   │   └── room/page.tsx         # Video room (main meeting page)
│   ├── meeting/page.tsx          # Pre-join setup
│   └── settings/page.tsx         # Settings (NOT FUNCTIONAL)
│
├── components/                   # React components
│   ├── AIBehaviorDetector.tsx    # AI detection logic + UI
│   ├── BehaviorHistoryPanel.tsx  # Shows behavior events
│   ├── DashboardLayout.tsx       # Layout wrapper
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── StudentsBehaviorPanel.tsx # Teacher's class overview
│
├── contexts/
│   ├── AuthContext.tsx           # User auth & role management
│   └── MeetingContext.tsx        # Meeting state & behavior history
│
└── lib/
    └── ai-detector.ts           # AI detection algorithm
```

### Key Technologies
- **Frontend:** Next.js 16, React 18, TypeScript
- **Video:** LiveKit WebRTC (cloud-hosted SFU)
- **AI:** TensorFlow.js + MoveNet (pose detection)
- **State:** React Context API (AuthContext, MeetingContext)
- **Auth:** localStorage + JSON Web Tokens
- **Styling:** CSS modules (imported from LiveKit components)

### Data Flow
```
User Login (AuthContext)
    ↓
Create/Join Meeting (MeetingContext)
    ↓
Get LiveKit Token (API route)
    ↓
Open Video Room
    ├── Live video via LiveKit
    ├── AI Detection (TensorFlow.js)
    │   └── Store behavior in MeetingContext
    └── UI updates reflect behavior
        ├── Student sees own history
        └── Teacher sees class overview
```

---

## �🎯 Tình trạng phát triển (Development Status)

### ✅ COMPLETED (Hoàn tất - Sẵn sàng sử dụng)
- [x] Video Conferencing HD real-time (LiveKit WebRTC)
- [x] Audio/Video controls (Mic, Camera toggle)
- [x] Screen sharing support
- [x] Participant management (Grid layout, name badges, avatars)
- [x] Authentication & Authorization (Teacher/Student roles)
- [x] Pre-join setup (Device checking)
- [x] User dashboard & profile
- [x] AI Behavior Detection Engine (9 behaviors)
- [x] Teacher Dashboard Panel (Real-time class overview)
- [x] Student Behavior History Panel (Personal activity log)
- [x] Navigation & Routing (All 8 pages)

### 🚧 IN PROGRESS (Đang phát triển - Cần hoàn thiện)
- [ ] **Analytics & Statistics** (60% done)
  - ✅ UI components built
  - ❌ Statistics on History page show hardcoded "0" (needs data connection)
  - ❌ Need to store behavior data persistently
  - ❌ Date filtering not working
  - ❌ Time-range selection not implemented
  - **Location:** `src/app/history/page.tsx`
  - **TODO:** Connect to real behavior history data from MeetingContext

- [ ] **Settings Page** (30% done)
  - ✅ UI elements present
  - ❌ AI toggle not functional (doesn't control detection)
  - ❌ Auto-record checkbox not hooked up
  - ❌ Theme switching not implemented
  - ❌ Settings not persisted to localStorage
  - **Location:** `src/app/settings/page.tsx`
  - **TODO:** Implement setting storage and apply to app behavior

- [ ] **Screen Share** (70% done)
  - ✅ Code present with proper layout (60% priority for shared screen)
  - ✅ Screen share label visible
  - ❌ Functionality not tested in practice
  - **Location:** `src/app/meet/[code]/room/page.tsx` (line ~150)
  - **TODO:** Test with actual screen shares, verify LiveKit config

### 📋 NOT STARTED (Chưa bắt đầu)
- [ ] **Data Persistence** (0%)
  - Currently only stores in-memory (lost on page refresh)
  - Need: Backend database (Firebase/Supabase) or IndexedDB
  - Store: Meeting history, behavior timeline, user preferences
  - **Estimate:** 2-3 days

- [ ] **Recording & Playback** (0%)
  - No recording UI
  - No backend storage for videos
  - **Estimate:** 3-5 days

- [ ] **Export/Reports** (0%)
  - CSV export for behavior history
  - PDF report generation
  - Teacher can send reports to parents
  - **Estimate:** 1-2 days

- [ ] **Accessibility** (0%)
  - ARIA labels for screenreaders
  - Keyboard navigation
  - WCAG 2.1 AA compliance
  - **Estimate:** 2-3 days

- [ ] **Advanced Analytics Dashboard** (0%)
  - Charts and visualizations (using Chart.js or Recharts)
  - Behavior trend analysis
  - Predictive insights
  - **Estimate:** 3-4 days

- [ ] **Unit & Integration Tests** (0%)
  - Zero test files currently exist
  - Need Jest + React Testing Library
  - **Estimate:** 3-5 days

---

## 🔴 Known Issues & Limitations

### Critical Issues

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| **Video element discovery fails** | HIGH | `AIBehaviorDetector.tsx:45-75` | AI detection may not work with certain LiveKit layouts |
| **Global state management** | MEDIUM | `BehaviorHistoryPanel.tsx` | Memory leaks possible, hard to debug |
| **Statistics show "0"** | MEDIUM | `history/page.tsx` | Users see no data |
| **No error handling** | MEDIUM | `room/page.tsx` | App crashes on connection failure |
| **Performance > 20 users** | LOW | `StudentsBehaviorPanel.tsx` | Unknown if scales well |

### Performance Notes

- ⚠️ AI detection runs at 2 FPS (500ms interval) - CPU intensive
- ⚠️ Keypoint confidence threshold hardcoded to 0.3 - not adaptive
- ⚠️ ~50+ console.log statements - remove for production
- ⚠️ localStorage limited to 5MB - won't hold long sessions

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

## �️ Development Guide - Next Steps

### Priority 1: Data Persistence (CRITICAL - Blocker for production)

**Status:** ❌ Not started | **Estimate:** 2-3 days

**What to do:**
1. Set up Firebase/Supabase backend (or use IndexedDB for local-first)
2. Create tables: `meetings`, `behavior_history`, `user_preferences`
3. Modify `MeetingContext.tsx` to persist behavior history
4. Update `history/page.tsx` to fetch from database instead of hardcoded "0"
5. Add proper timestamps for each behavior event

**Files to modify:**
```
src/contexts/MeetingContext.tsx          (add persistence logic)
src/app/api/meet/token/route.ts          (add data save endpoint)
src/app/history/page.tsx                 (fetch from DB)
src/app/dashboard/page.tsx               (fetch current session data)
```

**Success Criteria:**
- ✅ Behavior history persists after page refresh
- ✅ Statistics show real numbers (not "0")
- ✅ Can filter by date/time range

---

### Priority 2: Fix Analytics Page

**Status:** ⚠️ 40% done | **Estimate:** 1-2 days

**What to do:**
1. Connect History page to real MeetingContext data
2. Remove hardcoded values (currently all "0")
3. Implement date filtering UI
4. Add search by student name
5. Display actual timeline with behavior events

**Files to modify:**
```
src/app/history/page.tsx                 (add data fetching, filtering)
src/lib/ai-detector.ts                   (if needed for data formatting)
```

**Success Criteria:**
- ✅ Real data shows on statistics page
- ✅ Filter by date works
- ✅ Can see individual student history

---

### Priority 3: AI Detection Robustness

**Status:** ⚠️ 90% done | **Estimate:** 1 day

**What to do:**
1. Add error handling for video element discovery
2. Test with actual participant videos from LiveKit
3. Verify detection works in different lighting conditions
4. Fine-tune keypoint confidence threshold (0.3)
5. Reduce false positives from shaky videos

**Files to modify:**
```
src/components/AIBehaviorDetector.tsx    (lines 45-75, improve element finding)
src/lib/ai-detector.ts                   (possibly adjust thresholds)
```

**Testing Checklist:**
- [ ] Works with camera off (no errors)
- [ ] Works with 1 participant
- [ ] Works with 3+ participants
- [ ] Works in poor lighting
- [ ] Accurate behavior detection

---

### Priority 4: Settings Page - Make Functional

**Status:** ⚠️ 30% done | **Estimate:** 1-2 days

**What to do:**
1. Add localStorage for user settings
2. Hook up AI toggle to actually enable/disable `AIBehaviorDetector.tsx`
3. Implement theme switching (light/dark mode)
4. Add preference for behavior detection sensitivity
5. Persist all settings to localStorage

**Files to modify:**
```
src/app/settings/page.tsx                (implement functionality)
src/contexts/MeetingContext.tsx          (add settings context)
src/components/AIBehaviorDetector.tsx    (respect AI toggle)
```

**Settings to implement:**
```javascript
{
  aiEnabled: boolean,
  detectionSensitivity: 0-1,  // 0.1 to 1.0
  theme: 'light' | 'dark',
  autoMute: boolean,
  recordingEnabled: boolean
}
```

---

### Priority 5: Screen Share Testing

**Status:** ⚠️ 70% done | **Estimate:** 0.5 day

**What to do:**
1. Test screen sharing feature end-to-end
2. Verify grid layout (60% for shared screen, 40% for participants)
3. Check if LiveKit config supports screen sharing
4. Add helper text/UI hints for screen sharing

**Files to test:**
```
src/app/meet/[code]/room/page.tsx        (line ~150)
```

**Testing Checklist:**
- [ ] Share screen appears with priority layout
- [ ] Can toggle screen share on/off
- [ ] Other participants see shared screen
- [ ] AI detection still works during screen share

---

### Priority 6: Medium-term Roadmap

**Phase 2 (Weeks 3-4):**
- [ ] Recording & Playback (3-5 days)
- [ ] CSV/PDF Report Export (1-2 days)
- [ ] Voice detection (phát hiện sinh viên nói) - 2 days
- [ ] Emotion detection (OpenFace/TensorFlow) - 3 days

**Phase 3 (Weeks 5-6):**
- [ ] Mobile app (PWA or React Native) - 4-5 days
- [ ] Breakout rooms for group work - 3 days
- [ ] Advanced analytics with charts - 2-3 days
- [ ] LMS integration (Moodle/Canvas) - 3-4 days

**Phase 4 (Weeks 7+):**
- [ ] Predictive analytics (ML model)
- [ ] Automated attendance + grading
- [ ] Multi-language support
- [ ] Accessibility (WCAG 2.1 AA)

---

## 🧪 Testing Checklist

Before pushing changes, verify:
- [ ] App runs without errors: `npm run dev`
- [ ] Can create meeting as teacher
- [ ] Can join meeting as student with room code
- [ ] Camera/mic toggles work
- [ ] AI detection triggers when camera is on
- [ ] Behavior history shows in panel
- [ ] Navigation between pages works
- [ ] No console errors (except maybe warnings)

---

## 📞 Liên hệ & Hỗ trợ

- **GitHub:** https://github.com/anhdoandeptrai/Final_Edu
- **Issues:** Create GitHub issues for bugs/features
- **Questions:** Check README.md for architecture docs

---

## 📝 Notes for Future Developers

1. **This is pre-production** - Many features are MVP (minimum viable product)
2. **Data is not persistent** - Everything resets on page refresh
3. **AI detection is client-side** - Runs in browser, not server
4. **No backend database yet** - Choose Firebase/Supabase or similar
5. **Test with actual video** - Development with camera 🎥 is essential
6. **Check console often** - ~50+ debug logs help track execution

---

