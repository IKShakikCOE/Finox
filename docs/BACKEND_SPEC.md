# Finox — Backend Specification

> Single source of truth for building the Finox backend API.
> Hand this document to any developer or AI agent to generate the server.
> Derived by analyzing the existing Angular 21 frontend (`finox-app`).

---

## 1. Overview

**Finox** is a personal finance "super-app" focused on the Bangladesh market (currency `BDT`/৳, local banks, AMCs, insurers). The Angular frontend is fully built and currently runs on static demo JSON files in `public/demo/`. This document describes the REST backend that must replace those demo files.

### Product modules (one feature folder each in the frontend)

| Module | Purpose | Data ownership |
|--------|---------|----------------|
| **Dashboard** | Aggregated financial overview (balances, allocations, cash flow, notifications) | Derived/aggregated, per-user |
| **Tracker** | Personal transactions, categories, accounts, budgets | Per-user (private) |
| **Bank** | Bank directory, products (savings/loan/FDR/DPS), profiles, compare | Global catalog (read-mostly) |
| **Insurance** | Insurance companies, products, profiles, compare | Global catalog (read-mostly) |
| **Mutual Funds** | AMCs, funds, profiles, compare | Global catalog (read-mostly) |
| **Investment** | Ad/investment platforms & campaigns analytics | Per-user |
| **News / Learn** | Financial articles, tips, learning content | Global catalog (read-mostly) |
| **AI Advisor** | Chat-based financial advisor | Per-user (currently mocked client-side) |
| **Calendar** | Financial events / reminders | Per-user |
| **Messages** | User-to-user chat | Per-user |
| **User** | Profile + app settings | Per-user |

### Key conventions observed in the frontend
- Currency is **BDT** throughout (locale `en-BD`, symbol `৳`).
- Dates are stored as `YYYY-MM-DD` strings; datetimes as ISO-8601 (`2026-05-01T10:00:00Z`).
- Enum-like fields are **UPPERCASE strings** (e.g., `INCOME`, `EXPENSE`, `SAVINGS`, `LOW`).
- IDs are **strings** (e.g., `TXN001`, `P001`, `DBBL`, `USR001`).
- Lists are returned as JSON; some endpoints return a wrapper object (e.g., `{ banks: [], products: [] }`).

---

## 2. Recommended Tech Stack

The frontend contains a Bengali comment indicating a **.NET API** is the intended backend (`dashboard.service.ts`: "….NET API রেডি হলে URL টি জাস্ট চেঞ্জ করে দিবেন…"). Recommended:

- **ASP.NET Core 8/9 Web API** (controllers or minimal APIs)
- **Entity Framework Core** + **PostgreSQL** (or SQL Server)
- **Keycloak** for authentication (already integrated in the frontend — see §4)
- **JWT Bearer** auth middleware validating Keycloak-issued tokens
- **Swagger/OpenAPI** for documentation
- Clean layering: `Controllers → Services → Repositories/DbContext → Entities`

> The stack can be swapped (Node/NestJS, Spring Boot, etc.) as long as the **HTTP contract in §6 is honored exactly**, because the Angular services call these paths directly.

---

## 3. Global API Conventions

### Base URL
- Development frontend expects the API at the **same origin** under `/api/...` (relative URLs like `/api/transactions` are used directly in the code). Configure a dev proxy or CORS accordingly.
- Production base URL should be configurable via Angular `environment.prod.ts`.

### Standard CRUD contract (from `shared/services/generic-api.service.ts`)
The frontend's generic API service defines the exact REST shape every collection resource must follow:

| Operation | Method | Path | Body | Returns |
|-----------|--------|------|------|---------|
| List all | `GET` | `/{resource}` | — | `T[]` |
| Create | `POST` | `/{resource}` | `T` | `T` (with generated `id`) |
| Update | `PUT` | `/{resource}/{id}` | `T` | `T` |
| Delete | `DELETE` | `/{resource}/{id}` | — | `204 No Content` |
| Bulk delete | `POST` | `/{resource}/bulk-delete` | `{ "ids": string[] }` | `200 OK` |

