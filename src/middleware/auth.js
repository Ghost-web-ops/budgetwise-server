
import jwt from 'jsonwebtoken';
export default function auth(req, res, next) {
     const authHeader = req.headers['authorization'];

    // 2. تحقق من وجود الهيدر وأنه يبدأ بـ "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token is missing or malformed' });
    }

    // 3. افصل كلمة "Bearer " واحصل على الـ token فقط
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
         req.user = { id: decoded.userId }; 
        next();
    });
}