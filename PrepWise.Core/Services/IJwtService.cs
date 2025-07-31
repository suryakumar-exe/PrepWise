using PrepWise.Core.Entities;

namespace PrepWise.Core.Services;

public interface IJwtService
{
    string GenerateToken(User user);
    bool ValidateToken(string token);
    int? GetUserIdFromToken(string token);
} 