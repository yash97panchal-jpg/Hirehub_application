# HireHub Asset Generation Script
$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
& (Join-Path $scriptDir "fix-app-icons.ps1")
