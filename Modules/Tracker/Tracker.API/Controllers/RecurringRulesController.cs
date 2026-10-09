using Finox.Shared.Application;
using Finox.Shared.API.Controllers;
using Tracker.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Tracker.API.Controllers;

[Route("api/recurring")]
public sealed class RecurringRulesController : CrudControllerBase<RecurringRule>
{
    public RecurringRulesController(ICrudService<RecurringRule> service) : base(service) { }
}
