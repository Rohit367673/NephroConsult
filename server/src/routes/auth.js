import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import { auth as firebaseAuth } from '../config/firebase.js';
import { generateOTP, storeOTP, verifyOTP } from '../utils/otp.js';
import { getOTPEmailTemplate } from '../utils/emailTemplates.js';
import { sendOTPEmail } from '../utils/email.js';
import { requireAuth } from '../middlewares/auth.js';
import { env } from '../config.js';

const router = express.Router();

// Get current user session
router.get('/me', (req, res) => {
  console.log('🔍 Auth check - Session exists:', !!req.session);
  console.log('🔍 Auth check - Session user:', req.session?.user);
  console.log('🔍 Auth check - Session ID:', req.sessionID);
  console.log('🔍 Auth check - Cookie header:', req.headers.cookie);
  
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// Debug endpoint to check configuration  
router.get('/debug', (req, res) => {
  res.json({
    smtpHost: process.env.SMTP_HOST,
    smtpUser: process.env.SMTP_USER,
    smtpPort: process.env.SMTP_PORT,
    smtpPassStartsWith: process.env.SMTP_PASS ? process.env.SMTP_PASS.substring(0, 3) + '...' : 'missing',
    mongoUri: !!process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Fix admin role for specific users
router.get('/fix-admin-role', async (req, res) => {
  try {
    const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
    
    const updateResults = await Promise.all(
      adminEmails.map(async (email) => {
        const user = await User.findOne({ email });
        if (user && user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
          console.log(`🔧 Updated ${email} to admin role`);
          return { email, updated: true, oldRole: user.role };
        }
        return { email, updated: false, currentRole: user?.role || 'not found' };
      })
    );
    
    res.json({ 
      success: true, 
      results: updateResults,
      message: 'Admin roles updated successfully'
    });
  } catch (error) {
    console.error('Error fixing admin roles:', error);
    res.status(500).json({ error: 'Failed to fix admin roles' });
  }
});

// Force refresh current session with correct admin role
router.post('/refresh-session', requireAuth, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
    
    if (adminEmails.includes(currentUser.email)) {
      // Update session with admin role
      req.session.user = {
        ...currentUser,
        role: 'admin'
      };
      
      console.log(`🔐 Session refreshed for ${currentUser.email} - now has admin role`);
      
      await req.session.save();
      
      res.json({
        success: true,
        user: req.session.user,
        message: 'Session refreshed with admin privileges'
      });
    } else {
      res.json({
        success: false,
        message: 'User is not in admin list'
      });
    }
  } catch (error) {
    console.error('Error refreshing session:', error);
    res.status(500).json({ error: 'Failed to refresh session' });
  }
});

// Send OTP for email verification
router.post('/send-otp', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email('Invalid email address')
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const otp = generateOTP();
    storeOTP(normalizedEmail, otp);

    // Send email with OTP
    try {
      const emailHtml = getOTPEmailTemplate(otp, 'User').html;
      const emailResult = await sendOTPEmail(
        email,
        'Your NephroConsult Verification Code',
        emailHtml
      );
      
      console.log(`📧 Email result:`, emailResult);
      
      // Check if email failed but we have fallback
      if (emailResult.fallback || !emailResult.ok) {
        console.log(`⚠️ Email service unavailable for ${email}, showing OTP: ${otp}`);
        
        return res.json({ 
          message: 'Email service temporarily unavailable. Your verification code is displayed below.',
          success: true,
          otp: otp,
          fallback: true
        });
      }
      
      // Email sent successfully via Gmail SMTP
      res.json({ 
        message: 'Verification code sent to your email!',
        success: true,
        method: emailResult.method || 'gmail-smtp'
      });
      
    } catch (emailError) {
      console.error('❌ EMAIL SEND ERROR:', emailError.message);
      console.error('❌ FULL ERROR:', emailError);
      
      // If email completely fails, show OTP in response for better UX
      console.log(`⚠️ Email completely failed for ${email}, showing OTP: ${otp}`);
      
      return res.json({ 
        message: 'Email service error. Your verification code is displayed below.',
        success: true,
        otp: otp,
        fallback: true,
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email('Invalid email address'),
      otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
      userData: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters')
      }).optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const { email, otp, userData } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Verify OTP first
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.error });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // If userData is provided, create the account
    if (userData) {
      try {
        const passwordHash = await bcrypt.hash(userData.password, 10);

        const newUser = await User.create({
          name: userData.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: 'patient', // Default role for new registrations
        });

        // Create session for the new user
        req.session.user = {
          id: newUser._id.toString(),
          role: newUser.role,
          email: newUser.email,
          name: newUser.name
        };

        console.log('✅ [REGISTER] New user account created and logged in:', newUser.email);

        return res.json({
          message: 'Account created successfully',
          success: true,
          user: {
            id: String(newUser._id),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        });
      } catch (createError) {
        console.error('❌ Account creation failed:', createError);
        return res.status(500).json({ error: 'Failed to create account' });
      }
    }

    // If no userData provided, just verify OTP without creating account
    return res.json({
      message: 'OTP verified successfully',
      success: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.get('/me', async (req, res) => {
  try {
    if (!req.session.user) return res.json({ user: null });
    const u = await User.findById(req.session.user.id).lean().select('-passwordHash');
    if (!u) return res.json({ user: null });
    const user = { ...u, id: String(u._id) };
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch session user' });
  }
});

router.post('/register', async (req, res) => {
  try {
    if (env.NODE_ENV !== 'production') {
      const ct = req.headers['content-type'];
      const bodyPreview = { ...req.body };
      if (bodyPreview && typeof bodyPreview.password === 'string') {
        bodyPreview.password = `***len:${bodyPreview.password.length}`;
      }
      console.log('[AUTH] /register content-type:', ct, 'body keys:', Object.keys(req.body || {}), 'body:', bodyPreview);
    }
    const registerSchema = z.object({
      name: z.string().trim().min(1),
      email: z.string().trim().email(),
      password: z.string().min(6),
      role: z.enum(['patient', 'doctor', 'admin']).optional(),
      phone: z.string().optional(),
      country: z.string().optional(),
    });
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      if (env.NODE_ENV !== 'production') {
        console.warn('[AUTH] /register invalid input:', parsed.error.flatten());
      }
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { name, email, password, role = 'patient', phone, country } = parsed.data;
    const emailNormalized = email.trim().toLowerCase();

    const existing = await User.findOne({ email: emailNormalized });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    // Only allow privileged roles for the owner email
    let finalRole = 'patient';
    if ((role === 'doctor' || role === 'admin') && env.OWNER_EMAIL && emailNormalized === env.OWNER_EMAIL.toLowerCase()) {
      finalRole = role;
    }
    const userDoc = await User.create({ name: name.trim(), email: emailNormalized, passwordHash, role: finalRole, phone, country });
    req.session.user = { id: userDoc._id.toString(), role: userDoc.role, email: userDoc.email, name: userDoc.name };
    const clean = userDoc.toJSON();
    const user = { ...clean, id: String(userDoc._id) };
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (env.NODE_ENV !== 'production') {
      const ct = req.headers['content-type'];
      const bodyPreview = { ...req.body };
      if (bodyPreview && typeof bodyPreview.password === 'string') {
        bodyPreview.password = `***len:${bodyPreview.password.length}`;
      }
      console.log('[AUTH] /login content-type:', ct, 'body keys:', Object.keys(req.body || {}), 'body:', bodyPreview);
    }
    const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      if (env.NODE_ENV !== 'production') {
        console.warn('[AUTH] /login invalid input:', parsed.error.flatten());
      }
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;
    const emailNormalized = email.trim().toLowerCase();

    // Check if this is the doctor auto-login credentials
    const doctorEmail = process.env.VITE_DOCTOR_EMAIL || 'doctor@example.com';
    const doctorPassword = process.env.VITE_DOCTOR_PASSWORD || '123321';
    
    if (emailNormalized === doctorEmail.toLowerCase() && password === doctorPassword) {
      // Auto-create or update doctor account
      let userDoc = await User.findOne({ email: emailNormalized });
      
      if (!userDoc) {
        // Create doctor account if it doesn't exist
        const passwordHash = await bcrypt.hash(password, 10);
        userDoc = await User.create({
          name: 'Dr. Ilango S. Prakasam',
          email: emailNormalized,
          passwordHash,
          role: 'doctor',
          phone: '+91-9876543210',
          specialization: 'Nephrology',
          title: 'Sr. Nephrologist',
          qualifications: 'MD, DNB (Nephrology), MRCP (UK)',
          experience: '15+ Years Experience',
          bio: 'A distinguished nephrologist with over 15 years of expertise in comprehensive kidney care. Dr. Krishnamurthy has successfully treated over 5,000 patients worldwide through innovative telemedicine solutions and evidence-based treatment protocols.'
        });
      } else if (userDoc.role !== 'doctor') {
        // Update existing user to doctor role
        userDoc.role = 'doctor';
        await userDoc.save();
      } else {
        // Update password if needed
        const passwordMatches = await bcrypt.compare(password, userDoc.passwordHash);
        if (!passwordMatches) {
          userDoc.passwordHash = await bcrypt.hash(password, 10);
          await userDoc.save();
        }
      }
      
      req.session.user = { id: userDoc._id.toString(), role: 'doctor', email: userDoc.email, name: userDoc.name };
      const clean = userDoc.toJSON();
      const user = { ...clean, id: String(userDoc._id), role: 'doctor' };
      return res.json({ user });
    }

    // Regular login flow
    const userDoc = await User.findOne({ email: emailNormalized });
    if (!userDoc) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, userDoc.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Create session
    req.session.user = { id: userDoc._id.toString(), role: userDoc.role, email: userDoc.email, name: userDoc.name };
    
    console.log('✅ [LOGIN] Session created:', {
      sessionId: req.sessionID,
      user: req.session.user,
      cookie: req.session.cookie
    });
    
    const clean = userDoc.toJSON();
    const user = { ...clean, id: String(userDoc._id) };
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Firebase Google Login
router.post('/firebase-login', async (req, res) => {
  console.log('🔥 [FIREBASE LOGIN] Request received');
  console.log('🔥 [FIREBASE LOGIN] Body:', { idToken: !!req.body.idToken, user: !!req.body.user });
  console.log('🔥 [FIREBASE LOGIN] Session before:', !!req.session, req.sessionID);

  try {
    const { idToken, user: firebaseUser } = req.body;

    if (!firebaseAuth) {
      console.log('❌ [FIREBASE LOGIN] Firebase not configured');
      return res.status(500).json({ error: 'Firebase not configured' });
    }

    console.log('🔥 [FIREBASE LOGIN] Verifying ID token...');

    // Verify the Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    if (decodedToken.uid !== firebaseUser.uid) {
      console.log('❌ [FIREBASE LOGIN] Token verification failed:', decodedToken.uid, 'vs', firebaseUser.uid);
      return res.status(401).json({ error: 'Token verification failed' });
    }

    console.log('✅ [FIREBASE LOGIN] Token verified for:', firebaseUser.email);

    // Check if user exists in database
    let user = await User.findOne({ 
      $or: [
        { email: firebaseUser.email },
        { firebaseUid: firebaseUser.uid }
      ]
    });

    // Admin emails list
    const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
    const isAdmin = adminEmails.includes(firebaseUser.email);

    if (!user) {
      // Create new user
      user = new User({
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL,
        role: isAdmin ? 'admin' : 'patient',
        isEmailVerified: true, // Firebase emails are verified
        authProvider: 'google'
      });
      await user.save();
      console.log(`👤 Created new user with role: ${user.role} for ${user.email}`);
    } else {
      // Update existing user with Firebase info
      user.firebaseUid = firebaseUser.uid;
      user.photoURL = firebaseUser.photoURL;
      user.isEmailVerified = true;
      user.authProvider = 'google';
      
      // Update role to admin if needed
      if (isAdmin && user.role !== 'admin') {
        console.log('🔧 Updating existing user role to admin for:', user.email);
        user.role = 'admin';
      }
      
      await user.save();
    }

    // Create session - ensure admin/doctor users get correct role  
    let sessionRole = user.role;
    
    // Force admin role for admin emails
    if (adminEmails.includes(user.email)) {
      sessionRole = 'admin';
    }
    
    // Also ensure doctor role for suyambu email
    if (user.email === 'suyambu54321@gmail.com') {
      sessionRole = 'doctor'; // Doctor can also see all appointments
    }
    
    console.log(`🔐 Creating session for ${user.email} with role: ${sessionRole} (DB role: ${user.role})`);
    
    req.session.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: sessionRole,
      photoURL: user.photoURL
    };

    console.log('🔥 [FIREBASE LOGIN] Session user set:', req.session.user);
    console.log('🔥 [FIREBASE LOGIN] Session after:', !!req.session, req.sessionID, !!req.session.user);

    const userResponse = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: sessionRole, // Use session role, not DB role
      photoURL: user.photoURL,
      isEmailVerified: user.isEmailVerified
    };

    console.log('🔥 [FIREBASE LOGIN] Response user:', userResponse);

    return res.json({ user: userResponse });
  } catch (error) {
    console.error('❌ [FIREBASE LOGIN] Error:', error);
    return res.status(500).json({ error: 'Firebase authentication failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie('nephro.sid');
      return res.json({ ok: true });
    });
  } catch {
    return res.json({ ok: true });
  }
});

// Restore session from user data (for admin panel)
router.post('/restore-session', async (req, res) => {
  try {
    const { user: userData } = req.body;
    
    if (!userData || !userData.email) {
      return res.status(400).json({ error: 'User data required' });
    }

    // Admin emails list
    const adminEmails = ['rohit367673@gmail.com', 'suyambu54321@gmail.com'];
    
    // Find user in database
    console.log('🔍 Looking for user in database:', userData.email);
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      console.log('❌ User not found in database:', userData.email);
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role to admin if in admin emails list
    if (adminEmails.includes(userData.email) && user.role !== 'admin') {
      console.log('🔧 Updating user role to admin for:', userData.email);
      user.role = 'admin';
      await user.save();
    }

    console.log('👤 Found user in database:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Create/restore session
    req.session.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      photoURL: user.photoURL
    };

    console.log('💾 Session created:', req.session.user);
    console.log('🔒 Session ID:', req.sessionID);
    console.log('✅ Session restored for user:', user.email, 'Role:', user.role);
    return res.json({ success: true, user: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Session restore error:', error);
    return res.status(500).json({ error: 'Failed to restore session' });
  }
});

// TEMP: Fix user role to admin
router.post('/fix-admin-role', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    console.log('🔧 Fixing admin role for:', email);
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Role updated:', user.email, 'is now', user.role);
    return res.json({ 
      message: 'Role updated successfully',
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error fixing admin role:', error);
    return res.status(500).json({ error: 'Failed to update role' });
  }
});

// Simple user creation endpoint for testing (development only)
router.post('/create-test-user', async (req, res) => {
  try {
    if (env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name || 'Test User',
      email: email.toLowerCase(),
      passwordHash,
      role: 'patient',
      phone: '+91-9876543210',
      country: 'IN'
    });

    // Log them in immediately
    req.session.user = { 
      id: newUser._id.toString(), 
      role: 'patient', 
      email: newUser.email, 
      name: newUser.name 
    };

    const user = { 
      id: String(newUser._id), 
      role: 'patient',
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      country: newUser.country
    };

    console.log('Created and logged in test user:', user.email);
    return res.json({ user });
    
  } catch (error) {
    console.error('Error creating test user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Test email configuration
router.get('/test-email-config', async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');

    const config = {
      emailEnabled: flags.emailEnabled,
      hasApiKey: !!env.SMTP_PASS,
      hasFromAddress: !!env.SMTP_FROM,
      apiKeyPrefix: env.SMTP_PASS ? env.SMTP_PASS.substring(0, 10) + '...' : 'not set',
      fromAddress: env.SMTP_FROM || 'not set'
    };

    console.log('📧 Email config test:', config);

    // Try to send a test email if configured
    if (flags.emailEnabled) {
      try {
        const testEmailResult = await sendOTPEmail(
          'test@example.com',
          'Test Email Configuration',
          '<h1>Test Email</h1><p>This is a test to verify email configuration.</p>'
        );

        console.log('✅ Email test result:', testEmailResult);

        return res.json({
          success: true,
          config,
          testResult: testEmailResult,
          message: 'Email configuration is working'
        });
      } catch (emailError) {
        console.error('❌ Email test failed:', emailError.message);
        return res.json({
          success: false,
          config,
          error: emailError.message,
          message: 'Email configuration exists but test failed'
        });
      }
    } else {
      return res.json({
        success: false,
        config,
        message: 'Email service not configured - missing API key or from address'
      });
    }
  } catch (error) {
    console.error('❌ Email config test error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error testing email configuration'
    });
  }
});

export default router;
