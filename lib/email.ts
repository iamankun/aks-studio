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

// Thông tin SMTP mặc định từ environment variables (bảo mật hơn)
const getDefaultSmtpSettings = (): SmtpSettings => {
  // Ưu tiên environment variables, fallback về values đã biết
  return {
    smtpServer: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUsername: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASS, // Không hardcode password
  };
};

function getSmtpSettingsFromStorage(): SmtpSettings | null {
  if (typeof window === "undefined") {
    // Trên server-side, dùng environment variables
    return getDefaultSmtpSettings();
  }

  const savedSettings = localStorage.getItem(SMTP_SETTINGS_KEY)

  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings) as SmtpSettings;
      // Merge với default settings để đảm bảo có đầy đủ fields
      return { ...getDefaultSmtpSettings(), ...parsed };
    } catch (error) {
      console.warn("Failed to parse SMTP settings from localStorage:", error);
      return getDefaultSmtpSettings();
    }
  }

  return getDefaultSmtpSettings();
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
    return { success: false, message: "Lỗi kết nối đến API gửi email.", error: error.message ?? error.toString() };
  }
}

// Helper functions for UI components
export function getCurrentSmtpSettings(): SmtpSettings {
  return getSmtpSettingsFromStorage() ?? getDefaultSmtpSettings();
}

export function saveSmtpSettings(settings: SmtpSettings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SMTP_SETTINGS_KEY, JSON.stringify(settings));
  }
}

export function testSmtpConnection(settings: SmtpSettings): Promise<{ success: boolean; message: string }> {
  // Test connection bằng cách gửi email test
  const testEmail: EmailDetails = {
    from: settings.smtpUsername,
    to: settings.smtpUsername, // Gửi cho chính mình
    subject: `SMTP Test - ${new Date().toISOString()}`,
    textBody: "This is a test email to verify SMTP configuration.",
    htmlBody: "<p>This is a test email to verify SMTP configuration.</p>"
  };

  return sendEmail(testEmail);
}

// Export key cho các components khác sử dụng
export { SMTP_SETTINGS_KEY };
