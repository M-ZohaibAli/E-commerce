// cart.controller.js
const Cart = require('./cart.model');
const Product = require('./product.model');
const { emitCartUpdate } = require('../websocket');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'name price images');
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, variant } = req.body;
    
    // Validate product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      {
        $setOnInsert: { userId: req.user._id },
        $push: {
          items: {
            productId,
            quantity,
            variant: variant || 'default',
            price: product.price
          }
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true, new: true }
    ).populate('items.productId', 'name price images');

    emitCartUpdate(req.user._id, cart);
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOneAndUpdate(
      { 
        userId: req.user._id,
        'items._id': itemId 
      },
      {
        $set: {
          'items.$.quantity': quantity,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).populate('items.productId', 'name price images');

    if (!cart) return res.status(404).json({ message: 'Item not found' });

    emitCartUpdate(req.user._id, cart);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      {
        $pull: { items: { _id: itemId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).populate('items.productId', 'name price images');

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    emitCartUpdate(req.user._id, cart);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing item' });
  }
};