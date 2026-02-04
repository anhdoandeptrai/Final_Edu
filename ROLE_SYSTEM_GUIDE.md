# Hướng dẫn Đăng nhập/Đăng ký và Phân quyền

## Tính năng mới đã thêm

### 1. Hệ thống Đăng nhập/Đăng ký
- Người dùng cần đăng nhập trước khi sử dụng
- Hỗ trợ 2 vai trò: **Giáo viên** và **Học sinh**
- Lưu trữ thông tin người dùng trong localStorage

### 2. Phân quyền theo vai trò

#### Vai trò Học sinh (Student)
- AI phát hiện hành vi cá nhân
- Thanh Analytics hiển thị hành vi của bản thân
- Được tracking bởi AI

#### Vai trò Giáo viên (Teacher)
- **KHÔNG** bị tracking bởi AI
- Thay vào đó, xem panel phân tích tất cả học sinh
- Xem thống kê: Số học sinh tập trung, mất tập trung, buồn ngủ
- Xem danh sách học sinh với trạng thái real-time
- Xem lịch sử hoạt động của tất cả học sinh

### 3. Quản lý Meeting
- Vai trò được xác định từ lúc đăng nhập/đăng ký
- Mỗi meeting lưu thông tin người tạo và danh sách người tham gia
- Tự động phân quyền dựa trên vai trò đã chọn khi đăng nhập
- Cả giáo viên và học sinh đều có thể tạo meeting

## Luồng sử dụng

### Đăng ký tài khoản
1. Vào trang chủ (sẽ tự động redirect đến `/auth`)
2. Chọn "Đăng ký"
3. Nhập:
   - Họ và tên
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Chọn vai trò: Giáo viên hoặc Học sinh
4. Nhấn "Đăng ký"

### Đăng nhập
1. Vào trang `/auth`
2. Nhập Email, Mật khẩu và chọn vai trò
3. Nhấn "Đăng nhập"
4. Sau khi đăng nhập, vào trang Dashboard

### Tạo meeting
1. Từ Dashboard, nhấn "Tạo cuộc họp mới"
2. Hệ thống tự động tạo mã phòng
3. Chia sẻ mã phòng cho người khác (giáo viên hoặc học sinh)

### Tham gia meeting
1. Nhận mã phòng từ người tạo
2. Nhập mã vào ô "Tham gia cuộc họp"
3. Kiểm tra camera/mic
4. Nhấn "Tham gia"

## Giao diện theo vai trò

### Học sinh thấy:
- **Trái trên**: Badge AI hiển thị hành vi của mình (Tập trung/Mất tập trung/Buồn ngủ)
- **Phải**: Panel Analytics cá nhân

### Giáo viên thấy:
- **Phải trên**: Panel "Học sinh" với:
  - Thống kê tổng số học sinh
  - Số lượng học sinh theo từng trạng thái
  - Danh sách học sinh với avatar và trạng thái
  - Lịch sử hoạt động gần đây

## Files đã thêm/sửa

### Files mới:
- `src/contexts/AuthContext.tsx` - Quản lý authentication
- `src/contexts/MeetingContext.tsx` - Quản lý meetings
- `src/app/auth/page.tsx` - Trang đăng nhập/đăng ký
- `src/app/dashboard/page.tsx` - Dashboard sau khi đăng nhập
- `src/components/StudentsBehaviorPanel.tsx` - Panel cho giáo viên

### Files đã sửa:
- `src/app/layout.tsx` - Thêm AuthProvider và MeetingProvider
- `src/app/page.tsx` - Redirect đến auth hoặc dashboard
- `src/app/meet/[code]/page.tsx` - Thêm xử lý role
- `src/app/meet/[code]/room/page.tsx` - Phân quyền theo role
- `src/components/AIBehaviorDetector.tsx` - Broadcast data cho giáo viên

## Lưu ý kỹ thuật

### LocalStorage Structure
```javascript
// Users
localStorage.setItem('users', JSON.stringify([
  {
    id: "timestamp",
    name: "Nguyễn Văn A",
    email: "student@example.com",
    password: "123456",
    role: "student"
  }
]))

// Current User
localStorage.setItem('user', JSON.stringify({
  id: "timestamp",
  name: "Nguyễn Văn A",
  email: "student@example.com",
  role: "student"
}))

// Meetings
localStorage.setItem('meetings', JSON.stringify({
  "meeting_code": {
    code: "meeting_code",
    creatorId: "user_id",
    participants: [
      {
        userId: "user_id",
        userName: "Name",
        role: "teacher",
        joinedAt: 1234567890
      }
    ],
    createdAt: 1234567890
  }
}))
```

### SessionStorage Structure
```javascript
sessionStorage.setItem('meetSettings', JSON.stringify({
  userName: "Nguyễn Văn A",
  cameraEnabled: true,
  micEnabled: true,
  userRole: "student",
  userId: "user_id"
}))
```

## Test scenarios

### Scenario 1: Giáo viên tạo meeting
1. Đăng ký tài khoản giáo viên
2. Tạo meeting mới
3. Vào phòng
4. Kiểm tra: Panel học sinh hiển thị (chưa có học sinh)
5. Kiểm tra: KHÔNG có badge AI tracking

### Scenario 2: Học sinh tham gia meeting do giáo viên tạo
1. Đăng ký tài khoản học sinh
2. Join meeting với mã từ giáo viên
3. Vào phòng
4. Kiểm tra: Badge AI hiển thị hành vi
5. Kiểm tra: Panel analytics cá nhân

### Scenario 3: Học sinh tạo meeting và giáo viên tham gia
1. Đăng ký tài khoản học sinh
2. Tạo meeting mới (học sinh cũng có thể tạo)
3. Chia sẻ mã cho giáo viên
4. Giáo viên join meeting
5. Kiểm tra: Học sinh có AI tracking, giáo viên có panel xem học sinh

### Scenario 4: Nhiều học sinh
1. Tạo nhiều tài khoản học sinh
2. Tất cả join cùng meeting
3. Giáo viên thấy tất cả học sinh trong panel
4. Giáo viên thấy thống kê real-time

## Troubleshooting

### Lỗi "Email đã tồn tại"
- Email đã được đăng ký với vai trò này
- Thử email khác hoặc đăng nhập

### Không vào được meeting
- Kiểm tra đã đăng nhập chưa
- Kiểm tra mã phòng có đúng không
- Meeting phải được tạo trước khi join

### AI không hoạt động
- Chỉ học sinh mới có AI tracking
- Giáo viên không bị track
- Kiểm tra camera đã bật chưa

## Next Steps

Có thể mở rộng:
- Thêm database thực (thay localStorage)
- Thêm JWT authentication
- Thêm tính năng export báo cáo
- Thêm phân tích chi tiết hơn cho giáo viên
- Thêm tính năng chat trong lớp
- Lưu lại session học
