using Finox.Shared.Domain;

namespace Investment.Domain;

public sealed class Campaign : IOwnedEntity
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    public string? PlatformId { get; set; }
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
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
}
