# Finox — Flutter Mobile App Specification

> Complete specification for building the Finox Flutter mobile app.
> This document mirrors the Angular 21 web app feature-for-feature.
> Hand this to Gemini AI or any Flutter developer to generate the mobile app.

---

## 1. Overview

**Finox** is a personal finance super-app for the Bangladesh market (BDT/৳).
The Flutter app must replicate ALL features of the Angular web app with a
mobile-optimized UI. Both apps share the same backend REST API.

### Target Platforms
- Android (min SDK 21)
- iOS (min iOS 13)

### Recommended Flutter Stack
- **State Management**: Riverpod 2.x (mirrors Angular Signals pattern)
- **HTTP Client**: Dio (with interceptors for auth)
- **Navigation**: GoRouter (declarative, nested routes)
- **UI Components**: Material 3 + custom widgets
- **Charts**: fl_chart
- **Auth**: Keycloak via OpenID Connect (flutter_appauth or custom)
- **Storage**: flutter_secure_storage (tokens), shared_preferences (settings)
- **Markdown**: flutter_markdown (for AI Advisor responses)

---

## 2. Authentication & Security

### Keycloak Configuration
```dart
// config/keycloak_config.dart
class KeycloakConfig {
  static const String realm = 'finox';
  static const String clientId = 'finox-app';
  static const String baseUrl = 'http://127.0.0.1:8080'; // dev
  // static const String baseUrl = 'https://auth.finox.app'; // prod
  
  static String get tokenEndpoint => '$baseUrl/realms/$realm/protocol/openid-connect/token';
  static String get userInfoEndpoint => '$baseUrl/realms/$realm/protocol/openid-connect/userinfo';
  static String get logoutEndpoint => '$baseUrl/realms/$realm/protocol/openid-connect/logout';
}
```

### Auth Flow
1. **Login**: POST to token endpoint with `grant_type=password`, `client_id`, `username`, `password`
2. **Token Storage**: Store `access_token` and `refresh_token` in flutter_secure_storage
3. **Auto-refresh**: Intercept 401 responses, refresh token, retry request
4. **Role Extraction**: Decode JWT payload → `realm_access.roles` + `resource_access.finox-app.roles`
5. **Logout**: POST to logout endpoint with refresh_token, clear storage

### Auth Models
```dart
class AuthUser {
  final String? id;        // Keycloak sub
  final String username;
  final String email;
  final String? firstName;
  final String? lastName;
  final String fullName;
}

class TokenResponse {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final int refreshExpiresIn;
}
```

### Auth Screens
| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/auth/login` | Username/email + password + remember me + forgot password link |
| Register | `/auth/register` | firstName, lastName, username, email, password + terms checkbox |
| Forgot Password | `/auth/forgot-password` | Email input → sends reset link → success state |

---

## 3. App Navigation Structure

### Bottom Navigation (Main Tabs)
```
Bottom Nav:
├── Home (Dashboard)
├── Tracker
├── Explore (Bank/Insurance/MF/Investment)
├── AI Advisor
└── More (News, Calendar, Messages, Profile, Admin)
```

### Drawer Menu (Alternative — matches web sidebar)
```
├── Dashboard
├── Tracker
│   ├── Ledger
│   ├── Budgeting
│   ├── Categories
│   ├── Accounts
│   └── Reports
├── Bank
│   ├── Banks
│   ├── Products
│   └── Compare
├── Insurance
│   ├── Companies
│   ├── Products
│   └── Compare
├── Mutual Funds
│   ├── AMCs
│   ├── Funds
│   └── Compare
├── Investment
│   ├── Overview
│   ├── Campaigns
│   └── Compare
├── AI Advisor
├── News & Learning
│   ├── All / News / Tips / Advice / Books / Learning
│   └── Article Detail
├── Calendar
├── Messages
├── Profile
│   ├── My Profile
│   ├── Settings
│   └── Change Password
└── Admin (role-gated)
    ├── Dashboard / Users / Banks / Insurance / MF
    ├── News / Tracker Meta / Platforms / Profiles
    ├── Audit Logs / Analytics / Announcements / Seed
