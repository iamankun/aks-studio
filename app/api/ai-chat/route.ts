import { NextRequest, NextResponse } from "next/server"

// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

// Validate API key format
function isValidApiKey(key: string): boolean {
    // DeepSeek API key format validation
    return /^[A-Za-z0-9-_]{30,}$/.test(key);
}

// Validate endpoint URL
function isValidEndpoint(url: string): boolean {
    try {
        new URL(url);
        return url.startsWith('https://');
    } catch {
        return false;
    }
}

// Config
const API_KEY = process.env.API_KEY;
const AI_ENDPOINT = process.env.AI_ENDPOINT;
const AI_MODEL = process.env.AI_MODEL;

// Validate config
const configValidation = {
    apiKey: API_KEY,
    endpoint: AI_ENDPOINT,
    model: !!AI_MODEL
};

// Debug log with validation
console.log("DEBUG AI CHAT CONFIG:", {
    ...configValidation,
    apiKeyExists: !!API_KEY,
    endpoint: AI_ENDPOINT,
    model: AI_MODEL,
    usingDefault: true,
    usingDefaultEndpoint: AI_ENDPOINT
});

// Check if config is valid before starting server
if (!configValidation.apiKey || !configValidation.endpoint || !configValidation.model) {
    console.error("Invalid AI config:", configValidation);
}

const ANKUN_CONTEXT = `
An Kun Studio là một công ty phân phối nhạc số và hỗ trợ nghệ sĩ. 
Được thành lập bởi An Kun, công ty cung cấp các dịch vụ:
- Phân phối nhạc số đến các nền tảng như Spotify, Apple Music, YouTube Music
- Quản lý bản quyền và thu thập royalty
- Hỗ trợ quảng bá và tiếp thị âm nhạc
- Sản xuất và thu âm chuyên nghiệp

Chỉ trả lời các câu hỏi liên quan đến An Kun Studio, âm nhạc, và phân phối nhạc số. 
Nếu câu hỏi không liên quan, lịch sự từ chối trả lời và đề xuất hỏi về các dịch vụ của An Kun Studio.
`

export async function POST(request: NextRequest) {
    try {
        // Validate config first
        if (!configValidation.apiKey) {
            return NextResponse.json(
                { error: "API key không hợp lệ hoặc chưa được cấu hình" },
                { status: 401 }
            );
        }

        if (!configValidation.endpoint) {
            return NextResponse.json(
                { error: "AI endpoint không hợp lệ" },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { messages } = body as { messages: Array<{ role: string; content: string }> };

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Định dạng yêu cầu không hợp lệ" },
                { status: 400 }
            );
        }

        // Thêm context system message vào đầu danh sách tin nhắn
        const messagesWithContext = [
            { role: "system", content: ANKUN_CONTEXT },
            ...messages
        ]

        // Gửi đến Deepseek AI endpoint
        console.log("Sending request to AI endpoint:", AI_ENDPOINT);
        console.log("Request body:", JSON.stringify({
            model: AI_MODEL,
            messages: messagesWithContext.map(m => ({ role: m.role, content: m.content }))
        }, null, 2));

        const response = await fetch(AI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: messagesWithContext
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("AI API error:", errorText, "Status:", response.status, "Headers:", Object.fromEntries([...response.headers.entries()]))

            // Lưu ý: Chuyển mọi lỗi từ API thành phản hồi 200 với thông báo lỗi
            // Điều này giúp trình xử lý phía client vẫn nhận được phản hồi có cấu trúc

            // Tạo tin nhắn lỗi phù hợp dựa trên mã trạng thái
            const errorResponse = {
                response: "Đã xảy ra lỗi khi xử lý yêu cầu AI",
                isError: true,
                originalStatus: response.status,
                details: errorText
            };

            if (response.status === 401) {
                errorResponse.response = "Lỗi xác thực: API key không hợp lệ hoặc thiếu";
            } else if (response.status === 400) {
                errorResponse.response = "Lỗi định dạng yêu cầu: " + errorText;
            } else {
                errorResponse.response = "Lỗi từ máy chủ AI: " + errorText;
            }

            // Trả về status 200 nhưng với thông báo lỗi
            return NextResponse.json(errorResponse);
        }

        const data = await response.json()

        return NextResponse.json({
            response: data?.choices?.[0]?.message?.content ?? "Không nhận được phản hồi từ AI",
        })
    } catch (error) {
        console.error("AI chat API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
