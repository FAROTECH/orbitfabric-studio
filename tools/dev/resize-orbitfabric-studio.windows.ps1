param(
  [int]$Width = 1440,
  [int]$Height = 900
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class Win32Window {
  [DllImport("user32.dll")]
  public static extern bool SetWindowPos(
    IntPtr hWnd,
    IntPtr hWndInsertAfter,
    int X,
    int Y,
    int cx,
    int cy,
    uint uFlags
  );
}
"@

$excludedBrowsers = @(
  "chrome",
  "msedge",
  "firefox",
  "brave",
  "opera",
  "vivaldi"
)

$candidates = Get-Process |
  Where-Object {
    $_.MainWindowHandle -ne 0 -and
    $_.MainWindowTitle -like "*OrbitFabric Studio*" -and
    ($excludedBrowsers -notcontains $_.ProcessName.ToLower())
  } |
  Select-Object ProcessName, Id, MainWindowTitle, MainWindowHandle

if (-not $candidates) {
  Write-Host "No non-browser OrbitFabric Studio window found."
  Write-Host ""
  Write-Host "Current matching windows:"
  Get-Process |
    Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like "*OrbitFabric Studio*" } |
    Select-Object ProcessName, Id, MainWindowTitle |
    Format-Table -AutoSize
  exit 1
}

if ($candidates.Count -gt 1) {
  Write-Host "Multiple non-browser candidates found. Using the first one:"
  $candidates | Format-Table -AutoSize
}

$window = $candidates | Select-Object -First 1

$SWP_SHOWWINDOW = 0x0040
[Win32Window]::SetWindowPos(
  [IntPtr]$window.MainWindowHandle,
  [IntPtr]::Zero,
  40,
  40,
  $Width,
  $Height,
  $SWP_SHOWWINDOW
) | Out-Null

Write-Host "Resized process $($window.ProcessName) [$($window.Id)] to ${Width}x${Height}"
Write-Host "Window title: $($window.MainWindowTitle)"