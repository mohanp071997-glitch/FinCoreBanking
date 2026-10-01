using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FinCoreBanking.API.Controllers
{
    // Provides authentication-related APIs.
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        // Injects the database context.
        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Registers a new user and assigns the Customer role.
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            // Checks whether the email is already registered.
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == request.Email);

            if (existingUser != null)
            {
                return BadRequest("Email is already registered.");
            }

            // Creates a new user.
            var user = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            // Adds the user to the Users table.
            _context.Users.Add(user);

            // Saves the user to generate the UserId.
            await _context.SaveChangesAsync();

            // Gets the Customer role from the database.
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.RoleName == "Customer");

            if (customerRole == null)
            {
                return StatusCode(500, "Customer role not found.");
            }

            // Assigns the Customer role to the new user.
            var userRole = new UserRole
            {
                UserId = user.UserId,
                RoleId = customerRole.RoleId
            };

            // Adds the user-role mapping to the UserRoles table.
            _context.UserRoles.Add(userRole);

            // Saves the user-role mapping to the database.
            await _context.SaveChangesAsync();

            // Returns the newly created user information.
            return Ok(new
            {
                user.UserId,
                user.UserName,
                user.Email,
                Role = customerRole.RoleName
            });
        }

        // Logs in an existing user.
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            // Finds the user using the registered email.
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == request.Email);

            // Returns an error if the user does not exist.
            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Checks whether the user account is active.
            if (!user.IsActive)
            {
                return Unauthorized("User account is inactive.");
            }

            // Verifies the entered password against the stored password hash.
            var isPasswordValid = BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash
            );

            // Returns an error if the password is incorrect.
            if (!isPasswordValid)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Gets the role assigned to the user.
            var role = await _context.UserRoles
                .Where(x => x.UserId == user.UserId)
                .Join(
                    _context.Roles,
                    userRole => userRole.RoleId,
                    role => role.RoleId,
                    (userRole, role) => role.RoleName
                )
                .FirstOrDefaultAsync();

            // Updates the user's last successful login time.
            user.LastLoginDate = DateTime.UtcNow;

            // Saves the last successful login time.
            await _context.SaveChangesAsync();

            // Generates a JWT token for the user.
            var token = GenerateJwtToken(user, role);


            // Returns the login response.
            return Ok(new
            {
                user.UserId,
                user.UserName,
                user.Email,
                user.LastLoginDate,
                Role = role,
                Token = token
            });
        }

        // Changes the password for the authenticated user.
        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(
            ChangePasswordRequest request)
        {
            // Gets the logged-in user ID from the JWT token.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            // Gets the authenticated user.
            var user = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.IsActive);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Verifies the current password.
            var isCurrentPasswordValid =
                BCrypt.Net.BCrypt.Verify(
                    request.CurrentPassword,
                    user.PasswordHash
                );

            if (!isCurrentPasswordValid)
            {
                return BadRequest("Current password is incorrect.");
            }

            // Checks whether the new password matches confirmation.
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(
                    "New password and confirm password do not match."
                );
            }

            // Validates the new password length.
            if (request.NewPassword.Length < 8)
            {
                return BadRequest(
                    "Password must contain at least 8 characters."
                );
            }

            // Prevents using the current password again.
            if (BCrypt.Net.BCrypt.Verify(
                request.NewPassword,
                user.PasswordHash))
            {
                return BadRequest(
                    "New password must be different from the current password."
                );
            }

            // Creates a new password hash.
            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // Updates the modified date.
            user.ModifiedDate = DateTime.UtcNow;

            // Saves the new password.
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Password changed successfully."
            });
        }

        // Generates a JWT token for the authenticated user.
        private string GenerateJwtToken(User user, string? role)
        {
            var jwtKey = _configuration["JwtSettings:Key"];
            var jwtIssuer = _configuration["JwtSettings:Issuer"];
            var jwtAudience = _configuration["JwtSettings:Audience"];

            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, role ?? string.Empty)
    };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey!)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var expiryMinutes = _configuration
                .GetValue<int>("JwtSettings:ExpiryMinutes");

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}