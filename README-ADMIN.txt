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
