using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManager.API.DTOs.Common;
using HotelManager.API.DTOs.User;
using HotelManager.API.Repositories;

namespace HotelManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepo;

    public AdminController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpGet("users")]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (pageSize > 50) pageSize = 50;
        var users = await _userRepo.GetAllAsync(page, pageSize, ct);
        var total = await _userRepo.CountAsync(ct);
        var items = users.Select(u => new UserDto
        {
            Id = u.Id,
            Nome = u.Nome,
            Email = u.Email,
            Role = u.Role,
            CreatedAt = u.CreatedAt
        }).ToList();
        return Ok(new PagedResult<UserDto> { Items = items, Total = total, Page = page, PageSize = pageSize });
    }
}
