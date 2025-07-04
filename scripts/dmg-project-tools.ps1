# DMG Project Tools - Windows GUI
# Bộ công cụ quản lý dự án DMG với giao diện Windows
# Tạo bởi AnKun Studio - 2025

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Tải hàm từ generate-directory-tree.ps1
$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "generate-directory-tree.ps1"
. $scriptPath

# Tạo form chính
$form = New-Object System.Windows.Forms.Form
$form.Text = "DMG Project Tools"
$form.Size = New-Object System.Drawing.Size(800, 600)  # Tăng kích thước form
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Icon = [System.Drawing.SystemIcons]::Application

# Tạo TabControl để phân chia các chức năng
$tabControl = New-Object System.Windows.Forms.TabControl
$tabControl.Dock = [System.Windows.Forms.DockStyle]::Fill
$tabControl.Padding = New-Object System.Drawing.Point(10, 10)
$form.Controls.Add($tabControl)

# Tab 1: Tạo cây thư mục
$tabDirectoryTree = New-Object System.Windows.Forms.TabPage
$tabDirectoryTree.Text = "Cây thư mục"
$tabControl.Controls.Add($tabDirectoryTree)

# Tab 2: Quản lý tệp tin
$tabFileManager = New-Object System.Windows.Forms.TabPage
$tabFileManager.Text = "Quản lý tệp"
$tabControl.Controls.Add($tabFileManager)

# Tab 3: Dọn dẹp dự án
$tabCleanup = New-Object System.Windows.Forms.TabPage
$tabCleanup.Text = "Dọn dẹp dự án"
$tabControl.Controls.Add($tabCleanup)

# Tab 4: Quản lý dự án
$tabProjectManager = New-Object System.Windows.Forms.TabPage
$tabProjectManager.Text = "Quản lý dự án"
$tabControl.Controls.Add($tabProjectManager)

# Tab 5: Kiểm tra API
$tabApiTest = New-Object System.Windows.Forms.TabPage
$tabApiTest.Text = "Kiểm tra API"
$tabControl.Controls.Add($tabApiTest)

# Tab 6: Backup dự án
$tabBackup = New-Object System.Windows.Forms.TabPage
$tabBackup.Text = "Backup dự án"
$tabControl.Controls.Add($tabBackup)

# === Tab Cây thư mục ===
$panelDirTree = New-Object System.Windows.Forms.Panel
$panelDirTree.Dock = [System.Windows.Forms.DockStyle]::Fill
$panelDirTree.Padding = New-Object System.Windows.Forms.Padding(10)
$tabDirectoryTree.Controls.Add($panelDirTree)

$lblProjectPath = New-Object System.Windows.Forms.Label
$lblProjectPath.Text = "Đường dẫn dự án:"
$lblProjectPath.Location = New-Object System.Drawing.Point(10, 20)
$lblProjectPath.Size = New-Object System.Drawing.Size(120, 25)
$panelDirTree.Controls.Add($lblProjectPath)

$txtProjectPath = New-Object System.Windows.Forms.TextBox
$txtProjectPath.Location = New-Object System.Drawing.Point(140, 20)
$txtProjectPath.Size = New-Object System.Drawing.Size(330, 25)
$txtProjectPath.Text = [System.IO.Path]::GetFullPath((Join-Path -Path $PSScriptRoot -ChildPath ".."))
$panelDirTree.Controls.Add($txtProjectPath)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "..."
$btnBrowse.Location = New-Object System.Drawing.Point(480, 20)
$btnBrowse.Size = New-Object System.Drawing.Size(40, 25)
$panelDirTree.Controls.Add($btnBrowse)

$lblDepth = New-Object System.Windows.Forms.Label
$lblDepth.Text = "Độ sâu tối đa:"
$lblDepth.Location = New-Object System.Drawing.Point(10, 60)
$lblDepth.Size = New-Object System.Drawing.Size(120, 25)
$panelDirTree.Controls.Add($lblDepth)

$numDepth = New-Object System.Windows.Forms.NumericUpDown
$numDepth.Location = New-Object System.Drawing.Point(140, 60)
$numDepth.Size = New-Object System.Drawing.Size(100, 25)
$numDepth.Minimum = 1
$numDepth.Maximum = 10
$numDepth.Value = 3
$panelDirTree.Controls.Add($numDepth)

$chkExcludeCommon = New-Object System.Windows.Forms.CheckBox
$chkExcludeCommon.Text = "Loại bỏ thư mục phổ biến (.git, node_modules, ...)"
$chkExcludeCommon.Location = New-Object System.Drawing.Point(140, 100)
$chkExcludeCommon.Size = New-Object System.Drawing.Size(350, 25)
$chkExcludeCommon.Checked = $true
$panelDirTree.Controls.Add($chkExcludeCommon)

$lblExcludeDirs = New-Object System.Windows.Forms.Label
$lblExcludeDirs.Text = "Thư mục loại trừ:"
$lblExcludeDirs.Location = New-Object System.Drawing.Point(10, 140)
$lblExcludeDirs.Size = New-Object System.Drawing.Size(120, 25)
$panelDirTree.Controls.Add($lblExcludeDirs)

$txtExcludeDirs = New-Object System.Windows.Forms.TextBox
$txtExcludeDirs.Location = New-Object System.Drawing.Point(140, 140)
$txtExcludeDirs.Size = New-Object System.Drawing.Size(380, 25)
$txtExcludeDirs.Text = ".git, node_modules, .next, .vscode"
$panelDirTree.Controls.Add($txtExcludeDirs)

$lblExcludeFiles = New-Object System.Windows.Forms.Label
$lblExcludeFiles.Text = "Tệp loại trừ:"
$lblExcludeFiles.Location = New-Object System.Drawing.Point(10, 180)
$lblExcludeFiles.Size = New-Object System.Drawing.Size(120, 25)
$panelDirTree.Controls.Add($lblExcludeFiles)