```

---

## 4. Data Models (Dart Classes)

### 4.1 Tracker
```dart
class Transaction {
  String? id;
  String? title;
  double? amount;
  String? type; // 'INCOME' | 'EXPENSE'
  String? category;
  String? date; // YYYY-MM-DD
  String? paymentMethod; // 'CASH' | 'BANK' | 'MOBILE_BANKING'
  String? accountId;
  String? remarks;
  bool? isRecurring;
  String? recurringFrequency; // 'MONTHLY' | 'WEEKLY' | 'YEARLY'
}

class Category {
  String? id;
  String name;
  String type; // 'INCOME' | 'EXPENSE'
  String? icon;
  String? color;
  String? parentId;
}

class Account {
  String? id;
  String name;
  String type; // 'CASH' | 'BANK' | 'CREDIT_CARD' | 'MOBILE_BANKING'
  double balance;
  String? currency; // default 'BDT'
  String? icon;
  String? color;
}

class Budget {
  String? id;
  String category;
  double allocatedAmount;
  String period; // 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'CUSTOM'
  String? startDate;
  String? endDate;
  int? alertThreshold; // percentage (e.g., 80)
}

class TrackerMeta {
  List<String> paymentMethods;
  List<String> incomeCategories;
  List<String> expenseCategories;
}
```

### 4.2 Bank
```dart
class Bank { String id; String name; String? logo; }

class BankProduct {
  String id, bankId, bankName, name, eligibility;
  String category; // 'SAVINGS' | 'LOAN' | 'FDR' | 'DPS'
  double interestRate;
  double? minDeposit;
  String? tenure;
  List<String> features;
}

class BankProfile {
  String id, name, type, headquarters, chairman, md;
  String swiftCode, rating, ratingAgency, riskLevel;
  String authorizedCapital, paidUpCapital, totalAssets;
  int established, branches, atmBooths, employees;
  double nplRatio;
  List<String> services, digitalServices;
  String website;
}
```

### 4.3 Insurance
```dart
class InsuranceCompany { String id; String name; }

class InsuranceProduct {
  String id, companyId, companyName, name;
  String category; // 'LIFE'|'HEALTH'|'VEHICLE'|'PROPERTY'|'CHILD'|'PENSION'
  String premiumRange, coverageAmount, tenure, maturityBenefit, eligibility;
  List<String> features;
}

class InsuranceProfile {
  String id, name, type, headquarters, chairman, md;
  String paidUpCapital, totalAssets, rating, ratingAgency, riskLevel, website;
  int established, branches, employees, agents;
  double claimSettlementRatio, solvencyRatio;
  List<String> products;
}
```

### 4.4 Mutual Funds
```dart
class AMC { String id; String name; }

class MutualFund {
  String id, amcId, amcName, name, fundSize, objective;
  String category; // 'GROWTH' | 'BALANCED' | 'FIXED_INCOME'
  String riskLevel; // 'LOW' | 'MODERATE' | 'HIGH'
  double nav, returnRate1Y, returnRate3Y, returnRate5Y;
  double minInvestment, expenseRatio;
  List<String> features;
}

class AMCProfile {
  String id, name, headquarters, chairman, md;
  String paidUpCapital, aum, rating, ratingAgency, riskLevel;
  String parentOrg, investmentPhilosophy, website;
  int established, totalFunds;
  List<String> fundTypes;
}
```

### 4.5 Investment
```dart
class Platform { String id; String name; String? icon; String? color; }

class Campaign {
  String id, platformId, platformName, name, type;
  String status; // 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  String startDate, endDate;
  double budget, spent, revenue, cpc, ctr, roas;
  int impressions, clicks, conversions;
}
```

### 4.6 News
```dart
class Article {
  String id, title, excerpt, author, date, readTime, image;
  String category; // 'News'|'Tips'|'Advice'|'Books'|'Learning'
  List<String> tags;
  bool featured;
  String? content; // full body (markdown)
}
```

### 4.7 Calendar
```dart
class CalendarEvent {
  String id, title, date; // YYYY-MM-DD
  String type; // 'PAYMENT'|'MEETING'|'REMINDER'|'DEADLINE'
  String? time, description, color;
}
```

### 4.8 Messages
```dart
class ChatUser {
  String id, name;
  String status; // 'online'|'offline'|'away'
  String? avatar, lastSeen;
}

