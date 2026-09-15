namespace Finox.Shared.Application;

public record LookupDto(Guid Id, string Name);
public record StringLookupDto(string Id, string Code, string Name);
