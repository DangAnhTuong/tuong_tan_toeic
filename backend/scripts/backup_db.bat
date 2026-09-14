@echo off
echo =======================================================
echo   TUONG TAN TOEIC - MONGODB BACKUP SCRIPT (WINDOWS)
echo =======================================================
echo.

set OUTPUT_FILE=tuong_tan_toeic_prod.archive

echo Dang sao luu co so du lieu tuong_tan_toeic...
echo File luu: %OUTPUT_FILE%
echo.

mongodump --db=tuong_tan_toeic --archive=%OUTPUT_FILE% --gzip

if %ERRORLEVEL% equ 0 (
    echo.
    echo =======================================================
    echo   [SUCCESS] SAO LUU THANH CONG!
    echo   File archive: %OUTPUT_FILE%
    echo   Dung luong:
    dir %OUTPUT_FILE% | findstr %OUTPUT_FILE%
    echo.
    echo   Hay upload file %OUTPUT_FILE% len VPS de bung du lieu!
    echo =======================================================
) else (
    echo.
    echo [ERROR] Sao luu that bai! Vui long kiem tra mongodump da co trong PATH.
)
pause
