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
exports.__esModule = true;
exports.RegistrationView = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var dynamic_background_1 = require("@/components/dynamic-background");
function RegistrationView(_a) {
    var _this = this;
    var onSwitchToLogin = _a.onSwitchToLogin;
    var _b = react_1.useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(false), showPassword = _c[0], setShowPassword = _c[1];
    var _d = react_1.useState(false), showConfirmPassword = _d[0], setShowConfirmPassword = _d[1];
    var _e = react_1.useState(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = react_1.useState(""), error = _f[0], setError = _f[1];
    var _g = react_1.useState(false), success = _g[0], setSuccess = _g[1];
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var validateForm = function () {
        if (!formData.username || !formData.email || !formData.password) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return false;
        }
        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Email không hợp lệ");
            return false;
        }
        return true;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    if (!validateForm())
                        return [2 /*return*/];
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    console.log("🔍 Registration attempt:", {
                        username: formData.username,
                        email: formData.email,
                        full_name: formData.fullName
                    });
                    return [4 /*yield*/, fetch("/api/auth/register", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                username: formData.username,
                                email: formData.email,
                                password: formData.password,
                                full_name: formData.fullName || formData.username
                            })
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    console.log("🔍 Registration response:", data);
                    if (data.success) {
                        setSuccess(true);
                        setTimeout(function () {
                            onSwitchToLogin();
                        }, 2000);
                    }
                    else {
                        setError((_a = data.message) !== null && _a !== void 0 ? _a : "Đã xảy ra lỗi khi đăng ký");
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _b.sent();
                    console.error("🚨 Registration error:", error_1);
                    setError("Đã xảy ra lỗi kết nối");
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (success) {
        return (React.createElement("div", { className: "min-h-screen relative flex items-center justify-center overflow-hidden" },
            React.createElement(dynamic_background_1.DynamicBackground, null),
            React.createElement("div", { className: "absolute inset-0 bg-black/30" }),
            React.createElement(card_1.Card, { className: "w-full max-w-md mx-4 relative z-10 bg-white/95 backdrop-blur-sm" },
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center space-y-4" },
                        React.createElement(lucide_react_1.CheckCircle, { className: "h-16 w-16 text-green-500 mx-auto" }),
                        React.createElement("h2", { className: "text-2xl font-bold text-green-600" }, "\u0110\u0103ng k\u00FD th\u00E0nh c\u00F4ng!"),
                        React.createElement("p", { className: "text-gray-600" }, "T\u00E0i kho\u1EA3n c\u1EE7a b\u1EA1n \u0111\u00E3 \u0111\u01B0\u1EE3c t\u1EA1o th\u00E0nh c\u00F4ng. \u0110ang chuy\u1EC3n h\u01B0\u1EDBng \u0111\u1EBFn trang \u0111\u0103ng nh\u1EADp..."))))));
    }
    return (React.createElement("div", { className: "min-h-screen relative flex items-center justify-center overflow-hidden" },
        React.createElement(dynamic_background_1.DynamicBackground, null),
        React.createElement("div", { className: "absolute inset-0 bg-black/30" }),
        React.createElement(card_1.Card, { className: "w-full max-w-md mx-4 relative z-10 bg-white/95 backdrop-blur-sm" },
            React.createElement(card_1.CardHeader, { className: "space-y-1" },
                React.createElement("div", { className: "flex justify-center mb-4" },
                    React.createElement("img", { src: "/Logo An Kun Studio Black Text.png", alt: "An Kun Studio", className: "h-12" })),
                React.createElement(card_1.CardTitle, { className: "text-2xl font-bold text-center" }, "\u0110\u0103ng k\u00FD"),
                React.createElement(card_1.CardDescription, { className: "text-center" }, "T\u1EA1o t\u00E0i kho\u1EA3n m\u1EDBi \u0111\u1EC3 s\u1EED d\u1EE5ng h\u1EC7 th\u1ED1ng")),
            React.createElement("form", { onSubmit: handleSubmit },
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    error && (React.createElement(alert_1.Alert, { variant: "destructive" },
                        React.createElement(alert_1.AlertDescription, null, error))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "username" }, "T\u00EAn \u0111\u0103ng nh\u1EADp *"),
                        React.createElement(input_1.Input, { id: "username", name: "username", type: "text", placeholder: "Nh\u1EADp t\u00EAn \u0111\u0103ng nh\u1EADp", value: formData.username, onChange: handleInputChange, required: true, disabled: isLoading })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "email" }, "Email *"),
                        React.createElement(input_1.Input, { id: "email", name: "email", type: "email", placeholder: "Nh\u1EADp email", value: formData.email, onChange: handleInputChange, required: true, disabled: isLoading })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "fullName" }, "H\u1ECD v\u00E0 t\u00EAn"),
                        React.createElement(input_1.Input, { id: "fullName", name: "fullName", type: "text", placeholder: "Nh\u1EADp h\u1ECD v\u00E0 t\u00EAn (t\u00F9y ch\u1ECDn)", value: formData.fullName, onChange: handleInputChange, disabled: isLoading })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "password" }, "M\u1EADt kh\u1EA9u *"),
                        React.createElement("div", { className: "relative" },
                            React.createElement(input_1.Input, { id: "password", name: "password", type: showPassword ? "text" : "password", placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u (\u00EDt nh\u1EA5t 6 k\u00FD t\u1EF1)", value: formData.password, onChange: handleInputChange, required: true, disabled: isLoading }),
                            React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent", onClick: function () { return setShowPassword(!showPassword); }, disabled: isLoading }, showPassword ? React.createElement(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "confirmPassword" }, "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u *"),
                        React.createElement("div", { className: "relative" },
                            React.createElement(input_1.Input, { id: "confirmPassword", name: "confirmPassword", type: showConfirmPassword ? "text" : "password", placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u", value: formData.confirmPassword, onChange: handleInputChange, required: true, disabled: isLoading }),
                            React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, disabled: isLoading }, showConfirmPassword ? React.createElement(lucide_react_1.EyeOff, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" }))))),
                React.createElement(card_1.CardFooter, { className: "flex flex-col space-y-4" },
                    React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: isLoading }, isLoading ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                        "\u0110ang \u0111\u0103ng k\u00FD...")) : ("Đăng ký")),
                    React.createElement("div", { className: "text-sm text-center" },
                        "\u0110\u00E3 c\u00F3 t\u00E0i kho\u1EA3n?",
                        " ",
                        React.createElement("button", { type: "button", onClick: onSwitchToLogin, className: "text-blue-600 hover:underline", disabled: isLoading }, "\u0110\u0103ng nh\u1EADp ngay")))))));
}
exports.RegistrationView = RegistrationView;
