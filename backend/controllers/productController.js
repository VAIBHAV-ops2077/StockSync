const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    console.log("Creating product with data:", req.body);
    const product = await Product.create(req.body);
    console.log("Product created successfully:", product);
    res.json(product);
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    console.log("Fetching products from database...");
    const products = await Product.find();
    console.log(`Found ${products.length} products in database`);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: err.message });
  }
};
