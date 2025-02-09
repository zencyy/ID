document.addEventListener('DOMContentLoaded', async function () {
    // Initialize Supabase client
    const SUPABASE_URL = 'https://htvyyrenzsqbcfjlljmn.supabase.co'; // Replace with your Supabase URL
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnl5cmVuenNxYmNmamxsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMDQ4NjYsImV4cCI6MjA1NDU4MDg2Nn0.8M4tbHeD6Y9Qw_-GrKnGoa63GJQMq1_lObEh2jJjkvA'; // Replace with your Supabase anon key
    // const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let supabase = null; // Initialize supabase to null

    // Check if Supabase is available
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase client library not found. Make sure it is included in your HTML.');
        return; // Exit the function if Supabase is not available
    }

    const productId = new URLSearchParams(window.location.search).get('id');
    if (productId) {
        await fetchProductDetails(productId, supabase); // Fetch product details
        await loadReviews(productId, supabase); // Load existing reviews
    }

    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async (event) => {
            const productName = document.getElementById('productName').textContent;
            const productPrice = parseFloat(document.getElementById('productPrice').textContent.replace('$', ''));
            const productImage = document.getElementById('productImage').src.split('/').pop(); // Extract image filename

            await addToCart(event, productId, productName, productPrice, productImage, supabase);
        });
    }

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function (event) {
            event.preventDefault();
            submitReview(productId, supabase);
        });
    }
});

// Fetch product details from Supabase
async function fetchProductDetails(productId, supabase) {
    console.log('Fetching product details for ID:', productId);
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) {
            console.error('Error fetching product details:', error);
            return;
        }

        console.log('Fetched product:', product);
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

// Load reviews for a product from Supabase
async function loadReviews(productId, supabase) {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading reviews:', error);
            return;
        }

        displayReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Submit a review to Supabase
async function submitReview(productId, supabase) {
    const reviewText = document.getElementById('reviewText').value;

    // Get the current user (if authentication is enabled)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert('You must be logged in to submit a review.');
        return;
    }

    try {
        const { data: review, error } = await supabase
            .from('reviews')
            .insert([
                {
                    product_id: productId,
                    user_id: user.id,
                    text: reviewText,
                    author: user.email || 'Anonymous',
                },
            ]);

        if (error) {
            console.error('Error submitting review:', error);
            return;
        }

        document.getElementById('reviewText').value = ''; // Clear the form
        await loadReviews(productId, supabase); // Reload reviews
    } catch (error) {
        console.error('Error submitting review:', error);
    }
}

// Display reviews in the UI
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

// Display product details in the UI
function displayProductDetails(product) {
    console.log('Displaying product details:', product);
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('productImage').src = `pics/${product.image_url}`;
    document.getElementById('productDescription').textContent = product.description || 'No description available.';
}

async function getCurrentUser(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

async function getCart(supabase) {
    const user = await getCurrentUser(supabase);
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

async function saveCart(cart, supabase) {
    const user = await getCurrentUser(supabase);
    if (!user) return;

    const { error } = await supabase
        .from('cart_items')
        .upsert(cart.map(item => ({ ...item, user_id: user.id })));

    if (error) {
        console.error('Error saving cart:', error);
    }
}

// Add to cart function
async function addToCart(event, productId, name, price, image, supabase) {
    event.preventDefault();
    event.stopPropagation();

    const user = await getCurrentUser(supabase);
    if (!user) {
        alert('Please log in to add items to your cart.');
        return;
    }

    let cart = await getCart(supabase);
    let existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product_id: productId, name, price, image, quantity: 1, user_id: user.id });
    }

    await saveCart(cart, supabase);
    await updateCartCount(supabase);
    alert(`Added ${name} to cart!`);
}

async function updateCartCount(supabase) {
    const cartCount = document.getElementById('cartCount');
    const cart = await getCart(supabase);
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}



