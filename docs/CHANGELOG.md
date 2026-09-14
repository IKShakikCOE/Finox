# 📝 Finox — Changelog

All notable changes, architectural milestones, and schema updates for Finox are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Planned
- Scaffold backend entities and database tables for Goals, Subscriptions, Income Streams, and Debt Records.
- Migrate frontend `AuthService` from client-side Keycloak admin token to backend `/api/auth/*` endpoints.
- Break down mega-components (`income-overview`, `goals-tracker`, `subscription-tracker`) into presentational sub-components.
- Add ASP.NET Core SignalR hub for real-time notifications and messaging.

---

## [0.9.0-beta] - 2026-09-14
### Added
- **Centralized Documentation Architecture**: Created master `docs/` structure (`PRODUCT.md`, `DOMAIN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `AI_CONTEXT.md`, `IMPLEMENTATION_STATUS.md`, and feature specs in `FEATURES/`).
- Linked `docs/` at workspace root via Directory Junction and updated `finox.code-workspace`.

### Security
- Identified critical security issue in `auth.service.ts` (client-side Keycloak admin token) and documented remediation plan in ADR `DEC-006`.

---

## [0.8.0] - 2026-07-20
### Added
- **Web Crawler Module (`Modules/Crawler`)**: Registered sources, admin approval workflow, recurring background scheduler, and execution job logging.
- **Admin Management Portal**: Administrative CRUD for banks, insurance companies, mutual funds, platforms, and articles.
- **Dynamic Table & Dialog Architecture**: Shared dynamic components in Angular for generic tabular data operations.

---

## [0.5.0] - 2026-06-15
### Added
- **Modular Monolith Foundation (.NET 9)**: 11 feature modules split into Domain, Application, Infrastructure, and API projects.
- **Keycloak Authentication**: JWT Bearer token validation and multi-tenant `IOwnedEntity` global query filters.
- **PostgreSQL Database**: Schema migration to snake_case column standard.
- **Angular 21 UI**: PrimeNG Sakai theme integration with Angular Signals state management.
