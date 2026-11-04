Add-Type -AssemblyName System.Drawing

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
$appDir = Resolve-Path "$scriptDir/.."
$srcPath = Join-Path $appDir "src\imports\symbol_only.jpeg"
$publicDir = Join-Path $appDir "public"
$iosAppIcon = Join-Path $appDir "ios\App\App\Assets.xcassets\AppIcon.appiconset"
$iosSplash = Join-Path $appDir "ios\App\App\Assets.xcassets\Splash.imageset"
$androidRes = Join-Path $appDir "android\app\src\main\res"

Write-Output "Source symbol: $srcPath"
Write-Output "Public dir: $publicDir"

# Load source image
$srcImg = [System.Drawing.Image]::FromFile($srcPath)
$srcBmp = New-Object System.Drawing.Bitmap $srcImg

# Find symbol bounding box
$minX = $srcBmp.Width; $minY = $srcBmp.Height; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $srcBmp.Height; $y++) {
    for ($x = 0; $x -lt $srcBmp.Width; $x++) {
        $c = $srcBmp.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$symW = $maxX - $minX + 1
$symH = $maxY - $minY + 1
Write-Output "Symbol dimensions: ${symW}x${symH}"

# Create clean cropped transparent symbol with white fill
$symBmp = New-Object System.Drawing.Bitmap $symW, $symH
for ($y = 0; $y -lt $symH; $y++) {
    for ($x = 0; $x -lt $symW; $x++) {
        $c = $srcBmp.GetPixel($minX + $x, $minY + $y)
        $brightness = ($c.R + $c.G + $c.B) / 3.0
        if ($brightness -gt 245) {
            $symBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $alpha = [int][Math]::Max(0, [Math]::Min(255, (255 - $brightness) * 1.5))
            $symBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
        }
    }
}

function Create-AppIcon([int]$size, [string]$outputPath, [bool]$isRound = $false) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background gradient: Deep slate/indigo
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, `
        ([System.Drawing.Color]::FromArgb(255, 15, 23, 42)), `
        ([System.Drawing.Color]::FromArgb(255, 30, 41, 59)), `
        45.0

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $size, $size)
        $g.SetClip($path)
    }

    $g.FillRectangle($brush, $rect)

    # Accent glow in top right
    $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(60, 59, 130, 246))
    $g.FillEllipse($accentBrush, [int]($size * 0.4), -[int]($size * 0.2), [int]($size * 0.8), [int]($size * 0.8))

    # Draw centered symbol
    $targetH = [int]($size * 0.58)
    $targetW = [int]($symW * ($targetH / $symH))
    $destX = [int](($size - $targetW) / 2)
    $destY = [int](($size - $targetH) / 2)

    $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $targetW, $targetH
    $g.DrawImage($symBmp, $destRect, 0, 0, $symW, $symH, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created: $outputPath ($($size)x$($size))"
}

function Create-Splash([int]$width, [int]$height, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Dark background
    $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 10, 15, 29))
    $g.FillRectangle($brush, $rect)

    # Centered logo
    $targetH = [int]([Math]::Min($width, $height) * 0.22)
    $targetW = [int]($symW * ($targetH / $symH))
    $destX = [int](($width - $targetW) / 2)
    $destY = [int](($height - $targetH) / 2 - [Math]::Min($width, $height) * 0.04)

    $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $targetW, $targetH
    $g.DrawImage($symBmp, $destRect, 0, 0, $symW, $symH, [System.Drawing.GraphicsUnit]::Pixel)

    # HireHub text below
    $fontSize = [float]($targetH * 0.22)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $textY = $destY + $targetH + ($targetH * 0.25)
    $g.DrawString("HireHub", $font, $textBrush, [float]($width / 2), [float]$textY, $stringFormat)

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created: $outputPath ($($width)x$($height))"
}

function Create-PlayStoreFeatureGraphic([string]$outputPath) {
    $width = 1024
    $height = 500
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, `
        ([System.Drawing.Color]::FromArgb(255, 15, 23, 42)), `
        ([System.Drawing.Color]::FromArgb(255, 30, 41, 59)), `
        30.0
    $g.FillRectangle($bgBrush, $rect)

    # Radial accents
    $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(50, 59, 130, 246))
    $g.FillEllipse($accentBrush, 700, -100, 450, 450)
    $accentBrush2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 168, 85, 247))
    $g.FillEllipse($accentBrush2, -100, 250, 400, 400)

    # Logo on left
    $targetH = 220
    $targetW = [int]($symW * ($targetH / $symH))
    $destX = 140
    $destY = [int]((500 - $targetH) / 2)
    $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $targetW, $targetH
    $g.DrawImage($symBmp, $destRect, 0, 0, $symW, $symH, [System.Drawing.GraphicsUnit]::Pixel)

    # Titles on right
    $titleFont = New-Object System.Drawing.Font("Arial", [float]42, [System.Drawing.FontStyle]::Bold)
    $subFont = New-Object System.Drawing.Font("Arial", [float]20, [System.Drawing.FontStyle]::Regular)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 148, 163, 184))

    $textX = $destX + $targetW + 60
    $g.DrawString("HireHub", $titleFont, $textBrush, [float]$textX, [float]180.0)
    $g.DrawString("Find Jobs • Easy Apply • Global Tech Hubs", $subFont, $subBrush, [float]$textX, [float]255.0)

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created: $outputPath (1024x500)"
}

# 1. Web & Master Icons
Create-AppIcon 1024 (Join-Path $publicDir "favicon.png")
Create-AppIcon 1024 (Join-Path $publicDir "icon.png")
Create-AppIcon 512  (Join-Path $publicDir "play-store-icon-512.png")
Create-PlayStoreFeatureGraphic (Join-Path $publicDir "play-store-feature-1024x500.png")

# 2. iOS Assets
if (Test-Path $iosAppIcon) {
    Create-AppIcon 1024 (Join-Path $iosAppIcon "AppIcon-512@2x.png")
}
if (Test-Path $iosSplash) {
    Create-Splash 2732 2732 (Join-Path $iosSplash "splash-2732x2732.png")
    Create-Splash 2732 2732 (Join-Path $iosSplash "splash-2732x2732-1.png")
    Create-Splash 2732 2732 (Join-Path $iosSplash "splash-2732x2732-2.png")
}

# 3. Android Mipmap Icons
$androidSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($folder in $androidSizes.Keys) {
    $dir = Join-Path $androidRes $folder
    if (Test-Path $dir) {
        $s = $androidSizes[$folder]
        Create-AppIcon $s (Join-Path $dir "ic_launcher.png")
        Create-AppIcon $s (Join-Path $dir "ic_launcher_round.png") $true
        Create-AppIcon $s (Join-Path $dir "ic_launcher_foreground.png")
    }
}

# Cleanup
$symBmp.Dispose()
$srcBmp.Dispose()
$srcImg.Dispose()
Write-Output "Assets generation complete!"
