using Microsoft.AspNetCore.Mvc;
using Finox.Shared.Application;

namespace Tracker.API.Controllers;

[ApiController]
[Route("api/currencies")]
public class CurrenciesController : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<StringLookupDto>> GetCurrencies()
    {
        return Ok(new[]
        {
            new StringLookupDto("BDT", "BDT", "Bangladeshi Taka"),
            new StringLookupDto("USD", "USD", "US Dollar"),
            new StringLookupDto("EUR", "EUR", "Euro"),
            new StringLookupDto("GBP", "GBP", "British Pound")
        });
    }
}
