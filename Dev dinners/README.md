# CRAVEWISE – SMART DINE-IN DISCOVERY & RESTAURANT INTELLIGENCE PLATFORM

> **Course:** Management Software Development (MSD) – 3rd Year CSE  
> **Architecture:** Modern MERN Stack (MongoDB GeoJSON, Express.js, React 18, Node.js, Tailwind CSS)  
> **Core Focus:** Smart offline dine-in discovery, personalized budget meal planning, table reservations with arrival check-in verification, verified reviews, and restaurant intelligence.

---

## 🌟 What Makes CraveWise Different from Zomato / Swiggy?

CraveWise is **not** a food delivery clone. It is purposefully engineered for the offline dine-in customer journey and restaurant intelligence:

1. **Location-Aware Proximity Discovery**: Browser Geolocation API + MongoDB GeoJSON `Point` coordinates and `2dsphere` spatial indexing to compute distances in kilometers and display venues on an interactive Leaflet map.
2. **"Help Me Choose" Decision Assistant**: Transparent Multi-Attribute Utility Theory (MAUT) 100-point scoring algorithm combining distance (25%), budget fit (25%), cuisine preference (20%), verified rating (20%), and offers (10%).
3. **Smart Meal Builder & Budget Combinatorial Solver**: Select up to 3 dishes, calculate live savings, or let the solver automatically construct optimal Starter + Main Course + Dessert combinations matching your exact budget.
4. **Personalized Dynamic Discount Engine**: Segments diners into New, Regular, Loyal, Birthday, and High-Spending with transparent *"Why am I getting this offer?"* explanations.
5. **Double-Booking Prevention & Waitlist**: Atomic table conflict detection prevents reservation collisions. Automated FIFO waitlist queues diners when tables are full.
6. **Arrival Check-In Code (QR / 4-Digit Code)**: Physical verification at the restaurant verifies arrival and updates booking to `seated`.
7. **Verified Diner Reviews**: Reviews can **only** be submitted after completing an offline dining visit, eliminating fake reviews.
8. **Group Dining Planner & Voting Room**: Share a 6-character code (`CW-MSD6`) with friends to shortlist and vote collaboratively.
9. **Customer Dining Passport**: Tracks dining visits, money saved, loyalty points ledger, and unlocks achievement badges.
10. **Restaurant Intelligence Dashboard**: Gives owners live table occupancy rates, popular menu trends, and genuine revenue metrics.
11. **Super Admin Governance Console**: Full platform oversight, restaurant approvals/freezes, customer moderation, and audit logs.

---

## 🚀 Quick Start Guide

### 1. Configure MongoDB Connection (`server/.env`)
Open `server/.env` and set your MongoDB URI, GitHub OAuth app credentials, and callback URL:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cravewise
JWT_SECRET=cravewise_msd_university_secret_key_2026
CLIENT_URL=http://localhost:5173
GITHUB_CLIENT_ID=<your-github-oauth-client-id>
GITHUB_CLIENT_SECRET=<your-github-oauth-client-secret>
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```
Create a GitHub OAuth App under **Settings → Developer settings → OAuth Apps**. Set its authorization callback URL to the value of `GITHUB_CALLBACK_URL`. Keep the client secret private. GitHub sign-in creates or links customer accounts using a verified GitHub email; owner and admin accounts continue to use email and password.

### 2. Populate Realistic Hyderabad Seed Dataset
Seed 10 authentic Hyderabad restaurants (Paradise Biryani, Bawarchi, Jewel of Nizam, Tatva, etc.), 50+ menu items, 15 segmented customers, sample bookings, tables, and verified reviews:
```bash
npm run seed
```

### 3. Start the Backend API Server
```bash
npm run server
```
*Health Check: `http://localhost:5000/api/health`*

### 4. Start the Frontend React Client
In a separate terminal:
```bash
npm run client
```
*Application URL: `http://localhost:5173`*

---

## 📦 Dependencies and Prerequisites

CraveWise requires:

- Node.js 18 or newer
- npm 9 or newer
- MongoDB 6 or newer, either locally or through MongoDB Atlas

The complete client, server, and development dependency list is maintained in [`requirement.txt`](./requirement.txt). Install all application dependencies with:

```powershell
npm install --prefix server
npm install --prefix client
```

