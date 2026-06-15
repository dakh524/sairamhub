Add-Type -AssemblyName System.Drawing

$src = ".\assets\images\app_logo.png"
$dest = ".\assets\images\app_icon.png"

$bmp = [System.Drawing.Image]::FromFile($src)
$width = [Math]::Max($bmp.Width, $bmp.Height)
$height = $width

$newBmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.Clear([System.Drawing.Color]::White)

$x = ($width - $bmp.Width) / 2
$y = ($height - $bmp.Height) / 2

$g.DrawImage($bmp, $x, $y, $bmp.Width, $bmp.Height)
$g.Dispose()

$newBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$newBmp.Dispose()
$bmp.Dispose()

Write-Host "Created square icon: $dest"
