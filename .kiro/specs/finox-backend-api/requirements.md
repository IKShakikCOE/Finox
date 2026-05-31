# Requirements Document

## Introduction

This document specifies the requirements for the **Finox Backend API**, the server-side REST API for the Finox personal finance super-app targeting the Bangladesh market. The Angular 21 frontend is already fully built and currently runs against static demo JSON files in `public/demo/`. This backend replaces those demo files with a live, persistent, multi-user API.

The authoritative scope is defined by `docs/BACKEND_SPEC.md` and `docs/openapi.yaml`. The recommended stack is ASP.NET Core Web API with EF Core and PostgreSQL, authenticated via Keycloak (realm `finox`, client `finox-app`) using JWT Bearer validation. The API MUST preserve the existing `/api/**` path contract and data shapes so the frontend services require minimal changes.

Requirements are grouped into cross-cutting concerns (authentication and security, data isolation, generic CRUD contract, data conventions, error handling, database seeding, API documentation) followed by per-module functional requirements (Auth, Tracker, Bank, Insurance, Mutual Funds, Investment, News/Learn, Calendar, Messages, AI Advisor, User, Dashboard).

## Glossary

- **Finox_API**: The backend REST API service described by this document. Synonymous with "the system" throughout.
- **Auth_Service**: The Finox_API component that wraps privileged Keycloak Admin operations (register, forgot-password, change-password) and exposes current-user identity.
- **Keycloak**: The external OpenID Connect identity provider hosting realm `finox` and client `finox-app`. Issues access tokens validated by the Finox_API.
- **Keycloak_Admin_Client**: A confidential Keycloak service-account client used server-side by the Auth_Service to perform privileged Keycloak Admin REST operations. Replaces the hardcoded browser admin credentials.
- **Access_Token**: A Keycloak-issued JWT Bearer token presented in the `Authorization` header of requests to `/api/**`.
- **User_Id**: The Keycloak token subject claim (`sub`) that uniquely identifies the authenticated user and scopes per-user data.
- **Bearer_Validator**: The Finox_API JWT Bearer middleware that validates Access_Tokens against the Keycloak realm issuer and JWKS.
- **Per_User_Resource**: A resource whose rows are owned by a single User_Id (transactions, categories, accounts, budgets, campaigns, calendar events, messages, advisor messages, user profile, user settings, dashboard).
- **Global_Catalog_Resource**: A read-mostly resource shared across all users (banks, bank products, bank profiles, insurance companies/products/profiles, AMCs, mutual funds, AMC profiles, news articles, investment platforms).
- **Generic_CRUD_Contract**: The standard REST shape every collection resource follows, defined in Requirement 4.
- **Error_Body**: The standard JSON error response shape `{ "error": string, "message": string, "details": object }`.
- **Seed_Data**: The canonical example data contained in `public/demo/*.json`, used to populate the database on initialization.
- **BDT**: Bangladeshi Taka, the default currency code for monetary fields.
- **Tracker_Meta**: Metadata object containing `paymentMethods`, `incomeCategories`, and `expenseCategories` string arrays.
- **Dashboard_Data**: The aggregated per-user financial overview object (summary, allocations, recentTransactions, notifications, cashFlow).
- **Advisor_Message**: A chat message in the AI Advisor history with a `role` of `user` or `assistant` and Markdown `content`.

## Requirements

### Requirement 1: JWT Bearer Authentication

**User Story:** As a platform operator, I want every protected API call to require a valid Keycloak access token, so that only authenticated users can access application data.

#### Acceptance Criteria

1. THE Bearer_Validator SHALL validate the `Authorization` Bearer Access_Token of every request to a path beginning with `/api/` except `POST /api/auth/register` and `POST /api/auth/forgot-password`.
2. THE Bearer_Validator SHALL validate each Access_Token against the Keycloak realm `finox` issuer and the realm JWKS signing keys.
3. IF a request to a protected endpoint omits the `Authorization` Bearer Access_Token, THEN THE Finox_API SHALL respond with HTTP status 401 and an Error_Body.
4. IF a request presents an Access_Token that fails signature validation, THEN THE Finox_API SHALL respond with HTTP status 401 and an Error_Body.
5. IF a request presents an Access_Token whose expiry time is earlier than the current server time, THEN THE Finox_API SHALL respond with HTTP status 401 and an Error_Body.
6. WHEN the Bearer_Validator accepts an Access_Token, THE Finox_API SHALL resolve the current User_Id from the token `sub` claim.