class Message {
  String id, senderId, receiverId, content, timestamp;
  bool read;
}

class Conversation {
  ChatUser user;
  String lastMessage, lastMessageTime;
  int unreadCount;
}
```

### 4.9 AI Advisor
```dart
class AdvisorMessage {
  String id;
  String role; // 'user' | 'assistant'
  String content; // Markdown
  DateTime timestamp;
}

class QuickPrompt { String label; String icon; String prompt; }
```

### 4.10 User
```dart
class UserProfile {
  String id, fullName, email, phone, joinDate, currency, language, timezone;
  String? avatar, designation, company, address, city, country;
}

class UserSettings {
  NotificationSettings notifications;
  PrivacySettings privacy;
  DisplaySettings display;
}
class NotificationSettings { bool email, push, budgetAlerts, weeklyReport; }
class PrivacySettings { bool showProfile, showActivity; }
class DisplaySettings { String currency, dateFormat, language; }
```

### 4.11 Dashboard
```dart
class DashboardData {
  FinanceSummary summary;
  List<AssetAllocation> allocations;
  List<DashboardTransaction> recentTransactions;
  List<DashboardNotification> notifications;
  List<CashFlowData> cashFlow;
}

class FinanceSummary {
  double totalBalance, monthlyIncome, monthlyExpense;
  double savingsRate, balanceChangePercent, expenseChangePercent;
}

class AssetAllocation {
  String assetClass, description, colorClass, textColorClass;
  double percentage;
}

class CashFlowData { String quarter; double income, expense, savings; }
```

---

## 5. API Endpoints

### Base URL
- Dev: `http://10.0.2.2:5000` (Android emulator) or `http://localhost:5000`
- Prod: `https://api.finox.app`

All endpoints require `Authorization: Bearer <access_token>` header except auth endpoints.

### 5.1 Auth
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{username,email,password,firstName,lastName}` | 201 |
| POST | `/api/auth/forgot-password` | `{email}` | 200 |
| POST | `/api/auth/change-password` | `{currentPassword,newPassword}` | 200 |
| GET | `/api/auth/me` | — | AuthUser |

### 5.2 Dashboard
| GET | `/api/dashboard` | — | DashboardData |

### 5.3 Tracker
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tracker/meta` | TrackerMeta |
| GET | `/api/transactions` | Transaction[] (supports `?type=&search=`) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update |
| DELETE | `/api/transactions/{id}` | Delete |
| POST | `/api/transactions/bulk-delete` | `{ids:[]}` |
| GET/POST/PUT/DELETE | `/api/categories` | Category CRUD |
| GET/POST/PUT/DELETE | `/api/accounts` | Account CRUD |
| GET/POST/PUT/DELETE | `/api/budgets` | Budget CRUD |

### 5.4 Bank
| GET | `/api/banks` | Bank[] |
| GET | `/api/banks/products` | BankProduct[] (`?category=&bankId=`) |
| GET | `/api/banks/profiles` | BankProfile[] |
| GET | `/api/banks/{id}` | BankProfile |

### 5.5 Insurance
| GET | `/api/insurance/companies` | InsuranceCompany[] |
| GET | `/api/insurance/products` | InsuranceProduct[] (`?category=&companyId=`) |
| GET | `/api/insurance/profiles` | InsuranceProfile[] |

### 5.6 Mutual Funds
| GET | `/api/mutual-funds/amcs` | AMC[] |
| GET | `/api/mutual-funds` | MutualFund[] (`?category=&risk=&amcId=`) |
| GET | `/api/mutual-funds/profiles` | AMCProfile[] |

