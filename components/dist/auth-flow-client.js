"use client";
"use strict";
exports.__esModule = true;
exports.AuthFlowClient = void 0;
var react_1 = require("react");
var login_view_1 = require("@/components/auth/login-view");
var registration_view_1 = require("@/components/auth/registration-view");
var forgot_password_view_1 = require("@/components/auth/forgot-password-view");
function AuthFlowClient(_a) {
    var onLogin = _a.onLogin;
    var _b = react_1.useState("login"), currentView = _b[0], setCurrentView = _b[1];
    var handleSwitchView = function (view) {
        setCurrentView(view);
    };
    return (React.createElement("div", { className: "min-h-screen bg-gray-900" },
        currentView === "login" && (React.createElement(login_view_1.LoginView, { onLogin: onLogin, onSwitchToRegister: function () { return handleSwitchView("register"); }, onSwitchToForgot: function () { return handleSwitchView("forgot"); } })),
        currentView === "register" && React.createElement(registration_view_1.RegistrationView, { onSwitchToLogin: function () { return handleSwitchView("login"); } }),
        currentView === "forgot" && React.createElement(forgot_password_view_1.ForgotPasswordView, { onBackToLogin: function () { return handleSwitchView("login"); } })));
}
exports.AuthFlowClient = AuthFlowClient;
