"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertCircle, CheckCircle } from "lucide-react"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  messages: string[]
  type: "success" | "error"
}

export function AlertModal({ isOpen, onClose, title, messages, type }: AlertModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            {type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {messages.map((message, index) => (
              <p key={index} className="text-gray-300 text-sm">
                {message}
              </p>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose} variant={type === "success" ? "default" : "destructive"}>
              Đóng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