$txtExcludeFiles = New-Object System.Windows.Forms.TextBox
$txtExcludeFiles.Location = New-Object System.Drawing.Point(140, 180)
$txtExcludeFiles.Size = New-Object System.Drawing.Size(380, 25)
$txtExcludeFiles.Text = "*.jpg, *.png, *.ico, *.svg, *.webp, *.lock, *.json"
$panelDirTree.Controls.Add($txtExcludeFiles)

$btnGenerate = New-Object System.Windows.Forms.Button
$btnGenerate.Text = "Tạo cây thư mục"
$btnGenerate.Location = New-Object System.Drawing.Point(140, 220)
$btnGenerate.Size = New-Object System.Drawing.Size(150, 35)
$btnGenerate.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$btnGenerate.ForeColor = [System.Drawing.Color]::White
$btnGenerate.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelDirTree.Controls.Add($btnGenerate)

$btnExport = New-Object System.Windows.Forms.Button
$btnExport.Text = "Xuất ra tệp"
$btnExport.Location = New-Object System.Drawing.Point(300, 220)
$btnExport.Size = New-Object System.Drawing.Size(150, 35)
$btnExport.BackColor = [System.Drawing.Color]::FromArgb(0, 153, 76)
$btnExport.ForeColor = [System.Drawing.Color]::White
$btnExport.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelDirTree.Controls.Add($btnExport)

$txtResult = New-Object System.Windows.Forms.TextBox
$txtResult.Location = New-Object System.Drawing.Point(10, 270)
$txtResult.Size = New-Object System.Drawing.Size(550, 150)
$txtResult.Multiline = $true
$txtResult.ScrollBars = "Vertical"
$txtResult.Font = New-Object System.Drawing.Font("Consolas", 9)
$txtResult.ReadOnly = $true
$panelDirTree.Controls.Add($txtResult)

# === Tab Quản lý tệp ===
$panelFileManager = New-Object System.Windows.Forms.Panel
$panelFileManager.Dock = [System.Windows.Forms.DockStyle]::Fill
$panelFileManager.Padding = New-Object System.Windows.Forms.Padding(10)
$tabFileManager.Controls.Add($panelFileManager)

$lblSearchPattern = New-Object System.Windows.Forms.Label
$lblSearchPattern.Text = "Tìm kiếm:"
$lblSearchPattern.Location = New-Object System.Drawing.Point(10, 20)
$lblSearchPattern.Size = New-Object System.Drawing.Size(120, 25)
$panelFileManager.Controls.Add($lblSearchPattern)

$txtSearchPattern = New-Object System.Windows.Forms.TextBox
$txtSearchPattern.Location = New-Object System.Drawing.Point(140, 20)
$txtSearchPattern.Size = New-Object System.Drawing.Size(250, 25)
$txtSearchPattern.Text = "*.md"
$panelFileManager.Controls.Add($txtSearchPattern)

$btnSearch = New-Object System.Windows.Forms.Button
$btnSearch.Text = "Tìm kiếm"
$btnSearch.Location = New-Object System.Drawing.Point(400, 20)
$btnSearch.Size = New-Object System.Drawing.Size(100, 25)
$panelFileManager.Controls.Add($btnSearch)

$lblFolderPath = New-Object System.Windows.Forms.Label
$lblFolderPath.Text = "Thư mục cần di chuyển đến:"
$lblFolderPath.Location = New-Object System.Drawing.Point(10, 60)
$lblFolderPath.Size = New-Object System.Drawing.Size(180, 25)
$panelFileManager.Controls.Add($lblFolderPath)

$txtFolderPath = New-Object System.Windows.Forms.TextBox
$txtFolderPath.Location = New-Object System.Drawing.Point(190, 60)
$txtFolderPath.Size = New-Object System.Drawing.Size(200, 25)
$txtFolderPath.Text = "docs"
$panelFileManager.Controls.Add($txtFolderPath)

$btnBrowseFolder = New-Object System.Windows.Forms.Button
$btnBrowseFolder.Text = "..."
$btnBrowseFolder.Location = New-Object System.Drawing.Point(400, 60)
$btnBrowseFolder.Size = New-Object System.Drawing.Size(40, 25)
$panelFileManager.Controls.Add($btnBrowseFolder)

$listFiles = New-Object System.Windows.Forms.ListView
$listFiles.Location = New-Object System.Drawing.Point(10, 100)
$listFiles.Size = New-Object System.Drawing.Size(550, 250)
$listFiles.View = [System.Windows.Forms.View]::Details
$listFiles.FullRowSelect = $true
$listFiles.CheckBoxes = $true
$listFiles.Columns.Add("Tên tệp", 200)
$listFiles.Columns.Add("Đường dẫn", 350)
$panelFileManager.Controls.Add($listFiles)

$btnMove = New-Object System.Windows.Forms.Button
$btnMove.Text = "Di chuyển tệp đã chọn"
$btnMove.Location = New-Object System.Drawing.Point(10, 360)
$btnMove.Size = New-Object System.Drawing.Size(180, 35)
$btnMove.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$btnMove.ForeColor = [System.Drawing.Color]::White
$btnMove.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelFileManager.Controls.Add($btnMove)

$btnSelectAll = New-Object System.Windows.Forms.Button
$btnSelectAll.Text = "Chọn tất cả"
$btnSelectAll.Location = New-Object System.Drawing.Point(200, 360)
$btnSelectAll.Size = New-Object System.Drawing.Size(120, 35)
$panelFileManager.Controls.Add($btnSelectAll)

$btnUnselectAll = New-Object System.Windows.Forms.Button
$btnUnselectAll.Text = "Bỏ chọn tất cả"
$btnUnselectAll.Location = New-Object System.Drawing.Point(330, 360)
$btnUnselectAll.Size = New-Object System.Drawing.Size(120, 35)
$panelFileManager.Controls.Add($btnUnselectAll)

