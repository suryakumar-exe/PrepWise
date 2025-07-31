using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using PrepWise.Core.Entities;
using PrepWise.Core.Services;
using PrepWise.Infrastructure.Data;
using BCrypt.Net;

namespace PrepWise.API.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class AuthMutations
{
    [GraphQLDescription("Register a new user")]
    public async Task<AuthResult> Register(
        string email,
        string password,
        string firstName,
        string lastName,
        string? phoneNumber,
        [Service] PrepWiseDbContext context,
        [Service] IJwtService jwtService)
    {
        // Check if user already exists
        var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existingUser != null)
        {
            return new AuthResult
            {
                Success = false,
                Message = "User with this email already exists"
            };
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        // Create new user
        var user = new User
        {
            Email = email,
            PasswordHash = passwordHash,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Generate JWT token
        var token = jwtService.GenerateToken(user);

        return new AuthResult
        {
            Success = true,
            Message = "Registration successful",
            Token = token,
            User = user
        };
    }

    [GraphQLDescription("Login user")]
    public async Task<AuthResult> Login(
        string email,
        string password,
        [Service] PrepWiseDbContext context,
        [Service] IJwtService jwtService)
    {
        // Find user by email
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user == null)
        {
            return new AuthResult
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return new AuthResult
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        // Generate JWT token
        var token = jwtService.GenerateToken(user);

        return new AuthResult
        {
            Success = true,
            Message = "Login successful",
            Token = token,
            User = user
        };
    }
}

public class AuthResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public User? User { get; set; }
} 