using Advisor.Domain;

namespace Advisor.Application;

public interface IAdvisorService
{
    Task<AdvisorMessage> ReplyAsync(string userMessage, Guid userId, string? context = null, CancellationToken ct = default);
}