### Requirement 2: Server-Side Keycloak Admin Operations

**User Story:** As a security engineer, I want privileged Keycloak Admin operations performed server-side behind a confidential service account, so that admin credentials are never exposed in the browser.

#### Acceptance Criteria

1. THE Auth_Service SHALL perform all privileged Keycloak Admin operations using the confidential Keycloak_Admin_Client service account.
2. THE Auth_Service SHALL exclude Keycloak admin credentials from every API response body, response header, and log entry.
3. WHEN the Finox_API receives `POST /api/auth/register` with a body containing `username`, `email`, `password`, `firstName`, and `lastName`, THE Auth_Service SHALL create a Keycloak user in realm `finox` and respond with HTTP status 201.
4. IF `POST /api/auth/register` is received with a `username` or `email` that already exists in realm `finox`, THEN THE Auth_Service SHALL respond with HTTP status 409 and an Error_Body.
5. IF `POST /api/auth/register` is received with a body missing any required field, THEN THE Auth_Service SHALL respond with HTTP status 400 and an Error_Body.
6. WHEN the Finox_API receives `POST /api/auth/forgot-password` with a body containing `email`, THE Auth_Service SHALL trigger the Keycloak password-reset email flow for the matching user and respond with HTTP status 200.
7. IF `POST /api/auth/forgot-password` is received with an `email` that matches no user in realm `finox`, THEN THE Auth_Service SHALL respond with HTTP status 404 and an Error_Body.
8. WHEN the Finox_API receives an authenticated `POST /api/auth/change-password` with a body containing a valid `currentPassword` and a `newPassword`, THE Auth_Service SHALL update the current user's password and respond with HTTP status 200.
9. IF `POST /api/auth/change-password` is received with a `currentPassword` that does not match the current user's password, THEN THE Auth_Service SHALL respond with HTTP status 400 and an Error_Body.
10. WHEN the Finox_API receives an authenticated `GET /api/auth/me`, THE Auth_Service SHALL respond with HTTP status 200 and an `AuthUser` object containing `id`, `username`, `email`, `firstName`, `lastName`, and `fullName` derived from the Access_Token.

### Requirement 3: Per-User Data Isolation

**User Story:** As a user, I want my personal financial data visible and modifiable only by me, so that my private information stays confidential.

#### Acceptance Criteria

1. WHEN the Finox_API reads a Per_User_Resource collection, THE Finox_API SHALL return only rows whose owner equals the current request User_Id.
2. WHEN the Finox_API creates a Per_User_Resource row, THE Finox_API SHALL set the row owner to the current request User_Id.
3. IF a request targets a Per_User_Resource row by `id` whose owner does not equal the current request User_Id, THEN THE Finox_API SHALL respond with HTTP status 404 and an Error_Body.
4. WHEN the Finox_API updates or deletes a Per_User_Resource row, THE Finox_API SHALL restrict the operation to rows whose owner equals the current request User_Id.
5. THE Finox_API SHALL ignore any client-supplied owner identifier in a request body and SHALL derive ownership solely from the Access_Token User_Id.

### Requirement 4: Generic CRUD Contract

**User Story:** As a frontend developer, I want every collection resource to follow one consistent REST contract, so that the existing generic API service works without per-resource changes.

#### Acceptance Criteria

1. WHEN the Finox_API receives `GET /api/{resource}` for a collection resource, THE Finox_API SHALL respond with HTTP status 200 and a JSON array of the resource objects.
2. WHEN the Finox_API receives `POST /api/{resource}` with a resource body that omits an `id`, THE Finox_API SHALL generate a unique string `id`, persist the resource, and respond with HTTP status 201 and the created resource including the generated `id`.
3. WHEN the Finox_API receives `PUT /api/{resource}/{id}` for an existing resource, THE Finox_API SHALL update the resource and respond with HTTP status 200 and the updated resource.
4. IF the Finox_API receives `PUT /api/{resource}/{id}` for an `id` that does not exist within the current request scope, THEN THE Finox_API SHALL respond with HTTP status 404 and an Error_Body.
5. WHEN the Finox_API receives `DELETE /api/{resource}/{id}` for an existing resource, THE Finox_API SHALL delete the resource and respond with HTTP status 204 and an empty body.
6. IF the Finox_API receives `DELETE /api/{resource}/{id}` for an `id` that does not exist within the current request scope, THEN THE Finox_API SHALL respond with HTTP status 404 and an Error_Body.
7. WHEN the Finox_API receives `POST /api/{resource}/bulk-delete` with a body `{ "ids": string[] }`, THE Finox_API SHALL delete every listed resource that exists within the current request scope and respond with HTTP status 200.