> Resources backed by the dynamic table (Tracker transactions/accounts/categories) **must** implement all six operations above.

### Response & error format
- Success: return the resource JSON directly (no envelope) to match the frontend's typed `http.get<T>()` calls.
- Errors: use standard HTTP status codes. Suggested error body:
```json
{ "error": "string code", "message": "human readable", "details": {} }
```
- Auth failures: `401 Unauthorized`. Authorization failures: `403 Forbidden`. Not found: `404`. Validation: `400` (or `422`).

### Pagination / search (optional, frontend-friendly)
The frontend currently filters/searches/paginates **client-side** after fetching full lists. The backend can return full lists for catalog endpoints. For per-user transactional data that may grow, support optional query params:
`?page=1&pageSize=25&search=&sort=field,asc`. If you add server pagination, also update the corresponding Angular service.

---

## 4. Authentication & Authorization (Keycloak)

Authentication is handled entirely by **Keycloak** today. The backend must **validate Keycloak access tokens** and scope per-user data by the token's subject.

### Keycloak configuration (from `core/auth/keycloak.config.ts` + `environments/`)
| Setting | Dev value | Prod value |
|---------|-----------|------------|
| Keycloak URL | `http://127.0.0.1:8080/` (proxied via `/keycloak`) | `https://auth.finox.app` |
| Realm | `finox` | `finox` |
| Client ID | `finox-app` | `finox-app` |
| Grant type | `password` (Direct Access Grants / ROPC) | same |

### Token flow used by the frontend (`core/auth/auth.service.ts`)
- **Login**: `POST {kc}/realms/finox/protocol/openid-connect/token` with `grant_type=password&client_id=finox-app&username&password` → `{ access_token, refresh_token, expires_in, ... }`.
- **Refresh**: same endpoint with `grant_type=refresh_token`.
- **User info**: `GET {kc}/realms/finox/protocol/openid-connect/userinfo` (Bearer).
- **Logout**: `POST {kc}/realms/finox/protocol/openid-connect/logout`.
- **Register / change password / forgot password**: via **Keycloak Admin REST API** (`/admin/realms/finox/users`) using an admin token.

> ⚠️ **Security note for the backend team:** The current frontend obtains an admin token using hardcoded `admin/admin` credentials against the `master` realm and the `admin-cli` client to register users and reset passwords directly from the browser. **This must be moved server-side.** The backend should expose safe endpoints (below) that perform these privileged Keycloak Admin operations using a confidential service account — never expose admin credentials to the client.

### Tokens the API receives
The Angular `authInterceptor` attaches `Authorization: Bearer <access_token>` to every request **except** paths containing `/assets/`, `/demo/`, `/keycloak/`, and the Keycloak OIDC endpoints. So all `/api/**` calls are authenticated.

### Backend responsibilities
1. Configure JWT Bearer validation against Keycloak realm `finox` (issuer + JWKS).
2. Resolve the current user from the token `sub` (and `preferred_username`, `email`).
3. Enforce that per-user resources only return/modify rows owned by `sub`.
4. (Recommended) Provide server-side wrappers for the privileged auth operations:
   - `POST /api/auth/register`
   - `POST /api/auth/forgot-password`
   - `POST /api/auth/change-password`

### `AuthUser` shape expected by the client (from userinfo)
```ts
AuthUser {
  id: string;        // Keycloak sub
  username: string;  // preferred_username
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;  // name
}
```

---

## 5. Data Models (Entities)

All field names/types below are taken verbatim from the frontend TypeScript models. Use these as the canonical schema. `?` = optional/nullable.

