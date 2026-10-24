@echo off
setlocal enabledelayedexpansion
title SmartPublic Transport - Mumbai Smart Public Transit Platform
color 0B

echo ========================================================================
echo    SmartPublic Transport: Smart Public Transport & Crowd System
echo    Target Region: Mumbai Metropolitan Region - BEST, Metro & Suburban
echo    Live Route Optimization & Fleet Monitoring System
echo ========================================================================
echo.

REM Check if java is installed
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not detected in your PATH!
    echo Please install Java 17 from https://adoptium.net/
    echo If Java is already installed, add the java bin folder to your PATH.
    pause
    exit /b 1
)

REM Check if javac is available for fresh compile
where javac >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/3] Compiling Java backend classes...
    if not exist bin mkdir bin
    dir /s /b src\main\java\*.java > sources.txt
    javac -d bin @sources.txt 2>nul
    if exist sources.txt del sources.txt
    echo [2/3] Synchronizing resource files...
    xcopy /E /I /Y src\main\resources\* bin\ >nul 2>nul
) else (
    echo [NOTE] javac not in PATH. Using pre-compiled classes in bin directory.
)

echo [3/3] Starting TransitPulse Server on http://localhost:8080/ ...
echo ------------------------------------------------------------------------
echo Server active at: http://localhost:8080/
echo Press Ctrl+C in this window to stop the server.
echo ------------------------------------------------------------------------
echo.

REM Open browser after 2 seconds
start "" http://localhost:8080/

REM Launch TransitPulse Server
java -cp "bin;bin/*" com.transitpulse.TransitPulseApplication

pause
