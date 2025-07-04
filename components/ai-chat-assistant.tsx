"use client"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sparkles, Send, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { LoadingScreen } from "@/components/loading-screen"

// Utility function để tạo ID duy nhất
let messageCounter = 0;
const generateStableId = (prefix: string = 'msg') => {
    messageCounter++;
    return `${prefix}_${messageCounter}`;
};

// Utility functions để xử lý timestamp
const getStableTimestamp = () => {
    const now = new Date();
    // Chỉ lấy phần nguyên của thời gian, bỏ milliseconds
    return new Date(Math.floor(now.getTime() / 1000) * 1000).toISOString();
};

// Format thời gian hiển thị không phụ thuộc locale
const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export type Message = {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: string
}

interface AiChatAssistantProps {
    readonly isOpen: boolean
    readonly onClose: () => void
}

export function AiChatAssistant({ isOpen, onClose }: AiChatAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: generateStableId('welcome'),
            role: "assistant",
            content: "Xin chào! Tôi là trợ lý AI của An Kun Studio. Tôi có thể trả lời các câu hỏi liên quan đến An Kun Studio, dịch vụ âm nhạc và phân phối nhạc số. Bạn cần giúp gì?",
            timestamp: getStableTimestamp(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [isInitializing, setIsInitializing] = useState(true)
    const MAX_RETRIES = 2
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        if (isOpen) {
            // Giả lập thời gian khởi động AI
            const initTimer = setTimeout(() => {
                setIsInitializing(false)
                inputRef.current?.focus()
            }, 2000)

            return () => clearTimeout(initTimer)
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim() === "" || isLoading) return

        const userMessage: Message = {
            id: generateStableId('user'),
            role: "user",
            content: input,
            timestamp: getStableTimestamp(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 15000);

            const response = await fetch("/api/ai-chat", {
                signal: controller.signal,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-Request-ID": generateStableId('req')
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            clearTimeout(timeoutId);

            // Kiểm tra headers quan trọng
            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
                throw new Error("INVALID_RESPONSE");
            }

            if (!response.ok) {
                await response.json().catch(() => null);

                if ((response.status >= 500 || response.status === 0) && retryCount < MAX_RETRIES) {
                    setRetryCount(prev => prev + 1);
                    const backoffTime = Math.pow(2, retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                    handleSubmit(e);
                    return;
                }

                if (response.status === 401) {
                    throw new Error("AUTH_ERROR");
                } else if (response.status === 400) {
                    throw new Error("REQUEST_ERROR");
                } else if (response.status === 402) {
                    throw new Error("QUOTA_EXCEEDED");
                } else if (response.status === 429) {
                    throw new Error("RATE_LIMIT");
                } else {
                    throw new Error("API_ERROR");
                }
            }

            const data = await response.json();

            if (data.isError) {
                throw new Error("RESPONSE_ERROR");
            }

            const aiMessage: Message = {
                id: generateStableId('ai'),
                role: "assistant",
                content: data.response ?? "Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại sau.",
                timestamp: getStableTimestamp(),
            }

            setMessages((prev) => [...prev, aiMessage]);
            setRetryCount(0);
        } catch (error) {
            let errorContent = "Xin lỗi! Hiện tại AI Assistant đang gặp trục trặc. Vui lòng thử lại sau vài phút.";
            const retryMessage = "\n\nBạn có thể thử: \n1. Đặt câu hỏi ngắn gọn hơn\n2. Chia nhỏ câu hỏi thành nhiều phần\n3. Chờ một lúc rồi thử lại";

            if (error instanceof Error) {
                const errorType = error.message || "UNKNOWN_ERROR";
                console.warn("AI Chat error type:", errorType);

                switch (errorType) {
                    case "AUTH_ERROR":
                        errorContent = "Xin lỗi! Có vấn đề về xác thực. Vui lòng liên hệ Admin qua:\n• Email: admin@ankunstudio.com\n• Hoặc Facebook page của chúng tôi";
                        break;
                    case "REQUEST_ERROR":
                        errorContent = "Yêu cầu không hợp lệ. Vui lòng thử lại sau.";
                        break;
                    case "QUOTA_EXCEEDED":
                        errorContent = "Quota AI đã hết. Vui lòng liên hệ admin để được hỗ trợ.";
                        break;
                    case "RATE_LIMIT":
                        errorContent = "Bạn đang gửi yêu cầu quá nhanh. Vui lòng thử lại sau.";
                        break;
                    case "RESPONSE_ERROR":
                        errorContent = "Rất tiếc! AI không thể xử lý yêu cầu này." + retryMessage;
                        break;
                    case "INVALID_RESPONSE":
                        errorContent = "Định dạng phản hồi không hợp lệ. Vui lòng báo cáo lỗi này cho admin.";
                        break;
                    case "ABORTED":
                        errorContent = "Kết nối bị gián đoạn! Vui lòng kiểm tra mạng và thử lại.";
                        break;
                    default:
                        errorContent += retryMessage;
                        break;
                }
            }

            const errorMessage: Message = {
                id: generateStableId('error'),
                role: "assistant",
                content: errorContent,
                timestamp: getStableTimestamp(),
            }
            setMessages((prev) => [...prev, errorMessage]);

            // Reset retry count nếu không phải lỗi server
            if (error instanceof Error && !error.message.includes("API_ERROR")) {
                setRetryCount(0);
            }
        } finally {
            setIsLoading(false);
        }
    }

    // Improved animations
    const chatVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                damping: 30,
                stiffness: 300,
                mass: 0.5
            }
        },
        exit: {
            opacity: 0,
            y: 20,
            scale: 0.95,
            transition: {
                duration: 0.2,
                ease: "easeOut" as const
            }
        }
    } as const

    interface MessageBubbleProps {
        readonly message: Message
        readonly index: number
    }

    function MessageBubble({ message, index }: MessageBubbleProps) {
        const isUser = message.role === "user"

        return (
            <motion.div
                className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        delay: index * 0.1,
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1]
                    }
                }}
            >
                <div
                    className={`flex items-start gap-2 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}
                >
                    <motion.div
                        className={`p-4 rounded-2xl backdrop-blur-lg border
                            ${isUser
                                ? "bg-gradient-to-br from-purple-600/90 to-purple-700/90 border-purple-500/30 text-white shadow-[0_4px_20px_rgba(168,85,247,0.2)]"
                                : "bg-gradient-to-br from-white/15 to-white/5 border-white/20 text-white/90 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                            } 
                            hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300
                        `}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className={`text-xs mt-2 ${isUser ? "text-purple-200/80" : "text-white/60"}`}>
                            {formatMessageTime(message.timestamp)}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        )
    }

    if (!isOpen) return null

    if (isInitializing) {
        return (
            <div className="fixed inset-0 z-50">
                <LoadingScreen
                    title="AI Assistant"
                    subtitle="Đang khởi động trợ lý AI..."
                    duration={2000}
                    onComplete={() => setIsInitializing(false)}
                />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-black/30 backdrop-blur-[12px] z-50 flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    className="w-full max-w-2xl"
                    variants={chatVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <Card className="shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-4 flex flex-row justify-between items-center">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 180 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                >
                                    <Sparkles className="h-5 w-5 text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                </motion.div>
                                <h3 className="font-medium text-white text-shadow-sm">AI Assistant</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px] p-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20">
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            index={index}
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                        </CardContent>

                        <CardFooter className="border-t border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-4">
                            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                                <Textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="min-h-[44px] max-h-[120px] bg-white/10 border-white/20 text-white/90 placeholder:text-white/50 resize-none rounded-2xl backdrop-blur-md focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 overflow-y-auto"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || input.trim() === ""}
                                    className={`rounded-full h-11 w-11 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:from-purple-800 disabled:to-purple-900 shadow-lg hover:shadow-purple-500/20 transition-all duration-300
                                        ${isLoading ? 'animate-pulse' : ''}`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
