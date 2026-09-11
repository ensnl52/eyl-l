using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CanliSoruBackend.Models;
using CanliSoruBackend.Services;
using System.Security.Claims;

namespace CanliSoruBackend.Controllers
{
    [Route("api/Oyun")]
    [ApiController]
    [Authorize]
    public class OyunController : ControllerBase
    {
        private readonly IOyunService _oyunService;

        public OyunController(IOyunService oyunService)
        {
            _oyunService = oyunService;
        }
        [HttpPost("katil")]
        public async Task<IActionResult> OyunaKatil(string odaKodu)
        {
            var kullaniciId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            var kullaniciAdi =
                User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(kullaniciId) ||
                string.IsNullOrEmpty(kullaniciAdi))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.OyunaKatilAsync(
                    kullaniciId,
                    kullaniciAdi,
                    odaKodu);

            if (!sonuc.BasariliMi)
            {
                return BadRequest(sonuc.Mesaj);
            }

            return Ok(sonuc);
        }

        [HttpGet("{oyunId}/oyuncular")]
        public async Task<IActionResult> OyunculariGetir(
            int oyunId)
        {
            var kullaniciId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(kullaniciId))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.OyunculariGetirAsync(
                    kullaniciId,
                    oyunId);

            if (sonuc == null)
            {
                return Forbid();
            }

            return Ok(sonuc);
        }

        [HttpPost("baslat")]
        public async Task<IActionResult> OyunBaslat()
        {
            var kullaniciId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            var kullaniciAdi =
                User.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(kullaniciId) ||
                string.IsNullOrEmpty(kullaniciAdi))
            {
                return Unauthorized();
            }

            var kullaniciTipi =
                User.FindFirstValue("KullaniciTipi");

            if (kullaniciTipi != "User")
            {
                return Forbid();
            }

            var sonuc =
                await _oyunService.OyunOlusturAsync(
                    kullaniciId,
                    kullaniciAdi);

            if (sonuc == null)
            {
                return BadRequest(
                    "Oyun oluşturulamadı.");
            }

            return Ok(sonuc);
        }

        [HttpGet("{oyunId}/sorular")]
        public async Task<IActionResult> OyunSorulariGetir(
            int oyunId)
        {
            var kullaniciId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(kullaniciId))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.OyunSorulariGetirAsync(
                    kullaniciId,
                    oyunId);

            if (sonuc == null)
            {
                return Forbid();
            }

            return Ok(sonuc);
        }

        [HttpPost("{oyunId}/soru/{soruId}/baslat")]
        public async Task<IActionResult> SoruBaslat(
            int oyunId,
            int soruId)
        {
            var kullaniciId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(kullaniciId))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.SoruBaslatAsync(
                    kullaniciId,
                    oyunId,
                    soruId);

            if (sonuc == null)
            {
                return BadRequest(
                    "Soru başlatılamadı.");
            }

            return Ok(sonuc);
        }

        [HttpPost("cevapla")]
        public async Task<IActionResult> Cevapla(
            OyunCevap cevap)
        {
            var kullaniciId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(kullaniciId))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.CevaplaAsync(
                    kullaniciId,
                    cevap);

            if (sonuc == null)
            {
                return BadRequest(
                    "Cevap gönderilemedi.");
            }

            return Ok(sonuc);
        }

        [HttpPost("{oyunId}/hazir")]
        public async Task<IActionResult> HazirOl(
            int oyunId)
        {
            var kullaniciId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(kullaniciId))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.HazirOlAsync(
                    kullaniciId,
                    oyunId);

            if (sonuc == null)
            {
                return BadRequest(
                    "Hazır olma işlemi gerçekleştirilemedi.");
            }

            return Ok(sonuc);
        }

        [HttpGet("{oyunId}/hazir-kontrol")]
        public async Task<IActionResult> HazirKontrol(
            int oyunId)
        {
            var kullaniciId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(kullaniciId))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.HazirKontrolAsync(
                    kullaniciId,
                    oyunId);

            if (sonuc == null)
            {
                return Forbid();
            }

            return Ok(sonuc);
        }

        [HttpPost("{oyunId}/baslat-oyun")]
        public async Task<IActionResult> OyunuBaslat(
     int oyunId)
        {
            var kullaniciId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(kullaniciId))
            {
                return Unauthorized();
            }

            var sonuc =
                await _oyunService.OyunuBaslatAsync(
                    kullaniciId,
                    oyunId);

            if (!sonuc.BasariliMi)
            {
                return BadRequest(
                    sonuc.Mesaj);
            }

            return Ok(sonuc);
        }
    }
}