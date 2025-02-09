const SUPABASE_URL = 'https://htvyyrenzsqbcfjlljmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnl5cmVuenNxYmNmamxsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMDQ4NjYsImV4cCI6MjA1NDU4MDg2Nn0.8M4tbHeD6Y9Qw_-GrKnGoa63GJQMq1_lObEh2jJjkvA';

document.addEventListener('DOMContentLoaded', async function () {
    // Initialize Supabase client
    let supabaseReady = false;
    let checks = 0;
    while (!supabaseReady && checks < 10) {
        if (window.supabase) {
            // Initialize Supabase client
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            supabaseReady = true;
            console.log("Supabase client initialized after waiting.");
        } else {
            console.log("Supabase not yet loaded, waiting...");
            await new Promise(resolve => setTimeout(resolve, 100));
            checks++;
        }
    }

    if (!supabaseReady) {
        console.error("Supabase failed to load after multiple checks.");
        return;
    }

    // Extract orderId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (orderId) {
        console.log("Order ID:", orderId);
        await fetchOrderDetails(orderId);
    } else {
        console.error("No order ID found in the URL.");
        alert("No order ID found. Please try again.");
    }
});

async function fetchOrderDetails(orderId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select(`*, addresses(*), payments(*), order_items( *, products(name, image_url) )`)
            .eq('id', orderId)
            .eq('user_id', user.id); // Use user.id directly!

        if (orderError) {
            console.error("Error fetching order details:", orderError);
            alert("Error fetching order details. Please try again.");
            return;
        }

        if (!orderData || orderData.length === 0) {
            console.error("Order not found:", orderId);
            alert("Order not found. Please try again.");
            return;
        }

        const order = orderData[0];
        console.log("Order Data:", order);
        displayOrderDetails(order);

    } catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
    }
}

function displayOrderDetails(order) {
    const orderInfo = document.getElementById('orderInfo');
    if (orderInfo) {
        orderInfo.innerHTML = `
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Order Status:</strong> ${order.status}</p>
        `;
    }

    const addressInfo = document.getElementById('addressInfo');
    if (addressInfo) {
        addressInfo.innerHTML = `
            <p>${order.addresses.full_name}</p>
            <p>${order.addresses.addresses1} ${order.addresses.addresses2 ? `<br>${order.addresses.addresses2}` : ''}</p>
            <p>${order.addresses.city}, ${order.addresses.state} ${order.addresses.zip}</p>
            <p>${order.addresses.phone}</p>
        `;
    }

    const paymentInfo = document.getElementById('paymentInfo');
    if (order.payments && order.payments.card_number) { // Check if payments and card_number exist
        paymentInfo.innerHTML = `
            <p><strong>Payment Method:</strong> ${order.payments.payment_method}</p>
            <p><strong>Card Number:</strong> ${order.payments.card_number.slice(-4).padStart(16, '*')}</p>
            <p><strong>Name on Card:</strong> ${order.payments.name_on_card}</p>
        `;
    } else {
        paymentInfo.innerHTML = "<p>Payment information not available.</p>"; // Or some other message
    }

    const orderItemsContainer = document.getElementById('orderItems');
    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = ''; // Clear previous items

        order.order_items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'product-item';
            itemElement.innerHTML = `
                <img src="pics/${item.products.image_url}" alt="${item.products.name}" class="product-image">
                <div>
                    <p><strong>${item.products.name}</strong></p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
    }

    const totalElement = document.getElementById('total');
    if (totalElement) {
        totalElement.textContent = `$${order.total.toFixed(2)}`;
    }
}