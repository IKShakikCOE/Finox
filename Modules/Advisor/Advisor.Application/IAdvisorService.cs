using Advisor.Domain;

namespace Advisor.Application;

public interface IAdvisorService
{
    Task<AdvisorMessage> ReplyAsync(string userMessage, string userId, CancellationToken ct);
}
