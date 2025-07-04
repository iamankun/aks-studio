# QUY TẮC TỔ CHỨC TẬP TIN TRONG DỰ ÁN

## Mục đích

Tài liệu này mô tả các quy tắc và hướng dẫn về cách tổ chức tập tin trong dự án để duy trì một workspace sạch sẽ, dễ quản lý và dễ hiểu.

## Quy tắc chung

1. **Thư mục gốc tối giản**: Chỉ giữ các tệp thiết yếu ở thư mục gốc như `README.md`, `STATUS.md`, `next.config.js`, `package.json`, v.v.

2. **Scripts vào thư mục scripts**: Tất cả tệp script (`.js`, `.mjs`, `.ps1`) phải được đặt trong thư mục `scripts/`.

3. **Tài liệu vào thư mục docs**: Tất cả tài liệu hướng dẫn (`.md`) phải được đặt trong thư mục `docs/`, ngoại trừ `README.md` và `STATUS.md`.

4. **Nhất quán trong cấu trúc**: Duy trì cấu trúc thư mục nhất quán giữa các phần của dự án.

5. **Đường dẫn tương đối**: Sử dụng đường dẫn tương đối trong mã nguồn để dễ dàng di chuyển và tái cấu trúc.

6. **Cập nhật tài liệu**: Khi di chuyển tệp, phải cập nhật tất cả tài liệu và tham chiếu liên quan.

7. **Kiểm tra trùng lặp**: Tránh trùng lặp tệp giữa các thư mục, kiểm tra nội dung trước khi tạo mới.

8. **Quy ước đặt tên**: Sử dụng quy ước đặt tên nhất quán cho tất cả tệp và thư mục.

9. **Phân loại rõ ràng**: Phân loại tệp theo chức năng và mục đích sử dụng.

10. **Logs riêng biệt**: Tất cả tệp log phải được lưu trong thư mục `logs/`.

11. **Quản lý tài nguyên**: Tài nguyên tĩnh như hình ảnh phải được lưu trong thư mục `public/`.

## Quy tắc giao tiếp của Copilot (Vi-VN)

1. **Sử dụng tiếng Việt**: Khi người dùng giao tiếp bằng tiếng Việt, Copilot sẽ trả lời bằng tiếng Việt.

2. **Dùng thuật ngữ phù hợp**: Sử dụng các thuật ngữ công nghệ phù hợp với bối cảnh dự án.

3. **Rõ ràng và súc tích**: Cung cấp thông tin rõ ràng, tránh trùng lặp và dài dòng.

4. **Gợi ý có tham chiếu**: Khi đưa ra gợi ý, cung cấp tham chiếu hoặc ví dụ cụ thể.

5. **Tôn trọng phong cách code hiện tại**: Đề xuất code phù hợp với phong cách đã có trong dự án.

6. **Hỗ trợ debug**: Khi gặp lỗi, cung cấp hướng dẫn debug cụ thể và dễ hiểu.

7. **Giải thích các thuật ngữ**: Giải thích các thuật ngữ kỹ thuật khi cần thiết.

8. **Tối ưu hóa đề xuất**: Đề xuất các giải pháp tối ưu cho vấn đề.

9. **Hiểu ngữ cảnh dự án**: Đưa ra phản hồi phù hợp với ngữ cảnh dự án.

10. **Thông báo tiến trình**: Cập nhật tiến trình khi thực hiện các tác vụ phức tạp.

11. **Kiểm tra tính khả thi**: Đảm bảo các đề xuất là khả thi và phù hợp với môi trường dự án.

## Thư mục và cấu trúc dự án

```
DMG/
├── app/                  # Ứng dụng Next.js
├── components/           # React components
├── docs/                 # Tài liệu hướng dẫn
├── hooks/                # React hooks
├── lib/                  # Thư viện và utilities
├── logs/                 # Log files
├── public/               # Tài nguyên tĩnh
├── scripts/              # Scripts hỗ trợ
├── styles/               # CSS và theme
├── types/                # TypeScript definitions
├── .env.example          # Template biến môi trường
├── next.config.js        # Cấu hình Next.js
├── package.json          # Cấu hình npm
├── README.md             # Giới thiệu dự án
├── STATUS.md             # Trạng thái dự án
└── tsconfig.json         # Cấu hình TypeScript
```

## Quy trình khi cần thêm script mới

1. Tạo script mới trong thư mục `scripts/`
2. Cập nhật package.json nếu cần thiết
3. Thêm tài liệu hướng dẫn trong `docs/`
4. Cập nhật STATUS.md nếu tính năng quan trọng
5. Kiểm tra và test script trước khi commit

## Quy trình khi cần di chuyển/tái cấu trúc

1. Kiểm tra tất cả tham chiếu đến tệp/thư mục cần di chuyển
2. Tạo bản sao tại vị trí mới
3. Cập nhật tất cả tham chiếu
4. Xóa tệp/thư mục cũ sau khi đã kiểm tra kỹ
5. Cập nhật tài liệu liên quan
