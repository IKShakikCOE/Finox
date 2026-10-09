using Finox.Shared.Domain;

namespace Tracker.Domain;

/// <summary>
/// Tracker metadata stored per-user: custom payment methods and category name lists.
/// Served at GET /api/tracker/meta. Each user gets their own copy seeded from defaults.
/// </summary>
public sealed class TrackerMeta : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public List<string> PaymentMethods { get; set; } = new();
    public List<string> IncomeCategories { get; set; } = new();
    public List<string> ExpenseCategories { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
