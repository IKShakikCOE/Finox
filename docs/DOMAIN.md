# 🇧🇩 Finox — Financial Domain Model & Business Rules

This document outlines the core business domain, calculation formulas, and statutory concepts governing Finox. Developers should consult this document before altering any financial logic.

---

## 1. Global Localization & Currency Standards
* **Currency**: Bangladeshi Taka (`BDT`).
* **Symbol**: `৳` (Bangla Taka sign) or `Tk.`.
* **Locale Format**: `en-BD` (English Bangladesh) or `bn-BD`.
* **Precision**: Monetary values must always be represented as **high-precision decimals** (`decimal` in C#, `number` formatted via pipes in Angular). Never use floating-point types for currency.

---

## 2. Accounts & Payment Methods

| Account Type | Description | Examples |
|---|---|---|
| `CASH` | Physical currency on hand | Wallet cash, home cash reserve |
| `BANK` | Commercial or Islamic bank current/savings account | BRAC Bank Current A/C, Dutch-Bangla Savings |
| `MOBILE_BANKING` | Mobile Financial Services (MFS) licensed by Bangladesh Bank | bKash Personal/Merchant, Nagad, Rocket, Upay |
| `CREDIT_CARD` | Revolving credit lines | City Bank AMEX, Standard Chartered Visa |

---

## 3. National Savings Schemes — Sanchayapatra (জাতীয় সঞ্চয়পত্র)
Issued by the Department of National Savings (জাতীয় সঞ্চয় অধিদপ্তর) under the Internal Resources Division (IRD), Ministry of Finance.

### 3.1 Certificate Types Supported
1. **Paribar Sanchayapatra (পরিবার সঞ্চয়পত্র)**:
   - *Eligibility*: Bangladeshi adult women (18+) and male physically disabled individuals.
   - *Tenure*: 5 Years.
   - *Payout Frequency*: Monthly direct transfer via EFT to the investor's bank account.
   - *Investment Limits*: Up to ৳ 45,00,000 (single).
2. **3-Month Profit Sanchayapatra (৩ মাস অন্তর মুনাফাভিত্তিক)**:
   - *Eligibility*: All adult citizens (male/female) and institutions.
   - *Tenure*: 3 Years.
   - *Payout Frequency*: Quarterly (every 3 months).
   - *Investment Limits*: Up to ৳ 30,00,000 (single) or ৳ 60,00,000 (joint).
3. **Pensioner Sanchayapatra (পেনশনার সঞ্চয়পত্র)**:
   - *Eligibility*: Retired government, semi-government, and autonomous body employees.
   - *Payout Frequency*: Quarterly.
4. **Post Office Savings Bank (ডাকঘর সঞ্চয় ব্যাংক)**:
   - General and fixed deposit options at post offices.

### 3.2 Tax Withholding on Profit (AIT)
* Under current NBR income tax laws, profit earned from Sanchayapatra is subject to Advance Income Tax (AIT) deduction at source (usually 5% for investments up to ৳ 5 Lakh, and 10% above ৳ 5 Lakh).

---

## 4. Banking Products: DPS vs. FDR

### 4.1 Deposit Pension Scheme (DPS)
* **Mechanism**: Recurring monthly deposit of a fixed installment amount (e.g., ৳ 2,000, ৳ 5,000, ৳ 10,000) for a fixed tenure (typically 3, 5, 7, or 10 years).
* **Maturity Value**: Compounded monthly/annually.
* **Auto-Debit**: Usually debited directly from the linked savings account.

### 4.2 Fixed Deposit Receipt (FDR)
* **Mechanism**: One-time lump sum deposit placed for a designated term (e.g., 3 months, 6 months, 1 year, 3 years) at an agreed fixed interest rate.
* **Renewal Policy**: Can be configured for `Auto-Renewal` (Principal + Interest or Principal only) or non-renewing payout upon maturity.

---

## 5. Provident Fund (GPF / EPF)

| Component | Definition |
|---|---|
| **Employee Contribution** | Deducted from the monthly salary (statutorily between 5% and 25% of Basic salary). |
| **Employer Contribution** | Matching contribution provided by the employer (common in private EPF). |
| **Accumulated Interest** | Compounded annual interest announced by the government/trust. |
| **Total Fund Balance** | `Total = Employee Share + Employer Share + Accumulated Interest`. |

---

## 6. NBR Income Tax & Tax Rebate (Finance Act Framework)

### 6.1 Tax-Exempt Salary Allowances (আয়কর অব্যাহতিপ্রাপ্ত ভাতা)
Under the NBR Income Tax Act, the following portions of gross salary are excluded from taxable income:
* **House Rent Allowance (বাড়িভাড়া)**: Excluded up to **50% of Basic Salary** or **৳ 3,00,000 per year** (whichever is lower).
* **Medical Allowance (চিকিৎসা ভাতা)**: Excluded up to **10% of Basic Salary** or **৳ 1,20,000 per year** (whichever is lower).
* **Conveyance Allowance (যাতায়াত ভাতা)**: Excluded up to **৳ 30,00,0 per year**.

### 6.2 Progressive Tax Slabs (General Male Baseline)
* **1st ৳ 3,50,000**: **0%** (Zero Tax)
* **Next ৳ 1,00,000**: **5%**
* **Next ৳ 4,00,000**: **10%**
* **Next ৳ 5,00,000**: **15%**
* **Next ৳ 5,00,000**: **20%**
* **Remaining Income**: **25%**

### 6.3 Initial Exemption Thresholds by Category
* **General Male**: ৳ 3,50,000
* **Female & Senior Citizens (65+ Years)**: ৳ 4,00,000
* **Third Gender & Specially Abled (প্রতিবন্ধী)**: ৳ 4,75,000
* **Gazetted War-Wounded Freedom Fighters (গেজেটভুক্ত বীর মুক্তিযোদ্ধা)**: ৳ 5,00,000

### 6.4 Investment Tax Rebate (বিনিয়োগ কর রেয়াত)
Taxpayers can reduce their gross tax liability by investing in approved financial instruments:
1. **Eligible Investment Limit**: Maximum up to **20% of Total Taxable Income** or **৳ 1,00,00,000** (whichever is lower).
   - Approved avenues: Sanchayapatra, Bank DPS (maximum ৳ 1,20,000/year eligible for rebate), Life Insurance premiums, Government Securities, Mutual Funds, and Stock Market shares.
2. **Rebate Percentage**: **15%** of allowable investment amount.

---

## 7. Debt Tracking (পাওনা ও দেনা)
* **Money Lent (পাওনা / Receivable)**:
  - Cash or electronic funds lent to friends, relatives, or business partners.
  - Represents an asset to the user.
  - Tracks: Debtor contact, principal amount, expected settlement date, installments received, balance outstanding.
* **Money Borrowed (দেনা / Payable)**:
  - Personal loans or emergency borrowings taken from others.
  - Represents a liability to the user.
  - Tracks: Creditor contact, principal amount, due date, installments repaid, status (`ACTIVE`, `PARTIALLY_SETTLED`, `SETTLED`).

---

## 8. Budgeting & Budget Rollover
* **Budget Period**: Monthly (primary), Quarterly, or Annual.
* **Threshold Alert**: Warning triggered when spending reaches **80%** of allocated budget.
* **Rollover Logic**:
  - *Surplus Rollover*: Unspent budget from Month $N$ is added as bonus spending cushion to Month $N+1$.
  - *Deficit Rollover*: Overspent amount in Month $N$ is deducted from Month $N+1$ limit.

---

## 9. Ad & Investment Campaigns (Digital Marketing)
Used by small businesses, agencies, and e-commerce operators:
* **Impressions & Clicks**: Exposure metrics.
* **CPC (Cost Per Click)**: $\text{CPC} = \frac{\text{Total Spent}}{\text{Total Clicks}}$
* **CTR (Click-Through Rate)**: $\text{CTR} = \frac{\text{Clicks}}{\text{Impressions}} \times 100\%$
* **ROAS (Return on Ad Spend)**: $\text{ROAS} = \frac{\text{Revenue}}{\text{Total Spent}}$
