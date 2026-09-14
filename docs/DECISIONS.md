# ⚖️ Finox — Architectural Decision Records (ADR)

This file records significant architectural and design decisions made throughout Finox's development lifecycle, explaining the rationale, alternatives considered, and consequences.

---

## DEC-001: Modular Monolith Architecture
* **Status**: Accepted
* **Date**: 2026-05-15
* **Context**: Finox has multiple bounded contexts (Tracker, Catalog, Ads, Crawler, News). We needed to choose between Microservices, a traditional single-project Monolith, or a Modular Monolith.
* **Decision**: Adopt a **Modular Monolith ("SmartFM")** architecture with 4 Clean Architecture projects per module in a single solution.
* **Why**:
  1. Simplifies deployment and local development (single process, single database connection string).
  2. Enforces strict boundary isolation without the network latency, distributed transaction overhead, and DevOps complexity of microservices.
  3. If a module (e.g., `Crawler`) requires independent scaling in the future, it can be extracted into an independent microservice with near-zero code refactoring.
* **Consequences**: Modules must communicate in-process using interface contracts or mediator patterns; direct tight coupling between DbContexts must be strictly avoided.

---

## DEC-002: Keycloak for Identity & Access Management (IAM)
* **Status**: Accepted
* **Date**: 2026-05-20
* **Context**: We needed a secure, enterprise-grade authentication system supporting OAuth2/OIDC, JWT tokens, role-based access control (RBAC), and user profile management.
* **Decision**: Use standalone **Keycloak** (Realm: `finox`, Client: `finox-app`).
* **Why**:
  1. Offloads password hashing, brute-force protection, email verification, and session management.
  2. Standard JWT Bearer tokens can be validated natively by ASP.NET Core without calling an auth database on every request.
  3. Supports seamless future addition of Google/Apple OAuth or SMS OTP (bKash/Nagad login).
* **Consequences**: Developers must run Keycloak locally (via Docker) on port `8080`.

---

## DEC-003: Angular Signals for State Management
* **Status**: Accepted
* **Date**: 2026-06-01
* **Context**: The frontend needed a state management strategy for dynamic calculations (take-home salary, tax rebates, comparison lists, active filters).
* **Decision**: Use native **Angular Signals** (`signal()`, `computed()`) inside service singletons (`providedIn: 'root'`) instead of NgRx or Akita.
* **Why**:
  1. Greatly reduces boilerplate code (no actions, reducers, effects, or selectors).
  2. Provides fine-grained reactive updates with superior change detection performance in Angular 21.
  3. Simple mental model for developers.
* **Consequences**: Complex asynchronous flows must use `rxResource` or convert RxJS observables using `toSignal()`.

---

## DEC-004: Multi-DbContext Partitioning
* **Status**: Accepted
* **Date**: 2026-06-10
* **Context**: A unified monolithic `AppDbContext` creates massive merge conflicts in team environments and blurs module boundaries.
* **Decision**: Give every feature module its own dedicated `DbContext` inheriting from EF Core `DbContext` (e.g., `TrackerDbContext`, `BankDbContext`).
* **Why**:
  1. Clear separation of persistence concerns.
  2. Enables independent seeding and independent query optimizations.
* **Consequences**: Cross-context joins (`JOIN`) in LINQ are not possible; data aggregation across contexts must be performed at the application service layer.

---

## DEC-005: Global Query Filters for User Isolation (`IOwnedEntity`)
* **Status**: Accepted
* **Date**: 2026-06-15
* **Context**: Finox is a multi-user platform. Leaking one user's financial transactions to another user is a catastrophic security failure.
* **Decision**: Introduce `IOwnedEntity` interface and apply EF Core **Global Query Filters** in `OnModelCreating`.
* **Why**:
  1. Developers cannot accidentally forget `WHERE user_id = @id` in queries.
  2. The filter automatically extracts `CurrentOwnerId` from `ICurrentUser` per HTTP request.
* **Consequences**: Background workers that need to access all rows must explicitly call `.IgnoreQueryFilters()`.

---

## DEC-006: Server-Side Proxy for Privileged Keycloak Operations
* **Status**: Accepted (Required Fix)
* **Date**: 2026-09-14
* **Context**: The initial prototype in `finox-app` used client-side calls with hardcoded `admin/admin` credentials to create users and reset passwords via Keycloak's Admin API.
* **Decision**: All privileged operations (`register`, `change-password`, `forgot-password`) must be routed through the ASP.NET Core backend (`/api/auth/*`), which holds admin credentials securely.
* **Why**: Exposing Keycloak admin credentials in client-side JavaScript is a critical security vulnerability.
* **Consequences**: The Angular `auth.service.ts` must be updated to call backend endpoints instead of Keycloak master realm directly.

---

## DEC-007: Database Column Naming (snake_case Standard)
* **Status**: Accepted
* **Date**: 2026-07-02
* **Context**: PostgreSQL treats unquoted identifiers as lowercase. PascalCase table/column names in C# cause quoting issues (`"TotalAmount"`).
* **Decision**: All database tables and columns are strictly mapped to `snake_case` (e.g., `total_amount`, `owner_id`, `created_at`).
* **Why**: Conforms to standard PostgreSQL conventions and ensures seamless interoperability with Python/Go scrapers or BI tools.
