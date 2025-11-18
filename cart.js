const CART_KEY = 'weilglassCart';

// Load / save cart in localStorage
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Add item to cart
function addToCart(id, name, price, category) {
  const cart = loadCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id,
      name,
      price: parseFloat(price),
      category,
      quantity: 1
    });
  }
  saveCart(cart);
  updateCartCount();
  alert('Added to cart.');
}

// Called from buttons in store.html
function addToCartFromButton(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const price = btn.dataset.price;
  const category = btn.dataset.category;
  addToCart(id, name, price, category);
}

// Update cart count in nav
function updateCartCount() {
  const cart = loadCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

// Format as currency
function formatCurrency(n) {
  return '$' + n.toFixed(2);
}

// Render cart page
function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = loadCart();

  if (!cart.length) {
    container.innerHTML = '<p style="font-size:14px;opacity:0.9;">Your cart is empty.</p>';
    return;
  }

  let total = 0;
  let rows = cart.map(item => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    return `
      <tr>
        <td>${item.name}<br><span style="font-size:11px;opacity:0.7;">${item.category}</span></td>
        <td>${formatCurrency(item.price)}</td>
        <td>
          <button class="cart-btn" onclick="changeQuantity('${item.id}', -1)">−</button>
          <span class="cart-qty">${item.quantity}</span>
          <button class="cart-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
        </td>
        <td>${formatCurrency(lineTotal)}</td>
        <td><button class="cart-btn cart-remove" onclick="removeFromCart('${item.id}')">x</button></td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="cart-table-wrapper">
      <table class="cart-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <div class="cart-total-row">
      <span>Cart Total:</span>
      <strong>${formatCurrency(total)}</strong>
    </div>
    <p style="font-size:12px;opacity:0.75;margin-top:6px;">
      Final total including shipping / insurance will be confirmed with you before the piece ships.
    </p>
  `;
}

// Change quantity
function changeQuantity(id, delta) {
  const cart = loadCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }
  saveCart(cart);
  updateCartCount();
  renderCartPage();
  renderCheckoutSummary();
}

// Remove item
function removeFromCart(id) {
  let cart = loadCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
  renderCheckoutSummary();
}

// Render summary on checkout page
function renderCheckoutSummary() {
  const box = document.getElementById('checkout-summary');
  if (!box) return;

  const cart = loadCart();
  if (!cart.length) {
    box.innerHTML = '<p style="font-size:14px;opacity:0.9;">Your cart is empty. Go back to the store to add items.</p>';
    return;
  }

  let total = 0;
  const itemsHtml = cart.map(item => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    return `
      <li>
        ${item.quantity} × ${item.name}
        <span style="float:right;">${formatCurrency(lineTotal)}</span>
      </li>
    `;
  }).join('');

  box.innerHTML = `
    <h3>Order Summary</h3>
    <ul style="list-style:none;padding-left:0;margin-top:12px;font-size:14px;line-height:1.6;">
      ${itemsHtml}
    </ul>
    <div class="cart-total-row" style="margin-top:10px;">
      <span>Subtotal:</span>
      <strong>${formatCurrency(total)}</strong>
    </div>
    <p style="font-size:12px;opacity:0.8;margin-top:6px;">
      Shipping and any extras (insurance, signature, etc.) will be confirmed with you after you send your shipping info.
    </p>
  `;
}

// Clear cart from checkout button
function clearCartAfterCheckout() {
  if (confirm('Clear cart from this device?')) {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCartPage();
    renderCheckoutSummary();
  }
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCartPage();
  renderCheckoutSummary();
});
