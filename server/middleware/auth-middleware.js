const jwt = require("jsonwebtoken");
const User = require("../models/Register");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = async (req, res, next) => { 
	// Read token from cookies instead of Authorization header
	const token = req.cookies.token;
	
	console.log("🔍 Auth Middleware - Cookies received:", req.cookies);
	console.log("🔍 Auth Middleware - Token:", token ? token.substring(0, 20) + "..." : "NO TOKEN");
	
	if(!token) {
		console.log("❌ No token found in cookies");
		return res.status(401).json({msg : "Unauthorized - No token provided"});
	}
	
	try{
		// JWT verification logic remains unchanged
		const secret = process.env.JWT_SECRET || process.env.JWT_SIGN;
		const isVerified = jwt.verify(token, secret); 
		const userData = await User.findOne({email : isVerified.email}).select({password:0});
		
		if (!userData) {
			console.log("❌ User not found for token");
			return res.status(401).json({ msg: "User not found" });
		}

		if (userData.passwordChangedAt) {
			const passwordChangedAt = Math.floor(new Date(userData.passwordChangedAt).getTime() / 1000);
			if (isVerified.iat && isVerified.iat < passwordChangedAt) {
				return res.status(401).json({ msg: "Session expired. Please log in again." });
			}
		}
		
		console.log("✅ Token verified for user:", userData.email);
		
		req.user = userData; 
		req.id = userData._id;
		next();
	} catch(error){
		console.error("❌ Token verification failed:", error.message);
		return res.status(401).json({ msg: "Invalid token" });
	}
}

module.exports = authMiddleware;