# Tracker Module — Real Database Integration Tasks

> Step-by-step guide to connect the Tracker module from demo/mock data to real backend API + PostgreSQL database.

---

## ✅ Task 1.1 — Redesign Tracker Tables (COMPLETED)

The tracker tables have been redesigned with:

### Design Improvements Applied
1. **Enums instead of strings** — `FlowType`, `AccountType`, `PaymentMethod`, `BudgetPeriod`, `RecurringFrequency` are proper C# enums stored as string conversions in PostgreSQL
2. **Foreign keys** — `Transaction.category_id → categories.id`, `Transaction.account_id → accounts.id`, `Budget.category_id → categories.id`, `Category.parent_id → categories.id` (self-referencing)
3. **Snake_case column names** — All columns use `lower_case_with_underscores` (e.g., `owner_id`, `category_id`, `payment_method`, `is_recurring`, `created_at`)
4. **Proper data types** — `DateOnly` for dates, `decimal(18,2)` for money, `int` for alert threshold
5. **Audit columns** — `created_at` and `updated_at` on all entities
6. **Indexes** — Composite indexes for common queries (owner+date, owner+type, owner+name unique)
7. **Cascade/SetNull** — Budget cascades on category delete; Transaction sets null on category/account delete
8. **Navigation properties** — Full EF Core relationships with `Include()` support
9. **TrackerMeta as per-user entity** — Stored in DB with `text[]` arrays, one row per user, auto-seeded on first access

### New Table Schema

```
┌─────────────────────────────────────────────────────────────────────┐
│ categories                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ id           VARCHAR(64) PK                                         │
│ owner_id     VARCHAR(128) NOT NULL                                  │
│ name         VARCHAR(100) NOT NULL                                  │
│ type         VARCHAR(10)  NOT NULL  [INCOME | EXPENSE]              │
│ icon         VARCHAR(50)                                            │
│ color        VARCHAR(20)                                            │
│ parent_id    VARCHAR(64)  FK → categories.id (self-ref, SET NULL)   │
│ created_at   TIMESTAMP    DEFAULT now()                             │
│ updated_at   TIMESTAMP                                              │
├─────────────────────────────────────────────────────────────────────┤
│ UNIQUE(owner_id, name)                                              │
│ INDEX(owner_id), INDEX(owner_id, type)                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ accounts                                                            │
├─────────────────────────────────────────────────────────────────────┤
│ id           VARCHAR(64) PK                                         │
│ owner_id     VARCHAR(128) NOT NULL                                  │
│ name         VARCHAR(100) NOT NULL                                  │
│ type         VARCHAR(20)  NOT NULL  [CASH|BANK|CREDIT_CARD|...]     │
│ balance      DECIMAL(18,2) NOT NULL                                 │
│ currency     VARCHAR(5)   NOT NULL  DEFAULT 'BDT'                   │
│ icon         VARCHAR(50)                                            │
│ color        VARCHAR(20)                                            │
│ is_active    BOOLEAN      DEFAULT true                              │
│ created_at   TIMESTAMP    DEFAULT now()                             │
│ updated_at   TIMESTAMP                                              │
├─────────────────────────────────────────────────────────────────────┤
│ UNIQUE(owner_id, name)                                              │
│ INDEX(owner_id)                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ transactions                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ id                   VARCHAR(64) PK                                  │
│ owner_id             VARCHAR(128) NOT NULL                           │
│ title                VARCHAR(200) NOT NULL                           │
│ amount               DECIMAL(18,2) NOT NULL                         │
│ type                 VARCHAR(10)  NOT NULL  [INCOME | EXPENSE]      │
│ date                 DATE         NOT NULL                           │
│ category_id          VARCHAR(64)  FK → categories.id (SET NULL)     │
│ account_id           VARCHAR(64)  FK → accounts.id (SET NULL)       │
│ payment_method       VARCHAR(20)  [CASH|BANK|MOBILE_BANKING|...]    │
│ remarks              VARCHAR(500)                                    │
│ is_recurring         BOOLEAN      DEFAULT false                     │
│ recurring_frequency  VARCHAR(10)  [MONTHLY|WEEKLY|YEARLY]           │
│ created_at           TIMESTAMP    DEFAULT now()                     │
│ updated_at           TIMESTAMP                                      │
├─────────────────────────────────────────────────────────────────────┤
│ INDEX(owner_id), INDEX(owner_id, date), INDEX(owner_id, type)       │
│ INDEX(category_id), INDEX(account_id)                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ budgets                                                             │
├─────────────────────────────────────────────────────────────────────┤
│ id               VARCHAR(64) PK                                     │
│ owner_id         VARCHAR(128) NOT NULL                              │
│ category_id      VARCHAR(64)  FK → categories.id (CASCADE)          │
│ allocated_amount DECIMAL(18,2) NOT NULL                             │
│ period           VARCHAR(10)  NOT NULL  [MONTHLY|WEEKLY|YEARLY|...]  │
│ start_date       DATE                                               │
│ end_date         DATE                                               │
│ alert_threshold  INTEGER                                            │
│ is_active        BOOLEAN      DEFAULT true                          │
│ created_at       TIMESTAMP    DEFAULT now()                         │
│ updated_at       TIMESTAMP                                          │
├─────────────────────────────────────────────────────────────────────┤
│ UNIQUE(owner_id, category_id, period)                               │
│ INDEX(owner_id), INDEX(category_id)                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ tracker_meta                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ id                  VARCHAR(64) PK                                   │
│ owner_id            VARCHAR(128) NOT NULL UNIQUE                     │
│ payment_methods     TEXT[]                                           │
│ income_categories   TEXT[]                                           │
│ expense_categories  TEXT[]                                           │
│ created_at          TIMESTAMP    DEFAULT now()                       │
│ updated_at          TIMESTAMP                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Relationships
```
Category (1) ←──── (N) Transaction     [category_id FK, SET NULL]
Account  (1) ←──── (N) Transaction     [account_id FK, SET NULL]
Category (1) ←──── (N) Budget          [category_id FK, CASCADE]
Category (1) ←──── (N) Category        [parent_id FK, SET NULL] (self-ref)
```

---

## Remaining Tasks

### Phase 1: Backend — Apply Migration

#### Task 1.2 — Generate & Apply New Migration ✅
- [x] Migration generated: `20260531120555_RedesignTrackerTables`
- [x] Custom SQL added for PostgreSQL `text → date` conversion (USING clause)
- [x] Applied: `dotnet ef database update`
- [x] Tables verified in PostgreSQL with correct schema

#### Task 1.3 — Verify API Endpoints Work ✅
- [x] API starts successfully on `http://localhost:5062`
- [x] `GET /api/tracker/meta` → auto-seeds default metadata for new user, returns payment methods + categories
- [x] `PUT /api/tracker/meta` → updates user's metadata
- [x] `POST /api/categories` → creates category with enum type, returns with id + createdAt
- [x] `GET /api/categories` → lists user's categories
- [x] `POST /api/accounts` → creates account with enum type, defaults currency to BDT
- [x] `GET /api/accounts` → lists user's accounts
- [x] `POST /api/transactions` → creates with categoryId/accountId FK, returns with navigation populated
- [x] `GET /api/transactions` → lists with category/account navigation included
- [x] `GET /api/transactions?type=INCOME` → filtered by enum
- [x] `GET /api/transactions?search=Salary` → search by title/remarks
- [x] `PUT /api/transactions/{id}` → updates, returns with navigation
- [x] `DELETE /api/transactions/{id}` → 204 No Content
- [x] `POST /api/transactions/bulk-delete` → bulk deletes by IDs
- [x] `POST /api/budgets` → creates with categoryId FK
- [x] `GET /api/budgets` → lists user's budgets
- [x] `DELETE /api/budgets/{id}` → 204 No Content
- [x] `DELETE /api/categories/{id}` → cascades to budgets, sets null on transactions
- [x] JSON circular reference handled with `ReferenceHandler.IgnoreCycles`

