using Finox.Shared.Domain;
using System.Text.Json.Serialization;

namespace Tracker.Domain;

public sealed class GoalTransaction : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public Guid GoalId { get; set; }
    
    [JsonIgnore]
    public Goal? Goal { get; set; }

    public FlowType Type { get; set; } // Only DEPOSIT (INCOME) or WITHDRAWAL (EXPENSE) makes sense here, but we can reuse FlowType or add GoalTransactionType. Using FlowType for simplicity.
    public decimal Amount { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string Note { get; set; } = string.Empty;
    public decimal BalanceAfter { get; set; }
}
