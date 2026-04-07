param(
    # Frontend path defaults to the project root (parent of this scripts folder)
    [string]$FrontendPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    # Backend public app path (Laravel public/app)
    [string]$PublicAppPath = "c:\laragon2\www\sistema_tpv\public\app"
)

$ErrorActionPreference = "Stop"

function Invoke-Step($title, [scriptblock]$action) {
    Write-Host "[deploy] $title ..." -ForegroundColor Cyan
    & $action
    Write-Host "[deploy] $title DONE" -ForegroundColor Green
}

Invoke-Step "Building frontend (npm run build)" {
    Push-Location $FrontendPath
    try {
        & npm run build | Write-Output
        $code = $LASTEXITCODE
        if ($code -ne 0) {
            throw "npm run build failed with exit code $code"
        }
    } finally {
        Pop-Location
    }
}

# Validate dist output
$distPath = Join-Path $FrontendPath 'dist'
if (-not (Test-Path (Join-Path $distPath 'index.html'))) {
    throw "Build failed: dist/index.html not found at $distPath"
}

# Validate key PWA artifacts (registerSW and service worker)
Invoke-Step "Validating PWA artifacts" {
    $required = @('index.html','registerSW.js','sw.js','manifest.webmanifest')
    foreach ($f in $required) {
        $p = Join-Path $distPath $f
        if (-not (Test-Path $p)) {
            throw "Build failed: missing '$f' in $distPath"
        }
    }
}

# Sanitize index.html: remove any external injected scripts (e.g., gptengineer) or legacy app.js/app.css tags
$indexPath = Join-Path $distPath 'index.html'
$indexHtml = Get-Content -Raw $indexPath
# Remove gptengineer script tag if present
$indexHtml = $indexHtml -replace '<script[^>]*src="https://cdn\.gpteng\.co/[^"]+"[^>]*></script>', ''
# Remove root-level app.js/app.css references if present
$indexHtml = $indexHtml -replace '<script[^>]*src="/app\.js"[^>]*></script>', ''
$indexHtml = $indexHtml -replace '<link[^>]*href="/app\.css"[^>]*>', ''
Set-Content -Path $indexPath -Value $indexHtml

# Recreate target directory
Invoke-Step "Preparing target folder $PublicAppPath" {
    if (Test-Path $PublicAppPath) {
        Remove-Item -Path $PublicAppPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $PublicAppPath -Force | Out-Null
}

# Copy artifacts
Invoke-Step "Copying build artifacts to Laravel public/app" {
    Copy-Item -Path (Join-Path $distPath '*') -Destination $PublicAppPath -Recurse -Force
}

Write-Host "[deploy] Completed successfully" -ForegroundColor Green
