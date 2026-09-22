const products = [
  { id: 1, name: "BPE Performance Shirt", price: 450, icon: "👕", description: "Comfortable shirt for BPE activities and events." },
  { id: 2, name: "BPE Training Shorts", price: 380, icon: "🩳", description: "Lightweight training shorts for active sessions." },

];

// Important: this is intentionally in-memory only.
// Nothing is written to localStorage, sessionStorage, cookies, or a database.
let cart = [];

const productGrid = document.getElementById("productGrid");
const productSearch = document.getElementById("productSearch");
const cartCount = document.getElementById("cartCount");
const orderModal = document.getElementById("orderModal");
const cartModal = document.getElementById("cartModal");
const selectedProduct = document.getElementById("selectedProduct");
const orderForm = document.getElementById("orderForm");
const buyerQty = document.getElementById("buyerQty");
const orderTotal = document.getElementById("orderTotal");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
let selectedProductId = null;

function money(value) {
  return `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderProducts(list = products) {
  productGrid.innerHTML = "";
  if (!list.length) {
    productGrid.innerHTML = `<p class="cart-empty">No products found.</p>`;
    return;
  }

  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-visual" aria-hidden="true">${product.icon}</div>
      <div class="product-meta">
        <h3>${product.name}</h3>
        <span class="price">${money(product.price)}</span>
      </div>
      <p>${product.description}</p>
      <div class="buy-row">
        <button class="btn btn-primary buy-now" type="button" data-id="${product.id}">Buy Now</button>
        <button class="btn btn-secondary add-cart" type="button" data-id="${product.id}" aria-label="Add ${product.name} to cart">+</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function openOrder(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;

  selectedProductId = product.id;
  buyerQty.value = "1";
  selectedProduct.innerHTML = `
    <span class="mini-icon">${product.icon}</span>
    <div><strong>${product.name}</strong><br><span>${money(product.price)} each</span></div>
  `;
  updateOrderTotal();
  document.getElementById("orderStep").hidden = false;
  document.getElementById("orderSuccess").hidden = true;
  orderModal.hidden = false;
  document.getElementById("buyerName").focus();
}

function updateOrderTotal() {
  const product = products.find(item => item.id === selectedProductId);
  if (!product) return;
  let quantity = Number.parseInt(buyerQty.value, 10);
  if (!Number.isFinite(quantity)) quantity = 1;
  quantity = Math.max(1, Math.min(10, quantity));
  buyerQty.value = quantity;
  orderTotal.textContent = money(product.price * quantity);
}

function addToCart(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.quantity = Math.min(10, existing.quantity + 1);
  else cart.push({ id: product.id, quantity: 1 });
  updateCartUI();
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalQty;

  if (!cart.length) {
    cartItems.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    cartTotal.textContent = money(0);
    return;
  }

  let total = 0;
  cartItems.innerHTML = "";

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-icon">${product.icon}</span>
        <div><strong>${product.name}</strong><br><small>${money(product.price)} each</small></div>
      </div>
      <div class="qty-controls">
        <button type="button" data-cart-action="minus" data-id="${product.id}" aria-label="Decrease quantity">−</button>
        <strong>${item.quantity}</strong>
        <button type="button" data-cart-action="plus" data-id="${product.id}" aria-label="Increase quantity">+</button>
      </div>
    `;
    cartItems.appendChild(row);
  });

  cartTotal.textContent = money(total);
}

function closeModal(modal) {
  modal.hidden = true;
}

productGrid.addEventListener("click", event => {
  const buyButton = event.target.closest(".buy-now");
  const addButton = event.target.closest(".add-cart");

  if (buyButton) openOrder(buyButton.dataset.id);
  if (addButton) {
    addToCart(addButton.dataset.id);
    addButton.textContent = "✓";
    setTimeout(() => { addButton.textContent = "+"; }, 700);
  }
});

productSearch.addEventListener("input", () => {
  const query = productSearch.value.trim().toLowerCase();
  const filtered = products.filter(p =>
    `${p.name} ${p.description}`.toLowerCase().includes(query)
  );
  renderProducts(filtered);
});

buyerQty.addEventListener("input", updateOrderTotal);

orderForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("buyerName").value.trim();
  const phone = document.getElementById("buyerPhone").value.trim();
  const payment = document.getElementById("paymentMethod").value;

  if (selectedProductId === null) {
    if (!cart.length) return;
    const snapshot = cart.map(item => ({ ...products.find(p => p.id === item.id), quantity: item.quantity }));
    const total = snapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const summary = snapshot.map(item => `${item.quantity} × ${item.name}`).join(", ");
    document.getElementById("successText").textContent = `Thank you, ${name}! Your order for ${summary} has been confirmed. Total: ${money(total)}. Payment: ${payment}. Contact: ${phone}.`;
    cart = [];
    updateCartUI();
  } else {
    const product = products.find(item => item.id === selectedProductId);
    if (!product) return;
    const quantity = Math.max(1, Math.min(10, Number.parseInt(buyerQty.value, 10) || 1));
    document.getElementById("successText").textContent = `Thank you, ${name}! Your order for ${quantity} × ${product.name} has been confirmed. Total: ${money(product.price * quantity)}. Payment: ${payment}. Contact: ${phone}.`;
  }
  document.getElementById("orderStep").hidden = true;
  document.getElementById("orderSuccess").hidden = false;
  orderForm.reset();
  buyerQty.value = "1";
  selectedProductId = null;
});

document.getElementById("cartButton").addEventListener("click", () => {
  updateCartUI();
  cartModal.hidden = false;
});

document.getElementById("cartCheckout").addEventListener("click", () => {
  if (!cart.length) return;
  selectedProductId = null;
  document.getElementById("orderStep").hidden = false;
  document.getElementById("orderSuccess").hidden = true;
  document.getElementById("orderTitle").textContent = "Checkout Cart";
  document.getElementById("selectedProduct").innerHTML = `<span class="mini-icon">🛒</span><div><strong>${cart.length} product${cart.length > 1 ? "s" : ""} in your cart</strong><br><span>Complete your buyer information below.</span></div>`;
  buyerQty.value = "1";
  orderTotal.textContent = cartTotal.textContent;
  cartModal.hidden = true;
  orderModal.hidden = false;
  setTimeout(() => document.getElementById("buyerName").focus(), 50);
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;

  const item = cart.find(x => x.id === Number(button.dataset.id));
  if (!item) return;

  if (button.dataset.cartAction === "plus") item.quantity = Math.min(10, item.quantity + 1);
  if (button.dataset.cartAction === "minus") {
    item.quantity -= 1;
    if (item.quantity <= 0) cart = cart.filter(x => x.id !== item.id);
  }
  updateCartUI();
});

document.getElementById("orderClose").addEventListener("click", () => closeModal(orderModal));
document.getElementById("cartClose").addEventListener("click", () => closeModal(cartModal));
document.getElementById("successClose").addEventListener("click", () => closeModal(orderModal));

[orderModal, cartModal].forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal(modal);
  });
});

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("contactMessage").textContent =
    "Message submitted for demonstration. It was not saved to a database.";
  event.target.reset();
});

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

navLinks.addEventListener("click", event => {
  if (event.target.matches("a")) {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".service-flip").forEach(card => card.addEventListener("click", () => card.classList.toggle("flipped")));
renderProducts();
updateCartUI();


document.querySelectorAll(".achievement-flip").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", String(card.classList.contains("flipped")));
  });
});
