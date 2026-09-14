# 📋 Feature Spec: Salary Planner & Career Growth

## 1. Overview
The Salary Planner decomposes corporate gross salary packages into statutory components under Bangladesh employment standards and NBR tax exemptions. It calculates exact monthly take-home net pay and tracks historical salary growth across jobs.

---

## 2. Salary Breakdown Structure

A typical Bangladeshi corporate gross salary ($G$) is decomposed into:

$$G = \text{Basic} + \text{House Rent} + \text{Medical} + \text{Conveyance} + \text{Special Allowances}$$

### Standard Industry Ratios
* **Basic Salary**: Typically 50% - 60% of Gross Salary.
* **House Rent Allowance (HRA)**: Typically 20% - 25% of Gross Salary.
* **Medical Allowance**: Typically 10% of Gross Salary.
* **Conveyance Allowance**: Typically 5% - 10% of Gross Salary.

---

## 3. Net Take-Home Calculation

$$\text{Net Take-Home Pay} = G - (\text{PF Deduction} + \text{TDS (Tax Deducted at Source)} + \text{Other Deductions})$$

### 3.1 Deductions
1. **Provident Fund (PF)**: Typically 10% of Basic Salary deducted from employee pay.
2. **Monthly Tax at Source (TDS)**: Estimated Annual Tax divided by 12.

---

## 4. Career Salary Progression Timeline

Tracks historical compensation changes, job transitions, and increments:

```typescript
interface SalaryPhase {
    id: string;
    jobTitle: string;
    companyName: string;
    startDate: string;              // YYYY-MM
    endDate?: string;               // Empty if current
    grossSalaryMonthly: number;
    basicSalaryMonthly: number;
    incrementPercentage?: number;   // Calculated vs previous phase
}
```

---

## 5. Visualizations & Metrics
* **Monthly Take-Home Ratio**: Percentage of gross salary received as liquid cash.
* **Career Growth Graph**: Cumulative annual earnings and compound salary growth rate.
