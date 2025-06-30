"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'

export function QuickDebug() {
    const [apiResults, setApiResults] = useState<any>({})
    const [loginData, setLoginData] = useState({ username: 'ankun', password: 'admin123' })
    const { user, login, logout } = useAuth()

    const testAPI = async (endpoint: string) => {
        try {
            console.log(`Testing ${endpoint}...`)
            const response = await fetch(endpoint)
            const data = await response.json()
            console.log(`${endpoint} result:`, data)

            setApiResults(prev => ({
                ...prev,
                [endpoint]: {
                    status: response.status,
                    success: response.ok,
                    data: data
                }
            }))
        } catch (error) {
            console.error(`Error testing ${endpoint}:`, error)
            setApiResults(prev => ({
                ...prev,
                [endpoint]: {
                    status: 'ERROR',
                    success: false,
                    error: error.message
                }
            }))
        }
    }

    const testLogin = async () => {
        const success = await login(loginData.username, loginData.password)
        console.log('Login result:', success)
        setApiResults(prev => ({
            ...prev,
            '/api/auth/login': {
                status: success ? 200 : 401,
                success: success,
                data: success ? 'Login successful' : 'Login failed'
            }
        }))
    }

    const testAllAPIs = () => {
        testAPI('/api/artists')
        testAPI('/api/submissions')
        testAPI('/api/admin/stats')
        testAPI('/api/logs')
        testAPI('/api/email/stats')
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>🔧 Quick API Debug</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Login Test */}
                    <div className="p-4 bg-blue-50 rounded">
                        <h4 className="font-semibold mb-2">🔐 Login Test</h4>
                        <div className="space-y-2">
                            <div className="text-sm">
                                Current user: {user ? user.username : 'Not logged in'}
                            </div>
                            <Button onClick={testLogin} size="sm">
                                Test Login (ankun/admin123)
                            </Button>
                        </div>
                    </div>

                    <Button onClick={testAllAPIs} className="w-full">
                        Test All APIs
                    </Button>

                    <div className="space-y-2">
                        {Object.entries(apiResults).map(([endpoint, result]: [string, any]) => (
                            <div key={endpoint} className="p-2 bg-muted rounded text-sm">
                                <strong>{endpoint}:</strong>
                                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                                    {result.status}
                                </span>
                                {result.data?.count && <span> - Count: {result.data.count}</span>}
                                {result.error && <span className="text-red-600"> - {result.error}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
