@echo off
echo ========================================
echo Sailing Club Partnership - GitHub Deploy
echo ========================================
echo.

set /p GITHUB_USERNAME="Enter your GitHub username: "

echo.
echo Setting up GitHub repository for: %GITHUB_USERNAME%
echo.

echo Step 1: Adding GitHub remote...
git remote add origin https://github.com/%GITHUB_USERNAME%/sailing-club-partnership.git

echo Step 2: Setting main branch...
git branch -M main

echo Step 3: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app will be live at:
echo https://%GITHUB_USERNAME%.github.io/sailing-club-partnership
echo.
echo Next steps:
echo 1. Go to your GitHub repository
echo 2. Settings ^> Pages
echo 3. Source: Deploy from branch
echo 4. Branch: main, Folder: / (root)
echo 5. Save
echo.
echo The app will be live in 2-3 minutes!
echo.
pause
