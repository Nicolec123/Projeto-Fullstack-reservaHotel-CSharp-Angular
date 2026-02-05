using System.Diagnostics;

namespace HotelManager.API.Middleware;

/// <summary>
/// Middleware que registra um audit trail estruturado (Serilog) para cada requisição HTTP.
/// Inclui: método, path, status, duração, usuário (quando autenticado), IP.
/// </summary>
public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditMiddleware> _logger;

    public AuditMiddleware(RequestDelegate next, ILogger<AuditMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? "";
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "";
        var userId = context.User?.FindFirst("sub")?.Value
                     ?? context.User?.FindFirst("userId")?.Value
                     ?? context.User?.Identity?.Name
                     ?? "";

        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();
            var statusCode = context.Response.StatusCode;

            _logger.LogInformation(
                "Audit: {Method} {Path} => {StatusCode} em {ElapsedMs}ms | UserId={UserId} | Ip={ClientIp}",
                method, path, statusCode, sw.ElapsedMilliseconds,
                string.IsNullOrEmpty(userId) ? "(anon)" : userId,
                ip);
        }
    }
}