### 5.1 Tracker (per-user)
```ts
Transaction {
  id?: string;
  title?: string;
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  date?: string;                 // YYYY-MM-DD
  paymentMethod?: string;        // e.g., CASH | BANK | MOBILE_BANKING
  accountId?: string;
  remarks?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
}

Category {
  id?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  parentId?: string;
}

Account {
  id?: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'MOBILE_BANKING';
  balance: number;
  currency?: string;             // default 'BDT'
  icon?: string;
  color?: string;
}

Budget {
  id?: string;
  category: string;
  allocatedAmount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  alertThreshold?: number;       // percent, e.g. 80
}
```
**Tracker metadata** (currently `demo/tracker-meta.json`):
```ts
TrackerMeta {
  paymentMethods: string[];
  incomeCategories: string[];
  expenseCategories: string[];
  initialTransactions: Transaction[];   // seed data only
}
```

### 5.2 Bank (global catalog)
```ts
Bank { id: string; name: string; logo?: string; }

BankProduct {
  id: string;
  bankId: string;
  bankName: string;
  category: 'SAVINGS' | 'LOAN' | 'FDR' | 'DPS';
  name: string;
  interestRate: number;
  minDeposit: number | null;
  tenure: string | null;
  features: string[];
  eligibility: string;
}

BankProfile {
  id: string; name: string; type: string; established: number;
  authorizedCapital: string; paidUpCapital: string; totalAssets: string;
  branches: number; atmBooths: number; employees: number;
  chairman: string; md: string; headquarters: string;
  swiftCode: string; rating: string; ratingAgency: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  nplRatio: number; services: string[]; digitalServices: string[]; website: string;
}
```

### 5.3 Insurance (global catalog)
```ts
InsuranceCompany { id: string; name: string; }

InsuranceProduct {
  id: string; companyId: string; companyName: string;
  category: 'LIFE' | 'HEALTH' | 'VEHICLE' | 'PROPERTY' | 'CHILD' | 'PENSION';
  name: string; premiumRange: string; coverageAmount: string; tenure: string;
  maturityBenefit: string; features: string[]; eligibility: string;
}

InsuranceProfile {
  id: string; name: string; type: string; established: number;
  paidUpCapital: string; totalAssets: string; claimSettlementRatio: number;
  branches: number; employees: number; agents: number;
  chairman: string; md: string; headquarters: string;
  rating: string; ratingAgency: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  solvencyRatio: number; products: string[]; website: string;
}
```

### 5.4 Mutual Funds (global catalog)
```ts
AMC { id: string; name: string; }

MutualFund {
  id: string; amcId: string; amcName: string;
  category: 'GROWTH' | 'BALANCED' | 'FIXED_INCOME';
  name: string; nav: number;
  returnRate1Y: number; returnRate3Y: number; returnRate5Y: number;
  minInvestment: number; expenseRatio: number; fundSize: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  features: string[]; objective: string;
}

AMCProfile {
  id: string; name: string; established: number;
  paidUpCapital: string; aum: string; totalFunds: number;
  chairman: string; md: string; headquarters: string;
  rating: string; ratingAgency: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  parentOrg: string; fundTypes: string[]; investmentPhilosophy: string; website: string;
}
```

### 5.5 Investment / Campaigns (per-user)
```ts
Platform { id: string; name: string; icon?: string; color?: string; }

Campaign {
  id: string; platformId: string; platformName: string;
  name: string; type: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string; endDate: string;
  budget: number; spent: number;
  impressions: number; clicks: number; conversions: number; revenue: number;
  cpc: number; ctr: number; roas: number;
}
```

### 5.6 News / Learn (global catalog)
```ts
Article {
  id: string;
  category: 'News' | 'Tips' | 'Advice' | 'Books' | 'Learning';
  title: string; excerpt: string; author: string;
  date: string; readTime: string; tags: string[];
  image: string; featured: boolean;
}
// full article body field recommended for detail view: content/body (HTML or markdown)
```

### 5.7 Calendar (per-user)
```ts
CalendarEvent {
  id: string; title: string;
  date: string;                  // YYYY-MM-DD
  time?: string;                 // HH:mm
  type: 'PAYMENT' | 'MEETING' | 'REMINDER' | 'DEADLINE';
  description?: string; color?: string;
}
```

