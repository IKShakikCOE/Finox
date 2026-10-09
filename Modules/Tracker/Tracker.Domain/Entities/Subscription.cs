using Finox.Shared.Domain;

namespace Tracker.Domain;

public sealed class Subscription : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Provider { get; set; }
    public string? Plan { get; set; }
    public string Category { get; set; } = string.Empty;
    public BillingCycle BillingCycle { get; set; }
    public decimal PriceAmount { get; set; }
    public string Currency { get; set; } = "BDT";
    public decimal BdtEquivalent { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly NextBillingDate { get; set; }
    public int DaysRemaining { get; set; }
    public int? ReminderDays { get; set; }
    public string? ProviderUrl { get; set; }
    public string? Remarks { get; set; }
    public bool AutoRenew { get; set; }
    public SubscriptionStatus Status { get; set; }
    public string IconClass { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
    public string? PaymentAccount { get; set; }

    public ICollection<SubscriptionPaymentHistory> History { get; set; } = new List<SubscriptionPaymentHistory>();
}