### Requirement 5: Data Format and Convention Compliance

**User Story:** As a frontend developer, I want the API to emit the exact data conventions the UI expects, so that values render correctly without transformation.

#### Acceptance Criteria

1. THE Finox_API SHALL represent every resource identifier as a JSON string value.
2. THE Finox_API SHALL format date-only fields as `YYYY-MM-DD` strings.
3. THE Finox_API SHALL format datetime fields as ISO-8601 strings.
4. THE Finox_API SHALL represent every enumerated field value defined as uppercase in `docs/openapi.yaml` as an uppercase string.
5. WHERE a monetary resource field has no client-supplied currency, THE Finox_API SHALL default the currency to `BDT`.
6. THE Finox_API SHALL return each successful resource response as the resource JSON without a wrapper envelope, except for endpoints whose contract defines a wrapper object.

### Requirement 6: Standard Error Handling

**User Story:** As a frontend developer, I want a consistent error response shape and standard HTTP status codes, so that the client handles failures predictably.

#### Acceptance Criteria

1. WHEN the Finox_API returns any error response, THE Finox_API SHALL return an Error_Body containing a string `error` code and a human-readable `message`.
2. IF a request body fails validation, THEN THE Finox_API SHALL respond with HTTP status 400 and an Error_Body describing the validation failure in `details`.
3. IF an authenticated user requests a resource that exists but is owned by a different User_Id, THEN THE Finox_API SHALL respond with HTTP status 404 and an Error_Body.
4. IF the Finox_API encounters an unhandled server error, THEN THE Finox_API SHALL respond with HTTP status 500 and an Error_Body that excludes stack traces and internal implementation details.
5. THE Finox_API SHALL set the `Content-Type` response header to `application/json` for every Error_Body.

### Requirement 7: Database Seeding from Demo Data

**User Story:** As a backend operator, I want the database seeded from the existing demo JSON files, so that catalog data and example records match the shapes the frontend already expects.

#### Acceptance Criteria

1. WHEN the Finox_API initializes against an empty database, THE Finox_API SHALL populate Global_Catalog_Resource tables from the corresponding files in `public/demo/`.
2. THE Finox_API SHALL seed banks and bank products from `bank-products.json`.
3. THE Finox_API SHALL seed bank profiles, insurance profiles, and AMC profiles from `institutions.json`.
4. THE Finox_API SHALL seed insurance companies and insurance products from `insurance-products.json`.
5. THE Finox_API SHALL seed AMCs and mutual funds from `mutual-funds.json`.
6. THE Finox_API SHALL seed investment platforms from `investments.json`.
7. THE Finox_API SHALL seed news articles from `financial-news.json`.
8. THE Finox_API SHALL seed Tracker_Meta values from `tracker-meta.json`.
9. WHEN the Finox_API runs seeding against a database that already contains seeded catalog rows, THE Finox_API SHALL leave the existing rows unchanged.

### Requirement 8: API Documentation

**User Story:** As an API consumer, I want interactive OpenAPI documentation, so that I can explore and verify endpoints against the contract.

#### Acceptance Criteria

1. THE Finox_API SHALL publish a Swagger/OpenAPI document describing every `/api/**` endpoint.
2. THE Finox_API SHALL expose an interactive Swagger UI endpoint for browsing the published OpenAPI document.
3. THE Finox_API SHALL declare the Keycloak Bearer security scheme in the published OpenAPI document.
4. THE published OpenAPI document SHALL describe the Error_Body schema for documented error responses.

### Requirement 9: Tracker Metadata

