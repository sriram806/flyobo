import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import sendMail from "../config/nodemailer.js";
import { generateOTP } from "../services/otp.services.js";
import { createSendToken } from "../services/auth.services.js";
import { NODE_ENV, FRONTEND_URL } from "../config/env.js";
import { signToken } from "../services/auth.services.js";
import { applyReferralCode } from "./user.controller.js";

const buildCookieForToken = (res, token) => {
  // replicate cookie options from createSendToken
  const { NODE_ENV: _NODE_ENV, FRONTEND_URL: _FRONTEND_URL, JWT_EXPIRES_IN } = process.env;
  const expires = JWT_EXPIRES_IN || '7d';
  // derive domain
  let cookieDomain;
  try {
    const raw = process.env.COOKIE_DOMAIN || _FRONTEND_URL;
    if (raw) {
      const host = raw.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
      const isLocalhost = host === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
      if (!isLocalhost) {
        cookieDomain = host.startsWith('www.') ? `.${host.replace(/^www\./, '')}` : `.${host}`;
      } else {
        cookieDomain = undefined;
      }
    }
  } catch (e) {
    cookieDomain = undefined;
  }

  const isProd = (NODE_ENV && NODE_ENV.toLowerCase().trim() === "production");
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd && cookieDomain) ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };
  res.cookie('token', token, cookieOptions);
};
const postMessageAndClose = (res, frontendUrl, payload) => {
  const safe = JSON.stringify(payload).replace(/</g, '\\u003c');
  const configured = frontendUrl || '';
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
    (function(){
      try{
        var payload = ${safe};
        var openerAvailable = false;
        try {
          if (window.opener) openerAvailable = true;
        } catch(e) { openerAvailable = false; }

        if (openerAvailable) {
          // If the popup was opened by the frontend, try to postMessage and close.
          var target = '*';
          try {
            if (window.opener && window.opener.location && window.opener.location.origin) {
              target = window.opener.location.origin;
            }
          } catch(e) {
            // ignore cross-origin access errors and fall back to '*'
          }
          try { window.opener.postMessage(payload, target); } catch(e) { /* ignore */ }
          try{ window.close(); } catch(e){}
        } else {
          // No opener (e.g. in-app browser). Redirect to frontend with payload in fragment.
          try {
            var base = ${configured ? `'${configured.replace(/'/g, "\\'")}'` : "''"};
            if (!base) base = '/';
            if (base.endsWith('/')) base = base.slice(0, -1);
            var redirectUrl = base + '/auth/oauth-redirect#payload=' + encodeURIComponent(JSON.stringify(payload));
            window.location.href = redirectUrl;
          } catch(e) { /* ignore */ }
        }
      } catch(e) {}
    })();
  </script></body></html>`;
  res.send(html);
}

// 1. Registration
export const registration = async (req, res) => {
  let createdUser;
  try {
    const { name, email, password, referralCode, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode && referralCode.trim()) {
      referrer = await User.findOne({ 'referral.referralCode': referralCode.trim().toUpperCase() });
      if (!referrer) {
        return res.status(400).json({ success: false, message: "Invalid referral code." });
      }
    }

    const otp = generateOTP();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);

    createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      otp,
      otpExpireAt
    });

    // Apply referral code if provided
    if (referrer) {
      try {
        await applyReferralCode(referralCode.trim().toUpperCase(), createdUser._id);
      } catch (referralError) {
        console.error("Referral application error:", referralError);
      }
    }

    try {
      await sendMail({
        email: createdUser.email,
        subject: "Activate Your Flyobo Travel Account",
        template: "activation",
        data: { otp, name: createdUser.name, email: createdUser.email }
      });
    } catch (mailError) {
      console.error("Mail error:", mailError);
    }

    const message = referrer
      ? "Registration successful! OTP sent to your email. You've earned ₹50 welcome bonus!"
      : "Registration successful and OTP sent to your email";

    return createSendToken(createdUser, 201, res, message);
  } catch (error) {
    if (createdUser?._id) {
      try {
        await User.findByIdAndDelete(createdUser._id);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
    }
    return res.status(500).json({ success: false, message: "Server error during registration.", error: error.message });
  }
};

// 2. Verify OTP
export const VerifyOTP = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: "Please provide otp" });
  }

  const user = req.user;
  try {
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }
    if (!user.otpExpireAt || user.otpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Otp expired" });
    }

    user.isAccountVerified = true;
    user.otp = undefined;
    user.otpExpireAt = undefined;
    await user.save({ validateBeforeSave: false });

    return createSendToken(user, 200, res, "Account verified successfully");
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
}

// 3. Resend OTP
export const ResendOTP = async (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(authUser._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const newOtp = generateOTP();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpireAt = otpExpireAt;
    await user.save({ validateBeforeSave: false });

    try {
      await sendMail({
        email: user.email,
        subject: "Resend OTP for Verify Your Flyobo Account",
        template: "activation",
        data: { otp: newOtp, name: user.name, email: user.email }
      });
    } catch (mailError) {
      console.error("Mail error:", mailError);
    }

    return res.status(200).json({ success: true, message: "Otp resent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during resend" });
  }
}

// 4. Login 
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid User" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }

    user.password = undefined;
    createSendToken(user, 200, res, "Login successful");
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Logout
export const logout = async (req, res) => {
  try {
    let cookieDomain;
    try {
      const raw = process.env.COOKIE_DOMAIN || FRONTEND_URL;
      if (raw) {
        const host = raw.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
        const isLocalhost = host === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
        if (!isLocalhost) {
          cookieDomain = host.startsWith('www.') ? `.${host.replace(/^www\./, '')}` : `.${host}`;
        } else {
          cookieDomain = undefined;
        }
      }
    } catch (e) {
      cookieDomain = undefined;
    }

    const isProd = (NODE_ENV && NODE_ENV.toLowerCase().trim() === "production");
    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd && cookieDomain) ? "none" : "lax",
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };

    try {
      res.cookie("token", "", cookieOptions);
    } catch (cookieErr) {
      console.warn('logout: failed to clear cookie with computed options:', cookieErr?.message);
      try {
        const fallback = { ...cookieOptions, sameSite: 'lax' };
        if (fallback.domain) delete fallback.domain;
        res.cookie("token", "", fallback);
      } catch (e) {
        console.error('logout: fallback cookie clear also failed:', e?.message);
      }
    }
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// 6. Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetPasswordOtp = generateOTP();
    const resetPasswordOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOtp = resetPasswordOtp;
    user.resetPasswordOtpExpireAt = resetPasswordOtpExpireAt;
    await user.save({ validateBeforeSave: false });

    try {
      await sendMail({
        email: user.email,
        subject: "Reset Your Flyobo Account Password",
        template: "reset-password",
        data: { otp: resetPasswordOtp, name: user.name, email: user.email }
      });
    } catch (mailError) {
      console.error("Mail error:", mailError);
    }

    return res.status(200).json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during password reset" });
  }
}

// 7. Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!otp || !password) {
      return res.status(400).json({ success: false, message: "Please provide otp and password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }
    if (!user.resetPasswordOtpExpireAt || user.resetPasswordOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Otp expired" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpireAt = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during password reset" });
  }
}

// --- OAuth flows ---
export const googleRedirect = async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  // Allow an explicit redirect URI via env to avoid provider mismatch errors in different environments
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/google/callback`;
  console.log('Google OAuth redirect URI:', redirectUri);
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('openid email profile')}&access_type=offline&prompt=select_account`;
  return res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('No code');
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/google/callback`;
    console.log('Google OAuth callback redirect URI used for token exchange:', redirectUri);
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    if (!accessToken) return res.status(400).send('Failed to obtain access token');
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await userRes.json();
    const email = profile.email;
    if (!email) return res.status(400).send('Email not available from provider');
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.given_name || 'Google User',
        email,
        password: undefined,
        isAccountVerified: true,
        avatar: profile.picture || undefined,
        role: 'user'
      });
    }
    const token = signToken(user._id);
    buildCookieForToken(res, token);
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
    // post message back to opener
    return postMessageAndClose(res, FRONTEND_URL, { token, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).send('OAuth Error');
  }
};

