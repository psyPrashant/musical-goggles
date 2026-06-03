# playwright-issues.ps1 — Manual Playwright issue logger.
#
# USAGE (called by Claude via Bash during a Playwright session):
#   pwsh -File .claude/hooks/playwright-issues.ps1 "description of the issue"
#
# Or pipe content:
#   echo "issue text" | pwsh -File .claude/hooks/playwright-issues.ps1
#
# The Stop hook in settings.local.json reads pw-pending.txt at turn end and
# appends it to playwright-issues.md, then removes the pending file.
# This script just appends to pw-pending.txt.

param([string]$Issue = "")

$pendingPath = ".claude/pw-pending.txt"

if ($Issue) {
    Add-Content -Path $pendingPath -Value $Issue -Encoding utf8
    Write-Host "[playwright-issues] Logged: $Issue"
    exit 0
}

# If no arg, read from stdin
$stdin = [Console]::In.ReadToEnd().Trim()
if ($stdin) {
    Add-Content -Path $pendingPath -Value $stdin -Encoding utf8
    Write-Host "[playwright-issues] Logged from stdin."
}