**User Story:** As a Tracker user, I want payment methods and category names available from the API, so that the Tracker UI can populate its selectors.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/tracker/meta`, THE Finox_API SHALL respond with HTTP status 200 and a Tracker_Meta object containing `paymentMethods`, `incomeCategories`, and `expenseCategories` string arrays.

### Requirement 10: Tracker Transactions

**User Story:** As a Tracker user, I want to manage my income and expense transactions, so that I can track my personal finances.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/transactions`, THE Finox_API SHALL respond with HTTP status 200 and an array of the current user's `Transaction` objects.
2. WHERE `GET /api/transactions` includes a `type` query parameter equal to `INCOME` or `EXPENSE`, THE Finox_API SHALL return only the current user's transactions whose `type` matches the parameter.
3. WHERE `GET /api/transactions` includes a `search` query parameter, THE Finox_API SHALL return only the current user's transactions whose `title` or `remarks` contains the parameter value.
4. WHEN the Finox_API receives an authenticated `POST /api/transactions` with a valid `Transaction` body, THE Finox_API SHALL create the transaction owned by the current User_Id and respond with HTTP status 201 and the created `Transaction` including a generated `id`.
5. WHEN the Finox_API receives an authenticated `PUT /api/transactions/{id}` for a transaction owned by the current user, THE Finox_API SHALL update the transaction and respond with HTTP status 200 and the updated `Transaction`.
6. WHEN the Finox_API receives an authenticated `DELETE /api/transactions/{id}` for a transaction owned by the current user, THE Finox_API SHALL delete the transaction and respond with HTTP status 204.
7. WHEN the Finox_API receives an authenticated `POST /api/transactions/bulk-delete` with a body `{ "ids": string[] }`, THE Finox_API SHALL delete the current user's transactions whose `id` appears in the list and respond with HTTP status 200.

### Requirement 11: Tracker Categories

**User Story:** As a Tracker user, I want to manage my transaction categories, so that I can organize my income and expenses.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/categories`, THE Finox_API SHALL respond with HTTP status 200 and an array of the current user's `Category` objects.
2. WHEN the Finox_API receives an authenticated `POST /api/categories` with a body containing `name` and `type`, THE Finox_API SHALL create the category owned by the current User_Id and respond with HTTP status 201 and the created `Category` including a generated `id`.
3. IF `POST /api/categories` is received with a body missing `name` or `type`, THEN THE Finox_API SHALL respond with HTTP status 400 and an Error_Body.
4. WHEN the Finox_API receives an authenticated `PUT /api/categories/{id}` for a category owned by the current user, THE Finox_API SHALL update the category and respond with HTTP status 200 and the updated `Category`.
5. WHEN the Finox_API receives an authenticated `DELETE /api/categories/{id}` for a category owned by the current user, THE Finox_API SHALL delete the category and respond with HTTP status 204.
6. WHEN the Finox_API receives an authenticated `POST /api/categories/bulk-delete` with a body `{ "ids": string[] }`, THE Finox_API SHALL delete the current user's categories whose `id` appears in the list and respond with HTTP status 200.

### Requirement 12: Tracker Accounts

**User Story:** As a Tracker user, I want to manage my financial accounts, so that I can attribute transactions to specific accounts.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/accounts`, THE Finox_API SHALL respond with HTTP status 200 and an array of the current user's `Account` objects.
2. WHEN the Finox_API receives an authenticated `POST /api/accounts` with a body containing `name`, `type`, and `balance`, THE Finox_API SHALL create the account owned by the current User_Id and respond with HTTP status 201 and the created `Account` including a generated `id`.
3. IF `POST /api/accounts` is received with a body missing `name`, `type`, or `balance`, THEN THE Finox_API SHALL respond with HTTP status 400 and an Error_Body.
4. WHERE a created `Account` omits the `currency` field, THE Finox_API SHALL set the account `currency` to `BDT`.
5. WHEN the Finox_API receives an authenticated `PUT /api/accounts/{id}` for an account owned by the current user, THE Finox_API SHALL update the account and respond with HTTP status 200 and the updated `Account`.
6. WHEN the Finox_API receives an authenticated `DELETE /api/accounts/{id}` for an account owned by the current user, THE Finox_API SHALL delete the account and respond with HTTP status 204.
7. WHEN the Finox_API receives an authenticated `POST /api/accounts/bulk-delete` with a body `{ "ids": string[] }`, THE Finox_API SHALL delete the current user's accounts whose `id` appears in the list and respond with HTTP status 200.

