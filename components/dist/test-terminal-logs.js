"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.TestTerminalLogs = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var module_1 = require();
var tabs_1 = require("@/components/ui/tabs");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var logger_1 = require("@/lib/logger");
var database_service_1 = require("@/lib/database-service");
function TestTerminalLogs() {
    var _this = this;
    // Terminal state
    var _a = react_1.useState("echo 'Xin chào AKs Studio!'"), command = _a[0], setCommand = _a[1];
    var _b = react_1.useState([]), terminalOutput = _b[0], setTerminalOutput = _b[1];
    var _c = react_1.useState(false), isRunning = _c[0], setIsRunning = _c[1];
    // Logs state
    var _d = react_1.useState([]), logs = _d[0], setLogs = _d[1];
    var _e = react_1.useState("all"), levelFilter = _e[0], setLevelFilter = _e[1];
    var _f = react_1.useState(""), componentFilter = _f[0], setComponentFilter = _f[1];
    var _g = react_1.useState(""), searchQuery = _g[0], setSearchQuery = _g[1];
    // Status state
    var _h = react_1.useState("disconnected"), dbStatus = _h[0], setDbStatus = _h[1];
    var _j = react_1.useState(""), statusMessage = _j[0], setStatusMessage = _j[1];
    // Load logs on mount
    react_1.useEffect(function () {
        refreshLogs();
        checkDatabaseStatus();
    }, []);
    // Filter logs based on selected filters
    react_1.useEffect(function () {
        var filteredLogs = logger_1.logger.getLogs().filter(function (log) {
            if (levelFilter !== "all" && log.level !== levelFilter)
                return false;
            if (componentFilter && log.component !== componentFilter)
                return false;
            if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()))
                return false;
            return true;
        });
        setLogs(filteredLogs);
    }, [levelFilter, componentFilter, searchQuery]);
    // Run terminal command
    var runCommand = function () { return __awaiter(_this, void 0, void 0, function () {
        var output_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!command.trim())
                        return [2 /*return*/];
                    setIsRunning(true);
                    setTerminalOutput(function (prev) { return __spreadArrays(prev, ["$ " + command]); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Log the command execution
                    logger_1.logger.info("Terminal command executed: " + command, { command: command }, { component: "Terminal" });
                    if (command.includes("echo")) {
                        output_1 = command.split("echo ")[1].replace(/^['"](.*)['"]$/, "$1");
                    }
                    else if (command.includes("ls") || command.includes("dir")) {
                        output_1 = "app/\ncomponents/\nlib/\ntypes/\nnode_modules/\npublic/\nREADME.md\npackage.json";
                    }
                    else if (command.includes("whoami")) {
                        output_1 = "ankunstudio";
                    }
                    else if (command.includes("date")) {
                        output_1 = new Date().toString();
                    }
                    else if (command.includes("npm")) {
                        output_1 = "Simulating npm command...\nDone!";
                    }
                    else {
                        output_1 = "Command not recognized: " + command;
                    }
                    // Add a small delay to simulate command execution
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 2:
                    // Add a small delay to simulate command execution
                    _a.sent();
                    setTerminalOutput(function (prev) { return __spreadArrays(prev, [output_1]); });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    logger_1.logger.error("Terminal command failed", error_1, { component: "Terminal" });
                    setTerminalOutput(function (prev) { return __spreadArrays(prev, ["Error: " + (error_1 instanceof Error ? error_1.message : String(error_1))]); });
                    return [3 /*break*/, 5];
                case 4:
                    setIsRunning(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Clear terminal
    var clearTerminal = function () {
        setTerminalOutput([]);
        logger_1.logger.info("Terminal cleared", null, { component: "Terminal" });
    };
    // Refresh logs
    var refreshLogs = function () {
        var allLogs = logger_1.logger.getLogs();
        setLogs(allLogs);
        logger_1.logger.info("Logs refreshed", { count: allLogs.length }, { component: "LogViewer" });
    };
    // Generate test logs
    var generateTestLogs = function () {
        logger_1.logger.debug("This is a debug message", { source: "TestTerminalLogs" }, { component: "LogTest" });
        logger_1.logger.info("This is an info message", { source: "TestTerminalLogs" }, { component: "LogTest" });
        logger_1.logger.warn("This is a warning message", { source: "TestTerminalLogs" }, { component: "LogTest" });
        logger_1.logger.error("This is an error message", new Error("Test error"), { component: "LogTest" });
        refreshLogs();
    };
    // Check database status
    var checkDatabaseStatus = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setStatusMessage("Checking database connection...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, database_service_1.dbService.checkConnection()];
                case 2:
                    result = _a.sent();
                    setDbStatus(result.success ? "connected" : "disconnected");
                    setStatusMessage(result.message || (result.success ? "Connected" : "Disconnected"));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    setDbStatus("error");
                    setStatusMessage("Error: " + (error_2 instanceof Error ? error_2.message : String(error_2)));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Get unique components from logs
    var getUniqueComponents = function () {
        return Array.from(new Set(logs.map(function (log) { return log.component; }).filter(Boolean)));
    };
    // Get badge color for log level
    var getLevelColor = function (level) {
        switch (level) {
            case 'debug': return 'bg-gray-500';
            case 'info': return 'bg-blue-500';
            case 'warn': return 'bg-amber-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    return (React.createElement("div", { className: "container py-6 space-y-6" },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center" },
                    React.createElement(lucide_react_1.Terminal, { className: "mr-2 h-5 w-5" }),
                    "Debug Console"),
                React.createElement(card_1.CardDescription, null, "Ki\u1EC3m tra terminal, logs v\u00E0 tr\u1EA1ng th\u00E1i h\u1EC7 th\u1ED1ng")),
            React.createElement(card_1.CardContent, { className: "p-0" },
                React.createElement(tabs_1.Tabs, { defaultValue: "terminal", className: "w-full" },
                    React.createElement(tabs_1.TabsList, { className: "w-full rounded-none border-b bg-transparent p-0" },
                        React.createElement(tabs_1.TabsTrigger, { value: "terminal", className: "rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary" }, "Terminal"),
                        React.createElement(tabs_1.TabsTrigger, { value: "logs", className: "rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary" }, "Logs"),
                        React.createElement(tabs_1.TabsTrigger, { value: "status", className: "rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary" }, "Status")),
                    React.createElement(tabs_1.TabsContent, { value: "terminal", className: "p-4" },
                        " ",
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(input_1.Input, { value: command, onChange: function (e) { return setCommand(e.target.value); }, placeholder: "Enter terminal command...", onKeyDown: function (e) { return e.key === "Enter" && runCommand(); } }),
                                React.createElement(button_1.Button, { onClick: runCommand, disabled: isRunning }, isRunning ? React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 animate-spin" }) : "Run"),
                                React.createElement(button_1.Button, { variant: "outline", onClick: clearTerminal },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                            React.createElement("div", { className: "bg-black text-white font-mono text-sm p-4 rounded-md h-80 overflow-auto" },
                                terminalOutput.map(function (line, index) { return (React.createElement("div", { key: index, className: line.startsWith('$') ? 'text-green-400' : 'text-gray-300' }, line)); }),
                                isRunning && (React.createElement("div", { className: "text-yellow-300 animate-pulse" }, "Running command..."))),
                            React.createElement("div", { className: "text-xs text-gray-500 space-y-1" },
                                React.createElement("p", null,
                                    React.createElement("strong", null, "Common commands:")),
                                React.createElement("p", null, "echo 'Hello World' - Display text"),
                                React.createElement("p", null, "ls - List files"),
                                React.createElement("p", null, "date - Show current date"),
                                React.createElement("p", null, "whoami - Show current user")))),
                    React.createElement(tabs_1.TabsContent, { value: "logs", className: "p-4" },
                        " ",
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "flex flex-wrap gap-2 items-end" },
                                React.createElement("div", { className: "space-y-1" },
                                    React.createElement("label", { className: "text-xs font-medium" }, "Level"),
                                    React.createElement(module_1.Select, { value: levelFilter, onValueChange: function (value) { return setLevelFilter(value); } },
                                        React.createElement(module_1.SelectTrigger, { className: "w-32" },
                                            React.createElement(module_1.SelectValue, null)),
                                        React.createElement(module_1.SelectContent, null,
                                            React.createElement(module_1.SelectItem, { value: "all" }, "All Levels"),
                                            React.createElement(module_1.SelectItem, { value: "debug" }, "Debug"),
                                            React.createElement(module_1.SelectItem, { value: "info" }, "Info"),
                                            React.createElement(module_1.SelectItem, { value: "warn" }, "Warning"),
                                            React.createElement(module_1.SelectItem, { value: "error" }, "Error")))),
                                React.createElement("div", { className: "space-y-1" },
                                    React.createElement("label", { className: "text-xs font-medium" }, "Component"),
                                    React.createElement(module_1.Select, { value: componentFilter, onValueChange: setComponentFilter },
                                        React.createElement(module_1.SelectTrigger, { className: "w-36" },
                                            React.createElement(module_1.SelectValue, { placeholder: "All Components" })),
                                        React.createElement(module_1.SelectContent, null,
                                            React.createElement(module_1.SelectItem, { value: "" }, "All Components"),
                                            getUniqueComponents().map(function (component) { return (React.createElement(module_1.SelectItem, { key: component, value: component }, component)); })))),
                                React.createElement("div", { className: "space-y-1 flex-1" },
                                    React.createElement("label", { className: "text-xs font-medium" }, "Search"),
                                    React.createElement(input_1.Input, { placeholder: "Search logs...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); } })),
                                React.createElement(button_1.Button, { onClick: refreshLogs },
                                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                                    "Refresh"),
                                React.createElement(button_1.Button, { variant: "outline", onClick: generateTestLogs }, "Generate Test Logs")),
                            React.createElement("div", { className: "border rounded-md h-80" },
                                React.createElement(scroll_area_1.ScrollArea, { className: "h-80 w-full" }, logs.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center h-80 text-gray-400" },
                                    React.createElement(lucide_react_1.FileText, { className: "h-12 w-12 mb-2 opacity-50" }),
                                    React.createElement("p", null, "No logs found"))) : (React.createElement("div", { className: "p-4 space-y-2" }, logs.map(function (log, index) { return (React.createElement("div", { key: index, className: "p-3 bg-gray-50 dark:bg-gray-800 rounded-md" },
                                    React.createElement("div", { className: "flex items-start justify-between" },
                                        React.createElement("div", { className: "flex items-center space-x-2" },
                                            React.createElement(badge_1.Badge, { className: getLevelColor(log.level) }, log.level.toUpperCase()),
                                            log.component && (React.createElement(badge_1.Badge, { variant: "outline" }, log.component))),
                                        React.createElement("span", { className: "text-xs text-gray-500" }, new Date(log.timestamp).toLocaleString())),
                                    React.createElement("p", { className: "mt-2 text-sm" }, log.message),
                                    log.data && (React.createElement("details", { className: "mt-1" },
                                        React.createElement("summary", { className: "text-xs text-gray-500 cursor-pointer" }, "Data"),
                                        React.createElement("pre", { className: "mt-1 text-xs p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto" }, JSON.stringify(log.data, null, 2)))))); }))))))),
                    React.createElement(tabs_1.TabsContent, { value: "status", className: "p-4" },
                        " ",
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                                            React.createElement(lucide_react_1.Database, { className: "h-4 w-4 mr-2" }),
                                            "Database Status")),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("div", { className: "flex items-center space-x-2" },
                                            React.createElement("div", { className: "w-3 h-3 rounded-full " + (dbStatus === "connected" ? "bg-green-500" :
                                                    dbStatus === "disconnected" ? "bg-amber-500" : "bg-red-500") }),
                                            React.createElement("span", { className: "font-medium" }, dbStatus === "connected" ? "Connected" :
                                                dbStatus === "disconnected" ? "Disconnected" : "Error")),
                                        React.createElement("p", { className: "text-sm text-gray-500 mt-2" }, statusMessage)),
                                    React.createElement(card_1.CardFooter, null,
                                        React.createElement(button_1.Button, { size: "sm", onClick: checkDatabaseStatus },
                                            React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                                            "Check Again"))),
                                React.createElement(card_1.Card, null,
                                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                                            React.createElement(lucide_react_1.Info, { className: "h-4 w-4 mr-2" }),
                                            "System Info")),
                                    React.createElement(card_1.CardContent, null,
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("div", { className: "flex justify-between" },
                                                React.createElement("span", { className: "text-sm text-gray-500" }, "Version:"),
                                                React.createElement("span", { className: "text-sm font-medium" }, "v2.0.0")),
                                            React.createElement("div", { className: "flex justify-between" },
                                                React.createElement("span", { className: "text-sm text-gray-500" }, "Environment:"),
                                                React.createElement("span", { className: "text-sm font-medium" }, process.env.NODE_ENV || 'development')),
                                            React.createElement("div", { className: "flex justify-between" },
                                                React.createElement("span", { className: "text-sm text-gray-500" }, "Log entries:"),
                                                React.createElement("span", { className: "text-sm font-medium" }, logger_1.logger.getLogs().length)),
                                            React.createElement("div", { className: "flex justify-between" },
                                                React.createElement("span", { className: "text-sm text-gray-500" }, "Client:"),
                                                React.createElement("span", { className: "text-sm font-medium" }, typeof window !== 'undefined' ? 'Browser' : 'Server')))),
                                    React.createElement(card_1.CardFooter, null,
                                        React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                                logger_1.logger.clearLogs();
                                                refreshLogs();
                                            } },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                                            "Clear Logs")))),
                            React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardHeader, { className: "pb-2" },
                                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                                        React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 mr-2" }),
                                        "Run Diagnostics")),
                                React.createElement(card_1.CardContent, null,
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(button_1.Button, { className: "w-full", onClick: function () {
                                                logger_1.logger.info("Running full system diagnostics", null, { component: "Diagnostics" });
                                                checkDatabaseStatus();
                                                generateTestLogs();
                                                setTerminalOutput(function (prev) { return __spreadArrays(prev, ["$ Running system diagnostics...", "Checking components...", "All systems operational"]); });
                                            } }, "Run Full Diagnostics"),
                                        React.createElement(textarea_1.Textarea, { placeholder: "Add diagnostic notes here...", className: "h-20" }))))))))),
        React.createElement("div", { className: "text-center text-xs text-gray-500" },
            React.createElement("p", null,
                "AKs Studio Terminal & Logs Utility \u00A9 ",
                new Date().getFullYear()))));
}
exports.TestTerminalLogs = TestTerminalLogs;
