# TODO Create - Công cụ tạo sơ đồ thư mục cho dự án và công việc cá nhân
# Copyright (c) 2025 - An Kun Studio
# Version: 1.0

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ------------- Các hàm chức năng -------------
function Get-DirectoryTree {
    param (
        [string]$Path = ".",
        [int]$Depth = 3,
        [string]$Indent = "",
        [switch]$NoFiles,
        [string[]]$ExcludeDirs = @('.git', 'node_modules', '.next', '.vscode'),
        [string[]]$ExcludeFiles = @('*.jpg', '*.png', '*.ico', '*.svg', '*.webp', '*.lock')
    )

    # Get directories
    $dirs = Get-ChildItem -Path $Path -Directory | Where-Object { $ExcludeDirs -notcontains $_.Name } | Sort-Object Name
    
    # Get files if requested and we're not past the depth limit
    $files = @()
    if (-not $NoFiles) {
        $files = Get-ChildItem -Path $Path -File | 
        Where-Object { 
            $include = $true
            foreach ($pattern in $ExcludeFiles) {
                if ($_.Name -like $pattern) {
                    $include = $false
                    break
                }
            }
            $include
        } | 
        Sort-Object Name
    }

    # Process directories
    foreach ($dir in $dirs) {
        if ($Depth -gt 0) {
            Write-Output "$Indent├── $($dir.Name)/"
            Get-DirectoryTree -Path $dir.FullName -Depth ($Depth - 1) -Indent "$Indent│   " -NoFiles:$NoFiles -ExcludeDirs $ExcludeDirs -ExcludeFiles $ExcludeFiles
        }
        else {
            Write-Output "$Indent├── $($dir.Name)/"
        }
    }

    # Process files
    if (-not $NoFiles) {
        $lastFile = $files | Select-Object -Last 1
        foreach ($file in $files) {
            $fileIndent = $Indent
            $filePrefix = "├── "
            if ($file -eq $lastFile -and $dirs.Count -eq 0) {
                $filePrefix = "└── "
            }
            Write-Output "$fileIndent$filePrefix$($file.Name)"
        }
    }
}

function Export-DirectoryTree {
    param (
        [string]$Path = ".",
        [int]$Depth = 3,
        [string]$OutputFile = "directory-tree.txt",
        [switch]$NoFiles,
        [string[]]$ExcludeDirs,
        [string[]]$ExcludeFiles
    )

    # Tạo tên file với timestamp để tránh ghi đè
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($OutputFile)
    $fileExt = [System.IO.Path]::GetExtension($OutputFile)
    $outputFileWithTimestamp = "$fileNameWithoutExt-$timestamp$fileExt"
    
    # Tạo tên dự án từ đường dẫn
    $projectName = (Get-Item $Path).Name
    
    # Xuất cây thư mục ra file
    "$projectName Directory Tree (Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))" | Out-File -FilePath $outputFileWithTimestamp -Encoding utf8
    $projectName | Out-File -FilePath $outputFileWithTimestamp -Append -Encoding utf8
    Get-DirectoryTree -Path $Path -Depth $Depth -NoFiles:$NoFiles -ExcludeDirs $ExcludeDirs -ExcludeFiles $ExcludeFiles | Out-File -FilePath $outputFileWithTimestamp -Append -Encoding utf8
    
    return $outputFileWithTimestamp
}