# === Tab Dọn dẹp dự án ===
$panelCleanup = New-Object System.Windows.Forms.Panel
$panelCleanup.Dock = [System.Windows.Forms.DockStyle]::Fill
$panelCleanup.Padding = New-Object System.Windows.Forms.Padding(10)
$tabCleanup.Controls.Add($panelCleanup)

$lblCleanupInfo = New-Object System.Windows.Forms.Label
$lblCleanupInfo.Text = "Chọn các thư mục và tệp không cần thiết để dọn dẹp:"
$lblCleanupInfo.Location = New-Object System.Drawing.Point(10, 20)
$lblCleanupInfo.Size = New-Object System.Drawing.Size(550, 25)
$panelCleanup.Controls.Add($lblCleanupInfo)

$chkCleanupDist = New-Object System.Windows.Forms.CheckBox
$chkCleanupDist.Text = "Thư mục dist/ (tệp đã biên dịch)"
$chkCleanupDist.Location = New-Object System.Drawing.Point(20, 60)
$chkCleanupDist.Size = New-Object System.Drawing.Size(300, 25)
$panelCleanup.Controls.Add($chkCleanupDist)

$chkCleanupAkscms = New-Object System.Windows.Forms.CheckBox
$chkCleanupAkscms.Text = "Thư mục akscms/ (phiên bản cũ)"
$chkCleanupAkscms.Location = New-Object System.Drawing.Point(20, 90)
$chkCleanupAkscms.Size = New-Object System.Drawing.Size(300, 25)
$panelCleanup.Controls.Add($chkCleanupAkscms)

$chkCleanupBackup = New-Object System.Windows.Forms.CheckBox
$chkCleanupBackup.Text = "Tệp backup (*.backup, *.backup.js)"
$chkCleanupBackup.Location = New-Object System.Drawing.Point(20, 120)
$chkCleanupBackup.Size = New-Object System.Drawing.Size(300, 25)
$panelCleanup.Controls.Add($chkCleanupBackup)

$chkCleanupLogs = New-Object System.Windows.Forms.CheckBox
$chkCleanupLogs.Text = "Tệp logs cũ (*.log, trừ 10 tệp gần nhất)"
$chkCleanupLogs.Location = New-Object System.Drawing.Point(20, 150)
$chkCleanupLogs.Size = New-Object System.Drawing.Size(300, 25)
$panelCleanup.Controls.Add($chkCleanupLogs)

$chkCleanupTest = New-Object System.Windows.Forms.CheckBox
$chkCleanupTest.Text = "Thư mục test không cần thiết (app/test-*, app/video-test*)"
$chkCleanupTest.Location = New-Object System.Drawing.Point(20, 180)
$chkCleanupTest.Size = New-Object System.Drawing.Size(400, 25)
$panelCleanup.Controls.Add($chkCleanupTest)

$chkCleanupLiveblocks = New-Object System.Windows.Forms.CheckBox
$chkCleanupLiveblocks.Text = "Thư mục liveblocks-starter-kit/ (demo)"
$chkCleanupLiveblocks.Location = New-Object System.Drawing.Point(20, 210)
$chkCleanupLiveblocks.Size = New-Object System.Drawing.Size(300, 25)
$panelCleanup.Controls.Add($chkCleanupLiveblocks)

$btnScanSize = New-Object System.Windows.Forms.Button
$btnScanSize.Text = "Quét kích thước"
$btnScanSize.Location = New-Object System.Drawing.Point(20, 250)
$btnScanSize.Size = New-Object System.Drawing.Size(150, 35)
$panelCleanup.Controls.Add($btnScanSize)

$btnCleanup = New-Object System.Windows.Forms.Button
$btnCleanup.Text = "Dọn dẹp đã chọn"
$btnCleanup.Location = New-Object System.Drawing.Point(180, 250)
$btnCleanup.Size = New-Object System.Drawing.Size(150, 35)
$btnCleanup.BackColor = [System.Drawing.Color]::FromArgb(204, 0, 0)
$btnCleanup.ForeColor = [System.Drawing.Color]::White
$btnCleanup.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelCleanup.Controls.Add($btnCleanup)

$txtCleanupResult = New-Object System.Windows.Forms.TextBox
$txtCleanupResult.Location = New-Object System.Drawing.Point(20, 300)
$txtCleanupResult.Size = New-Object System.Drawing.Size(530, 120)
$txtCleanupResult.Multiline = $true
$txtCleanupResult.ScrollBars = "Vertical"
$txtCleanupResult.ReadOnly = $true
$panelCleanup.Controls.Add($txtCleanupResult)

# === Tab Quản lý dự án ===
$panelProjectManager = New-Object System.Windows.Forms.Panel
$panelProjectManager.Dock = [System.Windows.Forms.DockStyle]::Fill
$panelProjectManager.Padding = New-Object System.Windows.Forms.Padding(10)
$tabProjectManager.Controls.Add($panelProjectManager)

$lblProjectName = New-Object System.Windows.Forms.Label
$lblProjectName.Text = "Tên dự án:"
$lblProjectName.Location = New-Object System.Drawing.Point(10, 20)
$lblProjectName.Size = New-Object System.Drawing.Size(120, 25)
$panelProjectManager.Controls.Add($lblProjectName)

$txtProjectName = New-Object System.Windows.Forms.TextBox
$txtProjectName.Location = New-Object System.Drawing.Point(140, 20)
$txtProjectName.Size = New-Object System.Drawing.Size(330, 25)
$txtProjectName.Text = "MyProject"
$panelProjectManager.Controls.Add($txtProjectName)

$lblProjectDesc = New-Object System.Windows.Forms.Label
$lblProjectDesc.Text = "Mô tả dự án:"
$lblProjectDesc.Location = New-Object System.Drawing.Point(10, 60)
$lblProjectDesc.Size = New-Object System.Drawing.Size(120, 25)
$panelProjectManager.Controls.Add($lblProjectDesc)

