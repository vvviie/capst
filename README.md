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

FIKASTALLE RESTAURANT MANAGEMENT SYSTEM
========================================
Link: fikastalle-cafe.vercel.app

This website is a proposed Restaurant Management System Webapp that can be used on any device with a browser and internet access.
## How to start
1. Navigate to the website: [fikastalle-cafe.vercel.app](https://fikastalle-cafe.vercel.app).  
2. Register or log in to access full features.
 You may try using the existing staff accounts "kitchen@fikastallestaff.com" or "bar@fikastallestaff.com", the PW is *123456*.
----------------------------------------------------------------------------------------------------------------------------------

/***STAFF-SIDE***/

General:
- Both Kitchen and Bar staff can only view and manage orders in their respective statuses.
- The switch position button provides flexibility to change the layout, improving workflow and efficiency.
- Access to order details and special notes is available to ensure preparation and service quality.
- Menu management capabilities include item availability updates and creating new items, but neither role can modify item details other than availability.

NAVBAR for BAR and KITCHEN:
- MENU: Provides access to view, sets the availability of an item, add new menu items.
- ORDERS: Displays the list of orders for the staff to process and update.


KITCHEN:
Order Management
- View all orders with the status "PREP" (being prepared) and "PAID" (paid and awaiting preparation).
- Mark orders as "READY" once they are fully prepared and ready for serving.
- Update order status to "PREP" to indicate that the preparation process has started.
- Access detailed order information including items, notes, and user requests.
- **Switch Position Button**: Allows the staff to switch the display layout of orders between "PREP" on the left section and "PAID" on the right section, or vice versa.
- Manage Menu: 
  - Set the availability of menu items to indicate whether they are currently in stock or unavailable.
  - Create new items to be added to the menu.

BAR:
Order Management
- View all orders with the status "PAID" and "PREP".
- Mark orders as "DONE" once they have been prepared and served.
- Update orders to "PAID" or "CANCEL" when needed to reflect payment or cancellation of an order.
- Access detailed order information including items, notes, and user details.
- **Switch Position Button**: Allows the staff to switch the display layout of orders between "PAID" on the left section and "PREP" on the right section, or vice versa.
- Manage Menu:
  - Set the availability of menu items to indicate whether they are currently in stock or unavailable.
  - Create new items to be added to the menu.


FIKASTALLE RESTAURANT MANAGEMENT SYSTEM
========================================
Link: fikastalle-cafe.vercel.app

This website is a proposed Restaurant Management System Webapp that can be used on any device with a browser and internet access.
## How to start
1. Navigate to the website: [fikastalle-cafe.vercel.app](https://fikastalle-cafe.vercel.app).  
2. Register or log in to access full features.  
You may try using the existing admin account "admin@fikastallestaff.com", the PW is *123456*.
----------------------------------------------------------------------------------------------------------------------------------

/***ADMINS-SIDE****/

The admin-side of the system provides essential functionalities, enabling administrators to:
- View and analyze detailed reports.
- Manage the menu by adding, updating, or removing items.
- Update and maintain the landing page content.
- Create, edit, and manage incentives such as vouchers and promo codes.
- Oversee bookings, including table reservations and exclusive café events.
- Monitor and process customer orders, including verifying payments and handling cancellations or refunds.
- Manage user accounts, including roles and security.

------------------

Navbar: Home, Menu, Landing, Incentives, Bookings, Orders, Accounts, Logout  
Footer: Displays the logo, contact details, and social links for Fikastalle.

HOME
----
- Landing page dashboard which includes reports for the day, or you can set it to display weekly or yearly reports. It also includes admin controls.

Reports:  
- "Net Sales and Expenses": Displays the net sales from orders and bookings and the expenses incurred for the day.  
- "Foods and Drinks Sold": Compares the number of food and drink items sold.  
- "Avg. Orders Per Day": Shows the average number of orders per day.  
- "Top Spenders": Lists top customers who have placed significant orders.  
- "Customer Reviews": Displays a pie chart of likes and dislikes along with customer reviews.  

Admin Controls:  
- "Input Expenses": Allows you to input expense labels and amounts for today or a specific date.  
- "Expense Records": Displays expense records, with options to delete or edit records. You can filter by month and year.  
- "Make Announcement": Sends notifications to all users by entering a subject and body text.  
- "Customer Orders": Toggles order operations on or off. When disabled, no orders can be placed; when enabled, orders are allowed.

MENU
----
- Manage the menu items on this page.  
- View all items within a category, including availability, calorie level, prices, and descriptions.  
- Search or filter items based on their type.  
- Add subcategories within a category and manage them.

"Add Product": For adding a new product.  
- Menu Category: Sets the category for the menu item. Depending on the category, there may be specific options like types or sizes.  
- Availability: Toggles the item's availability.  
- Image: Upload an image for the item.  
- ID: Assigns a unique ID to the item.  
- Calorie Level: Specifies the calorie level.  
- Price: Sets the price.  
- Item Subcategory: Assigns a subcategory to the item.  
- Type: Specifies the type of item.  
- Add Allergen: Lists allergens for the item.  
- Description: Adds a description for the item.  

For Drinks:  
- Size: Specify drink sizes (e.g., 12 for 12oz).  
- Upsize: Enables additional size options.  
- Upsize Size: Sets the size for the upsize option.  
- Additional Price: Specifies the price for the upsize.  

- "Create Item" button: Finalizes the addition of the item to the menu.

Specific Item Controls:  
- "Feature": Displays the item as a "Featured Item" on the user homepage.  
- "Available/Unavailable": Toggles the item's availability.  
- "Edit": Allows editing all item details except the ID and category.  
- "Delete": Removes the item from the menu.

LANDING
-------
- Manage the contents of the landing page.  
- "Landing Section": Add, update, or remove slides/banners on the first content section.  
- "Information Section": Edit displayed restaurant information and image slideshows.  
- "Footer Section": Edit contact details and social links or toggle their visibility.

INCENTIVES
----------
- Manage vouchers and promo codes here.  
- Filter incentives by type or search for them.

Voucher:  
- "Add Voucher": Add a new voucher.  
  - ID: Set a unique voucher ID.  
  - Name: Assign a name to the voucher.  
  - Availability: Toggle availability.  
  - Deduction Type: Choose "Percentage" or "Amount" for the discount.  
  - Deduction Value: Set the discount value.  
  - Validity Period: Choose "Perpetual" for no expiration or "Expiration" to set a specific date.  
  - Valid Until: Specify the expiration date if applicable.  
  - Limit: Choose "Unlimited Use" or set a specific usage limit.  
  - Threshold: Set conditions for voucher use, if any.  
  - Description: Add a description for the voucher.  
  - "Create Voucher" button: Finalize and add the voucher.  

Specific Controls:  
- "Available/Unavailable": Toggle voucher availability.  
- "Give to Users": Assign vouchers to specific users or tiers.  
- "Edit": Update voucher details.  
- "Delete": Remove the voucher.

Promo:  
- "Add a Promo": Add a new promo code.  
  - Similar fields and functionalities as vouchers.  

BOOK
----
- Manage user booking requests here.  
- Filter by category ("Table" or "Exclusive") and status.  

Statuses:  
- "Requested", "Pending", "To Pay", "Paid", "Rejected", "Cancelled", "Done".

Manage Table Requests:  
- "Mark as Paid", "Cancel", "Mark as Done", etc., depending on the booking's current status.  

Manage Exclusive Requests:  
- Similar controls for "Requested", "Paid", and "Done".  

Manage "Package Offers":  
- Add new categories, delete categories, set selection limits, and manage items.

ORDERS
------
- Manage user orders and statuses.  
- Filter by statuses: "All", "To Pay", "Paid", "Prep", "Ready", "Done", etc.

Statuses and Actions:  
- "Mark as Paid", "Mark as Prep", "Mark as Ready", "Refund", "Print Details", etc.

ACCOUNTS
--------
- Manage user and staff accounts.  
- Add, edit, or delete users/staff.  

User Management:  
- Create accounts without email verification; users must verify their email before login.  

Staff Management:  
- Set usernames, passwords, roles, and account statuses.  

- View, edit, or delete specific accounts as needed.
