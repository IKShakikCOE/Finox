# 📋 Feature Spec: Web Crawler & Ingestion Engine

## 1. Overview
The Crawler module automatedly extracts, parses, and synchronizes dynamic banking interest rates, mutual fund Net Asset Values (NAV), and insurance premium schedules from external institutional websites and PDF circulars.

---

## 2. Crawler Life Cycle & Governance

```text
  [Registered Source]
           │
           ▼ (Initial State: UNAPPROVED)
  [Admin Review] ──(Rejection)──► [Archived]
           │
           ▼ (Approval by Admin)
      [APPROVED]
           │
           ▼ (Scheduled or On-Demand Trigger)
     [Job Enqueued]
           │
           ▼
     [Fetch & Parse] ──(Error)──► [Failed Job Log]
           │
           ▼ (Success)
  [Update Catalog DB]
```

### 2.1 Governance Rules
1. **No Rogue Scraping**: A crawler source is **NEVER** scraped unless an administrator explicitly approves it (`ApprovalStatus = 'APPROVED'`).
2. **Rate Limiting & Politeness**: Default timeout is 30 seconds; minimum interval between recurring runs is 60 minutes.
3. **Audit Trail**: Every execution records start time, completion time, extracted record count, and raw error output in `crawl_jobs`.

---

## 3. Crawler Domain Types

### 3.1 Content Formats (`Kind`)
* `HTML`: Web pages parsed via HTML agility pack / angle sharp selectors.
* `PDF`: Schedule circulars and Bangladesh Bank statutory notices.

### 3.2 Target Domains (`Domain`)
* `BANK_PRODUCT`: Savings, FDR, and DPS rate sheets.
* `INSURANCE_PRODUCT`: Policy coverage, terms, and premiums.
* `MUTUAL_FUND`: Daily/weekly AMC NAV announcements.

---

## 4. API Endpoints (Admin Protected)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/crawler/sources` | List all registered crawl sources with status |
| `POST` | `/api/crawler/sources` | Register a new target URL and domain |
| `POST` | `/api/crawler/sources/{id}/approve` | Admin approval for scraping |
| `PUT` | `/api/crawler/sources/{id}/schedule` | Set recurring interval (60 to 43,200 minutes) |
| `POST` | `/api/crawler/sources/{id}/run` | Trigger immediate on-demand scrape |
| `GET` | `/api/crawler/sources/{id}/jobs` | View historical execution logs and errors |
