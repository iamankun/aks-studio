// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  FileText,
  User,
  Settings,
  Users,
  Shield,
  Mail,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import type { User as UserType } from "@/types/user"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  user: UserType
  onLogout: () => void
}

export function Sidebar({ currentView, onViewChange, user, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Debug: Thêm border đỏ để kiểm tra Sidebar có render không
  const debugStyle = { border: '3px solid red', minHeight: '100vh', background: '#18181b' };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "submissions", label: "Submissions", icon: FileText },
    { id: "profile", label: "Hồ sơ", icon: User },
    { id: "settings", label: "Cài đặt", icon: Settings },
    ...(user?.role === "Label Manager" ? [
      { id: "users", label: "Quản lý Users", icon: Users },
      { id: "admin", label: "Admin Panel", icon: Shield },
      { id: "email", label: "Email Center", icon: Mail },
      { id: "logs", label: "System Logs", icon: FileText }
    ] : [])
  ]

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon
    const isActive = currentView === item.id

    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={`w-full justify-start mb-1 ${isCollapsed ? "px-2" : ""}`}
        onClick={() => {
          onViewChange(item.id)
          setIsMobileOpen(false)
        }}
      >
        <Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
        {!isCollapsed && <span>{item.label}</span>}
      </Button>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={debugStyle}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img src="/face.png" alt="AKs Studio" className="h-8 w-8 rounded" />
              <div>
                <h2 className="text-lg font-bold text-white">AKs Studio</h2>
                <p className="text-xs text-gray-400">v1.2.0-beta</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar ? user.avatar : "/face.png"} />
            <AvatarFallback>{user?.username ? user.username.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName ?? 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role ?? 'Guest'}</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full mt-3 text-gray-400 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 text-white"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileOpen(false)}>
          <div className="w-64 h-full bg-gray-800 border-r border-gray-700" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col h-full bg-gray-800 border-r border-gray-700 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
        }`}>
        <SidebarContent />
      </div>
    </>
  )
}
