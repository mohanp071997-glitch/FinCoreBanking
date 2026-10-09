using FinCoreBanking.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;

namespace FinCoreBanking.API.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    // FEATURE: SMTP diagnostic logging
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _context = context;
        _environment = environment;
    }

    // Sends the OTP to the registered email address.
    public async Task SendOtpEmailAsync(string recipientEmail, string otp)
    {
        var smtpServer =
            _configuration["EmailSettings:SmtpServer"];

        var port =
            _configuration.GetValue<int>("EmailSettings:Port");

        var senderName =
            _configuration["EmailSettings:SenderName"];

        var senderEmail =
            _configuration["EmailSettings:SenderEmail"];

        var username =
            _configuration["EmailSettings:Username"];

        var password =
            _configuration["EmailSettings:Password"];

        using var smtpClient =
            new SmtpClient(smtpServer, port)
            {
                EnableSsl = true,
                Credentials =
                    new NetworkCredential(username, password)
            };

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(
                senderEmail!,
                senderName),

            Subject = "FinCore Banking - OTP",

            Body =
                $"Your FinCore Banking OTP is {otp}.\n\n" +
                "This OTP is valid for 5 minutes.\n" +
                "Please do not share this OTP with anyone.",

            IsBodyHtml = false
        };

        mailMessage.To.Add(recipientEmail);

        try
        {

            await smtpClient.SendMailAsync(mailMessage);

        }
        //catch (Exception ex)
        //{
        //    Debug.WriteLine("EMAIL SENDING FAILED");
        //    Debug.WriteLine(ex.ToString());

        //    throw;
        //}

        catch (Exception ex)
        {
            // FEATURE: Log SMTP failure without logging credentials or OTP
            _logger.LogError(
                ex,
                "Failed to send account OTP email. SMTP server: {SmtpServer}, Port: {Port}",
                smtpServer,
                port);

            throw;
        }
    }


    // Sends an email using the template stored in the database.
    public async Task SendTemplateEmailAsync(
        string recipientEmail,
        string templateName,
        Dictionary<string, string>? placeholders = null)
    {
        // Gets the email template from the database.
        var template = await _context.EmailTemplates
            .FirstOrDefaultAsync(x =>
                x.TemplateName == templateName &&
                x.IsActive);

        // Stops when the template is not found.
        if (template == null)
        {
            throw new InvalidOperationException(
                $"Email template '{templateName}' was not found.");
        }

        // Gets the email body from the database.
        var emailBody = template.EmailBody;

        // Replaces template placeholders with actual values.
        if (placeholders != null)
        {
            foreach (var placeholder in placeholders)
            {
                emailBody = emailBody.Replace(
                    placeholder.Key,
                    placeholder.Value);
            }
        }

        // Gets SMTP settings.
        var smtpServer =
            _configuration["EmailSettings:SmtpServer"];

        var port =
            _configuration.GetValue<int>("EmailSettings:Port");

        var senderName =
            _configuration["EmailSettings:SenderName"];

        var senderEmail =
            _configuration["EmailSettings:SenderEmail"];

        var username =
            _configuration["EmailSettings:Username"];

        var password =
            _configuration["EmailSettings:Password"];

        // Creates the SMTP client.
        using var smtpClient =
            new SmtpClient(smtpServer, port)
            {
                EnableSsl = true,
                Credentials =
                    new NetworkCredential(username, password)
            };

        // Creates the email message.
        using var mailMessage = new MailMessage
        {
            From = new MailAddress(
                senderEmail!,
                senderName),

            Subject = template.EmailSubject,

            Body = emailBody,

            IsBodyHtml = true
        };

        // Adds the recipient.
        mailMessage.To.Add(recipientEmail);

        // Sends the email.
        await smtpClient.SendMailAsync(mailMessage);
    }
}