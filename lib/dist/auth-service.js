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
exports.getUserProfile = exports.initializeAuth = exports.registerUser = exports.authenticateUser = void 0;
--Active;
1750877192019;
-mute - rice - a17ojtca - pooler.ap - southeast - 1.;
aws.neon.tech;
var multi_database_service_1 = require("./multi-database-service");
// Mock authentication for demo purposes
// In production, this should integrate with proper auth providers
function authenticateUser(username, password) {
    return __awaiter(this, void 0, Promise, function () {
        var user, dbResult, dbError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log("🔐 Authenticating user:", username);
                    // For demo purposes, accept ankunstudio/admin as valid login
                    if (username === "ankunstudio" && password === "admin") {
                        user = {
                            id: "demo-user-1",
                            username: "ankunstudio",
                            email: "admin@ankunstudio.com",
                            fullName: "An Kun Studio Digital Music Distribution",
                            role: "Label Manager",
                            avatar: "/images/avatar-placeholder.jpg",
                            password: "admin",
                            createdAt: new Date().toISOString()
                        };
                        console.log("✅ Authentication successful for admin user");
                        return [2 /*return*/, {
                                success: true,
                                user: user,
                                message: "Authentication successful"
                            }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, multi_database_service_1.multiDB.authenticateUser(username, password)];
                case 2:
                    dbResult = _a.sent();
                    if (dbResult.success && dbResult.user) {
                        console.log("✅ User authenticated via database:", dbResult.user);
                        return [2 /*return*/, dbResult];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    dbError_1 = _a.sent();
                    console.warn("⚠️ Database authentication failed, using fallback auth:", dbError_1);
                    return [3 /*break*/, 4];
                case 4:
                    console.log("❌ Authentication failed for user:", username);
                    return [2 /*return*/, {
                            success: false,
                            message: "Invalid username or password"
                        }];
                case 5:
                    error_1 = _a.sent();
                    console.error("❌ Authentication error:", error_1);
                    return [2 /*return*/, {
                            success: false,
                            message: "Authentication service error",
                            debug: error_1 instanceof Error ? error_1.message : String(error_1)
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.authenticateUser = authenticateUser;
// Register new user (demo implementation)
function registerUser(userData, password) {
    return __awaiter(this, void 0, Promise, function () {
        var newUser, saveResult, error_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log("📝 Registering new user:", userData.username);
                    // Basic validation
                    if (!userData.username || !userData.email || !password) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Username, email, and password are required"
                            }];
                    }
                    newUser = {
                        id: "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
                        username: userData.username,
                        email: userData.email,
                        fullName: userData.fullName || userData.username,
                        role: userData.role || "Artist",
                        avatar: userData.avatar || "/images/avatar-placeholder.jpg",
                        password: password,
                        createdAt: new Date().toISOString()
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, multi_database_service_1.multiDB.createUser({
                            username: newUser.username,
                            email: newUser.email,
                            fullName: newUser.fullName,
                            password: password,
                            role: newUser.role
                        })];
                case 2:
                    saveResult = _a.sent();
                    if (saveResult.success) {
                        console.log("✅ User saved to database successfully");
                    }
                    else {
                        console.warn("⚠️ Could not save user to database, but registration allowed");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.warn("⚠️ Database save failed, but registration allowed:", error_2);
                    return [3 /*break*/, 4];
                case 4:
                    console.log("✅ User registration successful");
                    return [2 /*return*/, {
                            success: true,
                            user: newUser,
                            message: "Registration successful"
                        }];
                case 5:
                    error_3 = _a.sent();
                    console.error("❌ Registration error:", error_3);
                    return [2 /*return*/, {
                            success: false,
                            message: "Registration service error",
                            debug: error_3 instanceof Error ? error_3.message : String(error_3)
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.registerUser = registerUser;
// Initialize auth system
function initializeAuth() {
    return __awaiter(this, void 0, void 0, function () {
        var dbStatus, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("🔧 Initializing auth system...");
                    return [4 /*yield*/, multi_database_service_1.multiDB.getStatus()];
                case 1:
                    dbStatus = _a.sent();
                    console.log("📊 Database status:", dbStatus);
                    return [2 /*return*/, {
                            success: true,
                            message: "Auth system initialized",
                            debug: { dbStatus: dbStatus }
                        }];
                case 2:
                    error_4 = _a.sent();
                    console.error("❌ Auth initialization error:", error_4);
                    return [2 /*return*/, {
                            success: false,
                            message: "Auth initialization failed",
                            debug: error_4 instanceof Error ? error_4.message : String(error_4)
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.initializeAuth = initializeAuth;
// Get user profile
function getUserProfile(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var user;
        return __generator(this, function (_a) {
            try {
                console.log("👤 Getting user profile:", userId);
                // For demo admin user
                if (userId === "demo-user-1") {
                    user = {
                        id: "demo-user-1",
                        username: "ankunstudio",
                        email: "admin@ankunstudio.com",
                        fullName: "An Kun Studio Digital Music Distribution",
                        role: "Label Manager",
                        avatar: "/images/avatar-placeholder.jpg",
                        password: "admin",
                        createdAt: new Date().toISOString()
                    };
                    return [2 /*return*/, {
                            success: true,
                            user: user,
                            message: "Profile retrieved"
                        }];
                }
                // For other users, database lookup would go here
                return [2 /*return*/, {
                        success: false,
                        message: "User not found"
                    }];
            }
            catch (error) {
                console.error("❌ Get profile error:", error);
                return [2 /*return*/, {
                        success: false,
                        message: "Profile service error",
                        debug: error instanceof Error ? error.message : String(error)
                    }];
            }
            return [2 /*return*/];
        });
    });
}
exports.getUserProfile = getUserProfile;