function Create-ProjectTemplate {
    param (
        [string]$Path,
        [string]$ProjectType,
        [string]$ProjectName
    )
    
    # Tạo thư mục dự án nếu không tồn tại
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
    
    $fullPath = Join-Path -Path $Path -ChildPath $ProjectName
    
    # Kiểm tra nếu thư mục đã tồn tại
    if (Test-Path $fullPath) {
        return "Thư mục dự án đã tồn tại: $fullPath"
    }
    
    # Tạo thư mục dự án
    New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
    
    # Tạo cấu trúc thư mục theo loại dự án
    switch ($ProjectType) {
        "web" {
            # Cấu trúc dự án web
            New-Item -ItemType Directory -Path "$fullPath\src" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\assets" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\components" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\styles" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\utils" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\public" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\docs" -Force | Out-Null
            
            # Tạo các file cơ bản
            "# $ProjectName`n`nDự án web được tạo bởi TODO Create." | Out-File -FilePath "$fullPath\README.md" -Encoding utf8
            "node_modules/`n.DS_Store`n.env.local" | Out-File -FilePath "$fullPath\.gitignore" -Encoding utf8
            "{`n  `"name`": `"$ProjectName`",`n  `"version`": `"1.0.0`",`n  `"description`": `"Dự án web`",`n  `"scripts`": {`n    `"start`": `"echo Chưa cấu hình lệnh khởi động`"`n  }`n}" | Out-File -FilePath "$fullPath\package.json" -Encoding utf8
        }
        "node" {
            # Cấu trúc dự án Node.js
            New-Item -ItemType Directory -Path "$fullPath\src" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\controllers" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\models" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\routes" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\middlewares" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\utils" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\tests" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\docs" -Force | Out-Null
            
            # Tạo các file cơ bản
            "# $ProjectName`n`nDự án Node.js được tạo bởi TODO Create." | Out-File -FilePath "$fullPath\README.md" -Encoding utf8
            "node_modules/`n.DS_Store`n.env`n.env.local`nlogs/`ncoverage/" | Out-File -FilePath "$fullPath\.gitignore" -Encoding utf8
            "{`n  `"name`": `"$ProjectName`",`n  `"version`": `"1.0.0`",`n  `"description`": `"Dự án Node.js`",`n  `"main`": `"src/index.js`",`n  `"scripts`": {`n    `"start`": `"node src/index.js`"`n  }`n}" | Out-File -FilePath "$fullPath\package.json" -Encoding utf8
            "// Entry point cho ứng dụng`nconsole.log('Hello, $ProjectName!');" | Out-File -FilePath "$fullPath\src\index.js" -Encoding utf8
        }
        "react" {
            # Cấu trúc dự án React
            New-Item -ItemType Directory -Path "$fullPath\src" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\components" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\hooks" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\contexts" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\pages" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\assets" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\styles" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\src\utils" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\public" -Force | Out-Null
            
            # Tạo các file cơ bản
            "# $ProjectName`n`nDự án React được tạo bởi TODO Create." | Out-File -FilePath "$fullPath\README.md" -Encoding utf8
            "node_modules/`n.DS_Store`n.env.local`nbuild/`ndist/`ncoverage/" | Out-File -FilePath "$fullPath\.gitignore" -Encoding utf8
            "{`n  `"name`": `"$ProjectName`",`n  `"version`": `"0.1.0`",`n  `"private`": true,`n  `"dependencies`": {`n    `"react`": `"^18.2.0`",`n    `"react-dom`": `"^18.2.0`"`n  },`n  `"scripts`": {`n    `"start`": `"echo Chưa cấu hình lệnh khởi động`"`n  }`n}" | Out-File -FilePath "$fullPath\package.json" -Encoding utf8
        }
        "nextjs" {
            # Cấu trúc dự án Next.js
            New-Item -ItemType Directory -Path "$fullPath\app" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\components" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\lib" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\public" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\styles" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\contexts" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\hooks" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\types" -Force | Out-Null
            
            # Tạo các file cơ bản
            "# $ProjectName`n`nDự án Next.js được tạo bởi TODO Create." | Out-File -FilePath "$fullPath\README.md" -Encoding utf8
            "node_modules/`n.DS_Store`n.env.local`n.next/`nout/" | Out-File -FilePath "$fullPath\.gitignore" -Encoding utf8
            "{`n  `"name`": `"$ProjectName`",`n  `"version`": `"0.1.0`",`n  `"private`": true,`n  `"scripts`": {`n    `"dev`": `"next dev`",`n    `"build`": `"next build`",`n    `"start`": `"next start`",`n    `"lint`": `"next lint`"`n  },`n  `"dependencies`": {`n    `"next`": `"^14.0.0`",`n    `"react`": `"^18.2.0`",`n    `"react-dom`": `"^18.2.0`"`n  }`n}" | Out-File -FilePath "$fullPath\package.json" -Encoding utf8
            "/** @type {import('next').NextConfig} */`nconst nextConfig = {`n  reactStrictMode: true,`n}`n`nmodule.exports = nextConfig" | Out-File -FilePath "$fullPath\next.config.js" -Encoding utf8
            "export default function Home() {`n  return (`n    <main>`n      <h1>Welcome to $ProjectName</h1>`n    </main>`n  )`n}" | Out-File -FilePath "$fullPath\app\page.tsx" -Encoding utf8
        }
        "documentation" {
            # Cấu trúc dự án tài liệu
            New-Item -ItemType Directory -Path "$fullPath\docs" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\images" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\assets" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\templates" -Force | Out-Null
            
            # Tạo các file cơ bản
            "# $ProjectName`n`nDự án tài liệu được tạo bởi TODO Create." | Out-File -FilePath "$fullPath\README.md" -Encoding utf8
            "# Giới thiệu`n`nĐây là dự án tài liệu $ProjectName.`n`n## Cấu trúc dự án`n`n- docs/: Thư mục chứa tài liệu chính`n- images/: Thư mục chứa hình ảnh`n- assets/: Thư mục chứa tài nguyên bổ sung`n- templates/: Thư mục chứa các mẫu tài liệu" | Out-File -FilePath "$fullPath\docs\index.md" -Encoding utf8
        }
        "personal" {
            # Cấu trúc dự án cá nhân
            New-Item -ItemType Directory -Path "$fullPath\Tài liệu" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\Hình ảnh" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\Mẫu" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\Kế hoạch" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\Dự án phụ" -Force | Out-Null
            
            # Tạo các file cơ bản
            "# $ProjectName`n`nDự án cá nhân được tạo bởi TODO Create." | Out-File -FilePath "$fullPath\README.md" -Encoding utf8
            "# Ghi chú cá nhân`n`nĐây là dự án cá nhân $ProjectName.`n`n## Mục tiêu`n`n- Mục tiêu 1`n- Mục tiêu 2`n`n## Kế hoạch`n`n- [ ] Công việc 1`n- [ ] Công việc 2" | Out-File -FilePath "$fullPath\Kế hoạch\kế-hoạch-tổng-thể.md" -Encoding utf8
        }
        default {
            # Cấu trúc dự án mặc định
            New-Item -ItemType Directory -Path "$fullPath\src" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\docs" -Force | Out-Null
            New-Item -ItemType Directory -Path "$fullPath\resources" -Force | Out-Null
            
            # Tạo các file cơ bản
            "# $ProjectName`n`nDự án được tạo bởi TODO Create." | Out-File -FilePath "$fullPath\README.md" -Encoding utf8
        }
    }
    
    # Xuất cây thư mục ra file
    $treeFile = Export-DirectoryTree -Path $fullPath -Depth 3 -OutputFile "$fullPath\directory-structure.txt"
    
    return "Đã tạo thành công dự án $ProjectType: $fullPath`nCấu trúc thư mục được lưu tại: $treeFile"
}

