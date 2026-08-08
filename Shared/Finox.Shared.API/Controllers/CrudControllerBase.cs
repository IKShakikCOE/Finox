using Finox.Shared.Domain;
using Finox.Shared.Application;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Finox.Shared.API.Controllers;

/// <summary>
/// Reusable controller implementing the standard collection contract (Requirement 4):
/// <list type="bullet">
/// <item>GET    /            → 200 T[]</item>
/// <item>POST   /            → 201 T (server-generated id)</item>
/// <item>PUT    /{id}        → 200 T | 404</item>
/// <item>DELETE /{id}        → 204   | 404</item>
/// <item>POST   /bulk-delete → 200</item>
/// </list>
/// Concrete controllers supply the route and the <see cref="ICrudService{T}"/> via the base
/// constructor. Resources that expose only a subset (e.g. Calendar) can hide actions by
/// not deriving from this base or overriding as needed.
/// </summary>
[ApiController]
public abstract class CrudControllerBase<T> : ControllerBase where T : class, IOwnedEntity
{
    protected ICrudService<T> Service { get; }

    protected CrudControllerBase(ICrudService<T> service) => Service = service;

    [HttpGet]
    public virtual async Task<ActionResult<IReadOnlyList<T>>> List(CancellationToken ct)
        => Ok(await Service.ListAsync(ct));

    [HttpPost]
    public virtual async Task<ActionResult<T>> Create([FromBody] T input, CancellationToken ct)
    {
        var created = await Service.CreateAsync(input, ct);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPut("{id}")]
    public virtual async Task<ActionResult<T>> Update(string id, [FromBody] T input, CancellationToken ct)
        => Ok(await Service.UpdateAsync(id, input, ct));

    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await Service.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("bulk-delete")]
    public virtual async Task<IActionResult> BulkDelete([FromBody] BulkDeleteRequest request, CancellationToken ct)
    {
        await Service.BulkDeleteAsync(request.Ids, ct);
        return Ok();
    }
}
