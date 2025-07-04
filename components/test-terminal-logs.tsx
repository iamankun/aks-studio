"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, AlertCircle, FileText, RefreshCw, Trash2, Database, Info } from "lucide-react";
import { logger, type LogEntry, type LogLevel } from "@/lib/logger";

interface CommandError {
    message: string;
    code?: string;
    timestamp: Date;
}

interface TerminalState {
    output: string[];
    errors: CommandError[];
    isRunning: boolean;
    hasError: boolean;
}

export function TestTerminalLogs() {
    // Terminal state with error handling
    const [command, setCommand] = useState("echo 'Xin chào AKs Studio!'")
    const [terminalOutput, setTerminalOutput] = useState<string[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [terminalErrors, setTerminalErrors] = useState<CommandError[]>([])
    const [retryCount, setRetryCount] = useState(0)
    const maxRetries = 3

    // Logs state
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all")
    const [componentFilter, setComponentFilter] = useState("all-components")
    const [searchQuery, setSearchQuery] = useState("")

    // Status state
    const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "error">("disconnected")
    const [statusMessage, setStatusMessage] = useState("")

    // Load logs on mount
    useEffect(() => {
        refreshLogs()
        checkDatabaseStatus()
    }, [])

    // Filter logs based on selected filters
    useEffect(() => {
        const filteredLogs = logger.getLogs().filter(log => {
            if (levelFilter !== "all" && log.level !== levelFilter) return false
            if (componentFilter && componentFilter !== 'all-components' && log.component !== componentFilter) return false
            if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
            return true
        })
        setLogs(filteredLogs)
    }, [levelFilter, componentFilter, searchQuery])

    // Run terminal command
    const runCommand = async () => {
        if (!command.trim()) return

        setIsRunning(true)
        setTerminalOutput(prev => [...prev, `$ ${command}`])

        try {
            // Log the command execution
            logger.info(`Terminal command executed: ${command}`, { command }, { component: "Terminal" })

            // Simulate command execution (in a real app, this would use run_in_terminal or similar)
            let output: string

            if (command.includes("echo")) {
                output = command.split("echo ")[1].replace(/^['"](.*)['"]$/, "$1")
            } else if (command.includes("ls") || command.includes("dir")) {
                output = "app/\ncomponents/\nlib/\ntypes/\nnode_modules/\npublic/\nREADME.md\npackage.json"
            } else if (command.includes("whoami")) {
                output = "ankunstudio"
            } else if (command.includes("date")) {
                output = new Date().toString()
            } else if (command.includes("npm")) {
                output = "Simulating npm command...\nDone!"
            } else {
                output = `Command not recognized: ${command}`
            }

            // Add a small delay to simulate command execution
            await new Promise(resolve => setTimeout(resolve, 500))

            setTerminalOutput(prev => [...prev, output])
        } catch (error) {
            logger.error("Terminal command failed", error, { component: "Terminal" })
            setTerminalOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`])
        } finally {
            setIsRunning(false)
        }
    }

    // Clear terminal
    const clearTerminal = () => {
        setTerminalOutput([])
        logger.info("Terminal cleared", null, { component: "Terminal" })
    }

    // Refresh logs
    const refreshLogs = () => {
        const allLogs = logger.getLogs()
        setLogs(allLogs)
        logger.info("Logs refreshed", { count: allLogs.length }, { component: "LogViewer" })
    }

    // Generate test logs
    const generateTestLogs = () => {
        logger.debug("This is a debug message", { source: "TestTerminalLogs" }, { component: "LogTest" })
        logger.info("This is an info message", { source: "TestTerminalLogs" }, { component: "LogTest" })
        logger.warn("This is a warning message", { source: "TestTerminalLogs" }, { component: "LogTest" })
        try {
            throw new Error("Test error")
        } catch (error) {
            logger.error("This is an error message", error, { component: "LogTest" })
        }
        refreshLogs()
    }

    // Check database status
    const checkDatabaseStatus = async () => {
        setStatusMessage("Đang kiểm tra kết nối database...")

        try {
            const response = await fetch('/api/database-status');
            const result = await response.json();

            setDbStatus(result.success ? "connected" : "disconnected");
            setStatusMessage(result.message || (result.success ? "Đã kết nối" : "Đã ngắt kết nối"));
        } catch (error) {
            setDbStatus("error")
            setStatusMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    // Get unique components from logs
    const getUniqueComponents = () => {
        return Array.from(new Set(logs.map(log => log.component).filter(Boolean)))
    }

    // Get badge color for log level
    const getLevelColor = (level: LogLevel) => {
        switch (level) {
            case 'debug': return 'bg-gray-500'
            case 'info': return 'bg-blue-500'
            case 'warn': return 'bg-amber-500'
            case 'error': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    // Error handling function
    const handleCommandError = (error: any): CommandError => {
        return {
            message: error?.message || "An unknown error occurred",
            code: error?.code,
            timestamp: new Date()
        }
    }

    return (
        <div className="container py-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Terminal className="mr-2 h-5 w-5" />
                        Debug Console
                    </CardTitle>
                    <CardDescription>
                        Kiểm tra terminal, logs và trạng thái hệ thống
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="terminal" className="w-full">
                        <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                            <TabsTrigger
                                value="terminal"
                                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
                            >
                                Terminal
                            </TabsTrigger>
                            <TabsTrigger
                                value="logs"
                                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
                            >
                                Logs
                            </TabsTrigger>
                            <TabsTrigger
                                value="status"
                                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
                            >
                                Status
                            </TabsTrigger>
                        </TabsList>

                        {/* Terminal Tab */}
                        <TabsContent value="terminal" className="p-4"> {/* JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists. */}
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={command}
                                        onChange={(e) => setCommand(e.target.value)}
                                        placeholder="Enter terminal command..."
                                        onKeyDown={(e) => e.key === "Enter" && runCommand()}
                                    />
                                    <Button onClick={runCommand} disabled={isRunning}>
                                        {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Run"}
                                    </Button>
                                    <Button variant="outline" onClick={clearTerminal}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="bg-black text-white font-mono text-sm p-4 rounded-md h-80 overflow-auto">
                                    {terminalOutput.map((line, index) => (
                                        <div key={index} className={line.startsWith('$') ? 'text-green-400' : 'text-gray-300'}>
                                            {line}
                                        </div>
                                    ))}
                                    {isRunning && (
                                        <div className="text-yellow-300 animate-pulse">Running command...</div>
                                    )}
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p><strong>Common commands:</strong></p>
                                    <p>echo 'Hello World' - Display text</p>
                                    <p>ls - List files</p>
                                    <p>date - Show current date</p>
                                    <p>whoami - Show current user</p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Logs Tab */}
                        <TabsContent value="logs" className="p-4"> {/* JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists. */}
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2 items-end">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium">Level</label>
                                        <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | 'all')}>
                                            <SelectTrigger className="w-32">
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

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium">Component</label>
                                        <Select value={componentFilter} onValueChange={setComponentFilter}>
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="All Components" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all-components">All Components</SelectItem>
                                                {getUniqueComponents().map((component) => (
                                                    <SelectItem key={component} value={component as string}>
                                                        {component}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1 flex-1">
                                        <label className="text-xs font-medium">Search</label>
                                        <Input
                                            placeholder="Search logs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <Button onClick={refreshLogs}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>

                                    <Button variant="outline" onClick={generateTestLogs}>
                                        Generate Test Logs
                                    </Button>
                                </div>

                                <div className="border rounded-md h-80">
                                    <ScrollArea className="h-80 w-full">
                                        {logs.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
                                                <FileText className="h-12 w-12 mb-2 opacity-50" />
                                                <p>No logs found</p>
                                            </div>
                                        ) : (
                                            <div className="p-4 space-y-2">
                                                {logs.map((log, index) => (
                                                    <div key={index} className="p-3 bg-secondary/50 border border-border rounded-md">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Badge className={getLevelColor(log.level)}>
                                                                    {log.level.toUpperCase()}
                                                                </Badge>
                                                                {log.component && (
                                                                    <Badge variant="outline">{log.component}</Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm">{log.message}</p>
                                                        {log.data && (
                                                            <details className="mt-1">
                                                                <summary className="text-xs text-muted-foreground cursor-pointer">Data</summary>
                                                                <pre className="mt-1 text-xs p-2 bg-muted/50 border border-border rounded overflow-auto">
                                                                    {JSON.stringify(log.data, null, 2)}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Status Tab */}
                        <TabsContent value="status" className="p-4"> {/* JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists. */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center">
                                                <Database className="h-4 w-4 mr-2" />
                                                Database Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${dbStatus === "connected" ? "bg-green-500" :
                                                    dbStatus === "disconnected" ? "bg-amber-500" : "bg-red-500"
                                                    }`}></div>
                                                <span className="font-medium">{
                                                    dbStatus === "connected" ? "Connected" :
                                                        dbStatus === "disconnected" ? "Disconnected" : "Error"
                                                }</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">{statusMessage}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button size="sm" onClick={checkDatabaseStatus}>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Check Again
                                            </Button>
                                        </CardFooter>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center">
                                                <Info className="h-4 w-4 mr-2" />
                                                System Info
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Version:</span>
                                                    <span className="text-sm font-medium">v2.0.0</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Environment:</span>
                                                    <span className="text-sm font-medium">{process.env.NODE_ENV || 'development'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Log entries:</span>
                                                    <span className="text-sm font-medium">{logger.getLogs().length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Client:</span>
                                                    <span className="text-sm font-medium">{typeof window !== 'undefined' ? 'Browser' : 'Server'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    logger.clearLogs()
                                                    refreshLogs()
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Clear Logs
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Run Diagnostics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    logger.info("Running full system diagnostics", null, { component: "Diagnostics" })
                                                    checkDatabaseStatus()
                                                    generateTestLogs()
                                                    setTerminalOutput(prev => [...prev, "$ Running system diagnostics...", "Checking components...", "All systems operational"])
                                                }}
                                            >
                                                Run Full Diagnostics
                                            </Button>

                                            <Textarea
                                                placeholder="Add diagnostic notes here..."
                                                className="h-20"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="text-center text-xs text-muted-foreground">
                <p>AKs Studio Terminal & Logs Utility &copy; {new Date().getFullYear()}</p>
            </div>
        </div>
    )
}
