# ☕ Kavah & Co. Artisanal Roasters — Specialty Coffee E-Commerce Platform

A production-style, full-stack specialty coffee e-commerce web application engineered with **React, TypeScript, Vite, Tailwind CSS, Node.js, Express, and MongoDB**.

Built for a luxury artisanal coffee brand featuring small-batch single-origin harvests, custom roasting profiles, live inventory management, direct-trade storytelling, interactive barista brew guides, and a complete staff administration dashboard.

---

## 🌟 Key Highlights & Architectural Features

### 🛍️ Customer Experience & Storefront
- **Artisanal Roastery Design System**: Warm dark espresso tones (`#0F0804`, `#1A0E08`), roast gold accents (`#C5A880`), authentic typography, high-res photography, and responsive layouts.
- **Product Catalog & Sourcing**:
  - 22 real specialty coffee products with detailed cupping notes, SCA ratings (86–91 pts), roast levels, origin elevations, and processing methods (Washed, Natural, Honey, Swiss Water Decaf).
  - Variant matrices supporting multi-weight selection (250g, 500g, 1kg) and precision grind profiles (Whole Bean, Espresso, Pour Over, French Press, Cold Brew).
  - Dynamic stock tracking and real-time inventory decrementing upon order placement.
- **Comprehensive Filtering & Search**:
  - Filter by Roast Level (Light to Dark spectrum), Origin, Category, and In-Stock availability.
  - Price slider and multiple sort orders (Featured, Price, Rating, Newest).
  - Quick View modal for rapid ordering without leaving catalog view.
- **Cart & Promotion Engine**:
  - Real-time cart calculation with free-shipping progress tracker (unlocks over $50).
  - Promotional coupon engine supporting percentage, fixed dollar, and free shipping vouchers.
- **Streamlined Multi-Step Checkout**:
  - Contact information and saved address autofill.
  - Shipping tier selection (Standard Ground vs. Express Courier).
  - Payment simulations (Credit Card with cardholder validation, Cash on Delivery / Roastery Pickup, 1-Click Test Pay).
  - Full receipt & order confirmation page with real tracking numbers and 4-step roasting sequence.
- **Interactive Home Barista Guide**:
  - Live Brew Ratio Calculator for Hario V60, Chemex, French Press, AeroPress, Cold Brew, and 9-Bar Espresso.
  - Visual Grind Size Spectrum guide from extra coarse to Turkish fine.
- **Specialty Journal & Roastery Blog**:
  - Educational articles on dialling in espresso, water chemistry, degassing windows, and single-origin vs. blends.

### 👤 Customer Portal & Authentication (`/register`, `/login`, `/forgot-password`, `/reset-password`, `/account`)
- **Full User Sign-Up**: Direct registration with email and password, automatic password encryption via bcrypt in MongoDB, duplicate detection, and instant session creation.
- **Forgot Password Workflow**: Secure 64-character sha256 token generation with 1-hour expiration and 1-click reset navigation.
- **Password Reset Engine**: Token verification, new password hashing, real-time validation, and automated authentication upon reset.
- **Dedicated Account Dashboard**: Order history, receipt view, multi-address book, and profile settings.
- **Saved Favorites & Wishlist**: Persistent wishlist with guest-to-account synchronization and one-click "Add All to Cart".

### ⚙️ Roastery Command Center (`/admin`)
- **Telemetry & Metrics**: Real-time gross sales, order volume, catalog count, and customer metrics.
- **Coffee Catalog Management**: Full CRUD modal for adding, editing, and retiring coffees with variant pricing, tasting notes, and stock levels.
- **Fulfillment Pipeline**: Manage orders, update roasting statuses (*Pending &rarr; Confirmed &rarr; Processing &rarr; Shipped &rarr; Delivered*), and payment statuses.
- **Promotional Coupon Manager**: Create and toggle active promotional discount vouchers.
- **Cupping Review Moderation**: Moderate customer tasting reviews with approve/reject/delete controls.

---

## 🔑 Demo Access & Quick Credentials

Both credentials can be entered manually or triggered with **1-click fast buttons** on the Login page:

| Role | Email | Password |
|---|---|---|
| **Demo Customer** | `customer@example.com` | `Demo123!` |
| **Roastery Admin** | `admin@example.com` | `Admin123!` |

### 🏷️ Active Promotional Codes (Try in Cart!)
- `WELCOME10` — 10% off your entire order (Min spend: $25)
- `COFFEE20` — 20% off orders over $60
- `FREESHIP` — Complimentary carbon-neutral domestic shipping
- `ESPRESSO15` — $15 off orders over $50
- `BEANS5` — $5 off orders over $20

---

## 🛠️ Tech Stack & Directory Structure

```
coffee store/
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/           # MongoDB connection & Memory Server fallback
│   │   ├── controllers/      # Auth, Products, Orders, Coupons, Reviews, Admin
│   │   ├── middleware/       # JWT auth, error handlers
│   │   ├── models/           # Mongoose schemas (User, Product, Order, etc.)
│   │   ├── routes/           # REST endpoints (/api/*)
│   │   ├── seed/             # Seeding script with 22 coffees, 11 users, 5 coupons
│   │   └── server.ts         # Express server listening on port 5000
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React + TypeScript + Vite + Tailwind CSS
│   ├── public/
│   │   └── images/           # High-resolution coffee photography assets
│   ├── src/
│   │   ├── components/       # Header, Footer, ProductCard, QuickViewModal, Skeletons
│   │   ├── context/          # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Collections.tsx
│   │   │   ├── CoffeeGuide.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Blog.tsx / BlogDetail.tsx
│   │   │   ├── Contact.tsx / FAQ.tsx
│   │   │   ├── Cart.tsx / Checkout.tsx / OrderConfirmation.tsx
│   │   │   ├── Wishlist.tsx
│   │   │   ├── Login.tsx / Register.tsx
│   │   │   ├── customer/     # AccountDashboard, Orders, Addresses, Profile
│   │   │   └── admin/        # AdminDashboard, Products, Orders, Coupons, Reviews
│   │   ├── services/         # Typed API client with JWT support
│   │   ├── types/            # TypeScript data models
│   │   ├── App.tsx           # React Router v6 setup
│   │   └── main.tsx
│   ├── vite.config.ts        # Configured with proxy to port 5000
│   ├── tailwind.config.js    # Custom luxury espresso color palette
│   └── package.json
└── README.md
```

---

## 🚀 Running The Application Locally

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
# Server listening on http://localhost:5000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Vite dev server listening on http://localhost:5173
```
Visit `http://localhost:5173` in your browser. All `/api` requests are automatically proxied to the backend.
