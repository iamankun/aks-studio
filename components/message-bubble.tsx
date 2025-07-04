"use client"

import { motion } from "framer-motion"
import { Message } from "./ai-chat-assistant"

// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

interface MessageBubbleProps {
    readonly message: Message
    readonly index: number
}

const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.2
        }
    }),
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
    const isUser = message.role === "user"

    return (
        <motion.div
            className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={messageVariants}
        >
            <div className={`flex items-start gap-2 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
                <div className={`p-3 rounded-2xl ${isUser
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`text-xs mt-1 ${isUser ? "text-purple-200" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
