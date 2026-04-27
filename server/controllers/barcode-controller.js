const Product = require("../models/Product");

const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ item_code: req.params.code });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {getProductByBarcode}