const SUPABASE_URL = 'https://htvyyrenzsqbcfjlljmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnl5cmVuenNxYmNmamxsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMDQ4NjYsImV4cCI6MjA1NDU4MDg2Nn0.8M4tbHeD6Y9Qw_-GrKnGoa63GJQMq1_lObEh2jJjkvA';
let supabase;

document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOMContentLoaded event fired');

            // Initialize Supabase client
            if (window.supabase) {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase client initialized');
            } else {
                console.error('Supabase is not properly loaded.');
                return; // Exit if supabase is not loaded
            }

    await loadProfileData();
});

async function loadProfileData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'loginregister.html';
        return;
    }

    const userInfo = document.getElementById('userInfo');
    userInfo.innerHTML = `<p><strong>Email:</strong> ${user.email}</p>`;

    const { data: pointsData, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('points_balance')
        .eq('user_id', user.id)
        .single();

    if (pointsError) {
        console.error("Error fetching loyalty points:", pointsError);
    }

    const { count: vouchersCount, error: vouchersError } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (vouchersError) {
        console.error("Error fetching vouchers count:", vouchersError);
    }

    const vouchersPointsInfo = document.getElementById('vouchersPointsInfo');
    vouchersPointsInfo.innerHTML = `
        <p><strong>Points:</strong> ${pointsData?.points_balance || 0}</p>
        <p><strong>Vouchers:</strong> ${vouchersCount || 0}</p>
    `;

    // Fetch order history (no changes needed here)
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, total, order_items(product_id, quantity, products(name, image_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (ordersError) {
        console.error("Error fetching order history:", ordersError);
        alert("Error fetching order history. Please try again.");
        return;
    }

    const orderHistory = document.getElementById('orderHistory');
    if (orders && orders.length > 0) {
        orderHistory.innerHTML = '';

        orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            let orderItemsHTML = '';

            if (order.order_items && order.order_items.length > 0) {
                order.order_items.forEach(item => {
                    orderItemsHTML += `
                        <div class="d-flex align-items-center mb-2">
                            <img src="pics/${item.products.image_url}" alt="${item.products.name}" class="order-image">
                            <div class="order-details">
                                <p>${item.products.name} x ${item.quantity}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                orderItemsHTML = "<p>No items in this order.</p>";
            }


            orderItem.innerHTML = `
                <div>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                    ${orderItemsHTML}
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <a href="order-details.html?order_id=${order.id}" class="order-link">View Details</a>
                </div>
            `;
            orderHistory.appendChild(orderItem);
        });

    } else {
        orderHistory.innerHTML = "<p>No order history found.</p>";
    }
}