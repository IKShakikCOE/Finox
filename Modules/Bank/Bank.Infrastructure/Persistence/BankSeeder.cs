using Bank.Domain;
using Microsoft.EntityFrameworkCore;

namespace Bank.Infrastructure.Persistence;

public static class BankSeeder
{
    public static async Task SeedAsync(BankDbContext db)
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
            var banks = new List<BankEntity>
            {
                new BankEntity { Id = "brac-bank", Name = "BRAC Bank PLC", Logo = "brac-logo.png" },
                new BankEntity { Id = "dutch-bangla-bank", Name = "Dutch-Bangla Bank PLC", Logo = "dbbl-logo.png" },
                new BankEntity { Id = "city-bank", Name = "City Bank PLC", Logo = "city-logo.png" },
                new BankEntity { Id = "sonali-bank", Name = "Sonali Bank PLC", Logo = "sonali-logo.png" }
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

        await db.SaveChangesAsync();
    }
}
