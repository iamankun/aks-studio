"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { User } from "@/types/user"
import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js'
import {
  Music,
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

interface SidebarProps {
  currentUser: User
  currentView: string
  onViewChange: (view: string) => void
  onLogout: () => void
}

export function CollapsibleSidebar({ currentUser, currentView, onViewChange, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're in a mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const menuItems = [
    { id: "submissions", label: "Submissions", icon: FileText },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "users", label: "Users", icon: Users, adminOnly: true },
    { id: "admin", label: "Admin Panel", icon: Shield, adminOnly: true },
    { id: "email", label: "Email Center", icon: Mail, adminOnly: true },
    { id: "profile", label: "My Profile", icon: UserIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || currentUser.role === "Label Manager")

  // Toggle sidebar (external button for mobile)
  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button onClick={toggleSidebar} className="sidebar-toggle">
        {collapsed ? <Menu /> : <X />}
      </button>

      <Card
        className={`sidebar-collapse-animation h-full bg-gray-800 border-gray-700 rounded-none overflow-hidden ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className={`flex items-center ${collapsed ? "justify-center" : "mb-8"}`}>
            {!collapsed ? (
              <>
                <Music className="h-8 w-8 text-purple-500 mr-3 flex-shrink-0" />
                <h1 className="text-xl font-dosis-bold text-white brand-text">[tenapp]</h1>
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
                <Music className="h-8 w-8 text-purple-500" />
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

          {!collapsed && (
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    currentUser.avatar ||
                    `https://placehold.co/50x50/8b5cf6/FFFFFF?text=${currentUser.username.substring(0, 1).toUpperCase()}`
                  }
                  alt={currentUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-400 font-dosis-light">Welcome back,</p>
                  <p className="text-lg font-dosis-semibold text-white">{currentUser.username}</p>
                  <p className="text-sm text-purple-400 font-dosis">{currentUser.role}</p>
                </div>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mb-6 flex justify-center">
              <img
                src={
                  currentUser.avatar ||
                  `https://placehold.co/40x40/8b5cf6/FFFFFF?text=${currentUser.username.substring(0, 1).toUpperCase()}`
                }
                alt={currentUser.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          )}

          <nav className="space-y-2 flex-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "secondary" : "ghost"}
                  className={`w-full ${
                    collapsed ? "justify-center px-0" : "justify-start"
                  } font-dosis-medium nav-text ${
                    currentView === item.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    onViewChange(item.id)
                    if (isMobile) setCollapsed(true)
                  }}
                >
                  <Icon className={`h-4 w-4 ${collapsed ? "" : "mr-3"}`} />
                  {!collapsed && item.label}
                </Button>
              )
            })}
          </nav>

          <div className={`mt-8 pt-4 ${collapsed ? "" : "border-t border-gray-700"}`}>
            <Button
              variant="ghost"
              className={`w-full ${
                collapsed ? "justify-center px-0" : "justify-start"
              } text-red-400 hover:text-red-300 hover:bg-red-900/20 font-dosis-medium`}
              onClick={onLogout}
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
