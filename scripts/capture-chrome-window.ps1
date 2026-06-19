param($Output)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type @"
using System;
using System.Runtime.InteropServices;

public struct RECT {
    public int Left; public int Top; public int Right; public int Bottom;
}

public class Win32Capture {
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    public const int SW_RESTORE = 9;
}
"@

# Find the most recently launched Chromium browser process
# that matches our Playwright window size
$targetHwnd = [IntPtr]::Zero
$candidates = @()

$callback = {
    param($hwnd, $lParam)
    $visible = [Win32Capture]::IsWindowVisible($hwnd)
    if (-not $visible) { return $true }

    $sb = New-Object System.Text.StringBuilder 256
    [Win32Capture]::GetWindowText($hwnd, $sb, 256)
    $title = $sb.ToString()
    if ($title -eq "") { return $true }

    # Skip system/diagnostics windows
    if ($title -match "infinix|DevTools|New Tab|Discagem|Configura|PowerShell|Visual Studio|IDE|Monitor|Antigravity|Settings|Program Manager") { return $true }

    # Get process ID and name
    $procId = 0
    [Win32Capture]::GetWindowThreadProcessId($hwnd, [ref]$procId)
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "unknown" }

    $rect = New-Object RECT
    [Win32Capture]::GetWindowRect($hwnd, [ref]$rect)
    $w = $rect.Right - $rect.Left
    $h = $rect.Bottom - $rect.Top

    # Match: browser process + sizable window
    if ($name -match "chrome|chromium|msedge" -and $w -ge 800 -and $w -le 3000 -and $h -ge 600) {
        Write-Host "  Browser: '$title' (${w}x${h}, pid=$procId, proc=$name)"
        $script:candidates += @{hwnd=$hwnd; title=$title; w=$w; h=$h; procId=$procId; proc=$name}
    }
    return $true
}

$script:candidates = @()
[Win32Capture]::EnumWindows($callback, [IntPtr]::Zero)

if ($candidates.Count -eq 0) {
    Write-Error "Nenhuma janela de browser encontrada"
    exit 1
}

# Pick the candidate closest to our expected size (1366x800)
$expectedW = 1366
$expectedH = 800
$bestScore = [int]::MaxValue
foreach ($c in $candidates) {
    $score = [math]::Abs($c.w - $expectedW) + [math]::Abs($c.h - $expectedH)
    if ($score -lt $bestScore) {
        $bestScore = $score
        $targetHwnd = $c.hwnd
    }
}

$best = $candidates | Where-Object { $_.hwnd -eq $targetHwnd }
Write-Host "Selecionada: '$($best.title)' ($($best.w)x$($best.h))"

# Restore if minimized, then bring to foreground
[Win32Capture]::ShowWindow($targetHwnd, [Win32Capture]::SW_RESTORE)
Start-Sleep -Milliseconds 100
[Win32Capture]::SetForegroundWindow($targetHwnd)
Start-Sleep -Milliseconds 300

$currentRect = New-Object RECT
[Win32Capture]::GetWindowRect($targetHwnd, [ref]$currentRect)
$w = $currentRect.Right - $currentRect.Left
$h = $currentRect.Bottom - $currentRect.Top

$bmp = New-Object System.Drawing.Bitmap ($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($currentRect.Left, $currentRect.Top, 0, 0, ($bmp.Size))
$bmp.Save($Output)
$g.Dispose()
$bmp.Dispose()

Write-Host "Capturado: ${w}x${h} em ($($currentRect.Left),$($currentRect.Top)) -> $Output"
