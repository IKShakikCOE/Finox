using Finox.Shared.Domain;

namespace MutualFunds.Domain;

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
