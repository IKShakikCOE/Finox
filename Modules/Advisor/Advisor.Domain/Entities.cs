using Finox.Shared.Domain;

namespace Advisor.Domain;

public sealed class AdvisorMessage : IOwnedEntity
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // user | assistant
    public string Content { get; set; } = string.Empty; // Markdown
    public string Timestamp { get; set; } = string.Empty; // ISO-8601
}