$txtProjectDesc = New-Object System.Windows.Forms.TextBox
$txtProjectDesc.Location = New-Object System.Drawing.Point(140, 60)
$txtProjectDesc.Size = New-Object System.Drawing.Size(330, 25)
$txtProjectDesc.Text = "Mô tả ngắn gọn về dự án của bạn"
$panelProjectManager.Controls.Add($txtProjectDesc)

$lblProjectVersion = New-Object System.Windows.Forms.Label
$lblProjectVersion.Text = "Phiên bản:"
$lblProjectVersion.Location = New-Object System.Drawing.Point(10, 100)
$lblProjectVersion.Size = New-Object System.Drawing.Size(120, 25)
$panelProjectManager.Controls.Add($lblProjectVersion)

$txtProjectVersion = New-Object System.Windows.Forms.TextBox
$txtProjectVersion.Location = New-Object System.Drawing.Point(140, 100)
$txtProjectVersion.Size = New-Object System.Drawing.Size(100, 25)
$txtProjectVersion.Text = "1.0.0"
$panelProjectManager.Controls.Add($txtProjectVersion)

$btnCreateProject = New-Object System.Windows.Forms.Button
$btnCreateProject.Text = "Tạo dự án mới"
$btnCreateProject.Location = New-Object System.Drawing.Point(140, 140)
$btnCreateProject.Size = New-Object System.Drawing.Size(150, 35)
$btnCreateProject.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$btnCreateProject.ForeColor = [System.Drawing.Color]::White
$btnCreateProject.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelProjectManager.Controls.Add($btnCreateProject)

$btnLoadProject = New-Object System.Windows.Forms.Button
$btnLoadProject.Text = "Tải dự án"
$btnLoadProject.Location = New-Object System.Drawing.Point(300, 140)
$btnLoadProject.Size = New-Object System.Drawing.Size(150, 35)
$btnLoadProject.BackColor = [System.Drawing.Color]::FromArgb(0, 153, 76)
$btnLoadProject.ForeColor = [System.Drawing.Color]::White
$btnLoadProject.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelProjectManager.Controls.Add($btnLoadProject)

$btnSaveProject = New-Object System.Windows.Forms.Button
$btnSaveProject.Text = "Lưu dự án"
$btnSaveProject.Location = New-Object System.Drawing.Point(460, 140)
$btnSaveProject.Size = New-Object System.Drawing.Size(150, 35)
$btnSaveProject.BackColor = [System.Drawing.Color]::FromArgb(255, 193, 7)
$btnSaveProject.ForeColor = [System.Drawing.Color]::White
$btnSaveProject.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelProjectManager.Controls.Add($btnSaveProject)

$txtProjectInfo = New-Object System.Windows.Forms.TextBox
$txtProjectInfo.Location = New-Object System.Drawing.Point(10, 200)
$txtProjectInfo.Size = New-Object System.Drawing.Size(550, 150)
$txtProjectInfo.Multiline = $true
$txtProjectInfo.ScrollBars = "Vertical"
$txtProjectInfo.Font = New-Object System.Drawing.Font("Consolas", 9)
$txtProjectInfo.ReadOnly = $true
$panelProjectManager.Controls.Add($txtProjectInfo)

# === Tab Kiểm tra API ===
$panelApiTest = New-Object System.Windows.Forms.Panel
$panelApiTest.Dock = [System.Windows.Forms.DockStyle]::Fill
$panelApiTest.Padding = New-Object System.Windows.Forms.Padding(10)
$tabApiTest.Controls.Add($panelApiTest)

$lblApiUrl = New-Object System.Windows.Forms.Label
$lblApiUrl.Text = "URL API:"
$lblApiUrl.Location = New-Object System.Drawing.Point(10, 20)
$lblApiUrl.Size = New-Object System.Drawing.Size(120, 25)
$panelApiTest.Controls.Add($lblApiUrl)

$txtApiUrl = New-Object System.Windows.Forms.TextBox
$txtApiUrl.Location = New-Object System.Drawing.Point(140, 20)
$txtApiUrl.Size = New-Object System.Drawing.Size(330, 25)
$txtApiUrl.Text = "https://api.example.com"
$panelApiTest.Controls.Add($txtApiUrl)

$lblApiMethod = New-Object System.Windows.Forms.Label
$lblApiMethod.Text = "Phương thức:"
$lblApiMethod.Location = New-Object System.Drawing.Point(10, 60)
$lblApiMethod.Size = New-Object System.Drawing.Size(120, 25)
$panelApiTest.Controls.Add($lblApiMethod)

$cmbApiMethod = New-Object System.Windows.Forms.ComboBox
$cmbApiMethod.Location = New-Object System.Drawing.Point(140, 60)
$cmbApiMethod.Size = New-Object System.Drawing.Size(100, 25)
$cmbApiMethod.Items.AddRange(@("GET", "POST", "PUT", "DELETE"))
$cmbApiMethod.SelectedItem = "GET"
$panelApiTest.Controls.Add($cmbApiMethod)

$lblApiHeaders = New-Object System.Windows.Forms.Label
$lblApiHeaders.Text = "Headers (JSON):"
$lblApiHeaders.Location = New-Object System.Drawing.Point(10, 100)
$lblApiHeaders.Size = New-Object System.Drawing.Size(120, 25)
$panelApiTest.Controls.Add($lblApiHeaders)

$txtApiHeaders = New-Object System.Windows.Forms.TextBox
$txtApiHeaders.Location = New-Object System.Drawing.Point(140, 100)
$txtApiHeaders.Size = New-Object System.Drawing.Size(380, 25)
$txtApiHeaders.Text = '{"Content-Type": "application/json"}'
$panelApiTest.Controls.Add($txtApiHeaders)

$lblApiBody = New-Object System.Windows.Forms.Label
$lblApiBody.Text = "Nội dung (JSON):"
$lblApiBody.Location = New-Object System.Drawing.Point(10, 140)
$lblApiBody.Size = New-Object System.Drawing.Size(120, 25)
$panelApiTest.Controls.Add($lblApiBody)

