function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }
  
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  function addToCart(event, productId, name, price, image) {
    event.preventDefault();
    event.stopPropagation();
  
    let cart = getCart();
    let existingItem = cart.find(item => item.productId === productId);
  
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ productId, name, price, image, quantity: 1 });
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

    cartItems.innerHTML = '<div class="card-body">';
    cart.forEach(item => {
        cartItems.innerHTML += `
            <div class="row mb-3">
                <div class="col-md-2">
                    <img src="pics/${item.image}" alt="${item.name}" class="img-fluid">
                </div>
                <div class="col-md-4">
                    <h5>${item.name}</h5>
                </div>
                <div class="col-md-2">
                    $${item.price.toFixed(2)}
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" value="${item.quantity}" min="1" onchange="updateQuantity('${item.productId}', this.value)">
                </div>
                <div class="col-md-2">
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.productId}')">Remove</button>
                </div>
            </div>
        `;
        total += item.price * item.quantity;
    });
    cartItems.innerHTML += '</div>';

    cartTotal.innerHTML = `
        <p class="d-flex justify-content-between"><span>Subtotal:</span><span>$${total.toFixed(2)}</span></p>
        <p class="d-flex justify-content-between"><span>Shipping:</span><span>Free</span></p>
        <hr>
        <h5 class="d-flex justify-content-between"><span>Total:</span><span>$${total.toFixed(2)}</span></h5>
    `;
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

  function updateQuantity(productId, newQuantity) {
    let cart = getCart();
    let item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = parseInt(newQuantity);
        saveCart(cart);
        displayCart();
        updateCartCount();
    }
}