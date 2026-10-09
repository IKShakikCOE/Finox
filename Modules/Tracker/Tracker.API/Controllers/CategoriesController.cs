using Finox.Shared.API.Controllers;
using Tracker.Application;
using Tracker.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Tracker.API.Controllers;

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

    /// <summary>Returns subcategories for a given parent category.</summary>
    [HttpGet("{id}/subcategories")]
    public async Task<ActionResult<IReadOnlyList<Category>>> GetSubcategories(Guid id, CancellationToken ct)
    {
        var results = await _categoryService.GetSubcategoriesAsync(id, ct);
        return Ok(results);
    }
}



