using Finox.Shared.Application;
using Finox.Shared.API.Controllers;
using Tracker.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Tracker.API.Controllers;

/// <summary>CRUD for the current user's financial accounts (Requirement 12).</summary>
[Route("api/accounts")]
public sealed class AccountsController : CrudControllerBase<Account>
{
    public AccountsController(ICrudService<Account> service) : base(service) { }

    [HttpGet("lookup")]
    public async Task<ActionResult<IReadOnlyList<LookupDto>>> Lookup(CancellationToken ct)
    {
        var accounts = await Service.ListAsync(ct);
        var lookup = accounts.Select(a => new LookupDto(a.Id!, a.Name)).ToList();
        return Ok(lookup);
    }
}



