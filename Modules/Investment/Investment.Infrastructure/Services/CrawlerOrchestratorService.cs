using Investment.Application;
using Investment.Domain;
using Investment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investment.Infrastructure.Services;

public sealed class CrawlerOrchestratorService : ICrawlerOrchestratorService
{
    private readonly InvestmentDbContext _db;
    private readonly IFacebookAdCrawlerService _adCrawler;
    private readonly IInvestmentAuditService _auditService;
    private readonly IDeepInvestigatorService _deepInvestigator;
    private readonly ILogger<CrawlerOrchestratorService> _logger;

    private static bool _isRunning = false;
    private static readonly object _lock = new();

    public CrawlerOrchestratorService(
        InvestmentDbContext db,
        IFacebookAdCrawlerService adCrawler,
        IInvestmentAuditService auditService,
        IDeepInvestigatorService deepInvestigator,
        ILogger<CrawlerOrchestratorService> logger)
    {
        _db = db;
        _adCrawler = adCrawler;
        _auditService = auditService;
        _deepInvestigator = deepInvestigator;
        _logger = logger;
    }

    public async Task<CrawlJobRecord> RunCrawlAndInvestigatePipelineAsync(CancellationToken ct = default)
    {
        lock (_lock)
        {
            if (_isRunning)
            {
                throw new InvalidOperationException("A crawl and investigation job is already running.");
            }
            _isRunning = true;
        }

        var job = new CrawlJobRecord
        {
            Id = Guid.NewGuid(),
            StartedAt = DateTime.UtcNow,
            KeywordsSearched = "বিনিয়োগ, হালাল লাভ, শেয়ার ক্রাউডফান্ডিং, এগ্রো খামার পার্টনার, মাসিক মুনাফা",
            Status = "RUNNING"
        };

        await _db.CrawlJobRecords.AddAsync(job, ct);
        await _db.SaveChangesAsync(ct);

        try
        {
            _logger.LogInformation("Starting Facebook Ad Library Crawl & Deep Investigation Pipeline...");

            var ads = await _adCrawler.CrawlActiveAdsAsync(null, ct);
            job.TotalAdsDiscovered = ads.Count;

            int newLeadsCount = 0;

            foreach (var ad in ads)
            {
                // Check if this ad or company is already in database (Incremental crawl)
                var existingLead = await _db.InvestmentLeads
                    .FirstOrDefaultAsync(l => l.FacebookAdId == ad.AdId || l.RawText == ad.AdText, ct);

                if (existingLead != null)
                {
                    // Existing ad: Do not re-audit; mark as confirmed active on this crawl cycle
                    existingLead.IsCampaignActive = true;
                    existingLead.LastVerifiedActiveAt = DateTime.UtcNow;
                    if (string.IsNullOrWhiteSpace(existingLead.FacebookAdUrl) || existingLead.FacebookAdUrl.Contains(Uri.EscapeDataString(ad.PageName)))
                    {
                        existingLead.FacebookAdUrl = ResolveFacebookAdUrl(ad);
                    }
                    await _db.SaveChangesAsync(ct);
                    continue;
                }

                // Step 1: Initial screening & lead creation
                var request = new AuditOfferRequest(
                    RawText: ad.AdText,
                    CompanyName: ad.PageName,
                    SourceChannel: "Facebook Ad",
                    ContactInfo: ad.PhoneNumber
                );

                var lead = await _auditService.AuditAndSaveOfferAsync(request, null, ct);
                lead.FacebookAdId = ad.AdId;
                lead.FacebookPageId = ad.PageId;
                lead.ExternalWebsiteUrl = ad.PrimaryLinkUrl;
                lead.FacebookAdUrl = ResolveFacebookAdUrl(ad);
                lead.IsCampaignActive = true;
                lead.LastVerifiedActiveAt = DateTime.UtcNow;

                // Step 2: Full Deep Autonomous Investigation (/boost style)
                try
                {
                    var deepResult = await _deepInvestigator.ConductDeepInvestigationAsync(lead, ct);
                    lead.DeepInvestigationReportMarkdown = deepResult.MarkdownReport;
                    lead.DomainWhoisSummary = deepResult.DomainWhoisSummary;
                    lead.AppStorePackageSummary = deepResult.AppStorePackageSummary;
                    lead.ReputationSearchSummary = deepResult.ReputationSearchSummary;
                    lead.TrustScore = deepResult.UpdatedTrustScore;
                    lead.RiskLevel = deepResult.UpdatedRiskLevel;
                    lead.ShariahStatus = deepResult.UpdatedShariahStatus;
                    lead.LastDeepInvestigatedAt = DateTime.UtcNow;

                    if (lead.AuditReport != null)
                    {
                        lead.AuditReport.RecommendationSummary = deepResult.RecommendationSummary;
                        lead.AuditReport.ActionPlan = deepResult.ActionPlan;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Deep investigation failed for lead {LeadId}", lead.Id);
                }

                await _db.SaveChangesAsync(ct);
                newLeadsCount++;
            }

            job.NewDealsAudited = newLeadsCount;
            job.Status = "COMPLETED";
            job.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation("Crawl pipeline completed. Found {TotalAds} ads, audited {NewLeads} new deals.",
                job.TotalAdsDiscovered, job.NewDealsAudited);

            return job;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Crawl job failed.");
            job.Status = "FAILED";
            job.ErrorMessage = ex.Message;
            job.CompletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            throw;
        }
        finally
        {
            lock (_lock) { _isRunning = false; }
        }
    }

    public async Task<WeeklyVerificationReport> VerifyActiveCampaignsWeeklyAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Starting Weekly Facebook Ad Campaign Re-Verification Cycle...");

        var allLeads = await _db.InvestmentLeads.ToListAsync(ct);
        int activeCount = 0;
        int inactiveCount = 0;
        var now = DateTime.UtcNow;

        foreach (var lead in allLeads)
        {
            // If an ad has not been verified/seen in recent cycles for more than 7 days, mark inactive
            var daysSinceVerification = lead.LastVerifiedActiveAt.HasValue
                ? (now - lead.LastVerifiedActiveAt.Value).TotalDays
                : (now - lead.CreatedAt).TotalDays;

            if (daysSinceVerification > 7)
            {
                lead.IsCampaignActive = false;
                if (lead.Status == "SCREENED")
                {
                    lead.Status = "EXPIRED";
                }
                inactiveCount++;
            }
            else
            {
                lead.IsCampaignActive = true;
                activeCount++;
            }
        }

        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Weekly campaign re-verification finished: {Total} checked, {Active} active, {Inactive} expired.",
            allLeads.Count, activeCount, inactiveCount);

