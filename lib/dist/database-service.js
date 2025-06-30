-- Active: 1750877192019@@ep-mute-rice-a17ojtca-pooler.ap-southeast-1.aws.neon.tech@5432@aksstudio
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
exports.DatabaseService = void 0;
var logger_1 = require("@/lib/logger");
var DatabaseService = /** @class */ (function () {
    function DatabaseService() {
        this.isClient = typeof window !== 'undefined';
        logger_1.logger.info('DatabaseService: Initialized', {
            component: 'DatabaseService',
            action: 'constructor',
            data: { isClient: this.isClient }
        });
    }
    DatabaseService.prototype.authenticateUser = function (username, password) {
        return __awaiter(this, void 0, Promise, function () {
            var user;
            return __generator(this, function (_a) {
                logger_1.logger.info('DatabaseService: Authentication attempt', {
                    component: 'DatabaseService',
                    action: 'authenticateUser',
                    data: { username: username }
                });
                try {
                    // Demo authentication
                    if (username === "ankunstudio" && password === "admin") {
                        user = {
                            id: "demo-admin",
                            username: "ankunstudio",
                            password: "admin",
                            email: "ankunstudio@ankun.dev",
                            role: "Label Manager",
                            fullName: "An Kun Studio Digital Music Distribution",
                            createdAt: new Date().toISOString(),
                            avatar: "/face.png",
                            bio: "Digital Music Distribution Platform",
                            isrcCodePrefix: "VNA2P"
                        };
                        logger_1.logger.info('DatabaseService: Authentication successful', {
                            component: 'DatabaseService',
                            action: 'authenticateUser',
                            userId: user.id
                        });
                        return [2 /*return*/, { success: true, data: user }];
                    }
                    logger_1.logger.warn('DatabaseService: Authentication failed', {
                        component: 'DatabaseService',
                        action: 'authenticateUser',
                        data: { username: username, reason: 'Invalid credentials' }
                    });
                    return [2 /*return*/, { success: false, error: "Invalid credentials" }];
                }
                catch (error) {
                    logger_1.logger.error('DatabaseService: Authentication error', error, {
                        component: 'DatabaseService',
                        action: 'authenticateUser'
                    });
                    return [2 /*return*/, { success: false, error: "Authentication failed" }];
                }
                return [2 /*return*/];
            });
        });
    };
    DatabaseService.prototype.createSubmission = function (submission) {
        return __awaiter(this, void 0, Promise, function () {
            var stored, submissions;
            return __generator(this, function (_a) {
                logger_1.logger.info('DatabaseService: Creating submission', {
                    component: 'DatabaseService',
                    action: 'createSubmission',
                    data: { submissionId: submission.id, title: submission.songTitle }
                });
                try {
                    if (this.isClient) {
                        stored = localStorage.getItem("demo_submissions") || "[]";
                        submissions = JSON.parse(stored);
                        submissions.push(submission);
                        localStorage.setItem("demo_submissions", JSON.stringify(submissions));
                        logger_1.logger.info('DatabaseService: Submission created successfully', {
                            component: 'DatabaseService',
                            action: 'createSubmission',
                            data: { submissionId: submission.id }
                        });
                    }
                    return [2 /*return*/, { success: true, data: submission }];
                }
                catch (error) {
                    logger_1.logger.error('DatabaseService: Failed to create submission', error, {
                        component: 'DatabaseService',
                        action: 'createSubmission'
                    });
                    return [2 /*return*/, { success: false, error: "Failed to create submission" }];
                }
                return [2 /*return*/];
            });
        });
    };
    DatabaseService.prototype.getSubmissions = function (filter) {
        return __awaiter(this, void 0, Promise, function () {
            var stored, submissions;
            return __generator(this, function (_a) {
                logger_1.logger.info('DatabaseService: Getting submissions', {
                    component: 'DatabaseService',
                    action: 'getSubmissions',
                    data: { filter: filter }
                });
                try {
                    if (this.isClient) {
                        stored = localStorage.getItem("demo_submissions") || "[]";
                        submissions = JSON.parse(stored);
                        logger_1.logger.info('DatabaseService: Retrieved submissions', {
                            component: 'DatabaseService',
                            action: 'getSubmissions',
                            data: { count: submissions.length }
                        });
                        return [2 /*return*/, { success: true, data: submissions }];
                    }
                    return [2 /*return*/, { success: true, data: [] }];
                }
                catch (error) {
                    logger_1.logger.error('DatabaseService: Failed to get submissions', error, {
                        component: 'DatabaseService',
                        action: 'getSubmissions'
                    });
                    return [2 /*return*/, { success: false, error: "Failed to get submissions" }];
                }
                return [2 /*return*/];
            });
        });
    };
    DatabaseService.prototype.updateSubmissionStatus = function (id, status) {
        return __awaiter(this, void 0, Promise, function () {
            var stored, submissions, index;
            return __generator(this, function (_a) {
                logger_1.logger.info('DatabaseService: Updating submission status', {
                    component: 'DatabaseService',
                    action: 'updateSubmissionStatus',
                    data: { submissionId: id, newStatus: status }
                });
                try {
                    if (this.isClient) {
                        stored = localStorage.getItem("demo_submissions") || "[]";
                        submissions = JSON.parse(stored);
                        index = submissions.findIndex(function (s) { return s.id === id; });
                        if (index >= 0) {
                            submissions[index].status = status;
                            localStorage.setItem("demo_submissions", JSON.stringify(submissions));
                            logger_1.logger.info('DatabaseService: Status updated successfully', {
                                component: 'DatabaseService',
                                action: 'updateSubmissionStatus',
                                data: { submissionId: id, status: status }
                            });
                        }
                        else {
                            logger_1.logger.warn('DatabaseService: Submission not found for status update', {
                                component: 'DatabaseService',
                                action: 'updateSubmissionStatus',
                                data: { submissionId: id }
                            });
                        }
                    }
                    return [2 /*return*/, { success: true, data: true }];
                }
                catch (error) {
                    logger_1.logger.error('DatabaseService: Failed to update status', error, {
                        component: 'DatabaseService',
                        action: 'updateSubmissionStatus'
                    });
                    return [2 /*return*/, { success: false, error: "Failed to update status" }];
                }
                return [2 /*return*/];
            });
        });
    };
    DatabaseService.prototype.checkConnection = function () {
        return __awaiter(this, void 0, Promise, function () {
            var dbService;
            return __generator(this, function (_a) {
                logger_1.logger.info('DatabaseService: Checking connection', {
                    component: 'DatabaseService',
                    action: 'checkConnection'
                });
                dbService = new DatabaseService();
                return [2 /*return*/];
            });
        });
    };
    return DatabaseService;
}());
exports.DatabaseService = DatabaseService;
