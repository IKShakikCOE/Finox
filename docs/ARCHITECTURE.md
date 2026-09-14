# 🏛️ Finox — System Architecture

This document describes the architectural topology, layering principles, security boundaries, and cross-cutting concerns of the Finox platform.

---

## 1. High-Level System Architecture

```text
                                  ┌───────────────────────────┐
                                  │      Keycloak (IAM)       │
                                  │  Realm: finox | Port 8080 │
                                  └─────────────┬─────────────┘
                                                │
                     OIDC Password / Refresh    │  Validate JWT (JWKS)
                                                ▼
┌─────────────────────────┐          ┌─────────────────────────┐
│     Angular 21 SPA      │  /api    │   ASP.NET Core 9 API    │
│    (finox-app: 4200)    ├─────────►│  (Modular Monolith Host)│
└─────────────────────────┘  Bearer  └────────────┬────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
      ┌─────────────────────┐                                           ┌─────────────────────┐
      │  PostgreSQL RDBMS   │                                           │  Crawler Scheduler  │
      │  (Port 5432)        │                                           │  (Background Task)  │
      └─────────────────────┘                                           └─────────────────────┘
```

---

## 2. Backend: Modular Monolith ("SmartFM" Pattern)

The backend (`Finox/`) is organized as a **Modular Monolith** containing 11 feature modules and 4 shared foundation libraries.

### 2.1 Clean Architecture Layering per Module
Every feature module follows a strict 4-project Clean Architecture layout:

```text
Modules/<ModuleName>/
├── <ModuleName>.Domain/           # Entities, Value Objects, Domain Exceptions, Enums
├── <ModuleName>.Application/      # Use cases, Commands, Queries, Service Contracts
├── <ModuleName>.Infrastructure/   # DbContext, Repositories, Seeders, External Clients
└── <ModuleName>.API/              # Controllers, DTOs, Validation, Module Registration
```

### 2.2 Feature Modules in Solution
1. **`Tracker`**: Transactions, Accounts, Categories, Budgets, and Metadata.
2. **`Bank`**: Bank catalog, products (FDR/DPS/Loans), and institutional profiles.
3. **`Insurance`**: Insurance companies, policy categories, and profiles.
4. **`MutualFunds`**: Asset Management Companies (AMCs) and mutual funds.
5. **`News`**: Financial articles, education tips, books, and categorization.
6. **`Identity`**: Current user profile, settings, and Keycloak server-side proxy.
7. **`Investment`**: Ad platforms (Meta, Google, etc.) and campaign analytics.
8. **`Calendar`**: Financial events, payment reminders, and due dates.
9. **`Messaging`**: Internal user-to-user chat and contact presence.
10. **`Advisor`**: AI financial advisor chat history and context generation.
11. **`Dashboard`**: Read aggregation across financial data points.
12. **`Crawler`**: Web scraper sources, scheduling engine, and execution logs.

### 2.3 Shared Foundation Libraries (`Shared/`)
* **`Finox.Shared.Domain`**: Common abstractions (`Entity<T>`, `IOwnedEntity`, `ICurrentUser`, `IIdGenerator`, base exceptions).
* **`Finox.Shared.Application`**: Generic CRUD contracts (`ICrudService<T>`), pagination abstractions.
* **`Finox.Shared.Infrastructure`**: Auth extensions, JSON serializers, error handling middleware.
* **`Finox.Shared.API`**: Base controllers (`CrudControllerBase<T>`), Swagger OpenAPI setup.

---

## 3. Frontend Architecture (`finox-app`)

Built using **Angular 21** with strict typing and modern reactive patterns.

### 3.1 Key Architectural Highlights
* **State Management**: Standalone Angular **Signals** (`signal()`, `computed()`) replace heavy state libraries (NgRx) for fine-grained reactivity and minimal overhead.
* **Component Model**: 100% **Standalone Components** (`standalone: true`). No `NgModule` wrappers.
* **Design System**: PrimeNG Sakai theme integrated with Tailwind CSS utility classes and Lucide/PrimeIcons.
* **Routing**: Lazy-loaded feature routes with functional route guards (`authGuard`, `roleGuard(['admin'])`).

### 3.2 Directory Hierarchy
```text
src/app/
├── core/                  # Singleton services, Auth, Keycloak config, Interceptors, Guards
├── layout/                # Shell layout: Topbar, Sidebar menu, Footer, Theme configurator
├── features/              # Feature modules (Dashboard, Tracker, Income, Tools, Bank, etc.)
│   └── <feature-name>/
│       ├── pages/         # Screen / View components
│       ├── components/    # Reusable widget / sub-components
│       ├── services/      # Angular injectable services (API calls & Signals)
│       └── models/        # TypeScript interfaces and types
├── shared/                # Generic dynamic table, dynamic dialog, shared pipes, UI widgets
└── environments/          # Environment configuration (development & production)
```

---

## 4. Authentication, Security & IAM

* **Identity Provider**: Keycloak 24+ running on port `8080` (Realm: `finox`, Client: `finox-app`).
* **Authentication Flow**: Resource Owner Password Credentials (ROPC) / Authorization Code flow.
* **Token Distribution**:
  - Frontend receives JWT Access Token & Refresh Token.
  - Angular `authInterceptor` automatically attaches `Authorization: Bearer <token>` to all `/api/**` calls.
* **Backend Validation**:
  - ASP.NET Core `JwtBearer` middleware validates JWT tokens against the Keycloak realm's JWKS endpoint.
  - Roles extracted from `realm_access.roles` and `resource_access.finox-app.roles`.
* **Data Isolation (Tenant / User Boundary)**:
  - `ICurrentUser` service extracts `sub` (User ID) and `preferred_username` from ClaimsPrincipal.
  - EF Core Global Query Filter on `IOwnedEntity` restricts queries to `WHERE owner_id = @currentUserId`.

---

## 5. Database & Multi-Context Persistence

* **Database Engine**: PostgreSQL 16+.
* **Context Partitioning**: Each module manages its own dedicated `DbContext` (e.g., `TrackerDbContext`, `BankDbContext`, `CrawlerDbContext`).
* **Naming Convention**: All database tables and columns are strictly mapped to `snake_case` (e.g., `user_id`, `created_at`, `bank_products`).
