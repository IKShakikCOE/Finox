using Finox.Shared.Domain;

namespace Tracker.Domain;

public sealed class Goal : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentSavedAmount { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly TargetDate { get; set; }
    public int MonthsRemaining { get; set; }
    public decimal RequiredMonthlyDeposit { get; set; }
    public decimal PercentCompleted { get; set; }
    public GoalStatus Status { get; set; }
    public string IconClass { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;

    public ICollection<GoalTransaction> History { get; set; } = new List<GoalTransaction>();
}
