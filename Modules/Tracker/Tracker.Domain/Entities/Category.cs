using Finox.Shared.Domain;

namespace Tracker.Domain;

/// <summary>
/// Transaction category with hierarchical parent/child structure.
/// System categories (is_system=true, owner_id=NULL) are global defaults visible to all users.
/// User categories (owner_id=keycloak_sub) are private additions.
/// </summary>
public sealed class Category : IOwnedEntity
{
    public Guid Id { get; set; }

    /// <summary>NULL for system/global categories, Keycloak sub for user-created ones.</summary>
    public Guid? OwnerId { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>Slug identifier for seeding and i18n (e.g., "food_dining", "groceries").</summary>
    public string? Code { get; set; }

    public FlowType Type { get; set; }

    public string? Icon { get; set; }
    public string? Color { get; set; }

    /// <summary>Self-referencing FK for sub-categories (2-level hierarchy).</summary>
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }

    /// <summary>Display order within the same parent group.</summary>
    public int SortOrder { get; set; }

    /// <summary>True for seeded default categories that all users see.</summary>
    public bool IsSystem { get; set; }

    /// <summary>Soft-disable without deleting.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Child categories (navigation).</summary>
    public ICollection<Category> Children { get; set; } = new List<Category>();

    /// <summary>Transactions linked to this category.</summary>
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    /// <summary>Budgets linked to this category.</summary>
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