$txtApiBody = New-Object System.Windows.Forms.TextBox
$txtApiBody.Location = New-Object System.Drawing.Point(140, 140)
$txtApiBody.Size = New-Object System.Drawing.Size(380, 25)
$txtApiBody.Text = '{"key": "value"}'
$panelApiTest.Controls.Add($txtApiBody)

$btnSendRequest = New-Object System.Windows.Forms.Button
$btnSendRequest.Text = "Gửi yêu cầu"
$btnSendRequest.Location = New-Object System.Drawing.Point(140, 180)
$btnSendRequest.Size = New-Object System.Drawing.Size(150, 35)
$btnSendRequest.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$btnSendRequest.ForeColor = [System.Drawing.Color]::White
$btnSendRequest.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelApiTest.Controls.Add($btnSendRequest)

$txtApiResult = New-Object System.Windows.Forms.TextBox
$txtApiResult.Location = New-Object System.Drawing.Point(10, 230)
$txtApiResult.Size = New-Object System.Drawing.Size(550, 150)
$txtApiResult.Multiline = $true
$txtApiResult.ScrollBars = "Vertical"
$txtApiResult.Font = New-Object System.Drawing.Font("Consolas", 9)
$txtApiResult.ReadOnly = $true
$panelApiTest.Controls.Add($txtApiResult)

# === Tab Backup dự án ===
$panelBackup = New-Object System.Windows.Forms.Panel
$panelBackup.Dock = [System.Windows.Forms.DockStyle]::Fill
$panelBackup.Padding = New-Object System.Windows.Forms.Padding(10)
$tabBackup.Controls.Add($panelBackup)

$lblBackupPath = New-Object System.Windows.Forms.Label
$lblBackupPath.Text = "Thư mục sao lưu:"
$lblBackupPath.Location = New-Object System.Drawing.Point(10, 20)
$lblBackupPath.Size = New-Object System.Drawing.Size(120, 25)
$panelBackup.Controls.Add($lblBackupPath)

$txtBackupPath = New-Object System.Windows.Forms.TextBox
$txtBackupPath.Location = New-Object System.Drawing.Point(140, 20)
$txtBackupPath.Size = New-Object System.Drawing.Size(330, 25)
$txtBackupPath.Text = "backup"
$panelBackup.Controls.Add($txtBackupPath)

$btnBrowseBackup = New-Object System.Windows.Forms.Button
$btnBrowseBackup.Text = "..."
$btnBrowseBackup.Location = New-Object System.Drawing.Point(480, 20)
$btnBrowseBackup.Size = New-Object System.Drawing.Size(40, 25)
$panelBackup.Controls.Add($btnBrowseBackup)

$lblBackupFiles = New-Object System.Windows.Forms.Label
$lblBackupFiles.Text = "Tệp sao lưu:"
$lblBackupFiles.Location = New-Object System.Drawing.Point(10, 60)
$lblBackupFiles.Size = New-Object System.Drawing.Size(120, 25)
$panelBackup.Controls.Add($lblBackupFiles)

$txtBackupFiles = New-Object System.Windows.Forms.TextBox
$txtBackupFiles.Location = New-Object System.Drawing.Point(140, 60)
$txtBackupFiles.Size = New-Object System.Drawing.Size(380, 25)
$txtBackupFiles.Text = "*.zip, *.tar.gz"
$panelBackup.Controls.Add($txtBackupFiles)

$btnBackup = New-Object System.Windows.Forms.Button
$btnBackup.Text = "Sao lưu ngay"
$btnBackup.Location = New-Object System.Drawing.Point(140, 100)
$btnBackup.Size = New-Object System.Drawing.Size(150, 35)
$btnBackup.BackColor = [System.Drawing.Color]::FromArgb(0, 153, 76)
$btnBackup.ForeColor = [System.Drawing.Color]::White
$btnBackup.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelBackup.Controls.Add($btnBackup)

$btnRestore = New-Object System.Windows.Forms.Button
$btnRestore.Text = "Khôi phục từ sao lưu"
$btnRestore.Location = New-Object System.Drawing.Point(300, 100)
$btnRestore.Size = New-Object System.Drawing.Size(150, 35)
$btnRestore.BackColor = [System.Drawing.Color]::FromArgb(255, 193, 7)
$btnRestore.ForeColor = [System.Drawing.Color]::White
$btnRestore.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$panelBackup.Controls.Add($btnRestore)

$txtBackupResult = New-Object System.Windows.Forms.TextBox
$txtBackupResult.Location = New-Object System.Drawing.Point(10, 150)
$txtBackupResult.Size = New-Object System.Drawing.Size(550, 150)
$txtBackupResult.Multiline = $true
$txtBackupResult.ScrollBars = "Vertical"
$txtBackupResult.Font = New-Object System.Drawing.Font("Consolas", 9)
$txtBackupResult.ReadOnly = $true
$panelBackup.Controls.Add($txtBackupResult)

# Xử lý sự kiện
$btnBrowse.Add_Click({
        $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
        $folderBrowser.Description = "Chọn thư mục dự án"
        $folderBrowser.SelectedPath = $txtProjectPath.Text
    
        if ($folderBrowser.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            $txtProjectPath.Text = $folderBrowser.SelectedPath
        }
    })

