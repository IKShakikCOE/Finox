using Calendar.Domain;
using Microsoft.EntityFrameworkCore;

namespace Calendar.Infrastructure.Persistence;

public static class CalendarSeeder
{
    public static async Task SeedAsync(DbContext db)
    {
        if (db is not CalendarDbContext calDb) return;

        if (await calDb.CalendarEvents.AnyAsync()) return;

        var events = new List<CalendarEvent>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "NBR Individual Income Tax Return Deadline",
                Date = "2026-11-30",
                Time = "23:59",
                Type = "DEADLINE",
                Description = "Last date for Bangladeshi individual resident taxpayers to submit their annual tax returns for Assessment Year 2026-27 without penalty.",
                Color = "#EF4444"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Quarterly Advance Income Tax (AIT) Installment",
                Date = "2026-10-15",
                Time = "17:00",
                Type = "PAYMENT",
                Description = "Second installment of Advance Income Tax due date for professionals and business individuals.",
                Color = "#F59E0B"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Monthly Utility Bills Payment Due Date",
                Date = "2026-10-25",
                Time = "20:00",
                Type = "PAYMENT",
                Description = "Electricity (DESCO/DPDC), WASA Water bill, and Broadband internet invoice payment cutoff to avoid late surcharge.",
                Color = "#3B82F6"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Bangladesh Bank Monetary Policy Review Meeting",
                Date = "2026-10-28",
                Time = "15:00",
                Type = "MEETING",
                Description = "Quarterly MPC session announcing national policy repo interest rates and liquidity guidance.",
                Color = "#10B981"
            }
        };

        await calDb.CalendarEvents.AddRangeAsync(events);
        await calDb.SaveChangesAsync();
    }
}
