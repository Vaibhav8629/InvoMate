const Product = require("../models/Product");


const getMyProducts = async (req, res) => {
    const userData = req.user;
    try {
        const products = await Product.find({
            user: userData._id
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching products" });
    }
}


const addProducts = async (req, res) => {
    const userData = req.user;
    try {
        const { item, price, category, GST, Stock, HSN, item_code, profit } = req.body;

        const product = await Product.create({
            item_code,
            HSN,
            item,
            price,
            category,
            GST,
            Stock,
            profit,

            user: userData._id
        });

        res.status(200).json(product);

    } catch (error) {
        console.log(error);
    }
}


const updateProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { _id, ...updateFields } = req.body;
        if (!_id) {
            return res.status(400).json({ message: "Product ID is required." });
        }

        const updatedData = await Product.findOneAndUpdate(
            { _id: _id, user: userId }, 
            updateFields,
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({ message: "Product not found." });
        }
        res.status(200).json({ message: "Product updated successfully." });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { getMyProducts, addProducts, updateProduct, deleteProduct };