### 5.8 Messages (per-user)
```ts
ChatUser {
  id: string; name: string; avatar?: string;
  status: 'online' | 'offline' | 'away'; lastSeen?: string;
}

Message {  // (frontend ChatMessage)
  id: string; senderId: string; receiverId: string;
  content: string; timestamp: string /*ISO*/; read: boolean;
}

Conversation {  // derived/aggregated
  user: ChatUser; lastMessage: string; lastMessageTime: string; unreadCount: number;
}
```

### 5.9 AI Advisor (per-user)
```ts
AdvisorMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }
```

### 5.10 User profile & settings (per-user)
```ts
UserProfile {
  id: string; fullName: string; email: string; phone: string;
  avatar?: string; designation?: string; company?: string;
  address?: string; city?: string; country?: string;
  joinDate: string; currency: string; language: string; timezone: string;
}

UserSettings {
  notifications: { email: boolean; push: boolean; budgetAlerts: boolean; weeklyReport: boolean; };
  privacy: { showProfile: boolean; showActivity: boolean; };
  display: { currency: string; dateFormat: string; language: string; };
}
```

### 5.11 Dashboard (aggregated, per-user)
```ts
FinanceSummary {
  totalBalance: number; monthlyIncome: number; monthlyExpense: number;
  savingsRate: number; balanceChangePercent: number; expenseChangePercent: number;
}
AssetAllocation { assetClass: string; description: string; percentage: number; colorClass: string; textColorClass: string; }
CashFlowData   { quarter: string; income: number; expense: number; savings: number; }
DashboardTransaction { id: number; description: string; category: string; amount: number; type: 'income'|'expense'; date: string; }
DashboardNotification { id: number; type: string; title: string; message: string; timeGroup: 'TODAY'|'LAST WEEK'; icon: string; bgClass: string; iconClass: string; }

DashboardData {
  summary: FinanceSummary;
  allocations: AssetAllocation[];
  recentTransactions: DashboardTransaction[];
  notifications: DashboardNotification[];
  cashFlow: CashFlowData[];
}
```
> Note: dashboard fields like `colorClass`/`iconClass` are **presentation hints** the frontend currently reads from JSON. The backend may either store them or let the frontend derive them. Recommended: backend returns data + semantic type, frontend maps to CSS classes. (Flagging as a decision for the team.)

---

## 6. REST API Endpoints

Legend: 🔒 = requires Bearer token (all `/api/**` are authenticated); **(user-scoped)** = filter by token `sub`.

### 6.1 Auth (server-side wrappers around Keycloak) 🔒/public
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | public | Create Keycloak user (server holds admin creds). Body: `{ username, email, password, firstName, lastName }` |
| `POST` | `/api/auth/forgot-password` | public | Trigger Keycloak reset email. Body: `{ email }` |
| `POST` | `/api/auth/change-password` | 🔒 | Verify current + set new password. Body: `{ currentPassword, newPassword }` |
| `GET`  | `/api/auth/me` | 🔒 | Current user profile from token |

> Login / refresh / logout / userinfo continue to hit **Keycloak directly** from the frontend; the backend does not need to proxy them (but may, if you prefer to hide Keycloak).

### 6.2 Tracker (user-scoped) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tracker/meta` | `{ paymentMethods, incomeCategories, expenseCategories }` (replaces `tracker-meta.json`) |
| `GET` | `/api/transactions` | List user transactions |
| `POST` | `/api/transactions` | Create transaction |
| `PUT` | `/api/transactions/{id}` | Update |
| `DELETE` | `/api/transactions/{id}` | Delete |
| `POST` | `/api/transactions/bulk-delete` | Body `{ ids: [] }` |
| `GET/POST/PUT/DELETE` | `/api/categories` (+`/{id}`, `/bulk-delete`) | Category CRUD |
| `GET/POST/PUT/DELETE` | `/api/accounts` (+`/{id}`, `/bulk-delete`) | Account CRUD |
| `GET/POST/PUT/DELETE` | `/api/budgets` (+`/{id}`, `/bulk-delete`) | Budget CRUD |