function Create-TODOTemplate {
    param (
        [string]$Path,
        [string]$FileName = "TODO.md",
        [string]$ProjectName = "My Project"
    )
    
    # Tạo thư mục nếu không tồn tại
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
    
    $fullPath = Join-Path -Path $Path -ChildPath $FileName
    
    # Nội dung mẫu cho file TODO
    $content = @"
# TODO List - $ProjectName

## Công việc cần làm

### Công việc ưu tiên cao
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Công việc ưu tiên trung bình
- [ ] Task 4
- [ ] Task 5

### Công việc ưu tiên thấp
- [ ] Task 6
- [ ] Task 7

## Công việc đã hoàn thành
- [x] Task đã hoàn thành 1
- [x] Task đã hoàn thành 2

## Ý tưởng
- Ý tưởng 1
- Ý tưởng 2

## Ghi chú
- Ghi chú 1
- Ghi chú 2

---
*Cập nhật lần cuối: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@
    
    # Ghi nội dung ra file
    $content | Out-File -FilePath $fullPath -Encoding utf8
    
    return "Đã tạo TODO template tại: $fullPath"
}

# ------------- Giao diện người dùng -------------
# Tạo form chính
$form = New-Object System.Windows.Forms.Form
$form.Text = "TODO Create - Công cụ tạo sơ đồ thư mục dự án"
$form.Size = New-Object System.Drawing.Size(700, 600)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)

# Tạo TabControl
$tabControl = New-Object System.Windows.Forms.TabControl
$tabControl.Location = New-Object System.Drawing.Point(10, 10)
$tabControl.Size = New-Object System.Drawing.Size(665, 480)
$form.Controls.Add($tabControl)

