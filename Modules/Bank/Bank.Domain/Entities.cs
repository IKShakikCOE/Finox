using Finox.Shared.Domain;

namespace Bank.Domain;

public sealed class BankEntity : IEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Logo { get; set; }
}

public sealed class BankProduct : IEntity
{
    public string Id { get; set; } = string.Empty;
    public string BankId { get; set; } = string.Empty;
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
    public string Id { get; set; } = string.Empty;
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
