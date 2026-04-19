@echo off
REM Fix Cache Issues - Windows
echo.
echo 🔥 Fixing cache issues...
echo.

REM Stop any running node processes
echo 📛 Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Clear Vite cache
echo 🗑️  Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ Vite cache cleared
) else (
    echo ℹ️  No Vite cache found
)

REM Clear dist folder
echo 🗑️  Clearing dist folder...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ Dist folder cleared
) else (
    echo ℹ️  No dist folder found
)

REM Clear npm cache
echo 🗑️  Clearing npm cache...
call npm cache clean --force

echo.
echo ✅ Cache cleared successfully!
echo.
echo 📝 Next steps:
echo 1. Run: npm run dev
echo 2. Open browser and press Ctrl + Shift + Delete
echo 3. Clear "Cached images and files"
echo 4. Hard reload browser (Ctrl + Shift + R)
echo.
pause
