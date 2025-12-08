@echo off
REM سكريبت بسيط لإنشاء أيقونات PWA من شعار موجود (Windows)
REM يتطلب: ImageMagick

echo.
echo ========================================
echo    إنشاء أيقونات PWA
echo ========================================
echo.

REM التحقق من وجود ImageMagick
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ImageMagick غير مثبت!
    echo.
    echo للتثبيت:
    echo   قم بتحميله من https://imagemagick.org/script/download.php
    echo   أو استخدم: choco install imagemagick
    echo.
    pause
    exit /b 1
)

REM التحقق من وجود الشعار
if not exist "logo.png" (
    echo ❌ ملف logo.png غير موجود!
    echo.
    echo ضع شعار الشركة في المجلد الحالي باسم logo.png
    echo.
    pause
    exit /b 1
)

REM إنشاء مجلد الأيقونات
if not exist "public\icons" mkdir public\icons

echo 🚀 بدء إنشاء الأيقونات...
echo.

REM إنشاء الأيقونات بأحجام مختلفة
for %%s in (72 96 128 144 152 192 384 512) do (
    echo    إنشاء icon-%%sx%%s.png...
    convert logo.png -resize %%sx%%s public\icons\icon-%%sx%%s.png
)

echo.
echo ✅ تم إنشاء جميع الأيقونات بنجاح!
echo 📁 الأيقونات موجودة في: public\icons\
echo.
echo الأيقونات المُنشأة:
dir /B public\icons\
echo.
echo ✨ التطبيق جاهز الآن للعمل كـ PWA!
echo 🚀 قم بتشغيل التطبيق واختبر التثبيت
echo.
pause