### 5.7 Investment
| GET | `/api/investment/platforms` | Platform[] |
| GET | `/api/investment/campaigns` | Campaign[] (`?status=&platformId=`) |
| POST/PUT/DELETE | `/api/investment/campaigns` | Campaign CRUD |

### 5.8 News
| GET | `/api/news` | `{categories:[], articles:[]}` (`?category=&search=`) |
| GET | `/api/news/{id}` | Article (with full content) |

### 5.9 Calendar
| GET | `/api/calendar/events` | CalendarEvent[] (`?from=&to=`) |
| POST | `/api/calendar/events` | Create |
| DELETE | `/api/calendar/events/{id}` | Delete |

### 5.10 Messages
| GET | `/api/messages/conversations` | Conversation[] |
| GET | `/api/messages/contacts` | ChatUser[] |
| GET | `/api/messages?userId={id}` | Message[] |
| POST | `/api/messages` | `{receiverId,content}` |
| POST | `/api/messages/read` | `{userId}` |

### 5.11 AI Advisor
| POST | `/api/advisor/chat` | `{message}` → AdvisorMessage |
| GET | `/api/advisor/history` | AdvisorMessage[] |

### 5.12 User
| GET | `/api/user/profile` | UserProfile |
| PUT | `/api/user/profile` | Update (partial) |
| GET | `/api/user/settings` | UserSettings |
| PUT | `/api/user/settings` | Update |

### 5.13 Admin (role: admin)
| GET | `/api/admin/stats` | AdminStats |
| GET | `/api/admin/users` | AdminUser[] |
| PUT | `/api/admin/users/{id}/status` | `{enabled}` |
| POST | `/api/admin/users/{id}/reset-password` | `{password}` |
| DELETE | `/api/admin/users/{id}` | Delete user |
| POST | `/api/admin/users/bulk-import` | FormData (CSV) |
| GET/PUT | `/api/admin/tracker/meta` | TrackerMeta CRUD |
| GET | `/api/admin/audit-logs` | AuditLog[] (`?from=&to=&action=`) |
| GET/POST/PUT/DELETE | `/api/admin/announcements` | Announcement CRUD |
| GET | `/api/admin/analytics` | AnalyticsData |
| GET | `/api/admin/seed/status` | SeedStatus |
| POST | `/api/admin/seed` | `{tables:[]}` |

---

## 6. Screen-by-Screen UI Specification

### 6.1 Dashboard Screen
**Layout**: Scrollable column
- **4 stat cards** (horizontal scroll on mobile): Total Balance, Monthly Income, Monthly Expense, Savings Rate — each with value + change percentage + icon
- **Recent Transactions**: List with description, category chip, colored amount (+green/-red), date
- **Cash Flow Chart**: Grouped bar chart (Income/Expense/Savings by quarter)
- **Asset Allocation**: List items with label + progress bar + percentage
- **Notifications**: Grouped by "TODAY" / "LAST WEEK" with icon + title + message

### 6.2 Tracker — Ledger
**Layout**: AppBar with filter chips + FAB for add
- **Filter bar**: Chips for ALL / EXPENSE / INCOME
- **Transaction list**: Card per transaction showing date, title, amount (colored), category, type tag
- **Search**: Search bar at top
- **Add/Edit**: Bottom sheet or full-screen form with fields: type (radio), title, amount, date, category (dropdown), payment method, remarks
- **Swipe actions**: Edit (left), Delete (right) with confirmation

### 6.3 Tracker — Categories
- List with category name + type tag (Income=green, Expense=red) + color dot
- Filter chips: ALL / EXPENSE / INCOME
- FAB to add new category
- Edit/Delete via long-press or swipe

### 6.4 Tracker — Accounts
- Card per account: name, type tag, balance (BDT formatted), currency
- FAB to add
- Edit/Delete actions

### 6.5 Tracker — Budgeting
- **Summary row**: Total Allocated | Total Spent | Remaining
- **Budget cards**: Category name, period tag, spent vs allocated, progress bar (green/yellow/orange/red based on %), remaining amount, status tag (On Track/Near Limit/Over Budget)
- FAB to add budget
- Tap to edit, long-press to delete