> These three endpoints (`/api/transactions`, `/api/accounts`, `/api/categories`) are **already hardcoded** in the frontend's dynamic-table components — implement them with the exact CRUD contract from §3.

### 6.3 Bank (catalog, read-mostly) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/banks` | List banks `Bank[]` |
| `GET` | `/api/banks/products` | List `BankProduct[]` (supports `?category=&bankId=`) |
| `GET` | `/api/banks/{id}` | Bank profile (`BankProfile`) |
| `GET` | `/api/banks/profiles` | All `BankProfile[]` |

> Current frontend fetches the combined shape `{ banks, products }` from `bank-products.json`, and profiles from `institutions.json` (`{ banks, insuranceCompanies, amcs }`). You may either preserve those combined shapes (simplest, no frontend change) or split as above (cleaner). **Decision needed — see §8.**

### 6.4 Insurance (catalog) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/insurance/companies` | `InsuranceCompany[]` |
| `GET` | `/api/insurance/products` | `InsuranceProduct[]` (`?category=&companyId=`) |
| `GET` | `/api/insurance/profiles` | `InsuranceProfile[]` |

### 6.5 Mutual Funds (catalog) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/mutual-funds/amcs` | `AMC[]` |
| `GET` | `/api/mutual-funds` | `MutualFund[]` (`?category=&risk=&amcId=`) |
| `GET` | `/api/mutual-funds/profiles` | `AMCProfile[]` |

### 6.6 Investment / Campaigns (user-scoped) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/investment/platforms` | `Platform[]` |
| `GET` | `/api/investment/campaigns` | `Campaign[]` (`?status=&platformId=`) |
| `POST` | `/api/investment/campaigns` | Create |
| `PUT` | `/api/investment/campaigns/{id}` | Update |
| `DELETE` | `/api/investment/campaigns/{id}` | Delete |

### 6.7 News / Learn (catalog) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/news` | `{ categories: string[], articles: Article[] }` (`?category=&search=`) |
| `GET` | `/api/news/{id}` | Single article (include full `content`/body) |

### 6.8 Calendar (user-scoped) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/calendar/events` | `CalendarEvent[]` (`?from=&to=`) |
| `POST` | `/api/calendar/events` | Create |
| `DELETE` | `/api/calendar/events/{id}` | Delete |

### 6.9 Messages (user-scoped) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/messages/conversations` | `Conversation[]` for current user |
| `GET` | `/api/messages/contacts` | `ChatUser[]` |
| `GET` | `/api/messages?userId={id}` | Messages between current user and `{id}` |
| `POST` | `/api/messages` | Send. Body `{ receiverId, content }` |
| `POST` | `/api/messages/read` | Mark conversation read. Body `{ userId }` |

> Real-time delivery (WebSocket/SignalR) is recommended but optional; the frontend currently polls/uses local state. Flagging as future enhancement.

### 6.10 AI Advisor (user-scoped) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/advisor/chat` | Body `{ message }` → `{ id, role:'assistant', content, timestamp }` |
| `GET` | `/api/advisor/history` | Past `AdvisorMessage[]` |

> Currently the advisor logic is **mocked client-side** (`advisor.service.ts` generates canned, data-aware responses). Backend should compute advice from the user's real transactions/campaigns, optionally calling an LLM. The response `content` is **Markdown** (the UI renders it).

### 6.11 User profile & settings (user-scoped) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/user/profile` | `UserProfile` |
| `PUT` | `/api/user/profile` | Update (partial) |
| `GET` | `/api/user/settings` | `UserSettings` |
| `PUT` | `/api/user/settings` | Update |

