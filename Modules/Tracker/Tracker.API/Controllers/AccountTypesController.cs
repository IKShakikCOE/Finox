using Microsoft.AspNetCore.Mvc;
using Finox.Shared.Application;

namespace Tracker.API.Controllers;

[ApiController]
[Route("api/account-types")]
public class AccountTypesController : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<StringLookupDto>> GetAccountTypes()
    {
        return Ok(new[]
        {
            new StringLookupDto("CASH", "CASH", "Cash"),
            new StringLookupDto("BANK", "BANK", "Bank"),
            new StringLookupDto("CREDIT_CARD", "CREDIT_CARD", "Credit Card"),
            new StringLookupDto("MOBILE_BANKING", "MOBILE_BANKING", "Mobile Banking")
        });
    }
}