#### Additional Fix Applied
- Added `ReferenceHandler.IgnoreCycles` to `FinoxJsonOptions` to prevent infinite loops from EF Core navigation properties
- `TransactionService.CreateAsync` and `UpdateAsync` now reload navigation properties before returning

---

### Phase 2: Rewrite TrackerService (Frontend) ✅

#### Task 2.1 — Refactor TrackerService to Use Real API Calls ✅
- [x] `loadTrackerMetaData()` → `GET /api/tracker/meta`
- [x] `loadTransactions()` → `GET /api/transactions`
- [x] `loadCategories()` → `GET /api/categories`
- [x] `loadAccounts()` → `GET /api/accounts`
- [x] `loadBudgets()` → `GET /api/budgets`
- [x] `loadAll()` → loads everything in parallel

#### Task 2.2 — Transaction CRUD via API ✅
- [x] `addTransaction(txn)` → `POST /api/transactions` then update signal
- [x] `updateTransaction(id, txn)` → `PUT /api/transactions/{id}` then update signal
- [x] `deleteTransaction(id)` → `DELETE /api/transactions/{id}` then update signal
- [x] `bulkDeleteTransactions(ids)` → `POST /api/transactions/bulk-delete` then update signal

#### Task 2.3 — Category CRUD via API ✅
- [x] `addCategory(cat)` → `POST /api/categories` then update signal
- [x] `updateCategory(id, cat)` → `PUT /api/categories/{id}` then update signal
- [x] `deleteCategory(id)` → `DELETE /api/categories/{id}` then update signal
- [x] `bulkDeleteCategories(ids)` → `POST /api/categories/bulk-delete` then update signal

