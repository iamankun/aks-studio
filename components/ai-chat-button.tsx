"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AiChatAssistant } from "@/components/ai-chat-assistant"

// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

export function AiChatButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <motion.div
                className="fixed bottom-6 right-6 z-40"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.3
                }}
            >
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg hover:shadow-purple-600/20 hover:from-purple-700 hover:to-blue-600 flex items-center justify-center"
                    size="icon"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 20, -20, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            times: [0, 0.2, 0.8, 1]
                        }}
                    >
                        <Sparkles className="h-6 w-6 text-white" />
                    </motion.div>
                </Button>
            </motion.div>

            <AnimatePresence>
                {isOpen && <AiChatAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    )
}
