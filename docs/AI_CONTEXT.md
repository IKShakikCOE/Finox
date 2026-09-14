# 🤖 Finox — Master AI Context Primer

> **Instructions for AI Assistant**: Read this document first before generating, refactoring, or reviewing any code for Finox. This is the single source of truth for all coding patterns and domain conventions.

---

## 1. Project Summary
* **Project Name**: Finox
* **Description**: Personal finance, wealth management, and institutional intelligence super-app purpose-built for the **Bangladesh** economic market.
* **Default Currency**: Bangladeshi Taka (`BDT` / ৳), formatted with comma separators (e.g., `৳ 1,50,000`).

---

## 2. Tech Stack & Architecture

### Backend (`Finox/`)
* **Runtime**: .NET 9 / ASP.NET Core 9 Web API.
* **Architecture**: Modular Monolith with 4 Clean Architecture layers per module:
  - `Domain`: Pure entities, interfaces, value objects. No external dependencies.
  - `Application`: Use cases, interfaces, DTOs, business rules.
  - `Infrastructure`: EF Core `DbContext`, repositories, external clients, database seeders.
  - `API`: Controllers, request/response models, module DI registration (`Add<Module>Module`).
* **Database**: PostgreSQL with Entity Framework Core. All table and column names **must be `snake_case`**.
* **Auth**: Keycloak JWT Bearer authentication (Realm: `finox`, Client: `finox-app`).

### Frontend (`finox-app/`)
* **Framework**: Angular 21 (100% Standalone Components, Reactive Signals).
* **UI Libraries**: PrimeNG (Sakai Theme) + Tailwind CSS + PrimeIcons.
* **State Management**: Angular Signals (`signal()`, `computed()`) inside `@Injectable({ providedIn: 'root' })` services. No NgRx.
* **API Communication**: Relative paths (`/api/...`) routed via dev proxy `proxy.conf.json`.

---

## 3. Strict Coding & Architectural Rules

### Rule 1: Financial Numbers & Precision
* In **C#**, monetary amounts MUST always use `decimal`. NEVER use `float` or `double`.
* In **TypeScript / Angular**, use `number` with standard currency pipes (`currency:'BDT':'symbol':'1.0-0'`). Never perform floating point division without rounding.

### Rule 2: Multi-Tenant / User Data Isolation
* Any user-scoped entity in C# MUST implement `IOwnedEntity` (`OwnerId: string`).
* Never remove or bypass the EF Core Global Query Filter unless writing a background worker or crawler.

### Rule 3: Thin Controllers
* API Controllers must NEVER contain business calculations, raw LINQ aggregations, or direct dependencies on other modules' `DbContext`.
* Place aggregation and business logic in the `Application` layer.

### Rule 4: Security (No Client-Side Keycloak Admin)
* Never expose Keycloak admin credentials (`admin/admin` or `admin-cli`) in the Angular code.
* Use backend wrappers: `POST /api/auth/register`, `POST /api/auth/change-password`, `POST /api/auth/forgot-password`.

---

## 4. Current Implementation Matrix

| Area | Frontend UI | Backend API & DB | Notes |
|---|---|---|---|
| **Transactions Ledger** | ✅ Complete | ✅ Complete | Live in PostgreSQL (`transactions`) |
| **Accounts & Categories** | ✅ Complete | ✅ Complete | Live in PostgreSQL (`accounts`, `categories`) |
| **Budgets** | ✅ Complete | ✅ Complete | Live in PostgreSQL (`budgets`) |
| **Bank / Insurance Catalog** | ✅ Complete | ✅ Complete | Live in PostgreSQL + Seeders |
| **Mutual Funds (AMCs)** | ✅ Complete | ✅ Complete | Live in PostgreSQL + Seeders |
| **Web Crawler Engine** | ✅ Complete | ✅ Complete | Background scheduler active |
| **Goals Tracker** | ✅ Complete UI | ❌ Client Mock | Currently returns `of([...])` in `goals.service.ts` |
| **Subscriptions** | ✅ Complete UI | ❌ Client Mock | Currently returns `of([...])` in `subscription.service.ts` |
| **Income Hub** | ✅ Complete UI | ❌ Client Mock | Multi-source earnings in `income.service.ts` |
| **Notes & Debts** | ✅ Complete UI | ❌ Client Mock | `debt-notes.service.ts` needs backend table |
| **Portfolio (Sanchayapatra/DPS)**| ✅ Complete UI | ❌ Client Mock | `portfolio.service.ts` needs backend table |
| **NBR Tax Calculator** | ✅ Complete UI | N/A (Stateless) | Pure mathematical calculation in `tax.service.ts` |
| **Salary Planner** | ✅ Complete UI | N/A (Stateless) | Career timeline in `career.service.ts` |

---

## 5. Standard Prompts for AI-Assisted Development
* **When implementing a new feature**:
  *"Implement this feature according to Finox's Clean Architecture in .NET 9 (Domain -> Application -> Infrastructure -> API) and use Angular 21 Signals for frontend state."*
* **After completing a feature chat**:
  *"Now extract the business rules, formulas, and architecture decisions from our discussion and format them to update `docs/DECISIONS.md` and `docs/FEATURES/<feature>.md`."*
