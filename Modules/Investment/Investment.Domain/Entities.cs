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
