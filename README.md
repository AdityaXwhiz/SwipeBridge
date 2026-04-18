# CardProxy — Full Stack App

> Every card's discount. Zero cards.

## Project Structure

```
cardproxy/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/         LandingPage, AuthPage, Dashboard, PaymentFlow, AddCard
│   │   ├── components/    Navbar, Footer, Ticker, CardPreview, Icons, Grain
│   │   ├── context/       AuthContext (JWT auth state)
│   │   └── utils/         api.js (Axios instance)
│   └── package.json
│
└── backend/           # Node.js + Express + MongoDB
    ├── server.js
    ├── config/        db.js
    ├── models/        User, Card, Transaction
    ├── controllers/   auth, cards, transactions, offers, user
    ├── routes/        auth, cards, transactions, offers, user
    ├── middleware/    auth (JWT protect)
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Clone / unzip the project

```bash
cd cardproxy
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cardproxy
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

The Vite dev server proxies all `/api/*` requests to `http://localhost:5000` automatically.

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/cards` | Yes | Get user's cards |
| POST | `/api/cards` | Yes | Add new card |
| DELETE | `/api/cards/:id` | Yes | Remove card |
| GET | `/api/cards/network` | No | Public network cards |
| GET | `/api/offers` | Yes | Get current offers |
| POST | `/api/offers/optimize` | Yes | AI offer ranking |
| GET | `/api/transactions` | Yes | Transaction history |
| POST | `/api/transactions` | Yes | Create transaction |
| GET | `/api/transactions/stats` | Yes | Spending analytics |
| GET | `/api/user/profile` | Yes | Get profile |
| PATCH | `/api/user/profile` | Yes | Update profile |
| GET | `/api/user/trust-score` | Yes | Trust score + perks |
| GET | `/api/health` | No | Health check |

---

## MongoDB Atlas (Cloud DB)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Click **Connect → Connect your application**
4. Copy the connection string
5. Replace `MONGO_URI` in `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cardproxy?retryWrites=true&w=majority
```

---

## Deploy

### Frontend → Vercel

```bash
cd frontend
npm run build
# Upload dist/ to Vercel or run: npx vercel
```

Set environment variable on Vercel:
```
VITE_API_URL=https://your-backend.onrender.com
```

Update `vite.config.js` proxy target to match your backend URL in production.

### Backend → Render

1. Push `backend/` to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Vite, Axios |
| Styling | Pure CSS (no Tailwind — exact match to design files) |
| Fonts | Syne 800, DM Sans 400/500/600/700 |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Security | helmet, cors, express-rate-limit, express-validator |
| Dev | nodemon, Vite HMR |

---

## BestDeal AI Feature

New `/best-deal` page adds price intelligence across platforms.

### Frontend (`src/pages/BestDeal.jsx`)
- Product search with live autocomplete dropdown
- Trending products quick-select chips
- Per-platform scan animation (staggered reveal)
- Side-by-side platform comparison cards showing:
  - Listed price, delivery, star rating, review count
  - Best card offer available per platform
  - Effective price after discount + 1.2% platform fee
- Summary bar: platforms scanned, lowest listed, true best price, total savings
- AI insight: explains why cheapest site ≠ best deal
- "TRUE BEST DEAL" badge on the winning platform card

### Backend (`/api/bestdeal`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bestdeal/products?q=iphone` | Search product catalog |
| GET | `/api/bestdeal/scan/:productId` | Scan platforms + optimize |
| POST | `/api/bestdeal/optimize` | Custom price optimization |

To connect real prices, replace `MOCK_CATALOG` in `bestDealController.js` with calls to retailer APIs or a scraping service (e.g. Oxylabs, ScraperAPI, or the official Amazon PA-API).
