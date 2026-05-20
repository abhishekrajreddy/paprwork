<div align="center">
  <img src="public/logo_dark_bg.png" alt="Paprwork" width="200" />
  
  <h3>Freelance invoice management — without the faff</h3>

  <p>
    <a href="https://paprwork.vercel.app">🌐 Live Demo</a> ·
    <a href="#features">✨ Features</a> ·
    <a href="#tech-stack">🛠 Tech Stack</a> ·
    <a href="#getting-started">🚀 Getting Started</a>
  </p>

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

</div>

---

## Overview

**Paprwork** is a full stack SaaS invoicing platform built for freelance developers and digital consultants. Create professional invoices, manage clients, track payment statuses, and download branded PDF invoices — all behind a secure Google login.

Built to solve a real problem: most invoicing tools are either too expensive or too bloated for solo contractors. Paprwork is purpose-built, fast, and clean.

---

## Screenshots

### Dashboard

![Dashboard](docs/Paprwork_Dashboard.png)

### Invoice Detail + PDF Download

![Invoice](docs/Paprwork_Invoice.png)

### Generated PDF Invoice

![PDF](docs/Paprwork_PDF.png)

### Login

![Login](docs/Paprwork_Login_Auth.png)

### Mobile

<div align="center">
  <img src="docs/Paprwork_Mobile_Dashboard.jpeg" width="280" alt="Mobile Dashboard" />
  &nbsp;&nbsp;
  <img src="docs/Paprwork_Mobile_Invoice.jpeg" width="280" alt="Mobile Invoice" />
</div>

---

## Features

- 🔐 **Google OAuth** — secure one-click login via NextAuth.js
- 📄 **Invoice creation** — line items, quantity, rate, tax calculation, auto-generated invoice numbers
- 💷 **GBP formatting** — built for the UK freelance market
- 📊 **Dashboard** — live stats for total revenue, pending, overdue, and total clients
- 👥 **Client management** — save client details and create invoices directly from their profile
- 📥 **PDF download** — branded PDF invoices generated client-side using jsPDF
- 🔄 **Status tracking** — mark invoices as Draft, Pending, Paid, or Overdue
- 📱 **Fully responsive** — works seamlessly on mobile, tablet, and desktop
- ⚡ **Server Components** — data fetched server-side for fast page loads with no loading spinners

---

## Tech Stack

| Layer          | Technology                 |
| -------------- | -------------------------- |
| Framework      | Next.js 14 (App Router)    |
| Language       | TypeScript                 |
| Styling        | Tailwind CSS               |
| Database       | MongoDB Atlas + Mongoose   |
| Authentication | NextAuth.js + Google OAuth |
| PDF Generation | jsPDF + jsPDF-AutoTable    |
| Deployment     | Vercel                     |
| Runtime        | Node.js 20                 |

---

## Architecture

```
paprwork/
├── app/
│   ├── (auth)/login/          # Google OAuth login page
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── layout.tsx         # Auth guard — redirects if not logged in
│   │   ├── dashboard/         # Stats + recent invoices
│   │   ├── invoices/          # Invoice list, create, detail
│   │   └── clients/           # Client list + add client
│   └── api/                   # REST API routes
│       ├── auth/[...nextauth] # NextAuth OAuth handler
│       ├── invoices/          # GET, POST, PATCH, DELETE
│       └── clients/           # GET, POST, DELETE
├── components/
│   ├── Sidebar.tsx            # Responsive nav (desktop + mobile drawer)
│   ├── SessionProvider.tsx    # NextAuth client wrapper
│   └── InvoiceActions.tsx     # Status updater + PDF generation
├── lib/
│   ├── mongodb.ts             # Connection pooling for serverless
│   ├── auth.ts                # NextAuth config + Google provider
│   └── utils.ts               # formatCurrency, formatDate, generateInvoiceNumber
└── models/
    ├── User.ts                # User schema
    ├── Client.ts              # Client schema
    └── Invoice.ts             # Invoice schema with embedded line items
```

---

## Key Technical Decisions

**MongoDB connection caching** — Next.js runs as serverless functions on Vercel. Without caching, each API call creates a new connection and exhausts Atlas limits. The `lib/mongodb.ts` pattern stores the connection on the Node.js `global` object so it persists across function invocations.

**Server vs Client Components** — Dashboard and invoice pages are Server Components that fetch data directly from MongoDB without client-side JavaScript. Forms and interactive elements (invoice creation, status updates) are Client Components with `use client`.

**Client-side PDF generation** — PDFs are generated entirely in the browser using jsPDF, avoiding any server cost or file storage. The logo is loaded as base64 at runtime from the public folder.

**Route protection via layout** — The `app/(dashboard)/layout.tsx` calls `getServerSession()` once and protects every nested route automatically — no repeated auth checks per page.

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier)
- Google Cloud account (for OAuth)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/paprwork.git
cd paprwork

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your values (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paprwork?retryWrites=true&w=majority
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Getting your credentials:**

| Variable               | Where to get it                                               |
| ---------------------- | ------------------------------------------------------------- |
| `MONGODB_URI`          | MongoDB Atlas → Cluster → Connect → Drivers                   |
| `NEXTAUTH_SECRET`      | Any random string (e.g. `openssl rand -base64 32`)            |
| `GOOGLE_CLIENT_ID`     | Google Console → APIs & Services → Credentials → OAuth Client |
| `GOOGLE_CLIENT_SECRET` | Same as above                                                 |

### Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth Client ID
3. Add to **Authorised JavaScript origins**: `http://localhost:3000`
4. Add to **Authorised redirect URIs**: `http://localhost:3000/api/auth/callback/google`

---

## Deployment

This app is deployed on Vercel. To deploy your own:

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your Vercel URL
5. Add Vercel URL to Google Console OAuth settings
6. Set MongoDB Atlas Network Access to allow all IPs (`0.0.0.0/0`)

---

## Roadmap

- [ ] Email notifications for overdue invoices
- [ ] Stripe payment links on invoices
- [ ] Shareable client portal (no login required)
- [ ] Multi-currency support
- [ ] Revenue charts and analytics
- [ ] Invoice editing

---

## Author

**Abhishek Reddy** — Software Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abhishekrajreddy/)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat&logo=vercel&logoColor=white)](https://abhishekrreddy.netlify.app)
[![Live App](https://img.shields.io/badge/Paprwork-Live-10b981?style=flat)](https://paprwork.vercel.app)

---

<div align="center">
  <sub>Built with Next.js 14, MongoDB, and NextAuth.js · Deployed on Vercel</sub>
</div>
