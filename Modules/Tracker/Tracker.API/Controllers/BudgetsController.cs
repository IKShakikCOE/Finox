using Finox.Shared.Application;
using Finox.Shared.API.Controllers;
using Tracker.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Tracker.API.Controllers;

/// <summary>
/// CRUD for the current user's budgets (Requirement 13). No bulk-delete per the contract.
/// </summary>
[Route("api/budgets")]
public sealed class BudgetsController : CrudControllerBase<Budget>
{
    public BudgetsController(ICrudService<Budget> service) : base(service) { }

    // Budget contract does not include bulk-delete; hide the base action.
    [NonAction]
    public override Task<IActionResult> BulkDelete([FromBody] IReadOnlyCollection<Guid> ids, CancellationToken ct)
        => base.BulkDelete(ids, ct);
}



