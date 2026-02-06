using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManager.API.DTOs.Common;
using HotelManager.API.DTOs.Reservation;
using HotelManager.API.Services;
using System.Security.Claims;

namespace HotelManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
    private bool IsStaff => User.IsInRole("Admin") || User.IsInRole("Gerente") || User.IsInRole("Recepcionista");

    [HttpGet("my")]
    public async Task<ActionResult<PagedResult<ReservationDto>>> GetMyReservations([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (pageSize > 50) pageSize = 50;
        var (items, total) = await _reservationService.GetByUserAsync(UserId, page, pageSize, ct);
        return Ok(new PagedResult<ReservationDto> { Items = items, Total = total, Page = page, PageSize = pageSize });
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin,Gerente,Recepcionista")]
    public async Task<ActionResult<PagedResult<ReservationDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (pageSize > 50) pageSize = 50;
        var (items, total) = await _reservationService.GetAllAsync(page, pageSize, ct);
        return Ok(new PagedResult<ReservationDto> { Items = items, Total = total, Page = page, PageSize = pageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationDto>> GetById(int id, CancellationToken ct)
    {
        var res = await _reservationService.GetByIdAsync(id, UserId, IsStaff, ct);
        if (res == null) return NotFound();
        return Ok(res);
    }

    /// <summary>
    /// Retorna se o cancelamento é gratuito ou se será cobrada 1 diária (regra 48h antes do check-in).
    /// </summary>
    [HttpGet("{id:int}/cancellation-info")]
    public async Task<ActionResult<CancellationInfoDto>> GetCancellationInfo(int id, CancellationToken ct)
    {
        var info = await _reservationService.GetCancellationInfoAsync(id, UserId, IsStaff, ct);
        if (info == null) return NotFound();
        return Ok(info);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationRequest request, CancellationToken ct)
    {
        var result = await _reservationService.CreateAsync(UserId, request, ct);
        if (!result.Success)
        {
            var message = result.FailureReason switch
            {
                CreateReservationFailureReason.UserOverlap => "Você já possui uma reserva neste período.",
                CreateReservationFailureReason.RoomConflict => "O quarto não está disponível nas datas escolhidas.",
                CreateReservationFailureReason.RoomUnavailable => "Quarto não encontrado ou bloqueado.",
                CreateReservationFailureReason.InvalidDates => "Datas inválidas ou no passado.",
                _ => "Quarto indisponível, datas inválidas ou quarto não encontrado."
            };
            return BadRequest(new { message, reason = result.FailureReason.ToString(), overlappingReservationIds = result.OverlappingReservationIds });
        }
        var res = result.Reservation!;
        return CreatedAtAction(nameof(GetById), new { id = res.Id }, res);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ReservationDto>> Cancel(int id, [FromBody] CancelReservationRequest? request, CancellationToken ct)
    {
        var result = await _reservationService.CancelAsync(id, UserId, IsStaff, request, ct);
        if (!result.Success && result.Reservation == null && !result.PaymentRequired)
            return NotFound();
        if (result.PaymentRequired)
            return StatusCode(402, new { message = "Pagamento obrigatório para cancelamento.", feeAmount = result.FeeAmount });
        return Ok(result.Reservation);
    }
}
