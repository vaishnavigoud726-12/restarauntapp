# CRAVEWISE – MATHEMATICAL ALGORITHMS & CORE BUSINESS LOGIC

This document provides clear explanations of the algorithms and mathematical formulas implemented in CraveWise. It is written to help students defend their project during university viva voce examinations.

---

## 1. Geospatial Distance Calculation (Haversine Formula)

To compute the spherical distance between the customer's coordinates $(\text{lat}_1, \text{lon}_1)$ and the restaurant's coordinates $(\text{lat}_2, \text{lon}_2)$:

$$\Delta\text{lat} = \text{lat}_2 - \text{lat}_1, \quad \Delta\text{lon} = \text{lon}_2 - \text{lon}_1$$

$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c$$

*Where $R = 6371\text{ km}$ (Earth's mean radius).*

**MongoDB 2dsphere Implementation:**  
MongoDB internally executes spherical trigonometry over GeoJSON points indexed with `{ location: "2dsphere" }` using the `$geoNear` aggregation pipeline operator:
```javascript
{
  $geoNear: {
    near: { type: "Point", coordinates: [userLng, userLat] },
    distanceField: "distanceMeters",
    maxDistance: maxDistMeters,
    spherical: true
  }
}
```

---

## 2. "Help Me Choose" Transparent Scoring Algorithm

Rather than relying on opaque machine learning claims, CraveWise implements a transparent **Multi-Attribute Utility Theory (MAUT)** model. Every candidate restaurant receives a score out of 100 based on 5 weighted attributes:

$$\text{Score} = (W_D \cdot S_D) + (W_B \cdot S_B) + (W_C \cdot S_C) + (W_R \cdot S_R) + (W_O \cdot S_O)$$

### Parameter Weights:
- $W_D = 0.25$ (Distance Proximity)
- $W_B = 0.25$ (Budget Fit)
- $W_C = 0.20$ (Cuisine Match)
- $W_R = 0.20$ (Verified Rating)
- $W_O = 0.10$ (Active Offer Availability)

### Sub-Score Formulations:
1. **Distance Score ($S_D$)**:  
   $$S_D = \max\left(0, 100 \cdot \left(1 - \frac{\text{Distance}}{\text{MaxDistance}}\right)\right)$$
2. **Budget Fit Score ($S_B$)**:  
   Let $\text{CostPerPerson} = \frac{\text{PriceForTwo}}{2}$.  
   If $\text{CostPerPerson} \le \text{TargetBudget}$, then $S_B = 100$.  
   Else:  
   $$S_B = \max\left(0, 100 - \left(\frac{\text{CostPerPerson} - \text{TargetBudget}}{\text{TargetBudget}}\right) \cdot 100\right)$$
3. **Cuisine Match Score ($S_C$)**:  
   $S_C = 100$ if any restaurant cuisine matches diner preferences; $30$ otherwise.
4. **Rating Score ($S_R$)**:  
   $$S_R = \left(\frac{\text{AverageRating}}{5.0}\right) \cdot 100$$
5. **Offer Score ($S_O$)**:  
   $S_O = 100$ if active personalized discounts apply; $30$ otherwise.

---

## 3. Smart Meal Builder Combinatorial Solver

Given a target budget constraint $B$ and restaurant menu items partitioned into:
- $S = \text{Starters}$
- $M = \text{Main Courses}$
- $D = \text{Desserts / Beverages}$

The solver performs a bounded search to find triplets $(s, m, d)$ such that:

$$\text{Cost}(s, m, d) = \text{Price}(s) + \text{Price}(m) + \text{Price}(d) \le B$$

Candidate combinations are ranked by an **Efficiency Score ($E$)**:

$$E = \left(\text{Pop}(s) + \text{Pop}(m) + \text{Pop}(d)\right) \cdot \left(\frac{\text{Cost}(s, m, d)}{B}\right)$$

This maximizes dish popularity while efficiently utilizing the diner's target budget. The top 3 ranked distinct combinations are returned to the user.

---

## 4. Double-Booking Prevention Logic

To eliminate reservation collisions, the system executes an atomic check prior to booking creation:
```javascript
const conflictingBookings = await Booking.find({
  restaurantId,
  bookingDate,
  timeSlot,
  status: { $in: ['confirmed', 'seated'] }
});

const bookedTableIds = new Set(conflictingBookings.map(b => b.tableId.toString()));
const availableTable = candidateTables.find(t => !bookedTableIds.has(t._id.toString()));

if (!availableTable) {
  // Reject booking and prompt waitlist registration
  return res.status(409).json({ error: "All tables occupied. Join waitlist?" });
}
```

---

## 5. Dining Passport Loyalty Points Accrual

Points are awarded **strictly upon completion** of an offline dining session:

$$\text{Points Earned} = 50 + \left\lfloor\frac{\text{Actual Bill Amount}}{20}\right\rfloor$$

*(Base 50 bonus points + 1 loyalty point per ₹20 spent).*

