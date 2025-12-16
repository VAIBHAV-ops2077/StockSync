const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  currentStock: { type: Number, required: true, min: 0 },
  safetyStock: { type: Number, required: true, min: 0 },
  location: { type: String }
});

module.exports = mongoose.model("Product", productSchema);
