document.addEventListener('DOMContentLoaded', function() {
    const productDetailContainer = document.getElementById('productDetailContainer');
    if (productDetailContainer) {
        productDetailContainer.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    const productId = new URLSearchParams(window.location.search).get('id');
    if (productId) {
        fetchProductDetails(productId);
    }

    const colorSelect = document.getElementById('colorSelect');
    if (colorSelect) {
        colorSelect.addEventListener('change', updateProductImage);
    }

    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }

    const accordion = document.querySelector('.accordion');
    if (accordion) {
        accordion.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
});

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`https://mugify-341a.restdb.io/rest/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '67a0f7044167dd0b8af38886',
            },
        });
        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

function displayProductDetails(product) {
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productImage').src = `pics/${product.image}`;
    
    if (product.colors && product.colors.length > 0) {
        const colorSelect = document.getElementById('colorSelect');
        colorSelect.innerHTML = '';
        product.colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color.toLowerCase();
            option.textContent = color;
            colorSelect.appendChild(option);
        });
    }

    if (product.reviews && product.reviews.length > 0) {
        const reviewsContainer = document.getElementById('reviewsContainer');
        reviewsContainer.innerHTML = '';
        product.reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';
            reviewElement.innerHTML = `
                <h5>${review.author}</h5>
                <p>Rating: ${review.rating}/5</p>
                <p>${review.comment}</p>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    }
}

function updateProductImage(event) {
    const color = event.target.value;
    const productImage = document.getElementById('productImage');
    productImage.src = `pics/mug-${color}.jpg`;
}

function addToCart(event) {
    const productId = new URLSearchParams(window.location.search).get('id');
    const color = document.getElementById('colorSelect').value;
    const quantity = 1;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.productId === productId && item.color === color);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: productId,
            color: color,
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
}
