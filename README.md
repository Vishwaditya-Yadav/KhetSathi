# 🌾 KhetSathi — Modern Farm Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-Fullstack-ff4154?logo=react-query)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_RLS-3ecf8e?logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-729b1b?logo=vitest)](https://vitest.dev/)

> **KhetSathi** is an all-in-one digital field notebook and agricultural management system designed to empower farmers and agricultural managers. Manage land holdings, monitor crop lifecycles, track farm inputs and inventory, book machinery and services, and consult crop advisory guides in one clean, responsive dashboard.

---

## 🚀 Key Features

- **🏡 Farm & Plot Management**  
  Keep track of multiple farms, geographic locations, and plot sizes in acres.

- **🌱 Crop Lifecycle Tracking**  
  Log crops across different fields, track current stages (sowing, vegetative, flowering, maturity, harvesting), monitor sowing dates, and record treatments/interventions.

- **📦 Farm Inputs & Inventory**  
  Manage your agricultural stock — catalog seeds, fertilizers, and pesticides with unit quantities, measurement units, and price tracking.

- **🚜 Machinery & Service Bookings**  
  Schedule and track equipment rentals and farming services (tractors, harvesters, threshers, labor) with booking dates, status tracking, and notes.

- **📖 Crop Advisory Catalog**  
  Built-in crop guide with duration periods, seasonal classifications (Rabi, Kharif, Annual), and pest vulnerability alerts for crops like Wheat, Rice, Maize, Cotton, Mustard, Sugarcane, and more.

- **🔐 Secure Authentication & Multi-Role Support**  
  Powered by Supabase Auth with Row Level Security (RLS). Supports farmer accounts and administrative roles with farmer verification workflows.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) + [Vite](https://vitejs.dev/)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based routing)
- **State & Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query v5)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with OKLCH color design system
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with RLS policies)
- **Database Migrations**: [Drizzle ORM](https://orm.drizzle.team/)
- **Testing**: [Vitest](https://vitest.dev/) + React Testing Library

---

## 📁 Project Structure

```text
khetsathi/
├── drizzle/                      # Database schema and SQL migrations
│   └── migrations/
│       └── 0000_migration.sql   # Initial schema, tables, RLS policies & seed data
├── public/                       # Static assets (favicons, robots.txt)
├── src/
│   ├── components/               # Reusable UI primitives & design system components
│   │   └── ui/                   # Radix UI + Tailwind component library
│   ├── hooks/                    # Custom React hooks (useMobile, etc.)
│   ├── integrations/
│   │   └── supabase/             # Supabase client, auth middleware, and typed schema
│   ├── lib/                      # Utility functions and helper modules
│   ├── routes/                   # File-based routes (TanStack Router)
│   │   ├── __root.tsx            # Root application shell & global layout
│   │   ├── index.tsx             # Landing / welcome page
│   │   ├── auth.tsx              # Farmer registration and sign-in
│   │   └── _authenticated/
│   │       ├── route.tsx         # Protected route layout & auth guard
│   │       └── dashboard.tsx     # Main dashboard (Farms, Crops, Inputs, Bookings)
│   ├── router.tsx                # TanStack Router configuration
│   ├── server.ts                 # Server entry for SSR
│   ├── start.ts                  # TanStack Start bootstrap
│   └── styles.css                # Tailwind CSS v4 theme and styles
├── .env.example                  # Template for required environment variables
├── components.json               # shadcn / Radix component configuration
├── drizzle.config.ts             # Drizzle configuration
├── package.json                  # Dependencies, scripts, and project metadata
├── tsconfig.json                 # TypeScript compiler options
└── vite.config.ts                # Vite & TanStack build configuration
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** >= 20.x (v22 recommended)
- **npm** >= 10.x (or `pnpm` / `bun`)

### 1. Clone the Repository

```bash
git clone https://github.com/Vishwaditya-Yadav/KhetSathi.git
cd KhetSathi
```

### 2. Configure Environment Variables

Copy the sample environment file and add your Supabase credentials:

```bash
cp .env.example .env
```

Fill in the details in `.env`:

```env
SUPABASE_PROJECT_ID="your_supabase_project_id"
SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_anon_key"
SUPABASE_URL="https://your_supabase_project_id.supabase.co"

VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_anon_key"
VITE_SUPABASE_URL="https://your_supabase_project_id.supabase.co"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

Run the SQL migration in `drizzle/migrations/0000_migration.sql` in your Supabase SQL Editor to set up:
- Profiles & user roles (`admin` / `user`)
- Farm, crop, product, and booking tables
- Row Level Security (RLS) policies for user data isolation
- Initial crop catalog seed data (Wheat, Rice, Maize, etc.)

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal) to view the application.

---

## 🧪 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement |
| `npm run build` | Builds the application for production |
| `npm run preview` | Previews the production build locally |
| `npm test` | Runs unit and route tests using Vitest |
| `npm run lint` | Checks code formatting and syntax with ESLint |
| `npm run format` | Auto-formats code with Prettier |

---

## 🔒 Security & Data Isolation

- All farmer data (`farms`, `crops`, `products`, `bookings`) is protected by PostgreSQL **Row Level Security (RLS)**.
- Authenticated users can only read, write, update, and delete their own farm records.
- Admins possess verified review access via the `has_role(uid, 'admin')` security function.
- Sensitive environment files (`.env`) are excluded from version control via `.gitignore`.

---

## 👤 Author

**Vishwaditya Yadav**
- GitHub: [@Vishwaditya-Yadav](https://github.com/Vishwaditya-Yadav)
- Email: [vishwadityayadav.cs@gmail.com](mailto:vishwadityayadav.cs@gmail.com)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
