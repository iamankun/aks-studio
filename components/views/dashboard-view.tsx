// Tôi là An Kun 
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Upload, FileText, Users } from "lucide-react"

interface DashboardStats {
    totalSubmissions: number
    totalTracks: number
    totalArtists: number
}

export function DashboardView({ onViewChange }: { onViewChange?: (view: string) => void }) {
    const [stats, setStats] = useState<DashboardStats>({
        totalSubmissions: 0,
        totalTracks: 0,
        totalArtists: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)

                // Fetch submissions
                const submissionsResponse = await fetch('/api/submissions')
                const submissionsData = await submissionsResponse.json()

                // Fetch artists
                const artistsResponse = await fetch('/api/artists')
                const artistsData = await artistsResponse.json()

                if (submissionsData.success) {
                    setStats(prev => ({
                        ...prev,
                        totalSubmissions: submissionsData.count ?? 0,
                        totalTracks: submissionsData.count ?? 0, // Same as submissions for now
                    }))
                }

                if (artistsData.success) {
                    setStats(prev => ({
                        ...prev,
                        totalArtists: artistsData.count ?? 0,
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])
    return (
        <div className="pt-4 p-6 pb-20 bg-background transition-all duration-300">
            {/* Welcome Header - Simplified */}
            <div className="mb-8 bg-card rounded-lg shadow-sm p-6 border">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Dashboard - Nền tảng phân phối nhạc số
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý và theo dõi các bản phát hành âm nhạc của bạn
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Tổng Submissions</CardTitle>
                        <FileText className="h-5 w-5 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "..." : stats.totalSubmissions}</div>
                        <p className="text-xs opacity-80 mt-1">
                            {stats.totalSubmissions === 0 ? "Chưa có submission nào" : `${stats.totalSubmissions} submissions`}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Tracks Đã Phát Hành</CardTitle>
                        <Music className="h-5 w-5 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "..." : stats.totalTracks}</div>
                        <p className="text-xs opacity-80 mt-1">
                            {stats.totalTracks === 0 ? "Chưa có track nào" : "Sẵn sàng phát hành"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Upload Nhanh</CardTitle>
                        <Upload className="h-5 w-5 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">Sẵn Sàng</div>
                        <p className="text-xs opacity-80 mt-1">Tải nhạc lên ngay</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Nghệ Sĩ</CardTitle>
                        <Users className="h-5 w-5 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "..." : stats.totalArtists}</div>
                        <p className="text-xs opacity-80 mt-1">Nghệ sĩ đang hoạt động</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border">
                    <CardHeader className="border-b">
                        <CardTitle className="text-foreground flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span>Hoạt Động Gần Đây</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium text-foreground mb-2">Chưa có hoạt động nào</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Tải lên track đầu tiên để bắt đầu!
                            </p>
                            <button
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                                onClick={() => onViewChange?.("upload")}
                            >
                                Bắt Đầu Upload
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border">
                    <CardHeader className="border-b">
                        <CardTitle className="text-foreground flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Trạng Thái Hệ Thống</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium text-foreground">Nền Tảng</span>
                                </div>
                                <span className="text-sm text-green-600 font-medium">Trực Tuyến</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-foreground">Dịch Vụ Upload</span>
                                </div>
                                <span className="text-sm text-green-600 font-medium">Sẵn Sàng</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="font-medium text-foreground">Phân Phối</span>
                                </div>
                                <span className="text-sm text-yellow-600 font-medium">Chế Độ Demo</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
