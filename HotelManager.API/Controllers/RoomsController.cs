using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManager.API.DTOs.Common;
using HotelManager.API.DTOs.Room;
using HotelManager.API.Services;

namespace HotelManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<RoomDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (pageSize > 50) pageSize = 50;
        var (items, total) = await _roomService.GetAllAsync(page, pageSize, ct);
        return Ok(new PagedResult<RoomDto> { Items = items, Total = total, Page = page, PageSize = pageSize });
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<RoomDto>> GetById(int id, CancellationToken ct)
    {
        var room = await _roomService.GetByIdAsync(id, ct);
        if (room == null) return NotFound();
        return Ok(room);
    }

    [HttpGet("available")]
    [AllowAnonymous]
    public async Task<ActionResult<List<RoomDto>>> GetAvailable([FromQuery] DateTime dataInicio, [FromQuery] DateTime dataFim, CancellationToken ct)
    {
        var rooms = await _roomService.GetAvailableAsync(dataInicio, dataFim, ct);
        return Ok(rooms);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Gerente")]
    public async Task<ActionResult<RoomDto>> Create([FromBody] CreateRoomRequest request, CancellationToken ct)
    {
        var room = await _roomService.CreateAsync(request, ct);
        if (room == null) return BadRequest(new { message = "Número de quarto já existe." });
        return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Gerente,Recepcionista")]
    public async Task<ActionResult<RoomDto>> Update(int id, [FromBody] UpdateRoomRequest request, CancellationToken ct)
    {
        var room = await _roomService.UpdateAsync(id, request, ct);
        if (room == null) return NotFound();
        return Ok(room);
    }
}
