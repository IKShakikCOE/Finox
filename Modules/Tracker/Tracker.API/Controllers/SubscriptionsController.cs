using Finox.Shared.Application;
using Finox.Shared.API.Controllers;
using Tracker.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Tracker.API.Controllers;

[Route("api/subscriptions")]
public sealed class SubscriptionsController : CrudControllerBase<Subscription>
{
    public SubscriptionsController(ICrudService<Subscription> service) : base(service) { }
}
