using Finox.Shared.Domain;

namespace News.Domain;

public sealed class Article : IEntity
{
    public string Id { get; set; } = string.Empty;
    public string? Category { get; set; } // News | Tips | Advice | Books | Learning
    public string Title { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string? Content { get; set; } // full body (HTML/Markdown) for detail view
    public string? Author { get; set; }
    public string? Date { get; set; }
    public string? ReadTime { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Image { get; set; }
    public bool Featured { get; set; }
}

public sealed class Platform : IEntity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
}
