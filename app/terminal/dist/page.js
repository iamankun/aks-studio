"use client";
"use strict";
exports.__esModule = true;
var terminal_error_viewer_1 = require("@/components/terminal-error-viewer");
var test_terminal_logs_1 = require("@/components/test-terminal-logs");
var tabs_1 = require("@/components/ui/tabs");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var logger_1 = require("@/lib/logger");
var react_1 = require("react");
var migration_utils_1 = require("@/lib/migration-utils");
function TerminalPage() {
    react_1.useEffect(function () {
        // Log page view
        logger_1.logger.info("Terminal page visited", null, { component: "TerminalPage" });
        // Check for Supabase dependencies and show migration tips
        var dependencies = migration_utils_1.fixSupabaseDependency();
    }, []);
    return (React.createElement("div", { className: "container py-8 space-y-8" },
        React.createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Terminal & Error Logs"),
        React.createElement("p", { className: "text-muted-foreground" }, "View and debug application errors, check terminal logs, and monitor system status"),
        React.createElement(card_1.Card, { className: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800" },
            React.createElement(card_1.CardHeader, { className: "pb-2" },
                React.createElement(card_1.CardTitle, { className: "flex items-center text-amber-700 dark:text-amber-300" },
                    React.createElement(lucide_react_1.Info, { className: "h-5 w-5 mr-2" }),
                    "Supabase Migration Notice"),
                React.createElement(card_1.CardDescription, { className: "text-amber-600 dark:text-amber-400" }, "We're migrating from Supabase to Neon + WordPress databases")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "text-sm text-amber-800 dark:text-amber-200" },
                    React.createElement("p", { className: "mb-2" }, "Ph\u00E1t hi\u1EC7n th\u1EA5y v\u1EABn c\u00F2n c\u00E1c API endpoint s\u1EED d\u1EE5ng Supabase. Ki\u1EC3m tra c\u00E1c file sau:"),
                    React.createElement("ul", { className: "list-disc pl-5 space-y-1" },
                        React.createElement("li", null,
                            React.createElement("code", { className: "bg-amber-100 dark:bg-amber-900 px-1 rounded" }, "app/api/auth/forgot-password/route.ts"),
                            " - \u0110ang s\u1EED d\u1EE5ng Supabase Client"),
                        React.createElement("li", null,
                            "C\u00E1c file kh\u00E1c c\u00F3 th\u1EC3 v\u1EABn \u0111ang import t\u1EEB ",
                            React.createElement("code", { className: "bg-amber-100 dark:bg-amber-900 px-1 rounded" }, "@supabase/supabase-js"))),
                    React.createElement("p", { className: "mt-2" },
                        "C\u1EA7n c\u1EADp nh\u1EADt c\u00E1c endpoints n\u00E0y \u0111\u1EC3 s\u1EED d\u1EE5ng ",
                        React.createElement("code", { className: "bg-amber-100 dark:bg-amber-900 px-1 rounded" }, "MultiDatabaseService"),
                        " thay v\u00EC Supabase.")))),
        React.createElement(tabs_1.Tabs, { defaultValue: "errors" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2" },
                React.createElement(tabs_1.TabsTrigger, { value: "errors", className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Bug, { className: "h-4 w-4" }),
                    React.createElement("span", null, "Error Logs")),
                React.createElement(tabs_1.TabsTrigger, { value: "terminal", className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Terminal, { className: "h-4 w-4" }),
                    React.createElement("span", null, "Terminal & Debug"))),
            React.createElement(tabs_1.TabsContent, { value: "errors", className: "mt-4" },
                React.createElement(terminal_error_viewer_1.TerminalErrorViewer, null)),
            React.createElement(tabs_1.TabsContent, { value: "terminal", className: "mt-4" },
                React.createElement(test_terminal_logs_1.TestTerminalLogs, null)))));
}
exports["default"] = TerminalPage;
