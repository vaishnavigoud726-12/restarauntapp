# CRAVEWISE – DATABASE SCHEMAS & ENTITY RELATIONSHIP DESIGN

**DBMS:** MongoDB Atlas / Local MongoDB  
**ODM:** Mongoose  
**Geospatial Standards:** GeoJSON Point with `2dsphere` index  

---

## 1. Entity Relationships Overview

```
[Customer] 1 ──── N [Booking]
[Customer] 1 ──── N [Feedback] (strictly via completed Booking)
[Customer] 1 ──── N [DiscountUsage]
[Customer] 1 ──── N [LoyaltyTransaction]
[Customer] 1 ──── N [Waitlist]
[Customer] 1 ──── N [GroupDiningPlan]

[Restaurant] 1 ──── N [MenuItem]
[Restaurant] 1 ──── N [Table]
[Restaurant] 1 ──── N [Booking]
[Restaurant] 1 ──── N [Feedback]
[Restaurant] 1 ──── N [Waitlist]

[Table] 1 ──── N [Booking]
[Discount] 1 ──── N [DiscountUsage]
```

---

## 2. Collection Schemas

### 1. `customers`
- `_id`: ObjectId
- `fullName`: String (Required)
- `email`: String (Unique, Lowercase, Indexed)
- `password`: String (bcrypt hashed)
- `phone`: String
- `role`: String ('customer')
- `avatarUrl`: String
- `savedLocation`: `{ address: String, coordinates: [Number] }`
- `dietaryPreferences`: Array of Strings (['Veg', 'Non-Veg', 'Vegan', 'Halal', 'Jain'])
- `favouriteCuisines`: Array of Strings
- `loyaltyPoints`: Number (Default 100)
- `totalSavings`: Number (₹ saved via discounts)
- `totalCompletedVisits`: Number
- `segment`: String ('all', 'new', 'regular', 'loyal', 'inactive', 'birthday', 'high_spending')
- `accountStatus`: String ('active', 'suspended')
- `timestamps`: true

### 2. `restaurants`
- `_id`: ObjectId
- `name`: String (Required)
- `ownerName`: String
- `email`: String (Unique)
- `password`: String (bcrypt hashed)
- `phone`: String
- `role`: String ('restaurant_owner')
- `cuisineTypes`: Array of Strings (['Hyderabadi', 'Mughlai', 'Biryani'])
- `diningStyle`: String ('Casual Dining', 'Fine Dining', 'Café', 'Rooftop', 'Family Restaurant')
- `priceForTwo`: Number (₹)
- `address`: `{ street: String, area: String, city: String, state: String, pincode: String }`
- `location`: `{ type: 'Point', coordinates: [lng, lat] }` (2dsphere index)
- `openingTime`: String ('11:00')
- `closingTime`: String ('23:00')
- `images`: Array of Strings
- `features`: Array of Strings
- `averageRating`: Number (0 to 5)
- `totalReviews`: Number
- `ratingsBreakdown`: `{ food: Number, service: Number, ambience: Number, overall: Number }`
- `approvalStatus`: String ('pending', 'approved', 'rejected', 'frozen')

### 3. `admins`
- `_id`: ObjectId
- `fullName`: String
- `email`: String (Unique)
- `password`: String (bcrypt hashed)
- `role`: String ('super_admin')

### 4. `menuitems`
- `_id`: ObjectId
- `restaurantId`: ObjectId (Ref: Restaurant, Indexed)
- `name`: String
- `category`: String ('Starters', 'Main Course', 'Breads & Rice', 'Desserts', 'Beverages')
- `price`: Number (₹)
- `dietaryType`: String ('Veg', 'Non-Veg', 'Vegan', 'Egg')
- `isChefSpecial`: Boolean
- `isAvailable`: Boolean
- `popularityScore`: Number (0 to 100)

### 5. `tables`
- `_id`: ObjectId
- `restaurantId`: ObjectId (Ref: Restaurant, Indexed)
- `tableNumber`: String (e.g. 'T-01')
- `capacity`: Number (2, 4, 6, 8, 12)
- `zone`: String ('Indoor AC', 'Outdoor / Garden', 'Rooftop', 'Family Booth', 'Private Dining')
- `isActive`: Boolean

### 6. `bookings`
- `_id`: ObjectId
- `bookingReference`: String (e.g. 'CW-8821', Unique)
- `customerId`: ObjectId (Ref: Customer, Indexed)
- `restaurantId`: ObjectId (Ref: Restaurant, Indexed)
- `tableId`: ObjectId (Ref: Table)
- `guestCount`: Number
- `bookingDate`: String (YYYY-MM-DD)
- `timeSlot`: String (e.g. '19:00 - 21:00')
- `status`: String ('confirmed', 'seated', 'completed', 'cancelled', 'no-show')
- `checkInCode`: String (4-digit code)
- `actualBillAmount`: Number (₹)
- `discountSaved`: Number (₹)
- `isFeedbackSubmitted`: Boolean

### 7. `feedback`
- `_id`: ObjectId
- `bookingId`: ObjectId (Ref: Booking, Unique - Strictly 1 verified review per completed visit)
- `customerId`: ObjectId (Ref: Customer)
- `restaurantId`: ObjectId (Ref: Restaurant, Indexed)
- `ratings`: `{ food: Number, service: Number, ambience: Number, overall: Number }`
- `reviewTitle`: String
- `comment`: String
- `ownerReply`: `{ replyText: String, repliedAt: Date }`
- `status`: String ('approved', 'flagged', 'hidden')

### 8. `discounts`
- `_id`: ObjectId
- `code`: String (Uppercase, Unique)
- `title`: String
- `discountType`: String ('percentage', 'fixed')
- `discountValue`: Number
- `minBillAmount`: Number
- `maxDiscountAmount`: Number
- `targetSegment`: String ('all', 'new', 'regular', 'loyal', 'birthday', 'high_spending')
- `whyExplanation`: String
- `isActive`: Boolean

### 9. `groupdiningplans`
- `_id`: ObjectId
- `creatorId`: ObjectId (Ref: Customer)
- `groupName`: String
- `groupSize`: Number
- `targetBudgetPerPerson`: Number
- `shortlistedRestaurants`: `[{ restaurantId: ObjectId, votes: [ObjectId] }]`
- `winningRestaurantId`: ObjectId
- `shareCode`: String (Unique, e.g. 'CW-MSD6')
- `status`: String ('voting', 'finalized', 'booked')

