const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

exports.createMovement = async (req, res) => {
  try {
    const { productId, type, quantity, notes } = req.body;

    let product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Store previous stock for WebSocket notification
    const previousStock = product.currentStock;

    // Update stock
    if (type === "IN") {
      product.currentStock += quantity;
    } else if (type === "OUT") {
      product.currentStock = Math.max(0, product.currentStock - quantity);
    }

    await product.save();

    // Create stock movement record
    const movement = await StockMovement.create({ 
      productId, 
      type, 
      quantity,
      notes: notes || `${type} movement of ${quantity} units`,
      createdAt: new Date()
    });

    // Emit WebSocket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('stockUpdate', {
        productId: productId,
        productName: product.name,
        previousStock: previousStock,
        newStock: product.currentStock,
        movement: {
          type,
          quantity,
          timestamp: new Date()
        }
      });

      // Check for low stock alert
      if (product.currentStock <= product.safetyStock && product.currentStock > 0) {
        io.emit('lowStockAlert', {
          productId: productId,
          productName: product.name,
          currentStock: product.currentStock,
          safetyStock: product.safetyStock,
          timestamp: new Date()
        });
      }

      // Check for out of stock alert
      if (product.currentStock === 0) {
        io.emit('lowStockAlert', {
          productId: productId,
          productName: product.name,
          currentStock: product.currentStock,
          safetyStock: product.safetyStock,
          outOfStock: true,
          timestamp: new Date()
        });
      }
    }

    res.json({
      message: "Stock updated successfully",
      product,
      movement,
      realTimeUpdate: true
    });
  } catch (err) {
    console.error('Stock movement error:', err);
    res.status(400).json({ error: err.message });
  }
};