### Requirement 13: Tracker Budgets

**User Story:** As a Tracker user, I want to manage category budgets, so that I can plan and monitor my spending.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/budgets`, THE Finox_API SHALL respond with HTTP status 200 and an array of the current user's `Budget` objects.
2. WHEN the Finox_API receives an authenticated `POST /api/budgets` with a body containing `category`, `allocatedAmount`, and `period`, THE Finox_API SHALL create the budget owned by the current User_Id and respond with HTTP status 201 and the created `Budget` including a generated `id`.
3. IF `POST /api/budgets` is received with a body missing `category`, `allocatedAmount`, or `period`, THEN THE Finox_API SHALL respond with HTTP status 400 and an Error_Body.
4. WHEN the Finox_API receives an authenticated `PUT /api/budgets/{id}` for a budget owned by the current user, THE Finox_API SHALL update the budget and respond with HTTP status 200 and the updated `Budget`.
5. WHEN the Finox_API receives an authenticated `DELETE /api/budgets/{id}` for a budget owned by the current user, THE Finox_API SHALL delete the budget and respond with HTTP status 204.

### Requirement 14: Bank Catalog

**User Story:** As a user comparing banking products, I want to browse banks, their products, and their profiles, so that I can make informed banking decisions.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/banks`, THE Finox_API SHALL respond with HTTP status 200 and an array of `Bank` objects.
2. WHEN the Finox_API receives an authenticated `GET /api/banks/products`, THE Finox_API SHALL respond with HTTP status 200 and an array of `BankProduct` objects.
3. WHERE `GET /api/banks/products` includes a `category` query parameter equal to `SAVINGS`, `LOAN`, `FDR`, or `DPS`, THE Finox_API SHALL return only bank products whose `category` matches the parameter.
4. WHERE `GET /api/banks/products` includes a `bankId` query parameter, THE Finox_API SHALL return only bank products whose `bankId` matches the parameter.
5. WHEN the Finox_API receives an authenticated `GET /api/banks/profiles`, THE Finox_API SHALL respond with HTTP status 200 and an array of `BankProfile` objects.
6. WHEN the Finox_API receives an authenticated `GET /api/banks/{id}` for an existing bank profile, THE Finox_API SHALL respond with HTTP status 200 and the matching `BankProfile`.
7. IF `GET /api/banks/{id}` is received with an `id` that matches no bank profile, THEN THE Finox_API SHALL respond with HTTP status 404 and an Error_Body.

### Requirement 15: Insurance Catalog

**User Story:** As a user comparing insurance products, I want to browse insurance companies, their products, and their profiles, so that I can make informed insurance decisions.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/insurance/companies`, THE Finox_API SHALL respond with HTTP status 200 and an array of `InsuranceCompany` objects.
2. WHEN the Finox_API receives an authenticated `GET /api/insurance/products`, THE Finox_API SHALL respond with HTTP status 200 and an array of `InsuranceProduct` objects.
3. WHERE `GET /api/insurance/products` includes a `category` query parameter equal to `LIFE`, `HEALTH`, `VEHICLE`, `PROPERTY`, `CHILD`, or `PENSION`, THE Finox_API SHALL return only insurance products whose `category` matches the parameter.
4. WHERE `GET /api/insurance/products` includes a `companyId` query parameter, THE Finox_API SHALL return only insurance products whose `companyId` matches the parameter.
5. WHEN the Finox_API receives an authenticated `GET /api/insurance/profiles`, THE Finox_API SHALL respond with HTTP status 200 and an array of `InsuranceProfile` objects.

### Requirement 16: Mutual Funds Catalog

**User Story:** As a user comparing mutual funds, I want to browse AMCs, funds, and AMC profiles, so that I can make informed investment decisions.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/mutual-funds/amcs`, THE Finox_API SHALL respond with HTTP status 200 and an array of `AMC` objects.
2. WHEN the Finox_API receives an authenticated `GET /api/mutual-funds`, THE Finox_API SHALL respond with HTTP status 200 and an array of `MutualFund` objects.
3. WHERE `GET /api/mutual-funds` includes a `category` query parameter equal to `GROWTH`, `BALANCED`, or `FIXED_INCOME`, THE Finox_API SHALL return only funds whose `category` matches the parameter.
4. WHERE `GET /api/mutual-funds` includes a `risk` query parameter equal to `LOW`, `MODERATE`, or `HIGH`, THE Finox_API SHALL return only funds whose `riskLevel` matches the parameter.
5. WHERE `GET /api/mutual-funds` includes an `amcId` query parameter, THE Finox_API SHALL return only funds whose `amcId` matches the parameter.
6. WHEN the Finox_API receives an authenticated `GET /api/mutual-funds/profiles`, THE Finox_API SHALL respond with HTTP status 200 and an array of `AMCProfile` objects.

