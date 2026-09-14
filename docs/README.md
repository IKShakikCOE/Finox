# 📚 Finox Documentation Hub

> **Single Source of Truth for Finox Platform (Product, Architecture, Domain, Decisions, and Features)**

Finox is a personal finance & wealth management "super-app" purpose-built for the Bangladesh economic ecosystem (currency: `BDT` / ৳).

---

## 🧭 Documentation Map

| Document | Purpose | Audience |
|---|---|---|
| [**PRODUCT.md**](PRODUCT.md) | Vision, problem statement, user personas, and core modules | Founders, PMs, Developers |
| [**DOMAIN.md**](DOMAIN.md) | Bangladesh-specific financial concepts (সঞ্চয়পত্র, NBR Tax, DPS/FDR, GPF) | All Developers, Analysts |
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | System architecture (Angular 21 + .NET 9 Modular Monolith + Keycloak) | Backend & Frontend Devs |
| [**DECISIONS.md**](DECISIONS.md) | Architecture Decision Records (ADR) — *Why* decisions were made | Tech Leads, Architects |
| [**AI_CONTEXT.md**](AI_CONTEXT.md) | Master context prompt for AI coding assistants (Antigravity, ChatGPT) | Developers & AI Agents |
| [**IMPLEMENTATION_STATUS.md**](IMPLEMENTATION_STATUS.md) | Live Database vs Client-Mocked status matrix | Developers, QA |
| [**BACKEND_SPEC.md**](BACKEND_SPEC.md) | Exhaustive REST endpoint contracts and entity schemas | Backend Engineers |
| [**openapi.yaml**](openapi.yaml) | Standard OpenAPI 3.0 specification | API Clients, Swagger Tools |
| [**CHANGELOG.md**](CHANGELOG.md) | Version history, updates, and major release notes | Entire Team |

---

## 📦 Feature Deep Dives (`docs/FEATURES/`)

Detailed algorithmic formulas, statutory rules, calculation flows, and edge cases:

* [**NBR Income Tax & Rebate Engine**](FEATURES/nbr-tax-calculator.md)
* [**Sanchayapatra (সঞ্চয়পত্র) Portfolio Management**](FEATURES/sanchayapatra-portfolio.md)
* [**Salary Planner & Take-Home Calculator**](FEATURES/salary-planner-takehome.md)
* [**Automated Web Crawler & Data Ingestion**](FEATURES/web-crawler-engine.md)

---

## ⚡ The Finox Development Workflow

When implementing new features with AI assistance (ChatGPT, Antigravity):

```text
1. Idea / Requirement (In your head or user feedback)
       ↓
2. Chat & Brainstorm with AI (Share AI_CONTEXT.md if starting new chat)
       ↓
3. Understand & Finalize Design
       ↓
4. Implement & Verify in Code
       ↓
5. Extract & Update Docs (Document decisions in DECISIONS.md & feature spec in FEATURES/)
```