# Tab 1: Tạo sơ đồ thư mục
$tabDirectoryTree = New-Object System.Windows.Forms.TabPage
$tabDirectoryTree.Text = "Tạo sơ đồ thư mục"
$tabControl.Controls.Add($tabDirectoryTree)

# Tab 2: Tạo dự án mới
$tabCreateProject = New-Object System.Windows.Forms.TabPage
$tabCreateProject.Text = "Tạo dự án mới"
$tabControl.Controls.Add($tabCreateProject)

# Tab 3: Tạo TODO
$tabCreateTODO = New-Object System.Windows.Forms.TabPage
$tabCreateTODO.Text = "Tạo TODO"
$tabControl.Controls.Add($tabCreateTODO)

# ------------- Tab 1: Tạo sơ đồ thư mục -------------
# Label đường dẫn
$lblPath = New-Object System.Windows.Forms.Label
$lblPath.Location = New-Object System.Drawing.Point(20, 20)
$lblPath.Size = New-Object System.Drawing.Size(100, 20)
$lblPath.Text = "Đường dẫn:"
$tabDirectoryTree.Controls.Add($lblPath)

# TextBox đường dẫn
$txtPath = New-Object System.Windows.Forms.TextBox
$txtPath.Location = New-Object System.Drawing.Point(130, 20)
$txtPath.Size = New-Object System.Drawing.Size(400, 20)
$txtPath.Text = (Get-Location).Path
$tabDirectoryTree.Controls.Add($txtPath)

# Button duyệt thư mục
$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Location = New-Object System.Drawing.Point(540, 19)
$btnBrowse.Size = New-Object System.Drawing.Size(80, 23)
$btnBrowse.Text = "Duyệt..."
$btnBrowse.Add_Click({
        $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
        $folderBrowser.Description = "Chọn thư mục để tạo sơ đồ"
        $folderBrowser.RootFolder = "MyComputer"
    
        if ($folderBrowser.ShowDialog() -eq "OK") {
            $txtPath.Text = $folderBrowser.SelectedPath
        }
    })
$tabDirectoryTree.Controls.Add($btnBrowse)

# Label độ sâu
$lblDepth = New-Object System.Windows.Forms.Label
$lblDepth.Location = New-Object System.Drawing.Point(20, 60)
$lblDepth.Size = New-Object System.Drawing.Size(100, 20)
$lblDepth.Text = "Độ sâu:"
$tabDirectoryTree.Controls.Add($lblDepth)

# ComboBox độ sâu
$cboDepth = New-Object System.Windows.Forms.ComboBox
$cboDepth.Location = New-Object System.Drawing.Point(130, 60)
$cboDepth.Size = New-Object System.Drawing.Size(80, 20)
$cboDepth.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
1..10 | ForEach-Object { $cboDepth.Items.Add($_) }
$cboDepth.SelectedIndex = 2  # Mặc định là 3
$tabDirectoryTree.Controls.Add($cboDepth)

# CheckBox hiển thị files
$chkShowFiles = New-Object System.Windows.Forms.CheckBox
$chkShowFiles.Location = New-Object System.Drawing.Point(230, 60)
$chkShowFiles.Size = New-Object System.Drawing.Size(150, 20)
$chkShowFiles.Text = "Hiển thị files"
$chkShowFiles.Checked = $true
$tabDirectoryTree.Controls.Add($chkShowFiles)

# Label loại trừ thư mục
$lblExcludeDirs = New-Object System.Windows.Forms.Label
$lblExcludeDirs.Location = New-Object System.Drawing.Point(20, 100)
$lblExcludeDirs.Size = New-Object System.Drawing.Size(100, 20)
$lblExcludeDirs.Text = "Loại trừ thư mục:"
$tabDirectoryTree.Controls.Add($lblExcludeDirs)

# TextBox loại trừ thư mục
$txtExcludeDirs = New-Object System.Windows.Forms.TextBox
$txtExcludeDirs.Location = New-Object System.Drawing.Point(130, 100)
$txtExcludeDirs.Size = New-Object System.Drawing.Size(490, 20)
$txtExcludeDirs.Text = ".git,node_modules,.next,.vscode,dist"
$tabDirectoryTree.Controls.Add($txtExcludeDirs)

