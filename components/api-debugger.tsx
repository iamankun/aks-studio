"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function APIDebugger() {
    const [results, setResults] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({})

    const testAPI = async (name: string, url: string, method = 'GET', body?: any) => {
        setLoading(prev => ({ ...prev, [name]: true }))

        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            if (body && method !== 'GET') {
                options.body = JSON.stringify(body)
            }

            console.log(`Testing ${name} API...`)
            const response = await fetch(url, options)
            const data = await response.json()

            setResults(prev => ({
                ...prev,
                [name]: {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    success: response.ok,
                    timestamp: new Date().toLocaleTimeString()
                }
            }))

        } catch (error) {
            setResults(prev => ({
                ...prev,
                [name]: {
                    error: error.message,
                    success: false,
                    timestamp: new Date().toLocaleTimeString()
                }
            }))
        } finally {
            setLoading(prev => ({ ...prev, [name]: false }))
        }
    }

    const apis = [
        { name: 'Artists', url: '/api/artists' },
        { name: 'Submissions', url: '/api/submissions' },
        { name: 'Auth', url: '/api/auth/login', method: 'POST', body: { username: 'test', password: 'invalid' } }
    ]

    return (
        <div className="p-6 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>🧪 API Debugger</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {apis.map(api => (
                            <Button
                                key={api.name}
                                onClick={() => testAPI(api.name, api.url, api.method, api.body)}
                                disabled={loading[api.name]}
                                variant={results[api.name]?.success ? 'default' : 'outline'}
                            >
                                {loading[api.name] ? '⏳' : '🧪'} Test {api.name}
                            </Button>
                        ))}
                    </div>

                    <Button
                        onClick={() => apis.forEach(api => testAPI(api.name, api.url, api.method, api.body))}
                        className="w-full mb-4"
                    >
                        🚀 Test All APIs
                    </Button>

                    <div className="space-y-4">
                        {Object.entries(results).map(([name, result]) => (
                            <Card key={name} className={`border-2 ${result.success ? 'border-green-200' : 'border-red-200'}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex justify-between">
                                        <span>{name} API</span>
                                        <span className={`text-xs px-2 py-1 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {result.success ? '✅ Success' : '❌ Failed'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs space-y-2">
                                        <div><strong>Time:</strong> {result.timestamp}</div>
                                        {result.status && <div><strong>Status:</strong> {result.status} {result.statusText}</div>}
                                        {result.error && <div className="text-red-600"><strong>Error:</strong> {result.error}</div>}
                                        {result.data && (
                                            <details>
                                                <summary className="cursor-pointer font-semibold">Response Data</summary>
                                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