### 6.6 Tracker — Reports
- **3 stat cards**: Total Income, Total Expense, Net Balance
- **Expense by Category**: List sorted by amount with percentage
- **Income by Category**: Same format

### 6.7 Bank — Banks List
- Search bar
- Card per bank: name, type tag, established tag, rating tag, risk tag
- Metrics row: Capital, Assets, Branches, ATMs, NPL%, Employees
- Tap → Bank Detail

### 6.8 Bank — Bank Detail
- **Header**: Bank name + tags (type, established, rating, risk, SWIFT)
- **Tabs**: Overview | Branches & ATMs | Products | Services
- Overview: Capital cards + Leadership info + Risk profile
- Products: Grid of product cards for this bank
- Services: Banking services list + Digital services list

### 6.9 Bank — Products
- Filter chips: ALL / SAVINGS / FDR / DPS / LOAN
- Multi-select filter by bank
- Product cards: category tag, bank name, product name, interest rate (large), min deposit, tenure, features list, eligibility
- "Add to Compare" button (max 4)

### 6.10 Bank/Insurance/MF — Compare
- Horizontal scrollable comparison table
- Header: product/fund info with remove button
- Rows: each metric side-by-side
- "Best" indicator (star icon) on winning values
- Empty state: "Select at least 2 items to compare"

### 6.11 Insurance — Companies
- Same pattern as Banks List but with: claim settlement ratio, solvency ratio, agents count, products list

### 6.12 Insurance — Products
- Filter by category: ALL/LIFE/HEALTH/VEHICLE/PROPERTY/CHILD/PENSION
- Filter by company (multi-select)
- Cards: category tag, company name, product name, premium range, coverage, tenure, maturity benefit, features, eligibility

### 6.13 Mutual Funds — AMCs
- Search + list of AMC profiles
- Each card: name, established, rating, risk, paid-up capital, AUM, total funds, parent org, chairman/MD, investment philosophy, fund types chips

### 6.14 Mutual Funds — Funds
- Filter by category: ALL/GROWTH/BALANCED/FIXED_INCOME
- Filter by risk: ALL/LOW/MODERATE/HIGH
- Filter by AMC (multi-select)
- Cards: category tag, risk tag, fund name, AMC name, 1Y/3Y/5Y returns, NAV, min investment, expense ratio, fund size, objective, features

### 6.15 Investment — Overview
- **4 stat cards**: Total Budget, Total Spent, Total Revenue, Overall ROAS
- **Platform Breakdown**: List with platform name + spent + revenue + ROAS + conversions
- **Top Campaigns by ROAS**: List with campaign name, platform, ROAS value, status tag

### 6.16 Investment — Campaigns
- Filter by status: ALL/ACTIVE/PAUSED/COMPLETED (chips)
- Filter by platform (multi-select)
- Campaign cards: platform tag, status tag, name, type + date range, budget/spent/revenue metrics, ROAS/CPC/CTR, impressions/clicks/conversions, budget utilization progress bar

### 6.17 AI Advisor
- **Chat interface** (like WhatsApp/ChatGPT)
- Quick prompt chips at top (when empty) or bottom (when messages exist)
- User messages: right-aligned, primary color bubble
- Assistant messages: left-aligned, surface color bubble, markdown rendered
- Input bar at bottom with send button
- Loading indicator: "Analyzing your data..."
- Clear chat button in app bar

**Quick Prompts**:
1. Spending Analysis
2. Investment Review
3. Budget Advice
4. Best Campaigns
5. Savings Goal
6. Risk Assessment

### 6.18 News & Learning
- **Tab bar or chips**: All / News / Tips / Advice / Books / Learning
- **Featured section** (All tab only): Horizontal scroll of featured article cards
- **Article list**: Card with icon, category tag, title, excerpt, author, read time, tags
- **Article detail**: Full-screen with back button, large icon, category + date + read time, title, author, excerpt (highlighted), content body, related articles

