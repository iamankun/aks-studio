// Định nghĩa kiểu dữ liệu cho cài đặt background
export interface BackgroundSettings {
    type: "gradient" | "video";
    gradient: string;
    videoUrl: string;
    opacity: number;
    randomVideo: boolean;
    videoList: string[];
    enableSound: boolean;
}

// Key lưu trữ trong localStorage
export const BACKGROUND_SETTINGS_KEY = "backgroundSettings_v2";

// Danh sách video mặc định
export const DEFAULT_VIDEO_LIST = [
    "dQw4w9WgXcQ", "kJQP7kiw5Fk", "fJ9rUzIMcZQ", "9bZkp7q19f0",
    "hTWKbfoikeg", "YQHsXMglC9A", "CevxZvSJLk8", "JGwWNGJdvx8",
    "RgKAFK5djSk", "OPf0YbXqDm0",
];

// Cài đặt background mặc định
export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
    type: "gradient",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Gradient mặc định từ settings-view
    videoUrl: "",
    opacity: 0.3,
    randomVideo: true,
    videoList: DEFAULT_VIDEO_LIST,
    enableSound: false, // Mặc định tắt âm thanh để tránh annoying
};
