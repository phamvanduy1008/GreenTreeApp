📱 MyApp – Ứng dụng React Native với Expo
Chào mừng bạn đến với MyApp, một ứng dụng di động được phát triển bằng React Native và Expo. Dự án này sử dụng file-based routing để xây dựng ứng dụng đa nền tảng (iOS, Android) với giao diện hiện đại và hiệu năng tối ưu.

🚀 Bắt đầu
1. Cài đặt dependencies
Cài đặt các thư viện cần thiết:
npm install

2. Khởi động ứng dụng
Chạy dự án với Expo:
npx expo start

Sau khi khởi động, bạn có thể:

Quét mã QR bằng ứng dụng Expo Go trên iOS hoặc Android.
Nhấn a để chạy trên Android Emulator.
Nhấn i để chạy trên iOS Simulator (chỉ trên macOS).
Nhấn w để chạy trên trình duyệt web.


🗂 Cấu trúc thư mục
Dự án được tổ chức như sau:
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


🧱 Công nghệ sử dụng

React Native: Xây dựng ứng dụng di động đa nền tảng.
Expo: Hỗ trợ phát triển và triển khai nhanh.
React Router: Quản lý định tuyến.
TypeScript: Đảm bảo mã nguồn an toàn.


📦 Lệnh bổ sung

Reset cache:

npx expo start --clear


Cài thư viện mới:

npm install [package-name]


Reset dự án (tạo dự án mới từ mẫu):

npm run reset-project

Lệnh này sẽ di chuyển mã khởi tạo vào thư mục app-example và tạo một thư mục app trống để bắt đầu phát triển.

📚 Tài liệu tham khảo

Expo Documentation: Tìm hiểu cơ bản hoặc các chủ đề nâng cao.
Learn Expo Tutorial: Hướng dẫn từng bước xây dựng ứng dụng.
Expo on GitHub: Góp phần vào mã nguồn mở.
Discord Community: Kết nối với cộng đồng Expo.


✍️ Tác giả

Họ tên: Nhóm Green
Email: phamvanduy.dev@gmail.com
GitHub: GreenTreeApp


📝 Ghi chú

Đảm bảo đã cài Node.js và Expo CLI.
Để phát triển, chỉnh sửa các file trong thư mục app.
Nếu gặp sự cố, tham khảo tài liệu Expo hoặc liên hệ tác giả.

Cảm ơn bạn đã sử dụng MyApp! 🎉
