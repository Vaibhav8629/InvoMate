const User = require("../models/Register")
const bcrypt = require("bcryptjs");


const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const UserExist = await User.findOne({ email: email });
        if (UserExist) return res.status(400).json({ msg: "email already exists" });
        const userCreated = await User.create({ username, email, password });
        res.status(200).json({ token: await userCreated.generateToken(), userId: userCreated._id.toString() });
    } catch (error) {
        console.log(error);
    }
}


const login = async (req, res) => {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (!userExist) return res.status(400).json({ msg: "Invalid Credentials" });
    const user = await bcrypt.compare(password, userExist.password);
    if (!user) return res.status(401).json({ msg: "Invalid Credentials" });
    res.status(200).json({
        msg: "Login successful",
        userId: userExist._id.toString(),
        token: await userExist.generateToken(),
    })
}


const user = async (req, res) => {
    const userData = req.user;
    return res.status(200).json(userData);
}


module.exports = { register, login, user };       