// cart-manager.js
class CartManager {
    constructor() {
      this.cartKey = 'ecommerceCart';
      this.cart = this.loadCart();
      this.initEventListeners();
      this.updateCartDisplay();
    }
  
    // Initialize cart from localStorage
    loadCart() {
      const cart = localStorage.getItem(this.cartKey);
      return cart ? JSON.parse(cart) : [];
    }
  
    // Save cart to localStorage
    persistCart() {
      localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    }
  
    // Add item to cart
    addItem(item) {
      const existingItem = this.cart.find(i => i.id === item.id && i.variant === item.variant);
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        this.cart.push({ 
          ...item,
          quantity: item.quantity
        });
      }
      
      this.persistCart();
      this.updateCartDisplay();
    }
  
    // Remove item from cart
    removeItem(itemId, variant) {
      this.cart = this.cart.filter(item => 
        !(item.id === itemId && item.variant === variant)
      );
      this.persistCart();
      this.updateCartDisplay();
    }
  
    // Update item quantity
    updateQuantity(itemId, variant, newQuantity) {
      const item = this.cart.find(i => 
        i.id === itemId && i.variant === variant
      );
      
      if (item) {
        item.quantity = Math.max(1, newQuantity);
        this.persistCart();
        this.updateCartDisplay();
      }
    }
  
    // Calculate total price
    calculateTotal() {
      return this.cart.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      ).toFixed(2);
    }
  
    // Render cart items
    renderCart() {
      const cartItems = document.getElementById('cart-items');
      const totalElement = document.getElementById('cart-total');
      
      if (!this.cart.length) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalElement.textContent = '$0.00';
        return;
      }
  
      cartItems.innerHTML = this.cart.map(item => `
        <div class="cart-item" data-id="${item.id}" data-variant="${item.variant}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>Variant: ${item.variant}</p>
            <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
          </div>
          <div class="cart-item-controls">
            <input type="number" 
                   class="quantity-input" 
                   value="${item.quantity}" 
                   min="1"
                   data-action="updateQuantity">
            <button class="remove-item" data-action="removeItem">
              Remove
            </button>
          </div>
        </div>
      `).join('');
  
      totalElement.textContent = `$${this.calculateTotal()}`;
    }
  
    // Handle UI events
    handleCartAction(e) {
      const target = e.target;
      const cartItem = target.closest('.cart-item');
      
      if (!cartItem) return;
  
      const itemId = cartItem.dataset.id;
      const variant = cartItem.dataset.variant;
  
      if (target.dataset.action === 'removeItem') {
        this.removeItem(itemId, variant);
      } else if (target.classList.contains('quantity-input')) {
        this.updateQuantity(itemId, variant, parseInt(target.value));
      }
    }
  
    // Initialize event listeners
    initEventListeners() {
      document.getElementById('cart-container').addEventListener(
        'click', this.handleCartAction.bind(this)
      );
      
      document.addEventListener('addToCart', (e) => {
        this.addItem(e.detail);
      });
    }
  
    // Update cart UI and badge
    updateCartDisplay() {
      this.renderCart();
      const cartBadge = document.getElementById('cart-badge');
      if (cartBadge) {
        cartBadge.textContent = this.cart.reduce(
          (count, item) => count + item.quantity, 0
        );
      }
    }
  }
  
  // Initialize cart manager
  const cartManager = new CartManager();
  
  // Example usage to add items:
  document.getElementById('add-to-cart-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const itemData = {
      id: 'product-123',
      name: 'Premium Headphones',
      price: 299.99,
      variant: 'black',
      image: 'headphones.jpg',
      quantity: parseInt(document.getElementById('quantity').value)
    };
  
    const addToCartEvent = new CustomEvent('addToCart', {
      detail: itemData
    });
    
    document.dispatchEvent(addToCartEvent);
  });