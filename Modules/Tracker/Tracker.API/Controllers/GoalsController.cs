using Finox.Shared.Application;
using Finox.Shared.API.Controllers;
using Tracker.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Tracker.API.Controllers;

[Route("api/goals")]
public sealed class GoalsController : CrudControllerBase<Goal>
{
    public GoalsController(ICrudService<Goal> service) : base(service) { }
}
