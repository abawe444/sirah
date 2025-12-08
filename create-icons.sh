#!/bin/bash

# سكريبت بسيط لإنشاء أيقونات PWA من شعار موجود
# يتطلب: ImageMagick

# التحقق من وجود ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick غير مثبت!"
    echo "للتثبيت:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Windows: قم بتحميله من https://imagemagick.org/script/download.php"
    exit 1
fi

# التحقق من وجود الشعار
if [ ! -f "logo.png" ]; then
    echo "❌ ملف logo.png غير موجود!"
    echo "ضع شعار الشركة في المجلد الحالي باسم logo.png"
    exit 1
fi

# إنشاء مجلد الأيقونات
mkdir -p public/icons

echo "🚀 بدء إنشاء الأيقونات..."

# إنشاء الأيقونات بأحجام مختلفة
for size in 72 96 128 144 152 192 384 512; do
    echo "   إنشاء icon-${size}x${size}.png..."
    convert logo.png -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done

echo "✅ تم إنشاء جميع الأيقونات بنجاح!"
echo "📁 الأيقونات موجودة في: public/icons/"
echo ""
echo "الأيقونات المُنشأة:"
ls -lh public/icons/

echo ""
echo "✨ التطبيق جاهز الآن للعمل كـ PWA!"
echo "🚀 قم بتشغيل التطبيق واختبر التثبيت"
