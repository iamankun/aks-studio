"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, LogIn, LogOut, Loader2 } from "lucide-react"

export function AuthTest() {
  const { user, loading, login, logout } = useAuth()

  const handleTestLogin = async () => {
    const success = await login("ankunstudio", "admin")
    console.log("Test login result:", success)
  }

  const handleLogout = () => {
    logout()
    console.log("User logged out")
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading authentication...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          useAuth Hook Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Logged in as:</span>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg space-y-2">
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Role:</strong> <Badge variant="secondary">{user.role}</Badge>
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              {user.email && (
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              )}
              {user.full_name && (
                <p>
                  <strong>Full Name:</strong> {user.full_name}
                </p>
              )}
            </div>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">Not authenticated</p>
            <Button onClick={handleTestLogin} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Test Login (ankunstudio/admin)
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Hook Status:</strong> ✅ Working
          </p>
          <p>
            <strong>Loading:</strong> {loading ? "Yes" : "No"}
          </p>
          <p>
            <strong>User State:</strong> {user ? "Authenticated" : "Not authenticated"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
