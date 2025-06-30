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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var input_1 = require("@/components/ui/input");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var progress_1 = require("@/components/ui/progress");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var scroll_area_1 = require("@/components/ui/scroll-area");
// Sample data
var sampleFiles = [
    {
        id: "1",
        name: "Documents",
        type: "folder",
        size: "",
        items: 5,
        modified: new Date("2024-01-20"),
        path: ["Home"]
    },
    {
        id: "2",
        name: "Images",
        type: "folder",
        size: "",
        items: 12,
        modified: new Date("2024-01-18"),
        path: ["Home"]
    },
    {
        id: "3",
        name: "Project Files",
        type: "folder",
        size: "",
        items: 8,
        modified: new Date("2024-01-15"),
        path: ["Home"]
    },
    {
        id: "4",
        name: "Annual Report.pdf",
        type: "pdf",
        size: "2.4 MB",
        modified: new Date("2024-01-10"),
        path: ["Home"]
    },
    {
        id: "5",
        name: "Presentation.pdf",
        type: "pdf",
        size: "3.8 MB",
        modified: new Date("2024-01-05"),
        path: ["Home"]
    },
    {
        id: "6",
        name: "Profile Picture.jpg",
        type: "image",
        size: "1.2 MB",
        modified: new Date("2023-12-28"),
        path: ["Home"]
    },
    {
        id: "7",
        name: "Meeting Notes.docx",
        type: "document",
        size: "245 KB",
        modified: new Date("2023-12-20"),
        path: ["Home"]
    },
    {
        id: "8",
        name: "main.js",
        type: "code",
        size: "56 KB",
        modified: new Date("2023-12-15"),
        path: ["Home"]
    },
];
// Helper function to get file icon
var getFileIcon = function (type) {
    switch (type) {
        case "folder":
            return React.createElement(lucide_react_1.Folder, { className: "h-5 w-5 text-blue-500" });
        case "pdf":
            return React.createElement(lucide_react_1.FileIcon, { className: "h-5 w-5 text-red-500" });
        case "image":
            return React.createElement(lucide_react_1.FileImage, { className: "h-5 w-5 text-green-500" });
        case "document":
            return React.createElement(lucide_react_1.FileText, { className: "h-5 w-5 text-yellow-500" });
        case "code":
            return React.createElement(lucide_react_1.FileCode, { className: "h-5 w-5 text-purple-500" });
        default:
            return React.createElement(lucide_react_1.File, { className: "h-5 w-5 text-gray-500" });
    }
};
function aksdata(_a) {
    var currentUser = _a.currentUser;
    var _b = react_1.useState(sampleFiles), files = _b[0], setFiles = _b[1];
    var _c = react_1.useState([]), selectedFiles = _c[0], setSelectedFiles = _c[1];
    var _d = react_1.useState("list"), viewMode = _d[0], setViewMode = _d[1];
    var _e = react_1.useState(["Home"]), currentPath = _e[0], setCurrentPath = _e[1];
    var _f = react_1.useState(""), searchQuery = _f[0], setSearchQuery = _f[1];
    // Modals state
    var _g = react_1.useState(false), uploadModalOpen = _g[0], setUploadModalOpen = _g[1];
    var _h = react_1.useState(false), newFolderModalOpen = _h[0], setNewFolderModalOpen = _h[1];
    var _j = react_1.useState(false), renameModalOpen = _j[0], setRenameModalOpen = _j[1];
    var _k = react_1.useState(false), deleteModalOpen = _k[0], setDeleteModalOpen = _k[1];
    var _l = react_1.useState(false), moveModalOpen = _l[0], setMoveModalOpen = _l[1];
    var _m = react_1.useState(false), previewModalOpen = _m[0], setPreviewModalOpen = _m[1];
    var _o = react_1.useState(null), activeFile = _o[0], setActiveFile = _o[1];
    // Upload progress simulation
    var _p = react_1.useState(0), uploadProgress = _p[0], setUploadProgress = _p[1];
    var _q = react_1.useState(""), uploadingFile = _q[0], setUploadingFile = _q[1];
    // New folder name
    var _r = react_1.useState(""), newFolderName = _r[0], setNewFolderName = _r[1];
    var _s = react_1.useState(""), newFileName = _s[0], setNewFileName = _s[1];
    // Kiểm tra quyền Admin
    if (!currentUser || currentUser.role !== "Label Manager") { // Giả sử vai trò admin là "Label Manager"
        return (React.createElement("div", { className: "flex flex-col items-center justify-center h-screen" },
            React.createElement("h2", { className: "text-2xl font-bold text-red-500" }, "Access Denied"),
            React.createElement("p", { className: "text-muted-foreground" }, "You do not have permission to view this page.")));
    }
    // Filter files based on current path and search query
    var filteredFiles = files.filter(function (file) {
        var pathMatch = JSON.stringify(file.path) === JSON.stringify(currentPath);
        var searchMatch = searchQuery === "" || file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return pathMatch && searchMatch;
    });
    // Handle file/folder selection
    var toggleSelection = function (id) {
        setSelectedFiles(function (prev) { return (prev.includes(id) ? prev.filter(function (fileId) { return fileId !== id; }) : __spreadArrays(prev, [id])); });
    };
    // Handle select all
    var toggleSelectAll = function () {
        if (selectedFiles.length === filteredFiles.length) {
            setSelectedFiles([]);
        }
        else {
            setSelectedFiles(filteredFiles.map(function (file) { return file.id; }));
        }
    };
    // Handle folder navigation
    var navigateToFolder = function (folder) {
        if (folder.type === "folder") {
            setCurrentPath(__spreadArrays(folder.path, [folder.name]));
            setSelectedFiles([]);
        }
    };
    // Handle breadcrumb navigation
    var navigateToBreadcrumb = function (index) {
        setCurrentPath(currentPath.slice(0, index + 1));
        setSelectedFiles([]);
    };
    // Handle file actions
    var handleFileAction = function (action, file) {
        setActiveFile(file);
        switch (action) {
            case "open":
                if (file.type === "folder") {
                    navigateToFolder(file);
                }
                else {
                    setPreviewModalOpen(true);
                }
                break;
            case "rename":
                setNewFileName(file.name);
                setRenameModalOpen(true);
                break;
            case "move":
                setMoveModalOpen(true);
                break;
            case "delete":
                setDeleteModalOpen(true);
                break;
            case "preview":
                setPreviewModalOpen(true);
                break;
            default:
                break;
        }
    };
    // Handle bulk actions
    var handleBulkAction = function (action) {
        switch (action) {
            case "delete":
                setDeleteModalOpen(true);
                break;
            case "move":
                setMoveModalOpen(true);
                break;
            default:
                break;
        }
    };
    // Simulate file upload
    var simulateUpload = function (fileName) {
        setUploadingFile(fileName);
        setUploadProgress(0);
        var interval = setInterval(function () {
            setUploadProgress(function (prev) {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Add the new file to the list
                    var newFile_1 = {
                        id: Date.now().toString(),
                        name: fileName,
                        type: fileName.endsWith(".pdf")
                            ? "pdf"
                            : fileName.endsWith(".jpg") || fileName.endsWith(".png")
                                ? "image"
                                : fileName.endsWith(".docx") || fileName.endsWith(".txt")
                                    ? "document"
                                    : fileName.endsWith(".js") || fileName.endsWith(".ts")
                                        ? "code"
                                        : "other",
                        size: "1.2 MB",
                        modified: new Date(),
                        path: currentPath
                    };
                    setFiles(function (prev) { return __spreadArrays(prev, [newFile_1]); });
                    setUploadModalOpen(false);
                    setUploadingFile("");
                    return 0;
                }
                return prev + 10;
            });
        }, 300);
    };
    // Create new folder
    var createNewFolder = function () {
        if (newFolderName.trim() === "")
            return;
        var newFolder = {
            id: Date.now().toString(),
            name: newFolderName,
            type: "folder",
            size: "",
            items: 0,
            modified: new Date(),
            path: currentPath
        };
        setFiles(function (prev) { return __spreadArrays(prev, [newFolder]); });
        setNewFolderName("");
        setNewFolderModalOpen(false);
    };
    // Rename file/folder
    var renameFile = function () {
        if (!activeFile || newFileName.trim() === "")
            return;
        setFiles(function (prev) { return prev.map(function (file) { return (file.id === activeFile.id ? __assign(__assign({}, file), { name: newFileName }) : file); }); });
        setRenameModalOpen(false);
        setActiveFile(null);
    };
    // Delete file/folder
    var deleteFiles = function () {
        if (selectedFiles.length > 0) {
            setFiles(function (prev) { return prev.filter(function (file) { return !selectedFiles.includes(file.id); }); });
            setSelectedFiles([]);
        }
        else if (activeFile) {
            setFiles(function (prev) { return prev.filter(function (file) { return file.id !== activeFile.id; }); });
            setActiveFile(null);
        }
        setDeleteModalOpen(false);
    };
    return (React.createElement(card_1.Card, { className: "w-full max-w-6xl mx-auto shadow-md" },
        React.createElement(card_1.CardHeader, { className: "p-4 border-b" },
            React.createElement("div", { className: "flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0" },
                React.createElement("div", { className: "flex items-center space-x-2 text-sm text-muted-foreground" }, currentPath.map(function (path, index) { return (React.createElement("div", { key: index, className: "flex items-center" },
                    index > 0 && React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 mx-1" }),
                    React.createElement("button", { onClick: function () { return navigateToBreadcrumb(index); }, className: "hover:text-primary " + (index === currentPath.length - 1 ? "font-medium text-primary" : "") }, path))); })),
                React.createElement("div", { className: "flex items-center space-x-2" },
                    React.createElement("div", { className: "relative w-full md:w-auto" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { type: "search", placeholder: "Search files...", className: "w-full pl-8 md:w-[200px] lg:w-[300px]", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); } })),
                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setNewFolderModalOpen(true); } },
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                        "New Folder"),
                    React.createElement(button_1.Button, { size: "sm", onClick: function () { return setUploadModalOpen(true); } },
                        React.createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                        "Upload"),
                    React.createElement("div", { className: "hidden md:flex border rounded-md" },
                        React.createElement(button_1.Button, { variant: viewMode === "list" ? "secondary" : "ghost", size: "icon", className: "h-8 w-8 rounded-r-none", onClick: function () { return setViewMode("list"); } },
                            React.createElement(lucide_react_1.List, { className: "h-4 w-4" }),
                            React.createElement("span", { className: "sr-only" }, "List view")),
                        React.createElement(button_1.Button, { variant: viewMode === "grid" ? "secondary" : "ghost", size: "icon", className: "h-8 w-8 rounded-l-none", onClick: function () { return setViewMode("grid"); } },
                            React.createElement(lucide_react_1.Grid, { className: "h-4 w-4" }),
                            React.createElement("span", { className: "sr-only" }, "Grid view")))))),
        selectedFiles.length > 0 && (React.createElement("div", { className: "bg-muted/50 p-2 flex items-center justify-between" },
            React.createElement("div", { className: "flex items-center space-x-2" },
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setSelectedFiles([]); } },
                    React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-2" }),
                    "Deselect"),
                React.createElement("span", { className: "text-sm text-muted-foreground" },
                    selectedFiles.length,
                    " item",
                    selectedFiles.length !== 1 ? "s" : "",
                    " selected")),
            React.createElement("div", { className: "flex items-center space-x-2" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleBulkAction("download"); } },
                    React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                    "Download"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleBulkAction("move"); } },
                    React.createElement(lucide_react_1.Move, { className: "h-4 w-4 mr-2" }),
                    "Move"),
                React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () { return handleBulkAction("delete"); } },
                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                    "Delete")))),
        React.createElement(card_1.CardContent, { className: "p-0" },
            React.createElement(tabs_1.Tabs, { value: viewMode, onValueChange: function (value) { return setViewMode(value); } },
                React.createElement(tabs_1.TabsContent, { value: "list", className: "m-0" }, filteredFiles.length > 0 ? (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, { className: "w-[40px]" },
                                React.createElement(checkbox_1.Checkbox, { checked: selectedFiles.length === filteredFiles.length && filteredFiles.length > 0, onCheckedChange: toggleSelectAll, "aria-label": "Select all" })),
                            React.createElement(table_1.TableHead, { className: "w-[300px]" }, "Name"),
                            React.createElement(table_1.TableHead, null, "Size"),
                            React.createElement(table_1.TableHead, null, "Modified"),
                            React.createElement(table_1.TableHead, { className: "w-[80px]" }, "Actions"))),
                    React.createElement(table_1.TableBody, null, filteredFiles.map(function (file) { return (React.createElement(table_1.TableRow, { key: file.id, className: selectedFiles.includes(file.id) ? "bg-muted/50" : "" },
                        React.createElement(table_1.TableCell, null,
                            React.createElement(checkbox_1.Checkbox, { checked: selectedFiles.includes(file.id), onCheckedChange: function () { return toggleSelection(file.id); }, "aria-label": "Select " + file.name })),
                        React.createElement(table_1.TableCell, null,
                            React.createElement("div", { className: "flex items-center space-x-2 cursor-pointer", onClick: function () { return handleFileAction("open", file); } },
                                getFileIcon(file.type),
                                React.createElement("span", { className: "font-medium" }, file.name))),
                        React.createElement(table_1.TableCell, null, file.type === "folder" ? file.items + " item" + (file.items !== 1 ? "s" : "") : file.size),
                        React.createElement(table_1.TableCell, null, file.modified ? date_fns_1.format(file.modified, "PPp") : "—"),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(dropdown_menu_1.DropdownMenu, null,
                                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8" },
                                        React.createElement(lucide_react_1.MoreVertical, { className: "h-4 w-4" }),
                                        React.createElement("span", { className: "sr-only" }, "Actions"))),
                                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("open", file); } }, file.type === "folder" ? (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.Folder, { className: "h-4 w-4 mr-2" }),
                                        "Open")) : (React.createElement(React.Fragment, null,
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4 mr-2" }),
                                        "Preview"))),
                                    file.type !== "folder" && (React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("download", file); } },
                                        React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                        "Download")),
                                    file.type === "folder" && (React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("download", file); } },
                                        React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                        "Download as ZIP")),
                                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("rename", file); } },
                                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                                        "Rename"),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("move", file); } },
                                        React.createElement(lucide_react_1.Move, { className: "h-4 w-4 mr-2" }),
                                        "Move"),
                                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("delete", file); }, className: "text-destructive focus:text-destructive" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                                        "Delete")))))); })))) : (React.createElement("div", { className: "flex flex-col items-center justify-center py-12" },
                    React.createElement("div", { className: "rounded-full bg-muted p-3" },
                        React.createElement(lucide_react_1.Folder, { className: "h-6 w-6 text-muted-foreground" })),
                    React.createElement("h3", { className: "mt-4 text-lg font-semibold" }, "No files found"),
                    React.createElement("p", { className: "mt-2 text-sm text-muted-foreground text-center max-w-sm" }, searchQuery
                        ? "No results found for \"" + searchQuery + "\". Try a different search term."
                        : "This folder is empty. Upload a file or create a new folder."),
                    React.createElement("div", { className: "mt-4 flex space-x-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setNewFolderModalOpen(true); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "New Folder"),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { return setUploadModalOpen(true); } },
                            React.createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                            "Upload File"))))),
                React.createElement(tabs_1.TabsContent, { value: "grid", className: "m-0" }, filteredFiles.length > 0 ? (React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4" }, filteredFiles.map(function (file) { return (React.createElement("div", { key: file.id, className: "relative group rounded-lg border bg-card p-2 transition-all hover:shadow-md " + (selectedFiles.includes(file.id) ? "ring-2 ring-primary" : "") },
                    React.createElement("div", { className: "absolute top-2 right-2" },
                        React.createElement(checkbox_1.Checkbox, { checked: selectedFiles.includes(file.id), onCheckedChange: function () { return toggleSelection(file.id); }, "aria-label": "Select " + file.name })),
                    React.createElement("div", { className: "flex flex-col items-center p-4 cursor-pointer", onClick: function () { return handleFileAction("open", file); } },
                        React.createElement("div", { className: "mb-2 text-4xl" }, getFileIcon(file.type)),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("p", { className: "font-medium truncate w-full max-w-[120px]" }, file.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, file.type === "folder" ? file.items + " item" + (file.items !== 1 ? "s" : "") : file.size))),
                    React.createElement("div", { className: "absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" },
                        React.createElement(dropdown_menu_1.DropdownMenu, null,
                            React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8" },
                                    React.createElement(lucide_react_1.MoreVertical, { className: "h-4 w-4" }),
                                    React.createElement("span", { className: "sr-only" }, "Actions"))),
                            React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("open", file); } }, file.type === "folder" ? (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Folder, { className: "h-4 w-4 mr-2" }),
                                    "Open")) : (React.createElement(React.Fragment, null,
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4 mr-2" }),
                                    "Preview"))),
                                file.type !== "folder" && (React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("download", file); } },
                                    React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                    "Download")),
                                file.type === "folder" && (React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("download", file); } },
                                    React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                                    "Download as ZIP")),
                                React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("rename", file); } },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                                    "Rename"),
                                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("move", file); } },
                                    React.createElement(lucide_react_1.Move, { className: "h-4 w-4 mr-2" }),
                                    "Move"),
                                React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleFileAction("delete", file); }, className: "text-destructive focus:text-destructive" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                                    "Delete")))))); }))) : (React.createElement("div", { className: "flex flex-col items-center justify-center py-12" },
                    React.createElement("div", { className: "rounded-full bg-muted p-3" },
                        React.createElement(lucide_react_1.Folder, { className: "h-6 w-6 text-muted-foreground" })),
                    React.createElement("h3", { className: "mt-4 text-lg font-semibold" }, "No files found"),
                    React.createElement("p", { className: "mt-2 text-sm text-muted-foreground text-center max-w-sm" }, searchQuery
                        ? "No results found for \"" + searchQuery + "\". Try a different search term."
                        : "This folder is empty. Upload a file or create a new folder."),
                    React.createElement("div", { className: "mt-4 flex space-x-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setNewFolderModalOpen(true); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "New Folder"),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { return setUploadModalOpen(true); } },
                            React.createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                            "Upload File"))))))),
        React.createElement(dialog_1.Dialog, { open: uploadModalOpen, onOpenChange: setUploadModalOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Upload File"),
                    React.createElement(dialog_1.DialogDescription, null, "Drag and drop a file or click to browse.")),
                React.createElement("div", { className: "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors", onClick: function () {
                        if (!uploadingFile) {
                            simulateUpload("New Document.pdf");
                        }
                    } },
                    React.createElement("div", { className: "flex flex-col items-center" },
                        React.createElement(lucide_react_1.Upload, { className: "h-10 w-10 text-muted-foreground mb-4" }),
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, "Drag and drop your file here or click to browse"),
                        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Supports PDF, DOCX, JPG, PNG, and more"))),
                uploadingFile && (React.createElement("div", { className: "mt-4" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("span", { className: "text-sm font-medium" }, uploadingFile),
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            uploadProgress,
                            "%")),
                    React.createElement(progress_1.Progress, { value: uploadProgress, className: "h-2" }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setUploadModalOpen(false); } }, "Cancel")))),
        React.createElement(dialog_1.Dialog, { open: newFolderModalOpen, onOpenChange: setNewFolderModalOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Create New Folder"),
                    React.createElement(dialog_1.DialogDescription, null, "Enter a name for your new folder.")),
                React.createElement("div", { className: "space-y-4 py-2 pb-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(input_1.Input, { placeholder: "Folder Name", value: newFolderName, onChange: function (e) { return setNewFolderName(e.target.value); } }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setNewFolderModalOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: createNewFolder }, "Create Folder")))),
        React.createElement(dialog_1.Dialog, { open: renameModalOpen, onOpenChange: setRenameModalOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null,
                        "Rename ",
                        (activeFile === null || activeFile === void 0 ? void 0 : activeFile.type) === "folder" ? "Folder" : "File"),
                    React.createElement(dialog_1.DialogDescription, null,
                        "Enter a new name for your ",
                        (activeFile === null || activeFile === void 0 ? void 0 : activeFile.type) === "folder" ? "folder" : "file",
                        ".")),
                React.createElement("div", { className: "space-y-4 py-2 pb-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(input_1.Input, { placeholder: (activeFile === null || activeFile === void 0 ? void 0 : activeFile.type) === "folder" ? "Folder Name" : "File Name", value: newFileName, onChange: function (e) { return setNewFileName(e.target.value); } }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setRenameModalOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: renameFile }, "Rename")))),
        React.createElement(dialog_1.Dialog, { open: deleteModalOpen, onOpenChange: setDeleteModalOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Confirm Deletion"),
                    React.createElement(dialog_1.DialogDescription, null,
                        selectedFiles.length > 0
                            ? "Are you sure you want to delete " + selectedFiles.length + " selected item" + (selectedFiles.length !== 1 ? "s" : "") + "?"
                            : "Are you sure you want to delete \"" + (activeFile === null || activeFile === void 0 ? void 0 : activeFile.name) + "\"?",
                        "This action cannot be undone.")),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setDeleteModalOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { variant: "destructive", onClick: deleteFiles }, "Delete")))),
        React.createElement(dialog_1.Dialog, { open: moveModalOpen, onOpenChange: setMoveModalOpen },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null,
                        "Move ",
                        selectedFiles.length > 0 ? "Items" : activeFile === null || activeFile === void 0 ? void 0 : activeFile.name),
                    React.createElement(dialog_1.DialogDescription, null, "Select a destination folder.")),
                React.createElement(scroll_area_1.ScrollArea, { className: "h-[200px] rounded-md border p-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer", onClick: function () {
                                // Move logic would go here
                                setMoveModalOpen(false);
                            } },
                            React.createElement(lucide_react_1.Folder, { className: "h-5 w-5 text-blue-500" }),
                            React.createElement("span", null, "Home")),
                        files
                            .filter(function (file) { return file.type === "folder"; })
                            .map(function (folder) { return (React.createElement("div", { key: folder.id, className: "flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer", onClick: function () {
                                // Move logic would go here
                                setMoveModalOpen(false);
                            } },
                            React.createElement(lucide_react_1.Folder, { className: "h-5 w-5 text-blue-500" }),
                            React.createElement("span", null, folder.name))); }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setMoveModalOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { onClick: function () { return setMoveModalOpen(false); } }, "Move Here")))),
        React.createElement(dialog_1.Dialog, { open: previewModalOpen, onOpenChange: setPreviewModalOpen },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[600px]" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, { className: "flex items-center" },
                        getFileIcon((activeFile === null || activeFile === void 0 ? void 0 : activeFile.type) || "other"),
                        React.createElement("span", { className: "ml-2" }, activeFile === null || activeFile === void 0 ? void 0 : activeFile.name))),
                React.createElement("div", { className: "flex flex-col items-center justify-center p-4 min-h-[300px]" }, (activeFile === null || activeFile === void 0 ? void 0 : activeFile.type) === "image" ? (React.createElement("div", { className: "w-full h-[300px] bg-muted rounded-md flex items-center justify-center" },
                    React.createElement(lucide_react_1.ImageIcon, { className: "h-16 w-16 text-muted-foreground" }),
                    React.createElement("span", { className: "sr-only" }, "Image preview"))) : (activeFile === null || activeFile === void 0 ? void 0 : activeFile.type) === "pdf" ? (React.createElement("div", { className: "w-full h-[300px] bg-muted rounded-md flex items-center justify-center" },
                    React.createElement(lucide_react_1.FileIcon, { className: "h-16 w-16 text-red-500" }),
                    React.createElement("span", { className: "sr-only" }, "PDF preview"))) : (React.createElement("div", { className: "w-full h-[300px] bg-muted rounded-md flex items-center justify-center" },
                    React.createElement(lucide_react_1.FileText, { className: "h-16 w-16 text-muted-foreground" }),
                    React.createElement("span", { className: "sr-only" }, "File preview")))),
                React.createElement("div", { className: "flex justify-between items-center" },
                    React.createElement("div", null,
                        React.createElement(badge_1.Badge, { variant: "outline", className: "mr-2" }, (activeFile === null || activeFile === void 0 ? void 0 : activeFile.size) || "Unknown size"),
                        React.createElement(badge_1.Badge, { variant: "outline" }, date_fns_1.format((activeFile === null || activeFile === void 0 ? void 0 : activeFile.modified) || new Date(), "PPp"))),
                    React.createElement(button_1.Button, { onClick: function () { return setPreviewModalOpen(false); } }, "Close"))))));
}
exports["default"] = aksdata;
