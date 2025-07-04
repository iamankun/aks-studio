'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XOctagon } from "lucide-react"

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class TerminalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Card className="border-destructive/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <XOctagon className="h-5 w-5" />
                            Terminal Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-destructive/90">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>
                        {this.state.errorInfo && (
                            <pre className="p-4 bg-muted/50 rounded-lg text-xs overflow-auto">
                                {this.state.errorInfo.componentStack}
                            </pre>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="text-destructive border-destructive/50 hover:bg-destructive/10"
                        >
                            Reload Terminal
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}