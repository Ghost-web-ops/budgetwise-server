// استدعاء Pool مباشرة لتنظيف الكود
import { Pool } from 'pg';

// تهيئة كائن إعدادات فارغ
const config = {};

if (process.env.NODE_ENV === 'production') {
    // إعدادات بيئة الرفع (مثل Railway أو Vercel)
    // هذه البيئات عادة توفر متغير DATABASE_URL
    config.connectionString = process.env.DATABASE_URL;
    config.ssl = {
        rejectUnauthorized: false
    };
} else {
    // إعدادات البيئة المحلية (جهازك)
    config.user = process.env.DB_USER;
    config.host = process.env.DB_HOST;
    config.database = process.env.DB_NAME;
    config.password = process.env.DB_PASSWORD;
    config.port = process.env.DB_PORT;
}

// إنشاء الـ Pool باستخدام الإعدادات الصحيحة تلقائيًا
const pool = new Pool(config);

export default pool; // تصدير الـ pool لاستخدامه في باقي الملفات