        return new WeeklyVerificationReport(
            TotalLeadsChecked: allLeads.Count,
            ActiveLeadsCount: activeCount,
            InactiveLeadsCount: inactiveCount,
            VerifiedAt: now
        );
    }

    public async Task<CrawlerStatusDto> GetStatusAsync(CancellationToken ct = default)
    {
        var lastJob = await _db.CrawlJobRecords
            .OrderByDescending(j => j.StartedAt)
            .FirstOrDefaultAsync(ct);

        var totalJobs = await _db.CrawlJobRecords.CountAsync(ct);
        var totalAds = await _db.CrawlJobRecords.SumAsync(j => j.TotalAdsDiscovered, ct);
        var totalLeads = await _db.InvestmentLeads.CountAsync(ct);
        var activeLeads = await _db.InvestmentLeads.CountAsync(l => l.IsCampaignActive, ct);

        var lastVerified = await _db.InvestmentLeads
            .Where(l => l.LastVerifiedActiveAt != null)
            .OrderByDescending(l => l.LastVerifiedActiveAt)
            .Select(l => l.LastVerifiedActiveAt)
            .FirstOrDefaultAsync(ct);

        return new CrawlerStatusDto(
            IsRunning: _isRunning,
            LastRunAt: lastJob?.StartedAt,
            TotalJobsRun: totalJobs,
            TotalAdsDiscovered: totalAds,
            TotalLeadsSaved: totalLeads,
            LastError: lastJob?.ErrorMessage,
            LastWeeklyVerificationAt: lastVerified,
            ActiveLeadsCount: activeLeads
        );
    }

    public async Task<InvestmentLead> DeepInvestigateLeadAsync(Guid leadId, CancellationToken ct = default)
    {
        var lead = await _db.InvestmentLeads
            .Include(l => l.AuditReport)
            .FirstOrDefaultAsync(l => l.Id == leadId, ct);

        if (lead == null)
            throw new KeyNotFoundException($"Investment lead with ID '{leadId}' not found.");

        var deepResult = await _deepInvestigator.ConductDeepInvestigationAsync(lead, ct);

        lead.DeepInvestigationReportMarkdown = deepResult.MarkdownReport;
        lead.DomainWhoisSummary = deepResult.DomainWhoisSummary;
        lead.AppStorePackageSummary = deepResult.AppStorePackageSummary;
        lead.ReputationSearchSummary = deepResult.ReputationSearchSummary;
        lead.TrustScore = deepResult.UpdatedTrustScore;
        lead.RiskLevel = deepResult.UpdatedRiskLevel;
        lead.ShariahStatus = deepResult.UpdatedShariahStatus;
        lead.LastDeepInvestigatedAt = DateTime.UtcNow;

        if (lead.AuditReport != null)
        {
            lead.AuditReport.RecommendationSummary = deepResult.RecommendationSummary;
            lead.AuditReport.ActionPlan = deepResult.ActionPlan;
        }

        await _db.SaveChangesAsync(ct);
        return lead;
    }

    private static string ResolveFacebookAdUrl(FacebookAdSummary ad)
    {
        if (!string.IsNullOrWhiteSpace(ad.FacebookAdUrl))
            return ad.FacebookAdUrl;

        if (long.TryParse(ad.AdId, out _))
            return $"https://www.facebook.com/ads/library/?id={ad.AdId}";

        var text = (ad.PageName + " " + ad.AdText);
        string keyword = "বিনিয়োগ";

        if (text.Contains("কার") || text.Contains("ড্রাইভ") || text.Contains("গাড়ি") || text.Contains("ভেহিকল") || text.Contains("শো-রুম"))
            keyword = "কার শো-রুম";
        else if (text.Contains("এগ্রো") || text.Contains("খামার") || text.Contains("গরু") || text.Contains("ছাগল") || text.Contains("লাইভস্টক"))
            keyword = "এগ্রো খামার";
        else if (text.Contains("মাছ") || text.Contains("ফিশ") || text.Contains("মৎস্য"))
            keyword = "মাছ চাষ";
        else if (text.Contains("ফরেক্স") || text.Contains("ট্রেডিং") || text.Contains("ট্রেডার্স") || text.Contains("রোবট"))
            keyword = "ফরেক্স ট্রেডিং";
        else if (text.Contains("হোটেল") || text.Contains("রিসোর্ট") || text.Contains("সুইট"))
            keyword = "হোটেল রিসোর্ট";
        else if (text.Contains("ই-কমার্স") || text.Contains("লজিস্টিকস"))
            keyword = "ই-কমার্স";
        else if (text.Contains("সোলার") || text.Contains("বিদ্যুৎ") || text.Contains("এনার্জি"))
            keyword = "সোলার প্রজেক্ট";
        else if (text.Contains("পোল্ট্রি") || text.Contains("মুরগি") || text.Contains("টার্কি"))
            keyword = "পোল্ট্রি খামার";
        else if (text.Contains("গোল্ড") || text.Contains("স্বর্ণ") || text.Contains("বুলিয়ন"))
            keyword = "গোল্ড";
        else if (text.Contains("কোল্ড স্টোরেজ") || text.Contains("আলু"))
            keyword = "কোল্ড স্টোরেজ";

        return $"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BD&q={Uri.EscapeDataString(keyword)}&search_type=keyword_unordered";
    }
}
