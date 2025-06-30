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
exports.POST = void 0;
var server_1 = require("next/server");
var multi_database_service_1 = require("@/lib/multi-database-service");
var logger_1 = require("@/lib/logger");
function POST(request) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var email, dbService, user, emailResponse, emailResult, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    email = (_b.sent()).email;
                    logger_1.logger.info("Forgot password request", { email: email }, { component: "ForgotPasswordAPI" });
                    if (!email) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                message: "Email is required"
                            }, { status: 400 })];
                    }
                    dbService = new multi_database_service_1.MultiDatabaseService();
                    return [4 /*yield*/, dbService.initialize()
                        // Try to find the user by email
                    ];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, dbService.findUserByEmail(email)
                        // Check if user exists - but don't reveal this in the response
                    ];
                case 3:
                    user = _b.sent();
                    // Check if user exists - but don't reveal this in the response
                    if (user) {
                        logger_1.logger.info("User found for password reset", { email: email }, { component: "ForgotPasswordAPI" });
                    }
                    else {
                        logger_1.logger.warn("User not found for password reset", { email: email }, { component: "ForgotPasswordAPI" });
                    }
                    return [4 /*yield*/, fetch(((_a = process.env.NEXT_PUBLIC_SITE_URL) !== null && _a !== void 0 ? _a : "http://localhost:3000") + "/api/send-email", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                to: email,
                                subject: "Đặt lại mật khẩu - AKs Studio",
                                textBody: "\nXin ch\u00E0o,\n\nB\u1EA1n \u0111\u00E3 y\u00EAu c\u1EA7u \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u cho t\u00E0i kho\u1EA3n AKs Studio.\n\nVui l\u00F2ng li\u00EAn h\u1EC7 v\u1EDBi ch\u00FAng t\u00F4i qua email admin@ankun.dev \u0111\u1EC3 \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3 \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u.\n\nTr\u00E2n tr\u1ECDng,\nAn Kun Studio Digital Music Distribution\n        ",
                                htmlBody: "\n<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n  <h2 style=\"color: #8b5cf6;\">\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u - AKs Studio</h2>\n  <p>Xin ch\u00E0o,</p>\n  <p>B\u1EA1n \u0111\u00E3 y\u00EAu c\u1EA7u \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u cho t\u00E0i kho\u1EA3n AKs Studio.</p>\n  <p>Vui l\u00F2ng li\u00EAn h\u1EC7 v\u1EDBi ch\u00FAng t\u00F4i qua email <strong>admin@ankun.dev</strong> \u0111\u1EC3 \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3 \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u.</p>\n  <br>\n  <p>Tr\u00E2n tr\u1ECDng,<br>\n  <strong>An Kun Studio Digital Music Distribution</strong></p>\n</div>\n        "
                            })
                        })];
                case 4:
                    emailResponse = _b.sent();
                    return [4 /*yield*/, emailResponse.json()];
                case 5:
                    emailResult = _b.sent();
                    if (emailResult.success) {
                        logger_1.logger.info("Reset password email sent successfully", { email: email }, { component: "ForgotPasswordAPI" });
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: true,
                                message: "Email hướng dẫn đặt lại mật khẩu đã được gửi"
                            })];
                    }
                    else {
                        logger_1.logger.error("Failed to send reset password email", emailResult, { component: "ForgotPasswordAPI" });
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                message: "Không thể gửi email"
                            }, { status: 500 })];
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _b.sent();
                    logger_1.logger.error("Forgot password API error", error_1, { component: "ForgotPasswordAPI" });
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            message: "Internal server error"
                        }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
