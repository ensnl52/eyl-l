using CanliSoruBackend.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CanliSoruBackend.Hubs
{
    public class OyunHub : Hub
    {
        private readonly AppDbContext _context;

        public OyunHub(AppDbContext context)
        {
            _context = context;
        }

        public async Task OdayaKatil(
            string odaKodu,
            string kullaniciAdi)
        {
            odaKodu = odaKodu.Trim().ToUpper();

            var oyun = await _context.Oyunlar
                .FirstOrDefaultAsync(x =>
                    x.OdaKodu == odaKodu);

            if (oyun == null)
            {
                return;
            }

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                odaKodu);

            await OyuncuListesiniGonder(
                odaKodu,
                oyun.Id);
        }

        public async Task HazirDurumuGuncelle(
            string odaKodu)
        {
            odaKodu = odaKodu.Trim().ToUpper();

            var oyun = await _context.Oyunlar
                .FirstOrDefaultAsync(x =>
                    x.OdaKodu == odaKodu);

            if (oyun == null)
            {
                return;
            }

            await OyuncuListesiniGonder(
                odaKodu,
                oyun.Id);
        }

        public async Task OyunuBaslat(
            string odaKodu)
        {
            odaKodu = odaKodu.Trim().ToUpper();

            var oyun = await _context.Oyunlar
                .FirstOrDefaultAsync(x =>
                    x.OdaKodu == odaKodu);

            if (oyun == null)
            {
                return;
            }

            await Clients.Group(odaKodu)
                .SendAsync("OyunBasladi");
        }

        private async Task OyuncuListesiniGonder(
            string odaKodu,
            int oyunId)
        {
            var oyuncular =
                await _context.OyunOyunculari
                    .Where(x =>
                        x.OyunId == oyunId)
                    .Select(x => new
                    {
                        kullaniciId = x.KullaniciId,
                        kullaniciAdi = x.KullaniciAdi,
                        puan = x.Puan,
                        hazirMi = x.HazirMi
                    })
                    .ToListAsync();

            await Clients.Group(odaKodu)
                .SendAsync(
                    "OyuncuListesiGuncellendi",
                    oyuncular);
        }
    }
}