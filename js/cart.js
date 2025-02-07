function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }
  
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  function addToCart(event, productId, name, price) {
    event.preventDefault();
    event.stopPropagation();
  
    let cart = getCart();
    let existingItem = cart.find(item => item.productId === productId);
  
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ productId, name, price, quantity: 1 });
    }
  
    saveCart(cart);
    updateCartCount();
    alert(`Added ${name} to cart!`);
  }
  
  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
    displayCart();
    updateCartCount();
  }
  
  function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
  
  function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cart = getCart();
    let total = 0;
  
    cartItems.innerHTML = '';
    cart.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.innerHTML = `
        <p>${item.name} - $${item.price} x ${item.quantity}</p>
        <button onclick="removeFromCart('${item.productId}')">Remove</button>
      `;
      cartItems.appendChild(itemElement);
      total += item.price * item.quantity;
    });
  
    cartTotal.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
  }
  
  // Call this function when the cart page loads
  function initCartPage() {
    displayCart();
    updateCartCount();
  }
  
  // If on the cart page, initialize it
  if (document.getElementById('cartItems')) {
    initCartPage();
  }
  
  // Prevent default on all links within the products container
  document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products');
    if (productsContainer) {
      productsContainer.addEventListener('click', function(event) {
        if (event.target.tagName === 'A') {
          event.preventDefault();
          window.location.href = event.target.href;
        }
      });
    }
  });
  