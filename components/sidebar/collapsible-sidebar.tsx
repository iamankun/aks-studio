"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { User } from "@/types/user"
import {
  Upload,
  Users,
  Settings,
  UserIcon,
  Mail,
  Shield,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { createClient } from "@/ultis/supabase/client"

interface SidebarProps {
  currentUser: User
  currentView: string
  onViewChange: (view: string) => void
}

export function CollapsibleSidebar({ currentUser, currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Debug log để kiểm tra role
  console.log("🔍 Sidebar Debug - Current User:", currentUser)
  console.log("🔍 Sidebar Debug - User Role:", currentUser?.role)
  console.log("🔍 Sidebar Debug - Role Type:", typeof currentUser?.role)

  useEffect(() => {
    // Chỉ set collapsed khi mount lần đầu, không set lại khi resize
    const isMobileNow = window.innerWidth < 768;
    setIsMobile(isMobileNow);
    if (isMobileNow) setCollapsed(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Safe role checking
  const isLabelManager = currentUser?.role === "Label Manager"
  console.log("🔍 Sidebar Debug - Is Label Manager:", isLabelManager)

  // Menu items cho Label Manager (7 items)
  const labelManagerMenuItems = [
    { id: "submissions", label: "Submissions", icon: FileText },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "users", label: "Users", icon: Users },
    { id: "admin", label: "Admin Panel", icon: Shield },
    { id: "email", label: "Email Center", icon: Mail },
    { id: "profile", label: "My Profile", icon: UserIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Menu items cho Artist (4 items)
  const artistMenuItems = [
    { id: "submissions", label: "My Submissions", icon: FileText },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "profile", label: "My Profile", icon: UserIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const menuItems = isLabelManager ? labelManagerMenuItems : artistMenuItems
  console.log("🔍 Sidebar Debug - Menu Items Count:", menuItems.length)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  // Add null check
  if (!currentUser) {
    return (
      <Card className="w-16 h-full bg-gray-800 border-gray-700 rounded-none">
        <div className="p-6 flex items-center justify-center">
          <div className="text-white text-xs">Loading...</div>
        </div>
      </Card>
    )
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed md:hidden z-50 top-4 left-4 p-2 rounded-full bg-gray-800 text-white shadow-lg"
        aria-label={collapsed ? "Mở menu" : "Đóng menu"}
      >
        {collapsed ? <Menu /> : <X />}
      </button>

      {/* Debug trạng thái sidebar */}
      <div style={{ position: 'fixed', top: 0, left: collapsed ? 0 : 70, zIndex: 9999, background: '#fff', color: '#000', fontSize: 12, padding: '2px 8px', border: '2px solid #f00', borderRadius: 4 }}>
        <b>DEBUG:</b> collapsed: {String(collapsed)} | isMobile: {String(isMobile)}
      </div>

      <Card
        className={`h-full bg-gray-800 border-4 border-yellow-400 border-gray-700 rounded-none overflow-hidden transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo Section */}
          <div className={`flex items-center ${collapsed ? "justify-center" : "mb-8"}`}>
            {!collapsed ? (
              <>
                <img src="/Logo-An-Kun-Studio-White.png" alt="AKs Studio" className="h-8 w-auto mr-3 flex-shrink-0" />
                <h1 className="text-xl font-dosis-bold text-white">AKs Studio</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto -mr-2 text-gray-400 hover:text-white"
                  onClick={toggleSidebar}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <img src="/Logo-An-Kun-Studio-White.png" alt="AKs Studio" className="h-8 w-8 object-contain" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-2 text-gray-400 hover:text-white"
                  onClick={toggleSidebar}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* User Info */}
          {!collapsed && (
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    currentUser?.avatar_url ||
                    `https://placehold.co/50x50/8b5cf6/FFFFFF?text=${(currentUser?.username || "U").substring(0, 1).toUpperCase()}`
                  }
                  alt={currentUser?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-400 font-dosis-light">Welcome back,</p>
                  <p className="text-lg font-dosis-semibold text-white">
                    {currentUser?.full_name || currentUser?.username}
                  </p>
                  <p className="text-sm text-purple-400 font-dosis">
                    {currentUser?.role} {isLabelManager && "✓"}
                  </p>
                  {/* Debug info */}
                  <p className="text-xs text-gray-500">
                    Menu: {menuItems.length} items | Admin: {isLabelManager ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mb-6 flex justify-center">
              <img
                src={
                  currentUser?.avatar_url ||
                  `https://placehold.co/40x40/8b5cf6/FFFFFF?text=${(currentUser?.username || "U").substring(0, 1).toUpperCase()}`
                }
                alt={currentUser?.username || "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "secondary" : "ghost"}
                  className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"} font-dosis-medium ${
                    currentView === item.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    console.log("🔍 Sidebar Debug - Clicking menu item:", item.id)
                    onViewChange(item.id)
                    // Chỉ đóng menu trên mobile nếu đang mở
                    if (isMobile && !collapsed) setCollapsed(true)
                  }}
                >
                  <Icon className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
                  {!collapsed && item.label}
                </Button>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className={`mt-8 pt-4 ${collapsed ? "" : "border-t border-gray-700"}`}>
            <Button
              variant="ghost"
              className={`w-full ${
                collapsed ? "justify-center px-0" : "justify-start"
              } text-red-400 hover:text-red-300 hover:bg-red-900/20 font-dosis-medium`}
              onClick={handleLogout}
            >
              <LogOut className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
              {!collapsed && "Logout"}
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}
