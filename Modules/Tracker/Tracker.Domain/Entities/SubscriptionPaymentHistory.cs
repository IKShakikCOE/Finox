using Finox.Shared.Domain;
using System.Text.Json.Serialization;

namespace Tracker.Domain;

public sealed class SubscriptionPaymentHistory : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public Guid SubscriptionId { get; set; }
    
    [JsonIgnore]
    public Subscription? Subscription { get; set; }

    public DateOnly Date { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "BDT";
    public decimal BdtEquivalent { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
}
