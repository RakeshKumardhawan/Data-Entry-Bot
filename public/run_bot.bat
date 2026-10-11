@echo off
title e-Vedhika Data Entry Bot Launcher
color 0b
echo ====================================================
echo   e-Vedhika Data Entry Bot - Quick Launcher
echo   Automated Gram Panchayat TMP Portal Data Entry
echo ====================================================
echo.
echo Checking & installing Python requirements...
pip install pandas pyautogui keyboard requests openpyxl --quiet
echo.
echo Starting e-Vedhika Data Entry Bot...
python entry_bot.py
if errorlevel 1 (
    echo.
    echo Error running bot. Please make sure Python is installed and added to PATH.
    pause
)
