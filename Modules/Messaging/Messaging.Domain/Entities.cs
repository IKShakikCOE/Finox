using Finox.Shared.Domain;

namespace Messaging.Domain;

public sealed class Message : IOwnedEntity
{
    public Guid Id { get; set; }
    /// <summary>OwnerId is set to SenderId for ownership tracking.</summary>
    public Guid? OwnerId { get; set; }

    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty; // ISO-8601
    public bool Read { get; set; }
}
