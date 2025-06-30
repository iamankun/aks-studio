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
exports.TestLogin = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var auth_service_1 = require("@/lib/auth-service");
function TestLogin(_a) {
    var _this = this;
    var onLoginSuccess = _a.onLoginSuccess;
    var _b = react_1.useState("ankunstudio"), username = _b[0], setUsername = _b[1];
    var _c = react_1.useState("admin"), password = _c[0], setPassword = _c[1];
    var _d = react_1.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = react_1.useState(""), message = _e[0], setMessage = _e[1];
    var handleTestLogin = function () { return __awaiter(_this, void 0, void 0, function () {
        var user, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    setMessage("Đang kiểm tra authentication...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, auth_service_1.authenticateUser(username, password)];
                case 2:
                    user = _a.sent();
                    if (user) {
                        setMessage("\u2705 \u0110\u0103ng nh\u1EADp th\u00E0nh c\u00F4ng! Role: " + user.role);
                        onLoginSuccess(user);
                    }
                    else {
                        setMessage("❌ Đăng nhập thất bại! Kiểm tra username/password");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Test login error:", error_1);
                    setMessage("🚨 Lỗi kết nối database");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(card_1.Card, { className: "w-full max-w-md mx-auto" },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "\uD83E\uDDEA Test Authentication")),
        React.createElement(card_1.CardContent, { className: "space-y-4" },
            React.createElement("div", null,
                React.createElement("label", { className: "text-sm font-medium" }, "Username:"),
                React.createElement(input_1.Input, { value: username, onChange: function (e) { return setUsername(e.target.value); }, placeholder: "ankunstudio" })),
            React.createElement("div", null,
                React.createElement("label", { className: "text-sm font-medium" }, "Password:"),
                React.createElement(input_1.Input, { type: "password", value: password, onChange: function (e) { return setPassword(e.target.value); }, placeholder: "admin" })),
            React.createElement(button_1.Button, { onClick: handleTestLogin, disabled: isLoading, className: "w-full" }, isLoading ? "Đang test..." : "Test Login"),
            message && (React.createElement("div", { className: "p-3 rounded text-sm " + (message.includes("✅")
                    ? "bg-green-100 text-green-800"
                    : message.includes("❌")
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800") }, message)),
            React.createElement("div", { className: "text-xs text-gray-500 space-y-1" },
                React.createElement("p", null,
                    React.createElement("strong", null, "Test Data:")),
                React.createElement("p", null, "Username: ankunstudio"),
                React.createElement("p", null, "Password: admin"),
                React.createElement("p", null, "Expected Role: Label Manager")))));
}
exports.TestLogin = TestLogin;
