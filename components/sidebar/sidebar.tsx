"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { User } from "@/types/user"
import { Music, Upload, Users, Settings, UserIcon, Mail, Shield, LogOut, FileText } from "lucide-react"

interface SidebarProps {
  currentUser: User
  currentView: string
  onViewChange: (view: string) => void
  onLogout: () => void
}

export function Sidebar({ currentUser, currentView, onViewChange, onLogout }: SidebarProps) {
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

  return (
    <Card className="w-64 h-full bg-gray-800 border-gray-700 rounded-none">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Music className="h-8 w-8 text-purple-500 mr-3" />
          <h1 className="text-xl font-dosis-bold text-white brand-text">An Kun Studio Digital Music Distribution</h1>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-400 font-dosis-light">Chào nghệ sĩ,</p>
          <p className="text-lg font-dosis-semibold text-white">{currentUser.username}</p>
          <p className="text-sm text-purple-400 font-dosis">{currentUser.role}</p>
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start font-dosis-medium nav-text ${
                  currentView === item.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 font-dosis-medium"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </Card>
  )
}
