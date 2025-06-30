"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.TerminalErrorViewer = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var scroll_area_1 = require("@/components/ui/scroll-area");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var logger_1 = require("@/lib/logger");
function TerminalErrorViewer() {
    var _this = this;
    var _a = react_1.useState([]), terminalErrors = _a[0], setTerminalErrors = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(""), filter = _c[0], setFilter = _c[1];
    var _d = react_1.useState({}), expandedErrors = _d[0], setExpandedErrors = _d[1];
    react_1.useEffect(function () {
        loadTerminalErrors();
    }, []);
    var loadTerminalErrors = function () { return __awaiter(_this, void 0, void 0, function () {
        var nextJsErrors, apiErrors, consoleErrors, allErrors, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    nextJsErrors = getNextJsErrorsFromStorage();
                    return [4 /*yield*/, checkApiEndpoints()
                        // Get console errors
                    ];
                case 2:
                    apiErrors = _a.sent();
                    consoleErrors = getConsoleErrorsFromStorage();
                    allErrors = __spreadArrays(nextJsErrors.map(function (err) { return (__assign(__assign({}, err), { source: 'nextjs' })); }), apiErrors.map(function (err) { return (__assign(__assign({}, err), { source: 'api' })); }), consoleErrors.map(function (err) { return (__assign(__assign({}, err), { source: 'console' })); }));
                    // Sort by timestamp (newest first)
                    allErrors.sort(function (a, b) {
                        return new Date(b.timestamp || Date.now()).getTime() -
                            new Date(a.timestamp || Date.now()).getTime();
                    });
                    setTerminalErrors(allErrors);
                    logger_1.logger.info("Terminal errors loaded", { count: allErrors.length }, { component: "TerminalErrorViewer" });
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    logger_1.logger.error("Failed to load terminal errors", error_1, { component: "TerminalErrorViewer" });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getNextJsErrorsFromStorage = function () {
        try {
            var errorsJson = localStorage.getItem("aks_errors");
            return errorsJson ? JSON.parse(errorsJson) : [];
        }
        catch (error) {
            logger_1.logger.error("Failed to parse Next.js errors", error, { component: "TerminalErrorViewer" });
            return [];
        }
    };
    var getConsoleErrorsFromStorage = function () {
        try {
            var errorsJson = localStorage.getItem("aks_console_errors");
            return errorsJson ? JSON.parse(errorsJson) : [];
        }
        catch (error) {
            logger_1.logger.error("Failed to parse console errors", error, { component: "TerminalErrorViewer" });
            return [];
        }
    };
    var checkApiEndpoints = function () { return __awaiter(_this, void 0, void 0, function () {
        var apiErrors, dbResponse, dbData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiErrors = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/database-status")];
                case 2:
                    dbResponse = _a.sent();
                    return [4 /*yield*/, dbResponse.json()];
                case 3:
                    dbData = _a.sent();
                    if (!dbData.success) {
                        apiErrors.push({
                            message: "Database connection error",
                            details: dbData.message || "Unknown database error",
                            timestamp: new Date().toISOString(),
                            endpoint: "/api/database-status"
                        });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    apiErrors.push({
                        message: "Database API error",
                        details: error_2 instanceof Error ? error_2.message : String(error_2),
                        timestamp: new Date().toISOString(),
                        endpoint: "/api/database-status"
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, apiErrors];
            }
        });
    }); };
    var clearErrors = function () {
        if (confirm("Are you sure you want to clear all error logs?")) {
            localStorage.removeItem("aks_errors");
            localStorage.removeItem("aks_console_errors");
            setTerminalErrors([]);
            logger_1.logger.info("Terminal errors cleared", null, { component: "TerminalErrorViewer" });
        }
    };
    var toggleExpandError = function (index) {
        setExpandedErrors(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[index] = !prev[index], _a)));
        });
    };
    var filteredErrors = terminalErrors.filter(function (error) {
        if (!filter)
            return true;
        var searchText = filter.toLowerCase();
        return ((error.message && error.message.toLowerCase().includes(searchText)) ||
            (error.details && error.details.toLowerCase().includes(searchText)) ||
            (error.endpoint && error.endpoint.toLowerCase().includes(searchText)) ||
            (error.source && error.source.toLowerCase().includes(searchText)));
    });
    var getBadgeColor = function (source) {
        switch (source) {
            case 'nextjs': return 'bg-red-500';
            case 'api': return 'bg-amber-500';
            case 'console': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };
    return (react_1["default"].createElement(card_1.Card, { className: "shadow-lg" },
        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between pb-2" },
            react_1["default"].createElement(card_1.CardTitle, { className: "text-xl font-bold" }, "Terminal & Logs Error Viewer"),
            react_1["default"].createElement("div", { className: "flex gap-2" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: loadTerminalErrors, disabled: loading },
                    react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-1 " + (loading ? 'animate-spin' : '') }),
                    "Refresh"),
                react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: clearErrors },
                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-1" }),
                    "Clear"))),
        react_1["default"].createElement(card_1.CardContent, null,
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" }),
                    react_1["default"].createElement(input_1.Input, { type: "text", placeholder: "Filter errors...", className: "pl-8", value: filter, onChange: function (e) { return setFilter(e.target.value); } }),
                    filter && (react_1["default"].createElement("button", { onClick: function () { return setFilter(""); }, className: "absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700" },
                        react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-4 w-4" }))))),
            loading ? (react_1["default"].createElement("div", { className: "flex justify-center items-center py-8" },
                react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "h-8 w-8 animate-spin text-gray-400" }),
                react_1["default"].createElement("span", { className: "ml-2 text-gray-500" }, "Loading errors..."))) : filteredErrors.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, filter ? "No errors match your filter" : "No errors found in the terminal")) : (react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-96" },
                react_1["default"].createElement("div", { className: "space-y-3" }, filteredErrors.map(function (error, index) {
                    var _a;
                    return (react_1["default"].createElement("div", { key: index, className: "p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700" },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement(badge_1.Badge, { className: getBadgeColor(error.source) }, ((_a = error.source) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "ERROR"),
                                error.endpoint && (react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, error.endpoint))),
                            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                react_1["default"].createElement("span", { className: "text-xs text-gray-500 flex items-center" },
                                    react_1["default"].createElement(lucide_react_1.AlarmClock, { className: "h-3 w-3 mr-1" }),
                                    error.timestamp ? new Date(error.timestamp).toLocaleString() : "Unknown time"),
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return toggleExpandError(index); } }, expandedErrors[index] ? "Collapse" : "Expand"))),
                        react_1["default"].createElement("p", { className: "mt-2 text-sm font-medium" }, error.message || "Unknown error"),
                        expandedErrors[index] && (react_1["default"].createElement("div", { className: "mt-2" },
                            error.details && (react_1["default"].createElement("div", { className: "mt-2" },
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Details:"),
                                react_1["default"].createElement("pre", { className: "mt-1 text-xs whitespace-pre-wrap p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto" }, typeof error.details === 'object'
                                    ? JSON.stringify(error.details, null, 2)
                                    : error.details))),
                            error.stack && (react_1["default"].createElement("div", { className: "mt-2" },
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Stack trace:"),
                                react_1["default"].createElement("pre", { className: "mt-1 text-xs whitespace-pre-wrap p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto" }, error.stack))),
                            error.digest && (react_1["default"].createElement("div", { className: "mt-2" },
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" },
                                    "Error digest: ",
                                    error.digest)))))));
                })))),
            react_1["default"].createElement("div", { className: "flex justify-between items-center mt-4 text-xs text-gray-500" },
                react_1["default"].createElement("div", null,
                    "Total errors: ",
                    filteredErrors.length),
                react_1["default"].createElement("div", null,
                    "Last refreshed: ",
                    new Date().toLocaleTimeString())))));
}
exports.TerminalErrorViewer = TerminalErrorViewer;