### 6.19 Calendar
- **Split layout**: Calendar widget (top) + Events list (bottom)
- Calendar shows dots on dates with events
- Tap date → shows events for that date
- **Upcoming Events** section below
- Each event: date badge, title, description, type tag (color-coded), delete button
- FAB to add event → bottom sheet with title, date picker, type dropdown, description

### 6.20 Messages
- **Conversation list**: Avatar circle (initials), name, last message preview, time, unread badge, online status dot
- **Chat screen**: Header with user info + status, message bubbles (sent=right/primary, received=left/surface), timestamp, input bar + send button
- Auto-scroll to bottom on new messages

### 6.21 User — Profile
- Avatar circle with initials
- Name + designation + company
- "Active" badge + member since date
- Editable form: fullName, email, phone, designation, company, city, address
- Edit/Save toggle button

### 6.22 User — Settings
- **Notifications section**: Toggle switches for email, push, budget alerts, weekly report
- **Privacy section**: Toggle switches for show profile, show activity
- **Display section**: Dropdowns for currency (BDT/USD/EUR/GBP/INR), date format, language
- Save button

### 6.23 User — Change Password
- Current password field
- New password field (with strength indicator)
- Confirm password field
- Validation: min 8 chars, passwords must match
- Change Password button

### 6.24 Admin — Dashboard
- Stat cards: Total Users, Transactions, Banks, Articles
- Quick action buttons (navigate to sub-pages)
- System info summary

### 6.25 Admin — User Management
- User list with username, email, first/last name, status tag (enabled/disabled)
- Actions: Toggle status, Reset password (dialog), Delete (confirm)
- Bulk import button → file picker for CSV

### 6.26 Admin — Catalog Management (Banks/Insurance/MF/News/Platforms)
- Tabbed interface (e.g., Banks tab + Products tab)
- List with search + add FAB
- Each item: edit/delete actions
- Add/Edit: Form dialog/bottom sheet with relevant fields

### 6.27 Admin — Profiles Management
- 3 tabs: Bank Profiles / Insurance Profiles / AMC Profiles
- Full CRUD with detailed forms

### 6.28 Admin — Tracker Meta
- 3 sections: Payment Methods, Income Categories, Expense Categories
- Chip-based display with remove (x) button
- Add input + button per section
- Save button

### 6.29 Admin — Audit Logs
- Filterable list: date range, action type, username
- Table/list: timestamp, username, action (color-coded), resource, details, IP

### 6.30 Admin — Analytics
- Charts: User Growth (line), Transaction Volume (bar), Module Usage (pie/doughnut)
- Popular Products list

### 6.31 Admin — Announcements
- List with title, type tag (INFO/WARNING/SUCCESS/ERROR), active status, dates
- CRUD with form: title, type, message, expires at

### 6.32 Admin — Seed Data
- Table status list with checkboxes: table name, row count, seeded status
- "Seed Selected" and "Seed All" buttons with confirmation

---

## 7. Design System

### Colors (matches Angular app)
```dart
// Primary: Emerald
static const primary = Color(0xFF10B981);
static const primaryDark = Color(0xFF059669);

// Semantic
static const success = Color(0xFF10B981);
static const danger = Color(0xFFEF4444);
static const warning = Color(0xFFF59E0B);
static const info = Color(0xFF3B82F6);

// Income/Expense
static const income = Color(0xFF10B981); // green
static const expense = Color(0xFFEF4444); // red

// Risk levels
static const riskLow = Color(0xFF10B981);
static const riskModerate = Color(0xFFF59E0B);
static const riskHigh = Color(0xFFEF4444);
```

### Typography
- Headings: Bold, surface-900
- Body: Regular, surface-700
- Muted: surface-500
- Currency: Bold, formatted with ৳ symbol

### Currency Formatting
```dart
// Always format as BDT
String formatBDT(double amount) {
  return '৳${NumberFormat('#,##0', 'en_BD').format(amount)}';
}
```

