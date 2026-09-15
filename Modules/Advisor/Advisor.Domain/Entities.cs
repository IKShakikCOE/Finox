using Finox.Shared.Domain;

namespace Advisor.Domain;

public sealed class AdvisorMessage : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }
    public string Role { get; set; } = string.Empty; // user | assistant
    public string Content { get; set; } = string.Empty; // Markdown
    public string Timestamp { get; set; } = string.Empty; // ISO-8601
}
