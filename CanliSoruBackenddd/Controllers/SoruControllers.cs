using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CanliSoruBackend.Services;
using CanliSoruBackend.ViewModels.Soru;
using CanliSoruBackend.Models;

namespace CanliSoruBackend.Controllers
{
    [Route("api/Soru")]
    [ApiController]
    public class SoruController : ControllerBase
    {
        private readonly ISoruService _soruService;

        public SoruController(ISoruService soruService)
        {
            _soruService = soruService;
        }

        [HttpGet]
        public async Task<IActionResult> SorulariGetir()
        {
            var sonuc =
                await _soruService.SorulariGetirAsync();

            return Ok(sonuc);
        }

        [HttpGet("rastgele")]
        public async Task<IActionResult> RastgeleSoru()
        {
            var sonuc =
                await _soruService.RastgeleSoruAsync();

            if (sonuc == null)
            {
                return NotFound(
                    "Henüz soru bulunmuyor.");
            }

            return Ok(sonuc);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> SoruEkle(
            SoruEkleViewModel model)
        {
            var sonuc =
                await _soruService.SoruEkleAsync(
                    model);

            return Ok(sonuc);
        }
    }
}