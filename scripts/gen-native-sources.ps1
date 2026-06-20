# Builds high-res source images for @capacitor/assets from public/logo.png.
#   assets/icon.png   -> 1024x1024 (logo upscaled, transparent)
#   assets/splash.png -> 2732x2732 (logo centered on brand background)
Add-Type -AssemblyName System.Drawing

$logoPath = (Resolve-Path "public\logo.png")
$logo = [System.Drawing.Image]::FromFile($logoPath)

New-Item -ItemType Directory -Force -Path "assets" | Out-Null

# ---- icon.png : 1024x1024, logo scaled to fill, transparent background ----
$iconSize = 1024
$icon = New-Object System.Drawing.Bitmap($iconSize, $iconSize)
$g = [System.Drawing.Graphics]::FromImage($icon)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($logo, 0, 0, $iconSize, $iconSize)
$icon.Save((Join-Path (Get-Location) "assets\icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $icon.Dispose()
Write-Host "Created assets\icon.png (1024x1024)"

# ---- splash.png : 2732x2732, brand background with centered logo ----
$splashSize = 2732
$splash = New-Object System.Drawing.Bitmap($splashSize, $splashSize)
$g2 = [System.Drawing.Graphics]::FromImage($splash)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$brand = [System.Drawing.ColorTranslator]::FromHtml("#0D0E10")
$g2.Clear($brand)
# Logo occupies ~30% of the canvas, centered.
$target = [int]($splashSize * 0.30)
$offset = [int](($splashSize - $target) / 2)
$g2.DrawImage($logo, $offset, $offset, $target, $target)
$splash.Save((Join-Path (Get-Location) "assets\splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose(); $splash.Dispose()
Write-Host "Created assets\splash.png (2732x2732)"

$logo.Dispose()
