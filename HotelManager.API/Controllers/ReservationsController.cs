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

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationRequest request, CancellationToken ct)
    {
        var res = await _reservationService.CreateAsync(UserId, request, ct);
        if (res == null)
            return BadRequest(new { message = "Quarto indisponível, datas inválidas ou quarto não encontrado." });
        return CreatedAtAction(nameof(GetById), new { id = res.Id }, res);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ReservationDto>> Cancel(int id, CancellationToken ct)
    {
        var res = await _reservationService.CancelAsync(id, UserId, IsStaff, ct);
        if (res == null) return NotFound();
        return Ok(res);
    }
}
