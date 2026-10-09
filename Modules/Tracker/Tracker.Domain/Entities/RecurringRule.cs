using Finox.Shared.Domain;

namespace Tracker.Domain;

public sealed class RecurringRule : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public string Title { get; set; } = string.Empty;
    public FlowType Type { get; set; }
    public RecurringFrequency Frequency { get; set; }
    public decimal Amount { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public DateOnly NextExecutionDate { get; set; }
    public bool AutoPost { get; set; }
}
