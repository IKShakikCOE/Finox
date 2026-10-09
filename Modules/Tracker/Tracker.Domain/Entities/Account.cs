using Finox.Shared.Domain;

namespace Tracker.Domain;

/// <summary>
/// User's financial account with enum-typed account kind and proper decimal precision.
/// Required: name, type, balance. Currency defaults to BDT.
/// </summary>
public sealed class Account : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "BDT";

    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>Transactions linked to this account.</summary>
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
