"use client";
"use strict";
exports.__esModule = true;
var dynamic_background_1 = require("@/components/dynamic-background");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var logger_1 = require("@/lib/logger");
function ErrorPage(_a) {
    var error = _a.error, reset = _a.reset;
    react_1.useEffect(function () {
        // Log error details using logger service
        logger_1.logger.error("Application Error", error, {
            component: "ErrorPage",
            digest: error.digest
        });
        // Store error in localStorage for debugging
        if (typeof window !== "undefined") {
            var errorLog = {
                message: error.message,
                stack: error.stack,
                digest: error.digest,
                timestamp: new Date().toISOString()
            };
            try {
                var existingErrors = JSON.parse(localStorage.getItem("aks_errors") || "[]");
                existingErrors.unshift(errorLog);
                if (existingErrors.length > 10)
                    existingErrors.splice(10);
                localStorage.setItem("aks_errors", JSON.stringify(existingErrors));
            }
            catch (e) {
                logger_1.logger.error("Failed to store error log", e, { component: "ErrorPage" });
            }
        }
    }, [error]);
    return (React.createElement("div", { className: "min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950" },
        React.createElement(dynamic_background_1.DynamicBackground, null),
        React.createElement("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm" }),
        React.createElement("div", { className: "relative z-10 text-center text-white max-w-md mx-auto p-6" },
            React.createElement("div", { className: "flex justify-center mb-6" },
                React.createElement("div", { className: "relative" },
                    React.createElement(lucide_react_1.AlertTriangle, { className: "h-20 w-20 text-red-500 animate-pulse" }),
                    React.createElement("div", { className: "absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full" }, "505"))),
            React.createElement("h1", { className: "text-4xl font-bold text-red-400 mb-4" }, "Server Error"),
            React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "Oops! Something went wrong"),
            React.createElement("div", { className: "bg-gray-800/80 backdrop-blur-md rounded-lg p-4 mb-6 text-left" },
                React.createElement("p", { className: "text-sm text-gray-300 mb-2" }, "Error Details:"),
                React.createElement("p", { className: "text-xs text-red-300 font-mono break-words" }, error.message || "Unknown error occurred"),
                error.digest && (React.createElement("p", { className: "text-xs text-gray-400 mt-2" },
                    "Digest: ",
                    error.digest))),
            React.createElement("div", { className: "space-y-3" },
                React.createElement(button_1.Button, { onClick: reset, className: "w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors" },
                    React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-5 w-5" }),
                    "Try Again"),
                React.createElement(button_1.Button, { onClick: function () { return (window.location.href = "/"); }, variant: "outline", className: "w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3 rounded-lg transition-colors" },
                    React.createElement(lucide_react_1.Home, { className: "mr-2 h-5 w-5" }),
                    "Go to Homepage"),
                React.createElement(button_1.Button, { onClick: function () { return (window.location.href = "/log-console"); }, variant: "link", className: "w-full text-gray-400 hover:text-gray-300 py-2" },
                    React.createElement(lucide_react_1.List, { className: "mr-2 h-4 w-4" }),
                    "View System Logs")),
            React.createElement("div", { className: "mt-6 text-xs text-gray-500" },
                React.createElement("p", null, "If this problem persists, please contact support."),
                React.createElement("p", { className: "mt-1" },
                    "AKs Studio v2.0.0 \u2013 ",
                    new Date().toLocaleDateString())))));
}
exports["default"] = ErrorPage;
