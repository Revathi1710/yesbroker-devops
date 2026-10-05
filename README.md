# Yes Broker — Project README

> A hyperlocal broker directory and property listing platform for Chennai.
> Built for brokers who want a professional web presence, and buyers who want trusted local agents.

---

## 0. Before You Read This Document — A Note for the Developer

Hi. Before we get into features and tech, here's the story behind this project. It will help you build it right.

### The Problem

When someone in Chennai wants to buy or rent a flat, they call random brokers from JustDial or ask relatives. There is no good place to find a broker who *specifically knows* a locality — someone with a real track record in, say, Velachery or Medavakkam. Good brokers exist everywhere. But they have no professional web presence. No credibility page. Nothing to show a client.

### How This Started

A broker — someone the project owner knows personally — asked a simple question:
*"Can you build me a website where I can show my services, my listings, my experience?"*

That one request became this platform.

Instead of building one website for one broker, we are building a platform where *any* Chennai broker can have their own profile page. Think IndiaMART — but exclusively for real estate brokers in Chennai.

### How It Works (Plain English)

- Brokers pay an annual subscription and get a professional profile page on the platform
- Their page shows their services, locality expertise, experience, success stories, and current property listings
- Buyers visit the platform, search by locality, find the right broker, and contact them directly
- The platform stays completely out of the transaction
- No commissions. No lead selling. No complexity.

### What This Is NOT

This is not 99acres. This is not a classifieds portal. We are not routing inquiries, tracking deals, verifying documents, or building anything complicated. Version 1 is three things: broker pages, property listings tied to those pages, and a buyer-facing search. That's it.

### Your Role

The product decisions, feature scope, and business logic have all been defined by the project owner. It's all in this document. Your job is to build faithfully against it. Use Claude Code as your development copilot for implementation. When you are unsure about a feature decision, ask the project owner — don't assume.

This is a slow, careful build. We want it built right, not built fast. The first version needs to work cleanly and look professional. That is the only brief.

---

## 1. Project Overview

**Yes Broker** is a Chennai-focused real estate broker directory platform.

It is NOT a classifieds portal. It is NOT trying to replace brokers.
It is a professional home for good brokers — where they can showcase their services,
their locality expertise, their listings, and their track record.

Buyers come to find the right broker for their area. Brokers pay a subscription to be listed.
The platform owner markets to buyers. Transactions happen offline between broker and buyer.
The platform stays out of it completely.

**One-line description:**
*IndiaMART-style directory, built exclusively for Chennai real estate brokers.*

---

## 2. The Problem Being Solved

- Good brokers in Chennai have no professional web presence
- Buyers struggle to find locality-specific, trustworthy brokers
- Large portals (99acres, MagicBricks) are noisy and national — not hyperlocal
- NoBroker tried to eliminate brokers — the market proved that doesn't work

**This platform empowers brokers instead of replacing them.**

---

## 3. Who Uses This Platform

| User Type | What They Do | Pays? |
|---|---|---|
| Broker | Creates profile, lists properties, showcases services | Yes — annual subscription |
| Buyer / Renter | Searches brokers by locality, browses listings, contacts broker | No — free |
| Admin (Site Owner) | Manages brokers, approves listings, controls content | N/A |

---

## 4. Core Features — Version 1

### 4.1 Broker Profile Page
Each broker gets a dedicated public profile page containing:
- Name, photo, contact details
- About / introduction
- Locality / area specialisation (can be multiple localities)
- Services offered (buy, sell, rent, commercial, residential, plots, etc.)
- Success stories / testimonials
- Active property listings (buy / sell / rent)
- Years of experience, languages spoken

### 4.2 Property Listings
- Each listing is tied to a broker profile
- Listing fields: property type, locality, size, price/rent, brief description, photos
- Listing status: Active / Sold / Rented (broker can update)
- Buyers contact the broker directly — no inquiry form routing through platform

### 4.3 Buyer-Facing Search & Discovery
- Search brokers by locality
- Filter by service type (buy / sell / rent / commercial)
- Browse all active listings across brokers
- Filter listings by locality, type, price range

### 4.4 Admin Panel
- Add / approve / suspend broker accounts
- View and manage all listings
- Manage subscription status per broker
- Basic site content management (homepage text, banners)

