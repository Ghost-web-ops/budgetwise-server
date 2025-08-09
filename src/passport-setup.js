import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';

const callbackURLForDebugging = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`;
console.log("--- DEBUG ---");
console.log("Callback URL being sent to Google:", callbackURLForDebugging);
console.log("---------------");

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`; // تأكد أن API_URL هو رابط الباك إند

console.log("--- DEBUGGING GOOGLE STRATEGY ---");
console.log("CLIENT_ID being used:", clientID ? `Exists (starts with: ${clientID.substring(0, 8)}...)` : "!!! NOT FOUND !!!");
console.log("CLIENT_SECRET being used:", clientSecret ? "Exists" : "!!! NOT FOUND !!!");
console.log("CALLBACK_URL being used:", callbackURL);
console.log("---------------------------------");
// -------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://budgetwise-server-production.up.railway.app/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const googleId = profile.id;
      const email = profile.emails[0].value;
      const username = profile.displayName;

      try {
        // 1. Check if user exists with this Google ID
        let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

        if (userResult.rows.length > 0) {
          // User exists, log them in
          return done(null, userResult.rows[0]);
        }
        
        // 2. If not, check if user exists with this email
        userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length > 0) {
          // User exists by email, so LINK their Google ID
          const updatedUser = await pool.query(
            'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
            [googleId, email]
          );
          return done(null, updatedUser.rows[0]);
        }
        
        // 3. If no user exists at all, create a new one
        const newUser = await pool.query(
          'INSERT INTO users (username, email, google_id) VALUES ($1, $2, $3) RETURNING *',
          [username, email, googleId]
        );
        return done(null, newUser.rows[0]);

      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// (The serializeUser and deserializeUser functions remain the same)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
       if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user.rows[0]);
    } catch (error) {
        done(error, null);
    }
});
