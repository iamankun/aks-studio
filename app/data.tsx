"use client"

import { useState } from "react"
import { 
  ChevronRight,
  FileText,
  Folder,
  Grid,
  ImageIcon,
  List,
  MoreVertical,
  Plus,
  Search,
  Upload,
  File,
  FileIcon as FilePdf,
  FileImage,
  FileCode,
  Download,
  Trash2,
  Edit,
  Move,
  Eye,
  X,
} from "lucide-react"
import { format as formatDate } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { User } from "@/types/user"; // Giả sử bạn có định nghĩa User type
// Types
export type FileType = "folder" | "pdf" | "image" | "document" | "code" | "other"
export interface FileItem {
  id: string
  name: string
  type: FileType
  size: string
  items?: number
  modified: Date
  path: string[]
}
// Sample data
const sampleFiles: FileItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    size: "",
    items: 5,
    modified: new Date("2024-01-20"),
    path: ["Home"],
  },
  {
    id: "2",
    name: "Images",
    type: "folder",
    size: "",
    items: 12,
    modified: new Date("2024-01-18"),
    path: ["Home"],
  },
  {
    id: "3",
    name: "Project Files",
    type: "folder",
    size: "",
    items: 8,
    modified: new Date("2024-01-15"),
    path: ["Home"],
  },
  {
    id: "4",
    name: "Annual Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: new Date("2024-01-10"),
    path: ["Home"],
  },
  {
    id: "5",
    name: "Presentation.pdf",
    type: "pdf",
    size: "3.8 MB",
    modified: new Date("2024-01-05"),
    path: ["Home"],
  },
  {
    id: "6",
    name: "Profile Picture.jpg",
    type: "image",
    size: "1.2 MB",
    modified: new Date("2023-12-28"),
    path: ["Home"],
  },
  {
    id: "7",
    name: "Meeting Notes.docx",
    type: "document",
    size: "245 KB",
    modified: new Date("2023-12-20"),
    path: ["Home"],
  },
  {
    id: "8",
    name: "main.js",
    type: "code",
    size: "56 KB",
    modified: new Date("2023-12-15"),
    path: ["Home"],
  },
]

