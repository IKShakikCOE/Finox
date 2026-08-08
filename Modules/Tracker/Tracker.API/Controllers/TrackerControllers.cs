using Finox.Shared.Application;
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

/// <summary>
/// CRUD for categories. Returns hierarchical (parents with children) by default.
/// GET /api/categories/flat returns all categories in a flat list for dropdowns.
/// System categories are visible to all but cannot be modified/deleted.
/// </summary>
[Route("api/categories")]
public sealed class CategoriesController : CrudControllerBase<Category>
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService service) : base(service)
    {
        _categoryService = service;
    }

    /// <summary>Returns parent categories with children nested (hierarchical view).</summary>
    [HttpGet]
    public override async Task<ActionResult<IReadOnlyList<Category>>> List(CancellationToken ct)
    {
        var results = await _categoryService.ListAsync(ct);
        return Ok(results);
    }

    /// <summary>Returns all categories flat (for select dropdowns).</summary>
    [HttpGet("flat")]
    public async Task<ActionResult<IReadOnlyList<Category>>> ListFlat(CancellationToken ct)
    {
        var results = await _categoryService.ListFlatAsync(ct);
        return Ok(results);
    }
}

/// <summary>CRUD for the current user's financial accounts (Requirement 12).</summary>
[Route("api/accounts")]
public sealed class AccountsController : CrudControllerBase<Account>
{
    public AccountsController(ICrudService<Account> service) : base(service) { }
}

/// <summary>
/// CRUD for the current user's budgets (Requirement 13). No bulk-delete per the contract.
/// </summary>
[Route("api/budgets")]
public sealed class BudgetsController : CrudControllerBase<Budget>
{
    public BudgetsController(ICrudService<Budget> service) : base(service) { }

    // Budget contract does not include bulk-delete; hide the base action.
    [NonAction]
    public override Task<IActionResult> BulkDelete(BulkDeleteRequest request, CancellationToken ct)
        => base.BulkDelete(request, ct);
}