# Label loại trừ files
$lblExcludeFiles = New-Object System.Windows.Forms.Label
$lblExcludeFiles.Location = New-Object System.Drawing.Point(20, 140)
$lblExcludeFiles.Size = New-Object System.Drawing.Size(100, 20)
$lblExcludeFiles.Text = "Loại trừ files:"
$tabDirectoryTree.Controls.Add($lblExcludeFiles)

# TextBox loại trừ files
$txtExcludeFiles = New-Object System.Windows.Forms.TextBox
$txtExcludeFiles.Location = New-Object System.Drawing.Point(130, 140)
$txtExcludeFiles.Size = New-Object System.Drawing.Size(490, 20)
$txtExcludeFiles.Text = "*.jpg,*.png,*.ico,*.svg,*.webp,*.lock,*.map"
$tabDirectoryTree.Controls.Add($txtExcludeFiles)

# Label tên file xuất
$lblOutputFile = New-Object System.Windows.Forms.Label
$lblOutputFile.Location = New-Object System.Drawing.Point(20, 180)
$lblOutputFile.Size = New-Object System.Drawing.Size(100, 20)
$lblOutputFile.Text = "Tên file xuất:"
$tabDirectoryTree.Controls.Add($lblOutputFile)

# TextBox tên file xuất
$txtOutputFile = New-Object System.Windows.Forms.TextBox
$txtOutputFile.Location = New-Object System.Drawing.Point(130, 180)
$txtOutputFile.Size = New-Object System.Drawing.Size(200, 20)
$txtOutputFile.Text = "directory-tree.txt"
$tabDirectoryTree.Controls.Add($txtOutputFile)

# Button tạo sơ đồ
$btnCreateTree = New-Object System.Windows.Forms.Button
$btnCreateTree.Location = New-Object System.Drawing.Point(130, 220)
$btnCreateTree.Size = New-Object System.Drawing.Size(120, 30)
$btnCreateTree.Text = "Tạo sơ đồ thư mục"
$btnCreateTree.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
$btnCreateTree.ForeColor = [System.Drawing.Color]::White
$btnCreateTree.Add_Click({
        $excludeDirs = $txtExcludeDirs.Text -split "," | ForEach-Object { $_.Trim() }
        $excludeFiles = $txtExcludeFiles.Text -split "," | ForEach-Object { $_.Trim() }
    
        $outputFile = Export-DirectoryTree -Path $txtPath.Text -Depth ([int]$cboDepth.SelectedItem) -OutputFile $txtOutputFile.Text -NoFiles:(-not $chkShowFiles.Checked) -ExcludeDirs $excludeDirs -ExcludeFiles $excludeFiles
    
        $txtResult.Text = "Đã tạo sơ đồ thư mục thành công!`r`nFile: $outputFile"
    
        # Mở file kết quả
        Start-Process "notepad.exe" -ArgumentList $outputFile
    })
$tabDirectoryTree.Controls.Add($btnCreateTree)

# RichTextBox kết quả
$txtResult = New-Object System.Windows.Forms.RichTextBox
$txtResult.Location = New-Object System.Drawing.Point(20, 270)
$txtResult.Size = New-Object System.Drawing.Size(600, 150)
$txtResult.ReadOnly = $true
$txtResult.BackColor = [System.Drawing.Color]::FromArgb(250, 250, 250)
$tabDirectoryTree.Controls.Add($txtResult)

# ------------- Tab 2: Tạo dự án mới -------------
# Label đường dẫn dự án
$lblProjectPath = New-Object System.Windows.Forms.Label
$lblProjectPath.Location = New-Object System.Drawing.Point(20, 20)
$lblProjectPath.Size = New-Object System.Drawing.Size(100, 20)
$lblProjectPath.Text = "Đường dẫn:"
$tabCreateProject.Controls.Add($lblProjectPath)

# TextBox đường dẫn dự án
$txtProjectPath = New-Object System.Windows.Forms.TextBox
$txtProjectPath.Location = New-Object System.Drawing.Point(130, 20)
$txtProjectPath.Size = New-Object System.Drawing.Size(400, 20)
$txtProjectPath.Text = (Get-Location).Path
$tabCreateProject.Controls.Add($txtProjectPath)

