using Catalog.Domain;
using Microsoft.EntityFrameworkCore;

namespace Catalog.Infrastructure.Persistence;

public static class CatalogSeeder
{
    public static async Task SeedAsync(CatalogDbContext db)
    {
        if (!await db.BankProfiles.AnyAsync())
        {
            var bankProfiles = new List<BankProfile>
            {
                new BankProfile
                {
                    Id = "brac-bank",
                    Name = "BRAC Bank PLC",
                    Type = "Private Commercial Bank",
                    Established = 2001,
                    AuthorizedCapital = "2,000 Crore",
                    PaidUpCapital = "1,608 Crore",
                    TotalAssets = "52,400 Crore",
                    Branches = 187,
                    AtmBooths = 375,
                    Employees = 7500,
                    Chairman = "Meheriar M. Hasan",
                    Md = "Selim R. F. Hussain",
                    Headquarters = "Dhaka, Bangladesh",
                    SwiftCode = "BRAKBDDH",
                    Rating = "AAA",
                    RatingAgency = "CRAB",
                    RiskLevel = "LOW",
                    NplRatio = 3.1m,
                    Services = new List<string> { "Retail Banking", "SME Banking", "Corporate Banking", "Treasury" },
                    DigitalServices = new List<string> { "Astha App", "iBank", "SMS Banking" },
                    Website = "https://www.bracbank.com"
                },
                new BankProfile
                {
                    Id = "dutch-bangla-bank",
                    Name = "Dutch-Bangla Bank PLC",
                    Type = "Private Commercial Bank",
                    Established = 1995,
                    AuthorizedCapital = "1,500 Crore",
                    PaidUpCapital = "800 Crore",
                    TotalAssets = "58,900 Crore",
                    Branches = 238,
                    AtmBooths = 4900,
                    Employees = 10200,
                    Chairman = "Sayeed H. Chowdhury",
                    Md = "Abul Kashem Md. Shirin",
                    Headquarters = "Dhaka, Bangladesh",
                    SwiftCode = "DBBLBDDH",
                    Rating = "AAA",
                    RatingAgency = "CRISL",
                    RiskLevel = "LOW",
                    NplRatio = 4.2m,
                    Services = new List<string> { "Mobile Banking (Rocket)", "Agent Banking", "Corporate Banking" },
                    DigitalServices = new List<string> { "NexusPay", "Rocket", "Internet Banking" },
                    Website = "https://www.dutchbanglabank.com"
                },
                new BankProfile
                {
                    Id = "city-bank",
                    Name = "City Bank PLC",
                    Type = "Private Commercial Bank",
                    Established = 1983,
                    AuthorizedCapital = "1,500 Crore",
                    PaidUpCapital = "1,200 Crore",
                    TotalAssets = "45,000 Crore",
                    Branches = 135,
                    AtmBooths = 320,
                    Employees = 5400,
                    Chairman = "Aziz Al Kaiser",
                    Md = "Mashrur Arefin",
                    Headquarters = "Dhaka, Bangladesh",
                    SwiftCode = "CIBLBDDH",
                    Rating = "AA+",
                    RatingAgency = "CRAB",
                    RiskLevel = "LOW",
                    NplRatio = 4.8m,
                    Services = new List<string> { "City Gem", "Islamic Banking", "Cards & Retail" },
                    DigitalServices = new List<string> { "Citytouch", "Digital Nano Loan" },
                    Website = "https://www.thecitybank.com"
                },
                new BankProfile
                {
                    Id = "sonali-bank",
                    Name = "Sonali Bank PLC",
                    Type = "State-owned Commercial Bank",
                    Established = 1972,
                    AuthorizedCapital = "1,000 Crore",
                    PaidUpCapital = "400 Crore",
                    TotalAssets = "135,000 Crore",
                    Branches = 1230,
                    AtmBooths = 450,
                    Employees = 18000,
                    Chairman = "Zaid Bakht",
                    Md = "Md. Afzal Karim",
                    Headquarters = "Dhaka, Bangladesh",
                    SwiftCode = "BSBLBDDH",
                    Rating = "AA",
                    RatingAgency = "CRISL",
                    RiskLevel = "MODERATE",
                    NplRatio = 14.5m,
                    Services = new List<string> { "Treasury", "Government Disbursements", "Agricultural Loans" },
                    DigitalServices = new List<string> { "Sonali eSheba", "Sonali eWallet" },
                    Website = "https://www.sonalibank.com.bd"
                }
            };
            await db.BankProfiles.AddRangeAsync(bankProfiles);
        }

        if (!await db.Banks.AnyAsync())
        {
            var banks = new List<Bank>
            {
                new Bank { Id = "brac-bank", Name = "BRAC Bank PLC", Logo = "brac-logo.png" },
                new Bank { Id = "dutch-bangla-bank", Name = "Dutch-Bangla Bank PLC", Logo = "dbbl-logo.png" },
                new Bank { Id = "city-bank", Name = "City Bank PLC", Logo = "city-logo.png" },
                new Bank { Id = "sonali-bank", Name = "Sonali Bank PLC", Logo = "sonali-logo.png" }
            };
            await db.Banks.AddRangeAsync(banks);
        }

        if (!await db.BankProducts.AnyAsync())
        {
            var bankProducts = new List<BankProduct>
            {
                new BankProduct
                {
                    Id = "brac-savings-1",
                    BankId = "brac-bank",
                    BankName = "BRAC Bank PLC",
                    Category = "SAVINGS",
                    Name = "Triple Benefit Savings Account",
                    InterestRate = 6.5m,
                    MinDeposit = 10000m,
                    Tenure = "Flexible",
                    Features = new List<string> { "High interest", "Free debit card", "Internet banking" },
                    Eligibility = "Age 18+ Bangladeshi resident"
                },
                new BankProduct
                {
                    Id = "dbbl-dps-1",
                    BankId = "dutch-bangla-bank",
                    BankName = "Dutch-Bangla Bank PLC",
                    Category = "DPS",
                    Name = "Deposit Pension Scheme (DPS)",
                    InterestRate = 8.0m,
                    MinDeposit = 1000m,
                    Tenure = "3 - 10 Years",
                    Features = new List<string> { "Monthly savings", "High return", "Tax rebate benefit" },
                    Eligibility = "Bangladeshi Citizen"
                },
                new BankProduct
                {
                    Id = "dbbl-fdr-1",
                    BankId = "dutch-bangla-bank",
                    BankName = "Dutch-Bangla Bank PLC",
                    Category = "FDR",
                    Name = "DBBL Fixed Deposit Scheme",
                    InterestRate = 8.75m,
                    MinDeposit = 50000m,
                    Tenure = "1 - 3 Years",
                    Features = new List<string> { "Guaranteed return", "Loan facility up to 90%", "Auto renewal option" },
                    Eligibility = "All individuals and corporate entities"
                },
                new BankProduct
                {
                    Id = "city-loan-1",
                    BankId = "city-bank",
                    BankName = "City Bank PLC",
                    Category = "LOAN",
                    Name = "City Personal Loan",
                    InterestRate = 9.5m,
                    MinDeposit = null,
                    Tenure = "1 - 5 Years",
                    Features = new List<string> { "No collateral up to 20 Lacs", "Quick processing" },
                    Eligibility = "Salaried / Self-Employed with min BDT 30k income"
                }
            };
            await db.BankProducts.AddRangeAsync(bankProducts);
        }

        if (!await db.AMCs.AnyAsync())
        {
            var amcs = new List<AMC>
            {
                new AMC { Id = "ICB", Name = "ICB Asset Management" },
                new AMC { Id = "IDLC", Name = "IDLC Asset Management" },
                new AMC { Id = "LBFL", Name = "LankaBangla Asset Management" },
                new AMC { Id = "VIPB", Name = "VIPB Asset Management" },
                new AMC { Id = "EDGE", Name = "Edge Asset Management" }
            };
            await db.AMCs.AddRangeAsync(amcs);
        }

        if (!await db.MutualFunds.AnyAsync())
        {
            var funds = new List<MutualFund>
            {
                new MutualFund
                {
                    Id = "MF001", AmcId = "ICB", AmcName = "ICB Asset Management",
                    Category = "GROWTH", Name = "ICB AMCL Unit Fund",
                    Nav = 12.45m, ReturnRate1Y = 8.5m, ReturnRate3Y = 22.0m, ReturnRate5Y = 38.0m,
                    MinInvestment = 5000m, ExpenseRatio = 2.50m, FundSize = "850 Cr", RiskLevel = "MODERATE",
                    Features = new List<string> { "Open-ended fund", "Daily NAV", "Dividend payout", "SIP available" },
                    Objective = "Long-term capital appreciation through equity investments"
                },
                new MutualFund
                {
                    Id = "MF002", AmcId = "IDLC", AmcName = "IDLC Asset Management",
                    Category = "GROWTH", Name = "IDLC Growth Fund",
                    Nav = 15.20m, ReturnRate1Y = 12.3m, ReturnRate3Y = 30.0m, ReturnRate5Y = 52.0m,
                    MinInvestment = 10000m, ExpenseRatio = 2.00m, FundSize = "620 Cr", RiskLevel = "HIGH",
                    Features = new List<string> { "Aggressive equity focus", "Top performer", "SIP from 1000/month" },
                    Objective = "Maximum capital growth through concentrated equity positions"
                },
                new MutualFund
                {
                    Id = "MF003", AmcId = "IDLC", AmcName = "IDLC Asset Management",
                    Category = "BALANCED", Name = "IDLC Balanced Fund",
                    Nav = 11.50m, ReturnRate1Y = 7.8m, ReturnRate3Y = 20.0m, ReturnRate5Y = 35.0m,
                    MinInvestment = 5000m, ExpenseRatio = 2.00m, FundSize = "380 Cr", RiskLevel = "MODERATE",
                    Features = new List<string> { "60:40 equity-debt mix", "Stable returns", "Monthly SIP" },
                    Objective = "Steady growth with controlled risk through balanced allocation"
                },
                new MutualFund
                {
                    Id = "MF004", AmcId = "LBFL", AmcName = "LankaBangla Asset Management",
                    Category = "FIXED_INCOME", Name = "LBFL Fixed Income Fund",
                    Nav = 10.20m, ReturnRate1Y = 5.5m, ReturnRate3Y = 15.0m, ReturnRate5Y = 26.0m,
                    MinInvestment = 10000m, ExpenseRatio = 1.50m, FundSize = "180 Cr", RiskLevel = "LOW",
                    Features = new List<string> { "Government bonds focus", "Stable income", "Low volatility" },
                    Objective = "Regular income with capital preservation through fixed income securities"
                }
            };
            await db.MutualFunds.AddRangeAsync(funds);
        }

        if (!await db.AMCProfiles.AnyAsync())
        {
            var amcProfiles = new List<AMCProfile>
            {
                new AMCProfile
                {
                    Id = "IDLC", Name = "IDLC Asset Management Limited", Established = 2015,
                    PaidUpCapital = "25 Crore", Aum = "1,200 Crore", TotalFunds = 5,
                    Chairman = "Aziz Al Mahmood", Md = "Rajib Kumar Dey", Headquarters = "Dhaka, Bangladesh",
                    Rating = "AAA", RatingAgency = "CRAB", RiskLevel = "LOW", ParentOrg = "IDLC Finance PLC",
                    FundTypes = new List<string> { "Growth", "Balanced", "Fixed Income", "Shariah" },
                    InvestmentPhilosophy = "Disciplined research-backed value investing focused on long-term wealth creation.",
                    Website = "https://idlc.com/asset-management"
                }
            };
            await db.AMCProfiles.AddRangeAsync(amcProfiles);
        }

        if (!await db.InsuranceCompanies.AnyAsync())
        {
            var comp = new List<InsuranceCompany>
            {
                new InsuranceCompany { Id = "metlife", Name = "MetLife Bangladesh" },
                new InsuranceCompany { Id = "delta-life", Name = "Delta Life Insurance" },
                new InsuranceCompany { Id = "green-delta", Name = "Green Delta Insurance" }
            };
            await db.InsuranceCompanies.AddRangeAsync(comp);
        }

        if (!await db.InsuranceProducts.AnyAsync())
        {
            var insProds = new List<InsuranceProduct>
            {
                new InsuranceProduct
                {
                    Id = "metlife-dps-1", CompanyId = "metlife", CompanyName = "MetLife Bangladesh",
                    Category = "LIFE", Name = "MetLife Deposit Pension Scheme (DPS)",
                    PremiumRange = "৳2,000 - ৳50,000 / month", CoverageAmount = "Up to ৳50 Lacs", Tenure = "5 - 20 Years",
                    MaturityBenefit = "Full sum assured + accumulated bonuses",
                    Features = new List<string> { "Tax rebate", "Accidental death coverage", "Critical illness rider" },
                    Eligibility = "Age 18 - 55 years"
                },
                new InsuranceProduct
                {
                    Id = "green-delta-health-1", CompanyId = "green-delta", CompanyName = "Green Delta Insurance",
                    Category = "HEALTH", Name = "Niramoy Health Insurance",
                    PremiumRange = "৳5,000 - ৳25,000 / year", CoverageAmount = "Up to ৳10 Lacs", Tenure = "1 Year (Renewable)",
                    MaturityBenefit = "Hospitalization & Surgery cashless coverage",
                    Features = new List<string> { "Cashless hospital admission", "Daycare procedures covered", "OPD discounts" },
                    Eligibility = "Age 0 - 65 years"
                }
            };
            await db.InsuranceProducts.AddRangeAsync(insProds);
        }

        if (!await db.InsuranceProfiles.AnyAsync())
        {
            var insProfiles = new List<InsuranceProfile>
            {
                new InsuranceProfile
                {
                    Id = "metlife", Name = "MetLife Bangladesh", Type = "Life Insurance", Established = 1952,
                    PaidUpCapital = "100 Crore", TotalAssets = "16,500 Crore", ClaimSettlementRatio = 98.5m,
                    Branches = 210, Employees = 3500, Agents = 15000, Chairman = "Elena Butarova", Md = "Ala Ahmad",
                    Headquarters = "Dhaka, Bangladesh", Rating = "AAA", RatingAgency = "CRAB", RiskLevel = "LOW", SolvencyRatio = 2.1m,
                    Products = new List<string> { "Life Insurance", "Health Insurance", "Education Savings", "Corporate Group Life" },
                    Website = "https://www.metlife.com.bd"
                }
            };
            await db.InsuranceProfiles.AddRangeAsync(insProfiles);
        }

        if (!await db.Articles.AnyAsync())
        {
            var articles = new List<Article>
            {
                new Article
                {
                    Id = "ART001", Category = "Tips", Title = "5 Smart Investment Strategies for Bangladesh Stock Market in 2026",
                    Excerpt = "Learn how to build a resilient investment portfolio amidst economic shifts with mutual funds and DPS.",
                    Content = "Investing in Bangladesh's financial markets requires a strategic approach. Consider diversifying across mutual funds, high-yield FDRs, and steady dividend-paying stocks...",
                    Author = "Tanvir Ahmed, CFA", Date = "2026-05-20", ReadTime = "5 min read",
                    Tags = new List<string> { "Investment", "Mutual Funds", "Bangladesh", "Stock Market" }
                },
                new Article
                {
                    Id = "ART002", Category = "Advice", Title = "How to Maximize Income Tax Rebate Through Authorized Investments",
                    Excerpt = "A complete guide on tax-saving instruments under National Board of Revenue (NBR) guidelines.",
                    Content = "Under NBR guidelines, investments in Mutual Funds, DPS, Treasury Bonds, and Life Insurance premiums qualify for direct tax rebate benefits up to 15%...",
                    Author = "Farhana Rahman, FCA", Date = "2026-05-18", ReadTime = "7 min read",
                    Tags = new List<string> { "Tax Rebate", "NBR", "DPS", "Savings" }
                }
            };
            await db.Articles.AddRangeAsync(articles);
        }

        await db.SaveChangesAsync();
    }
}
