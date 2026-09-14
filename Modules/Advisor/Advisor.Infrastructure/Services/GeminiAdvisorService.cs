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

        var replyContent = await GenerateReplyAsync(userMessage, ct);
        
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

    private async Task<string> GenerateReplyAsync(string message, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            return "Gemini API key is not configured.";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[]
                    {
                        new { text = message }
                    }
                }
            },
            systemInstruction = new
            {
                parts = new[]
                {
                    new
                    {
                        text = "You are Finox AI, an expert personal wealth & financial advisor specialized in the Bangladesh economy. " +
                               "Provide clear, actionable, structured financial advice in professional yet accessible language (Bengali or English as requested). " +
                               "Use currency BDT (৳). " +
                               "Reference Bangladeshi instruments like Sanchayapatra (পরিবার সঞ্চয়পত্র, ৩-মাস মেয়াদী), Bank DPS/FDR, NBR tax rebates (15%), and GPF. " +
                               "Format responses with bold text, bullet points, and clean Markdown tables."
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