export const githubRedirect = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/v1/auth/oauth/github/callback`;
  console.log('GitHub OAuth redirect URI:', redirectUri);
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('read:user user:email')}`;
  return res.redirect(url);
};

export const githubCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('No code');
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code })
    });
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(400).send('Failed to obtain access token');
    // Fetch user profile
    const userRes = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Flyobo-App' } });
    const profile = await userRes.json();
    // fetch emails to get primary verified email
    const emailsRes = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Flyobo-App' } });
    const emails = await emailsRes.json();
    let email = profile.email;
    if (!email && Array.isArray(emails)) {
      const primary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified);
      email = primary ? primary.email : null;
    }
    if (!email) return res.status(400).send('Email not available from GitHub');
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.login || 'GitHub User',
        email,
        password: undefined,
        isAccountVerified: true,
        avatar: profile.avatar_url || undefined,
        role: 'user'
      });
    }
    const token = signToken(user._id);
    buildCookieForToken(res, token);
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
    return postMessageAndClose(res, FRONTEND_URL, { token, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).send('OAuth Error');
  }
};

// Debugging endpoint to inspect computed cookie options and relevant envs
export const debugCookieInfo = (req, res) => {
  try {
    const raw = process.env.COOKIE_DOMAIN || FRONTEND_URL || '';
    let cookieDomain;
    try {
      if (raw) {
        const host = raw.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
        const isLocalhost = host === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
        if (!isLocalhost) {
          cookieDomain = host.startsWith('www.') ? `.${host.replace(/^www\./, '')}` : `.${host}`;
        } else {
          cookieDomain = undefined;
        }
      }
    } catch (e) {
      cookieDomain = undefined;
    }

    const isProd = (NODE_ENV && NODE_ENV.toLowerCase().trim() === 'production');
    const info = {
      NODE_ENV: NODE_ENV || process.env.NODE_ENV || 'unknown',
      FRONTEND_URL: FRONTEND_URL || process.env.FRONTEND_URL || null,
      COOKIE_DOMAIN_RAW: process.env.COOKIE_DOMAIN || null,
      computedCookieDomain: cookieDomain || null,
      cookieOptionsPreview: {
        httpOnly: true,
        secure: isProd,
        sameSite: (isProd && cookieDomain) ? 'none' : 'lax',
        path: '/',
        domain: cookieDomain || null,
      }
    };

    return res.status(200).json({ success: true, info });
  } catch (err) {
    console.error('debugCookieInfo error', err);
    return res.status(500).json({ success: false, message: 'Could not compute cookie info', error: err.message });
  }
};

