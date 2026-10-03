using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using FinCoreBanking.API.Models;
using FinCoreBanking.API.Services;
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
        private readonly EmailService _emailService;


        // Injects the database context.
        public AuthController(ApplicationDbContext context, IConfiguration configuration, EmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
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

        // Logs in the user and starts two-factor authentication when enabled.
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Finds the active user by email.
            var user = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Email == request.Email &&
                    x.IsActive);

            // Returns an error when the user is not found.
            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            
            // Verifies the entered password.
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                // Sends a failed login email when login alerts are enabled.
                await SendFailedLoginEmailAsync(user);

                // Returns an invalid login response.
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
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

            // Returns an error when the role is not configured.
            if (role == null)
            {
                return BadRequest("User role is not configured.");
            }

            // Checks whether two-factor authentication is enabled.
            if (user.IsTwoFactorEnabled)
            {
                // Invalidates previous unused OTPs.
                var previousOtps = await _context.TwoFactorOtps
                    .Where(x =>
                        x.UserId == user.UserId &&
                        !x.IsUsed)
                    .ToListAsync();

                foreach (var previousOtp in previousOtps)
                {
                    previousOtp.IsUsed = true;
                }

                // Generates a six-digit OTP.
                var otp = Random.Shared
                    .Next(100000, 1000000)
                    .ToString();

                // Sets the OTP expiry time to five minutes.
                var expiresAt = DateTime.UtcNow.AddMinutes(5);

                // Creates the new OTP record.
                var otpRecord = new TwoFactorOtp
                {
                    UserId = user.UserId,
                    OtpCode = otp,
                    ExpiresAt = expiresAt,
                    IsUsed = false,
                    CreatedDate = DateTime.UtcNow
                };

                // Saves the OTP record.
                _context.TwoFactorOtps.Add(otpRecord);

                await _context.SaveChangesAsync();

                // Sends the OTP to the registered email address.
                await _emailService.SendOtpEmailAsync(
                    user.Email!,
                    otp);

                // Returns only the 2FA challenge information.
                return Ok(new
                {
                    requiresTwoFactor = true,
                    userId = user.UserId,
                    email = user.Email,
                    message = "OTP sent to your registered email address."
                });
            }

            // Updates the last login date for users without 2FA.
            user.LastLoginDate = DateTime.UtcNow;

            // Saves the login date.
            await _context.SaveChangesAsync();

            // Generates the JWT token.
            var token = GenerateJwtToken(user, role);

            // Sends a successful login email when login alerts are enabled.
            await SendLoginEmailAsync(user);


            // Returns the normal login response.
            return Ok(new
            {
                userId = user.UserId,
                userName = user.UserName,
                email = user.Email,
                role = role,
                lastLoginDate = user.LastLoginDate,
                token = token
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

        // Sets the transaction MPIN for the authenticated user.
        [Authorize]
        [HttpPost("set-mpin")]
        public async Task<IActionResult> SetMpin(
            SetMpinRequest request)
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

            // Checks whether an MPIN already exists.
            if (!string.IsNullOrWhiteSpace(user.MpinHash))
            {
                return BadRequest(
                    "MPIN is already configured. Please use Change MPIN."
                );
            }

            // Validates the MPIN format.
            if (!System.Text.RegularExpressions.Regex.IsMatch(
                request.NewMpin,
                @"^\d{4}$"))
            {
                return BadRequest(
                    "MPIN must contain exactly 4 digits."
                );
            }

            // Checks whether both MPIN values match.
            if (request.NewMpin != request.ConfirmMpin)
            {
                return BadRequest(
                    "New MPIN and confirm MPIN do not match."
                );
            }

            // Hashes the MPIN before storing it.
            user.MpinHash =
                BCrypt.Net.BCrypt.HashPassword(request.NewMpin);

            // Updates the modified date.
            user.ModifiedDate = DateTime.UtcNow;

            // Saves the MPIN.
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Transaction MPIN created successfully."
            });
        }

        // Gets the MPIN configuration status.
        [Authorize]
        [HttpGet("mpin-status")]
        public async Task<IActionResult> GetMpinStatus()
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

            // Checks whether an MPIN has been configured.
            var isMpinConfigured =
                !string.IsNullOrWhiteSpace(user.MpinHash);

            return Ok(new
            {
                isMpinConfigured
            });
        }

        // Changes the transaction MPIN for the authenticated user.
        [Authorize]
        [HttpPut("change-mpin")]
        public async Task<IActionResult> ChangeMpin(
            ChangeMpinRequest request)
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

            // Checks whether an MPIN has been configured.
            if (string.IsNullOrWhiteSpace(user.MpinHash))
            {
                return BadRequest(
                    "MPIN is not configured. Please create an MPIN first."
                );
            }

            // Verifies the current MPIN.
            var isCurrentMpinValid =
                BCrypt.Net.BCrypt.Verify(
                    request.CurrentMpin,
                    user.MpinHash
                );

            if (!isCurrentMpinValid)
            {
                return BadRequest("Current MPIN is incorrect.");
            }

            // Validates the new MPIN format.
            if (!System.Text.RegularExpressions.Regex.IsMatch(
                request.NewMpin,
                @"^\d{4}$"))
            {
                return BadRequest(
                    "MPIN must contain exactly 4 digits."
                );
            }

            // Checks whether both MPIN values match.
            if (request.NewMpin != request.ConfirmMpin)
            {
                return BadRequest(
                    "New MPIN and confirm MPIN do not match."
                );
            }

            // Prevents using the current MPIN again.
            if (BCrypt.Net.BCrypt.Verify(
                request.NewMpin,
                user.MpinHash))
            {
                return BadRequest(
                    "New MPIN must be different from the current MPIN."
                );
            }

            // Creates a new MPIN hash.
            user.MpinHash =
                BCrypt.Net.BCrypt.HashPassword(request.NewMpin);

            // Updates the modified date.
            user.ModifiedDate = DateTime.UtcNow;

            // Saves the new MPIN.
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Transaction MPIN changed successfully."
            });
        }

        // Updates the two-factor authentication setting.
        [Authorize]
        [HttpPut("two-factor")]
        public async Task<IActionResult> UpdateTwoFactor(
            TwoFactorRequest request)
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

            // Updates the two-factor authentication status.
            user.IsTwoFactorEnabled = request.Enabled;

            // Updates the modified date.
            user.ModifiedDate = DateTime.UtcNow;

            // Saves the setting.
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.Enabled
                    ? "Two-factor authentication enabled successfully."
                    : "Two-factor authentication disabled successfully.",
                isTwoFactorEnabled = user.IsTwoFactorEnabled
            });
        }

        // Gets the current two-factor authentication status.
        [Authorize]
        [HttpGet("two-factor-status")]
        public async Task<IActionResult> GetTwoFactorStatus()
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

            return Ok(new
            {
                isTwoFactorEnabled = user.IsTwoFactorEnabled
            });
        }

        // Generates a new OTP for two-factor authentication.
        [Authorize]
        [HttpPost("generate-otp")]
        public async Task<IActionResult> GenerateOtp()
        {
            // Gets the logged-in user ID from the JWT token.
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

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

            // Checks whether two-factor authentication is enabled.
            if (!user.IsTwoFactorEnabled)
            {
                return BadRequest(
                    "Two-factor authentication is not enabled."
                );
            }

            // Marks previous unused OTPs as used.
            var existingOtps = await _context.TwoFactorOtps
                .Where(x =>
                    x.UserId == userId &&
                    !x.IsUsed)
                .ToListAsync();

            foreach (var otp in existingOtps)
            {
                otp.IsUsed = true;
            }

            // Generates a six-digit OTP.
            var random = new Random();

            var otpCode = random
                .Next(100000, 1000000)
                .ToString();

            // Creates the OTP record.
            var twoFactorOtp = new TwoFactorOtp
            {
                UserId = userId,
                OtpCode = otpCode,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                CreatedDate = DateTime.UtcNow
            };

            // Saves the OTP.
            _context.TwoFactorOtps.Add(twoFactorOtp);

            await _context.SaveChangesAsync();

            // Returns the OTP for demo/testing purposes.
            return Ok(new
            {
                message = "OTP generated successfully.",
                otp = otpCode,
                expiresAt = twoFactorOtp.ExpiresAt
            });
        }

        // Sends a test OTP to the user's registered email address.
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendTestOtp([FromBody] int userId)
        {
            // Gets the user by user ID.
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.UserId == userId);

            // Returns an error if the user does not exist.
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Returns an error if the user email is not configured.
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return BadRequest("User email is not configured.");
            }

            // Generates a six-digit OTP.
            var otp = Random.Shared.Next(100000, 1000000).ToString();

            // Sets the OTP expiry time to five minutes.
            var expiresAt = DateTime.UtcNow.AddMinutes(5);

            // Creates the OTP database record.
            var otpRecord = new TwoFactorOtp
            {
                UserId = user.UserId,
                OtpCode = otp,
                ExpiresAt = expiresAt,
                IsUsed = false,
                CreatedDate = DateTime.UtcNow
            };

            // Adds the OTP record to the database.
            _context.TwoFactorOtps.Add(otpRecord);

            // Saves the OTP record.
            await _context.SaveChangesAsync();

            // Sends the OTP to the registered email address.
            await _emailService.SendOtpEmailAsync(user.Email, otp);

            // Returns a success response without exposing the OTP.
            return Ok(new
            {
                message = "OTP sent successfully."
            });
        }

        // Verifies the OTP and issues the JWT token.
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(
            [FromBody] VerifyOtpRequest request)
        {
            // Finds the user by user ID.
            var user = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.UserId == request.UserId &&
                    x.IsActive);

            // Returns an error if the user is not found.
            if (user == null)
            {
                return Unauthorized("Invalid user.");
            }

            // Finds the latest unused OTP for the user.
            var otpRecord = await _context.TwoFactorOtps
                .Where(x =>
                    x.UserId == request.UserId &&
                    !x.IsUsed &&
                    x.OtpCode == request.OtpCode)
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            // Returns an error if the OTP is invalid.
            // Handles an invalid OTP attempt.
            if (otpRecord == null)
            {
                // Sends a failed OTP email.
                await SendFailedOtpEmailAsync(user);

                // Returns an invalid OTP response.
                return Unauthorized(new
                {
                    message = "Invalid OTP."
                });
            }

            // Checks whether the OTP has expired.
            if (otpRecord.ExpiresAt < DateTime.UtcNow)
            {
                // Sends an expired OTP email.
                await SendExpiredOtpEmailAsync(user);

                // Returns an expired OTP response.
                return Unauthorized(new
                {
                    message = "OTP has expired."
                });
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

            // Returns an error if the role is not configured.
            if (role == null)
            {
                return BadRequest("User role is not configured.");
            }

            // Marks the OTP as used.
            otpRecord.IsUsed = true;

            // Updates the user's last login date.
            user.LastLoginDate = DateTime.UtcNow;

            // Saves the OTP and login changes.
            await _context.SaveChangesAsync();

            await CreateLoginNotificationAsync(user.UserId);

            // Sends a successful login email when login alerts are enabled.
            await SendLoginEmailAsync(user);

            // Generates the JWT token after successful OTP verification.
            var token = GenerateJwtToken(user, role);

            // Returns the authentication response.
            return Ok(new
            {
                userId = user.UserId,
                userName = user.UserName,
                email = user.Email,
                role = role,
                lastLoginDate = user.LastLoginDate,
                token = token
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

        // Creates a login notification for the user.
        private async Task CreateLoginNotificationAsync(int userId)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = "New Login Detected",
                Message = "Your FinCore Banking account was logged in successfully.",
                NotificationType = "Login",
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();
        }

        // Sends a successful login email when login alerts are enabled.
        private async Task SendLoginEmailAsync(User user)
        {
            // Gets the user's notification settings.
            var settings = await _context.UserNotificationSettings
                .FirstOrDefaultAsync(x => x.UserId == user.UserId);

            // Stops the email when login alerts are disabled.
            if (settings == null || !settings.LoginAlerts)
            {
                return;
            }

            // Gets the current login date and time.
            var loginDateTime = DateTime.Now;

            // Gets the client IP address.
            var ipAddress =
                HttpContext.Connection.RemoteIpAddress?.ToString()
                ?? "Unknown";

            // Creates the email placeholder values.
            var placeholders = new Dictionary<string, string>
            {
                ["{{UserName}}"] = user.UserName,
                ["{{LoginDate}}"] = loginDateTime.ToString("dd-MMM-yyyy"),
                ["{{LoginTime}}"] = loginDateTime.ToString("hh:mm tt"),
                ["{{Device}}"] = "Web Browser",
                ["{{IPAddress}}"] = ipAddress,
                ["{{CurrentYear}}"] = loginDateTime.Year.ToString()
            };

            // Sends the successful login email using the database template.
            await _emailService.SendTemplateEmailAsync(
                user.Email,
                "SuccessfulLogin",
                placeholders);
        }

        // Sends a failed login email when login alerts are enabled.
        private async Task SendFailedLoginEmailAsync(User user)
        {
            // Gets the user's notification settings.
            var settings = await _context.UserNotificationSettings
                .FirstOrDefaultAsync(x => x.UserId == user.UserId);

            // Stops email sending when login alerts are disabled.
            if (settings == null || !settings.LoginAlerts)
            {
                return;
            }

            // Creates the email placeholders.
            var placeholders = new Dictionary<string, string>
            {
                ["{{UserName}}"] = user.UserName,
                ["{{LoginDate}}"] = DateTime.Now.ToString("dd MMM yyyy"),
                ["{{LoginTime}}"] = DateTime.Now.ToString("hh:mm tt"),
                ["{{Device}}"] = "Web Browser",
                ["{{CurrentYear}}"] = DateTime.Now.Year.ToString()
            };

            // Sends the failed login email using the database template.
            await _emailService.SendTemplateEmailAsync(
                user.Email,
                "FailedLogin",
                placeholders);
        }

        // Sends a failed OTP email when login alerts are enabled.
        private async Task SendFailedOtpEmailAsync(User user)
        {
            // Gets the user's notification settings.
            var settings = await _context.UserNotificationSettings
                .FirstOrDefaultAsync(x => x.UserId == user.UserId);

            // Stops email sending when login alerts are disabled.
            if (settings == null || !settings.LoginAlerts)
            {
                return;
            }

            // Creates the email placeholders.
            var placeholders = new Dictionary<string, string>
            {
                ["{{UserName}}"] = user.UserName,
                ["{{LoginDate}}"] = DateTime.Now.ToString("dd MMM yyyy"),
                ["{{LoginTime}}"] = DateTime.Now.ToString("hh:mm tt"),
                ["{{Device}}"] = "Web Browser",
                ["{{CurrentYear}}"] = DateTime.Now.Year.ToString()
            };

            // Sends the failed OTP email using the database template.
            await _emailService.SendTemplateEmailAsync(
                user.Email,
                "FailedOtp",
                placeholders);
        }

        // Sends an expired OTP email when login alerts are enabled.
        private async Task SendExpiredOtpEmailAsync(User user)
        {
            // Gets the user's notification settings.
            var settings = await _context.UserNotificationSettings
                .FirstOrDefaultAsync(x => x.UserId == user.UserId);

            // Stops email sending when login alerts are disabled.
            if (settings == null || !settings.LoginAlerts)
            {
                return;
            }

            // Creates the email placeholders.
            var placeholders = new Dictionary<string, string>
            {
                ["{{UserName}}"] = user.UserName,
                ["{{LoginDate}}"] = DateTime.Now.ToString("dd MMM yyyy"),
                ["{{LoginTime}}"] = DateTime.Now.ToString("hh:mm tt"),
                ["{{Device}}"] = "Web Browser",
                ["{{CurrentYear}}"] = DateTime.Now.Year.ToString()
            };

            // Sends the expired OTP email using the database template.
            await _emailService.SendTemplateEmailAsync(
                user.Email,
                "ExpiredOtp",
                placeholders);
        }
    }
}