# Test API Submissions bằng PowerShell
# Chạy script này: .\scripts\test-api.ps1

# Cấu hình
$baseUrl = "http://localhost:3000/api"
$auth = @{
    username = "ankunstudio@ankun.dev"  # Thay đổi thành tài khoản test của bạn
    password = "@iamAnKun"       # Thay đổi thành mật khẩu test của bạn
}

# Tạo thư mục logs nếu chưa tồn tại
$logFolder = "..\logs\api-test"
if (-not (Test-Path $logFolder)) {
    New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
}

# Tạo timestamp cho filename
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "$logFolder\api-test-$timestamp.log"

# Hàm log
function Log-Message {
    param (
        [string]$message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    
    Write-Host $message
    Add-Content -Path $logFile -Value $logMessage
}

# Hàm test API sử dụng Invoke-RestMethod
function Test-Api {
    param (
        [string]$endpoint,
        [string]$method = "GET"
    )
    
    $url = "$baseUrl$endpoint"
    $basicAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($auth.username):$($auth.password)"))
    
    Log-Message "`n🔍 Testing: $method $endpoint"
    Log-Message "🌐 URL: $url"
    
    try {
        $params = @{
            Uri         = $url
            Method      = $method
            Headers     = @{
                Authorization  = "Basic $basicAuth"
                "Content-Type" = "application/json"
            }
            ErrorAction = "Stop"
        }
        
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-RestMethod @params
        $stopwatch.Stop()
        
        Log-Message "✅ Status: 200 OK (${stopwatch.ElapsedMilliseconds}ms)"
        Log-Message "📦 Response: $($response | ConvertTo-Json -Depth 4)"
        
        return @{
            Endpoint = $endpoint
            Status   = 200
            Success  = $true
            Time     = $stopwatch.ElapsedMilliseconds
            Data     = $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMsg = $_.Exception.Message
        
        Log-Message "❌ Error: $errorMsg"
        Log-Message "❌ Status: $statusCode"
        
        try {
            $errorContent = $_.ErrorDetails.Message
            if ($errorContent) {
                Log-Message "📦 Error details: $errorContent"
            }
        }
        catch {
            # Không có error details
        }
        
        return @{
            Endpoint = $endpoint
            Status   = $statusCode
            Success  = $false
            Error    = $errorMsg
        }
    }
}

# Bắt đầu test
Log-Message "🚀 Starting API Test"
Log-Message "🔗 Base URL: $baseUrl"
Log-Message "👤 Auth user: $($auth.username)"

# Danh sách endpoint cần test
$endpoints = @(
    "/submissions",
    "/submissions?username=test",
    "/submissions/123" # ID demo, có thể không tồn tại
)

# Chạy test
$results = @()

foreach ($endpoint in $endpoints) {
    $result = Test-Api -endpoint $endpoint
    $results += $result
}

# Tạo bảng tổng kết
Log-Message "`n📊 Test Summary:"
Log-Message "-----------------------------"
Log-Message "| Endpoint | Status | Result |"
Log-Message "-----------------------------"

foreach ($result in $results) {
    $icon = if ($result.Success) { "✅" } else { "❌" }
    Log-Message "| $($result.Endpoint) | $($result.Status) | $icon |"
}
Log-Message "-----------------------------"

# Thống kê
$success = ($results | Where-Object { $_.Success -eq $true }).Count
$failed = ($results | Where-Object { $_.Success -eq $false }).Count

Log-Message "`n✅ Success: $success"
Log-Message "❌ Failed: $failed"
Log-Message "📝 Log saved to: $logFile"