
# MyApp – React Native với Expo

![MyApp Logo](https://example.com/logo.png)

MyApp là một ứng dụng di động đa nền tảng (iOS, Android) được phát triển bằng **React Native** và **Expo**. Dự án sử dụng **file-based routing** để xây dựng giao diện người dùng hiện đại, dễ mở rộng.

---

## 🚀 Bắt đầu

### 1. Cài đặt dependencies

Cài đặt các thư viện cần thiết:

```bash
npm install
```

### 2. Khởi động ứng dụng

Chạy dự án:

```bash
npx expo start
```

### Tùy chọn sau khi khởi động:

- Quét mã QR bằng **Expo Go** trên iOS/Android.
- Nhấn `a` để chạy trên **Android Emulator**.
- Nhấn `i` để chạy trên **iOS Simulator** (macOS).
- Nhấn `w` để chạy trên **trình duyệt web**.

---

## 🗂 Cấu trúc thư mục

```plaintext
GREENTREEAPP/
├── app/                    # Trang và logic định tuyến
│   ├── (tabs)/             # Bottom Tabs navigation
│   ├── auth/               # Đăng nhập, đăng ký, quên mật khẩu
│   ├── components/         # UI components tái sử dụng
│   ├── constants/          # Hằng số, style, cấu hình
│   ├── page/               # Các trang chính
│   ├── popup/              # Modal, toast, popup
│   ├── types/              # TypeScript types & interfaces
│   └── _layout.tsx         # Cấu trúc định tuyến
├── assets/                 # Hình ảnh, fonts
├── hooks/                  # Custom React hooks
├── scripts/                # Script tùy chỉnh
├── utils/                  # Hàm tiện ích
├── .env                    # Biến môi trường
├── app.json                # Cấu hình Expo
├── expo-env.d.ts           # Định nghĩa biến môi trường
├── package.json            # Dependencies và scripts
├── tsconfig.json           # Cấu hình TypeScript
└── README.md               # File này
```

---

## 🧱 Công nghệ sử dụng

- **React Native**: Framework ứng dụng di động.
- **Expo**: Công cụ phát triển và triển khai.
- **React Router**: Quản lý định tuyến.
- **TypeScript**: Đảm bảo mã nguồn an toàn.

---

## 📦 Lệnh bổ sung

- **Reset cache**:

  ```bash
  npx expo start --clear
  ```

- **Cài thư viện mới**:

  ```bash
  npm install [package-name]
  ```

- **Reset dự án (tạo mã mới)**:

  ```bash
  npm run reset-project
  ```

---

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev): Hướng dẫn cơ bản và nâng cao.
- [Learn Expo Tutorial](https://learn.expo.dev/tutorials/): Xây dựng ứng dụng từng bước.
- [Expo on GitHub](https://github.com/expo/expo): Mã nguồn mở.
- [Discord Community](https://discord.com/invite/expo): Cộng đồng hỗ trợ.

---

## ✍️ Tác giả

- Nhóm: Green
- Email: [phamvanduy.dev@gmail.com](mailto:phamvanduy.dev@gmail.com)
- GitHub: [GreenTreeApp](https://github.com/GreenTreeApp)

---

## 📝 Ghi chú

- Cần cài **Node.js** và **Expo CLI**.
- Chỉnh sửa file trong thư mục `app` để phát triển.
- Liên hệ tác giả nếu gặp vấn đề.

Cảm ơn bạn đã sử dụng MyApp! 🎉
