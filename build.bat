@echo off
REM Build script for Flocalize - Generates configuration from secrets.env

echo 🔧 Building Flocalize configuration...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if secrets.env exists
if not exist "secrets.env" (
    echo ❌ secrets.env file not found
    echo Please copy .env.example to secrets.env and add your API keys
    pause
    exit /b 1
)

REM Generate configuration
echo 📦 Generating JavaScript configuration from secrets.env...
python src\config_bridge.py

if %errorlevel% equ 0 (
    echo.
    echo ✅ Build complete! 
    echo 📁 config-generated.js has been created
    echo 🌐 You can now open index.html in your browser
    echo.
    echo 💡 Remember to run this script whenever you update secrets.env
) else (
    echo ❌ Build failed
    pause
    exit /b 1
)

pause
