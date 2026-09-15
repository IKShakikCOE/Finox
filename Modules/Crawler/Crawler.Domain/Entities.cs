using Finox.Shared.Domain;

namespace Crawler.Domain;

public enum CrawlSourceKind { HTML, PDF }
public enum CatalogDomain { BANK_PRODUCT, INSURANCE_PRODUCT, MUTUAL_FUND }
public enum CrawlSourceApprovalStatus { UNAPPROVED, APPROVED }
public enum CrawlJobState { PENDING, RUNNING, SUCCEEDED, FAILED, SKIPPED }
public enum ExtractionState { PENDING, EXTRACTED, EXTRACTION_FAILED }

public sealed class CrawlSource : IEntity
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;           // HTML | PDF
    public string Domain { get; set; } = string.Empty;         // BANK_PRODUCT | INSURANCE_PRODUCT | MUTUAL_FUND
    public string ApprovalStatus { get; set; } = "UNAPPROVED"; // UNAPPROVED | APPROVED
    public string? UserAgent { get; set; }
    public int CrawlDelaySeconds { get; set; }
    public int RequestTimeoutSeconds { get; set; } = 30;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ModifiedAt { get; set; }
}

public sealed class CrawlSchedule : IEntity
{
    public Guid Id { get; set; }
    public Guid CrawlSourceId { get; set; }
    public int IntervalMinutes { get; set; } // 60–43200 (1h–30d)
    public bool Enabled { get; set; } = true;
}

public sealed class CrawlJob : IEntity
{
    public Guid Id { get; set; }
    public Guid CrawlSourceId { get; set; }
    public string State { get; set; } = "PENDING"; // PENDING | RUNNING | SUCCEEDED | FAILED | SKIPPED
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? FailureReason { get; set; }
    public int? StatusCode { get; set; }
    public DateTimeOffset? ScheduledFor { get; set; }
}

public sealed class RawCrawlRecord : IEntity
{
    public Guid Id { get; set; }
    public Guid CrawlJobId { get; set; }
    public Guid CrawlSourceId { get; set; }
    public string SourceUrl { get; set; } = string.Empty;
    public DateTimeOffset CapturedAt { get; set; } = DateTimeOffset.UtcNow;
    public string ContentKind { get; set; } = string.Empty; // HTML | PDF
    public string RawText { get; set; } = string.Empty;
    public string ExtractionState { get; set; } = "PENDING"; // PENDING | EXTRACTED | EXTRACTION_FAILED
    public int ExtractionAttempts { get; set; }
}

public sealed class ExtractedRecord : IEntity
{
    public Guid Id { get; set; }
    public Guid RawCrawlRecordId { get; set; }
    public string Domain { get; set; } = string.Empty; // BANK_PRODUCT | INSURANCE_PRODUCT | MUTUAL_FUND
    public string PayloadJson { get; set; } = string.Empty; // jsonb
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
