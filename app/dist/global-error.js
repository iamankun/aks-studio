"use client";
"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var image_1 = require("next/image");
function GlobalError(_a) {
    var error = _a.error, reset = _a.reset;
    return (React.createElement("html", { lang: "vi" },
        React.createElement("body", { className: "bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950 text-white min-h-screen flex items-center justify-center relative" },
            React.createElement("div", { className: "absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center" },
                React.createElement(image_1["default"], { src: "/face.png", alt: "AKs Studio", width: 56, height: 56, className: "rounded-full border-2 border-purple-500 shadow-lg" }),
                React.createElement("span", { className: "mt-2 text-lg font-bold tracking-wide text-purple-300" }, "AKs Studio")),
            React.createElement("div", { className: "text-center max-w-md mx-auto p-6 bg-black/60 rounded-xl shadow-2xl border border-gray-800 backdrop-blur-md" },
                React.createElement(lucide_react_1.AlertTriangle, { className: "h-20 w-20 text-red-500 mx-auto mb-6 animate-bounce" }),
                React.createElement("h1", { className: "text-4xl font-bold text-red-400 mb-4" }, "\u0110\u00E3 x\u1EA3y ra l\u1ED7i nghi\u00EAm tr\u1ECDng"),
                React.createElement("p", { className: "text-gray-300 mb-6" }, "M\u1ED9t l\u1ED7i kh\u00F4ng th\u1EC3 ph\u1EE5c h\u1ED3i \u0111\u00E3 x\u1EA3y ra. Vui l\u00F2ng th\u1EED l\u1EA1i ho\u1EB7c quay v\u1EC1 trang ch\u1EE7."),
                error.digest && (React.createElement("div", { className: "bg-gray-800/50 rounded p-3 mb-4" },
                    React.createElement("p", { className: "text-xs text-gray-400" },
                        "M\u00E3 l\u1ED7i: ",
                        error.digest))),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement(button_1.Button, { onClick: reset, className: "w-full bg-red-600 hover:bg-red-700" },
                        React.createElement(lucide_react_1.RefreshCw, { className: "mr-2 h-5 w-5" }),
                        "Th\u1EED l\u1EA1i"),
                    React.createElement(button_1.Button, { onClick: function () { return window.location.href = "/"; }, variant: "outline", className: "w-full" },
                        React.createElement(lucide_react_1.Home, { className: "mr-2 h-5 w-5" }),
                        "V\u1EC1 trang ch\u1EE7")),
                React.createElement("div", { className: "mt-6 text-xs text-gray-500" },
                    React.createElement("p", null,
                        "AKs Studio \u00A9 ",
                        new Date().getFullYear(),
                        " \u2013 Digital Music Distribution"),
                    React.createElement("p", { className: "mt-1" }, "Phi\u00EAn b\u1EA3n: v2.0.0"))))));
}
exports["default"] = GlobalError;
