@echo off
REM Cleanup React DevTools Global Installation (Windows)
REM Run this script to remove react-devtools and clean up

echo.
echo 🧹 Cleaning up React DevTools...
echo.

REM Uninstall global react-devtools
echo 📦 Uninstalling global react-devtools...
call npm uninstall -g react-devtools

REM Clear npm cache
echo 🗑️  Clearing npm cache...
call npm cache clean --force

REM Clear environment variables (for current session)
echo 🔧 Clearing environment variables...
set REACT_DEVTOOLS_HOST=
set REACT_DEVTOOLS_PORT=

echo.
echo ✅ Cleanup complete!
echo.
echo 📝 Next steps:
echo 1. Restart your terminal/IDE
echo 2. Run: npm run dev
echo 3. Hard reload browser (Ctrl + Shift + R)
echo 4. Install React DevTools browser extension:
echo    Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
echo    Firefox: https://addons.mozilla.org/firefox/addon/react-devtools/
echo.
pause
