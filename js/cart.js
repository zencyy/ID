let supabase;

async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

async function getCart() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching cart:', error);
        return [];
    }

    return data;
}

async function saveCart(cart) {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
        .from('cart_items')
        .upsert(cart.map(item => ({ ...item, user_id: user.id })));

    if (error) {
        console.error('Error saving cart:', error);
    }
}

// Make sure the addToCart function is assigned to the window object *after* supabase is initialized
async function addToCart(event, productId, name, price, image) {
    event.preventDefault();
    event.stopPropagation();

    const user = await getCurrentUser();
    if (!user) {
        alert('Please log in to add items to your cart.');
        return;
    }

    let cart = await getCart();
    let existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product_id: productId, name, price, image, quantity: 1, user_id: user.id });
    }

    await saveCart(cart);
    await updateCartCount();
    alert(`Added ${name} to cart!`);
}

async function removeFromCart(productId) {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

    if (error) {
        console.error('Error removing item from cart:', error);
    } else {
        await displayCart();
        await updateCartCount();
    }
}

async function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = await getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

async function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const user = await getCurrentUser();

    if (!user) {
        cartItems.innerHTML = `
            <div class="card-body text-center">
                <h5>Please sign in to view your cart</h5>
                <a href="loginregister.html" class="btn btn-primary mt-3">Login / Register</a>
            </div>
        `;
        cartTotal.innerHTML = '';
        return;
    }

    const cart = await getCart();
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
                    <input type="number" class="form-control" value="${item.quantity}" min="1" onchange="updateQuantity('${item.product_id}', this.value)">
                </div>
                <div class="col-md-2">
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.product_id}')">Remove</button>
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

async function updateQuantity(productId, newQuantity) {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
        .from('cart_items')
        .update({ quantity: parseInt(newQuantity) })
        .eq('user_id', user.id)
        .eq('product_id', productId);

    if (error) {
        console.error('Error updating quantity:', error);
    } else {
        await displayCart();
        await updateCartCount();
    }
}

async function initCartPage() {
    await displayCart();
    await updateCartCount();
}

document.addEventListener('DOMContentLoaded', function () {
    const SUPABASE_URL = 'https://htvyyrenzsqbcfjlljmn.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnl5cmVuenNxYmNmamxsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMDQ4NjYsImV4cCI6MjA1NDU4MDg2Nn0.8M4tbHeD6Y9Qw_-GrKnGoa63GJQMq1_lObEh2jJjkvA';

    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');

        // *After* initializing supabase, assign addToCart to window:
        window.addToCart = addToCart;

        if (document.getElementById('cartItems')) {
            initCartPage();
        }
    } else {
        console.error('Supabase is not properly loaded.');
        return;
    }

    const productsContainer = document.getElementById('products');
    if (productsContainer) {
        productsContainer.addEventListener('click', function (event) {
            if (event.target.tagName === 'A') {
                event.preventDefault();
                window.location.href = event.target.href;
            }
        });
    }
});
