# 📱 MyApp – Ứng dụng React Native với Expo

Đây là một dự án React Native được tạo với [Expo](https://expo.dev), giúp bạn bắt đầu phát triển ứng dụng di động một cách nhanh chóng và hiệu quả.

---

## 🚀 Bắt đầu

### 1. Clone dự án

```bash
git clone https://github.com/phamvanduy1008/GreenTreeApp.git
cd GreenTreeApp

2. Cài đặt dependencies
npm install

3. Chạy ứng dụng
npm start


Dùng Expo Go (Android/iOS) để quét QR code
Nhấn a để chạy Android Emulator (nếu có)
Nhấn w để chạy trên Web
Nhấn i để chạy iOS Simulator (macOS)

🗂 Cấu trúc thư mục
GREENTREEAPP/
├── app/                    # Router-based pages & logic
│   ├── (tabs)/             # Các tab trong app (BottomTabs)
│   ├── auth/               # Đăng nhập, đăng ký, quên mật khẩu
│   ├── components/         # Tái sử dụng UI components
│   ├── constants/          # Biến cứng, style, config
│   ├── page/               # Các trang chính khác
│   ├── popup/              # Giao diện popup (modal, toast,...)
│   ├── types/              # TypeScript types & interfaces
│   └── _layout.tsx         # Cấu trúc định tuyến toàn cục
├── assets/                 # Hình ảnh, fonts,...
├── hooks/                  # Custom React hooks
├── node_modules/           # Tự động sinh bởi npm
├── scripts/                # File script hoặc config tùy chỉnh
├── utils/                  # Hàm tiện ích (format, convert,...)
├── .env                    # Biến môi trường
├── .gitignore
├── app.json                # Cấu hình chính của Expo
├── expo-env.d.ts
├── package.json
├── package-lock.json
├── react-native.config.js
├── tsconfig.json           # Cấu hình TypeScript
└── README.md               # File hướng dẫn (chính là file này)


🧱 Công nghệ sử dụng
React Native
Expo
React Router
TypeScript 

📦 Lệnh bổ sung
Reset dự án & xóa cache:
npx expo start --clear
Cài thư viện mới:
npm install [package-name]

✍️ Tác giả
Họ tên: Nhóm Green
Email: phamvanduy.dev@gmail.com
Github: https://github.com/phamvanduy1008/GreenTreeApp.git
