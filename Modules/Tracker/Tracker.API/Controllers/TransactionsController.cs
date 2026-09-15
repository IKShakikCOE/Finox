using Finox.Shared.API.Controllers;
using Tracker.Application;
using Tracker.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Tracker.API.Controllers;

/// <summary>
/// CRUD + filtered list for the current user's transactions (Requirement 10).
/// Supports <c>?type=INCOME|EXPENSE</c> and <c>?search=</c> query params.
/// </summary>
[Route("api/transactions")]
public sealed class TransactionsController : CrudControllerBase<Transaction>
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService service) : base(service)
    {
        _transactionService = service;
    }

    [HttpGet]
    public override async Task<ActionResult<IReadOnlyList<Transaction>>> List(CancellationToken ct)
    {
        var type = HttpContext.Request.Query["type"].FirstOrDefault();
        var search = HttpContext.Request.Query["search"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(type) && string.IsNullOrWhiteSpace(search))
        {
            return Ok(await _transactionService.ListAsync(ct));
        }

        var results = await _transactionService.ListAsync(type, search, ct);
        return Ok(results);
    }
}



