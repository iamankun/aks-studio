"use strict";
exports.__esModule = true;
exports.metadata = void 0;
var react_1 = require("react");
var google_1 = require("next/font/google");
var auth_provider_1 = require("@/components/auth-provider");
require("./globals.css");
var inter = google_1.Inter({ subsets: ["latin"] });
exports.metadata = {
    title: "AKs Studio - Digital Music Distribution",
    description: "Professional music distribution platform for independent artists and labels"
};
function RootLayout(_a) {
    var children = _a.children;
    return (react_1["default"].createElement("html", { lang: "vi", suppressHydrationWarning: true },
        react_1["default"].createElement("head", null,
            react_1["default"].createElement("link", { rel: "icon", href: "/face.png" })),
        react_1["default"].createElement("body", { className: inter.className, suppressHydrationWarning: true },
            react_1["default"].createElement(auth_provider_1.AuthProvider, null, children))));
}
exports["default"] = RootLayout;
