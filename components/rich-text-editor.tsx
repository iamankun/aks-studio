"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, Underline, Link, ImageIcon, Code, Eye, EyeOff } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string, html: string) => void
  placeholder?: string
  mode?: "html" | "text"
}

export function RichTextEditor({ value, onChange, placeholder, mode = "text" }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [currentMode, setCurrentMode] = useState<"html" | "text">(mode)

  const insertFormatting = (before: string, after = "") => {
    const textarea = document.getElementById("rich-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText, convertToHtml(newText))

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const convertToHtml = (text: string) => {
    if (currentMode === "html") return text

    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2">$1</a>')
      .replace(/\n/g, "<br>")
  }

  const formatButtons = [
    { icon: Bold, action: () => insertFormatting("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertFormatting("*", "*"), title: "Italic" },
    { icon: Underline, action: () => insertFormatting("__", "__"), title: "Underline" },
    { icon: Code, action: () => insertFormatting("`", "`"), title: "Code" },
    { icon: Link, action: () => insertFormatting("[", "](url)"), title: "Link" },
    { icon: ImageIcon, action: () => insertFormatting("![", "](url)"), title: "Image" },
  ]

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-700 p-2 flex items-center justify-between border-b border-gray-600">
        <div className="flex items-center space-x-1">
          {formatButtons.map((btn, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={btn.action}
              className="h-8 w-8 p-0"
              title={btn.title}
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMode(currentMode === "html" ? "text" : "html")}
            className="text-xs"
          >
            {currentMode === "html" ? "HTML" : "Text"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="h-8 w-8 p-0"
            title={isPreview ? "Edit" : "Preview"}
          >
            {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="min-h-[200px]">
        {isPreview ? (
          <div
            className="p-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: convertToHtml(value) }}
          />
        ) : (
          <Textarea
            id="rich-editor"
            value={value}
            onChange={(e) => onChange(e.target.value, convertToHtml(e.target.value))}
            placeholder={placeholder}
            className="border-0 rounded-none resize-none min-h-[200px] focus:ring-0"
          />
        )}
      </div>

      {/* Help text */}
      <div className="bg-gray-750 p-2 text-xs text-gray-400">
        {currentMode === "text"
          ? "Markdown: **bold** *italic* __underline__ `code` [link](url) ![image](url)"
          : "HTML: <strong>bold</strong> <em>italic</em> <u>underline</u> <code>code</code>"}
      </div>
    </div>
  )
}