# Button duyệt thư mục dự án
$btnBrowseProject = New-Object System.Windows.Forms.Button
$btnBrowseProject.Location = New-Object System.Drawing.Point(540, 19)
$btnBrowseProject.Size = New-Object System.Drawing.Size(80, 23)
$btnBrowseProject.Text = "Duyệt..."
$btnBrowseProject.Add_Click({
        $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
        $folderBrowser.Description = "Chọn thư mục để tạo dự án mới"
        $folderBrowser.RootFolder = "MyComputer"
    
        if ($folderBrowser.ShowDialog() -eq "OK") {
            $txtProjectPath.Text = $folderBrowser.SelectedPath
        }
    })
$tabCreateProject.Controls.Add($btnBrowseProject)

# Label tên dự án
$lblProjectName = New-Object System.Windows.Forms.Label
$lblProjectName.Location = New-Object System.Drawing.Point(20, 60)
$lblProjectName.Size = New-Object System.Drawing.Size(100, 20)
$lblProjectName.Text = "Tên dự án:"
$tabCreateProject.Controls.Add($lblProjectName)

# TextBox tên dự án
$txtProjectName = New-Object System.Windows.Forms.TextBox
$txtProjectName.Location = New-Object System.Drawing.Point(130, 60)
$txtProjectName.Size = New-Object System.Drawing.Size(200, 20)
$txtProjectName.Text = "my-project"
$tabCreateProject.Controls.Add($txtProjectName)

# Label loại dự án
$lblProjectType = New-Object System.Windows.Forms.Label
$lblProjectType.Location = New-Object System.Drawing.Point(20, 100)
$lblProjectType.Size = New-Object System.Drawing.Size(100, 20)
$lblProjectType.Text = "Loại dự án:"
$tabCreateProject.Controls.Add($lblProjectType)

# ComboBox loại dự án
$cboProjectType = New-Object System.Windows.Forms.ComboBox
$cboProjectType.Location = New-Object System.Drawing.Point(130, 100)
$cboProjectType.Size = New-Object System.Drawing.Size(200, 20)
$cboProjectType.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
@("web", "node", "react", "nextjs", "documentation", "personal", "default") | ForEach-Object { $cboProjectType.Items.Add($_) }
$cboProjectType.SelectedIndex = 0  # Mặc định là "web"
$tabCreateProject.Controls.Add($cboProjectType)

# Button tạo dự án
$btnCreateProject = New-Object System.Windows.Forms.Button
$btnCreateProject.Location = New-Object System.Drawing.Point(130, 150)
$btnCreateProject.Size = New-Object System.Drawing.Size(120, 30)
$btnCreateProject.Text = "Tạo dự án mới"
$btnCreateProject.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
$btnCreateProject.ForeColor = [System.Drawing.Color]::White
$btnCreateProject.Add_Click({
        $result = Create-ProjectTemplate -Path $txtProjectPath.Text -ProjectType $cboProjectType.SelectedItem -ProjectName $txtProjectName.Text
        $txtProjectResult.Text = $result
    })
$tabCreateProject.Controls.Add($btnCreateProject)

# RichTextBox kết quả dự án
$txtProjectResult = New-Object System.Windows.Forms.RichTextBox
$txtProjectResult.Location = New-Object System.Drawing.Point(20, 200)
$txtProjectResult.Size = New-Object System.Drawing.Size(600, 220)
$txtProjectResult.ReadOnly = $true
$txtProjectResult.BackColor = [System.Drawing.Color]::FromArgb(250, 250, 250)
$tabCreateProject.Controls.Add($txtProjectResult)

# ------------- Tab 3: Tạo TODO -------------
# Label đường dẫn TODO
$lblTODOPath = New-Object System.Windows.Forms.Label
$lblTODOPath.Location = New-Object System.Drawing.Point(20, 20)
$lblTODOPath.Size = New-Object System.Drawing.Size(100, 20)
$lblTODOPath.Text = "Đường dẫn:"
$tabCreateTODO.Controls.Add($lblTODOPath)

# TextBox đường dẫn TODO
$txtTODOPath = New-Object System.Windows.Forms.TextBox
$txtTODOPath.Location = New-Object System.Drawing.Point(130, 20)
$txtTODOPath.Size = New-Object System.Drawing.Size(400, 20)
$txtTODOPath.Text = (Get-Location).Path
$tabCreateTODO.Controls.Add($txtTODOPath)

