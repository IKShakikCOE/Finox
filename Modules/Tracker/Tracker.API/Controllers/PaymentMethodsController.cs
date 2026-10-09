using Microsoft.AspNetCore.Mvc;
using Finox.Shared.Application;

namespace Tracker.API.Controllers;

[ApiController]
[Route("api/payment-methods")]
public class PaymentMethodsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<StringLookupDto>> GetPaymentMethods()
    {
        return Ok(new[]
        {
            new StringLookupDto("CASH", "CASH", "Cash"),
            new StringLookupDto("BANK", "BANK", "Bank Transfer"),
            new StringLookupDto("MOBILE_BANKING", "MOBILE_BANKING", "Mobile Banking"),
            new StringLookupDto("CREDIT_CARD", "CREDIT_CARD", "Credit Card")
        });
    }
}
