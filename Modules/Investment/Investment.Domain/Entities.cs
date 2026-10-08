using Finox.Shared.Domain;

namespace Investment.Domain;

public sealed class Campaign : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }

    public Guid? PlatformId { get; set; }
    public string? PlatformName { get; set; }
    public string? Name { get; set; }
    public string? Type { get; set; }
    public string? Status { get; set; } // ACTIVE | PAUSED | COMPLETED
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public decimal? Budget { get; set; }
    public decimal? Spent { get; set; }
    public int? Impressions { get; set; }
    public int? Clicks { get; set; }
    public int? Conversions { get; set; }
    public decimal? Revenue { get; set; }
    public decimal? Cpc { get; set; }
    public decimal? Ctr { get; set; }
    public decimal? Roas { get; set; }
}

public sealed class Platform : IEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
}

public sealed class InvestmentLead : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? OfferSummary { get; set; }
    public string? RawText { get; set; }
    public string? SourceChannel { get; set; } // WhatsApp | Facebook Ad | Messenger | Offline | Webhook
    public string? ContactInfo { get; set; }
    public string? Location { get; set; }
    public decimal? MinimumInvestment { get; set; }
    public decimal? PromisedMonthlyReturnPercent { get; set; }
    public string? PayoutFrequency { get; set; }
    public string? LockInPeriod { get; set; }
    public string? OfferedSecurity { get; set; }
    public int TrustScore { get; set; } // 0 - 100
    public string RiskLevel { get; set; } = "HIGH"; // LOW | MODERATE | HIGH | SCAM
    public string ShariahStatus { get; set; } = "NON_COMPLIANT"; // COMPLIANT | DOUBTFUL | NON_COMPLIANT
    public string Status { get; set; } = "SCREENED"; // PENDING | SCREENED | REJECTED | SHORTLISTED | INVESTED
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Deep Intelligence & Crawler Attributes (/boost pipeline)
    public string? FacebookPageId { get; set; }
    public string? FacebookAdId { get; set; }
    public string? FacebookAdUrl { get; set; }
    public string? ExternalWebsiteUrl { get; set; }
    public string? AppPackageName { get; set; }
    public string? DomainWhoisSummary { get; set; }
    public string? AppStorePackageSummary { get; set; }
    public string? ReputationSearchSummary { get; set; }
    public string? DeepInvestigationReportMarkdown { get; set; }
    public DateTime? LastDeepInvestigatedAt { get; set; }
    public bool IsCampaignActive { get; set; } = true;
    public DateTime? LastVerifiedActiveAt { get; set; }

    public AuditReport? AuditReport { get; set; }
}

public sealed class AuditReport : IOwnedEntity
{
    public Guid Id { get; set; }
    public Guid? OwnerId { get; set; }
    public Guid InvestmentLeadId { get; set; }

    // 4 Key Forensic Pillars
    public int FinancialSanityScore { get; set; } // 0-100
    public string FinancialSanityVerdict { get; set; } = string.Empty;

    public int RegulatoryComplianceScore { get; set; } // 0-100
    public string RegulatoryVerdict { get; set; } = string.Empty;

    public int CashflowAndLockInScore { get; set; } // 0-100
    public string CashflowVerdict { get; set; } = string.Empty;

    public int ShariahComplianceScore { get; set; } // 0-100
    public string ShariahVerdict { get; set; } = string.Empty;

    public string RedFlagsJson { get; set; } = "[]";
    public string VerifiedClaimsJson { get; set; } = "[]";
    public string RecommendationSummary { get; set; } = string.Empty;
    public string ActionPlan { get; set; } = string.Empty;
    public DateTime AuditedAt { get; set; } = DateTime.UtcNow;
}

public sealed class CrawlJobRecord : IEntity
{
    public Guid Id { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string KeywordsSearched { get; set; } = string.Empty;
    public int TotalAdsDiscovered { get; set; }
    public int NewDealsAudited { get; set; }
    public string Status { get; set; } = "RUNNING"; // RUNNING | COMPLETED | FAILED
    public string? ErrorMessage { get; set; }
}
