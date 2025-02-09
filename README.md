Mugify is an innovative online platform that brings together mug enthusiasts, designers, and casual shoppers. Our website offers a unique blend of e-commerce and community features, allowing users to browse, purchase, and even share their own mug designs. 

With Mugify, you're not just buying a mug; you're joining a vibrant community of mug/cup lovers and creators.
Design Process
Our design process focused on creating a user-friendly, visually appealing platform that caters to both shoppers and designers. We aimed to create a seamless experience that encourages user engagement and creativity.


User Stories:
As a shopper, I want to easily browse through various mug designs, so that I can find and purchase the perfect mug for me or as a gift.

As a user, I want the website to be easy to navigate and use, with a clean and intuitive interface.

As a user, I want the website to be responsive and work well on all devices (desktops, tablets, and smartphones).

As a user, I want the website to load quickly and be performant.

As a designer, I want to share my mug/cup designs with the community, so that I can get feedback and potentially sell my creations.

As a designer, I want to have a clear and easy-to-use interface for uploading my mug designs.


As a community member, I want to interact with other mug enthusiasts, so that I can discuss designs and get inspiration.

As a community member, I want to be able to easily share mug designs on social media.




Features
Existing Features
Product Catalog: Allows users to browse and purchase from a wide range of mug designs.

Community : Enables users to share their mug designs, comment on posts, and interact with people in the community.

Lucky Spin: Allow users to spin the lucky wheel with 3 chances given everyday and stand a chance to win vouchers.

Discounts: Users can use the voucher code to redeem in the checkout page to get discount

Shopping Cart: Enables users to add items to their cart and complete purchases.

Design Upload: Allows users to upload and share their own mug designs with the community.

Features Left to Implement:
Live Chat: To enable real-time communication between users.
Custom Mug Designer: An interactive tool for users to create their own mug designs directly on the website.

Technologies Used:
HTML5
CSS
JavaScript
Bootstrap: Used for responsive design and pre-built components.
jQuery: Used to simplify DOM manipulation.
Supabase: Database to store data and User Authentication.
Font Awesome: Used for icons throughout the site.

AI Assistance:
I used AI to help me with my Supabase API implementation, product display, cart, checkout , user authentication and vouchers etc.

![api ai assitance](https://github.com/user-attachments/assets/ba8be44e-cb6f-4f97-8790-1adde5182574)


Testing
Adding Items to Cart:

Scenario 1: Adding from Product Page:
Steps: On a product details page, select the desired quantity and click the "Add to Cart" button.
Expected Result: The product is added to the shopping cart, and the cart count is updated.
Scenario 2: Adding from Catalog Page:
Steps: From the product catalog, use a quick add feature (if available) or navigate to the product page and add to cart.
Expected Result: The product is added to the shopping cart, and the cart count is updated.
Scenario 3: Updating Quantity in Cart:
Steps: Go to the shopping cart page. Change the quantity of an item.
Expected Result: The cart total and the item's subtotal are updated accordingly.
Scenario 4: Removing Items from Cart:
Steps: On the shopping cart page, remove an item.
Expected Result: The item is removed from the cart, and the cart count and total are updated.

Checkout Process:

Scenario 1: Guest Checkout (if applicable):
Steps: Proceed to checkout without logging in.
Expected Result: The checkout process allows guest checkout, prompting for shipping and billing information.
Scenario 2: Logged-in Checkout:
Steps: Log in and proceed to checkout.
Expected Result: User's saved addresses and payment information are pre-filled (if available), making the checkout process faster.
Scenario 3: Entering Shipping Information:
Steps: Enter or select a shipping address.
Expected Result: The shipping address is saved for the order. Shipping costs are calculated and displayed (if applicable).
Scenario 4: Entering Payment Information:
Steps: Enter or select payment information.
Expected Result: The payment information is processed securely. Order confirmation is displayed upon successful payment. Error messages are displayed for invalid payment details.
Scenario 5: Applying Discounts:
Steps: Enter a valid discount code during checkout.
Expected Result: The discount is applied to the order total. Error message is displayed for invalid or expired codes.
Scenario 6: Order Confirmation:
Steps: Complete the checkout process.
Expected Result: An order confirmation page is displayed with order details, shipping information, and a confirmation number. An email confirmation is sent to the user.

Uploading Designs:

Scenario 1: Uploading Valid Designs:
Steps: Upload a design in the accepted file format and size.
Expected Result: The design is uploaded successfully, and a confirmation message is displayed.
Scenario 2: Uploading Invalid Designs:
Steps: Upload a design in an unsupported file format or exceeding the size limit.
Expected Result: An appropriate error message is displayed, indicating the reason for the failed upload.
Scenario 3: Design Preview:
Steps: After uploading, preview the design.
Expected Result: The uploaded design is displayed correctly in the preview area.

Interacting with the Community Forum:

Scenario 1: Browsing the Forum:
Steps: Navigate to the community forum page.
Expected Result: Forum posts are displayed, with titles, author information, and timestamps.
Scenario 2: Creating a Post:
Steps: Create a new post with a title and content.
Expected Result: The post is published in the forum and is visible to other users.
Scenario 3: Commenting on a Post:
Steps: Comment on an existing post.
Expected Result: The comment is added to the post and is visible to other users.

Lucky Spin:

Scenario 1: Successful Spin:
Steps: Click the spin button.
Expected Result: The wheel spins and lands on a prize (voucher or points). The user's voucher/points balance is updated.
Scenario 2: Insufficient Spins:
Steps: Attempt to spin when no spins are available.
Expected Result: A message is displayed indicating that no spins are left.
Scenario 3: Voucher Display:
Steps: Win a voucher.
Expected Result: The voucher code is displayed and can be copied. It's added to the user's vouchers (if applicable).


Credit
Media
Product images:

tenstickers-singapore.com
etsy.com
woodchipdecor.com
pinterest.com

Product video carousell:
pexels.com

Home banner images:
Illustrator AI 

Inspiration for the community aspect was drawn from platforms like Reddit
Inspiration for the discount and checkout aspect was drawn from Shein.
