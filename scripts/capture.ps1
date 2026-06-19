$url = $args[0]
$output = $args[1]

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Abrir Chrome
$chrome = Start-Process -FilePath "chrome.exe" -ArgumentList "--new-window","--window-position=0,0","--window-size=1366,800","$url" -PassThru
Start-Sleep -Seconds 5

# Capturar tela inteira
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.X, $bounds.Y, 0, 0, $bounds.Size)
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()

# Fechar Chrome
$chrome | Stop-Process -Force -ErrorAction SilentlyContinue
