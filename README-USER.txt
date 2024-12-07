FIKASTALLE RESTAURANT MANAGEMENT SYSTEM
========================================
This website is a proposed Restaurant Management System Webapp that can be used on any device with a browser and internet access.

## How to start
1. Navigate to the website: [fikastalle-cafe.vercel.app](https://fikastalle-cafe.vercel.app).  
2. Register or log in to access full features.  
You may try using the existing User account "ab@gmail.com", the PW is *123456*.
----------------------------------------------------------------------------------------------------------------------------------

/****USER-SIDE****/
Navbar (Not-Registered User)
- Home, Menu, Book, Orders, and Login buttons
Navbar (Registered User)
- Home, Menu, Book, Orders, Cart, Notification, Profile, and Logout buttons

Footer
- Displays the logo, contact details, and social media links of Fikastalle.

Non-registered Users
- Can view all public information about the restaurant, current banner slides, featured items, and the Menu.

Registered Users
- Can order, book, and receive incentives such as vouchers and promos.

Home
- Displays the current banner slides, featured items, and an "About Us" section.

Login Page
- User login and registration page for new users.

Sign Up
- User must complete all required fields during registration.
- Email verification is required to complete the registration process.

Menu
----
- Allows users to choose food categories.
- Inside each category, users can view all food items, including availability, calorie content, prices, and descriptions.
- Search and filter options are available to help users find their preferred items.
- Selecting an item shows its details, price, and preferences based on the food category.
- Users can add special note requests, set item quantities, and see the total price on the button label.
- Items are added to the user's cart upon completion.

Cart
----
- Displays the items added to the cart, their prices, and the total price.
- Users can remove or update item details in the cart.
- Payment details section allows users to choose dining options: "Table" for in-restaurant service or "Pickup" for quick collection.
- Users can select serving time: "Now" or "Later."
- Displays the subtotal and total price of all items in the cart.
- Incentives options:
  -- Voucher: Displays available vouchers that can be applied to the total.
  -- Promo: Users enter a promo code for discounts.
- Only one type of discount can be applied at a time, including senior citizen or PWD ID discounts.
- Senior Citizen/PWD ID upload required for verification; applied after checkout and checked by staff before processing payment.
- Payment options include "Cash" (cash payment) or "Card" (upload card details for verification).
- After filling out all details, users proceed to checkout, and the order is sent to the cashier for processing.
- Users can view order status by clicking "Orders" on the navbar.

Orders
-----
- Displays a list of all orders and their details, along with their statuses.
- Order statuses include: "TO PAY", "PAID", "PREP", "READY", "DONE", "CANCELLED", "REJECTED", "REFUNDED".
  -- "TO PAY": Status after checkout, before payment. Can still be cancelled.
  -- "PAID": Order paid and sent for kitchen preparation.
  -- "PREP": Order is being prepared.
  -- "READY": Order is prepared and ready to be served.
  -- "DONE": Order served, with an option to print the receipt.
  -- Completed orders may include a review and rating option.
  -- "CANCELLED": Cancelled order.
  -- "REJECTED": Order not processed due to issues.
  -- "REFUNDED": Amount refunded by staff if there are problems with the order.
- Users can cancel an order before payment. Once paid, cancellation is not possible.

Book
----
- Booking categories include "Table Reservation" and "Exclusive Cafe".
  -- "Table Reservation": For table bookings. Users must fill in the date (at least 5 days ahead), time, number of persons, and reservation cost.
  -- Reservation fee is deductible from the total bill upon ordering.
  -- After submitting, users are redirected to "My Reservations" and receive a notification.
  -- "Exclusive Cafe": Booking the entire venue for events.
    -- Must provide date (at least 14 days in advance) and time (12 PM start, ends before 11 PM).
    -- Event duration beyond 4 hours incurs an additional PHP 2,000.00/hour charge.
    -- Package options include A, B, C, with different per-person costs and buffet selections.
    -- Users can choose the number of foods per buffet category, provide remarks (optional), and specify the number of persons (minimum 30, maximum 50).
    -- Payment type selection: "Downpayment" (50% of estimated cost) or "Full Payment".
    -- After submission, users are redirected to "My Reservations" and notified of the reservation.

Book > My Reservations
----------------------
- Lists all reservations and their details.
- Users can cancel reservations that haven’t been processed yet.
- If the reservation status is "DONE", users can print the reservation receipt by clicking "Print Details".
