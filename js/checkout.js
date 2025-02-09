const SUPABASE_URL = 'https://htvyyrenzsqbcfjlljmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnl5cmVuenNxYmNmamxsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMDQ4NjYsImV4cCI6MjA1NDU4MDg2Nn0.8M4tbHeD6Y9Qw_-GrKnGoa63GJQMq1_lObEh2jJjkvA';
let supabase;

document.addEventListener('DOMContentLoaded', async function () {
    // Check if window.supabase is defined. If not, wait and check again.
    let supabaseReady = false;
    let checks = 0;
    while (!supabaseReady && checks < 10) { // Try 10 times (adjust as needed)
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            supabaseReady = true;
            console.log("Supabase client initialized after waiting.");
        } else {
            console.log("Supabase not yet loaded, waiting...");
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
            checks++;
        }
    }

    if (!supabaseReady) {
        console.error("Supabase failed to load after multiple checks.");
        return; // Or handle the error appropriately
    }

    await loadCartItems(); // Now call loadCartItems()
});

let cart = [];
let subtotal = 0;
let shipping = 5.99;
let tax = 0;
let total = 0;
let appliedDiscount = 0;
let appliedPoints = 0;

async function loadCartItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching cart items:', error);
        return;
    }

    cart = data;
    displayCartItems();
    calculateTotals();
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'product-item';
        itemElement.innerHTML = `
            <img src="pics/${item.image}" alt="${item.name}" class="product-image">
            <div>
                <div>${item.name}</div>
                <div>Quantity: ${item.quantity}</div>
                <div>$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
}

function calculateTotals() {
    subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    tax = subtotal * 0.1; // Assuming 10% tax
    total = subtotal + shipping + tax - appliedDiscount - appliedPoints;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

async function applyDiscount(voucherCode) { // Add voucherCode parameter

    const voucher = await applyVoucher(voucherCode); // Use the actual voucherCode

    if (voucher) {
        appliedDiscount = voucher.amount; // Use amount from the voucher
    } else {
        appliedDiscount = 0;
    }

    calculateTotals();

}

async function applyLoyaltyPoints() {
    const pointsToApply = parseInt(document.getElementById('loyaltyPoints').value);
    appliedPoints = pointsToApply;
    calculateTotals();
}

async function placeOrder() {
    const addressForm = document.getElementById('addressForm');
    const paymentForm = document.getElementById('paymentForm');
    if (!addressForm.checkValidity() || !paymentForm.checkValidity()) {
        alert('Please fill out all required fields.');
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("User not logged in.");
        return;
    }

    try {
        // 1. Insert into 'addresses' table
        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .insert([
                {
                    user_id: user.id,
                    full_name: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    addresses1: document.getElementById('address1').value,
                    addresses2: document.getElementById('address2').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zip: document.getElementById('zip').value,
                }
            ]);

        if (addressError) {
            console.error("Supabase address insert error:", addressError);
            alert("An error occurred while saving the address. Please check the details and try again.");
            return;
        }

        // 2. SELECT query to get the address ID
        const { data: selectAddressData, error: selectAddressError } = await supabase
            .from('addresses')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (selectAddressError) {
            console.error("Supabase address select error:", selectAddressError);
            alert("An error occurred while retrieving the address ID.");
            return;
        }

        if (!selectAddressData || selectAddressData.length === 0) {
            console.error("No address found after insert.");
            alert("An error occurred while retrieving the address ID.");
            return;
        }

        const addressId = selectAddressData[0].id;

        // 3. Insert into 'orders' table with the correct total
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user.id,
                    total: total, // This is the correct total after applying voucher and loyalty points
                    status: 'pending',
                    address_id: addressId,
                    created_at: new Date(),
                    applied_discount: appliedDiscount, // Store the applied discount
                    applied_points: appliedPoints // Store the applied loyalty points
                }
            ]);

        if (orderError) {
            console.error("Supabase order insert error:", orderError);
            alert("An error occurred while placing the order. Please try again.");
            return;
        }

        // 4. SELECT query to get the order ID
        const { data: selectOrderData, error: selectOrderError } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (selectOrderError) {
            console.error("Supabase order select error:", selectOrderError);
            alert("An error occurred while retrieving the order ID.");
            return;
        }

        if (!selectOrderData || selectOrderData.length === 0) {
            console.error("No order found after insert.");
            alert("An error occurred while retrieving the order ID.");
            return;
        }

        const orderId = selectOrderData[0].id;

        // 5. Insert into 'payments' table
        const paymentData = {
            order_id: orderId,
            user_id: user.id,
            card_number: document.getElementById('cardNumber').value,
            exp_date: document.getElementById('expDate').value,
            cvv: document.getElementById('cvv').value,
            name_on_card: document.getElementById('nameOnCard').value,
            amount: total, // This is the correct total after applying voucher and loyalty points
            payment_method: "Card",
            status: "pending",
        };

        const { error: paymentError } = await supabase.from('payments').insert([paymentData]);

        if (paymentError) {
            console.error("Supabase payment insert error:", paymentError);
            alert("An error occurred while processing the payment. Please try again.");
            return;
        }

        // 6. Insert into 'order_items' table
        const orderItems = [];
        for (const item of cart) {
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('price')
                .eq('id', item.product_id);

            if (productError) {
                console.error("Error fetching product price:", productError);
                alert("An error occurred while placing your order. Please try again.");
                return;
            }

            orderItems.push({
                order_id: orderId,
                product_id: item.product_id,
                quantity: item.quantity,
                price: productData[0].price,
            });
        }

        const { error: orderItemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (orderItemsError) {
            console.error("Error inserting order items:", orderItemsError);
            alert("An error occurred while placing your order. Please try again.");
            return;
        }

        // 7. Clear the cart
        const { error: clearCartError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

        if (clearCartError) {
            console.error("Error clearing cart:", clearCartError);
            alert("An error occurred while clearing the cart. Please contact support.");
            return;
        }

        // 8. Redirect to order details page
        window.location.href = `order-details.html?order_id=${orderId}`;

        alert('Order placed successfully!');

    } catch (error) {
        console.error("Error in placeOrder:", error);
        alert("A general error occurred. Please try again later.");
    }
}

async function applyVoucher(voucherCode) {
    const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode)
        .single();

    if (error) {
        console.error('Error fetching voucher:', error);
        return null;
    }

    if (!data) {
        console.log("Voucher not found for code:", voucherCode); // Debugging
        return null;
    }

    if (new Date(data.expiry) < new Date()) {
       console.log("Voucher expired:", data); // Debugging
        return null;
    }

    console.log("Voucher found:", data); // Debugging
    return data;
}

document.addEventListener('DOMContentLoaded', function () {
    const applyVoucherBtn = document.getElementById('applyVoucherBtn');
    if (applyVoucherBtn) {
        applyVoucherBtn.addEventListener('click', async function () {
            const voucherCode = document.getElementById('voucherCode').value;

            const voucher = await applyVoucher(voucherCode);

            if (voucher) {
                await applyDiscount(voucherCode);
                alert('Voucher applied successfully!');
            } else {
                appliedDiscount = 0; // Reset discount
                calculateTotals();
                alert("Invalid Voucher Code");
            }
        });
    }
});
