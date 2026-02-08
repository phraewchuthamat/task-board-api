@echo off
echo ========================================
echo   Fix Column Color Database Error
echo ========================================
echo.
echo This script will:
echo 1. Check if database is running
echo 2. Apply database schema changes
echo 3. Add color column to Column table
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Checking database connection...
npx prisma db pull 2>nul
if errorlevel 1 (
    echo.
    echo [ERROR] Cannot connect to database!
    echo.
    echo Please make sure MySQL is running:
    echo - If using Docker: docker-compose up -d
    echo - If using XAMPP: Start MySQL in XAMPP Control Panel
    echo - If using MySQL Service: net start MySQL80
    echo.
    pause
    exit /b 1
)

echo [OK] Database is running!
echo.
echo Step 2: Applying schema changes...
npx prisma db push --accept-data-loss

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to apply schema changes!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Database updated successfully!
echo.
echo The 'color' column has been added to the Column table.
echo Please restart your backend server if it's running.
echo.
pause
