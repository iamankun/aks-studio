"use strict";
exports.__esModule = true;
exports.logger = void 0;
--Active;
1750877192019;
-mute - rice - a17ojtca - pooler.ap - southeast - 1.;
aws.neon.tech;
var Logger = /** @class */ (function () {
    function Logger() {
        this.logs = [];
        this.maxLogs = 1000;
    }
    Logger.prototype.createEntry = function (level, message, data, meta) {
        return {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            data: data,
            userId: meta === null || meta === void 0 ? void 0 : meta.userId,
            component: meta === null || meta === void 0 ? void 0 : meta.component,
            action: meta === null || meta === void 0 ? void 0 : meta.action
        };
    };
    Logger.prototype.debug = function (message, data, meta) {
        var entry = this.createEntry('debug', message, data, meta);
        this.addLog(entry);
        if (process.env.NODE_ENV === 'development') {
            console.debug("[DEBUG] " + message, data);
        }
    };
    Logger.prototype.info = function (message, data, meta) {
        var entry = this.createEntry('info', message, data, meta);
        this.addLog(entry);
        console.info("[INFO] " + message, data);
    };
    Logger.prototype.warn = function (message, data, meta) {
        var entry = this.createEntry('warn', message, data, meta);
        this.addLog(entry);
        console.warn("[WARN] " + message, data);
    };
    Logger.prototype.error = function (message, error, meta) {
        var entry = this.createEntry('error', message, error, meta);
        this.addLog(entry);
        console.error("[ERROR] " + message, error);
    };
    Logger.prototype.addLog = function (entry) {
        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        // Store in localStorage for persistence (only in browser)
        if (typeof window !== 'undefined') {
            try {
                var storedLogs = JSON.parse(localStorage.getItem('aks_logs') || '[]');
                storedLogs.unshift(entry);
                if (storedLogs.length > this.maxLogs) {
                    storedLogs.splice(this.maxLogs);
                }
                localStorage.setItem('aks_logs', JSON.stringify(storedLogs));
            }
            catch (e) {
                console.error('Failed to store logs:', e);
            }
        }
    };
    Logger.prototype.getLogs = function () {
        if (typeof window !== 'undefined') {
            try {
                var stored = localStorage.getItem('aks_logs');
                if (stored) {
                    return JSON.parse(stored);
                }
            }
            catch (e) {
                console.error('Failed to load logs:', e);
            }
        }
        return this.logs;
    };
    Logger.prototype.clearLogs = function () {
        this.logs = [];
        if (typeof window !== 'undefined') {
            localStorage.removeItem('aks_logs');
        }
    };
    Logger.prototype.exportLogs = function () {
        var logs = this.getLogs();
        return JSON.stringify(logs, null, 2);
    };
    Logger.prototype.filterLogs = function (level, component, search) {
        var logs = this.getLogs();
        return logs.filter(function (log) {
            if (level && log.level !== level)
                return false;
            if (component && log.component !== component)
                return false;
            if (search && !log.message.toLowerCase().includes(search.toLowerCase()))
                return false;
            return true;
        });
    };
    // Add a console helper method
    Logger.prototype.debugToConsole = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            console.log('%c AKs Studio Logs', 'background: #7e57c2; color: white; padding: 2px 6px; border-radius: 2px;');
            this.getLogs().forEach(function (log) {
                var style = _this.getConsoleStyle(log.level);
                console.groupCollapsed("%c" + log.level.toUpperCase() + "%c " + new Date(log.timestamp).toLocaleString() + " - " + log.message, style, 'color: inherit');
                console.log('Component:', log.component || 'Not specified');
                console.log('Action:', log.action || 'Not specified');
                console.log('User ID:', log.userId || 'Not specified');
                console.log('Data:', log.data || 'None');
                console.groupEnd();
            });
            return "Displayed " + this.getLogs().length + " logs in console";
        }
        return 'Console debugging only available in browser';
    };
    Logger.prototype.getConsoleStyle = function (level) {
        switch (level) {
            case 'debug': return 'background: #607d8b; color: white; padding: 2px 6px; border-radius: 2px;';
            case 'info': return 'background: #2196f3; color: white; padding: 2px 6px; border-radius: 2px;';
            case 'warn': return 'background: #ff9800; color: black; padding: 2px 6px; border-radius: 2px;';
            case 'error': return 'background: #f44336; color: white; padding: 2px 6px; border-radius: 2px;';
            default: return 'color: inherit';
        }
    };
    return Logger;
}());
exports.logger = new Logger();
