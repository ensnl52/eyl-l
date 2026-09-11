using CanliSoruBackend.Data;
using CanliSoruBackend.Models;
using CanliSoruBackend.ViewModels.Soru;
using Microsoft.EntityFrameworkCore;

namespace CanliSoruBackend.Services
{
    public class SoruService : ISoruService
    {
        private readonly AppDbContext _context;

        public SoruService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SoruViewModel>> SorulariGetirAsync()
        {
            return await _context.Sorular
                .Select(x => new SoruViewModel
                {
                    Id = x.Id,
                    SoruMetni = x.SoruMetni,
                    GorselUrl = x.GorselUrl
                })
                .ToListAsync();
        }

        public async Task<SoruViewModel?> RastgeleSoruAsync()
        {
            var soru = await _context.Sorular
                .OrderBy(x => Guid.NewGuid())
                .FirstOrDefaultAsync();

            if (soru == null)
            {
                return null;
            }

            return new SoruViewModel
            {
                Id = soru.Id,
                SoruMetni = soru.SoruMetni,
                GorselUrl = soru.GorselUrl
            };
        }

        public async Task<SoruAdminViewModel> SoruEkleAsync(
            SoruEkleViewModel model)
        {
            var soru = new Soru
            {
                SoruMetni = model.SoruMetni,
                DogruCevap = model.DogruCevap,
                GorselUrl = model.GorselUrl
            };

            _context.Sorular.Add(soru);

            await _context.SaveChangesAsync();

            return new SoruAdminViewModel
            {
                Id = soru.Id,
                SoruMetni = soru.SoruMetni,
                DogruCevap = soru.DogruCevap,
                GorselUrl = soru.GorselUrl
            };
        }
    }
}