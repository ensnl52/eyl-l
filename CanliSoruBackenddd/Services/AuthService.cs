using CanliSoruBackend.Data;
using CanliSoruBackend.Models;
using CanliSoruBackend.ViewModels.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CanliSoruBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly EmailSender _emailSender;

        public AuthService(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            EmailSender emailSender)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _emailSender = emailSender;
        }

        public async Task<(bool Basarili, string Mesaj)> RegisterAsync(
            RegisterRequest request)
        {
            var kullanici = new ApplicationUser
            {
                UserName = request.KullaniciAdi,
                Email = request.Email,
                KullaniciAdi = request.KullaniciAdi
            };

            var sonuc =
                await _userManager.CreateAsync(
                    kullanici,
                    request.Sifre);

            if (!sonuc.Succeeded)
            {
                return (
                    false,
                    string.Join(
                        ", ",
                        sonuc.Errors.Select(
                            x => x.Description))
                );
            }

            return (
                true,
                "Kullanıcı başarıyla oluşturuldu."
            );
        }

        public async Task<(bool Basarili, string Mesaj)> LoginAsync(
            LoginRequest request)
        {
            var sonuc =
                await LoginKoduGonderAsync(request);

            return sonuc;
        }

        public async Task<(bool Basarili, string Mesaj)> LoginKoduGonderAsync(
            LoginRequest request)
        {
            var kullanici =
                await _userManager.FindByNameAsync(
                    request.KullaniciAdi);

            if (kullanici == null)
            {
                return (
                    false,
                    "Kullanıcı adı veya şifre hatalı."
                );
            }

            var sifreDogru =
                await _userManager.CheckPasswordAsync(
                    kullanici,
                    request.Sifre);

            if (!sifreDogru)
            {
                return (
                    false,
                    "Kullanıcı adı veya şifre hatalı."
                );
            }

            if (string.IsNullOrWhiteSpace(
                kullanici.Email))
            {
                return (
                    false,
                    "Kullanıcının kayıtlı bir e-posta adresi bulunmuyor."
                );
            }

            var eskiKodlar =
                await _context.EmailDogrulamaKodlari
                    .Where(x =>
                        x.KullaniciId == kullanici.Id &&
                        !x.KullanildiMi)
                    .ToListAsync();

            foreach (var eskiKod in eskiKodlar)
            {
                eskiKod.KullanildiMi = true;
            }

            var kod =
                Random.Shared
                    .Next(100000, 1000000)
                    .ToString();

            var kayit =
                new EmailDogrulamaKodu
                {
                    KullaniciId = kullanici.Id,
                    Kod = kod,
                    OlusturmaZamani =
                        DateTime.UtcNow,
                    SonKullanmaZamani =
                        DateTime.UtcNow.AddMinutes(5),
                    KullanildiMi = false
                };

            _context.EmailDogrulamaKodlari.Add(kayit);

            await _context.SaveChangesAsync();

            await _emailSender.SendLoginCodeAsync(
                kullanici.Email,
                kod);

            return (
                true,
                "Doğrulama kodu e-posta adresinize gönderildi."
            );
        }

        public async Task<LoginViewModel?> LoginKoduDogrulaAsync(
            string kullaniciAdi,
            string kod)
        {
            var kullanici =
                await _userManager.FindByNameAsync(
                    kullaniciAdi);

            if (kullanici == null)
            {
                return null;
            }

            var dogrulamaKodu =
                await _context.EmailDogrulamaKodlari
                    .Where(x =>
                        x.KullaniciId == kullanici.Id &&
                        x.Kod == kod &&
                        !x.KullanildiMi)
                    .OrderByDescending(x =>
                        x.OlusturmaZamani)
                    .FirstOrDefaultAsync();

            if (dogrulamaKodu == null)
            {
                return null;
            }

            if (dogrulamaKodu.SonKullanmaZamani <
                DateTime.UtcNow)
            {
                return null;
            }

            dogrulamaKodu.KullanildiMi = true;

            await _context.SaveChangesAsync();

            var roller =
                await _userManager.GetRolesAsync(
                    kullanici);

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    kullanici.Id),

                new Claim(
                    ClaimTypes.Name,
                    kullanici.UserName ?? ""),

                new Claim(
                    "KullaniciTipi",
                    "User")
            };

            foreach (var rol in roller)
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        rol));
            }

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        "CANLI-SORU-OYUNU-GIZLI-ANAHTAR-123456789"
                    ));

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256);

            var token =
                new JwtSecurityToken(
                    issuer: "CanliSoruBackend",
                    audience: "CanliSoruFrontend",
                    claims: claims,
                    expires:
                        DateTime.UtcNow.AddHours(2),
                    signingCredentials:
                        credentials);

            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);

            return new LoginViewModel
            {
                Token = tokenString,
                KullaniciTipi = "User",
                Roller = roller
            };
        }

        public GuestViewModel Guest(string kullaniciAdi)
        {
            var guestId =
                Guid.NewGuid().ToString();

            var claims = new[]
            {
        new Claim(
            ClaimTypes.NameIdentifier,
            guestId),

        new Claim(
            ClaimTypes.Name,
            kullaniciAdi),

        new Claim(
            ClaimTypes.Role,
            "Guest"),

        new Claim(
            "KullaniciTipi",
            "Guest")
    };

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        "CANLI-SORU-OYUNU-GIZLI-ANAHTAR-123456789"
                    ));

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256);

            var token =
                new JwtSecurityToken(
                    issuer: "CanliSoruBackend",
                    audience: "CanliSoruFrontend",
                    claims: claims,
                    expires:
                        DateTime.UtcNow.AddHours(2),
                    signingCredentials:
                        credentials);

            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);

            return new GuestViewModel
            {
                Token = tokenString,
                KullaniciTipi = "Guest"
            };
        }

        public DurumViewModel Durum(
            string authorization)
        {
            if (string.IsNullOrEmpty(authorization))
            {
                return new DurumViewModel
                {
                    GirisYapmis = false,
                    KullaniciTipi = "Guest"
                };
            }

            if (!authorization.StartsWith("Bearer "))
            {
                throw new UnauthorizedAccessException();
            }

            var token =
                authorization.Substring(
                    "Bearer ".Length);

            var tokenHandler =
                new JwtSecurityTokenHandler();

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        "CANLI-SORU-OYUNU-GIZLI-ANAHTAR-123456789"
                    ));

            tokenHandler.ValidateToken(
                token,
                new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,

                    ValidateIssuer = true,
                    ValidIssuer = "CanliSoruBackend",

                    ValidateAudience = true,
                    ValidAudience = "CanliSoruFrontend",

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                },
                out SecurityToken validatedToken);

            var jwtToken =
                (JwtSecurityToken)validatedToken;

            var kullaniciTipi =
                jwtToken.Claims
                    .FirstOrDefault(
                        x =>
                            x.Type ==
                            "KullaniciTipi")
                    ?.Value;

            if (kullaniciTipi == "Guest")
            {
                return new DurumViewModel
                {
                    GirisYapmis = false,
                    KullaniciTipi = "Guest"
                };
            }

            return new DurumViewModel
            {
                GirisYapmis = true,
                KullaniciTipi = "User"
            };
        }

        public async Task<(bool Basarili, string Mesaj)> AdminYapAsync(
            string kullaniciAdi)
        {
            var kullanici =
                await _userManager.FindByNameAsync(
                    kullaniciAdi);

            if (kullanici == null)
            {
                return (
                    false,
                    "Kullanıcı bulunamadı."
                );
            }

            if (!await _roleManager.RoleExistsAsync(
                "Admin"))
            {
                await _roleManager.CreateAsync(
                    new IdentityRole("Admin"));
            }

            var sonuc =
                await _userManager.AddToRoleAsync(
                    kullanici,
                    "Admin");

            if (!sonuc.Succeeded)
            {
                return (
                    false,
                    string.Join(
                        ", ",
                        sonuc.Errors.Select(
                            x => x.Description))
                );
            }

            return (
                true,
                "Kullanıcı Admin yapıldı."
            );
        }
    }
}