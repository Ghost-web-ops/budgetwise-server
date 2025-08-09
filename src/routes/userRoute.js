import bcrypt from "bcryptjs";
import { Router } from 'express';
import jwt from "jsonwebtoken";
import passport from 'passport';
import pool from "../db.js";
const router = Router();
router.use((req, res, next) => {
    console.log(`Request received for: ${req.method} ${req.originalUrl}`);
    next();
});
router.post("/register", async (req, res) => {
  console.log("Request Body Received:", req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword]
    );

    res.status(201).json({ userId: result.rows[0].id });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
     console.log("Request Body Received:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
     if (user.google_id && !user.password_hash) {
      return res.status(401).json({ error: 'This account was created with Google. Please use Sign in with Google.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const payload = { userId: user.id, email: email };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get('/google', passport.authenticate('google'));

// --- المسار الثاني: الرابط الذي يعود إليه جوجل ---
// هذا المسار يستقبل بيانات المستخدم من جوجل
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // إذا نجحت المصادقة، سيكون req.user متاحًا
    // الآن ننشئ JWT تمامًا كما في تسجيل الدخول العادي
    const payload = {
    userId: req.user.id,
    email: req.user.email
  };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // إعادة توجيه المستخدم إلى الواجهة الأمامية مع إرسال التوكن
   // This is the line inside your /api/auth/google/callback route
res.redirect(`${process.env.NEXT_PUBLIC_API_URL}/google-callback?token=${token}`);
  }
);

export default router;
