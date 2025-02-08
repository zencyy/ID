document.addEventListener('DOMContentLoaded', function() {
    const productId = new URLSearchParams(window.location.search).get('id');
    if (productId) {
        fetchProductDetails(productId);
        loadReviews(productId); // Load existing reviews
    }
  
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
  
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitReview(productId);
        });
    }
  });

async function fetchProductDetails(productId) {
    console.log('Fetching product details for ID:', productId);
    try {
        const response = await fetch(`https://mugify-341a.restdb.io/rest/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': '67a0f7044167dd0b8af38886',
            },
        });
        const product = await response.json();
        console.log('Fetched product:', product);
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

async function loadReviews(productId) {
    // Replace with your actual API endpoint to fetch reviews for a specific product
    try {
        const response = await fetch(`https://your-api.com/reviews?productId=${productId}`);
        const reviews = await response.json();
        displayReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}
async function submitReview(productId) {
    const reviewText = document.getElementById('reviewText').value;

    // Replace with your actual API endpoint to submit a review
    try {
        const response = await fetch('https://your-api.com/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                text: reviewText,
                // Add other relevant data like user name if available
            }),
        });

        if (response.ok) {
            document.getElementById('reviewText').value = ''; // Clear the form
            loadReviews(productId); // Reload reviews
        } else {
            console.error('Error submitting review:', response.status);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
    }
}

function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = ''; // Clear existing reviews

    if (reviews && reviews.length > 0) {
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review'); // Add a class for styling

            reviewElement.innerHTML = `
                <p>${review.text}</p>
                <small>- ${review.author || 'Anonymous'}</small>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    } else {
        reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
    }
}

function displayProductDetails(product) {
    console.log('Displaying product details:', product);
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productImage').src = `pics/${product.image}`;
    document.getElementById('productDescription').textContent = product.description || 'No description available.';
}

function addToCart() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const productName = document.getElementById('productName').textContent;
    const productPrice = parseFloat(document.getElementById('productPrice').textContent.replace('$', ''));
    const quantity = 1;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: productId,
            name: productName,
            price: productPrice,
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}
