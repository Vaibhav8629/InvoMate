const jwt = require("jsonwebtoken");
const User = require("../models/Register");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = async (req, res, next) => { 
	const token = req.header("Authorization");
	
	if(!token) return res.status(400).json({msg : "error"});
	
	const jwtToken = token.split(" ")[1];
	
	try{
	const isVerified = jwt.verify(jwtToken, process.env.JWT_SIGN); 
	const userData = await User.findOne({email : isVerified.email}).select({password:0});
	req.user = userData; 
	req.id = userData._id;
	next();
	} catch(error){
        return res.status(401).json({ msg: "Invalid token" });
    }
}

module.exports = authMiddleware;