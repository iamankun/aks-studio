// Logger Service - Tôi là An Kun
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
    id: string
    timestamp: string
    level: LogLevel
    message: string
    data?: any
    userId?: string
    component?: string
    action?: string
}

class Logger {
    private logs: LogEntry[] = []
    private readonly maxLogs = 1000

    private createEntry(level: LogLevel, message: string, data?: any, meta?: {
        userId?: string
        component?: string
        action?: string
    }): LogEntry {
        return {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            userId: meta?.userId,
            component: meta?.component,
            action: meta?.action
        }
    }

    debug(message: string, data?: any, meta?: any) {
        const entry = this.createEntry('debug', message, data, meta)
        this.addLog(entry)
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, data)
        }
    }

    info(message: string, data?: any, meta?: any) {
        const entry = this.createEntry('info', message, data, meta)
        this.addLog(entry)
        console.info(`[INFO] ${message}`, data)
    }

    warn(message: string, data?: any, meta?: any) {
        const entry = this.createEntry('warn', message, data, meta)
        this.addLog(entry)
        console.warn(`[WARN] ${message}`, data)
    }

    error(message: string, error?: any, meta?: any) {
        const entry = this.createEntry('error', message, error, meta)
        this.addLog(entry)
        console.error(`[ERROR] ${message}`, error)
    }

    private addLog(entry: LogEntry) {
        this.logs.unshift(entry)
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs)
        }

        // Store in localStorage for persistence (only in browser)
        if (typeof window !== 'undefined') {
            try {
                const storedLogs = JSON.parse(localStorage.getItem('aks_logs') || '[]')
                storedLogs.unshift(entry)
                if (storedLogs.length > this.maxLogs) {
                    storedLogs.splice(this.maxLogs)
                }
                localStorage.setItem('aks_logs', JSON.stringify(storedLogs))
            } catch (e) {
                console.error('Failed to store logs:', e)
            }
        }
    }

    getLogs(): LogEntry[] {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('aks_logs')
                if (stored) {
                    return JSON.parse(stored)
                }
            } catch (e) {
                console.error('Failed to load logs:', e)
            }
        }
        return this.logs
    }

    clearLogs() {
        this.logs = []
        if (typeof window !== 'undefined') {
            localStorage.removeItem('aks_logs')
        }
    }

    exportLogs(): string {
        const logs = this.getLogs()
        return JSON.stringify(logs, null, 2)
    }

    filterLogs(level?: LogLevel, component?: string, search?: string): LogEntry[] {
        const logs = this.getLogs()
        return logs.filter(log => {
            if (level && log.level !== level) return false
            if (component && log.component !== component) return false
            if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
    }

    // Add a console helper method
    debugToConsole() {
        if (typeof window !== 'undefined') {
            console.log('%c AKs Studio Logs', 'background: #7e57c2; color: white; padding: 2px 6px; border-radius: 2px;');
            this.getLogs().forEach(log => {
                const style = this.getConsoleStyle(log.level);
                console.groupCollapsed(
                    `%c${log.level.toUpperCase()}%c ${new Date(log.timestamp).toLocaleString()} - ${log.message}`,
                    style,
                    'color: inherit'
                );
                console.log('Component:', log.component || 'Not specified');
                console.log('Action:', log.action || 'Not specified');
                console.log('User ID:', log.userId || 'Not specified');
                console.log('Data:', log.data ?? 'None');
                console.groupEnd();
            });
            return `Displayed ${this.getLogs().length} logs in console`;
        }
        return 'Console debugging only available in browser';
    }

    private getConsoleStyle(level: LogLevel): string {
        switch (level) {
            case 'debug': return 'background: #607d8b; color: white; padding: 2px 6px; border-radius: 2px;';
            case 'info': return 'background: #2196f3; color: white; padding: 2px 6px; border-radius: 2px;';
            case 'warn': return 'background: #ff9800; color: black; padding: 2px 6px; border-radius: 2px;';
            case 'error': return 'background: #f44336; color: white; padding: 2px 6px; border-radius: 2px;';
            default: return 'color: inherit';
        }
    }
}

export const logger = new Logger()