### Date Formatting
- Display: `dd MMM yyyy` (e.g., "01 May 2026")
- API: `YYYY-MM-DD` (e.g., "2026-05-01")
- DateTime: ISO-8601

---

## 8. Key UX Patterns

### Compare Feature (Bank/Insurance/MF/Investment)
- Max 4 items can be compared
- "Add to Compare" button on each card (disabled when 4 reached)
- Compare screen: horizontal scroll table with "Best" star indicators
- Clear all button

### CRUD Pattern
- List → FAB (add) → Form (bottom sheet or full screen)
- Swipe to delete with confirmation
- Tap to view/edit
- Pull-to-refresh on lists
- Optimistic UI updates

### Filter Pattern
- Chips/SegmentedButton for category filters
- Multi-select bottom sheet for entity filters (bank, company, AMC, platform)
- Filters persist during session

### Loading States
- Shimmer/skeleton loading for lists
- Circular progress for actions
- Pull-to-refresh indicator

### Error Handling
- Snackbar for success/error messages
- Retry button on network errors
- Empty state illustrations with helpful text

### Offline Support (Optional Enhancement)
- Cache last-fetched data locally
- Show cached data with "offline" indicator
- Queue mutations for sync when online

---

## 9. Folder Structure (Recommended)
```
lib/
├── main.dart
├── app.dart
├── config/
│   ├── keycloak_config.dart
│   ├── api_config.dart
│   └── theme.dart
├── core/
│   ├── auth/
│   │   ├── auth_provider.dart
│   │   ├── auth_service.dart
│   │   └── auth_interceptor.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   └── generic_api_service.dart
│   └── router/
│       └── app_router.dart
├── models/ (all models from §4)
├── features/
│   ├── auth/ (login, register, forgot_password screens)
│   ├── dashboard/
│   ├── tracker/
│   │   ├── screens/ (ledger, categories, accounts, budgeting, reports)
│   │   ├── providers/
│   │   └── widgets/
│   ├── bank/
│   ├── insurance/
│   ├── mutual_funds/
│   ├── investment/
│   ├── ai_advisor/
│   ├── news/
│   ├── calendar/
│   ├── messages/
│   ├── user/
│   └── admin/
├── shared/
│   ├── widgets/ (stat_card, filter_chips, compare_table, etc.)
│   └── utils/ (formatters, validators)
└── l10n/ (localization: English + Bengali)
```

---

## 10. Implementation Priority

### Phase 1 — Core (MVP)
1. Auth (Login/Register/Forgot Password)
2. Dashboard
3. Tracker (Ledger + Categories + Accounts + Budgeting + Reports)
4. User Profile & Settings

### Phase 2 — Catalogs
5. Bank (List + Detail + Products + Compare)
6. Insurance (Companies + Products + Compare)
7. Mutual Funds (AMCs + Funds + Compare)
8. Investment (Overview + Campaigns + Compare)

### Phase 3 — Communication
9. AI Advisor (Chat)
10. Messages (Chat)
11. Calendar
12. News & Learning

### Phase 4 — Admin
13. Admin module (all sub-pages)

---

## 11. Testing Checklist

- [ ] Auth flow: login, register, forgot password, token refresh, logout
- [ ] Dashboard loads and displays all widgets
- [ ] Tracker CRUD: create/edit/delete transactions, categories, accounts, budgets
- [ ] Filters work correctly on all list screens
- [ ] Compare feature works (add/remove/clear, max 4)
- [ ] AI Advisor sends messages and renders markdown responses
- [ ] Messages: conversation list, open chat, send/receive
- [ ] Calendar: view events, add event, delete event
- [ ] Profile: view/edit, settings save, password change
- [ ] Admin: all CRUD operations, role-gated access
- [ ] Dark mode toggle works
- [ ] Currency displays as BDT (৳) everywhere
- [ ] Dates display in correct format
- [ ] Pull-to-refresh on all lists
- [ ] Error states and empty states display correctly
- [ ] Responsive layout on different screen sizes
