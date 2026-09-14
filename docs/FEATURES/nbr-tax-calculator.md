# 📋 Feature Spec: NBR Income Tax & Tax Rebate Engine

## 1. Overview & Statutory Context
This engine implements the progressive personal income tax calculation rules and allowable investment tax rebate formulas issued by the **National Board of Revenue (NBR), Government of Bangladesh** under the relevant Finance Act.

---

## 2. Taxpayer Exemption Categories

| Category Code | Label | Tax-Free Threshold (BDT) |
|---|---|---|
| `MALE` | General Male Taxpayer | ৳ 3,50,000 |
| `FEMALE_SENIOR` | Female / Senior Citizen (Age 65+) | ৳ 4,00,000 |
| `SPECIALLY_ABLED`| Physically Challenged / Disabled | ৳ 4,75,000 |
| `FREEDOM_FIGHTER`| Gazetted War-Wounded Freedom Fighter | ৳ 5,00,000 |
| `THIRD_GENDER` | Third Gender (Hijra) Taxpayer | ৳ 4,75,000 |

*Parents or legal guardians of disabled children receive an additional ৳ 50,000 exemption per child.*

---

## 3. Progressive Tax Slabs Calculation

For a taxable annual income $I$:

1. **Slab 1 (Zero Rate)**: First `[Exemption Threshold]` $\rightarrow$ **0%**
2. **Slab 2**: Next ৳ 1,00,000 $\rightarrow$ **5%**
3. **Slab 3**: Next ৳ 4,00,000 $\rightarrow$ **10%**
4. **Slab 4**: Next ৳ 5,00,000 $\rightarrow$ **15%**
5. **Slab 5**: Next ৳ 5,00,000 $\rightarrow$ **20%**
6. **Slab 6**: Remaining balance $\rightarrow$ **25%**

$$\text{Gross Tax} = \sum (\text{Taxable in Slab}_i \times \text{Rate}_i)$$

---

## 4. Minimum Tax Rules
If a taxpayer's taxable income exceeds the exemption threshold, the calculated tax liability cannot be less than the minimum tax based on geographical location:
* **Dhaka & Chittagong City Corporation areas**: ৳ 5,000
* **Other City Corporation areas**: ৳ 4,000
* **Non-City Corporation / Municipal / Rural areas**: ৳ 3,000

---

## 5. Investment Tax Rebate Formula (কর রেয়াত)

### 5.1 Eligible Investment Ceiling
The maximum eligible investment for claiming tax rebate is the **lowest** of:
1. Actual allowable investments made (Sanchayapatra + DPS + Life Insurance + Mutual Funds)
2. **20% of Total Taxable Income**
3. **৳ 1,00,00,000** (One Crore BDT)

*Note: Bank DPS deposit is capped at a maximum of ৳ 1,20,000 per year eligible for tax rebate.*

### 5.2 Rebate Calculation
$$\text{Tax Rebate} = \text{Allowable Investment} \times 15\%$$

### 5.3 Final Net Tax Payable
$$\text{Net Tax Payable} = \max(\text{Gross Tax} - \text{Tax Rebate}, \text{Minimum Tax})$$

---

## 6. Edge Cases & Validation Rules
1. If $\text{Gross Tax} \le 0$, net tax payable is ৳ 0 (no minimum tax applies if total income is below threshold).
2. Tax rebate cannot reduce tax liability below the statutory minimum tax.
3. TDS (Tax Deducted at Source) already paid on salary or bank interest is adjusted against net tax payable.
