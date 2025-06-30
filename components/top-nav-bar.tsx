"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
    Home, ArrowLeft, Music, Lock, Menu, X, User, LogOut,
    ChevronUp, ChevronDown, FileText, Upload, Users,
    Settings, Mail, Database, Shield
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { useUserRole } from "@/hooks/use-user-role"
import { useAuth } from "@/components/auth-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopNavBarProps {
    readonly currentView: string
    readonly onViewChange: (view: string) => void
}

export function TopNavBar({ currentView, onViewChange }: TopNavBarProps) {
    const { canUploadMusic } = useUserRole();
    const { user, logout } = useAuth();
    const isMobile = useIsMobile();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const getMenuClassName = () => {
        if (isMobile) {
            return mobileMenuOpen ? 'flex' : 'hidden';
        }
        return 'flex';
    };

    // Main menu items - đầy đủ navigation 
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "upload", label: "Tải lên", icon: Upload },
        { id: "submissions", label: "Submissions", icon: FileText },
        { id: "profile", label: "Hồ sơ", icon: User },
        { id: "settings", label: "Cài đặt", icon: Settings },
        ...(user?.role === "Label Manager" ? [
            { id: "users", label: "Quản lý Users", icon: Users },
            { id: "admin", label: "Admin Panel", icon: Shield },
            { id: "email", label: "Email Center", icon: Mail },
            { id: "logs", label: "System Logs", icon: FileText }
        ] : [])
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm shadow-sm border-b transition-all duration-300 ${isCollapsed ? 'h-12' : 'h-auto'}`}>
            {/* Logo section */}
            <div className="flex justify-between items-center px-4 py-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary/10 rounded-full p-1.5">
                        <img src="/face.png" alt="AKs Studio Logo" className="h-7 w-7" />
                    </div>
                    {!isCollapsed && (
                        <span className="font-dosis-semibold text-lg whitespace-nowrap ml-1">AKs Studio</span>
                    )}
                </Link>

                <div className="flex items-center gap-2">
                    {/* Dashboard Stats - Quick Access */}
                    {!isCollapsed && user && (
                        <div className="hidden lg:flex items-center gap-3 mr-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full">
                                <FileText className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">0 Submissions</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                                <Music className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">0 Tracks</span>
                            </div>
                            {user.role === "Label Manager" && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full">
                                    <Users className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium">1 Nghệ sĩ</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Collapse Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapse}
                        className="hidden md:flex"
                    >
                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>

                    {/* User Avatar & Menu */}
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-primary/10">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {user.fullName?.charAt(0) || user.username?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                    {!isCollapsed && (
                                        <div className="hidden sm:flex flex-col items-start">
                                            <span className="text-sm font-medium leading-none">
                                                {user.fullName || user.username}
                                            </span>
                                            <span className="text-xs text-muted-foreground leading-none mt-0.5">
                                                {user.role}
                                            </span>
                                        </div>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user.fullName || user.username}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email || 'Không có email'}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            Vai trò: {user.role}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Hồ sơ cá nhân</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Cài đặt</span>
                                </DropdownMenuItem>
                                {user.role === "Label Manager" && (
                                    <>
                                        <DropdownMenuItem>
                                            <Database className="mr-2 h-4 w-4" />
                                            <span>Quản lý hệ thống</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Shield className="mr-2 h-4 w-4" />
                                            <span>Admin Panel</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMobileMenu}
                            className="md:hidden"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    )}
                    <ThemeToggle />
                </div>
            </div>

            {/* Navigation menu - on its own row - Only show when not collapsed */}
            {!isCollapsed && (
                <div
                    className={`${getMenuClassName()} flex-col md:flex-row items-start md:items-center justify-between px-4 py-1.5 font-dosis mobile-menu-transition border-t border-border/30`}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
                        {/* Main Navigation Items */}
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;

                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`rounded-full hover:bg-primary/10 w-full md:w-auto justify-start ${isActive ? 'bg-primary/20 text-primary' : ''}`}
                                    onClick={() => onViewChange(item.id)}
                                >
                                    <Icon className="h-[1rem] w-[1rem] mr-1" />
                                    <span className="text-sm">{item.label}</span>
                                </Button>
                            );
                        })}

                        {/* Separator */}
                        <div className="hidden md:block w-px h-4 bg-border mx-2"></div>

                        {/* Back Button */}
                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 w-full md:w-auto justify-start" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-[1rem] w-[1rem] mr-1" />
                            <span className="text-sm">Quay lại</span>
                        </Button>

                        {/* Upload Button with Permission Check */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {canUploadMusic ? (
                                        <Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-primary/10 w-full md:w-auto justify-start">
                                            <Link href="/upload-test" className="flex items-center">
                                                <Music className="h-[1rem] w-[1rem] mr-1" />
                                                <span className="text-sm">Upload nhạc</span>
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 opacity-60 cursor-not-allowed w-full md:w-auto justify-start" disabled>
                                            <Lock className="h-[1rem] w-[1rem] mr-1" />
                                            <span className="text-sm">Upload nhạc</span>
                                        </Button>
                                    )}
                                </TooltipTrigger>
                                {!canUploadMusic && (
                                    <TooltipContent>
                                        <p>Chỉ Label Manager và Artist mới có thể upload nhạc</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}
        </nav>
    )
}