The backend uses Express, MongoDB/Mongoose, JWT authentication, bcryptjs, CORS, dotenv, and Morgan. The frontend uses React, React Router, Vite, Tailwind CSS, Axios, Framer Motion, Leaflet, Recharts, and Lucide React.

## 🧰 Available Root Commands

Run these commands from the repository root:

| Command | Purpose |
|---|---|
| `npm run server` | Start the Express API server |
| `npm run client` | Start the Vite React development server |
| `npm run seed` | Populate MongoDB with the demo dataset |
| `npm run build` | Create the optimized frontend production build |

## 🏗️ How the Application Works

1. The React client provides role-specific pages and calls backend endpoints under `/api`.
2. Vite proxies frontend `/api` requests to the Express server during development.
3. Express validates requests and forwards them to feature controllers.
4. Mongoose models read and update restaurant, customer, booking, review, menu, group dining, and administration data in MongoDB.
5. JWT middleware protects authenticated customer, owner, and administrator endpoints.
6. The frontend stores the active authentication token in browser local storage and attaches it to API requests.

## 🔧 Useful API Endpoints

| Area | Endpoint Prefix |
|---|---|
| Health check | `/api/health` |
| Authentication | `/api/auth` |
| Restaurants | `/api/restaurants` |
| Recommendations | `/api/recommendations` |
| Meal builder | `/api/meal-builder` |
| Discounts | `/api/discounts` |
| Bookings | `/api/bookings` |
| Waitlist | `/api/waitlist` |
| Feedback | `/api/feedback` |
| Group dining | `/api/group-dining` |
| Dining passport | `/api/passport` |
| Restaurant owner portal | `/api/restaurant-portal` |
| Administration | `/api/admin` |

## 🧪 Build Verification

To verify that the production frontend compiles correctly:

```powershell
npm run build
```

The generated files are written to `client/dist`.

---

## 🔑 Demo Credentials for Faculty Viva Evaluation

One-click demo buttons are provided on the login page (`/login`) for instantaneous testing:

| Role | Email | Password | Access / Portal |
|---|---|---|---|
| **Super Admin** | `admin@cravewise.com` | `admin123` | Platform Metrics, Approvals, Discount Rules (`/admin/dashboard`) |
| **Restaurant Owner (Paradise)** | `paradise@cravewise.com` | `owner123` | Table Layout, Menu CRUD, Check-In Verifier (`/owner/dashboard`) |
| **Restaurant Owner (Tatva)** | `tatva@cravewise.com` | `owner123` | Fine Dining Pure Veg Portal (`/owner/dashboard`) |
| **Customer (Loyal Diner)** | `rahul@gmail.com` | `customer123` | Dining Passport, Completed Bookings, Reviews (`/passport`) |
| **Customer (Birthday Month)** | `sneha@gmail.com` | `customer123` | Unlocks Birthday Discount Campaign |

---

## 📁 Repository Structure

```
cravewise/
├── server/
│   ├── config/ (db.js, constants.js)
│   ├── models/ (15 Mongoose Schemas: Customer, Restaurant, MenuItem, Table, Booking, Feedback, Discount...)
│   ├── controllers/ (auth, restaurant, recommendation, mealBuilder, booking, waitlist, feedback, owner, admin)
│   ├── routes/ (Clean REST express routes)
│   ├── services/ (recommendationService, mealBuilderService, discountEngineService, loyaltyService)
│   ├── middleware/ (authMiddleware, roleMiddleware, errorMiddleware)
│   ├── seeds/ (seedRunner.js with 10 Hyderabad venues)
│   └── server.js
│
├── client/
│   ├── src/
│   │   ├── components/ (RestaurantCard, RestaurantMap, HelpMeChooseModal, MealBuilderModal, BookingModal, FeedbackModal)
│   │   ├── context/ (AuthContext, LocationContext with browser GPS)
│   │   ├── pages/ (HomePage, RestaurantDetailPage, ComparisonPage, LoginPage, RegisterPage, MyBookings, Passport, GroupDining, OwnerDashboard, AdminDashboard)
│   │   └── services/ (Axios client with bearer token interceptor)
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docs/ (Abstract, Architecture, ERD, Algorithms & Viva Voce Guide)
└── postman/ (CraveWise_API_Collection.json)
```
