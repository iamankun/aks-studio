"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Import Badge đúng cách từ ui/badge
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Download, Trash2, Filter, Search, RefreshCw } from "lucide-react"
import { logger, type LogEntry, type LogLevel } from "@/lib/logger"
import { useAuth } from "@/components/auth-provider"

export function LogsView() {
    const { user: currentUser } = useAuth();
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
    const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
    const [componentFilter, setComponentFilter] = useState('all-components')
    const [searchQuery, setSearchQuery] = useState('')
    const [autoRefresh, setAutoRefresh] = useState(true)

    useEffect(() => {
        loadLogs()

        if (autoRefresh) {
            const interval = setInterval(loadLogs, 5000) // Refresh every 5 seconds
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    useEffect(() => {
        filterLogs()
    }, [logs, levelFilter, componentFilter, searchQuery])

    const loadLogs = async () => {
        try {
            const response = await fetch('/api/logs')
            const data = await response.json()

            if (data.success) {
                setLogs(data.logs || [])
            } else {
                console.error('Failed to fetch logs:', data.error)
                // Fallback to local logs
                const allLogs = logger.getLogs()
                setLogs(allLogs)
            }
        } catch (error) {
            console.error('Error fetching logs:', error)
            // Fallback to local logs
            const allLogs = logger.getLogs()
            setLogs(allLogs)
        }
    }

    const filterLogs = () => {
        let filtered = [...logs]

        if (levelFilter !== 'all') {
            filtered = filtered.filter(log => log.level === levelFilter)
        }

        if (componentFilter && componentFilter !== 'all-components') {
            filtered = filtered.filter(log =>
                log.component?.toLowerCase().includes(componentFilter.toLowerCase())
            )
        }

        if (searchQuery) {
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                JSON.stringify(log.data ?? {}).toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredLogs(filtered)
    }

    const clearLogs = () => {
        logger.clearLogs()
        setLogs([])
        setFilteredLogs([])
    }

    const exportLogs = () => {
        const logData = logger.exportLogs()
        const blob = new Blob([logData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `aks-studio-logs-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const getLevelColor = (level: LogLevel) => {
        switch (level) {
            case 'debug': return 'bg-gray-500'
            case 'info': return 'bg-blue-500'
            case 'warn': return 'bg-yellow-500'
            case 'error': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getUniqueComponents = () => {
        const components = logs
            .map(log => log.component)
            .filter(Boolean)
            .filter((value, index, self) => self.indexOf(value) === index)
        return components
    }

    if (!currentUser) {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang tải thông tin</h2>
                    <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
                </div>
            </div>
        );
    }

    if (currentUser.role !== "Label Manager") {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Không có quyền truy cập</h2>
                    <p className="text-gray-500">Chỉ Label Manager mới có thể xem logs</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <FileText className="mr-3 text-purple-400" />
                    System Logs ({filteredLogs.length})
                </h2>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={autoRefresh ? "bg-green-600/20" : ""}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Auto Refresh
                    </Button>
                    <Button variant="outline" onClick={exportLogs}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="destructive" onClick={clearLogs}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label>Level</Label>
                            <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | 'all')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="debug">Debug</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warn">Warning</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Component</Label>
                            <Select value={componentFilter} onValueChange={setComponentFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Components" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-components">All Components</SelectItem>
                                    {getUniqueComponents().map(component => (
                                        <SelectItem key={component} value={component}>
                                            {component}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search logs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Actions</Label>
                            <Button variant="outline" onClick={loadLogs} className="w-full">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Display */}
            <Card>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        {filteredLogs.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No logs found matching the current filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 p-4">
                                {filteredLogs.map((log, index) => (
                                    <Card key={`${log.id}-${index}`} className="bg-gray-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={`${getLevelColor(log.level)} text-white`}>
                                                        {log.level.toUpperCase()}
                                                    </Badge>
                                                    {log.component && (
                                                        <Badge variant="outline">
                                                            {log.component}
                                                        </Badge>
                                                    )}
                                                    {log.action && (
                                                        <Badge variant="secondary">
                                                            {log.action}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-gray-700 mb-2">{log.message}</p>

                                            {log.userId && (
                                                <p className="text-xs text-gray-500 mb-2">User: {log.userId}</p>
                                            )}

                                            {log.data && (
                                                <details className="mt-2">
                                                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                                                        Show Data
                                                    </summary>
                                                    <Textarea
                                                        value={JSON.stringify(log.data, null, 2)}
                                                        readOnly
                                                        className="mt-2 font-mono text-xs"
                                                        rows={6}
                                                    />
                                                </details>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
