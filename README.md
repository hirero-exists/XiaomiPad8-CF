# Xiaomi Pad 8 Development Crowdfunding 🚀

A clean, minimal, responsive, single-page community crowdfunding website for the **Xiaomi Pad 8** development device. Designed to feel like an authentic open-source project page rather than a commercial platform.

Hosted for free on **GitHub Pages** with a serverless **Supabase** backend for private payment verification, admin authentication, and public totals with locked historical exchange rates.

---

## 📸 Key Highlights & Features

- **Minimalist & Clean UI**: Dark-neutral theme inspired by GitHub and open-source projects, with subtle blue accents matching the official tablet hardware.
- **Main Funding Progress Bar**: Displays live progress towards the **$350 USD** community goal along with live Indian Rupee (INR) equivalents.
- **Milestones**: ₹20,000, ₹25,000, ₹30,000, and $350 Final goal markers.
- **Co-funding Transparency**: Transparent card showing the total device price (₹52,000 / ~$540), community goal ($350), and the developer's personal out-of-pocket contribution.
- **Donation Methods**:
  - **India**: UPI ID with 1-click copy, QR code preview, and verification submission.
  - **International**: Card / payment gateway link (e.g. TYVM) with transaction verification submission.
- **Strict Verification & Row-Level Security**:
  - All submissions start as `pending`.
  - Transaction references / UTR numbers are **never** exposed publicly.
  - Public visitors can only view approved donations and totals.
- **Permanent Exchange Rate Locking**:
  - When an admin approves a donation, the USD/INR conversion rate at that exact moment is locked permanently into that record. Historical totals will never fluctuate when future exchange rates change.
- **Protected Admin Dashboard (`/#/admin`)**:
  - Requires email + password authentication powered by Supabase Auth.
  - One-click Approve / Reject with live exchange rate preview.
  - Campaign settings management (lifecycle state, purchase status, proof receipt link).

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Exchange Rates**: Open Exchange Rates API (free, automatic fallback)
- **Deployment**: GitHub Pages via GitHub Actions

---

## 🚀 Quick Start (Local Development)

### 1. Clone or Open the Repository
```bash
cd xiaomi-pad-8-crowdfunding
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

> **Note:** If you haven't set up Supabase credentials yet, the app automatically runs in **Preview Mode** with local demo data. You can log into `/admin` using any password to test all features immediately!

---

## 🗄️ Setting Up the Backend (In Simple Terms)

You do **not** need to manage a server or pay for hosting. Supabase gives you a free database and authentication system.

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **"Start your project"** (log in with your GitHub account).
2. Click **"New Project"**.
3. Choose a project name (e.g., `xiaomi-pad-8`), set any strong database password, and pick a region close to you.
4. Click **"Create new project"** and wait about 1–2 minutes for it to initialize.

### Step 2: Run the Database Setup Script
1. In your Supabase project dashboard, click on the **SQL Editor** tab (the `>_` icon on the left menu).
2. Click **"New query"**.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository, copy all of its contents, and paste them into the Supabase SQL editor.
4. Click the green **"Run"** button.
   *(This creates the tables, security policies, and views automatically).*

### Step 3: Create Your Admin Password
1. In the Supabase left menu, click **Authentication** &gt; **Users**.
2. Click **"Add user"** &gt; **"Create user"**.
3. Enter your admin email address and your chosen password.
4. Toggle **"Auto Confirm User?"** to ON (so you don't need to verify via email).
5. Click **"Create user"**.
   *(You will use this email and password to log in at `/#/admin`).*

### Step 4: Get Your API Keys
1. In Supabase, click the **Settings** (gear icon) in the bottom-left &gt; **API**.
2. Under **Project API keys**, you will see:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **anon / public key** (a long string starting with `ey...`)
3. Copy these values into your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJh......
   ```

That's it! Your backend is fully configured.

---

## 🔐 Accessing the Admin Dashboard

1. Navigate to:
   ```
   http://localhost:5173/#/admin
   ```
   (Or click the small **Admin** lock button in the top navbar or footer).
2. Enter your admin email and password.
3. Once logged in, you can:
   - Review pending UPI and card submissions.
   - Click **Approve** to lock the current USD/INR exchange rate and publish the backer to the live page.
   - Click **Reject** to discard fraudulent or invalid submissions.
   - Manage the campaign lifecycle (e.g. switch to *Goal Reached* or *Device Ordered* and add invoice receipts).

---

## ⚙️ Customization & Configuration

All campaign settings can be adjusted in one central file:
[`src/config.ts`](src/config.ts)

```ts
export const CAMPAIGN_CONFIG = {
  COMMUNITY_GOAL_USD: 350,
  DEVICE_PRICE_INR: 52000,
  DEVICE_NAME: "Xiaomi Pad 8",
  DEVICE_SPECS: "12GB RAM + 256GB Storage + Xiaomi Pen",
  UPI_ID: "yourname@upi",
  INTERNATIONAL_PAYMENT_URL: "https://tyvm.to/your-link",
  // ...
};
```

You can also override `VITE_UPI_ID` and `VITE_INTERNATIONAL_PAYMENT_URL` directly in `.env`.

---

## 🌐 Deploying to GitHub Pages for Free

This repository includes a ready-to-use GitHub Actions deployment workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### 1. Push Code to GitHub
Push your repository to GitHub:
```bash
git init
git add .
git commit -m "Initial commit of Xiaomi Pad 8 crowdfunding website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Add Secrets to GitHub
1. In your GitHub repository, go to **Settings** &gt; **Secrets and variables** &gt; **Actions**.
2. Click **"New repository secret"** and add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - (Optional) `VITE_UPI_ID`: Your UPI ID

### 3. Enable GitHub Pages
1. Go to **Settings** &gt; **Pages**.
2. Under **Build and deployment** &gt; **Source**, select **GitHub Actions**.
3. Push any commit to `main` (or click **Actions** &gt; **Deploy to GitHub Pages** &gt; **Run workflow**).
4. Within 1 minute, your website will be live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## 📄 License & Transparency

This project is open-source. Not affiliated with or endorsed by Xiaomi Inc.
All contributions are collected transparently for open-source development hardware.
