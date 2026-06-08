# setup-wsl-cgroups.ps1
# -------------------------------------------------------------------
# Judge0's isolate sandbox requires cgroup v1 (legacy hierarchy).
# Docker Desktop on Windows uses WSL2 with cgroup v2 by default,
# which breaks isolate. This script enables cgroup v1 in WSL2.
#
# Usage: right-click → "Run with PowerShell" (or run in a PS window)
# After running, restart Docker Desktop for the change to take effect.
# -------------------------------------------------------------------

$wslConfigPath = "$env:USERPROFILE\.wslconfig"

# Read existing .wslconfig (or start empty)
$content = ""
if (Test-Path $wslConfigPath) {
    $content = Get-Content $wslConfigPath -Raw
    Write-Host "Found existing .wslconfig at $wslConfigPath"
} else {
    Write-Host "Creating new .wslconfig at $wslConfigPath"
}

# Only add the setting if it's not already there
if ($content -notmatch "unified_cgroup_hierarchy") {
    if ($content -match "\[wsl2\]") {
        # [wsl2] section exists — append the kernelCommandLine inside it
        $content = $content -replace "(\[wsl2\][^\[]*)", "`$1kernelCommandLine = systemd.unified_cgroup_hierarchy=0`n"
    } else {
        # No [wsl2] section — add one
        $content += "`n[wsl2]`nkernelCommandLine = systemd.unified_cgroup_hierarchy=0`n"
    }
    Set-Content -Path $wslConfigPath -Value $content
    Write-Host "✓ Added cgroup v1 setting to .wslconfig"
} else {
    Write-Host "✓ cgroup v1 setting already present in .wslconfig"
}

# Shut down WSL2 so the new kernel parameters take effect on next start
Write-Host ""
Write-Host "Shutting down WSL2 (will restart automatically)..."
wsl --shutdown
Write-Host "✓ WSL2 shut down"

Write-Host ""
Write-Host "============================================================"
Write-Host " NEXT STEP: Restart Docker Desktop"
Write-Host "============================================================"
Write-Host " After Docker Desktop restarts, run:"
Write-Host "   docker-compose up -d"
Write-Host ""
Write-Host " The Judge0 workers will now be able to create cgroup"
Write-Host " sandboxes and execute code submissions correctly."
Write-Host "============================================================"
