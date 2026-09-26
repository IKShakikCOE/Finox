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

    public async Task<AdvisorMessage> ReplyAsync(string userMessage, Guid userId, string? context = null, CancellationToken ct = default)
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
        bool isBengali = System.Text.RegularExpressions.Regex.IsMatch(message, @"[\u0980-\u09FF]") ||
                         lower.Contains("khoroch") || lower.Contains("taka") || lower.Contains("biniyog") || lower.Contains("sonchoy");

        if (isBengali)
        {
            if (lower.Contains("budget") || lower.Contains("বাজেট") || lower.Contains("khoroch") || lower.Contains("খরচ"))
            {
                return "### 📌 সারসংক্ষেপ\n" +
                       "আপনার খরচের বাজেট ব্যবস্থাপনায় **৫০/৩০/২০ নিয়ম** সবচেয়ে কার্যকর।\n\n" +
                       "### 📊 প্রস্তাবিত মাসিক বাজেট বিন্যাস\n" +
                       "| খাত | শতাংশ | বিবরণ |\n" +
                       "|---|---|---|\n" +
                       "| অপরিহার্য খরচ (Needs) | ৫০% | বাসা ভাড়া, ইউটিলিটি ও খাবার |\n" +
                       "| জীবনযাত্রা ও শখ (Wants) | ৩০% | বিনোদন, শপিং ও রেস্টুরেন্ট |\n" +
                       "| সঞ্চয় ও বিনিয়োগ (Savings) | ২০% | ডিপিএস, সঞ্চয়পত্র বা জরুরি তহবিল |\n\n" +
                       "### 💡 করণীয় পদক্ষেপ\n" +
                       "- ট্র্যাকার মডিউলে ক্যাটাগরিভিত্তিক বাজেট লিমিট সেট করুন।\n" +
                       "- বেতন বা আয়ের শুরুতেই সঞ্চয়ের টাকা আলাদা ব্যাংক অ্যাকাউন্টে স্থানান্তর করুন।";
            }

            if (lower.Contains("save") || lower.Contains("saving") || lower.Contains("সঞ্চয়") || lower.Contains("ডিপিএস") || lower.Contains("dps"))
            {
                return "### 📌 সারসংক্ষেপ\n" +
                       "বাংলাদেশে সঞ্চয়ের জন্য **ব্যাংক ডিপিএস (DPS)** এবং **জাতীয় সঞ্চয়পত্র** সবচেয়ে জনপ্রিয় ও নির্ভরযোগ্য মাধ্যম।\n\n" +
                       "### 📊 সঞ্চয় মাধ্যম তুলনা\n" +
                       "| মাধ্যম | আনুমানিক মুনাফা/সুদ | সুবিধা |\n" +
                       "|---|---|---|\n" +
                       "| ব্যাংক ডিপিএস (DPS) | ৮.৫% - ১১.০% | প্রতি মাসে নিয়মিত অল্প টাকা জমানোর দারুণ সুযোগ |\n" +
                       "| পরিবার সঞ্চয়পত্র | ১১.৫২% (১ম স্লাব) | নিরাপদ ও মাসিক বা ত্রৈমাসিক মুনাফা প্রদান |\n" +
                       "| ইসলামিক মুদারাবা ডিপিএস | শরিয়াহ সম্মত মুনাফা | হালাল ও সুদ-মুক্ত রিটার্ন |\n\n" +
                       "### 💡 করণীয় পদক্ষেপ\n" +
                       "- ৩ থেকে ৬ মাসের খরচের সমান টাকা একটি সেভিংস অ্যাকাউন্টে জরুরি তহবিল (Emergency Fund) হিসেবে রাখুন।\n" +
                       "- এনবিআর (NBR) অনুমোদিত খাতে বিনিয়োগ করে সর্বোচ্চ ১৫% কর রেয়াত সুবিধা গ্রহণ করুন।";
            }

            return "### 🤖 ফিনোক্স এআই অ্যাডভাইজর\n" +
                   "আমি আপনার ব্যক্তিগত সম্পদ ও আর্থিক পরামর্শক। বাজেট তৈরি, সঞ্চয়পত্র, ব্যাংক ডিপিএস, কর রেয়াত বা বিনিয়োগ সম্পর্কিত যেকোনো প্রশ্ন বাংলায় করতে পারেন।";
        }

        if (lower.Contains("budget"))
            return "### 📌 Executive Summary\n" +
                   "Follow the **50/30/20 budget framework** to balance your finances.\n\n" +
                   "### 📊 Recommended Budget Allocation\n" +
                   "| Bucket | Allocation | Description |\n" +
                   "|---|---|---|\n" +
                   "| Needs | 50% | Rent, groceries, utilities |\n" +
                   "| Wants | 30% | Dining out, hobbies, subscriptions |\n" +
                   "| Savings & Investments | 20% | DPS, emergency fund, mutual funds |\n\n" +
                   "### 💡 Action Items\n" +
                   "- Set strict category-wise budget caps in the Tracker module.\n" +
                   "- Automate transfers to your investment accounts on pay day.";

        if (lower.Contains("save") || lower.Contains("saving"))
            return "### 📌 Executive Summary\n" +
                   "Consistent savings compound dramatically over time.\n\n" +
                   "### 📊 Top Savings Instruments in Bangladesh\n" +
                   "| Instrument | Estimated Rate | Best For |\n" +
                   "|---|---|---|\n" +
                   "| Bank DPS | 8.5% - 11.0% | Disciplined monthly deposits |\n" +
                   "| National Sanchayapatra | 11.52% | Low-risk government-backed growth |\n" +
                   "| High-Yield FDR | 9.0% - 11.5% | Lump sum parking (6-12 months) |\n\n" +
                   "### 💡 Action Items\n" +
                   "- Build an emergency cushion of 3–6 months of basic expenses.\n" +
                   "- Claim your 15% NBR tax rebate by investing in approved securities.";

        if (lower.Contains("invest"))
            return "### 📌 Executive Summary\n" +
                   "Diversification across asset classes minimizes portfolio volatility.\n\n" +
                   "### 💡 Investment Recommendations\n" +
                   "- **Defensive Core (60%)**: Bank FDR, Treasury bonds, Sanchayapatra.\n" +
                   "- **Growth Allocation (25%)**: Top-rated mutual funds & high-ROAS ad campaigns.\n" +
                   "- **Liquid Buffer (15%)**: High-interest savings account for unexpected opportunities.";

        return "### 🤖 Finox AI Advisor\n" +
               "I'm your financial intelligence partner. Ask me about spending breakdown, budget rules, savings instruments in Bangladesh, or ad ROI optimization in English or বাংলা.";
    }
}