### Requirement 17: Investment Platforms and Campaigns

**User Story:** As an investment user, I want to view ad platforms and manage my campaigns with analytics, so that I can track my investment performance.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/investment/platforms`, THE Finox_API SHALL respond with HTTP status 200 and an array of `Platform` objects.
2. WHEN the Finox_API receives an authenticated `GET /api/investment/campaigns`, THE Finox_API SHALL respond with HTTP status 200 and an array of the current user's `Campaign` objects.
3. WHERE `GET /api/investment/campaigns` includes a `status` query parameter equal to `ACTIVE`, `PAUSED`, or `COMPLETED`, THE Finox_API SHALL return only the current user's campaigns whose `status` matches the parameter.
4. WHERE `GET /api/investment/campaigns` includes a `platformId` query parameter, THE Finox_API SHALL return only the current user's campaigns whose `platformId` matches the parameter.
5. WHEN the Finox_API receives an authenticated `POST /api/investment/campaigns` with a valid `Campaign` body, THE Finox_API SHALL create the campaign owned by the current User_Id and respond with HTTP status 201 and the created `Campaign` including a generated `id`.
6. WHEN the Finox_API receives an authenticated `PUT /api/investment/campaigns/{id}` for a campaign owned by the current user, THE Finox_API SHALL update the campaign and respond with HTTP status 200 and the updated `Campaign`.
7. WHEN the Finox_API receives an authenticated `DELETE /api/investment/campaigns/{id}` for a campaign owned by the current user, THE Finox_API SHALL delete the campaign and respond with HTTP status 204.

### Requirement 18: News and Learn Catalog

**User Story:** As a user, I want to read financial articles with categories and full detail bodies, so that I can learn and stay informed.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/news`, THE Finox_API SHALL respond with HTTP status 200 and a `NewsResponse` object containing a `categories` string array and an `articles` array.
2. WHERE `GET /api/news` includes a `category` query parameter, THE Finox_API SHALL return only articles whose `category` matches the parameter.
3. WHERE `GET /api/news` includes a `search` query parameter, THE Finox_API SHALL return only articles whose `title` or `excerpt` contains the parameter value.
4. WHEN the Finox_API receives an authenticated `GET /api/news/{id}` for an existing article, THE Finox_API SHALL respond with HTTP status 200 and the matching `Article` including its full `content` body.
5. IF `GET /api/news/{id}` is received with an `id` that matches no article, THEN THE Finox_API SHALL respond with HTTP status 404 and an Error_Body.

### Requirement 19: Calendar Events

