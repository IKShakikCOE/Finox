using Finox.Shared.Domain;

namespace Calendar.Domain;

public sealed class CalendarEvent : IOwnedEntity
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;  // YYYY-MM-DD
    public string? Time { get; set; }                  // HH:mm
    public string Type { get; set; } = string.Empty;   // PAYMENT | MEETING | REMINDER | DEADLINE
    public string? Description { get; set; }
    public string? Color { get; set; }
}