### 4.5 Broker Onboarding — Two Modes
- **Self-serve:** Broker fills registration form → pays → pending → admin approves → goes live
- **Admin-initiated:** Admin creates account manually → shares credentials → broker completes profile
- Both modes result in identical broker accounts and dashboards

### 4.6 Subscription & Payment
- Annual subscription fee: **₹0 (free for pilot phase)**
- Payment gateway: Razorpay (integrated but not charged in V1 — ready for when pricing is introduced)
- Admin can manually activate / extend / suspend accounts

---

## 5. What This Platform Does NOT Do — Version 1

> This section is as important as the features list. Do not build anything listed here.

- ❌ No buyer registration or buyer accounts
- ❌ No inquiry routing or lead management system
- ❌ No transaction tracking or commission logic
- ❌ No seller-side public listings (only broker-managed listings)
- ❌ No verified mandate or auction features
- ❌ No pan-India or multi-city architecture
- ❌ No AI, recommendations, or smart matching

*These are Version 2 decisions. Keep Version 1 clean and simple.*

---

## 6. Business Model

| Revenue Stream | Who Pays | Model |
|---|---|---|
| Broker profile subscription | Broker | Annual flat fee (₹0 in pilot) |
| Featured listing (optional) | Broker | Per listing upsell (V2) |
| Homepage / search visibility boost | Broker | Optional add-on (V2) |

**No commission. No transaction involvement. Clean subscription business.**

---

## 7. Chennai Localities — Master List

These are the pre-defined localities available in the system at launch.
Organised by zone for easier dropdown management.

**South Chennai**
Velachery, Medavakkam, Pallikaranai, Perumbakkam, Sholinganallur, Thoraipakkam,
Perungudi, Nanganallur, Madipakkam, Chromepet, Pallavaram, Tambaram,
Guduvanchery, Urapakkam, Keelkattalai, Selaiyur, Madambakkam

**Central Chennai**
T. Nagar, Nungambakkam, Chetpet, Adyar, Mylapore, Alwarpet, Teynampet,
Kilpauk, Kodambakkam, Saidapet, Guindy, Vadapalani, Ashok Nagar

**West Chennai**
Porur, Valasaravakkam, Ambattur, Mogappair, Poonamallee, Avadi,
Korattur, Thirumangalam, Ramapuram, Manapakkam, Virugambakkam

**North Chennai**
Madhavaram, Perambur, Kolathur, Villivakkam, Tondiarpet, Manali,
Korukkupet, Tiruvottiyur, Ayanavaram

**East Chennai / OMR / ECR**
OMR (Old Mahabalipuram Road), ECR (East Coast Road), Thiruvanmiyur,
Kottivakkam, Neelankarai, Injambakkam, Kovalam, Siruseri

> This list can be expanded by the admin at any time. It is seeded into the database on first setup.

---

## 8. Build Philosophy

- **Hyperlocal first** — Chennai only to start
- **Slow cooking** — grow with trust, not with a paid traffic blitz
- **Low operational cost** — no verification team, no legal layer in V1
- **Broker-first UX** — the broker profile page must look genuinely professional
- **Mobile first** — many brokers and buyers will access on phone
- **Pilot with one broker** — the first broker (known contact) is the proof of concept

---

## 9. Tech Architecture

### 9.1 Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Frontend | React (Vite) |
| Database | MongoDB (via Mongoose) |
| Image Storage | Local VPS storage (Phase 1) → Cloudinary (Phase 2) |
| Payment | Razorpay (integrated, not charged in Phase 1) |
| Hosting | Phase 2 — Fresh VPS, Ubuntu 22.04 LTS |
| Process Manager | Phase 2 — PM2 |
| Reverse Proxy | Phase 2 — Nginx |
| SSL | Phase 2 — Let's Encrypt (Certbot) |
| Version Control | Git + GitHub (developer manages repo) |

### 9.2 Project Structure

```
yes-broker/
├── backend/
│   ├── models/           # Mongoose models — Broker, Listing, Admin, Locality
│   ├── routes/           # Express route files
│   ├── controllers/      # Business logic
│   ├── middleware/        # Auth (JWT), error handling, file upload
│   ├── config/           # DB connection, env config
│   ├── seeds/            # Locality seed data
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/        # Home, BrokerProfile, Search, Dashboard, AdminPanel
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context
│   │   └── App.jsx       # Router setup
│   └── vite.config.js
└── README.md
```

### 9.3 Core Data Models

