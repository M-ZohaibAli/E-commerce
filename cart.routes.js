// cart.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('./cart.controller');

router.get('/', auth, controller.getCart);
router.post('/items', auth, controller.addToCart);
router.put('/items/:itemId', auth, controller.updateCartItem);
router.delete('/items/:itemId', auth, controller.removeCartItem);

module.exports = router;