# Generates PWA icons from public/logo.png at the sizes required by the manifest.
Add-Type -AssemblyName System.Drawing

$src = "public\logo.png"
$targets = @(
    @{ name = "public\pwa-192x192.png"; size = 192 },
    @{ name = "public\pwa-512x512.png"; size = 512 }
)

$source = [System.Drawing.Image]::FromFile((Resolve-Path $src))

foreach ($t in $targets) {
    $bmp = New-Object System.Drawing.Bitmap($t.size, $t.size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($source, 0, 0, $t.size, $t.size)
    $outPath = Join-Path (Get-Location) $t.name
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $($t.name) ($($t.size)x$($t.size))"
}

$source.Dispose()
