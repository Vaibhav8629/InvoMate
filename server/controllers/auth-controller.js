const User = require("../models/Register")
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const RESET_PASSWORD_EXPIRY_MINUTES = 15;

const buildResetPasswordEmail = ({ username, resetUrl }) => {
        const safeName = username || "there";

        return `
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reset your InvoMate password</title>
            </head>
            <body style="margin:0;padding:0;background:#070b14;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#070b14 0%,#0d1324 100%);padding:32px 16px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#0f172a;border:1px solid rgba(148,163,184,0.15);border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.45);">
                                <tr>
                                    <td style="padding:0;">
                                        <div style="height:8px;background:linear-gradient(90deg,#8b5cf6 0%,#4f46e5 45%,#06b6d4 100%);"></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:40px 40px 20px 40px;">
                                        <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(99,102,241,0.14);border:1px solid rgba(99,102,241,0.25);color:#c7d2fe;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">InvoMate</div>
                                        <h1 style="margin:20px 0 12px 0;font-size:32px;line-height:1.1;color:#f8fafc;letter-spacing:-0.04em;">Reset your password</h1>
                                        <p style="margin:0 0 24px 0;font-size:16px;line-height:1.7;color:#cbd5e1;">Hi ${safeName}, we received a request to reset the password for your InvoMate account. Use the button below to choose a new password.</p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;">
                                            <tr>
                                                <td align="center" style="border-radius:16px;background:linear-gradient(90deg,#8b5cf6 0%,#4f46e5 100%);">
                                                    <a href="${resetUrl}" style="display:inline-block;padding:16px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:16px;">Reset Password</a>
                                                </td>
                                            </tr>
                                        </table>
                                        <div style="padding:18px 20px;border-radius:18px;background:rgba(15,23,42,0.8);border:1px solid rgba(148,163,184,0.16);margin-bottom:24px;">
                                            <p style="margin:0;color:#f8fafc;font-size:14px;font-weight:700;">This link expires in 15 minutes.</p>
                                            <p style="margin:6px 0 0 0;color:#94a3b8;font-size:14px;line-height:1.6;">If you did not request this change, you can safely ignore this email and your password will remain unchanged.</p>
                                        </div>
                                        <p style="margin:0 0 6px 0;color:#94a3b8;font-size:14px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:</p>
                                        <p style="margin:0;font-size:13px;line-height:1.7;word-break:break-all;color:#93c5fd;">${resetUrl}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:0 40px 40px 40px;">
                                        <div style="height:1px;background:rgba(148,163,184,0.16);margin:24px 0 18px 0;"></div>
                                        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;text-align:center;">InvoMate · Smart billing and GST management for modern businesses</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
        `;
};

// Test endpoint to verify cookie functionality
const testCookie = async (req, res) => {
    try {
        console.log("🧪 Test Cookie Endpoint");
        console.log("Cookies received:", req.cookies);
        
        // Set a test cookie with cross-origin support
        res.cookie("testCookie", "testValue", {
            httpOnly: true,
            secure: true, // Required for cross-origin cookies
            sameSite: "none", // Required for cross-origin cookies
            maxAge: 60000, // 1 minute
            path: "/",
        });
        
        res.status(200).json({ 
            msg: "Test cookie set",
            cookiesReceived: req.cookies,
            testCookieSet: true
        });
    } catch (error) {
        console.error("Test cookie error:", error);
        res.status(500).json({ msg: "Test failed" });
    }
};


const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const UserExist = await User.findOne({ email: email });
        if (UserExist) return res.status(400).json({ msg: "email already exists" });
        const userCreated = await User.create({ username, email, password });
        
        const token = await userCreated.generateToken();
        
        console.log("🍪 Setting cookie for new user:", token.substring(0, 20) + "...");
        
        // Set JWT as httpOnly cookie with cross-origin support
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Required for cross-origin cookies
            sameSite: "none", // Required for cross-origin cookies
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: "/",
        });
        
        console.log("✅ Cookie set successfully for new user");
        
        res.status(200).json({ 
            msg: "Registration successful",
            userId: userCreated._id.toString() 
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ msg: "Server error" });
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExist = await User.findOne({ email });
        if (!userExist) return res.status(400).json({ msg: "Invalid Credentials" });
        
        const user = await bcrypt.compare(password, userExist.password);
        if (!user) return res.status(401).json({ msg: "Invalid Credentials" });
        
        if (userExist.subscription === false) {
            return res.status(403).json({
                success: false,
                message: "Your subscription is inactive. Please contact admin."
            });
        }
        
        const token = await userExist.generateToken();
        
        console.log("🍪 Setting cookie with token:", token.substring(0, 20) + "...");
        
        // Set JWT as httpOnly cookie with cross-origin support
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Required for cross-origin cookies
            sameSite: "none", // Required for cross-origin cookies
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: "/",
        });
        
        console.log("✅ Cookie set successfully");
        
        res.status(200).json({
            msg: "Login successful",
            userId: userExist._id.toString(),
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ msg: "Server error" });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ msg: "If an account exists, a reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const resetPasswordExpire = new Date(Date.now() + RESET_PASSWORD_EXPIRY_MINUTES * 60 * 1000);

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/auth/reset-password/${resetToken}`;
        const html = buildResetPasswordEmail({ username: user.username, resetUrl });

        try {
            await sendEmail({
                to: user.email,
                subject: "Reset your InvoMate password",
                html,
            });
        } catch (sendErr) {
            console.error("❌ sendEmail failed for", user.email);
            try { console.error(sendErr?.message || sendErr); } catch (e) { console.error(e); }
            // If sending fails, still respond with generic success to avoid account enumeration
            return res.status(500).json({ msg: "Unable to send reset email. Check server logs." });
        }

        return res.status(200).json({ msg: "If an account exists, a reset link has been sent." });
    } catch (error) {
        console.error("❌ Forgot password error:", error);
        return res.status(500).json({ msg: "Unable to process password reset request." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({ msg: "Password and confirmation are required." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ msg: "Passwords do not match." });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters long." });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired reset token." });
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        user.passwordChangedAt = new Date();
        await user.save();

        return res.status(200).json({ msg: "Password reset successful." });
    } catch (error) {
        console.error("❌ Reset password error:", error);
        return res.status(500).json({ msg: "Unable to reset password." });
    }
};


const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true, // Required for cross-origin cookies
            sameSite: "none", // Required for cross-origin cookies
            path: "/",
        });
        res.status(200).json({ msg: "Logout successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Server error" });
    }
}


const user = async (req, res) => {
    const userData = req.user;
    return res.status(200).json(userData);
}

module.exports = { register, login, logout, user, testCookie, forgotPassword, resetPassword };        
