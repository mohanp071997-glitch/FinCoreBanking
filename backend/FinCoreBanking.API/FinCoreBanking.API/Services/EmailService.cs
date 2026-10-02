using System.Net;
using System.Net.Mail;

namespace FinCoreBanking.API.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
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

        await smtpClient.SendMailAsync(mailMessage);
    }
}