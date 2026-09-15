using Finox.Shared.Domain;

namespace Catalog.Domain;

public sealed class Bank : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Logo { get; set; }
}

public sealed class BankProduct : IEntity
{
    public Guid Id { get; set; }
    public Guid BankId { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // SAVINGS | LOAN | FDR | DPS
    public string Name { get; set; } = string.Empty;
    public decimal InterestRate { get; set; }
    public decimal? MinDeposit { get; set; }
    public string? Tenure { get; set; }
    public List<string> Features { get; set; } = new();
    public string? Eligibility { get; set; }
}

public sealed class BankProfile : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public int? Established { get; set; }
    public string? AuthorizedCapital { get; set; }
    public string? PaidUpCapital { get; set; }
    public string? TotalAssets { get; set; }
    public int? Branches { get; set; }
    public int? AtmBooths { get; set; }
    public int? Employees { get; set; }
    public string? Chairman { get; set; }
    public string? Md { get; set; }
    public string? Headquarters { get; set; }
    public string? SwiftCode { get; set; }
    public string? Rating { get; set; }
    public string? RatingAgency { get; set; }
    public string? RiskLevel { get; set; } // LOW | MODERATE | HIGH
    public decimal? NplRatio { get; set; }
    public List<string> Services { get; set; } = new();
    public List<string> DigitalServices { get; set; } = new();
    public string? Website { get; set; }
}

public sealed class InsuranceCompany : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class InsuranceProduct : IEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // LIFE|HEALTH|VEHICLE|PROPERTY|CHILD|PENSION
    public string Name { get; set; } = string.Empty;
    public string? PremiumRange { get; set; }
    public string? CoverageAmount { get; set; }
    public string? Tenure { get; set; }
    public string? MaturityBenefit { get; set; }
    public List<string> Features { get; set; } = new();
    public string? Eligibility { get; set; }
}

public sealed class InsuranceProfile : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public int? Established { get; set; }
    public string? PaidUpCapital { get; set; }
    public string? TotalAssets { get; set; }
    public decimal? ClaimSettlementRatio { get; set; }
    public int? Branches { get; set; }
    public int? Employees { get; set; }
    public int? Agents { get; set; }
    public string? Chairman { get; set; }
    public string? Md { get; set; }
    public string? Headquarters { get; set; }
    public string? Rating { get; set; }
    public string? RatingAgency { get; set; }
    public string? RiskLevel { get; set; }
    public decimal? SolvencyRatio { get; set; }
    public List<string> Products { get; set; } = new();
    public string? Website { get; set; }
}

public sealed class AMC : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class MutualFund : IEntity
{
    public Guid Id { get; set; }
    public Guid AmcId { get; set; }
    public string AmcName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // GROWTH | BALANCED | FIXED_INCOME
    public string Name { get; set; } = string.Empty;
    public decimal Nav { get; set; }
    public decimal ReturnRate1Y { get; set; }
    public decimal ReturnRate3Y { get; set; }
    public decimal ReturnRate5Y { get; set; }
    public decimal MinInvestment { get; set; }
    public decimal ExpenseRatio { get; set; }
    public string? FundSize { get; set; }
    public string? RiskLevel { get; set; } // LOW | MODERATE | HIGH
    public List<string> Features { get; set; } = new();
    public string? Objective { get; set; }
}

public sealed class AMCProfile : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? Established { get; set; }
    public string? PaidUpCapital { get; set; }
    public string? Aum { get; set; }
    public int? TotalFunds { get; set; }
    public string? Chairman { get; set; }
    public string? Md { get; set; }
    public string? Headquarters { get; set; }
    public string? Rating { get; set; }
    public string? RatingAgency { get; set; }
    public string? RiskLevel { get; set; }
    public string? ParentOrg { get; set; }
    public List<string> FundTypes { get; set; } = new();
    public string? InvestmentPhilosophy { get; set; }
    public string? Website { get; set; }
}

public sealed class Article : IEntity
{
    public Guid Id { get; set; }
    public string? Category { get; set; } // News | Tips | Advice | Books | Learning
    public string Title { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string? Content { get; set; } // full body (HTML/Markdown) for detail view
    public string? Author { get; set; }
    public string? Date { get; set; }
    public string? ReadTime { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Image { get; set; }
    public bool Featured { get; set; }
}

public sealed class Platform : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
}
