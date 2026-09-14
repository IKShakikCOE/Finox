# 📋 Feature Spec: Sanchayapatra (সঞ্চয়পত্র) Portfolio Management

## 1. Overview
The Sanchayapatra module manages government savings certificates issued by the Internal Resources Division (IRD) and National Savings Directorate (জাতীয় সঞ্চয় অধিদপ্তর). It tracks principal balances, profit payout schedules, and maturity dates.

---

## 2. Certificate Types & Mathematical Rules

### 2.1 Paribar Sanchayapatra (পরিবার সঞ্চয়পত্র)
* **Tenure**: 5 Years (60 Months).
* **Payout Frequency**: Monthly.
* **Baseline Profit Rate**: ~11.52% (annualized, subject to slab tiering above ৳ 15 Lakh).
* **Monthly Profit Calculation**:
  $$\text{Monthly Profit (Gross)} = \frac{\text{Principal} \times \text{Annual Rate}}{12}$$
* **Advance Income Tax (AIT)**:
  - If investment $\le$ ৳ 5,00,000: 5% AIT.
  - If investment $>$ ৳ 5,00,000: 10% AIT.
  $$\text{Net Monthly Payout} = \text{Monthly Profit (Gross)} \times (1 - \text{AIT Rate})$$

### 2.2 3-Month Profit Sanchayapatra (৩ মাস অন্তর মুনাফাভিত্তিক সঞ্চয়পত্র)
* **Tenure**: 3 Years (36 Months).
* **Payout Frequency**: Quarterly (Every 3 months).
* **Baseline Profit Rate**: ~11.04% per annum.
* **Quarterly Profit Calculation**:
  $$\text{Quarterly Profit (Gross)} = \frac{\text{Principal} \times \text{Annual Rate}}{4}$$

---

## 3. Data Schema & Model

```typescript
interface SanchayapatraHolding {
    id: string;                      // e.g., "SP-101"
    certificateType: string;         // e.g., "Paribar Sanchayapatra"
    issueDate: string;               // YYYY-MM-DD
    tenureYears: number;             // 3 or 5
    principalAmount: number;         // BDT
    profitRatePercent: number;       // e.g., 11.52
    payoutFrequency: 'Monthly' | 'Quarterly';
    monthlyProfitAmount: number;     // Net monthly payout
    maturityDate: string;            // Calculated = issueDate + tenureYears
    status: 'ACTIVE' | 'MATURED';
}
```

---

## 4. Business Rules & Validations
1. **Premature Encashment (ভাঙানো)**: If a certificate is encashed before full maturity, profit is recalculated using lower slab interest rates according to the completed year (Year 1, 2, 3, etc.).
2. **Auto-Credit Integration**: Sanchayapatra payouts are directly credited to the user's linked bank account on the scheduled monthly/quarterly date.
3. **Maturity Alert**: The system generates a notification 30 days prior to the maturity date.
