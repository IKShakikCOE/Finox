namespace Finox.Shared.Application;

/// <summary>Body for <c>POST /api/{resource}/bulk-delete</c>: the ids to remove.</summary>
public sealed class BulkDeleteRequest
{
    public List<Guid> Ids { get; set; } = new();
}

