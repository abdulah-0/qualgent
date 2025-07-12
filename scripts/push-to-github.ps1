# PowerShell script to push QGJob project to GitHub
# Usage: .\scripts\push-to-github.ps1 YOUR_GITHUB_USERNAME

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

Write-Host "🚀 Pushing QGJob project to GitHub..." -ForegroundColor Green
Write-Host "Repository: https://github.com/$GitHubUsername/qualgent" -ForegroundColor Cyan

try {
    # Check if we're in the right directory
    if (!(Test-Path "package.json")) {
        Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
        exit 1
    }

    # Check if git is initialized
    if (!(Test-Path ".git")) {
        Write-Host "❌ Error: Git repository not initialized" -ForegroundColor Red
        exit 1
    }

    # Add remote origin
    Write-Host "📡 Adding GitHub remote..." -ForegroundColor Yellow
    git remote add origin "https://github.com/$GitHubUsername/qualgent.git"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Remote might already exist, removing and re-adding..." -ForegroundColor Yellow
        git remote remove origin
        git remote add origin "https://github.com/$GitHubUsername/qualgent.git"
    }

    # Rename branch to main
    Write-Host "🔄 Setting main branch..." -ForegroundColor Yellow
    git branch -M main

    # Push to GitHub
    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "📋 Repository URL: https://github.com/$GitHubUsername/qualgent" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✅ Next steps:" -ForegroundColor Green
        Write-Host "   1. Visit your repository on GitHub" -ForegroundColor Gray
        Write-Host "   2. Verify all files are present" -ForegroundColor Gray
        Write-Host "   3. Set up any necessary repository secrets" -ForegroundColor Gray
        Write-Host "   4. Enable GitHub Actions if needed" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
        Write-Host "Please check your GitHub repository exists and you have access" -ForegroundColor Yellow
        exit 1
    }

} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Show repository status
Write-Host "📊 Repository Status:" -ForegroundColor Blue
git remote -v
git status
