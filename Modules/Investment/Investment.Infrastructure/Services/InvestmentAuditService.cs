using System.Text.Json;
using System.Text.RegularExpressions;
using Finox.Shared.Domain;
using Investment.Application;
using Investment.Domain;
using Investment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Investment.Infrastructure.Services;

public sealed class InvestmentAuditService : IInvestmentAuditService
{
    private readonly InvestmentDbContext _db;
    private readonly HttpClient _httpClient;
    private readonly ILogger<InvestmentAuditService> _logger;
    private readonly string? _geminiApiKey;

    public InvestmentAuditService(
        InvestmentDbContext db,
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<InvestmentAuditService> logger)
    {
        _db = db;
        _httpClient = httpClient;
        _logger = logger;
        _geminiApiKey = configuration["Gemini:ApiKey"];
    }

    public async Task<InvestmentLead> AuditAndSaveOfferAsync(
        AuditOfferRequest request,
        Guid? ownerId = null,
        CancellationToken ct = default)
    {
        var rawText = request.RawText ?? string.Empty;
        var companyName = string.IsNullOrWhiteSpace(request.CompanyName)
            ? ExtractCompanyName(rawText)
            : request.CompanyName;

        var contactInfo = string.IsNullOrWhiteSpace(request.ContactInfo)
            ? ExtractContactInfo(rawText)
            : request.ContactInfo;

        var monthlyRoi = request.PromisedMonthlyReturnPercent ?? ExtractMonthlyRoi(rawText);
        var minInvestment = request.MinimumInvestment ?? ExtractMinimumInvestment(rawText);
        var industry = request.Industry ?? DetectIndustry(rawText, companyName);
        var location = request.Location ?? ExtractLocation(rawText);

        // Perform Forensic AI Audit (Gemini or Forensic Rules)
        AuditResult auditResult = await PerformAuditAnalysisAsync(
            rawText, companyName, industry, monthlyRoi, minInvestment, ct);

        var leadId = Guid.NewGuid();
        var lead = new InvestmentLead
        {
            Id = leadId,
            OwnerId = ownerId ?? _db.CurrentOwnerId,
            CompanyName = companyName,
            Industry = industry,
            OfferSummary = auditResult.ExecutiveSummary,
            RawText = rawText,
            SourceChannel = request.SourceChannel ?? "Manual",
            ContactInfo = contactInfo,
            Location = location,
            MinimumInvestment = minInvestment,
            PromisedMonthlyReturnPercent = monthlyRoi,
            PayoutFrequency = auditResult.PayoutFrequency,
            LockInPeriod = auditResult.LockInPeriod,
            OfferedSecurity = auditResult.OfferedSecurity,
            TrustScore = auditResult.OverallTrustScore,
            RiskLevel = auditResult.RiskLevel,
            ShariahStatus = auditResult.ShariahStatus,
            Status = "SCREENED",
            CreatedAt = DateTime.UtcNow
        };

        if (!string.IsNullOrWhiteSpace(request.FacebookAdUrl))
        {
            var trimmedUrl = request.FacebookAdUrl.Trim();
            var match = System.Text.RegularExpressions.Regex.Match(trimmedUrl, @"(?:\?|&)id=(\d+)");
            if (match.Success)
            {
                lead.FacebookAdId = match.Groups[1].Value;
                lead.FacebookAdUrl = $"https://www.facebook.com/ads/library/?id={lead.FacebookAdId}";
            }
            else if (long.TryParse(trimmedUrl, out var numericId))
            {
                lead.FacebookAdId = numericId.ToString();
                lead.FacebookAdUrl = $"https://www.facebook.com/ads/library/?id={lead.FacebookAdId}";
            }
            else
            {
                lead.FacebookAdUrl = trimmedUrl;
            }
        }

        var report = new AuditReport
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId ?? _db.CurrentOwnerId,
            InvestmentLeadId = leadId,
            FinancialSanityScore = auditResult.FinancialSanityScore,
            FinancialSanityVerdict = auditResult.FinancialSanityVerdict,
            RegulatoryComplianceScore = auditResult.RegulatoryComplianceScore,
            RegulatoryVerdict = auditResult.RegulatoryVerdict,
            CashflowAndLockInScore = auditResult.CashflowAndLockInScore,
            CashflowVerdict = auditResult.CashflowVerdict,
            ShariahComplianceScore = auditResult.ShariahComplianceScore,
            ShariahVerdict = auditResult.ShariahVerdict,
            RedFlagsJson = JsonSerializer.Serialize(auditResult.RedFlags),
            VerifiedClaimsJson = JsonSerializer.Serialize(auditResult.VerifiedClaims),
            RecommendationSummary = auditResult.RecommendationSummary,
            ActionPlan = auditResult.ActionPlan,
            AuditedAt = DateTime.UtcNow
        };