**Broker**
```
name, slug, photo, phone, email, whatsapp,
passwordHash, about, localities[], services[],
experience (years), languages[], successStories[],
subscription { status, startDate, endDate, paymentRef },
createdBy: 'self' | 'admin',
status: active | pending | suspended,
createdAt
```

**Listing**
```
brokerId (ref: Broker), listingType: buy|sell|rent,
propertyType: apartment|house|plot|commercial|villa,
locality, size, price, description, photos[],
status: active|sold|rented,
createdAt, updatedAt
```

**Locality**
```
name, zone: south|central|west|north|east,
active: true|false
```

**Admin**
```
username, passwordHash, role: superadmin
```

### 9.4 Key API Endpoints

**Public (No Auth)**
| Method | Route | Description |
|---|---|---|
| GET | /api/brokers | All active brokers (filter by locality, service) |
| GET | /api/brokers/:slug | Single broker profile + their listings |
| GET | /api/listings | All active listings (filter by locality, type, price) |
| GET | /api/localities | All localities (for dropdowns) |

**Broker Auth**
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/broker/register | Self-serve registration |
| POST | /api/auth/broker/login | Login → returns JWT |

**Broker Dashboard (JWT required)**
| Method | Route | Description |
|---|---|---|
| GET | /api/broker/me | Get own profile |
| PUT | /api/broker/me | Update own profile |
| POST | /api/broker/listings | Add listing |
| PUT | /api/broker/listings/:id | Edit listing |
| DELETE | /api/broker/listings/:id | Delete listing |

**Admin (Admin JWT required)**
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/admin/login | Admin login |
| GET | /api/admin/brokers | All brokers |
| POST | /api/admin/brokers | Create broker manually |
| PUT | /api/admin/brokers/:id | Edit / approve / suspend broker |
| GET | /api/admin/listings | All listings |

### 9.5 Authentication
- Brokers: JWT-based login for dashboard access
- Admin: Separate JWT login with admin role
- Buyers: No login required — fully public access

---

## 10. Developer Notes

### How to Use This Document
- Sections 0–3: Background and context — read once
- Section 4: Your build scope — feature checklist
- Section 5: Your guardrail — do not build without owner approval
- Section 7: Seed this localities list into MongoDB on first setup
- Section 9: Tech reference — follow stack and structure exactly
- Section 12: Open questions — flag if any block your work

### Build Sequence
| Step | Task |
|---|---|
| 1 | Git repo setup, project folder structure created |
| 2 | Backend: MongoDB connection, all models created |
| 3 | Backend: Locality seed script — populate all localities |
| 4 | Backend: Public API routes (brokers, listings, localities) |
| 5 | Frontend: Buyer pages (Home, Broker Profile, Search/Browse) |
| 6 | Backend: Broker auth (register, login, JWT middleware) |
| 7 | Frontend: Broker dashboard (profile edit, listing management) |
| 8 | Backend + Frontend: Admin panel |
| 9 | Razorpay: Integrate but set amount to ₹0 for pilot |
| 10 | End-to-end testing — self-serve + admin-initiated flows |
| 11 | Mobile responsiveness check on all pages |
| 12 | Pilot broker profile — created, reviewed, signed off by owner |

### General Guidelines
- Do not add features outside Section 4 without owner sign-off
- Mobile responsiveness is mandatory throughout
- Image storage is local in Phase 1 — code it so Cloudinary can be swapped in during Phase 2 with minimal changes
- Razorpay is integrated but not charged in Phase 1 — keep it ready for when pricing is switched on
- Commit to GitHub regularly with clear commit messages
- Keep .env out of version control — maintain a .env.example with all keys

---

## 11. Project Phases

### Phase 1 — Local Development (Current)
- Full build on local machine
- All features working end-to-end
- Pilot broker profile live and reviewed

### Phase 2 — Deployment (Later)
- Fresh VPS provisioned (Ubuntu 22.04)
- Nginx + PM2 + SSL setup
- MongoDB on server or MongoDB Atlas
- Cloudinary for image storage
- Domain pointed and site goes live

---

## 12. Open Questions

> All major decisions are resolved. Only minor items remain.

1. What will the domain name be?
2. Any Chennai localities missing from the list in Section 7 that should be added?

---

*Document version: 3.0 — All decisions locked. Ready for handover.*
*Last updated: April 2026*
*Owner: Jp*