#### Task 2.4 — Account CRUD via API ✅
- [x] `addAccount(acc)` → `POST /api/accounts` then update signal
- [x] `updateAccount(id, acc)` → `PUT /api/accounts/{id}` then update signal
- [x] `deleteAccount(id)` → `DELETE /api/accounts/{id}` then update signal
- [x] `bulkDeleteAccounts(ids)` → `POST /api/accounts/bulk-delete` then update signal

#### Task 2.5 — Budget CRUD via API ✅
- [x] `addBudget(budget)` → `POST /api/budgets` (sends `categoryId`)
- [x] `updateBudget(id, budget)` → `PUT /api/budgets/{id}` then update signal
- [x] `deleteBudget(id)` → `DELETE /api/budgets/{id}` then update signal

---

### Phase 3: Update Components ✅

#### Task 3.1 — Update TrackerCrudComponent (Transactions) ✅
- [x] Use `category.name` dot-notation in table column (DynamicTable now supports nested paths)
- [x] Display `transaction.category?.name` in the table via `resolveField()` helper
- [x] Wire CRUD to async service methods with error toasts
- [x] Map category name → `categoryId` in `onDialogSave`
- [x] Pre-fill category name when editing

#### Task 3.2 — Update CategoryManagementComponent ✅
- [x] Wire to async API calls with error handling
- [x] `ngOnInit` → `loadCategories()`

#### Task 3.3 — Update AccountManagementComponent ✅
- [x] Wire to async API calls with error handling
- [x] `ngOnInit` → `loadAccounts()`

#### Task 3.4 — Update BudgetingComponent ✅
- [x] Uses `categoryId` FK via mapping in `onSave`
- [x] Budget vs. actual joins on `categoryId`
- [x] Pre-fills category name when editing
- [x] Wire to async API calls

#### Task 3.5 — Update TrackerReportsComponent ✅
- [x] Groups by `transaction.category?.name`
- [x] `ngOnInit` → `loadTransactions()`

---

### Phase 4: Error Handling & UX ✅

#### Task 4.1 — Add Loading States ✅
- [x] Added `loading` signal to TrackerService
- [x] Set during `loadAll()`, `loadTransactions()` etc.

#### Task 4.2 — Add Error Handling ✅
- [x] All CRUD operations catch HTTP errors
- [x] Show error toast notifications on failure
- [x] 401 handled by auth interceptor (redirect to login)
- [x] Returns `null`/`false` on failure for component-level handling

---

### Phase 5: Testing & Validation ✅

All verified via:
- 59 backend unit tests passing
- 17 API integration tests passing (Keycloak JWT + real PostgreSQL)
- Angular build succeeds with zero errors
- DynamicTable supports nested field paths for navigation properties

---

## API Endpoint Reference

| Resource | Endpoint | Methods | Notes |
|----------|----------|---------|-------|
| Tracker Meta | `/api/tracker/meta` | GET, PUT | Per-user, auto-seeds |
| Transactions | `/api/transactions` | GET, POST | GET supports `?type=&search=` |
| Transaction | `/api/transactions/{id}` | PUT, DELETE | |
| Bulk Delete Txn | `/api/transactions/bulk-delete` | POST | `{ "ids": [...] }` |
| Categories | `/api/categories` | GET, POST | |
| Category | `/api/categories/{id}` | PUT, DELETE | |
| Bulk Delete Cat | `/api/categories/bulk-delete` | POST | |
| Accounts | `/api/accounts` | GET, POST | |
| Account | `/api/accounts/{id}` | PUT, DELETE | |
| Bulk Delete Acc | `/api/accounts/bulk-delete` | POST | |
| Budgets | `/api/budgets` | GET, POST | |
| Budget | `/api/budgets/{id}` | PUT, DELETE | No bulk-delete |

---

## Key Implementation Notes

1. **Frontend sends `categoryId`** — not category name. The backend returns the full `category` navigation object via `Include()`.
2. **Enums serialize as strings** — `JsonStringEnumConverter` is configured globally. Frontend sends `"INCOME"`, backend deserializes to `FlowType.INCOME`.
3. **Dates** — Frontend sends `"2026-05-01"` string, backend maps to `DateOnly`. The `DateOnlyJsonConverter` handles this.
4. **IDs are server-generated** — Don't generate IDs on the frontend. The backend returns the created entity with its ID.
5. **OwnerId is server-set** — Never send `ownerId` from the frontend. The backend sets it from the JWT token.
6. **Budget uses categoryId** — Not a category name string. The budget-vs-actual computation should join on `categoryId`.
7. **TrackerMeta auto-seeds** — First `GET /api/tracker/meta` call creates a default row for the user.
