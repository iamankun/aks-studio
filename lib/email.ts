// Tôi là An Kun

export interface SmtpSettings {
  smtpServer: string
  smtpPort: string
  smtpUsername: string
  smtpPassword?: string // Password có thể không được lưu trực tiếp hoặc mã hóa
  connected?: boolean // Trạng thái kết nối giả lập
}

export interface EmailDetails {
  to: string
  cc?: string
  bcc?: string
  from: string
  subject: string
  textBody: string
  htmlBody?: string
}

const SMTP_SETTINGS_KEY = "emailSettings_v2" // Key lưu trữ trong localStorage từ SettingsView

// Thông tin SMTP mặc định từ Security.md
const DEFAULT_SMTP_SETTINGS: SmtpSettings = {
  smtpServer: "smtp.mail.me.com",
  smtpPort: "587",
  smtpUsername: "ankunstudio@ankun.dev", // SMTP_USER
  smtpPassword: "grsa-aaxz-midn-pjta", // SMTP_PASS
  connected: false, // Mặc định là chưa kết nối cho đến khi test
};

function getSmtpSettingsFromStorage(): SmtpSettings | null {
  if (typeof window === "undefined") {
    // Trên server-side hoặc nếu không có window, có thể trả về null hoặc default
    // Tuy nhiên, sendEmail chủ yếu được gọi từ client contexts có localStorage (EmailCenterView, SettingsView)
    // Nếu cần dùng ở server, logic này cần được xem xét lại.
    return DEFAULT_SMTP_SETTINGS; // Sử dụng default nếu không có window, mặc dù ít khả năng xảy ra trong ngữ cảnh hiện tại
  }
  const savedSettings = localStorage.getItem(SMTP_SETTINGS_KEY)
  return savedSettings ? (JSON.parse(savedSettings) as SmtpSettings) : DEFAULT_SMTP_SETTINGS;
}

export async function sendEmail(
  details: EmailDetails,
): Promise<{ success: boolean; message: string; error?: any }> {
  // Kiểm tra cơ bản phía client (có thể bỏ qua nếu API đã kiểm tra kỹ)
  if (!details.to || !details.subject || (!details.textBody && !details.htmlBody)) {
    return { success: false, message: "Thông tin email chưa đầy đủ." };
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });

    const result = await response.json();
    return result;

  } catch (error: any) {
    console.error("Client Error calling send-email API:", error);
    return { success: false, message: "Lỗi kết nối đến API gửi email.", error: error.message || error.toString() };
  }
}
