<#
.SYNOPSIS
    Automated Repository Sync Script for Expense Management System
.DESCRIPTION
    Syncs changes from apps/api and apps/web to backend, frontend, and prodaction directories.
#>

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting PowerShell Automatic Workspace Sync..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$rootDir = Get-Location

# 1. Run Node.js sync engine
if (Test-Path "scripts/sync-repos.js") {
    node scripts/sync-repos.js
} else {
    Write-Host "⚠️ scripts/sync-repos.js not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Repository Git Status Summary:" -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

# Check main repo status
Write-Host "📁 Main Monorepo (hazem):" -ForegroundColor Green
git status -s

# Check frontend production repo status
if (Test-Path "prodaction/note-Expenses-frontend") {
    Write-Host ""
    Write-Host "🌐 Production Frontend (note-Expenses-frontend):" -ForegroundColor Green
    git -C prodaction/note-Expenses-frontend status -s
}

# Check backend production repo status
if (Test-Path "prodaction/note-Expenses-backend") {
    Write-Host ""
    Write-Host "⚙️ Production Backend (note-Expenses-backend):" -ForegroundColor Green
    git -C prodaction/note-Expenses-backend status -s
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ Sync process completed successfully!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
