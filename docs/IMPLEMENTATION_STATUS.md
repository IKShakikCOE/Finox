# 📊 Finox — Implementation Status & Roadmap

This document tracks the technical completion status of every feature across the Frontend (`finox-app`) and Backend (`Finox`).

---

## 1. Feature Status Matrix

| Module | Sub-Feature | Frontend UI | Backend API | Database Persistence | Current State |
|---|---|---|---|---|---|
| **Auth** | Login / Refresh / Logout | ✅ | ✅ | Keycloak | **Production Ready** |
| **Auth** | User Registration | ✅ | ✅ | Keycloak | ⚠️ Migrate UI to use `/api/auth/register` |
| **Auth** | Password Reset / Forgot | ✅ | ✅ | Keycloak | ⚠️ Migrate UI to use `/api/auth/*` |
| **Dashboard** | 11 Overview Widgets | ✅ | ✅ | PostgreSQL | ⚠️ Refactor `DashboardController` coupling |
| **Tracker** | Transactions (CRUD) | ✅ | ✅ | `transactions` | **Live** |
| **Tracker** | Categories (Hierarchical) | ✅ | ✅ | `categories` | **Live** |
| **Tracker** | Accounts (Multi-Bank/MFS) | ✅ | ✅ | `accounts` | **Live** |
| **Tracker** | Budgeting & Rollover | ✅ | ✅ | `budgets` | **Live** |
| **Tracker** | Analytics & Reports | ✅ | ✅ | Aggregated | **Live** |
| **Tracker** | Recurring Transactions | ✅ | ⚠️ Partial | Client rules | Needs background scheduler |
| **Tracker** | Subscriptions Tracker | ✅ (1047 lines) | ❌ Missing | ❌ Missing | **Mocked in UI** (`subscription.service.ts`) |
| **Tracker** | Goals Management | ✅ (1017 lines) | ❌ Missing | ❌ Missing | **Mocked in UI** (`goals.service.ts`) |
| **Notes & Debts**| Money Lent / Borrowed | ✅ (511 lines) | ❌ Missing | ❌ Missing | **Mocked in UI** (`debt-notes.service.ts`) |
| **Income Hub** | Multi-Source Earnings | ✅ (1077 lines) | ❌ Missing | ❌ Missing | **Mocked in UI** (`income.service.ts`) |
| **Tools** | NBR Tax & Rebate Engine | ✅ | N/A | Stateless | **Client-side Active** |
| **Tools** | Salary Planner | ✅ | N/A | Stateless | **Client-side Active** |
| **Portfolio** | Sanchayapatra Holdings | ✅ | ❌ Missing | ❌ Missing | **Mocked in UI** (`portfolio.service.ts`) |
| **Portfolio** | DPS & FDR Lifecycle | ✅ | ❌ Missing | ❌ Missing | **Mocked in UI** (`portfolio.service.ts`) |
| **Portfolio** | Provident Fund (GPF) | ✅ | ❌ Missing | ❌ Missing | **Mocked in UI** (`portfolio.service.ts`) |
| **Bank** | Directory & Profiles | ✅ | ✅ | `banks`, `profiles`| **Live** |
| **Bank** | Products & Comparison | ✅ | ✅ | `bank_products`| **Live** |
| **Insurance** | Companies & Profiles | ✅ | ✅ | `companies` | **Live** |
| **Insurance** | Products & Comparison | ✅ | ✅ | `products` | **Live** |
| **Mutual Funds**| AMCs & Fund List | ✅ | ✅ | `amcs`, `funds` | **Live** |
| **Mutual Funds**| SIP Growth Simulator | ✅ | N/A | Stateless | **Client-side Active** |
| **Investment** | Ad Campaigns & ROAS | ✅ | ✅ | `campaigns` | **Live** |
| **News** | Articles & Education | ✅ | ✅ | `articles` | **Live** |
| **Calendar** | Financial Events & Reminders| ✅ | ✅ | `calendar_events`| **Live** |
| **Messages** | User-to-User Chat | ✅ | ✅ | `messages` | **Live** (Polling mode) |
| **Crawler** | Source Approval & Scraper | ✅ | ✅ | `crawler_sources`| **Live** |
| **Admin** | Catalog Management CRUD | ✅ | ✅ | PostgreSQL | **Live** |

---

## 2. Immediate Technical Priorities

### Priority 1: Security Fix in Frontend Auth
* Update `finox-app/src/app/core/auth/auth.service.ts` to call backend `/api/auth/register`, `/api/auth/change-password`, and `/api/auth/forgot-password`. Remove hardcoded `admin/admin` credentials.

### Priority 2: Backend Persistence for Mocked Features
1. Scaffold Entities & Repositories in Backend for:
   - `Goal` + `GoalTransaction`
   - `Subscription` + `SubscriptionHistory`
   - `IncomeEntry` + `JobHistory`
   - `DebtRecord` + `FinancialNote`
   - `SanchayapatraHolding` + `DpsFdrHolding`
2. Update Angular services from `of([...])` to `http.get<T[]>('/api/...')`.

### Priority 3: Refactor Mega-Components
* Decompose `income-overview.component.ts`, `subscription-tracker.component.ts`, and `goals-tracker.component.ts` into smaller presentational components.

### Priority 4: Standardize EF Core Migrations
* Remove runtime `GenerateCreateScript()` and dangerous `DROP TABLE` statements from `Program.cs`. Replace with official EF Core migrations.
