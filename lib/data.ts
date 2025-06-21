// Trong file: lib/data.ts (ví dụ)
import type { User } from "@/types/user";
import type { Submission } from "@/types/submission";

const USERS_STORAGE_KEY = "users_v2";
const SUBMISSIONS_STORAGE_KEY = "submissions_v3"; // Key cho submissions

// ... (các hàm khác như fetchUsersFromDatabase, saveUsersToDatabase, loginUser)

// Hàm tải người dùng từ localStorage
export const loadUsersFromLocalStorage = (): User[] => {
  if (typeof window !== "undefined") {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const defaultAdminUser: User = { id: "admin-001", username: "ankunstudio", password: "admin", email: "admin@ankun.dev", role: "Label Manager", fullName: "An Kun Studio", createdAt: new Date().toISOString() };
    const defaultArtistUser: User = { id: "artist-001", username: "artist", password: "123", email: "artist@ankun.dev", role: "Artist", fullName: "Artist User", createdAt: new Date().toISOString() };
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
