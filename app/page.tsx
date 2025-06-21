"use client"

import { useState, useEffect } from "react"
import LoginView from "@/components/auth/login-view"
import RegistrationView from "@/components/auth/registration-view"
import MainAppView from "@/components/main-app-view"
import type { User } from "@/types/user"

export default function Home() {
    const [currentView, setCurrentView] = useState<"login" | "registration" | "main">("login")
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    useEffect(() => {
        // Check if user is already logged in
        const loggedInUserJSON = sessionStorage.getItem("currentUser");
        if (loggedInUserJSON) {
            try {
                const user = JSON.parse(loggedInUserJSON);
                setCurrentUser(user);
                setCurrentView("main");
            } catch (error) {
                console.error("Failed to parse user from sessionStorage:", error);
                // Optionally clear the corrupted item to prevent future errors
                sessionStorage.removeItem("currentUser");
            }
        }
    }, []);

    const handleLogin = (user: User) => {
        setCurrentUser(user)
        sessionStorage.setItem("currentUser", JSON.stringify(user))
        setCurrentView("main")
    }

    const handleLogout = () => {
        setCurrentUser(null)
        sessionStorage.removeItem("currentUser")
        setCurrentView("login")
    }

    const handleRegistration = () => {
        setCurrentView("login")
    }

    return (
        <main className="min-h-screen bg-background">
            {currentView === "login" && (
                <LoginView onLogin={handleLogin} onShowRegister={() => setCurrentView("registration")} />
            )}

            {currentView === "registration" && (
                <RegistrationView onRegistrationSuccess={handleRegistration} onShowLogin={() => setCurrentView("login")} />
            )}

            {currentView === "main" && currentUser && <MainAppView currentUser={currentUser} onLogoutAction={handleLogout} />}
        </main>
    )
}
