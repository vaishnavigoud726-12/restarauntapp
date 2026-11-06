# CRAVEWISE – PROJECT ABSTRACT & SYSTEM VISION

**Subject:** Management Software Development (MSD)  
**Academic Level:** Third-Year Bachelor of Technology (CSE)  
**Project Title:** CraveWise – Smart Dine-In Discovery & Restaurant Intelligence Platform  

---

## 1. Project Abstract
Modern food-tech platforms (e.g., Zomato, Swiggy) prioritize doorstep food delivery, hyper-local courier logistics, and commission-heavy takeaway delivery. In contrast, they neglect the complex, multi-variable offline dine-in journey: location-aware discovery, transparent budget meal planning, real-time table availability without double booking, verified physical check-ins, social group decision-making, and restaurant management analytics.

**CraveWise** bridges this technological gap by engineering a specialized, end-to-end Smart Dine-In Discovery & Restaurant Intelligence Platform using the MERN stack (MongoDB, Express.js, React.js, Node.js). 

Key innovations implemented:
1. **Geospatial Proximity Discovery**: Utilizing MongoDB GeoJSON `Point` coordinates and `2dsphere` spatial indexing for real-time proximity lookups and interactive Leaflet map rendering.
2. **"Help Me Choose" Transparent Decision Engine**: Multi-Attribute Utility Theory (MAUT) mathematical scoring based on distance, target budget, cuisine compatibility, verified reviews, and available offers.
3. **Smart Meal Builder & Combinatorial Solver**: Bounded combinatorial triplet optimizer recommending balanced 3-course meals within a diner's exact budget constraint.
4. **Personalized Dynamic Discount Engine**: Customer segmentation engine (New, Regular, Loyal, Birthday, High-Spending) with transparent "Why am I getting this offer?" explanations.
5. **Physical Table Reservation & QR Check-In**: Eliminates double-booking conflicts and enforces a 4-digit physical arrival verification code before guests are seated.
6. **Strictly Verified Diner Reviews**: Reviews can only be submitted after completing an offline dining visit, eliminating fraudulent reviews.
7. **Social Group Outing Planner**: Lightweight shareable room codes allowing friends to shortlist and vote collaboratively.
8. **Customer Dining Passport**: Tracks verified dining milestones, savings, loyalty points ledger, and unlocks achievement badges.
9. **Restaurant Intelligence Dashboard**: Provides restaurateurs with real KPIs: table occupancy rate, popular menu categories, and genuine revenue metrics.

---

## 2. Problem Statement
Existing food delivery solutions suffer from critical offline dine-in limitations:
- **Disconnection from Physical Venues**: Diners cannot preview table layouts, check real-time seat availability, or confirm bookings with arrival codes.
- **Unverified & Manipulated Reviews**: Anyone can leave subjective ratings without proof of ever visiting or dining at the establishment.
- **Opaque Omakase Discounts**: Customers receive arbitrary promotional banners without transparency into criteria or savings calculations.
- **Group Decision Paralysis**: Coordinating multi-person dining outings often devolves into chaotic group chat arguments regarding budgets and cuisines.
- **Lack of Actionable Restaurant Intelligence**: Small-to-medium restaurant owners lack access to real-time seat utilization analytics, popular menu trends, and customer retention metrics.

---

## 3. Technology Stack & Justification

| Layer | Technology | Engineering Justification |
|---|---|---|
| **Frontend UI** | React.js 18 + Vite | Component-driven architecture, lightning-fast HMR, virtual DOM rendering. |
| **Styling** | Tailwind CSS | Utility-first CSS ensuring uniform modern typography, responsive layouts, and consistent color palettes. |
| **Mapping** | React-Leaflet + Leaflet | Open-source geospatial mapping with custom DOM pins, popups, and zero vendor lock-in. |
| **Backend API** | Node.js + Express.js | Asynchronous, event-driven REST API gateway structured under Clean MVC principles. |
| **Authentication**| JSON Web Tokens (JWT) + bcryptjs | Stateless, tamper-proof bearer authorization with role-based access control (RBAC). |
| **Database** | MongoDB + Mongoose ODM | Document store supporting native GeoJSON geometry, geospatial `$geoNear` aggregation, and strict schema validation. |
| **Analytics** | Recharts | Declarative SVG charting for restaurant utilization and platform metrics. |

