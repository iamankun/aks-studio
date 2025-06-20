// Trong file: lib/data.ts (ví dụ)
import type { User } from "@/types/user";
import type { Submission } from "@/types/submission";
import { sendEmail, type EmailDetails } from "@/lib/email";
import { neon, neonConfig } from "@neondatabase/serverless";

const USERS_STORAGE_KEY = "users_v2";
const SUBMISSIONS_STORAGE_KEY = "submissions_v3"; // Key cho submissions

// ... (các hàm khác như fetchUsersFromDatabase, saveUsersToDatabase, loginUser)

// Hàm tải người dùng từ localStorage
export const loadUsersFromLocalStorage = (): User[] => {
  if (typeof window !== "undefined") {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const defaultAdminUser: User = { id: "admin-001", username: "admin", password: "admin", email: "admin@example.com", role: "Label Manager", fullName: "Admin User", createdAt: new Date().toISOString() };
    const defaultArtistUser: User = { id: "artist-001", username: "artist", password: "123", email: "artist@example.com", role: "Artist", fullName: "Artist User", createdAt: new Date().toISOString() };
    return savedUsers ? JSON.parse(savedUsers) : [defaultAdminUser, defaultArtistUser];
  }
  return [];
};

// Hàm lưu người dùng vào localStorage
export const saveUsersToLocalStorage = (users: User[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
};

// Các hàm này giờ sẽ sử dụng localStorage helpers
// Đổi tên để rõ ràng: đây là các hàm cho localStorage, không phải database
export const fetchUsersFromClient = (): Promise<User[]> => Promise.resolve(loadUsersFromLocalStorage());

// Hàm này sẽ được thay thế bằng một API call thực sự để lưu vào DB
// Tạm thời giữ lại để các component khác không bị lỗi import
export const saveUsersToDatabase_DEPRECATED = (users: User[]): void => saveUsersToLocalStorage(users);

// Hàm tải submissions từ localStorage
export const loadSubmissionsFromLocalStorage = (): Submission[] => {
  if (typeof window !== "undefined") {
    const savedSubmissions = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    return savedSubmissions ? JSON.parse(savedSubmissions) : [];
  }
  return [];
};

// Hàm lưu submissions vào localStorage
export const saveSubmissionsToLocalStorage = (submissions: Submission[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  }
};

// Hàm fetch submissions (sử dụng localStorage helper)
// Đổi tên để rõ ràng
export const fetchSubmissionsFromClient = (): Promise<Submission[]> => Promise.resolve(loadSubmissionsFromLocalStorage());
// Hàm save submissions (sử dụng localStorage helper)
export const saveSubmissionsToClient = (submissions: Submission[]): void => saveSubmissionsToLocalStorage(submissions);

export async function registerUser(newUser: User): Promise<boolean> {
  const dbUrl = process.env.aksstudio_POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Database URL not configured. Cannot register user in DB.");
    return false;
  }
  neonConfig.fetchOptions = { cache: "no-store" };
  const sql = neon(dbUrl);

  let isUserSavedSuccessfully = false;
  try {
    // Trong thực tế, password nên được hash trước khi lưu
    // ID có thể là SERIAL và tự tăng, hoặc bạn cần cơ chế tạo ID duy nhất
    await sql`
      INSERT INTO users (id, username, password, email, role, full_name, created_at) 
      VALUES (${newUser.id || `user_${Date.now()}`}, ${newUser.username}, ${newUser.password}, ${newUser.email}, ${newUser.role}, ${newUser.fullName}, ${newUser.createdAt || new Date().toISOString()})
    `;
    isUserSavedSuccessfully = true;
    console.log(`User ${newUser.username} registered in database.`);
  } catch (error) {
    console.error("Error registering user in database:", error);
    return false; // Đăng ký user thất bại nếu không lưu được vào DB
  }

  if (isUserSavedSuccessfully) {
    // Gửi email chào mừng
    const welcomeEmail: EmailDetails = {
      from: process.env.SMTP_FROM || "ankunstudio@ankun.dev", // Sử dụng biến môi trường
      to: newUser.email,
      subject: `Chào mừng ${newUser.username || newUser.fullName} đến với AKs Studio!`,
      textBody: `Chào mừng bạn đến với nền tảng phân phối nhạc AKs Studio!\n\nTài khoản của bạn đã được tạo thành công.\nTên đăng nhập: ${newUser.username}\n\nChúc bạn có những trải nghiệm tuyệt vời!`,
      htmlBody: `<p>Chào mừng bạn đến với nền tảng phân phối nhạc <strong>AKs Studio</strong>!</p><p>Tài khoản của bạn đã được tạo thành công.</p><ul><li>Tên đăng nhập: ${newUser.username}</li></ul><p>Chúc bạn có những trải nghiệm tuyệt vời!</p>`,
    };
    try {
      const emailResult = await sendEmail(welcomeEmail);
      if (!emailResult.success) {
        console.error("Lỗi gửi email chào mừng:", emailResult.message);
        // Bạn có thể quyết định có coi đây là lỗi đăng ký hay không
      }
    } catch (error) {
      console.error("Lỗi nghiêm trọng khi gửi email chào mừng:", error);
    }
    return true; // Đăng ký user thành công (ngay cả khi email có thể lỗi nhẹ)
  }
  return false; // Đăng ký user thất bại
}

