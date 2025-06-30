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
exports.__esModule = true;
exports.ResetPasswordView = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var image_1 = require("next/image");
function ResetPasswordView(_a) {
    var _this = this;
    var onResetPassword = _a.onResetPassword, onBackToLogin = _a.onBackToLogin;
    var _b = react_1.useState(""), email = _b[0], setEmail = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(""), error = _d[0], setError = _d[1];
    var _e = react_1.useState(""), success = _e[0], setSuccess = _e[1];
    var _f = react_1.useState(false), isReloading = _f[0], setIsReloading = _f[1];
    var _g = react_1.useState("Khôi phục"), currentRecovery = _g[0], setCurrentRecovery = _g[1];
    var _h = react_1.useState(0), recoveryIndex = _h[0], setRecoveryIndex = _h[1];
    var _j = react_1.useState(""), binaryText = _j[0], setBinaryText = _j[1];
    var _k = react_1.useState({
        appName: "AKs Studio",
        logoUrl: "/face.png"
    }), appSettings = _k[0], setAppSettings = _k[1];
    // Recovery messages in different languages
    var recoveryMessages = [
        "Khôi phục", "Récupération", "Recovery", "復元", "Recuperación",
        "Wiederherstellung", "Recupero", "पुनर्प्राप्ति", "Восстановление", "복구"
    ];
    // Binary encoding
    var textToBinary = function (text) {
        return text.split('').map(function (char) {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join(' ');
    };
    // Load app settings
    react_1.useEffect(function () {
        var savedApp = localStorage.getItem("appSettings_v2");
        if (savedApp) {
            try {
                var parsed = JSON.parse(savedApp);
                setAppSettings(parsed);
            }
            catch (err) {
                console.error("Failed to load app settings:", err);
            }
        }
    }, []);
    // Cycle through recovery messages
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            setRecoveryIndex(function (prev) { return (prev + 1) % recoveryMessages.length; });
        }, 3000);
        return function () { return clearInterval(interval); };
    }, [recoveryMessages.length]);
    // Update recovery message with fade effect
    react_1.useEffect(function () {
        var recoveryEl = document.querySelector('.recovery-text');
        if (recoveryEl) {
            recoveryEl.classList.add('opacity-0');
            setTimeout(function () {
                setCurrentRecovery(recoveryMessages[recoveryIndex]);
                recoveryEl.classList.remove('opacity-0');
            }, 200);
        }
        else {
            setCurrentRecovery(recoveryMessages[recoveryIndex]);
        }
    }, [recoveryIndex, recoveryMessages]);
    // Binary text animation for email
    react_1.useEffect(function () {
        if (email) {
            var binary = textToBinary(email);
            setBinaryText(binary);
        }
        else {
            setBinaryText("");
        }
    }, [email]);
    // Email change detection with light sweep
    var handleEmailChange = function (e) {
        var value = e.target.value;
        setEmail(value);
        if (value.length > 0) {
            var reloadBtn_1 = document.querySelector('.reload-button');
            reloadBtn_1 === null || reloadBtn_1 === void 0 ? void 0 : reloadBtn_1.classList.add('light-sweep');
            setTimeout(function () {
                reloadBtn_1 === null || reloadBtn_1 === void 0 ? void 0 : reloadBtn_1.classList.remove('light-sweep');
            }, 500);
        }
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    setError("");
                    setSuccess("");
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onResetPassword(email)];
                case 2:
                    result = _c.sent();
                    if (result.success) {
                        setSuccess((_a = result.message) !== null && _a !== void 0 ? _a : "Email khôi phục đã được gửi!");
                    }
                    else {
                        setError((_b = result.message) !== null && _b !== void 0 ? _b : "Gửi email khôi phục thất bại");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _c.sent();
                    console.error("Reset password error:", err_1);
                    setError("Đã xảy ra lỗi không mong muốn");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleReload = function () {
        setIsReloading(true);
        var btn = document.querySelector('.reload-button');
        btn === null || btn === void 0 ? void 0 : btn.classList.add('light-sweep-active');
        setTimeout(function () {
            btn === null || btn === void 0 ? void 0 : btn.classList.remove('light-sweep-active');
            window.location.reload();
        }, 800);
    };
    return (React.createElement("div", { className: "min-h-screen flex relative overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-green-50/80 via-teal-100/70 to-cyan-100/80 backdrop-blur-sm" }),
        React.createElement("div", { className: "relative z-10 flex-1 flex items-center justify-center p-8" },
            React.createElement("div", { className: "w-full max-w-md" },
                React.createElement("div", { className: "flex justify-end mb-4" },
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleReload, disabled: isReloading, className: "reload-button bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90 transition-all duration-300 " + (isReloading ? 'reload-pulsing' : '') },
                        React.createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4 mr-2" }),
                        isReloading ? 'Đang tải...' : 'Reload')),
                React.createElement(card_1.Card, { className: "glass-card" },
                    React.createElement(card_1.CardHeader, { className: "text-center" },
                        React.createElement("div", { className: "flex justify-center mb-4" },
                            React.createElement("div", { className: "relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white/50" },
                                React.createElement(image_1["default"], { src: appSettings.logoUrl, alt: appSettings.appName + " Logo", fill: true, className: "object-cover", onError: function (e) {
                                        e.currentTarget.src = "/face.png";
                                    } }))),
                        React.createElement("div", { className: "mb-4" },
                            React.createElement("p", { className: "text-lg text-gray-600 greeting-fade" },
                                React.createElement("span", { className: "recovery-text transition-all duration-300" }, currentRecovery)),
                            React.createElement("p", { className: "text-sm text-green-600 font-medium user-role-fade animate-pulse" }, "\uD83D\uDD10 M\u1EADt kh\u1EA9u c\u1EE7a b\u1EA1n")),
                        React.createElement(card_1.CardTitle, { className: "text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent" }, "\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u"),
                        React.createElement(card_1.CardDescription, { className: "text-lg text-gray-600" }, "Nh\u1EADp email \u0111\u1EC3 nh\u1EADn li\u00EAn k\u1EBFt \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "email" }, "\u0110\u1ECBa ch\u1EC9 email"),
                                React.createElement(input_1.Input, { id: "email", type: "email", value: email, onChange: handleEmailChange, placeholder: "your.email@example.com", required: true, className: "transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" }),
                                binaryText && (React.createElement("div", { className: "text-xs text-gray-500 font-mono p-2 bg-gray-50 rounded border overflow-hidden" },
                                    React.createElement("div", { className: "binary-animation" }, binaryText)))),
                            error && React.createElement("div", { className: "text-red-500 text-sm text-center" }, error),
                            success && React.createElement("div", { className: "text-green-500 text-sm text-center" }, success),
                            React.createElement(button_1.Button, { type: "submit", className: "w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 genZ-shimmer transition-all duration-300 hover:scale-105 active:scale-95", disabled: loading }, loading ? (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Mail, { className: "mr-2 h-4 w-4 animate-spin" }),
                                "\u0110ang g\u1EEDi email...")) : (React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Mail, { className: "mr-2 h-4 w-4" }),
                                "G\u1EEDi email kh\u00F4i ph\u1EE5c")))),
                        React.createElement("div", { className: "mt-4 text-center" },
                            React.createElement(button_1.Button, { variant: "link", onClick: onBackToLogin, className: "text-sm transition-all duration-300 hover:scale-105" },
                                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-1" }),
                                "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp")),
                        React.createElement("div", { className: "mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg text-sm text-center border border-green-200/50" },
                            React.createElement("strong", { className: "text-green-700" }, "L\u01B0u \u00FD:"),
                            React.createElement("br", null),
                            React.createElement("span", { className: "text-green-600" }, "Ki\u1EC3m tra c\u1EA3 h\u1ED9p th\u01B0 spam/junk mail"),
                            React.createElement("br", null),
                            React.createElement("span", { className: "text-green-600" }, "Link kh\u00F4i ph\u1EE5c c\u00F3 hi\u1EC7u l\u1EF1c trong 24h")))))),
        React.createElement("div", { className: "relative z-10 flex-1 flex items-center justify-center p-8" },
            React.createElement("div", { className: "w-full max-w-md text-center" },
                React.createElement(card_1.Card, { className: "glass-card" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex justify-center mb-4" },
                            React.createElement("div", { className: "w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center shadow-xl" },
                                React.createElement(lucide_react_1.Mail, { className: "text-white text-3xl" }))),
                        React.createElement(card_1.CardTitle, { className: "text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent" }, "B\u1EA3o m\u1EADt t\u00E0i kho\u1EA3n"),
                        React.createElement(card_1.CardDescription, { className: "text-lg text-gray-600 mt-4" }, "Ch\u00FAng t\u00F4i s\u1EBD g\u1EEDi link \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u an to\u00E0n \u0111\u1EBFn email c\u1EE7a b\u1EA1n")),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "flex items-center space-x-3 p-3 bg-green-50 rounded-lg" },
                                React.createElement("div", { className: "w-2 h-2 bg-green-500 rounded-full" }),
                                React.createElement("span", { className: "text-sm text-gray-700" }, "B\u1EA3o m\u1EADt cao v\u1EDBi m\u00E3 h\u00F3a")),
                            React.createElement("div", { className: "flex items-center space-x-3 p-3 bg-teal-50 rounded-lg" },
                                React.createElement("div", { className: "w-2 h-2 bg-teal-500 rounded-full" }),
                                React.createElement("span", { className: "text-sm text-gray-700" }, "Link c\u00F3 th\u1EDDi h\u1EA1n gi\u1EDBi h\u1EA1n")),
                            React.createElement("div", { className: "flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg" },
                                React.createElement("div", { className: "w-2 h-2 bg-cyan-500 rounded-full" }),
                                React.createElement("span", { className: "text-sm text-gray-700" }, "X\u00E1c th\u1EF1c qua email"))),
                        React.createElement("div", { className: "pt-4 border-t border-gray-200" },
                            React.createElement("p", { className: "text-xs text-gray-500" },
                                "\u00A9 2025 ",
                                appSettings.appName,
                                ". H\u1EC7 th\u1ED1ng b\u1EA3o m\u1EADt \u0111a l\u1EDBp.")))))),
        React.createElement("div", { className: "absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-xl floating" }),
        React.createElement("div", { className: "absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-xl floating" }),
        React.createElement("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-green-400/10 rounded-full blur-2xl floating" }),
        React.createElement("div", { className: "absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-lg blur-lg floating rotate-45" }),
        React.createElement("div", { className: "absolute bottom-10 left-1/3 w-20 h-20 bg-gradient-to-br from-teal-400/30 to-green-400/30 rounded-full blur-lg floating" }),
        React.createElement("div", { className: "absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-br from-cyan-400/40 to-teal-400/40 rounded-full blur-md floating" })));
}
exports.ResetPasswordView = ResetPasswordView;
