using Finox.Shared.Domain;

namespace Insurance.Domain;

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