# Button duyệt thư mục TODO
$btnBrowseTODO = New-Object System.Windows.Forms.Button
$btnBrowseTODO.Location = New-Object System.Drawing.Point(540, 19)
$btnBrowseTODO.Size = New-Object System.Drawing.Size(80, 23)
$btnBrowseTODO.Text = "Duyệt..."
$btnBrowseTODO.Add_Click({
        $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
        $folderBrowser.Description = "Chọn thư mục để tạo TODO"
        $folderBrowser.RootFolder = "MyComputer"
    
        if ($folderBrowser.ShowDialog() -eq "OK") {
            $txtTODOPath.Text = $folderBrowser.SelectedPath
        }
    })
$tabCreateTODO.Controls.Add($btnBrowseTODO)

# Label tên file TODO
$lblTODOFile = New-Object System.Windows.Forms.Label
$lblTODOFile.Location = New-Object System.Drawing.Point(20, 60)
$lblTODOFile.Size = New-Object System.Drawing.Size(100, 20)
$lblTODOFile.Text = "Tên file:"
$tabCreateTODO.Controls.Add($lblTODOFile)

# TextBox tên file TODO
$txtTODOFile = New-Object System.Windows.Forms.TextBox
$txtTODOFile.Location = New-Object System.Drawing.Point(130, 60)
$txtTODOFile.Size = New-Object System.Drawing.Size(200, 20)
$txtTODOFile.Text = "TODO.md"
$tabCreateTODO.Controls.Add($txtTODOFile)

# Label tên dự án TODO
$lblTODOProject = New-Object System.Windows.Forms.Label
$lblTODOProject.Location = New-Object System.Drawing.Point(20, 100)
$lblTODOProject.Size = New-Object System.Drawing.Size(100, 20)
$lblTODOProject.Text = "Tên dự án:"
$tabCreateTODO.Controls.Add($lblTODOProject)

# TextBox tên dự án TODO
$txtTODOProject = New-Object System.Windows.Forms.TextBox
$txtTODOProject.Location = New-Object System.Drawing.Point(130, 100)
$txtTODOProject.Size = New-Object System.Drawing.Size(200, 20)
$txtTODOProject.Text = "My Project"
$tabCreateTODO.Controls.Add($txtTODOProject)

# Button tạo TODO
$btnCreateTODO = New-Object System.Windows.Forms.Button
$btnCreateTODO.Location = New-Object System.Drawing.Point(130, 150)
$btnCreateTODO.Size = New-Object System.Drawing.Size(120, 30)
$btnCreateTODO.Text = "Tạo TODO"
$btnCreateTODO.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 215)
$btnCreateTODO.ForeColor = [System.Drawing.Color]::White
$btnCreateTODO.Add_Click({
        $result = Create-TODOTemplate -Path $txtTODOPath.Text -FileName $txtTODOFile.Text -ProjectName $txtTODOProject.Text
        $txtTODOResult.Text = $result
    
        # Mở file kết quả
        $todoFilePath = Join-Path -Path $txtTODOPath.Text -ChildPath $txtTODOFile.Text
        Start-Process "notepad.exe" -ArgumentList $todoFilePath
    })
$tabCreateTODO.Controls.Add($btnCreateTODO)

# RichTextBox kết quả TODO
$txtTODOResult = New-Object System.Windows.Forms.RichTextBox
$txtTODOResult.Location = New-Object System.Drawing.Point(20, 200)
$txtTODOResult.Size = New-Object System.Drawing.Size(600, 220)
$txtTODOResult.ReadOnly = $true
$txtTODOResult.BackColor = [System.Drawing.Color]::FromArgb(250, 250, 250)
$tabCreateTODO.Controls.Add($txtTODOResult)

# StatusStrip để hiển thị thông tin
$statusStrip = New-Object System.Windows.Forms.StatusStrip
$statusStripLabel = New-Object System.Windows.Forms.ToolStripStatusLabel
$statusStripLabel.Text = "An Kun Studio © 2025 - TODO Create v1.0"
$statusStrip.Items.Add($statusStripLabel)
$form.Controls.Add($statusStrip)

# Hiển thị form
$form.Add_Shown({ $form.Activate() })
[void] $form.ShowDialog()