// Helper function to get file icon
const getFileIcon = (type: FileType) => {
  switch (type) {
    case "folder":
      return <Folder className="h-5 w-5 text-blue-500" />
    case "pdf":
      return <FilePdf className="h-5 w-5 text-red-500" />
    case "image":
      return <FileImage className="h-5 w-5 text-green-500" />
    case "document":
      return <FileText className="h-5 w-5 text-yellow-500" />
    case "code":
      return <FileCode className="h-5 w-5 text-purple-500" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
}

interface AksDataProps {
  currentUser: User | null; // Hoặc User nếu bạn chắc chắn luôn có user khi vào view này
}

export default function aksdata({ currentUser }: AksDataProps) {
  const [files, setFiles] = useState<FileItem[]>(sampleFiles)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [currentPath, setCurrentPath] = useState<string[]>(["Home"])
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [activeFile, setActiveFile] = useState<FileItem | null>(null)

  // Upload progress simulation
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFile, setUploadingFile] = useState("")

  // New folder name
  const [newFolderName, setNewFolderName] = useState("")
  const [newFileName, setNewFileName] = useState("")

  // Kiểm tra quyền Admin
  if (!currentUser || currentUser.role !== "Label Manager") { // Giả sử vai trò admin là "Label Manager"
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }
  // Filter files based on current path and search query
  const filteredFiles = files.filter((file) => {
    const pathMatch = JSON.stringify(file.path) === JSON.stringify(currentPath)
    const searchMatch = searchQuery === "" || file.name.toLowerCase().includes(searchQuery.toLowerCase())
    return pathMatch && searchMatch
  })

  // Handle file/folder selection
  const toggleSelection = (id: string) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]))
  }

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.map((file) => file.id))
    }
  }

  // Handle folder navigation
  const navigateToFolder = (folder: FileItem) => {
    if (folder.type === "folder") {
      setCurrentPath([...folder.path, folder.name])
      setSelectedFiles([])
    }
  }

  // Handle breadcrumb navigation
  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1))
    setSelectedFiles([])
  }

  // Handle file actions
  const handleFileAction = (action: string, file: FileItem) => {
    setActiveFile(file)

    switch (action) {
      case "open":
        if (file.type === "folder") {
          navigateToFolder(file)
        } else {
          setPreviewModalOpen(true)
        }
        break
      case "rename":
        setNewFileName(file.name)
        setRenameModalOpen(true)
        break
      case "move":
        setMoveModalOpen(true)
        break
      case "delete":
        setDeleteModalOpen(true)
        break
      case "preview":
        setPreviewModalOpen(true)
        break
      default:
        break
    }
  }

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    switch (action) {
      case "delete":
        setDeleteModalOpen(true)
        break
      case "move":
        setMoveModalOpen(true)
        break
      default:
        break
    }
  }

  // Simulate file upload
  const simulateUpload = (fileName: string) => {
    setUploadingFile(fileName)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)

          // Add the new file to the list
          const newFile: FileItem = {
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
            path: currentPath,
          }

          setFiles((prev) => [...prev, newFile])
          setUploadModalOpen(false)
          setUploadingFile("")
          return 0
        }
        return prev + 10
      })
    }, 300)
  }

  // Create new folder
  const createNewFolder = () => {
    if (newFolderName.trim() === "") return

    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: newFolderName,
      type: "folder",
      size: "",
      items: 0,
      modified: new Date(),
      path: currentPath,
    }

    setFiles((prev) => [...prev, newFolder])
    setNewFolderName("")
    setNewFolderModalOpen(false)
  }

  // Rename file/folder
  const renameFile = () => {
    if (!activeFile || newFileName.trim() === "") return

    setFiles((prev) => prev.map((file) => (file.id === activeFile.id ? { ...file, name: newFileName } : file)))

    setRenameModalOpen(false)
    setActiveFile(null)
  }

  // Delete file/folder
  const deleteFiles = () => {
    if (selectedFiles.length > 0) {
      setFiles((prev) => prev.filter((file) => !selectedFiles.includes(file.id)))
      setSelectedFiles([])
    } else if (activeFile) {
      setFiles((prev) => prev.filter((file) => file.id !== activeFile.id))
      setActiveFile(null)
    }

    setDeleteModalOpen(false)
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-md">
      <CardHeader className="p-4 border-b">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`hover:text-primary ${index === currentPath.length - 1 ? "font-medium text-primary" : ""}`}
                >
                  {path}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => setNewFolderModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>

            <Button size="sm" onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>

            <div className="hidden md:flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Bulk Actions Toolbar */}
      {selectedFiles.length > 0 && (
        <div className="bg-muted/50 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
              <X className="h-4 w-4 mr-2" />
              Deselect
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedFiles.length} item{selectedFiles.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("download")}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction("move")}>
              <Move className="h-4 w-4 mr-2" />
              Move
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <CardContent className="p-0">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grid")}>
          <TabsContent value="list" className="m-0">
            {filteredFiles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id} className={selectedFiles.includes(file.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleSelection(file.id)}
                          aria-label={`Select ${file.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={() => handleFileAction("open", file)}
                        >
                          {getFileIcon(file.type)}
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {file.type === "folder" ? `${file.items} item${file.items !== 1 ? "s" : ""}` : file.size}
                      </TableCell>
                      <TableCell>{file.modified ? formatDate(file.modified, "PPp") : "—"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFileAction("open", file)}>
                              {file.type === "folder" ? (
                                <>
                                  <Folder className="h-4 w-4 mr-2" />
                                  Open
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </>
                              )}
                            </DropdownMenuItem>

                            {file.type !== "folder" && (
                              <DropdownMenuItem onClick={() => handleFileAction("download", file)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            )}

                            {file.type === "folder" && (
                              <DropdownMenuItem onClick={() => handleFileAction("download", file)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download as ZIP
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => handleFileAction("rename", file)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleFileAction("move", file)}>
                              <Move className="h-4 w-4 mr-2" />
                              Move
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleFileAction("delete", file)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3">
                  <Folder className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No files found</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  {searchQuery
                    ? `No results found for "${searchQuery}". Try a different search term.`
                    : "This folder is empty. Upload a file or create a new folder."}
                </p>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setNewFolderModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                  <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grid" className="m-0">
            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group rounded-lg border bg-card p-2 transition-all hover:shadow-md ${selectedFiles.includes(file.id) ? "ring-2 ring-primary" : ""
                      }`}
                  >
                    <div className="absolute top-2 right-2">
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={() => toggleSelection(file.id)}
                        aria-label={`Select ${file.name}`}
                      />
                    </div>

                    <div
                      className="flex flex-col items-center p-4 cursor-pointer"
                      onClick={() => handleFileAction("open", file)}
                    >
                      <div className="mb-2 text-4xl">{getFileIcon(file.type)}</div>
                      <div className="text-center">
                        <p className="font-medium truncate w-full max-w-[120px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.type === "folder" ? `${file.items} item${file.items !== 1 ? "s" : ""}` : file.size}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleFileAction("open", file)}>
                            {file.type === "folder" ? (
                              <>
                                <Folder className="h-4 w-4 mr-2" />
                                Open
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </>
                            )}
                          </DropdownMenuItem>

                          {file.type !== "folder" && (
                            <DropdownMenuItem onClick={() => handleFileAction("download", file)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}

                          {file.type === "folder" && (
                            <DropdownMenuItem onClick={() => handleFileAction("download", file)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download as ZIP
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => handleFileAction("rename", file)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleFileAction("move", file)}>
                            <Move className="h-4 w-4 mr-2" />
                            Move
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleFileAction("delete", file)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-3">
                  <Folder className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No files found</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  {searchQuery
                    ? `No results found for "${searchQuery}". Try a different search term.`
                    : "This folder is empty. Upload a file or create a new folder."}
                </p>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setNewFolderModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                  <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>Drag and drop a file or click to browse.</DialogDescription>
          </DialogHeader>

          <div
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => {
              if (!uploadingFile) {
                simulateUpload("New Document.pdf")
              }
            }}
          >
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-1">Drag and drop your file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports PDF, DOCX, JPG, PNG, and more</p>
            </div>
          </div>

          {uploadingFile && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{uploadingFile}</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Modal */}
      <Dialog open={newFolderModalOpen} onOpenChange={setNewFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Input
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNewFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Modal */}
      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {activeFile?.type === "folder" ? "Folder" : "File"}</DialogTitle>
            <DialogDescription>
              Enter a new name for your {activeFile?.type === "folder" ? "folder" : "file"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Input
                placeholder={activeFile?.type === "folder" ? "Folder Name" : "File Name"}
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={renameFile}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {selectedFiles.length > 0
                ? `Are you sure you want to delete ${selectedFiles.length} selected item${selectedFiles.length !== 1 ? "s" : ""}?`
                : `Are you sure you want to delete "${activeFile?.name}"?`}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteFiles}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Modal */}
      <Dialog open={moveModalOpen} onOpenChange={setMoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move {selectedFiles.length > 0 ? "Items" : activeFile?.name}</DialogTitle>
            <DialogDescription>Select a destination folder.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-2">
              <div
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => {
                  // Move logic would go here
                  setMoveModalOpen(false)
                }}
              >
                <Folder className="h-5 w-5 text-blue-500" />
                <span>Home</span>
              </div>

              {files
                .filter((file) => file.type === "folder")
                .map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => {
                      // Move logic would go here
                      setMoveModalOpen(false)
                    }}
                  >
                    <Folder className="h-5 w-5 text-blue-500" />
                    <span>{folder.name}</span>
                  </div>
                ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setMoveModalOpen(false)}>Move Here</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {getFileIcon(activeFile?.type || "other")}
              <span className="ml-2">{activeFile?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 min-h-[300px]">
            {activeFile?.type === "image" ? (
              <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                <span className="sr-only">Image preview</span>
              </div>
            ) : activeFile?.type === "pdf" ? (
              <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                <FilePdf className="h-16 w-16 text-red-500" />
                <span className="sr-only">PDF preview</span>
              </div>
            ) : (
              <div className="w-full h-[300px] bg-muted rounded-md flex items-center justify-center">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <span className="sr-only">File preview</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <Badge variant="outline" className="mr-2">
                {activeFile?.size || "Unknown size"}
              </Badge>
              <Badge variant="outline">{formatDate(activeFile?.modified || new Date(), "PPp")}</Badge>
            </div>

            <Button onClick={() => setPreviewModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
