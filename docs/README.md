# Tài liệu Hướng dẫn của Dự án DMG

Đây là thư mục chứa tất cả tài liệu hướng dẫn của dự án DMG.

## Hướng dẫn Chung

- [Debug Guide](./debug-guide.md) - Hướng dẫn debug toàn diện
- [Debug Tools Summary](./debug-tools-summary.md) - Tóm tắt công cụ debug
- [API Debug Guide](./api-debug-guide.md) - Hướng dẫn debug API
- [Login Guide](./login-guide.md) - Hướng dẫn về hệ thống đăng nhập
- [Authorization Test](./authorization-test.md) - Kiểm tra hệ thống xác thực
- [Migration Guide](./migration-guide.md) - Hướng dẫn migration

## Hướng dẫn AI Chat

- [AI Chat Debug](./ai-chat-debug.md) - Hướng dẫn debug AI Chat
- [AI Chat Fix Guide](./ai-chat-fix-guide.md) - Hướng dẫn sửa lỗi AI Chat

## Hướng dẫn Tổ chức Dự án

- [Quy tắc Tổ chức Tập tin](./quy-tac-to-chuc-tap-tin.md) - Quy tắc và hướng dẫn tổ chức tập tin
- [Hướng dẫn Di chuyển Tài liệu](./huong-dan-di-chuyen-tai-lieu.md) - Hướng dẫn di chuyển tài liệu
- [Tóm tắt Tổ chức lại Tập tin](./tom-tat-to-chuc-lai-tap-tin.md) - Tóm tắt việc tổ chức lại tập tin

## Quản lý Label và Nhật ký

- [Hướng dẫn Quản lý Label](./huong-dan-quan-ly-label.md) - Hướng dẫn quản lý label
- [README-NHAT-KY (Scripts)](../scripts/README-NHAT-KY.md) - Hướng dẫn hệ thống nhật ký

## Sơ đồ tổ chức Thư mục và Tệp tin dự án

```
DMG
├── app/
│   ├── api/
│   │   ├── submissions/
│   │   ├── auth/
│   │   └── log/
│   ├── data/
│   └── globals.css
├── components/
│   ├── auth/
│   ├── modals/
│   ├── sidebar/
│   ├── ui/
│   └── views/
├── contexts/
│   └── navbar-context.tsx
├── dist/
├── docs/
│   ├── activity-log-*.md
│   ├── ai-chat-*.md
│   ├── api-debug-guide.md
│   ├── authorization-test.md
│   ├── debug-*.md
│   ├── huong-dan-*.md
│   ├── login-guide.md
│   ├── migration-guide.md
│   ├── quy-tac-to-chuc-tap-tin.md
│   ├── README.md
│   └── tom-tat-to-chuc-lai-tap-tin.md
├── hooks/
│   ├── use-authorization.ts
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── use-user-role.ts
│   └── use-user.ts
├── json/
│   └── turbo.json
├── lib/
│   ├── api-activity-log.ts
│   ├── app-config.ts
│   ├── audio-optimizer.ts
│   ├── auth-middleware.ts
│   ├── auth-service.ts
│   ├── authorization-service.ts
│   ├── database-service.ts
│   ├── email-service.ts
│   ├── logger.ts
│   ├── multi-database-service.ts
│   ├── server-actions.ts
│   └── utils.ts
├── logs/
│   └── api-test/
├── public/
│   ├── assets/
│   ├── fonts/
│   └── images/
├── scripts/
│   ├── api-routes-check.mjs
│   ├── check-route-handlers.mjs
│   ├── debug-*.js
│   ├── dev.ps1
│   ├── README-NHAT-KY.md
│   ├── simple-api-test.js
│   ├── test-api.ps1
│   ├── test-real-authorization.js
│   ├── test-submissions-api.mjs
│   └── (các script SQL, .js, .mjs khác)
├── storage/
│   └── config/
├── styles/
│   └── globals.css
├── types/
│   ├── audio.ts
│   ├── database.ts
│   └── index.ts
├── .env.local
├── .env.example
├── LICENSE.md
├── next.config.js
├── package.json
├── README.md
├── STATUS.md
├── storage-config.json
├── tailwind.config.ts
└── tsconfig.json
```
