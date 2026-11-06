# CRAVEWISE – SIX-MEMBER VIVA VOCE EVALUATION GUIDE

This document provides each team member with their exact responsibilities, database collections owned, source files written, and answers to common faculty evaluation questions.

---

## Member 1: Customer Authentication, Profile & Smart Geo Discovery
- **Modules Owned**: `Customer.js`, `Favourite.js`, `authController.js`, `restaurantController.js` (discovery methods), `HomePage.jsx`, `RestaurantMap.jsx`, `LoginPage.jsx`.
- **Key Concepts**: JSON Web Tokens (JWT), bcrypt password hashing, MongoDB GeoJSON `Point` coordinates, `2dsphere` spatial indexing.

### Likely Viva Questions & Answers:
1. **Q: How does MongoDB calculate distance between customer and restaurant?**  
   **A:** We use GeoJSON `Point` coordinates `[longitude, latitude]` indexed with `{ location: "2dsphere" }`. The `$geoNear` aggregation pipeline computes spherical trigonometry (Haversine distance) directly in the database engine, returning exact distances in meters.
2. **Q: Why are passwords hashed with bcrypt instead of MD5 or plain text?**  
   **A:** bcrypt uses adaptive salting and key stretching (work factor 10), preventing rainbow table attacks and brute force cracking.
3. **Q: What happens if the browser denies GPS permissions?**  
   **A:** CraveWise provides a graceful fallback allowing users to manually pick a dining hub (e.g. Hitec City, Banjara Hills, Jubilee Hills, Secunderabad) from our `LocationContext`.

---

## Member 2: Restaurant Registration, Profile & Owner Portal
- **Modules Owned**: `Restaurant.js`, `ownerPortalController.js`, `OwnerDashboardPage.jsx`.
- **Key Concepts**: Multi-role authentication, business KPIs, seat occupancy calculation, data-driven recommendations.

### Likely Viva Questions & Answers:
1. **Q: How does the system calculate real table utilization?**  
   **A:** Utilization Rate = `(Occupied Capacity of Seated Diners / Total Restaurant Seating Capacity) * 100`. It updates in real time as guests check in.
2. **Q: How does the revenue figure prevent fake statistics?**  
   **A:** It computes the sum of `actualBillAmount` strictly from reservations with `status === "completed"`. Pending or cancelled bookings are excluded.
3. **Q: How is restaurant ownership secured in the backend?**  
   **A:** Protected owner routes verify `req.user.role === 'restaurant_owner'` and scope all menu/table operations to `req.user._id`.

---

## Member 3: Menu CRUD & Smart Table / Waitlist Management
- **Modules Owned**: `MenuItem.js`, `Table.js`, `Booking.js`, `Waitlist.js`, `bookingController.js`, `waitlistController.js`, `BookingModal.jsx`.
- **Key Concepts**: Relational references in MongoDB, double-booking prevention guards, 4-digit check-in verification codes, FIFO waitlist queue.

### Likely Viva Questions & Answers:
1. **Q: How do you prevent double-booking the same table for the same time slot?**  
   **A:** Before creating a reservation, the backend queries existing bookings for that `restaurantId`, `bookingDate`, and `timeSlot` where status is `confirmed` or `seated`. Tables in use are excluded from candidate tables.
2. **Q: What is the purpose of the 4-digit check-in code?**  
   **A:** It simulates physical presence at the restaurant. The diner presents this code to the restaurant host, who enters it in their portal to mark the party as `seated`.
3. **Q: What happens when all tables are full?**  
   **A:** The API returns status code `409 Conflict` with `isWaitlistEligible: true`. The customer can join the automated waitlist queue.

---

## Member 4: Verified Feedback, Ratings & Notifications
- **Modules Owned**: `Feedback.js`, `Notification.js`, `feedbackController.js`, `FeedbackModal.jsx`, `StarRating.jsx`.
- **Key Concepts**: Feedback verification integrity, 4-metric rating recalculation, administrative moderation.

### Likely Viva Questions & Answers:
1. **Q: How does CraveWise ensure that reviews are genuine and not faked?**  
   **A:** A review can only be posted if a valid `bookingId` is provided where `status === 'completed'` and `customerId === req.user._id`. Each completed booking can only be reviewed once.
2. **Q: Which 4 metrics are evaluated in feedback?**  
   **A:** Food Quality & Taste, Staff Service & Hospitality, Ambience & Hygiene, and Overall Dining Experience.
3. **Q: Can a restaurant owner delete a negative review?**  
   **A:** No. Restaurant owners can post official management replies, but only the Super Admin can moderate or hide reviews.

---

## Member 5: Super Admin Portal, Governance & Platform Analytics
- **Modules Owned**: `Admin.js`, `ActivityLog.js`, `adminController.js`, `adminRoutes.js`, `AdminDashboardPage.jsx`.
- **Key Concepts**: Centralized administration, restaurant lifecycle (approved, pending, frozen), audit trails.

### Likely Viva Questions & Answers:
1. **Q: What is the difference between freezing and deleting a restaurant?**  
   **A:** Freezing preserves historical booking records and customer feedback while immediately preventing new table reservations. Deletion is safeguarded against accidental data loss.
2. **Q: How are platform-wide cuisine trends determined?**  
   **A:** Using MongoDB `$unwind` on `cuisineTypes` followed by `$group` and `$sort` to identify the most popular dining cuisines across Hyderabad.
3. **Q: What are Activity Logs used for?**  
   **A:** They create an immutable audit trail capturing administrative actions (e.g. `RESTAURANT_FROZEN`, `CUSTOMER_SUSPENDED`) with timestamps and actor IDs.

---

## Member 6: Personalized Discounts, Meal Builder, Recommendations & Group Dining
- **Modules Owned**: `Discount.js`, `DiscountUsage.js`, `GroupDiningPlan.js`, `LoyaltyTransaction.js`, `recommendationService.js`, `mealBuilderService.js`, `discountEngineService.js`, `loyaltyService.js`, `HelpMeChooseModal.jsx`, `MealBuilderModal.jsx`, `DiningPassportPage.jsx`, `GroupDiningPage.jsx`.
- **Key Concepts**: Customer segmentation logic, knapsack-like combinatorial meal search, multi-attribute utility theory (MAUT), group voting rooms.

### Likely Viva Questions & Answers:
1. **Q: How does the "Help Me Choose" recommendation formula work?**  
   **A:** It computes a 100-point weighted utility score across 5 factors: Distance (25%), Budget Fit (25%), Cuisine Match (20%), Rating (20%), and Active Offers (10%), with transparent step-by-step explanations.
2. **Q: How does the Smart Meal Builder generate combos within a budget?**  
   **A:** It partitions available dishes into Starters, Main Courses, and Desserts, iterates over valid triplets satisfying `Price <= Budget`, and ranks them by combined popularity and budget utilization efficiency.
3. **Q: What is customer segmentation in the personalized discount engine?**  
   **A:** Diners are classified dynamically into New (0 visits), Regular (2-4 visits), Loyal (5+ visits or high spend), Birthday (current month), and Inactive. Discounts are targeted specifically to these segments.

