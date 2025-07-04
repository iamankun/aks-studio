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

param (
    [string]$Path = ".",
    [int]$Depth = 2,
    [string]$OutputFile,
    [switch]$NoFiles,
    [string[]]$ExcludeDirs = @('.git', 'node_modules', '.next', '.vscode'),
    [string[]]$ExcludeFiles = @('*.jpg', '*.png', '*.ico', '*.svg', '*.webp', '*.lock', '*.json')
)

# If OutputFile is specified, redirect output to that file
if ($OutputFile) {
    "DMG Directory Tree (Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))" | Out-File -FilePath $OutputFile
    Get-DirectoryTree -Path $Path -Depth $Depth -NoFiles:$NoFiles -ExcludeDirs $ExcludeDirs -ExcludeFiles $ExcludeFiles | Out-File -FilePath $OutputFile -Append
    Write-Host "Directory tree has been saved to $OutputFile"
}
else {
    Write-Output "DMG"
    Get-DirectoryTree -Path $Path -Depth $Depth -NoFiles:$NoFiles -ExcludeDirs $ExcludeDirs -ExcludeFiles $ExcludeFiles
}

# Thêm chức năng xuất ra file
function Export-DirectoryTree {
    param (
        [string]$Path = ".",
        [int]$Depth = 3,
        [string]$OutputFile = "directory-tree.txt",
        [string[]]$ExcludeDirs = @('.git', 'node_modules', '.next', '.vscode'),
        [string[]]$ExcludeFiles = @('*.jpg', '*.png', '*.ico', '*.svg', '*.webp', '*.lock', '*.json')
    )

    # Tạo tên file với timestamp để tránh ghi đè
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($OutputFile)
    $fileExt = [System.IO.Path]::GetExtension($OutputFile)
    $outputFileWithTimestamp = "$fileNameWithoutExt-$timestamp$fileExt"
    
    # Xuất cây thư mục ra file
    "DMG" | Out-File -FilePath $outputFileWithTimestamp -Encoding utf8
    Get-DirectoryTree -Path $Path -Depth $Depth -ExcludeDirs $ExcludeDirs -ExcludeFiles $ExcludeFiles | Out-File -FilePath $outputFileWithTimestamp -Append -Encoding utf8
    
    Write-Output "Đã xuất cây thư mục ra file: $outputFileWithTimestamp"
    return $outputFileWithTimestamp
}
