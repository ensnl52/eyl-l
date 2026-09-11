using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using CanliSoruBackend.Models;

namespace CanliSoruBackend.Services
{
    public class EmailSender : IEmailSender<ApplicationUser>
    {
        private readonly IConfiguration _configuration;

        public EmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        public async Task SendLoginCodeAsync(
    string email,
    string kod)
        {
            var smtpHost =
        _configuration["EmailSettings:Host"];

            var smtpPort =
                int.Parse(
                    _configuration["EmailSettings:Port"]!);

            var smtpUser =
                _configuration["EmailSettings:Username"];

            var smtpPassword =
                _configuration["EmailSettings:Password"];

            var mail = new MailMessage
            {
                From = new MailAddress(
                    smtpUser!,
                    "Canlı Sorular"),
                Subject = "Giriş Doğrulama Kodunuz",
                Body =
                    $"Canlı Sorular giriş kodunuz: {kod}\n\n" +
                    "Bu kod kısa bir süre geçerlidir.",
                IsBodyHtml = false
            };

            mail.To.Add(email);

            using var smtp =
                new SmtpClient(
                    smtpHost,
                    smtpPort);

            smtp.EnableSsl = true;

            smtp.Credentials =
                new NetworkCredential(
                    smtpUser,
                    smtpPassword);

            await smtp.SendMailAsync(mail);
        }

        public Task SendConfirmationLinkAsync(
            ApplicationUser user,
            string email,
            string confirmationLink)
        {
            return Task.CompletedTask;
        }

        public Task SendPasswordResetCodeAsync(
            ApplicationUser user,
            string email,
            string resetCode)
        {
            return Task.CompletedTask;
        }

        public Task SendPasswordResetLinkAsync(
            ApplicationUser user,
            string email,
            string resetLink)
        {
            return Task.CompletedTask;
        }
    }
}