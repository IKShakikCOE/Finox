using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finox.Shared.API.Controllers;

/// <summary>
/// Minimal endpoints used to verify the auth pipeline: <c>/api/ping</c> is protected by the
/// global fallback policy, while <c>/api/ping/public</c> opts out with [AllowAnonymous].
/// </summary>
[ApiController]
[Route("api/ping")]
public sealed class PingController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok" });

    [AllowAnonymous]
    [HttpGet("public")]
    public IActionResult GetPublic() => Ok(new { status = "public" });
}
