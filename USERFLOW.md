# NCP Wheels User Flow Documentation

## 1. Authentication Flow

### 1.1 Registration
1. User visits the registration page
2. Fills in required information:
   - Name
   - Email
   - Password
   - Phone (optional)
3. System validates input
4. Sends verification email
5. User verifies email
6. Account activated

### 1.2 Login
1. User enters credentials
2. System validates and provides JWT token
3. Redirects to dashboard/home
4. Optional: Remember me functionality

### 1.3 Password Reset
1. User requests password reset
2. System sends reset link
3. User sets new password
4. Confirmation email sent

## 2. Listing Management

### 2.1 Creating a Listing
1. User clicks "Post a Car"
2. Fills in car details:
   - Basic info (make, model, year)
   - Technical details
   - Price and location
   - Photos (up to 10)
3. Preview listing
4. Publish or save as draft

### 2.2 Featured Listings
1. User selects listing to feature
2. Chooses feature duration:
   - Weekly (7 days)
   - Biweekly (14 days)
   - Monthly (30 days)
3. Makes payment
4. Listing gets featured status

### 2.3 Managing Listings
1. View all listings
2. Edit existing listings
3. Mark as sold
4. Remove listings
5. View statistics

## 3. Search and Browse

### 3.1 Basic Search
1. Enter search terms
2. Apply filters:
   - Price range
   - Year
   - Location
   - Condition
3. View results
4. Sort options

### 3.2 Advanced Search
1. Additional filters:
   - Transmission type
   - Fuel type
   - Body type
   - Features
2. Save search preferences
3. Set up alerts

## 4. User Interaction

### 4.1 Messaging
1. View car listing
2. Contact seller
3. Start conversation
4. Share contact details
5. Negotiate price

### 4.2 Saved Items
1. Save interesting listings
2. View saved listings
3. Remove from saved
4. Get price drop alerts

## 5. Payment Processing

### 5.1 Stripe Payment
1. Select payment amount
2. Enter card details
3. Process payment
4. View receipt
5. Download invoice

### 5.2 Easypaisa Payment
1. Select Easypaisa
2. Enter phone number
3. Receive OTP
4. Confirm payment
5. View confirmation

## 6. Profile Management

### 6.1 Profile Settings
1. Update personal info
2. Change password
3. Upload avatar
4. Set preferences

### 6.2 Notification Settings
1. Email notifications
2. Push notifications
3. SMS alerts
4. Price drop alerts

## 7. Admin Functions

### 7.1 Content Moderation
1. Review new listings
2. Handle reported content
3. Manage featured listings
4. User management

### 7.2 Analytics
1. View site statistics
2. User engagement
3. Payment history
4. Popular searches