$btnGenerate.Add_Click({
        $projectPath = $txtProjectPath.Text
        $depth = [int]$numDepth.Value
        $excludeDirs = if ($chkExcludeCommon.Checked) { $txtExcludeDirs.Text.Split(",").Trim() } else { @() }
        $excludeFiles = $txtExcludeFiles.Text.Split(",").Trim()
    
        $txtResult.Clear()
        $txtResult.Text = "DMG`r`n"
    
        try {
            $result = Get-DirectoryTree -Path $projectPath -Depth $depth -ExcludeDirs $excludeDirs -ExcludeFiles $excludeFiles
            foreach ($line in $result) {
                $txtResult.AppendText($line + "`r`n")
            }
            [System.Windows.Forms.MessageBox]::Show("Đã tạo cây thư mục thành công!", "Thông báo", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        }
        catch {
            [System.Windows.Forms.MessageBox]::Show("Lỗi: $_", "Lỗi", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
        }
    })

$btnExport.Add_Click({
        $saveFileDialog = New-Object System.Windows.Forms.SaveFileDialog
        $saveFileDialog.Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*"
        $saveFileDialog.Title = "Lưu cây thư mục"
        $saveFileDialog.FileName = "directory-tree.txt"
    
        if ($saveFileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            $projectPath = $txtProjectPath.Text
            $depth = [int]$numDepth.Value
            $excludeDirs = if ($chkExcludeCommon.Checked) { $txtExcludeDirs.Text.Split(",").Trim() } else { @() }
            $excludeFiles = $txtExcludeFiles.Text.Split(",").Trim()
        
            try {
                $outputFile = Export-DirectoryTree -Path $projectPath -Depth $depth -OutputFile $saveFileDialog.FileName -ExcludeDirs $excludeDirs -ExcludeFiles $excludeFiles
                [System.Windows.Forms.MessageBox]::Show("Đã xuất cây thư mục ra file: $outputFile", "Thông báo", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
            }
            catch {
                [System.Windows.Forms.MessageBox]::Show("Lỗi khi xuất file: $_", "Lỗi", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
            }
        }
    })

$btnSearch.Add_Click({
        $listFiles.Items.Clear()
        $projectPath = $txtProjectPath.Text
        $pattern = $txtSearchPattern.Text
    
        try {
            $files = Get-ChildItem -Path $projectPath -Recurse -File -Filter $pattern -ErrorAction Stop
            foreach ($file in $files) {
                $item = New-Object System.Windows.Forms.ListViewItem($file.Name)
                $item.SubItems.Add($file.FullName)
                $item.Tag = $file.FullName
                $listFiles.Items.Add($item)
            }
        
            if ($files.Count -eq 0) {
                [System.Windows.Forms.MessageBox]::Show("Không tìm thấy tệp nào phù hợp.", "Thông báo", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
            }
        }
        catch {
            [System.Windows.Forms.MessageBox]::Show("Lỗi khi tìm kiếm: $_", "Lỗi", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
        }
    })

$btnBrowseFolder.Add_Click({
        $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
        $folderBrowser.Description = "Chọn thư mục đích"
        $folderBrowser.SelectedPath = Join-Path -Path $txtProjectPath.Text -ChildPath $txtFolderPath.Text
    
        if ($folderBrowser.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            $txtFolderPath.Text = (Resolve-Path -Path $folderBrowser.SelectedPath -Relative)
        }
    })

$btnSelectAll.Add_Click({
        for ($i = 0; $i -lt $listFiles.Items.Count; $i++) {
            $listFiles.Items[$i].Checked = $true
        }
    })

$btnUnselectAll.Add_Click({
        for ($i = 0; $i -lt $listFiles.Items.Count; $i++) {
            $listFiles.Items[$i].Checked = $false
        }
    })

$btnMove.Add_Click({
        $destFolder = Join-Path -Path $txtProjectPath.Text -ChildPath $txtFolderPath.Text
        $selectedFiles = @()
    
        # Lấy danh sách tệp đã chọn
        for ($i = 0; $i -lt $listFiles.Items.Count; $i++) {
            if ($listFiles.Items[$i].Checked) {
                $selectedFiles += $listFiles.Items[$i].Tag
            }
        }
    
        if ($selectedFiles.Count -eq 0) {
            [System.Windows.Forms.MessageBox]::Show("Vui lòng chọn ít nhất một tệp để di chuyển.", "Thông báo", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
            return
        }
    
        $confirm = [System.Windows.Forms.MessageBox]::Show("Bạn có chắc chắn muốn di chuyển $($selectedFiles.Count) tệp đến thư mục $destFolder không?", "Xác nhận", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Question)
    
        if ($confirm -eq [System.Windows.Forms.DialogResult]::Yes) {
            try {
                # Tạo thư mục đích nếu chưa tồn tại
                if (-not (Test-Path -Path $destFolder)) {
                    New-Item -Path $destFolder -ItemType Directory -Force | Out-Null
                }
            
                $moved = 0
                $errors = 0
            
                foreach ($file in $selectedFiles) {
                    try {
                        $destFile = Join-Path -Path $destFolder -ChildPath (Split-Path -Path $file -Leaf)
                        Move-Item -Path $file -Destination $destFile -Force
                        $moved++
                    }
                    catch {
                        $errors++
                    }
                }
            
                [System.Windows.Forms.MessageBox]::Show("Đã di chuyển $moved tệp thành công. Gặp lỗi khi di chuyển $errors tệp.", "Kết quả", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
            
                # Làm mới danh sách
                $btnSearch.PerformClick()
            }
            catch {
                [System.Windows.Forms.MessageBox]::Show("Lỗi khi di chuyển: $_", "Lỗi", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
            }
        }
    })

$btnScanSize.Add_Click({
        $txtCleanupResult.Clear()
        $projectPath = $txtProjectPath.Text
    
        $txtCleanupResult.AppendText("Đang quét dung lượng... vui lòng đợi.`r`n")
    
        try {
            # Quét dung lượng thư mục dist
            if (Test-Path -Path (Join-Path -Path $projectPath -ChildPath "dist")) {
                $distSize = (Get-ChildItem -Path (Join-Path -Path $projectPath -ChildPath "dist") -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                $txtCleanupResult.AppendText("Thư mục dist/: {0:N2} MB`r`n" -f $distSize)
            }
        
            # Quét dung lượng thư mục akscms
            if (Test-Path -Path (Join-Path -Path $projectPath -ChildPath "akscms")) {
                $akscmsSize = (Get-ChildItem -Path (Join-Path -Path $projectPath -ChildPath "akscms") -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                $txtCleanupResult.AppendText("Thư mục akscms/: {0:N2} MB`r`n" -f $akscmsSize)
            }
        
            # Quét dung lượng tệp backup
            $backupFiles = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object { $_.Name -like "*.backup*" }
            $backupSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum / 1MB
            $txtCleanupResult.AppendText("Tệp backup: {0:N2} MB ({1} tệp)`r`n" -f $backupSize, $backupFiles.Count)
        
            # Quét dung lượng tệp log
            $logFiles = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object { $_.Extension -eq ".log" }
            $logSize = ($logFiles | Measure-Object -Property Length -Sum).Sum / 1MB
            $txtCleanupResult.AppendText("Tệp log: {0:N2} MB ({1} tệp)`r`n" -f $logSize, $logFiles.Count)
        
            # Quét dung lượng thư mục test
            $testDirs = Get-ChildItem -Path (Join-Path -Path $projectPath -ChildPath "app") -Directory | Where-Object { $_.Name -like "test*" -or $_.Name -like "video-test*" }
            $testSize = 0
            foreach ($dir in $testDirs) {
                $dirSize = (Get-ChildItem -Path $dir.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                $testSize += $dirSize
                $txtCleanupResult.AppendText("- $($dir.Name)/: {0:N2} MB`r`n" -f $dirSize)
            }
            $txtCleanupResult.AppendText("Tổng thư mục test: {0:N2} MB`r`n" -f $testSize)
        
            # Quét dung lượng thư mục liveblocks
            if (Test-Path -Path (Join-Path -Path $projectPath -ChildPath "liveblocks-starter-kit")) {
                $liveblocksSize = (Get-ChildItem -Path (Join-Path -Path $projectPath -ChildPath "liveblocks-starter-kit") -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                $txtCleanupResult.AppendText("Thư mục liveblocks-starter-kit/: {0:N2} MB`r`n" -f $liveblocksSize)
            }
        
            $totalSize = $distSize + $akscmsSize + $backupSize + $logSize + $testSize + $liveblocksSize
            $txtCleanupResult.AppendText("`r`nTổng dung lượng có thể dọn dẹp: {0:N2} MB`r`n" -f $totalSize)
        }
        catch {
            $txtCleanupResult.AppendText("Lỗi khi quét dung lượng: $_`r`n")
        }
    })

$btnCleanup.Add_Click({
        $confirm = [System.Windows.Forms.MessageBox]::Show("CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn các tệp và thư mục đã chọn. Bạn có muốn tiếp tục không?", "Xác nhận xóa", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Warning)
    
        if ($confirm -eq [System.Windows.Forms.DialogResult]::Yes) {
            $projectPath = $txtProjectPath.Text
            $txtCleanupResult.Clear()
            $txtCleanupResult.AppendText("Bắt đầu dọn dẹp...`r`n")
        
            try {
                # Xóa thư mục dist
                if ($chkCleanupDist.Checked -and (Test-Path -Path (Join-Path -Path $projectPath -ChildPath "dist"))) {
                    Remove-Item -Path (Join-Path -Path $projectPath -ChildPath "dist") -Recurse -Force
                    $txtCleanupResult.AppendText("✓ Đã xóa thư mục dist/`r`n")
                }
            
                # Xóa thư mục akscms
                if ($chkCleanupAkscms.Checked -and (Test-Path -Path (Join-Path -Path $projectPath -ChildPath "akscms"))) {
                    Remove-Item -Path (Join-Path -Path $projectPath -ChildPath "akscms") -Recurse -Force
                    $txtCleanupResult.AppendText("✓ Đã xóa thư mục akscms/`r`n")
                }
            
                # Xóa tệp backup
                if ($chkCleanupBackup.Checked) {
                    $backupFiles = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object { $_.Name -like "*.backup*" }
                    $count = 0
                    foreach ($file in $backupFiles) {
                        Remove-Item -Path $file.FullName -Force
                        $count++
                    }
                    $txtCleanupResult.AppendText("✓ Đã xóa $count tệp backup`r`n")
                }
            
                # Xóa tệp log cũ
                if ($chkCleanupLogs.Checked) {
                    $logFiles = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object { $_.Extension -eq ".log" } | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10
                    $count = 0
                    foreach ($file in $logFiles) {
                        Remove-Item -Path $file.FullName -Force
                        $count++
                    }
                    $txtCleanupResult.AppendText("✓ Đã xóa $count tệp log cũ`r`n")
                }
            
                # Xóa thư mục test
                if ($chkCleanupTest.Checked) {
                    $testDirs = Get-ChildItem -Path (Join-Path -Path $projectPath -ChildPath "app") -Directory | Where-Object { $_.Name -like "test*" -or $_.Name -like "video-test*" }
                    $count = 0
                    foreach ($dir in $testDirs) {
                        Remove-Item -Path $dir.FullName -Recurse -Force
                        $count++
                    }
                    $txtCleanupResult.AppendText("✓ Đã xóa $count thư mục test`r`n")
                }
            
                # Xóa thư mục liveblocks
                if ($chkCleanupLiveblocks.Checked -and (Test-Path -Path (Join-Path -Path $projectPath -ChildPath "liveblocks-starter-kit"))) {
                    Remove-Item -Path (Join-Path -Path $projectPath -ChildPath "liveblocks-starter-kit") -Recurse -Force
                    $txtCleanupResult.AppendText("✓ Đã xóa thư mục liveblocks-starter-kit/`r`n")
                }
            
                $txtCleanupResult.AppendText("`r`n✓ Dọn dẹp hoàn tất!`r`n")
            }
            catch {
                $txtCleanupResult.AppendText("❌ Lỗi khi dọn dẹp: $_`r`n")
            }
        }
    })

$btnCreateProject.Add_Click({
        $projectName = $txtProjectName.Text
        $projectDesc = $txtProjectDesc.Text
        $projectVersion = $txtProjectVersion.Text
        $projectPath = Join-Path -Path $PSScriptRoot -ChildPath "..\$projectName"
    
        # Tạo thư mục dự án nếu chưa tồn tại
        if (-not (Test-Path -Path $projectPath)) {
            New-Item -Path $projectPath -ItemType Directory -Force | Out-Null
        }
    
        # Tạo tệp cấu hình dự án
        $configFile = Join-Path -Path $projectPath -ChildPath "project.json"
        $config = @{
            Name        = $projectName
            Description = $projectDesc
            Version     = $projectVersion
            Path        = $projectPath
        } | ConvertTo-Json -Depth 10
        Set-Content -Path $configFile -Value $config -Encoding UTF8
    
        [System.Windows.Forms.MessageBox]::Show("Đã tạo dự án mới: $projectName`r`nĐường dẫn: $projectPath", "Thông báo", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    })

$btnLoadProject.Add_Click({
        $openFileDialog = New-Object System.Windows.Forms.OpenFileDialog
        $openFileDialog.Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*"
        $openFileDialog.Title = "Tải dự án"
    
        if ($openFileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            $configFile = $openFileDialog.FileName
            $config = Get-Content -Path $configFile -Raw | ConvertFrom-Json
        
            $txtProjectName.Text = $config.Name
            $txtProjectDesc.Text = $config.Description
            $txtProjectVersion.Text = $config.Version
            $txtProjectPath.Text = $config.Path
        
            [System.Windows.Forms.MessageBox]::Show("Đã tải dự án: $($config.Name)", "Thông báo", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        }
    })

$btnSaveProject.Add_Click({
        $projectName = $txtProjectName.Text
        $projectDesc = $txtProjectDesc.Text
        $projectVersion = $txtProjectVersion.Text
        $projectPath = Join-Path -Path $PSScriptRoot -ChildPath "..\$projectName"
    
        # Kiểm tra thư mục dự án
        if (-not (Test-Path -Path $projectPath)) {
            [System.Windows.Forms.MessageBox]::Show("Thư mục dự án không tồn tại: $projectPath`r`nVui lòng tạo mới hoặc tải dự án khác.", "Lỗi", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
            return
        }
    
        # Cập nhật tệp cấu hình dự án
        $configFile = Join-Path -Path $projectPath -ChildPath "project.json"
        $config = @{
            Name        = $projectName
            Description = $projectDesc
            Version     = $projectVersion
            Path        = $projectPath
        } | ConvertTo-Json -Depth 10
        Set-Content -Path $configFile -Value $config -Encoding UTF8
    
        [System.Windows.Forms.MessageBox]::Show("Đã lưu dự án: $projectName", "Thông báo", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    })

$btnSendRequest.Add_Click({
        $apiUrl = $txtApiUrl.Text
        $httpMethod = $cmbApiMethod.SelectedItem
        $headers = $txtApiHeaders.Text | ConvertFrom-Json
        $body = $txtApiBody.Text | ConvertFrom-Json
    
        try {
            $response = Invoke-RestMethod -Uri $apiUrl -Method $httpMethod -Headers $headers -Body $body -ErrorAction Stop
            $txtApiResult.Text = $response | ConvertTo-Json -Depth 10
        }
        catch {
            $txtApiResult.Text = "Lỗi: $_"
        }
    })

$btnBrowseBackup.Add_Click({
        $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
        $folderBrowser.Description = "Chọn thư mục sao lưu"
        $folderBrowser.SelectedPath = $txtBackupPath.Text
    
        if ($folderBrowser.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            $txtBackupPath.Text = $folderBrowser.SelectedPath
        }
    })

$btnBackup.Add_Click({
        $backupPath = $txtBackupPath.Text
        $backupFiles = $txtBackupFiles.Text.Split(",").Trim()
    
        # Tạo thư mục sao lưu nếu chưa tồn tại
        if (-not (Test-Path -Path $backupPath)) {
            New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
        }
    
        $txtBackupResult.Clear()
        $txtBackupResult.AppendText("Đang sao lưu...`r`n")
    
        try {
            foreach ($pattern in $backupFiles) {
                $files = Get-ChildItem -Path $PSScriptRoot -Recurse -File -Filter $pattern -ErrorAction Stop
                foreach ($file in $files) {
                    $destFile = Join-Path -Path $backupPath -ChildPath $file.Name
                    Copy-Item -Path $file.FullName -Destination $destFile -Force
                    $txtBackupResult.AppendText("✓ Đã sao lưu: $($file.FullName) -> $destFile`r`n")
                }
            }
        
            $txtBackupResult.AppendText("`r`n✓ Sao lưu hoàn tất!`r`n")
        }
        catch {
            $txtBackupResult.AppendText("❌ Lỗi khi sao lưu: $_`r`n")
        }
    })

$btnRestore.Add_Click({
        $backupPath = $txtBackupPath.Text
        $backupFiles = $txtBackupFiles.Text.Split(",").Trim()
    
        $txtBackupResult.Clear()
        $txtBackupResult.AppendText("Đang khôi phục từ sao lưu...`r`n")
    
        try {
            foreach ($pattern in $backupFiles) {
                $files = Get-ChildItem -Path $backupPath -Recurse -File -Filter $pattern -ErrorAction Stop
                foreach ($file in $files) {
                    $destFile = Join-Path -Path $PSScriptRoot -ChildPath (Split-Path -Path $file.FullName -Parent)
                    Copy-Item -Path $file.FullName -Destination $destFile -Force
                    $txtBackupResult.AppendText("✓ Đã khôi phục: $($file.FullName) -> $destFile`r`n")
                }
            }
        
            $txtBackupResult.AppendText("`r`n✓ Khôi phục hoàn tất!`r`n")
        }
        catch {
            $txtBackupResult.AppendText("❌ Lỗi khi khôi phục: $_`r`n")
        }
    })

# Hiển thị form
$form.ShowDialog()
