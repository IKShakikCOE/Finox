using Finox.Shared.Domain;

namespace Tracker.Domain;

/// <summary>
/// User's category budget with FK to Category, enum-typed period,
/// and proper date range support.
/// </summary>
public sealed class Budget : IOwnedEntity
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    /// <summary>FK to categories table.</summary>
    public string CategoryId { get; set; } = string.Empty;
    public Category? Category { get; set; }

    public decimal AllocatedAmount { get; set; }
    public BudgetPeriod Period { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }

    /// <summary>Alert threshold as percentage (e.g., 80 means alert at 80% usage).</summary>
    public int? AlertThreshold { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
