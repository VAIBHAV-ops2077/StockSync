const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  type: { type: String, enum: ["IN", "OUT"], required: true },
  quantity: { type: Number, required: true, min: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StockMovement", stockMovementSchema);
