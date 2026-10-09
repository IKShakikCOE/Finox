using Investment.Domain;

namespace Investment.Application;

public record FacebookAdSummary(
    string AdId,
    string PageName,
    string? PageId,
    string AdText,
    string? PrimaryLinkUrl,
    string? PhoneNumber,
    DateTime? StartDate,
    string? FacebookAdUrl = null
);

public interface IFacebookAdCrawlerService
{
    Task<IReadOnlyList<FacebookAdSummary>> CrawlActiveAdsAsync(
        IEnumerable<string>? keywords = null,
        CancellationToken ct = default);
}

public record DeepInvestigationResult(
    string MarkdownReport,
    string? DomainWhoisSummary,
    string? AppStorePackageSummary,
    string? ReputationSearchSummary,
    int UpdatedTrustScore,
    string UpdatedRiskLevel,
    string UpdatedShariahStatus,
    IReadOnlyList<string> RedFlags,
    IReadOnlyList<string> VerifiedClaims,
    string RecommendationSummary,
    string ActionPlan
);

public interface IDeepInvestigatorService
{
    Task<DeepInvestigationResult> ConductDeepInvestigationAsync(
        InvestmentLead lead,
        CancellationToken ct = default);
}

public record WeeklyVerificationReport(
    int TotalLeadsChecked,
    int ActiveLeadsCount,
    int InactiveLeadsCount,
    DateTime VerifiedAt
);

public record CrawlerStatusDto(
    bool IsRunning,
    DateTime? LastRunAt,
    int TotalJobsRun,
    int TotalAdsDiscovered,
    int TotalLeadsSaved,
    string? LastError,
    DateTime? LastWeeklyVerificationAt = null,
    int ActiveLeadsCount = 0
);

public interface ICrawlerOrchestratorService
{
    Task<CrawlJobRecord> RunCrawlAndInvestigatePipelineAsync(CancellationToken ct = default);
    Task<CrawlerStatusDto> GetStatusAsync(CancellationToken ct = default);
    Task<InvestmentLead> DeepInvestigateLeadAsync(Guid leadId, CancellationToken ct = default);
    Task<WeeklyVerificationReport> VerifyActiveCampaignsWeeklyAsync(CancellationToken ct = default);
}
