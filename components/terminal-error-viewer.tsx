"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, AlarmClock, Search, XCircle, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { logger } from "@/lib/logger"

export function TerminalErrorViewer() {
    interface TerminalError {
        id: string;
        message: string;
        stack?: string;
        source: 'nextjs' | 'api' | 'console';
        timestamp: Date;
        metadata?: Record<string, any>;
        details?: string;
        endpoint?: string;
        digest?: string;
    }

    const [terminalErrors, setTerminalErrors] = useState<TerminalError[]>([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState("")
    const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({})
    const [loadError, setLoadError] = useState<string | null>(null)

    useEffect(() => {
        loadTerminalErrors()
    }, [])

    const loadTerminalErrors = async () => {
        setLoading(true)
        try {
            // Check Next.js error logs from localStorage
            const nextJsErrors = getNextJsErrorsFromStorage()

            // Check for API errors
            const apiErrors = await checkApiEndpoints()

            // Get console errors
            const consoleErrors = getConsoleErrorsFromStorage()

            // Combine all errors
            const allErrors = [
                ...nextJsErrors.map(err => ({ ...err, source: 'nextjs' })),
                ...apiErrors.map(err => ({ ...err, source: 'api' })),
                ...consoleErrors.map(err => ({ ...err, source: 'console' }))
            ]

            // Sort by timestamp (newest first)
            allErrors.sort((a, b) =>
                new Date(b.timestamp || Date.now()).getTime() -
                new Date(a.timestamp || Date.now()).getTime()
            )

            setTerminalErrors(allErrors)
            logger.info("Terminal errors loaded", { count: allErrors.length }, { component: "TerminalErrorViewer" })
        } catch (error) {
            logger.error("Failed to load terminal errors", error, { component: "TerminalErrorViewer" })
        } finally {
            setLoading(false)
        }
    }

    const getNextJsErrorsFromStorage = () => {
        try {
            const errorsJson = localStorage.getItem("aks_errors")
            return errorsJson ? JSON.parse(errorsJson) : []
        } catch (error) {
            logger.error("Failed to parse Next.js errors", error, { component: "TerminalErrorViewer" })
            return []
        }
    }

    const getConsoleErrorsFromStorage = () => {
        try {
            const errorsJson = localStorage.getItem("aks_console_errors")
            return errorsJson ? JSON.parse(errorsJson) : []
        } catch (error) {
            logger.error("Failed to parse console errors", error, { component: "TerminalErrorViewer" })
            return []
        }
    }

    const checkApiEndpoints = async () => {
        const apiErrors = []

        try {
            // Check database status
            const dbResponse = await fetch("/api/database-status")
            const dbData = await dbResponse.json()

            if (!dbData.success) {
                apiErrors.push({
                    message: "Database connection error",
                    details: dbData.message || "Unknown database error",
                    timestamp: new Date().toISOString(),
                    endpoint: "/api/database-status"
                })
            }
        } catch (error) {
            apiErrors.push({
                message: "Database API error",
                details: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
                endpoint: "/api/database-status"
            })
        }

        return apiErrors
    }

    const clearErrors = () => {
        if (confirm("Are you sure you want to clear all error logs?")) {
            localStorage.removeItem("aks_errors")
            localStorage.removeItem("aks_console_errors")
            setTerminalErrors([])
            logger.info("Terminal errors cleared", null, { component: "TerminalErrorViewer" })
        }
    }

    const toggleExpandError = (index: number) => {
        setExpandedErrors(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }
    const filteredErrors = terminalErrors.filter(error => {
        if (!filter) return true
        const searchText = filter.toLowerCase()

        return (
            error.message?.toLowerCase().includes(searchText) ||
            error.details?.toLowerCase().includes(searchText) ||
            error.endpoint?.toLowerCase().includes(searchText) ||
            error.source?.toLowerCase().includes(searchText)
        )
    })
    const getBadgeColor = (source: string) => {
        switch (source) {
            case 'nextjs': return 'bg-red-500'
            case 'api': return 'bg-amber-500'
            case 'console': return 'bg-blue-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">
                    Terminal & Logs Error Viewer
                </CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadTerminalErrors}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearErrors}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Filter errors..."
                            className="pl-8"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        {filter && (
                            <button
                                onClick={() => setFilter("")}
                                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">Loading errors...</span>
                    </div>
                ) : filteredErrors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {filter ? "No errors match your filter" : "No errors found in the terminal"}
                    </div>
                ) : (
                    <ScrollArea className="h-96">
                        <div className="space-y-3">
                            {filteredErrors.map((error, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getBadgeColor(error.source)}>
                                                {error.source?.toUpperCase() || "ERROR"}
                                            </Badge>
                                            {error.endpoint && (
                                                <Badge variant="outline">
                                                    {error.endpoint}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <AlarmClock className="h-3 w-3 mr-1" />
                                                {error.timestamp ? new Date(error.timestamp).toLocaleString() : "Unknown time"}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpandError(index)}
                                            >
                                                {expandedErrors[index] ? "Collapse" : "Expand"}
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="mt-2 text-sm font-medium">
                                        {error.message || "Unknown error"}
                                    </p>

                                    {expandedErrors[index] && (
                                        <div className="mt-2">
                                            {error.details && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500">Details:</p>
                                                    <pre className="mt-1 text-xs whitespace-pre-wrap p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                                                        {typeof error.details === 'object'
                                                            ? JSON.stringify(error.details, null, 2)
                                                            : error.details}
                                                    </pre>
                                                </div>
                                            )}

                                            {error.stack && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500">Stack trace:</p>
                                                    <pre className="mt-1 text-xs whitespace-pre-wrap p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                                                        {error.stack}
                                                    </pre>
                                                </div>
                                            )}

                                            {error.digest && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500">Error digest: {error.digest}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                    <div>Total errors: {filteredErrors.length}</div>
                    <div>Last refreshed: {new Date().toLocaleTimeString()}</div>
                </div>
            </CardContent>
        </Card>
    )
}