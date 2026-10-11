@echo off
title Data Entry Bot - Automated EXE Builder
echo ========================================================
echo   DATA ENTRY BOT - ZERO MANUAL WORK WINDOWS .EXE BUILDER
echo ========================================================
echo.
echo Checking Python and Pip...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python from python.org.
    pause
    exit /b 1
)

echo.
echo Installing PyInstaller and dependencies...
pip install pyinstaller pandas openpyxl selenium --quiet

echo.
echo Building Standalone Protected Executable...
echo (Code is compiled into binary bytecode; no one can view or edit source code)
pyinstaller --onefile --name "e-Vedhika.Data.entry_bot" --clean scripts/data_entry_bot_core.py

echo.
if exist "dist\e-Vedhika.Data.entry_bot.exe" (
    echo ========================================================
    echo  SUCCESS! Your protected e-Vedhika.Data.entry_bot.exe is ready!
    echo  Location: dist\e-Vedhika.Data.entry_bot.exe
    echo ========================================================
) else (
    echo [ERROR] Build failed. Please inspect logs above.
)

pause
