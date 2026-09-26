using System.Net.Http.Json;
using System.Text.Json;
using Advisor.Application;
using Advisor.Domain;
using Advisor.Infrastructure.Persistence;
using Finox.Shared.Domain;
using Microsoft.Extensions.Configuration;

namespace Advisor.Infrastructure.Services;

public sealed class GeminiAdvisorService : IAdvisorService
{
    private readonly AdvisorDbContext _db;
    private readonly ICurrentUser _user;
    private readonly IIdGenerator _idGen;
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiAdvisorService(AdvisorDbContext db, ICurrentUser user, IIdGenerator idGen, HttpClient httpClient, IConfiguration configuration)
    {
        _db = db;
        _user = user;
        _idGen = idGen;
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        _model = configuration["Gemini:Model"] ?? "gemini-3.6-flash";
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

        var replyContent = await GenerateReplyAsync(userMessage, context, ct);
        
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

    private async Task<string> GenerateReplyAsync(string message, string? context, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            return "Gemini API key is not configured.";

        var userContentText = !string.IsNullOrWhiteSpace(context)
            ? $"[FINANCIAL CONTEXT DATA]:\n{context}\n\n[USER QUERY]:\n{message}"
            : message;

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[]
                    {
                        new { text = userContentText }
                    }
                }
            },
            systemInstruction = new
            {
                parts = new[]
                {
                    new
                    {
                        text = @"You are Finox AI, an elite personal wealth & financial advisor specialized in personal finance and the Bangladesh economy.

LANGUAGE INTELLIGENCE (CRITICAL):
- DETECT the user's language automatically:
  * If the user asks in Bengali (বাংলা স্ক্রিপ্ট বা বর্ণ), your entire reply MUST be in natural, professional, fluent, and warm Bengali (বাংলা).
  * If the user writes in phonetic Bengali/Banglish (e.g. 'amar koto taka save kora uchit', 'biniyog kothay korbo'), respond in proper, easy-to-read Bengali script (বাংলায়).
  * If the user asks in English, reply in clean, concise, executive-level English.
  * You may include English financial terms in brackets if helpful (e.g., সঞ্চয়পত্র (Sanchayapatra), কর রেয়াত (Tax Rebate), সুদের হার (Interest Rate)).

FINANCIAL EXPERTISE (BANGLADESH ECONOMY):
- Currency: Always use Bangladeshi Taka (BDT / ৳) with proper thousand separators (e.g. ৳ ৫০,০০০ / ৳ 50,000).
- Authentic Instruments:
  * National Savings Certificates / Sanchayapatra (পরিবার সঞ্চয়পত্র, ৩-মাস মেয়াদী, পেনশনার সঞ্চয়পত্র).
  * Bank DPS (Deposit Pension Scheme) & FDR with current market rates (8.5% - 11.5%).
  * NBR Income Tax Rebates (15% rebate under 6th Schedule on investments up to 20% of taxable income or ৳10,00,000).
  * Emergency funds (৩-৬ মাসের খরচ).
  * Ad Investment ROI (Meta Ads, Google Ads, TikTok Ads) if user campaign data is provided.

RESPONSE STRUCTURE (MUST BE HIGHLY ORGANIZED):
Never output raw blobs of unstructured text. Always format your output cleanly using Markdown:
1. 📌 **Executive Summary / সারসংক্ষেপ**: A direct, 1-2 sentence answer.
2. 📊 **Data Breakdown & Comparisons / ডেটা ও বিশ্লেষণ**: Whenever comparing figures, allocations, interest rates, or investment returns, ALWAYS format as a clean Markdown table (| খাত / অপশন | বিবরণ | সুদের হার বা পরিমাণ |).
3. 💡 **Actionable Recommendations / কার্যকরী পরামর্শ**: 3-5 prioritized, concrete bullet points.
4. 🛡️ **Risk & Pro Tip / ঝুঁকি ও পরামর্শ**: 1 concise note on risk management, inflation hedge, or regulatory compliance."
                    }
                }
            }
        };

        var modelName = string.IsNullOrWhiteSpace(_model) ? "gemini-3.6-flash" : _model;
        var response = await _httpClient.PostAsJsonAsync($"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent?key={_apiKey}", requestBody, ct);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(ct);
            return "Sorry, I am having trouble connecting to the AI brain right now. " + error;
        }

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        try
        {
            var text = json.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return text ?? "I couldn't generate a response.";
        }
        catch
        {
            return "Failed to parse the response from Gemini.";
        }
    }
}



