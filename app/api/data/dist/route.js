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
exports.GET = void 0;
// File: c:\Users\admin\aksstudio\app\api\data\route.ts
var server_1 = require("next/server");
var neon_js_1 = require("@neondatabase/neon-js");
var utils_1 = require("@/lib/utils"); // Import từ utils
var BUCKET_NAME = 'aksstudio'; // Tên bucket của bạn
// Helper để chuyển đổi định dạng
function toFileItem(Neon, basePathParts) {
    var _a, _b, _c;
    var isFolder = !Neon.id && Neon.name; // Supabase list() trả về id là null cho folder
    var fileType = 'other';
    if (isFolder) {
        fileType = 'folder';
    }
    else if (Neon.name.endsWith('.pdf')) {
        fileType = 'pdf';
    }
    else if (Neon.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
        fileType = 'image';
    } // Thêm các loại khác nếu cần
    return {
        id: (_a = Neon.id) !== null && _a !== void 0 ? _a : Neon.name,
        name: Neon.name,
        type: fileType,
        size: ((_b = Neon.metadata) === null || _b === void 0 ? void 0 : _b.size) ? utils_1.formatFileSize(Neon.metadata.size) : '',
        items: undefined,
        modified: ((_c = Neon.metadata) === null || _c === void 0 ? void 0 : _c.lastModified) ? new Date(Neon.metadata.lastModified) : new Date(),
        path: basePathParts
    };
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, pathParam, neonUrl, neonServiceKey, neon, _a, data, error, basePathParts_1, fileItems, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    searchParams = new URL(request.url).searchParams;
                    pathParam = searchParams.get('path') || '';
                    neonUrl = process.env.aksstudio_NEON_URL;
                    neonServiceKey = process.env.aksstudio_NEON_SERVICE_ROLE_KEY;
                    if (!neonUrl || !neonServiceKey) {
                        console.error('Neon URL or Service Key is not defined in environment variables for /api/data.');
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                message: 'Lỗi cấu hình server: Neon URL hoặc Service Key không được định nghĩa.',
                                error: 'Missing Neon credentials on the server.'
                            }, { status: 500 })];
                    }
                    neon = neon_js_1.createClient(neonUrl, neonServiceKey);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, neon
                            .storage
                            .from(BUCKET_NAME)
                            .list(pathParam, {
                            limit: 100,
                            offset: 0,
                            sortBy: { column: 'name', order: 'asc' }
                        })];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error listing files for path \"" + pathParam + "\":", error);
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, message: 'Lỗi lấy danh sách file.', error: error.message }, { status: 500 })];
                    }
                    basePathParts_1 = pathParam ? pathParam.split('/').filter(function (p) { return p; }) : [];
                    fileItems = data ? data.map(function (file) { return toFileItem(file, basePathParts_1); }) : [];
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: fileItems })];
                case 3:
                    error_1 = _b.sent();
                    console.error("API Error listing files for path \"" + pathParam + "\":", error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, message: 'Lỗi server khi lấy danh sách file.', error: error_1.message }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
