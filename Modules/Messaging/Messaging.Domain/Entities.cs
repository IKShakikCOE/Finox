using Finox.Shared.Domain;

namespace Messaging.Domain;

public sealed class Message : IOwnedEntity
{
    public string Id { get; set; } = string.Empty;
    /// <summary>OwnerId is set to SenderId for ownership tracking.</summary>
    public string OwnerId { get; set; } = string.Empty;

    public string SenderId { get; set; } = string.Empty;
    public string ReceiverId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty; // ISO-8601
    public bool Read { get; set; }
}
