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
exports.getMultiDbUsageExample = exports.detectDatabaseImports = exports.migrateEndpointToNeon = exports.checkDatabaseTransition = exports.fixSupabaseDependency = void 0;
function fixSupabaseDependency() {
    // Check if Supabase is still being used
    var supabaseDependencies = [
        { file: 'app/api/auth/forgot-password/route.ts', status: 'Needs Migration', usage: 'Using createClient from @supabase/supabase-js' },
        { file: 'package.json', status: 'Check Dependencies', usage: 'May need to remove @supabase/supabase-js dependency' }
    ];
    return supabaseDependencies;
}
exports.fixSupabaseDependency = fixSupabaseDependency;
function checkDatabaseTransition() {
    // Return migration status
    return {
        neon: {
            configured: true,
            available: true,
            errors: []
        },
        wordpress: {
            configured: true,
            available: true,
            errors: []
        },
        supabase: {
            configured: true,
            available: false,
            deprecated: true,
            errors: ['Supabase dependency should be removed']
        }
    };
}
exports.checkDatabaseTransition = checkDatabaseTransition;
function migrateEndpointToNeon(endpoint) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This would actually perform the migration
            console.log("Migration requested for " + endpoint);
            return [2 /*return*/, {
                    success: true,
                    message: "Migration plan created for " + endpoint
                }];
        });
    });
}
exports.migrateEndpointToNeon = migrateEndpointToNeon;
// Helper to detect database-related imports in a file
function detectDatabaseImports(fileContent) {
    var imports = {
        supabase: fileContent.includes('@supabase/supabase-js'),
        neon: fileContent.includes('@neondatabase/serverless'),
        wordpress: fileContent.includes('wp-includes') || fileContent.includes('wp_'),
        multiDb: fileContent.includes('multi-database-service') || fileContent.includes('MultiDatabaseService')
    };
    return imports;
}
exports.detectDatabaseImports = detectDatabaseImports;
// Usage instruction for MultiDatabaseService
function getMultiDbUsageExample() {
    return "\n// Import the service\nimport { MultiDatabaseService } from \"@/lib/multi-database-service\"\n\n// Example usage in an API route\nexport async function POST(request: Request) {\n  try {\n    const { email } = await request.json()\n    \n    // Initialize the multi-database service\n    const dbService = new MultiDatabaseService()\n    await dbService.initialize()\n    \n    // The service will automatically use the best available database\n    const user = await dbService.findUserByEmail(email)\n    \n    // Continue with your logic...\n  } catch (error) {\n    console.error(\"API error:\", error)\n    return new Response(JSON.stringify({ success: false, message: \"Internal server error\" }), {\n      status: 500,\n      headers: { \"Content-Type\": \"application/json\" }\n    })\n  }\n}\n";
}
exports.getMultiDbUsageExample = getMultiDbUsageExample;
