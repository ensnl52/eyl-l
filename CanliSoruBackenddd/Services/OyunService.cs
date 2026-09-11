using CanliSoruBackend.Data;
using CanliSoruBackend.Models;
using CanliSoruBackend.ViewModels.Oyun;
using CanliSoruBackend.ViewModels.Soru;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace CanliSoruBackend.Services
{
    public class OyunService : IOyunService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public OyunService(
            AppDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<OyunBaslatViewModel> OyunuBaslatAsync(
            string kullaniciId,
            int oyunId)
        {
            var oyun =
                await _context.Oyunlar
                    .FirstOrDefaultAsync(x => x.Id == oyunId);

            if (oyun == null)
            {
                return new OyunBaslatViewModel
                {
                    BasariliMi = false,
                    Mesaj = "Oyun bulunamadı."
                };
            }

            if (oyun.BasladiMi)
            {
                return new OyunBaslatViewModel
                {
                    BasariliMi = false,
                    Mesaj = "Oyun zaten başladı."
                };
            }

            var oyuncular =
                await _context.OyunOyunculari
                    .Where(x => x.OyunId == oyunId)
                    .OrderBy(x => x.Id)
                    .ToListAsync();

            if (oyuncular.Count < 2)
            {
                return new OyunBaslatViewModel
                {
                    BasariliMi = false,
                    Mesaj =
                        "Oyunun başlaması için en az 2 oyuncu gereklidir."
                };
            }

            var odaKurucusu = oyuncular.First();

            if (odaKurucusu.KullaniciId != kullaniciId)
            {
                return new OyunBaslatViewModel
                {
                    BasariliMi = false,
                    Mesaj =
                        "Sadece oda kurucusu oyunu başlatabilir."
                };
            }

            var katilanOyuncular = oyuncular.Skip(1).ToList();

            var herkesHazir = katilanOyuncular.All(x => x.HazirMi);

            if (!herkesHazir)
            {
                return new OyunBaslatViewModel
                {
                    BasariliMi = false,
                    Mesaj = "Henüz tüm oyuncular hazır değil."
                };
            }

            oyun.BasladiMi = true;
            oyun.BaslangicZamani = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new OyunBaslatViewModel
            {
                BasariliMi = true,
                Mesaj = "Oyun başarıyla başlatıldı.",
                OyunId = oyun.Id,
                OdaKodu = oyun.OdaKodu
            };
        }

        public async Task<List<OyuncuViewModel>?> OyunculariGetirAsync(
     string kullaniciId,
     int oyunId)
        {
            var oyuncuKontrol =
                await _context.OyunOyunculari
                    .AnyAsync(x =>
                        x.OyunId == oyunId &&
                        x.KullaniciId == kullaniciId);

            if (!oyuncuKontrol)
            {
                return null;
            }

            var sonuc =
                await _context.OyunOyunculari
                    .Where(x => x.OyunId == oyunId)
                    .OrderBy(x => x.Id)
                    .Select(x => new OyuncuViewModel
                    {
                        KullaniciId = x.KullaniciId,
                        KullaniciAdi = x.KullaniciAdi,
                        Puan = x.Puan,
                        HazirMi = x.HazirMi
                    })
                    .ToListAsync();

            return sonuc;
        }


        public async Task<OyunOlusturViewModel?> OyunOlusturAsync(
     string kullaniciId,
     string kullaniciAdi)
        {
            var sorular =
                await _context.Sorular
                    .OrderBy(x => Guid.NewGuid())
                    .Take(20)
                    .ToListAsync();

            if (sorular.Count < 20)
            {
                return null;
            }

            var odaKodu = "";

            do
            {
                odaKodu = Guid.NewGuid()
                    .ToString("N")
                    .Substring(0, 6)
                    .ToUpper();
            }
            while (
                await _context.Oyunlar
                    .AnyAsync(x => x.OdaKodu == odaKodu)
            );

            var oyun = new Oyun
            {
                OdaKodu = odaKodu,
                Tarih = DateTime.UtcNow,
                BaslangicZamani = DateTime.UtcNow,
                BasladiMi = false
            };

            _context.Oyunlar.Add(oyun);

            await _context.SaveChangesAsync();

            var oyuncu = new OyunOyuncu
            {
                OyunId = oyun.Id,
                KullaniciId = kullaniciId,
                KullaniciAdi = kullaniciAdi,
                Puan = 0,
                HazirMi = false
            };

            _context.OyunOyunculari.Add(oyuncu);

            var soruViewModels = new List<SoruViewModel>();

            for (int i = 0; i < sorular.Count; i++)
            {
                _context.OyunSorulari.Add(
                    new OyunSoru
                    {
                        OyunId = oyun.Id,
                        SoruId = sorular[i].Id,
                        Sira = i + 1
                    }
                );

                soruViewModels.Add(
                    new SoruViewModel
                    {
                        Id = sorular[i].Id,
                        SoruMetni = sorular[i].SoruMetni,
                        GorselUrl = sorular[i].GorselUrl
                    }
                );
            }

            await _context.SaveChangesAsync();
            return new OyunOlusturViewModel
            {
                OyunId = oyun.Id,
                OdaKodu = oyun.OdaKodu,
                Sorular = soruViewModels
            };
        }


        public async Task<SoruBaslatViewModel?> SoruBaslatAsync(
            string kullaniciId,
            int oyunId,
            int soruId)
        {
            var oyuncuKontrol =
                await _context.OyunOyunculari
                    .AnyAsync(x =>
                        x.OyunId == oyunId &&
                        x.KullaniciId == kullaniciId);

            if (!oyuncuKontrol)
            {
                return null;
            }

            var oyun =
                await _context.Oyunlar
                    .FirstOrDefaultAsync(x =>
                        x.Id == oyunId);

            if (oyun == null || !oyun.BasladiMi)
            {
                return null;
            }

            var oyunSoru =
                await _context.OyunSorulari
                    .FirstOrDefaultAsync(x =>
                        x.OyunId == oyunId &&
                        x.SoruId == soruId);

            if (oyunSoru == null)
            {
                return null;
            }

            if (oyunSoru.BaslangicZamani != default)
            {
                return new SoruBaslatViewModel
                {
                    OyunId = oyunId,
                    SoruId = soruId,
                    BaslangicZamani =
                        oyunSoru.BaslangicZamani,
                    Sure = 15
                };
            }

            oyunSoru.BaslangicZamani =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new SoruBaslatViewModel
            {
                OyunId = oyunId,
                SoruId = soruId,
                BaslangicZamani =
                    oyunSoru.BaslangicZamani,
                Sure = 15
            };
        }

        public async Task<CevapViewModel?> CevaplaAsync(
            string kullaniciId,
            OyunCevap cevap)
        {
            var oyuncu =
                await _context.OyunOyunculari
                    .FirstOrDefaultAsync(x =>
                        x.OyunId == cevap.OyunId &&
                        x.KullaniciId == kullaniciId);

            if (oyuncu == null)
            {
                return null;
            }

            var oyun =
                await _context.Oyunlar
                    .FirstOrDefaultAsync(x =>
                        x.Id == cevap.OyunId);

            if (oyun == null || !oyun.BasladiMi)
            {
                return null;
            }

            var oyunSoru =
                await _context.OyunSorulari
                    .FirstOrDefaultAsync(x =>
                        x.OyunId == cevap.OyunId &&
                        x.SoruId == cevap.SoruId);

            if (oyunSoru == null)
            {
                return null;
            }

            var soru =
                await _context.Sorular
                    .FirstOrDefaultAsync(x =>
                        x.Id == cevap.SoruId);

            if (soru == null)
            {
                return null;
            }

            var dahaOnceCevaplandi =
                await _context.OyunCevaplari
                    .AnyAsync(x =>
                        x.OyunId == cevap.OyunId &&
                        x.SoruId == cevap.SoruId &&
                        x.Kullaniciİd == kullaniciId);

            if (dahaOnceCevaplandi)
            {
                return null;
            }

            if (oyunSoru.BaslangicZamani == default)
            {
                return null;
            }

            var gecenSure =
                DateTime.UtcNow -
                oyunSoru.BaslangicZamani;

            if (gecenSure.TotalSeconds > 15)
            {
                return null;
            }

            cevap.Kullaniciİd = kullaniciId;

            cevap.DogruMu =
                cevap.Cevap.Trim().Equals(
                    soru.DogruCevap.Trim(),
                    StringComparison.OrdinalIgnoreCase
                );

            if (!cevap.DogruMu)
            {
                cevap.Puan = 0;
            }
            else
            {
                var dogruCevapSayisi =
                    await _context.OyunCevaplari
                        .CountAsync(x =>
                            x.OyunId ==
                                cevap.OyunId &&
                            x.SoruId ==
                                cevap.SoruId &&
                            x.DogruMu);

                cevap.Puan =
                    dogruCevapSayisi switch
                    {
                        0 => 100,
                        1 => 80,
                        2 => 60,
                        3 => 40,
                        4 => 20,
                        _ => 0
                    };
            }

            cevap.Tarih =
                DateTime.UtcNow;

            _context.OyunCevaplari.Add(cevap);

            oyuncu.Puan += cevap.Puan;

            await _context.SaveChangesAsync();

            return new CevapViewModel
            {
                DogruMu = cevap.DogruMu,
                Puan = cevap.Puan,
                ToplamPuan = oyuncu.Puan,
                GecenSaniye = Math.Round(
                    gecenSure.TotalSeconds,
                    2)
            };
        }

        public async Task<HazirViewModel?> HazirOlAsync(
            string kullaniciId,
            int oyunId)
        {
            var oyuncu =
                await _context.OyunOyunculari
                    .FirstOrDefaultAsync(x =>
                        x.OyunId == oyunId &&
                        x.KullaniciId == kullaniciId);

            if (oyuncu == null)
            {
                return null;
            }

            var oyun =
                await _context.Oyunlar
                    .FirstOrDefaultAsync(x =>
                        x.Id == oyunId);

            if (oyun == null)
            {
                return null;
            }

            if (oyun.BasladiMi)
            {
                return null;
            }

            oyuncu.HazirMi = true;

            await _context.SaveChangesAsync();

            return new HazirViewModel
            {
                Mesaj = "Hazır olduğunuz kaydedildi.",
                OyunId = oyunId,
                KullaniciId = kullaniciId,
                HazirMi = oyuncu.HazirMi
            };
        }

        public async Task<HazirKontrolViewModel?> HazirKontrolAsync(
            string kullaniciId,
            int oyunId)
        {
            var oyuncuKontrol =
                await _context.OyunOyunculari
                    .AnyAsync(x =>
                        x.OyunId == oyunId &&
                        x.KullaniciId == kullaniciId);

            if (!oyuncuKontrol)
            {
                return null;
            }

            var oyun =
                await _context.Oyunlar
                    .FirstOrDefaultAsync(x =>
                        x.Id == oyunId);

            if (oyun == null)
            {
                return null;
            }

            if (oyun.BasladiMi)
            {
                return new HazirKontrolViewModel
                {
                    Hazir = true,
                    OyunBasladi = true,
                    Mesaj = "Oyun zaten başladı.",
                    OyuncuSayisi =
                        await _context.OyunOyunculari
                            .CountAsync(x =>
                                x.OyunId == oyunId)
                };
            }

            var oyuncular =
      await _context.OyunOyunculari
          .Where(x =>
              x.OyunId == oyunId)
          .OrderBy(x => x.Id)
          .ToListAsync();

            if (oyuncular.Count < 2)
            {
                return new HazirKontrolViewModel
                {
                    Hazir = false,
                    OyunBasladi = false,
                    Mesaj =
                        "Oyunun başlaması için en az 2 oyuncu gerekli.",
                    OyuncuSayisi =
                        oyuncular.Count
                };
            }

            var odaKurucusu =
        oyuncular.First();

            var katilanOyuncular =
                oyuncular
                    .Skip(1)
                    .ToList();

            var herkesHazir =
                katilanOyuncular.All(x => x.HazirMi);
            if (!herkesHazir)
            {
                return new HazirKontrolViewModel
                {
                    Hazir = false,
                    OyunBasladi = false,
                    Mesaj =
                        "Henüz tüm oyuncular hazır değil.",
                    OyuncuSayisi =
                        oyuncular.Count
                };
            }

            return new HazirKontrolViewModel
            {
                Hazir = true,
                OyunBasladi = false,
                Mesaj =
                    "Tüm oyuncular hazır. Oyun başlayabilir.",
                OyuncuSayisi =
                    oyuncular.Count
            };
        }

        public async Task<OyunKatilViewModel> OyunaKatilAsync(
      string kullaniciId,
      string kullaniciAdi,
      string odaKodu)
        {
            odaKodu = odaKodu.Trim().ToUpper();

            var oyun = await _context.Oyunlar
                .FirstOrDefaultAsync(x =>
                    x.OdaKodu == odaKodu);

            if (oyun == null)
            {
                return new OyunKatilViewModel
                {
                    BasariliMi = false,
                    Mesaj = "Bu oda bulunamadı."
                };
            }

            if (oyun.BasladiMi)
            {
                return new OyunKatilViewModel
                {
                    BasariliMi = false,
                    Mesaj = "Bu oyun zaten başladı."
                };
            }

            var zatenKatildi =
                await _context.OyunOyunculari
                    .AnyAsync(x =>
                        x.OyunId == oyun.Id &&
                        x.KullaniciId == kullaniciId);

            if (zatenKatildi)
            {
                return new OyunKatilViewModel
                {
                    BasariliMi = false,
                    Mesaj = "Bu oyuncu zaten bu oyunda."
                };
            }

            var oyuncu = new OyunOyuncu
            {
                OyunId = oyun.Id,
                KullaniciId = kullaniciId,
                KullaniciAdi = kullaniciAdi,
                Puan = 0,
                HazirMi = false
            };

            _context.OyunOyunculari.Add(oyuncu);

            await _context.SaveChangesAsync();

            return new OyunKatilViewModel
            {
                BasariliMi = true,
                Mesaj = "Oyuna başarıyla katıldınız.",
                OyunId = oyun.Id,
                OdaKodu = oyun.OdaKodu
            };
        

        }
        public async Task<List<SoruViewModel>?> OyunSorulariGetirAsync(
          string kullaniciId,
          int oyunId)
        {
            var oyuncuKontrol =
                await _context.OyunOyunculari
                    .AnyAsync(x =>
                        x.OyunId == oyunId &&
                        x.KullaniciId == kullaniciId);

            if (!oyuncuKontrol)
            {
                return null;
            }

            var sorular =
                await _context.OyunSorulari
                    .Where(x => x.OyunId == oyunId)
                    .Include(x => x.Soru)
                    .OrderBy(x => x.Sira)
                    .Select(x => new SoruViewModel
                    {
                        Id = x.Soru.Id,
                        SoruMetni = x.Soru.SoruMetni,
                        GorselUrl = x.Soru.GorselUrl
                    })
                    .ToListAsync();

            return sorular;
        }
    }
}