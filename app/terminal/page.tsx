"use client"

import { TerminalErrorViewer } from "@/components/terminal-error-viewer"
import { TestTerminalLogs } from "@/components/test-terminal-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, Bug, Info, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"
import { useEffect } from "react"
import { fixSupabaseDependency } from "@/lib/migration-utils"

import { TerminalErrorBoundary } from "@/components/terminal-error-boundary"

export default function TerminalPage() {
    useEffect(() => {
        // Log page view
        logger.info("Terminal page visited", null, { component: "TerminalPage" })

        // Check for Supabase dependencies and show migration tips
        const dependencies = fixSupabaseDependency()
    }, [])

    return (
        <TerminalErrorBoundary>
            <div className="container py-8 space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">Terminal & Error Logs</h1>
            <p className="text-muted-foreground">
                View and debug application errors, check terminal logs, and monitor system status
            </p>

                <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 relative">
                <CardHeader className="pb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                            onClick={() => {
                                const notice = document.querySelector('.migration-notice');
                                notice?.classList.add('animate-fade-out');
                                setTimeout(() => {
                                    notice?.remove();
                                }, 300);
                            }}
                        >
                            <XCircle className="h-5 w-5" />
                            <span className="sr-only">Close migration notice</span>
                        </Button>
                    <CardTitle className="flex items-center text-amber-700 dark:text-amber-300">
                        <Info className="h-5 w-5 mr-2" />
                        Supabase Migration Notice
                    </CardTitle>
                    <CardDescription className="text-amber-600 dark:text-amber-400">
                        We're migrating from Supabase to Neon + WordPress databases
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="mb-2">
                            Phát hiện thấy vẫn còn các API endpoint sử dụng Supabase. Kiểm tra các file sau:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">app/api/auth/forgot-password/route.ts</code> - Đang sử dụng Supabase Client</li>
                            <li>Các file khác có thể vẫn đang import từ <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">@supabase/supabase-js</code></li>
                        </ul>
                        <p className="mt-2">
                            Cần cập nhật các endpoints này để sử dụng <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">MultiDatabaseService</code> thay vì Supabase.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="errors">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="errors" className="flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        <span>Error Logs</span>
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        <span>Terminal & Debug</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="errors" className="mt-4">
                    <TerminalErrorViewer />
                </TabsContent>
                <TabsContent value="terminal" className="mt-4">
                    <TestTerminalLogs />
                </TabsContent>
            </Tabs>
            </div>
        </TerminalErrorBoundary>
    )
}
