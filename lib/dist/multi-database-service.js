"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.multiDB = exports.MultiDatabaseService = void 0;
--Active;
1750877192019;
-mute - rice - a17ojtca - pooler.ap - southeast - 1.;
aws.neon.tech;
var serverless_1 = require("@neondatabase/serverless");
// Database priority: Neon -> WordPress -> Demo Mode (Supabase disabled per user request)
var MultiDatabaseService = /** @class */ (function () {
    function MultiDatabaseService() {
        this.neonSql = null;
        this.neonAvailable = true;
        this.wordpressAvailable = true;
        // Initialize async operations separately
    }
    MultiDatabaseService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initializeDatabases()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MultiDatabaseService.prototype.initializeDatabases = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var error_1, response, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL)) return [3 /*break*/, 2];
                        this.neonSql = serverless_1.neon((_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : process.env.NEON_DATABASE_URL);
                        // Test Neon connection
                        return [4 /*yield*/, this.neonSql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT NOW() as current_time"], ["SELECT NOW() as current_time"])))];
                    case 1:
                        // Test Neon connection
                        _b.sent();
                        this.neonAvailable = true;
                        console.log("✅ Neon connected and ready");
                        _b.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.log("⚠️ Neon not available:", error_1.message);
                        return [3 /*break*/, 4];
                    case 4:
                        _b.trys.push([4, 7, , 8]);
                        if (!process.env.WORDPRESS_API_URL) return [3 /*break*/, 6];
                        return [4 /*yield*/, fetch(process.env.WORDPRESS_API_URL, { method: 'HEAD' })];
                    case 5:
                        response = _b.sent();
                        if (response.ok) {
                            this.wordpressAvailable = true;
                            console.log("✅ WordPress API available");
                        }
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        console.log("⚠️ WordPress not available:", error_2.message);
                        return [3 /*break*/, 8];
                    case 8:
                        console.log("🗄️ Database Status:", {
                            supabase: false,
                            neon: this.neonAvailable
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    MultiDatabaseService.prototype.authenticateUser = function (username, password) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var adminResult, user, artistResult, user, error_3, demoUsers, demoUser, validPassword;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log("🔐 Multi-DB Authentication for:", username);
                        if (!(!this.neonAvailable && !this.wordpressAvailable)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        if (!this.neonAvailable) return [3 /*break*/, 7];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.neonSql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n          SELECT * FROM label_manager \n          WHERE username = ", " AND password = ", "\n          LIMIT 1\n        "], ["\n          SELECT * FROM label_manager \n          WHERE username = ", " AND password = ", "\n          LIMIT 1\n        "])), username, password)];
                    case 4:
                        adminResult = _d.sent();
                        if (adminResult.length > 0) {
                            user = adminResult[0];
                            console.log("✅ Neon admin authentication successful");
                            return [2 /*return*/, {
                                    success: true,
                                    user: {
                                        id: user.id,
                                        username: user.username,
                                        email: user.email,
                                        fullName: (_a = user.fullname) !== null && _a !== void 0 ? _a : user.username,
                                        role: "Admin",
                                        avatar: "/face.png",
                                        table: "label_manager"
                                    },
                                    source: "Neon"
                                }];
                        }
                        return [4 /*yield*/, this.neonSql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n          SELECT * FROM artist \n          WHERE username = ", " AND password = ", "\n          LIMIT 1\n        "], ["\n          SELECT * FROM artist \n          WHERE username = ", " AND password = ", "\n          LIMIT 1\n        "])), username, password)];
                    case 5:
                        artistResult = _d.sent();
                        if (artistResult.length > 0) {
                            user = artistResult[0];
                            console.log("✅ Neon artist authentication successful");
                            return [2 /*return*/, {
                                    success: true,
                                    user: {
                                        id: user.id,
                                        username: user.username,
                                        email: user.email,
                                        fullName: (_b = user.fullname) !== null && _b !== void 0 ? _b : user.username,
                                        role: "Artist",
                                        avatar: (_c = user.avatar) !== null && _c !== void 0 ? _c : "/face.png",
                                        table: "artist"
                                    },
                                    source: "Neon"
                                }];
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _d.sent();
                        console.log("⚠️ Neon auth failed:", error_3.message);
                        return [3 /*break*/, 7];
                    case 7:
                        // WordPress authentication (if available)
                        if (this.wordpressAvailable) {
                            try {
                                // TODO: Implement WordPress authentication via REST API
                                console.log("⚠️ WordPress authentication not yet implemented");
                            }
                            catch (error) {
                                console.log("⚠️ WordPress auth failed:", error.message);
                            }
                        }
                        demoUsers = [
                            {
                                id: "admin-demo",
                                username: "admin",
                                email: "admin@aksstudio.com",
                                fullName: "Administrator",
                                role: "Label Manager",
                                avatar: "/face.png"
                            },
                            {
                                id: "ankunstudio-demo",
                                username: "ankunstudio",
                                email: "ankunstudio@gmail.com",
                                fullName: "An Kun Studio",
                                role: "Label Manager",
                                avatar: "/Logo-An-Kun-Studio-Black.png"
                            },
                            {
                                id: "artist-demo",
                                username: "artist",
                                email: "artist@aksstudio.com",
                                fullName: "Demo Artist",
                                role: "Artist",
                                avatar: "/face.png"
                            },
                        ];
                        demoUser = demoUsers.find(function (u) { return u.username === username; });
                        validPassword = (username === "admin" && password === "admin") ||
                            (username === "artist" && password === "123456") ||
                            (username === "ankunstudio" && password === "admin");
                        if (demoUser && validPassword) {
                            console.log("✅ Demo authentication successful");
                            return [2 /*return*/, {
                                    success: true,
                                    user: demoUser,
                                    source: "Demo Fallback"
                                }];
                        }
                        return [2 /*return*/, {
                                success: false,
                                message: "Invalid credentials"
                            }];
                }
            });
        });
    };
    MultiDatabaseService.prototype.createUser = function (userData) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, result, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("👤 Creating user:", userData.username);
                        if (!this.neonAvailable) return [3 /*break*/, 5];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.neonSql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n          SELECT id FROM artist \n          WHERE username = ", " OR email = ", "\n          LIMIT 1\n        "], ["\n          SELECT id FROM artist \n          WHERE username = ", " OR email = ", "\n          LIMIT 1\n        "])), userData.username, userData.email)];
                    case 2:
                        existingUser = _b.sent();
                        if (existingUser.length > 0) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Username or email already exists"
                                }];
                        }
                        return [4 /*yield*/, this.neonSql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n          INSERT INTO artist (username, email, password, fullname, avatar, bio, facebook, youtube, spotify, applemusic, tiktok, instagram)\n          VALUES (", ", ", ", ", ", \n                  ", ", '/face.png', '', '', '', '', '', '', '')\n          RETURNING *\n        "], ["\n          INSERT INTO artist (username, email, password, fullname, avatar, bio, facebook, youtube, spotify, applemusic, tiktok, instagram)\n          VALUES (", ", ", ", ", ", \n                  ", ", '/face.png', '', '', '', '', '', '', '')\n          RETURNING *\n        "])), userData.username, userData.email, userData.password, (_a = userData.fullName) !== null && _a !== void 0 ? _a : userData.username)];
                    case 3:
                        result = _b.sent();
                        if (result.length > 0) {
                            console.log("✅ User created successfully in Neon");
                            return [2 /*return*/, {
                                    success: true,
                                    user: result[0],
                                    source: "Neon"
                                }];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _b.sent();
                        console.log("⚠️ Neon user creation failed:", error_4.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, {
                            success: false,
                            message: "Failed to create user - no available database"
                        }];
                }
            });
        });
    };
    MultiDatabaseService.prototype.getStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.neonAvailable && !this.wordpressAvailable)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, {
                            neon: this.neonAvailable,
                            wordpress: this.wordpressAvailable,
                            supabase: false
                        }];
                }
            });
        });
    };
    return MultiDatabaseService;
}());
exports.MultiDatabaseService = MultiDatabaseService;
// Export singleton instance
exports.multiDB = new MultiDatabaseService();
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