export function loginUser(username: string, password_input: string): User | null {
  const users = loadUsersFromLocalStorage();
  const user = users.find(
    (u) => u.username === username && u.password === password_input
  );

  if (user) {
    return user;
  }

  return null;
}

// Hàm đảm bảo người dùng admin mặc định tồn tại
export async function ensureDefaultAdminUser(): Promise<void> {
  const adminUsername = "admin";
  const adminRole = "Label Manager";
  const defaultAdminUser: User = {
    id: "admin-001", // ID này có thể cần được tạo tự động bởi DB
    username: adminUsername,
    // Trong thực tế, password nên được hash trước khi lưu vào DB
    password: "admin",
    email: "admin@example.com", // Sử dụng email từ SMTP_USER nếu muốn: "admin@ankun.dev"
    role: adminRole,
    fullName: "Admin User",
    createdAt: new Date().toISOString()
  };

  // Kết nối database
  // Sử dụng biến môi trường được cung cấp trong Security.md
  const dbUrl = process.env.aksstudio_POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Database URL not configured. Skipping default admin user check in DB.");
    // Fallback to localStorage logic if DB is not configured
    let localUsers = loadUsersFromLocalStorage();
    if (!localUsers.some(user => user.username === adminUsername && user.role === adminRole)) {
      localUsers.push(defaultAdminUser);
      saveUsersToLocalStorage(localUsers); // Chỉ lưu vào localStorage
      console.log("Default admin user created and saved to localStorage (DB not configured).");
    }
    return;
  }

  neonConfig.fetchOptions = { cache: "no-store" }; // Đảm bảo dữ liệu luôn mới
  const sql = neon(dbUrl);

  try {
    const existingAdmin = await sql`SELECT id FROM users WHERE username = ${adminUsername} AND role = ${adminRole} LIMIT 1`;

    if (existingAdmin.length === 0) {
      // Tạo user trong database
      // Lưu ý: Cấu trúc bảng 'users' của bạn cần khớp với các trường này.
      // ID có thể là SERIAL và tự tăng. Password nên được hash.
      await sql`INSERT INTO users (username, password, email, role, full_name, created_at, id) VALUES (${defaultAdminUser.username}, ${defaultAdminUser.password}, ${defaultAdminUser.email}, ${defaultAdminUser.role}, ${defaultAdminUser.fullName}, ${defaultAdminUser.createdAt}, ${defaultAdminUser.id})`;
      console.log("Default admin user created in database.");
    }
  } catch (error) {
    console.error("Error ensuring default admin user in database:", error);
  }

  // Vẫn đảm bảo admin user có trong localStorage để tương thích client-side
  let localUsers = loadUsersFromLocalStorage();
  if (!localUsers.some(user => user.username === adminUsername && user.role === adminRole)) {
    // Nếu admin chưa có trong localStorage (ví dụ, sau khi DB được tạo lần đầu)
    // hoặc nếu muốn đồng bộ từ DB xuống (logic phức tạp hơn, hiện tại chỉ thêm nếu chưa có)
    const adminFromDbOrDefaults = { ...defaultAdminUser }; // Giả sử lấy từ DB hoặc dùng default

    const adminExistsInLocal = localUsers.some(u => u.username === adminUsername && u.role === adminRole);
    if (!adminExistsInLocal) {
      localUsers.push(adminFromDbOrDefaults);
      saveUsersToLocalStorage(localUsers);
      console.log("Default admin user ensured in localStorage.");
    }
  }
}
