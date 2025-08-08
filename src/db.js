import { Pool } from 'pg';

// تهيئة كائن إعدادات فارغ
const config = {};

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // إعدادات بيئة الرفع (مثل Railway أو Supabase)
    const url = new URL(process.env.DATABASE_URL);

    config.user = url.username;
    config.password = url.password;
    config.host = url.hostname; // <-- سيقوم هذا بتحديد الـ host الصحيح
    config.port = url.port;
    config.database = url.pathname.slice(1); // لإزالة الـ "/" من البداية
    config.ssl = {
        rejectUnauthorized: false
    };

} else {
    // إعدادات البيئة المحلية (جهازك)
    config.user = process.env.DB_USER;
    config.host = process.env.DB_HOST || 'localhost';
    config.database = process.env.DB_NAME;
    config.password = process.env.DB_PASSWORD;
    config.port = process.env.DB_PORT;
}

// إنشاء الـ Pool باستخدام الإعدادات الصحيحة تلقائيًا
const pool = new Pool(config);

export default pool;