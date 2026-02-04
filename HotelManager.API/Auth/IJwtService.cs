using HotelManager.API.Models;

namespace HotelManager.API.Auth;

public interface IJwtService
{
    string GenerateToken(User user);
}
