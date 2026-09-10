/**
 * CGAPH - Cart, Checkout & Wishlist Management
 */

const CART_STORAGE_KEY = 'cgaph_cart_v1';
const WISHLIST_STORAGE_KEY = 'cgaph_wishlist_v1';
const COUPON_STORAGE_KEY = 'cgaph_coupon_v1';

export const COUPONS = {
  'ATOMIC20': { discountPercent: 20, description: '20% off Shadow Signature collection' },
  'CGAPH10': { discountPercent: 10, description: '10% off storewide' },
  'FREESHIP': { freeShipping: true, description: 'Complimentary Express Shipping' }
};

/**
 * Retrieve current cart items
 */
export function getCart() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Save cart items and trigger custom update event
 */
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}

/**
 * Add an item to cart
 */
export function addToCart(product, size = 'M', color = '#0B0B0E', colorName = 'Black', quantity = 1, customDesign = null) {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => 
    item.id === product.id && 
    item.size === size && 
    item.color === color && 
    (!customDesign || (item.customDesign && item.customDesign.previewImage === customDesign.previewImage))
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += Number(quantity);
  } else {
    cart.push({
      cartItemId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: customDesign ? customDesign.previewImage : (product.images ? product.images[0] : ''),
      size: size || 'Standard',
      color: color,
      colorName: colorName || 'Default',
      quantity: Number(quantity) || 1,
      customDesign: customDesign || null
    });
  }

  saveCart(cart);
  return cart;
}

/**
 * Update item quantity
 */
export function updateCartQuantity(cartItemId, newQty) {
  const cart = getCart();
  const item = cart.find(i => i.cartItemId === cartItemId);
  if (item) {
    if (newQty <= 0) {
      return removeFromCart(cartItemId);
    }
    item.quantity = Number(newQty);
    saveCart(cart);
  }
  return cart;
}

/**
 * Remove an item from cart
 */
export function removeFromCart(cartItemId) {
  let cart = getCart();
  cart = cart.filter(i => i.cartItemId !== cartItemId);
  saveCart(cart);
  return cart;
}

/**
 * Clear the cart completely
 */
export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(COUPON_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: [] } }));
}

/**
 * Apply a promo coupon
 */
export function applyCoupon(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (COUPONS[cleanCode]) {
    const coupon = { code: cleanCode, ...COUPONS[cleanCode] };
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: getCart() } }));
    return { success: true, coupon };
  }
  return { success: false, message: 'Invalid or expired promo code' };
}

/**
 * Get active coupon
 */
export function getActiveCoupon() {
  const raw = localStorage.getItem(COUPON_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Remove applied coupon
 */
export function removeCoupon() {
  localStorage.removeItem(COUPON_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: getCart() } }));
}

/**
 * Calculate totals (Subtotal, Discount, Taxes, Shipping, Final Total)
 */
export function getCartTotals(shippingMethod = 'standard') {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const coupon = getActiveCoupon();
  let discount = 0;
  if (coupon && coupon.discountPercent) {
    discount = (subtotal * coupon.discountPercent) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08; // 8% estimated sales tax

  let shipping = 0;
  if (coupon && coupon.freeShipping) {
    shipping = 0;
  } else if (subtotal > 75 || subtotal === 0) {
    shipping = shippingMethod === 'express' ? 12.00 : 0.00;
  } else {
    shipping = shippingMethod === 'express' ? 14.99 : 4.99;
  }

  const total = taxableAmount + tax + shipping;

  return {
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    coupon
  };
}

/* ==========================================================================
   Wishlist Management
   ========================================================================== */

export function getWishlist() {
  const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function toggleWishlist(productId) {
  let wishlist = getWishlist();
  const isPresent = wishlist.includes(productId);
  if (isPresent) {
    wishlist = wishlist.filter(id => id !== productId);
  } else {
    wishlist.push(productId);
  }
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: { wishlist, toggled: productId, active: !isPresent } }));
  return !isPresent;
}

export function isInWishlist(productId) {
  return getWishlist().includes(productId);
}