**User Story:** As a user, I want to manage my financial calendar events, so that I can track payments, meetings, reminders, and deadlines.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/calendar/events`, THE Finox_API SHALL respond with HTTP status 200 and an array of the current user's `CalendarEvent` objects.
2. WHERE `GET /api/calendar/events` includes a `from` query parameter, THE Finox_API SHALL return only the current user's events whose `date` is on or after the `from` value.
3. WHERE `GET /api/calendar/events` includes a `to` query parameter, THE Finox_API SHALL return only the current user's events whose `date` is on or before the `to` value.
4. WHEN the Finox_API receives an authenticated `POST /api/calendar/events` with a body containing `title`, `date`, and `type`, THE Finox_API SHALL create the event owned by the current User_Id and respond with HTTP status 201 and the created `CalendarEvent` including a generated `id`.
5. IF `POST /api/calendar/events` is received with a body missing `title`, `date`, or `type`, THEN THE Finox_API SHALL respond with HTTP status 400 and an Error_Body.
6. WHEN the Finox_API receives an authenticated `DELETE /api/calendar/events/{id}` for an event owned by the current user, THE Finox_API SHALL delete the event and respond with HTTP status 204.

### Requirement 20: Messages

**User Story:** As a user, I want to exchange chat messages with other users, so that I can communicate within the app.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/messages/conversations`, THE Finox_API SHALL respond with HTTP status 200 and an array of `Conversation` objects for the current user, each containing `user`, `lastMessage`, `lastMessageTime`, and `unreadCount`.
2. WHEN the Finox_API receives an authenticated `GET /api/messages/contacts`, THE Finox_API SHALL respond with HTTP status 200 and an array of `ChatUser` objects.
3. WHEN the Finox_API receives an authenticated `GET /api/messages` with a required `userId` query parameter, THE Finox_API SHALL respond with HTTP status 200 and an array of `Message` objects exchanged between the current user and the peer identified by `userId`.
4. IF `GET /api/messages` is received without a `userId` query parameter, THEN THE Finox_API SHALL respond with HTTP status 400 and an Error_Body.
5. WHEN the Finox_API receives an authenticated `POST /api/messages` with a body containing `receiverId` and `content`, THE Finox_API SHALL create a message with `senderId` set to the current User_Id and respond with HTTP status 201 and the created `Message`.
6. WHEN the Finox_API receives an authenticated `POST /api/messages/read` with a body containing `userId`, THE Finox_API SHALL mark as read every message sent from the peer `userId` to the current user and respond with HTTP status 200.

### Requirement 21: AI Advisor

**User Story:** As a user, I want a chat-based financial advisor that responds based on my real data, so that I receive personalized financial advice.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `POST /api/advisor/chat` with a body containing `message`, THE Finox_API SHALL compute advice from the current user's transactions, accounts, budgets, and campaigns and respond with HTTP status 200 and an Advisor_Message whose `role` is `assistant` and whose `content` is Markdown.
2. IF `POST /api/advisor/chat` is received with a body missing `message`, THEN THE Finox_API SHALL respond with HTTP status 400 and an Error_Body.
3. WHEN the Finox_API processes `POST /api/advisor/chat`, THE Finox_API SHALL persist the user message and the assistant response to the current user's advisor history.
4. WHEN the Finox_API receives an authenticated `GET /api/advisor/history`, THE Finox_API SHALL respond with HTTP status 200 and an array of the current user's Advisor_Message objects.

### Requirement 22: User Profile and Settings

**User Story:** As a user, I want to view and update my profile and settings, so that I can manage my account preferences.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/user/profile`, THE Finox_API SHALL respond with HTTP status 200 and the current user's `UserProfile`.
2. WHEN the Finox_API receives an authenticated `PUT /api/user/profile` with a partial `UserProfile` body, THE Finox_API SHALL update the supplied fields of the current user's profile and respond with HTTP status 200 and the updated `UserProfile`.
3. WHEN the Finox_API receives an authenticated `GET /api/user/settings`, THE Finox_API SHALL respond with HTTP status 200 and the current user's `UserSettings` containing `notifications`, `privacy`, and `display` groups.
4. WHEN the Finox_API receives an authenticated `PUT /api/user/settings` with a `UserSettings` body, THE Finox_API SHALL update the current user's settings and respond with HTTP status 200 and the updated `UserSettings`.

### Requirement 23: Dashboard Aggregation

**User Story:** As a user, I want an aggregated financial dashboard, so that I can see my overall financial position at a glance.

#### Acceptance Criteria

1. WHEN the Finox_API receives an authenticated `GET /api/dashboard`, THE Finox_API SHALL respond with HTTP status 200 and a Dashboard_Data object containing `summary`, `allocations`, `recentTransactions`, `notifications`, and `cashFlow`.
2. WHEN the Finox_API computes the Dashboard_Data `summary`, THE Finox_API SHALL derive `totalBalance`, `monthlyIncome`, `monthlyExpense`, and `savingsRate` from the current user's accounts and transactions.
3. WHEN the Finox_API computes the Dashboard_Data `cashFlow`, THE Finox_API SHALL derive the income, expense, and savings figures from the current user's transactions.
