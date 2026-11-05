Add-Type -AssemblyName System.Drawing

$srcPath = "Job Portal Web App/src/imports/symbol_only.jpeg"
$publicDir = "Job Portal Web App/public"
$iosAppIcon = "Job Portal Web App/ios/App/App/Assets.xcassets/AppIcon.appiconset"
$iosSplash = "Job Portal Web App/ios/App/App/Assets.xcassets/Splash.imageset"
$androidRes = "Job Portal Web App/android/app/src/main/res"
$storeAssets = "Job Portal Web App/store-assets"

$fileBytes = [System.IO.File]::ReadAllBytes($srcPath)
$ms = New-Object System.IO.MemoryStream(,$fileBytes)
$srcImg = [System.Drawing.Image]::FromStream($ms)
$srcBmp = New-Object System.Drawing.Bitmap $srcImg
$ms.Dispose()

# Bounding box: 48, 160 to 264, 423
$minX = 48; $maxX = 264
$minY = 160; $maxY = 423
$symW = $maxX - $minX + 1
$symH = $maxY - $minY + 1

# Create transparent symbol preserving ORIGINAL amber and navy colors
$symBmp = New-Object System.Drawing.Bitmap $symW, $symH
for ($y = 0; $y -lt $symH; $y++) {
    for ($x = 0; $x -lt $symW; $x++) {
        $c = $srcBmp.GetPixel($minX + $x, $minY + $y)
        $brightness = ($c.R + $c.G + $c.B) / 3.0
        if ($brightness -gt 242) {
            $symBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Smooth edge alpha for antialiasing
            if ($brightness -gt 220) {
                $alpha = [int](255 * (242 - $brightness) / 22.0)
                $symBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            } else {
                $symBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }
}

# Function to render icon
function Render-AppIcon([int]$size, [string]$outputPath, [bool]$isRound = $false, [bool]$transparentBg = $false) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if (-not $transparentBg) {
        $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
        
        # Deep premium indigo-violet brand gradient
        $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, `
            ([System.Drawing.Color]::FromArgb(255, 15, 7, 36)), `
            ([System.Drawing.Color]::FromArgb(255, 30, 16, 68)), `
            45.0
            
        if ($isRound) {
            $path = New-Object System.Drawing.Drawing2D.GraphicsPath
            $path.AddEllipse(0, 0, $size, $size)
            $g.SetClip($path)
        }
        $g.FillRectangle($brush, $rect)

        # Subtle golden amber glow ring in center
        $glowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(35, 245, 158, 11))
        $glowSize = [int]($size * 0.72)
        $glowOffset = [int](($size - $glowSize) / 2)
        $g.FillEllipse($glowBrush, $glowOffset, $glowOffset, $glowSize, $glowSize)
        
        # Inner white pill badge to make emblem pop cleanly
        $badgeSize = [int]($size * 0.68)
        $badgeOffset = [int](($size - $badgeSize) / 2)
        $badgeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        $g.FillEllipse($badgeBrush, $badgeOffset, $badgeOffset, $badgeSize, $badgeSize)
    }

    # Proportional emblem rendering - safe zone 48% height to keep natural slim proportion
    $targetH = [int]($size * 0.46)
    $targetW = [int]($symW * ($targetH / $symH))
    $destX = [int](($size - $targetW) / 2)
    $destY = [int](($size - $targetH) / 2)

    $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $targetW, $targetH
    $g.DrawImage($symBmp, $destRect, 0, 0, $symW, $symH, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Saved: $outputPath ($($size)x$($size))"
}

# Function to create clean square symbol for in-app use (512x512)
function Render-SquareSymbol([string]$outputPath) {
    $size = 512
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)

    # Symbol centered with 12% margin
    $targetH = [int]($size * 0.76)
    $targetW = [int]($symW * ($targetH / $symH))
    $destX = [int](($size - $targetW) / 2)
    $destY = [int](($size - $targetH) / 2)

    $destRect = New-Object System.Drawing.Rectangle $destX, $destY, $targetW, $targetH
    $g.DrawImage($symBmp, $destRect, 0, 0, $symW, $symH, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    # Save as JPEG with high quality
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Dispose()
    Write-Output "Saved square centered in-app symbol: $outputPath"
}

$srcImg.Dispose()
$srcBmp.Dispose()

# 1. Update in-app symbol_only.jpeg to be a true 512x512 square centered image
Render-SquareSymbol "Job Portal Web App/src/imports/symbol_only.jpeg"

# 2. Public web & PWA icons
Render-AppIcon 1024 "$publicDir/favicon.png" $false $false
Render-AppIcon 1024 "$publicDir/icon.png" $false $false
Render-AppIcon 512 "$publicDir/play-store-icon-512.png" $false $false
Render-AppIcon 1024 "$storeAssets/app-store-icon-1024.png" $false $false
Render-AppIcon 512 "$storeAssets/play-store-icon-512.png" $false $false
Render-AppIcon 1024 "$iosAppIcon/AppIcon-512@2x.png" $false $false

# 3. Android adaptive launcher icons
$androidSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($entry in $androidSizes.GetEnumerator()) {
    $dir = "$androidRes/$($entry.Key)"
    if (Test-Path $dir) {
        $sz = $entry.Value
        Render-AppIcon $sz "$dir/ic_launcher.png" $false $false
        Render-AppIcon $sz "$dir/ic_launcher_round.png" $true $false
        # Foreground must be transparent and centered in safe zone (38% size)
        Render-AppIcon $sz "$dir/ic_launcher_foreground.png" $false $true
    }
}

$srcImg.Dispose()
$symBmp.Dispose()
Write-Output "All icons fixed and generated with perfect proportions!"
