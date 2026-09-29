using FinCoreBanking.API.Data;
using FinCoreBanking.API.DTOs;
using FinCoreBanking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinCoreBanking.API.Controllers
{
    // Provides APIs for managing customers.
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Injects the database context.
        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Returns all active customers.
        [HttpGet]
        public async Task<IActionResult> GetCustomers()
        {
            var customers = await _context.Customers
                .Where(x => x.IsActive)
                .ToListAsync();

            return Ok(customers);
        }

        // Creates a new customer.
        [HttpPost]
        public async Task<IActionResult> CreateCustomer(CreateCustomerRequest request)
        {
            // Checks whether the user exists.
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.UserId == request.UserId && x.IsActive);

            if (user == null)
            {
                return BadRequest("Active user not found.");
            }

            // Checks whether the user is already a customer.
            var existingCustomer = await _context.Customers
                .FirstOrDefaultAsync(x => x.UserId == request.UserId);

            if (existingCustomer != null)
            {
                return BadRequest("Customer already exists for this user.");
            }

            // Checks whether the customer number already exists.
            var existingCustomerNumber = await _context.Customers
                .FirstOrDefaultAsync(x => x.CustomerNumber == request.CustomerNumber);

            if (existingCustomerNumber != null)
            {
                return BadRequest("Customer number already exists.");
            }

            // Creates a new customer.
            var customer = new Customer
            {
                UserId = request.UserId,
                CustomerNumber = request.CustomerNumber,
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                PhoneNumber = request.PhoneNumber,
                AddressLine1 = request.AddressLine1,
                AddressLine2 = request.AddressLine2,
                City = request.City,
                State = request.State,
                PostalCode = request.PostalCode,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            // Adds the customer to the database.
            _context.Customers.Add(customer);

            // Saves the customer.
            await _context.SaveChangesAsync();

            // Returns the created customer.
            return Ok(customer);
        }


        // Gets the customer details for the logged-in user.
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentCustomer()
        {
            // Gets the logged-in user ID from JWT.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);

            var customer = await _context.Customers
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (customer == null)
            {
                return NotFound();
            }

            return Ok(customer);
        }

        // Updates the customer profile.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, Customer customer)
        {
            // Gets the logged-in user ID from JWT.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);

            // Finds the customer's own record.
            var existingCustomer = await _context.Customers
                .FirstOrDefaultAsync(x =>
                    x.CustomerId == id &&
                    x.UserId == userId &&
                    x.IsActive);

            if (existingCustomer == null)
            {
                return NotFound("Customer not found.");
            }

            // Updates the customer name.
            existingCustomer.FirstName = customer.FirstName;
            existingCustomer.LastName = customer.LastName;

            // Updates the customer contact details.
            existingCustomer.Email = customer.Email;
            existingCustomer.PhoneNumber = customer.PhoneNumber;
            existingCustomer.EmergencyContactNumber = customer.EmergencyContactNumber;

            // Updates the customer address details.
            existingCustomer.AddressLine1 = customer.AddressLine1;
            existingCustomer.AddressLine2 = customer.AddressLine2;
            existingCustomer.City = customer.City;
            existingCustomer.State = customer.State;
            existingCustomer.PostalCode = customer.PostalCode;

            // Updates the modified date.
            existingCustomer.ModifiedDate = DateTime.UtcNow;

            // Saves the changes to the database.
            await _context.SaveChangesAsync();

            // Returns the updated customer.
            return Ok(existingCustomer);
        }
    }
}