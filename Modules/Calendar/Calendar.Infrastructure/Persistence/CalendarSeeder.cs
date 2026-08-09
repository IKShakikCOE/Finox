using Calendar.Domain;
using Microsoft.EntityFrameworkCore;

namespace Calendar.Infrastructure.Persistence;

public static class CalendarSeeder
{
    public static async Task SeedAsync(CalendarDbContext db)
    {
        var ownerIds = new[] { "", "USR001", "admin" };
        var today = DateTime.UtcNow;

        foreach (var ownerId in ownerIds)
        {
            var prefix = string.IsNullOrEmpty(ownerId) ? "sys" : ownerId;

            var evt1Id = $"evt-1-{prefix}";
            var evt2Id = $"evt-2-{prefix}";
            var evt3Id = $"evt-3-{prefix}";
            var evt4Id = $"evt-4-{prefix}";
            var evt5Id = $"evt-5-{prefix}";

            if (!await db.CalendarEvents.IgnoreQueryFilters().AnyAsync(e => e.Id == evt1Id))
            {
                await db.CalendarEvents.AddAsync(new CalendarEvent
                {
                    Id = evt1Id,
                    OwnerId = ownerId,
                    Title = "Monthly SIP - IDLC Balanced Fund",
                    Date = today.AddDays(2).ToString("yyyy-MM-dd"),
                    Time = "10:00",
                    Type = "PAYMENT",
                    Description = "Auto-debit ৳ 20,000 for IDLC Mutual Fund SIP",
                    Color = "#3B82F6"
                });
            }

            if (!await db.CalendarEvents.IgnoreQueryFilters().AnyAsync(e => e.Id == evt2Id))
            {
                await db.CalendarEvents.AddAsync(new CalendarEvent
                {
                    Id = evt2Id,
                    OwnerId = ownerId,
                    Title = "DBBL FDR Maturity",
                    Date = today.AddDays(5).ToString("yyyy-MM-dd"),
                    Time = "11:30",
                    Type = "PAYMENT",
                    Description = "Fixed deposit maturity credit - ৳ 50,000 + interest",
                    Color = "#10B981"
                });
            }

            if (!await db.CalendarEvents.IgnoreQueryFilters().AnyAsync(e => e.Id == evt3Id))
            {
                await db.CalendarEvents.AddAsync(new CalendarEvent
                {
                    Id = evt3Id,
                    OwnerId = ownerId,
                    Title = "City Bank Credit Card Bill Due",
                    Date = today.AddDays(8).ToString("yyyy-MM-dd"),
                    Time = "17:00",
                    Type = "DEADLINE",
                    Description = "Total due ৳ 12,500 payment deadline",
                    Color = "#EF4444"
                });
            }

            if (!await db.CalendarEvents.IgnoreQueryFilters().AnyAsync(e => e.Id == evt4Id))
            {
                await db.CalendarEvents.AddAsync(new CalendarEvent
                {
                    Id = evt4Id,
                    OwnerId = ownerId,
                    Title = "MetLife Insurance Premium",
                    Date = today.AddDays(12).ToString("yyyy-MM-dd"),
                    Time = "09:00",
                    Type = "PAYMENT",
                    Description = "Quarterly health insurance premium ৳ 8,500",
                    Color = "#F59E0B"
                });
            }

            if (!await db.CalendarEvents.IgnoreQueryFilters().AnyAsync(e => e.Id == evt5Id))
            {
                await db.CalendarEvents.AddAsync(new CalendarEvent
                {
                    Id = evt5Id,
                    OwnerId = ownerId,
                    Title = "Monthly Budget & Portfolio Review",
                    Date = today.AddDays(15).ToString("yyyy-MM-dd"),
                    Time = "20:00",
                    Type = "MEETING",
                    Description = "Review asset allocation and monthly expenditure",
                    Color = "#8B5CF6"
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
