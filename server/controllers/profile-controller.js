const Profile = require("../models/Profile");


const findProfile = async (req, res) => {
    const userData = req.user;
    try {
        const data = await Profile.findOne({
            user: userData._id
        });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching products" });
    }
}


const createProfile = async (req, res) => {
    const userData = req.user;
    try {
        const { ShopName, GSTNumber, Address, Phone, Email, Pincode, ShopCode } = req.body;

        const profile = await Profile.create({
            ShopName,
            GSTNumber,
            Address,
            Phone,
            Email,
            Pincode,
            ShopCode,
            // DigitalStamp,
            user: userData._id
        });

        res.status(200).json(profile);

    } catch (error) {
        console.log(error);
    }
}


const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const userExist = await Profile.findOne({ user: userId });

        if (!userExist) {
            return res.status(404).json({ message: "Profile not found." });
        }

        const updatedData = await Profile.findOneAndUpdate(
            { user: userId },
            req.body,
            { new: true }
        );

        res.status(200).json({ message: "Profile Updated successfully." });

    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};


module.exports = { findProfile, updateProfile, createProfile };