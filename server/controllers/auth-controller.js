const User = require("../models/Register")
const bcrypt = require("bcryptjs");

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


module.exports = { register, login, logout, user, testCookie };       