### 6.12 Dashboard (aggregated, user-scoped) 🔒
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard` | `DashboardData` (summary + allocations + recentTransactions + notifications + cashFlow) |

> Replaces `demo/dashboard-finance.json`. The frontend service already says the URL should change to `/api/dashboard` when ready. Compute `summary`/`cashFlow`/`allocations` server-side from the user's transactions, accounts, and investments.

---

## 7. Demo-file → Endpoint mapping

The frontend currently loads these static files. Each maps to a backend endpoint. To migrate, update the URL in the corresponding Angular service (paths listed).

| Demo file (`public/demo/`) | Replaced by | Angular service to update |
|---------------------------|-------------|---------------------------|
| `tracker-meta.json` | `GET /api/tracker/meta` + `GET /api/transactions` | `features/tracker/services/tracker.service.ts` |
| `dashboard-finance.json` | `GET /api/dashboard` | `features/dashboard/services/dashboard.service.ts` (`jsonUrl`) |
| `bank-products.json` | `GET /api/banks` + `GET /api/banks/products` | `features/bank/services/bank.service.ts` |
| `institutions.json` | `GET /api/banks/profiles`, `/api/insurance/profiles`, `/api/mutual-funds/profiles` | `bank/insurance/mutual-fund services` |
| `insurance-products.json` | `GET /api/insurance/companies` + `/products` | `features/insurance/services/insurance.service.ts` |
| `mutual-funds.json` | `GET /api/mutual-funds/amcs` + `/api/mutual-funds` | `features/mutual-funds/services/mutual-fund.service.ts` |
| `investments.json` | `GET /api/investment/platforms` + `/campaigns` | `features/investment/services/investment.service.ts` |
| `financial-news.json` | `GET /api/news` | `features/news/services/news.service.ts` |
| *(hardcoded in service)* | `GET /api/calendar/events` | `features/calendar/services/calendar.service.ts` |
| *(hardcoded in service)* | `GET /api/messages/*` | `features/messages/services/message.service.ts` |
| *(hardcoded in service)* | `GET/PUT /api/user/*` | `features/user/services/user.service.ts` |

> Keep the `demo/*.json` files as **seed data** for the database — the data shapes in them are the canonical examples.

---

## 8. Open Decisions for the Backend Team

1. **Combined vs split catalog responses.** Keep `{ banks, products }` / `institutions.json` combined shapes (zero frontend change) **or** split into clean resource endpoints (requires editing the Angular services). Recommendation: split for a clean API, and update the ~6 service files.
2. **Presentation fields** (`colorClass`, `iconClass`, `textColorClass`, `logo` as `pi pi-*` icon names) currently live in data. Recommend the backend returns semantic values and the frontend maps to styles.
3. **Server-side pagination/search/sort** vs current client-side. Recommend server-side for `transactions`, `campaigns`, `messages` once data grows.
4. **AI Advisor**: rule-based (port existing logic) vs LLM-backed. Response must remain Markdown.
5. **Messaging real-time**: REST polling now; SignalR/WebSocket later.
6. **Move privileged Keycloak Admin calls server-side** (critical security fix — see §4).

---

## 9. Sample Payloads (from existing demo data)

**`GET /api/transactions` → `200`**
```json
[
  { "id": "TXN001", "title": "Techspire Solutions Salary", "amount": 180000, "type": "INCOME",  "category": "Salary",          "date": "2026-05-01", "paymentMethod": "BANK",            "remarks": "Monthly Salary Transfer" },
  { "id": "TXN004", "title": "DPDC Electricity Bill",      "amount": 3200,   "type": "EXPENSE", "category": "Utilities",       "date": "2026-05-10", "paymentMethod": "MOBILE_BANKING" }
]
```

**`GET /api/tracker/meta` → `200`**
```json
{
  "paymentMethods": ["CASH", "BANK", "MOBILE_BANKING"],
  "incomeCategories": ["Salary", "Freelance / Project", "Investments Profit", "Dividends", "Other Income"],
  "expenseCategories": ["Food & Grocery", "Utilities", "Investment (SIP)", "Shopping", "Rent", "Medical", "Fuel & Transport"]
}
```

**`GET /api/banks/products` → `200`**
```json
[
  {
    "id": "P002", "bankId": "DBBL", "bankName": "Dutch-Bangla Bank",
    "category": "FDR", "name": "Fixed Deposit (1 Year)",
    "interestRate": 7.50, "minDeposit": 50000, "tenure": "1 Year",
    "features": ["Auto-renewal option", "Loan against FDR up to 90%"],
    "eligibility": "Any individual or institution"
  }
]
```

**`GET /api/dashboard` → `200`**
```json
{
  "summary": { "totalBalance": 1250000, "monthlyIncome": 180000, "monthlyExpense": 65000, "savingsRate": 64, "balanceChangePercent": 12.5, "expenseChangePercent": 8.2 },
  "allocations": [ { "assetClass": "Bank Accounts", "description": "Liquid Cash / Emergency Fund", "percentage": 45, "colorClass": "bg-blue-500", "textColorClass": "text-blue-500" } ],
  "recentTransactions": [ { "id": 1, "description": "Techspire Solutions Salary", "category": "Salary", "amount": 180000, "type": "income", "date": "2026-05-01T10:00:00Z" } ],
  "notifications": [ { "id": 1, "type": "system", "title": "Automated SIP", "message": "successfully processed for ৳20,000.00", "timeGroup": "TODAY", "icon": "pi pi-dollar", "bgClass": "bg-blue-100", "iconClass": "text-blue-500" } ],
  "cashFlow": [ { "quarter": "Q1", "income": 540000, "expense": 195000, "savings": 345000 } ]
}
```

**`POST /api/transactions` request**
```json
{ "title": "Office Lunch", "amount": 850, "type": "EXPENSE", "category": "Food & Grocery", "date": "2026-05-30", "paymentMethod": "CASH", "remarks": "Team lunch" }
```
**→ `201` response** (server generates `id`)
```json
{ "id": "TXN1234", "title": "Office Lunch", "amount": 850, "type": "EXPENSE", "category": "Food & Grocery", "date": "2026-05-30", "paymentMethod": "CASH", "remarks": "Team lunch" }
```

---

## 10. Suggested Database Tables

Per-user tables carry a `user_id` (Keycloak `sub`) FK and should be filtered on every query.

| Table | Scope | Notes |
|-------|-------|-------|
| `transactions` | user | `user_id`, indexed on `(user_id, date)` |
| `categories` | user | seedable defaults per user |
| `accounts` | user | |
| `budgets` | user | |
| `campaigns` | user | + `platforms` (global or user) |
| `calendar_events` | user | |
| `messages` | user | `sender_id`, `receiver_id`, `read` |
| `user_profiles` | user | 1:1 with Keycloak user |
| `user_settings` | user | store JSON columns for the nested groups |
| `advisor_messages` | user | chat history |
| `banks`, `bank_products`, `bank_profiles` | global | catalog |
| `insurance_companies`, `insurance_products`, `insurance_profiles` | global | catalog |
| `amcs`, `mutual_funds`, `amc_profiles` | global | catalog |
| `articles` | global | + `content` body column |

For `string[]` fields (e.g., `features`, `tags`, `services`) use a JSON/array column or a child table.

---

## 11. Quick Start for the Backend Dev / AI Agent

1. Read this whole spec. The **HTTP contract (§3, §6) and data models (§5) are binding** — the Angular app calls these exact shapes.
2. Stand up Keycloak realm `finox`, client `finox-app` (Direct Access Grants enabled), validate tokens in the API (§4).
3. Scaffold entities from §5 and §10; seed the DB from `public/demo/*.json`.
4. Implement endpoints in §6, honoring the generic CRUD contract.
5. Resolve the open decisions in §8 with the team (especially the §4 security fix).
6. Swap the URLs in the Angular services per §7 to point at the live API.
7. Provide Swagger/OpenAPI; verify against the sample payloads in §9.
