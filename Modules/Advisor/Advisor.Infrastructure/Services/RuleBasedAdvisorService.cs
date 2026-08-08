using Advisor.Application;
using Advisor.Domain;
using Advisor.Infrastructure.Persistence;
using Finox.Shared.Domain;

namespace Advisor.Infrastructure.Services;

public sealed class RuleBasedAdvisorService : IAdvisorService
{
    private readonly AdvisorDbContext _db;
    private readonly ICurrentUser _user;
    private readonly IIdGenerator _idGen;

    public RuleBasedAdvisorService(AdvisorDbContext db, ICurrentUser user, IIdGenerator idGen)
    {
        _db = db;
        _user = user;
        _idGen = idGen;
    }

    public async Task<AdvisorMessage> ReplyAsync(string userMessage, string userId, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow.ToString("o");

        var userMsg = new AdvisorMessage
        {
            Id = _idGen.NewId(),
            OwnerId = userId,
            Role = "user",
            Content = userMessage,
            Timestamp = now
        };
        _db.Set<AdvisorMessage>().Add(userMsg);

        var replyContent = GenerateReply(userMessage);
        var assistantMsg = new AdvisorMessage
        {
            Id = _idGen.NewId(),
            OwnerId = userId,
            Role = "assistant",
            Content = replyContent,
            Timestamp = now
        };
        _db.Set<AdvisorMessage>().Add(assistantMsg);

        await _db.SaveChangesAsync(ct);
        return assistantMsg;
    }

    private static string GenerateReply(string message)
    {
        var lower = message.ToLowerInvariant();
        if (lower.Contains("budget"))
            return "**Budget Tip:** Try the 50/30/20 rule — 50% needs, 30% wants, 20% savings. Review your budget allocations in the Tracker module.";
        if (lower.Contains("save") || lower.Contains("saving"))
            return "**Savings Advice:** Consider automating a monthly transfer to a high-yield FDR. Even ৳5,000/month compounds significantly over time.";
        if (lower.Contains("invest"))
            return "**Investment Insight:** Diversify across asset classes. Check the Mutual Funds section for balanced funds with moderate risk.";
        return "I'm your financial advisor. Ask me about budgeting, saving, investing, or any financial topic and I'll provide personalized guidance based on your data.";
    }
}
