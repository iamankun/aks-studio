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
exports.LogoutView = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("../ui/card");
var lucide_react_1 = require("lucide-react");
var image_1 = require("next/image");
function LogoutView(_a) {
    var _this = this;
    var onLogout = _a.onLogout, onCancel = _a.onCancel, userName = _a.userName, userRole = _a.userRole;
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(""), error = _c[0], setError = _c[1];
    var _d = react_1.useState(false), isReloading = _d[0], setIsReloading = _d[1];
    var _e = react_1.useState("Tạm biệt"), currentFarewell = _e[0], setCurrentFarewell = _e[1];
    var _f = react_1.useState(0), farewellIndex = _f[0], setFarewellIndex = _f[1];
    var _g = react_1.useState({
        appName: "AKs Studio",
        logoUrl: "/face.png"
    }), appSettings = _g[0], setAppSettings = _g[1];
    // Farewell messages in different languages
    var farewells = [
        "Tạm biệt", "Au revoir", "Goodbye", "Sayonara", "Adiós",
        "Auf Wiedersehen", "Arrivederci", "अलविदा", "До свидания", "안녕히 가세요"
    ];
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
    // Cycle through farewells
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            setFarewellIndex(function (prev) { return (prev + 1) % farewells.length; });
        }, 3000);
        return function () { return clearInterval(interval); };
    }, [farewells.length]);
    // Update farewell with fade effect
    react_1.useEffect(function () {
        var farewellEl = document.querySelector('.farewell-text');
        if (farewellEl) {
            farewellEl.classList.add('opacity-0');
            setTimeout(function () {
                setCurrentFarewell(farewells[farewellIndex]);
                farewellEl.classList.remove('opacity-0');
            }, 200);
        }
        else {
            setCurrentFarewell(farewells[farewellIndex]);
        }
    }, [farewellIndex, farewells]);
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    setError("");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onLogout()];
                case 2:
                    result = _b.sent();
                    if (!result.success) {
                        setError((_a = result.message) !== null && _a !== void 0 ? _a : "Đăng xuất thất bại");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error("Logout error:", err_1);
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
    // Light sweep throttling for logout button
    var _h = react_1.useState(0), lastSweepTime = _h[0], setLastSweepTime = _h[1];
    var SWEEP_COOLDOWN = 2000; // 2 seconds cooldown
    // Throttled light sweep function for logout
    var triggerLightSweep = function (isIntense) {
        if (isIntense === void 0) { isIntense = false; }
        var now = Date.now();
        if (now - lastSweepTime < SWEEP_COOLDOWN) {
            return; // Skip if still in cooldown
        }
        setLastSweepTime(now);
        var btn = document.querySelector('.logout-button');
        if (!btn)
            return;
        var className = isIntense ? 'light-sweep-intense' : 'light-sweep';
        btn.classList.remove('light-sweep', 'light-sweep-intense');
        requestAnimationFrame(function () {
            btn.classList.add(className);
        });
        setTimeout(function () {
            btn.classList.remove(className);
        }, 2000);
    };
    return (React.createElement("div", { className: "min-h-screen flex relative overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-red-50/80 via-orange-100/70 to-yellow-100/80 backdrop-blur-sm" }),
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
                                React.createElement("span", { className: "farewell-text transition-all duration-300" }, currentFarewell)),
                            userName && userRole && (React.createElement("p", { className: "text-sm text-orange-600 font-medium user-role-fade animate-pulse" },
                                "\uD83D\uDC4B ",
                                userRole,
                                " ",
                                userName))),
                        React.createElement(card_1.CardTitle, { className: "text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent" }, "\u0110\u0103ng xu\u1EA5t"),
                        React.createElement(card_1.CardDescription, { className: "text-lg text-gray-600" },
                            "B\u1EA1n c\u00F3 ch\u1EAFc ch\u1EAFn mu\u1ED1n \u0111\u0103ng xu\u1EA5t kh\u1ECFi ",
                            appSettings.appName,
                            "?")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-4" },
                            error && React.createElement("div", { className: "text-red-500 text-sm text-center" }, error),
                            React.createElement("div", { className: "flex space-x-3" },
                                React.createElement(button_1.Button, { onClick: handleLogout, className: "flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 genZ-shimmer transition-all duration-300 hover:scale-105 active:scale-95 logout-button", disabled: loading, onMouseEnter: function () { return triggerLightSweep(false); }, onClick: function (e) { triggerLightSweep(true); handleLogout(); } }, loading ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4 animate-spin" }),
                                    "\u0110ang \u0111\u0103ng xu\u1EA5t...")) : (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4" }),
                                    "\u0110\u0103ng xu\u1EA5t"))),
                                React.createElement(button_1.Button, { variant: "outline", onClick: onCancel, className: "flex-1 transition-all duration-300 hover:scale-105 active:scale-95" }, "H\u1EE7y b\u1ECF"))))))),
        React.createElement("div", { className: "absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-xl floating" }),
        React.createElement("div", { className: "absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-xl floating" }),
        React.createElement("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-yellow-400/10 to-red-400/10 rounded-full blur-2xl floating" }),
        React.createElement("div", { className: "absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-red-400/30 to-pink-400/30 rounded-lg blur-lg floating rotate-45" }),
        React.createElement("div", { className: "absolute bottom-10 left-1/3 w-20 h-20 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full blur-lg floating" }),
        React.createElement("div", { className: "absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-md floating" })));
}
exports.LogoutView = LogoutView;
