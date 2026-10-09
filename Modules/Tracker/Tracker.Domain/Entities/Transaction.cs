using Finox.Shared.Domain;

namespace Tracker.Domain;

/// <summary>
/// A user's income or expense transaction with proper FK relationships to
/// Category and Account, enum-typed fields, and DateOnly for the transaction date.
/// </summary>
public sealed class Transaction : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public FlowType Type { get; set; }
    public DateOnly Date { get; set; }

    /// <summary>FK to categories table.</summary>
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    /// <summary>FK to accounts table.</summary>
    public Guid? AccountId { get; set; }
    public Account? Account { get; set; }

    public PaymentMethod? PaymentMethod { get; set; }
    public string? Remarks { get; set; }

    public bool IsRecurring { get; set; }
    public RecurringFrequency? RecurringFrequency { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
