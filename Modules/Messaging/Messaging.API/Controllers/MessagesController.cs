using Finox.Shared.Domain;
using Messaging.Domain;
using Messaging.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Messaging.API.Controllers;

public sealed class SendMessageRequest
{
    public string ReceiverId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public sealed class MarkReadRequest
{
    public string UserId { get; set; } = string.Empty;
}

/// <summary>
/// Messaging endpoints: conversations, contacts, thread, send, mark-read (Requirement 20).
/// Messages are visible to both sender and receiver, so the global owner filter is bypassed
/// for reads (we query by senderId/receiverId directly). Ownership is set to senderId on create.
/// </summary>
[ApiController]
[Route("api/messages")]
public sealed class MessagesController : ControllerBase
{
    private readonly MessagingDbContext _db;
    private readonly ICurrentUser _user;
    private readonly IIdGenerator _idGen;

    public MessagesController(MessagingDbContext db, ICurrentUser user, IIdGenerator idGen)
    {
        _db = db;
        _user = user;
        _idGen = idGen;
    }

    /// <summary>Messages between current user and a peer (Requirement 20.3).</summary>
    [HttpGet]
    public async Task<IActionResult> GetThread([FromQuery] string? userId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ValidationException("The 'userId' query parameter is required.");

        var me = _user.Id;
        var messages = await _db.Set<Message>().IgnoreQueryFilters().AsNoTracking()
            .Where(m => (m.SenderId == me && m.ReceiverId == userId)
                     || (m.SenderId == userId && m.ReceiverId == me))
            .OrderBy(m => m.Timestamp)
            .ToListAsync(ct);

        return Ok(messages);
    }

    /// <summary>Send a message (Requirement 20.5). SenderId is always the current user.</summary>
    [HttpPost]
    public async Task<ActionResult<Message>> Send([FromBody] SendMessageRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.ReceiverId) || string.IsNullOrWhiteSpace(request.Content))
            throw new ValidationException("receiverId and content are required.");

        var msg = new Message
        {
            Id = _idGen.NewId(),
            OwnerId = _user.Id,
            SenderId = _user.Id,
            ReceiverId = request.ReceiverId,
            Content = request.Content,
            Timestamp = DateTimeOffset.UtcNow.ToString("o"),
            Read = false
        };

        _db.Set<Message>().Add(msg);
        await _db.SaveChangesAsync(ct);
        return StatusCode(StatusCodes.Status201Created, msg);
    }

    /// <summary>Mark all messages from a peer as read (Requirement 20.6).</summary>
    [HttpPost("read")]
    public async Task<IActionResult> MarkRead([FromBody] MarkReadRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
            throw new ValidationException("userId is required.");

        var me = _user.Id;
        var unread = await _db.Set<Message>().IgnoreQueryFilters()
            .Where(m => m.SenderId == request.UserId && m.ReceiverId == me && !m.Read)
            .ToListAsync(ct);

        foreach (var m in unread) m.Read = true;
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    /// <summary>Conversations for the current user (Requirement 20.1).</summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(CancellationToken ct)
    {
        var me = _user.Id;
        var messages = await _db.Set<Message>().IgnoreQueryFilters().AsNoTracking()
            .Where(m => m.SenderId == me || m.ReceiverId == me)
            .ToListAsync(ct);

        var conversations = messages
            .GroupBy(m => m.SenderId == me ? m.ReceiverId : m.SenderId)
            .Select(g =>
            {
                var last = g.OrderByDescending(m => m.Timestamp).First();
                return new
                {
                    user = new { id = g.Key, name = g.Key, status = "offline" },
                    lastMessage = last.Content,
                    lastMessageTime = last.Timestamp,
                    unreadCount = g.Count(m => m.ReceiverId == me && !m.Read)
                };
            })
            .ToList();

        return Ok(conversations);
    }

    /// <summary>Chat contacts (Requirement 20.2). Placeholder: returns distinct peers.</summary>
    [HttpGet("contacts")]
    public async Task<IActionResult> GetContacts(CancellationToken ct)
    {
        var me = _user.Id;
        var peers = await _db.Set<Message>().IgnoreQueryFilters().AsNoTracking()
            .Where(m => m.SenderId == me || m.ReceiverId == me)
            .Select(m => m.SenderId == me ? m.ReceiverId : m.SenderId)
            .Distinct()
            .ToListAsync(ct);

        var contacts = peers.Select(p => new { id = p, name = p, status = "offline" }).ToList();
        return Ok(contacts);
    }
}
