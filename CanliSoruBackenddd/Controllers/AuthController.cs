using Microsoft.AspNetCore.Mvc;
using CanliSoruBackend.Models;
using CanliSoruBackend.Services;

namespace CanliSoruBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            RegisterRequest request)
        {
            var sonuc =
                await _authService.RegisterAsync(request);

            if (!sonuc.Basarili)
            {
                return BadRequest(sonuc.Mesaj);
            }

            return Ok(sonuc.Mesaj);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            LoginRequest request)
        {
            var sonuc =
                await _authService.LoginKoduGonderAsync(
                    request);

            if (!sonuc.Basarili)
            {
                return Unauthorized(sonuc.Mesaj);
            }

            return Ok(sonuc.Mesaj);
        }

        [HttpPost("login-dogrula")]
        public async Task<IActionResult> LoginDogrula(
            string kullaniciAdi,
            string kod)
        {
            var sonuc =
                await _authService.LoginKoduDogrulaAsync(
                    kullaniciAdi,
                    kod);

            if (sonuc == null)
            {
                return Unauthorized(
                    "Doğrulama kodu hatalı veya süresi dolmuş.");
            }

            return Ok(sonuc);
        }

        [HttpPost("guest")]
        public IActionResult Guest(string kullaniciAdi)
        {
            if (string.IsNullOrWhiteSpace(kullaniciAdi))
            {
                return BadRequest(
                    "Guest kullanıcı adı boş bırakılamaz.");
            }

            var sonuc =
                _authService.Guest(
                    kullaniciAdi.Trim());

            return Ok(sonuc);
        }

        [HttpGet("durum")]
        public IActionResult Durum()
        {
            var authorization =
                Request.Headers["Authorization"]
                    .ToString();

            try
            {
                var sonuc =
                    _authService.Durum(authorization);

                return Ok(sonuc);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch
            {
                return Unauthorized();
            }
        }

        [HttpPost("admin-yap")]
        public async Task<IActionResult> AdminYap(
            string kullaniciAdi)
        {
            var sonuc =
                await _authService.AdminYapAsync(
                    kullaniciAdi);

            if (!sonuc.Basarili)
            {
                if (sonuc.Mesaj ==
                    "Kullanıcı bulunamadı.")
                {
                    return NotFound(sonuc.Mesaj);
                }

                return BadRequest(sonuc.Mesaj);
            }

            return Ok(sonuc.Mesaj);
        }
    }
}