        lead.AuditReport = report;

        await _db.InvestmentLeads.AddAsync(lead, ct);
        await _db.AuditReports.AddAsync(report, ct);
        await _db.SaveChangesAsync(ct);

        return lead;
    }

    public async Task<InvestmentLead?> GetLeadDetailsAsync(Guid leadId, CancellationToken ct = default)
    {
        return await _db.InvestmentLeads
            .Include(l => l.AuditReport)
            .FirstOrDefaultAsync(l => l.Id == leadId, ct);
    }

    public async Task<IReadOnlyList<InvestmentLead>> GetLeadsAsync(
        string? riskLevel = null,
        string? status = null,
        CancellationToken ct = default)
    {
        IQueryable<InvestmentLead> query = _db.InvestmentLeads
            .Include(l => l.AuditReport)
            .OrderByDescending(l => l.CreatedAt);

        if (!string.IsNullOrWhiteSpace(riskLevel) && riskLevel != "ALL")
        {
            query = query.Where(l => l.RiskLevel == riskLevel);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
        {
            query = query.Where(l => l.Status == status);
        }

        return await query.ToListAsync(ct);
    }

    public async Task<bool> DeleteLeadAsync(Guid leadId, CancellationToken ct = default)
    {
        var lead = await _db.InvestmentLeads.FirstOrDefaultAsync(l => l.Id == leadId, ct);
        if (lead == null) return false;

        _db.InvestmentLeads.Remove(lead);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<InvestmentLead> UpdateLeadStatusAsync(Guid leadId, string status, CancellationToken ct = default)
    {
        var lead = await _db.InvestmentLeads
            .Include(l => l.AuditReport)
            .FirstOrDefaultAsync(l => l.Id == leadId, ct);

        if (lead == null)
            throw new KeyNotFoundException($"Investment lead with ID {leadId} not found.");

        lead.Status = status.ToUpperInvariant();
        await _db.SaveChangesAsync(ct);
        return lead;
    }

    private async Task<AuditResult> PerformAuditAnalysisAsync(
        string rawText,
        string companyName,
        string industry,
        decimal? monthlyRoi,
        decimal? minInvestment,
        CancellationToken ct)
    {
        // Try Gemini AI Model first if key is present
        if (!string.IsNullOrWhiteSpace(_geminiApiKey))
        {
            try
            {
                var geminiResult = await CallGeminiAuditorAsync(rawText, companyName, industry, monthlyRoi, ct);
                if (geminiResult != null)
                {
                    return geminiResult;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini AI audit call failed, using rule-based forensic engine.");
            }
        }

        // Rule-Based Forensic Auditor Engine (100% Reliable, Deterministic, Aligned with Finox Standards)
        return EvaluateByForensicRules(rawText, companyName, industry, monthlyRoi, minInvestment);
    }

    private async Task<AuditResult?> CallGeminiAuditorAsync(
        string rawText,
        string companyName,
        string industry,
        decimal? monthlyRoi,
        CancellationToken ct)
    {
        var prompt = $@"You are the Finox Investment Forensic Auditor (Scam Shield) specialized in evaluating Bangladeshi business partnerships, crowdfunding offers, and agricultural/trading schemes.
Analyze the following investment offer and evaluate against 4 strict criteria:
1. Financial Sanity & ROI: Sustainable business profit in Bangladesh is 1.5% - 2.5% monthly (18-30% annual). Any claim > 3.5% monthly is extreme Ponzi risk.
2. Regulatory Compliance: RJSC registration, BSEC CIS permit, Bangladesh Bank approval for public deposits.
3. Cashflow & Lock-in Traps: Payout delays, lock-in periods, forced app downloads/APK webviews, deposit forfeiture.
4. Shariah Compliance: Mudarabah/Musharakah requires actual profit/loss sharing; guaranteed fixed monthly profit = Riba (Sudh).

Offer Text:
---
Company: {companyName}
Industry: {industry}
Stated Monthly ROI: {monthlyRoi}%
{rawText}
---

Return ONLY valid JSON matching this schema:
{{
  ""overallTrustScore"": 15,
  ""riskLevel"": ""SCAM"", // LOW | MODERATE | HIGH | SCAM
  ""shariahStatus"": ""NON_COMPLIANT"", // COMPLIANT | DOUBTFUL | NON_COMPLIANT
  ""executiveSummary"": ""Brief Bengali summary of the offer and its legitimacy"",
  ""payoutFrequency"": ""Monthly / Quarterly / End of Term"",
  ""lockInPeriod"": ""e.g. 1 Year / 6 Months"",
  ""offeredSecurity"": ""e.g. Security Cheque, Stamp, None"",
  ""financialSanityScore"": 10,
  ""financialSanityVerdict"": ""Bengali verdict on ROI math"",
  ""regulatoryComplianceScore"": 20,
  ""regulatoryVerdict"": ""Bengali verdict on RJSC/BSEC legal registration"",
  ""cashflowAndLockInScore"": 25,
  ""cashflowVerdict"": ""Bengali verdict on lock-in and withdrawal terms"",
  ""shariahComplianceScore"": 0,
  ""shariahVerdict"": ""Bengali verdict on Shariah compliance (Riba vs Mudarabah)"",
  ""redFlags"": [""Red flag 1 in Bengali"", ""Red flag 2 in Bengali""],
  ""verifiedClaims"": [""Verified point 1 in Bengali""],
  ""recommendationSummary"": ""Final recommendation in Bengali"",
  ""actionPlan"": ""Concrete next steps in Bengali""
}}";

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_geminiApiKey}";
        var payload = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                responseMimeType = "application/json"
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(json);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(text)) return null;

        return JsonSerializer.Deserialize<AuditResult>(text, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    private static AuditResult EvaluateByForensicRules(
        string rawText,
        string companyName,
        string industry,
        decimal? monthlyRoi,
        decimal? minInvestment)
    {
        var redFlags = new List<string>();
        var verifiedClaims = new List<string>();

        var textLower = rawText.ToLowerInvariant();

        // 1. Financial Sanity
        int finScore = 50;
        string finVerdict = string.Empty;
        var roi = monthlyRoi ?? 0;

        if (roi >= 10m)
        {
            finScore = 5;
            finVerdict = $"মাসিক {roi}% মুনাফা (বার্ষিক {roi * 12}%) বাস্তব ব্যবসায় সম্পূর্ণ অসম্ভব এবং ১০০% পনজি স্কিম নির্দেশ করে।";
            redFlags.Add($"অস্বাভাবিক মাসিক {roi}% রিটার্ন অফার (বার্ষিক {roi * 12}%), যা ফিন্যান্সিয়াল গণিতে কোনো বাস্তব ব্যবসায় টেকসই নয়।");
        }
        else if (roi >= 4.0m)
        {
            finScore = 20;
            finVerdict = $"মাসিক {roi}% মুনাফা (বার্ষিক {roi * 12}%) অত্যন্ত উচ্চ ঝুঁকির অফার, যা বাণিজ্যিক মার্জিনের সাথে সামঞ্জস্যপূর্ণ নয়।";
            redFlags.Add($"মাসিক {roi}% গ্যারান্টিড বা নির্দিষ্ট মুনাফার দাবি অত্যন্ত সন্দেহজনক।");
        }
        else if (roi >= 3.0m)
        {
            finScore = 45;
            finVerdict = $"মাসিক {roi}% মুনাফা (বার্ষিক {roi * 12}%) কেবল উচ্চ ঝুঁকি ও বিশেষায়িত পোশাক/গার্মেন্টস সরাসরি উৎপাদন অংশীদারিত্বে সম্ভব, ওপেন ক্রাউডফান্ডিংয়ে নয়।";
            redFlags.Add("অনিয়ন্ত্রিত পাবলিক ফান্ড সংগ্রহের মাধ্যমে ৩% মাসিক রিটার্ন প্রতিশ্রুতি ঝুঁকিপূর্ণ।");
        }
        else if (roi > 0)
        {
            finScore = 80;
            finVerdict = $"মাসিক {roi}% রিটার্ন বাস্তব বাণিজ্যিক কার্যক্রমের সাথে সামঞ্জস্যপূর্ণ ও গ্রহণযোগ্য।";
            verifiedClaims.Add($"প্রস্তাবিত রিটার্ন ({roi}% মাসিক) অর্থনৈতিকভাবে বাস্তবসম্মত।");
        }
        else
        {
            finScore = 50;
            finVerdict = "মুনাফার সুনির্দিষ্ট হার বিজ্ঞাপনে উল্লেখ করা হয়নি বা লভ্যাংশ অংশীদারিত্ব ভিত্তিক।";
        }

        // 2. Regulatory & Legal
        int regScore = 40;
        string regVerdict = string.Empty;
        bool hasRjsc = textLower.Contains("c-") || textLower.Contains("rjsc") || textLower.Contains("রেজিস্ট্রেশন");
        bool hasSec = textLower.Contains("bsec") || textLower.Contains("সিকিউরিটিজ");

        if (hasRjsc)
        {
            regScore = 65;
            regVerdict = "RJSC রেজিস্ট্রেশন নম্বরের দাবি রয়েছে, তবে পাবলিক ডিপোজিট গ্রহণের লাইসেন্স যাচাই প্রয়োজন।";
            verifiedClaims.Add("প্রতিষ্ঠানের আরজেএসসি (RJSC) নিবন্ধনের উল্লেখ রয়েছে।");
        }
        else
        {
            regScore = 15;
            regVerdict = "কোম্পানির কোনো অনুমোদিত আরজেএসসি (RJSC) বা বিএসইসি (BSEC) বৈধ সনদ উল্লেখ নেই।";
            redFlags.Add("যথাযথ কর্পোরেট লিগ্যাল অস্তিত্ব বা আরজেএসসি সার্টিফিকেশন অনুপস্থিত।");
        }

        if (textLower.Contains("চেক") || textLower.Contains("cheque"))
        {
            redFlags.Add("সিকিউরিটি চেকের মাধ্যমে ডিপোজিট নেওয়ার দাবি ব্যাংক কোম্পানি আইনের পরিপন্থী ও বিরোধ দেখা দিলে জটিল।");
        }

        if (textLower.Contains("app") && (textLower.Contains("apk") || textLower.Contains("download") || textLower.Contains("play store") || textLower.Contains("flash offer")))
        {
            regScore = Math.Min(regScore, 10);
            redFlags.Add("অপ্রমাণিত বা নিজস্ব অ্যাপ/ওয়েবভিউ দিয়ে পেমেন্ট ও শেয়ার ক্রয়ের চাপ দেওয়া হচ্ছে, যা ট্র্যাকিং এড়ানোর ফাঁদ।");
        }

        // 3. Cashflow & Lock-in
        int cashScore = 45;
        string cashVerdict = string.Empty;
        string lockIn = "১ বছর";
        string payoutFreq = "মাসিক";

        if (textLower.Contains("৬ মাস পর") || textLower.Contains("6 মাস পর") || textLower.Contains("১ম কিস্তি ৬ মাস"))
        {
            cashScore = 20;
            cashVerdict = "প্রথম লভ্যাংশ পেতে ৬ মাস বিলম্ব এবং পুঁজি আটকে রাখার শর্ত বিনিয়োগকারীর জন্য মারাত্মক ঝুঁকি।";
            redFlags.Add("প্রথম লভ্যাংশ প্রদানে ৬ মাসের দীর্ঘ বিলম্ব ক্যাশফ্লো হাইজ্যাকের স্পষ্ট লক্ষণ।");
            payoutFreq = "প্রথম কিস্তি ৬ মাস পর, পরে ত্রৈমাসিক";
        }

        if (textLower.Contains("৩ বছর") || textLower.Contains("3 বছর"))
        {
            lockIn = "৩ বছর";
            redFlags.Add("৩ বছরের দীর্ঘ লক-ইন এবং আগাম উত্তোলনে ১০% বা তদূর্ধ্ব সার্ভিস চার্জ কর্তনের ফাঁদ।");
        }
        else if (textLower.Contains("১ বছর") || textLower.Contains("1 বছর"))
        {
            lockIn = "১ বছর";
        }

        if (textLower.Contains("ভর্তুকি") || textLower.Contains("subsidy"))
        {
            cashScore = Math.Min(cashScore, 10);
            redFlags.Add("লোকসান হলে বিনিয়োগকারীকে নিজ পকেট থেকে ভর্তুকি দিয়ে মূলধন পূর্ণ করার একতরফা ও বিপজ্জনক ধারা।");
        }

        // 4. Shariah Compliance
        int shariahScore = 40;
        string shariahVerdict = string.Empty;
        string shariahStatus = "DOUBTFUL";

        bool guaranteesFixed = textLower.Contains("নিশ্চিত লাভ") || textLower.Contains("গ্যারান্টি") || (roi > 3.0m && textLower.Contains("ফিক্সড"));
        if (guaranteesFixed)
        {
            shariahScore = 0;
            shariahVerdict = "মূলধনের ওপর নির্দিষ্ট বা গ্যারান্টিড মাসিক মুনাফা ইসলামি শরিয়াহতে সরাসরি 'রিবা' বা সুদ হিসেবে গণ্য।";
            shariahStatus = "NON_COMPLIANT";
            redFlags.Add("ইসলামিক পরিভাষা ব্যবহার করলেও নিশ্চিত ফিক্সড রিটার্নের কারণে শরিয়াহ বিরোধী।");
        }
        else if (textLower.Contains("মুদারাবা") || textLower.Contains("মুশারাকা") || textLower.Contains("অংশীদারিত্ব") || textLower.Contains("হালাল"))
        {
            shariahScore = 55;
            shariahVerdict = "মুদারাবা বা মুশারাকার দাবি করা হলেও চুক্তিপত্রে ক্ষতিবণ্টন ও অডিটের স্বচ্ছতা নিশ্চিত করা জরুরি।";
            shariahStatus = "DOUBTFUL";
        }
        else
        {
            shariahScore = 30;
            shariahVerdict = "শরিয়াহ যাচাইকরণের কোনো আনুষ্ঠানিক শরিয়াহ বোর্ড বা ফতোয়া নেই।";
            shariahStatus = "DOUBTFUL";
        }

        // Overall Trust Score Calculation (Weighted)
        int overallScore = (int)Math.Round((finScore * 0.4) + (regScore * 0.25) + (cashScore * 0.2) + (shariahScore * 0.15));
        overallScore = Math.Clamp(overallScore, 0, 100);

        string riskLevel = "HIGH";
        if (overallScore < 25 || roi >= 10m || redFlags.Count >= 4) riskLevel = "SCAM";
        else if (overallScore < 50) riskLevel = "HIGH";
        else if (overallScore < 75) riskLevel = "MODERATE";
        else riskLevel = "LOW";

        string recSummary = riskLevel switch
        {
            "SCAM" => $"⚠️ লাল সংকেত (Scam Alert): {companyName} এর অফারে তীব্র পনজি স্কিম ও ক্যাশ ট্র্যাপের উপাদান রয়েছে। কোনোভাবেই অর্থ বিনিয়োগ করবেন না।",
            "HIGH" => $"⚠️ উচ্চ ঝুঁকি (High Risk): {companyName} এর ব্যবসায়িক ও আইনি সুরক্ষায় গুরুতর ঘাটতি রয়েছে। আর্থিক ক্ষতি এড়াতে বিনিয়োগ স্থগিত রাখুন।",
            "MODERATE" => $"🟡 পর্যবেক্ষণ প্রয়োজন (Caution): কোম্পানির অফার আংশিক বাস্তবসম্মত হলেও অফিশিয়াল নথিপত্র ও কারখানা ভিজিট ছাড়া চুক্তি করবেন না।",
            _ => $"🟢 অনুমোদিত (Verified): অফারটি বাস্তবসম্মত ও গ্রহণযোগ্য মানদণ্ড পূরণ করেছে।"
        };

        string actionPlan = riskLevel == "SCAM" || riskLevel == "HIGH"
            ? "১. কোনো অবস্থাতেই অর্থ বা ব্যাংক ট্রান্সফার করবেন না।\n২. যোগাযোগের জন্য ব্যবহৃত হোয়াটসঅ্যাপ/মেসেঞ্জারে কোনো গোপনীয় তথ্য দেবেন না।\n৩. বিকল্প হিসেবে বাস্তব গার্মেন্ট অংশীদারিত্ব বা সরকারি অনুমোদিত সঞ্চয়পত্র বিবেচনা করুন।"
            : "১. ট্রেড লাইসেন্স ও আরজেএসসি সার্টিফিকেট সরাসরি পরিদর্শন করুন।\n২. ৩০০ টাকার জুডিশিয়াল স্ট্যাম্পে রেজিস্টার্ড পার্টনারশিপ ডিড সম্পাদন করুন।\n৩. সরাসরি সাইট/ফ্যাক্টরি ভিজিট করে ব্যাংক একাউন্টে ট্রান্সফার করুন।";

        return new AuditResult
        {
            OverallTrustScore = overallScore,
            RiskLevel = riskLevel,
            ShariahStatus = shariahStatus,
            ExecutiveSummary = $"{companyName} এর {industry} সংক্রান্ত বিনিয়োগ অফার। ফিনক্স অডিট স্কোর: {overallScore}/100।",
            PayoutFrequency = payoutFreq,
            LockInPeriod = lockIn,
            OfferedSecurity = textLower.Contains("চেক") ? "সিকিউরিটি চেক ও স্ট্যাম্প" : (textLower.Contains("স্ট্যাম্প") ? "স্ট্যাম্প চুক্তি" : "অনির্ধারিত"),
            FinancialSanityScore = finScore,
            FinancialSanityVerdict = finVerdict,
            RegulatoryComplianceScore = regScore,
            RegulatoryVerdict = regVerdict,
            CashflowAndLockInScore = cashScore,
            CashflowVerdict = cashVerdict,
            ShariahComplianceScore = shariahScore,
            ShariahVerdict = shariahVerdict,
            RedFlags = redFlags,
            VerifiedClaims = verifiedClaims,
            RecommendationSummary = recSummary,
            ActionPlan = actionPlan
        };
    }

    private static string ExtractCompanyName(string text)
    {
        var match = Regex.Match(text, @"(?:কোম্পানি|কোম্পানী|প্রতিষ্ঠান|Farm|Group|Capital|Properties|Agro|Trading)\s*:\s*([^\n\r]+)", RegexOptions.IgnoreCase);
        if (match.Success) return match.Groups[1].Value.Trim();

        var firstLine = text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return !string.IsNullOrWhiteSpace(firstLine) && firstLine.Length <= 40 ? firstLine.Trim() : "অজানা ব্যবসায়িক প্রতিষ্ঠান";
    }

    private static string? ExtractContactInfo(string text)
    {
        var match = Regex.Match(text, @"(?:\+?880\s?|0)1[3-9]\d{2}[-\s]?\d{6}");
        return match.Success ? match.Value : null;
    }

    private static decimal? ExtractMonthlyRoi(string text)
    {
        var percentMatch = Regex.Match(text, @"(\d+(?:\.\d+)?)\s*%\s*(?:মাসিক|প্রতি মাসে|লাভ|মুনাফা|ROI)", RegexOptions.IgnoreCase);
        if (percentMatch.Success && decimal.TryParse(percentMatch.Groups[1].Value, out var p)) return p;

        var amountMatch = Regex.Match(text, @"(?:শেয়ারে|প্রতি শেয়ারে|মাসিক লাভ|মাসিক প্রফিট)\s*:\s*(?:৳|টাকা)?\s*(\d{1,3}(?:,\d{3})*|\d+)");
        var shareMatch = Regex.Match(text, @"(?:শেয়ার মূল্য|শেয়ার মূল্য)\s*:\s*(?:৳|টাকা)?\s*(\d{1,3}(?:,\d{3})*|\d+)");

        if (amountMatch.Success && shareMatch.Success)
        {
            var profitStr = amountMatch.Groups[1].Value.Replace(",", "");
            var shareStr = shareMatch.Groups[1].Value.Replace(",", "");
            if (decimal.TryParse(profitStr, out var profit) && decimal.TryParse(shareStr, out var share) && share > 0)
            {
                return Math.Round((profit / share) * 100m, 1);
            }
        }

        return null;
    }

    private static decimal? ExtractMinimumInvestment(string text)
    {
        var match = Regex.Match(text, @"(?:সর্বনিম্ন|শেয়ার মূল্য|শেয়ার মূল্য|শেয়ার প্রতি|বিনিয়োগ মূল্য)\s*:\s*(?:৳|টাকা)?\s*(\d{1,3}(?:,\d{3})*|\d+)");
        if (match.Success)
        {
            var str = match.Groups[1].Value.Replace(",", "");
            if (decimal.TryParse(str, out var amt)) return amt;
        }
        return null;
    }

    private static string DetectIndustry(string text, string companyName)
    {
        var combined = (text + " " + companyName).ToLowerInvariant();
        if (combined.Contains("গরু") || combined.Contains("এগ্রো") || combined.Contains("ফার্ম") || combined.Contains("cattle") || combined.Contains("dairy"))
            return "Agro & Livestock";
        if (combined.Contains("মাছ") || combined.Contains("একুরিয়াম") || combined.Contains("aquarium") || combined.Contains("fish"))
            return "Aquaculture & Fish";
        if (combined.Contains("গার্মেন্ট") || combined.Contains("পোশাক") || combined.Contains("লিবাস") || combined.Contains("textile") || combined.Contains("apparel"))
            return "Garments & Textiles";
        if (combined.Contains("ইমপোর্ট") || combined.Contains("চায়না") || combined.Contains("ট্রেডিং") || combined.Contains("daraz") || combined.Contains("trading"))
            return "Import & E-Commerce";
        if (combined.Contains("প্রোপার্টি") || combined.Contains("ফ্ল্যাট") || combined.Contains("জমি") || combined.Contains("real estate"))
            return "Real Estate & Housing";

        return "Business Partnership";
    }

    private static string? ExtractLocation(string text)
    {
        var match = Regex.Match(text, @"(?:ঠিকানা|অফিস|হেড অফিস|লোকেশন)\s*:\s*([^\n\r]+)", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }
}

public sealed class AuditResult
{
    public int OverallTrustScore { get; set; }
    public string RiskLevel { get; set; } = "HIGH";
    public string ShariahStatus { get; set; } = "DOUBTFUL";
    public string ExecutiveSummary { get; set; } = string.Empty;
    public string? PayoutFrequency { get; set; }
    public string? LockInPeriod { get; set; }
    public string? OfferedSecurity { get; set; }
    public int FinancialSanityScore { get; set; }
    public string FinancialSanityVerdict { get; set; } = string.Empty;
    public int RegulatoryComplianceScore { get; set; }
    public string RegulatoryVerdict { get; set; } = string.Empty;
    public int CashflowAndLockInScore { get; set; }
    public string CashflowVerdict { get; set; } = string.Empty;
    public int ShariahComplianceScore { get; set; }
    public string ShariahVerdict { get; set; } = string.Empty;
    public List<string> RedFlags { get; set; } = new();
    public List<string> VerifiedClaims { get; set; } = new();
    public string RecommendationSummary { get; set; } = string.Empty;
    public string ActionPlan { get; set; } = string.Empty;
}
