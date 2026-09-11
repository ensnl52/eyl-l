using CanliSoruBackend.Data;

using CanliSoruBackend.Hubs;

using Microsoft.AspNetCore.SignalR;

using Microsoft.EntityFrameworkCore;
 
namespace CanliSoruBackend.Services

{

    public class OyunOrkestrator

    {

        private readonly IHubContext<OyunHub> _hub;

        private readonly IServiceScopeFactory _scopeFactory;
 
        // Aynı oyun iki kez başlatılmasın

        private static readonly HashSet<int> _calisanlar = new();

        private static readonly object _kilit = new();
 
        public OyunOrkestrator(

            IHubContext<OyunHub> hub,

            IServiceScopeFactory scopeFactory)

        {

            _hub = hub;

            _scopeFactory = scopeFactory;

        }
 
        public void Baslat(int oyunId, string odaKodu, DateTime baslangicZamani)

        {

            lock (_kilit)

            {

                if (_calisanlar.Contains(oyunId)) return;

                _calisanlar.Add(oyunId);

            }
 
            _ = Task.Run(() => Calistir(oyunId, odaKodu, baslangicZamani));

        }
 
        private async Task Calistir(int oyunId, string odaKodu, DateTime baslangicZamani)

        {

            try

            {

                // 1) Soruları sırayla al

                List<(int SoruId, string DogruCevap)> sorular;
 
                using (var scope = _scopeFactory.CreateScope())

                {

                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
 
                    sorular = await db.OyunSorulari

                        .Where(x => x.OyunId == oyunId)

                        .OrderBy(x => x.Sira)

                        .Select(x => new ValueTuple<int, string>(

                            x.SoruId, x.Soru.DogruCevap))

                        .ToListAsync();

                }
 
                if (sorular.Count == 0) return;
 
                // 2) Herkese "oyun başladı" de (ortak başlangıç zamanı)

                await _hub.Clients.Group(odaKodu)

                    .SendAsync("OyunBasladi", new { baslangicZamani });
 
                // "Hazır ol" ekranı: 10 sn

                await Task.Delay(TimeSpan.FromSeconds(10));
 
                // 3) Her soru için döngü

                for (int i = 0; i < sorular.Count; i++)

                {

                    var soruId = sorular[i].SoruId;

                    var dogruCevap = sorular[i].DogruCevap;
 
                    // Sorunun başlangıcını sunucuda işaretle (cevaplar bu yüzden kabul edilir)

                    using (var scope = _scopeFactory.CreateScope())

                    {

                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
 
                        var oyunSoru = await db.OyunSorulari

                            .FirstOrDefaultAsync(x =>

                                x.OyunId == oyunId && x.SoruId == soruId);
 
                        if (oyunSoru != null)

                        {

                            oyunSoru.BaslangicZamani = DateTime.UtcNow;

                            await db.SaveChangesAsync();

                        }

                    }
 
                    // 15 sn cevap süresi

                    await Task.Delay(TimeSpan.FromSeconds(15));
 
                    var bitisZamani = DateTime.UtcNow;

                    bool sonSoru = i == sorular.Count - 1;

                    DateTime? sonrakiBaslangic =

                        sonSoru ? null : bitisZamani.AddSeconds(10);
 
                    // Bu sorunun sonuçlarını hesapla

                    List<object> oyuncuSonuclari;
 
                    using (var scope = _scopeFactory.CreateScope())

                    {

                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
 
                        var oyuncular = await db.OyunOyunculari

                            .Where(x => x.OyunId == oyunId)

                            .OrderByDescending(x => x.Puan)

                            .ToListAsync();
 
                        var buSoruCevaplari = await db.OyunCevaplari

                            .Where(x => x.OyunId == oyunId && x.SoruId == soruId)

                            .ToListAsync();
 
                        oyuncuSonuclari = oyuncular.Select(o =>

                        {

                            var c = buSoruCevaplari

                                .FirstOrDefault(k => k.Kullaniciİd == o.KullaniciId);
 
                            return (object)new

                            {

                                kullaniciAdi = o.KullaniciAdi,

                                alinanPuan = c?.Puan ?? 0,

                                toplamPuan = o.Puan,

                                dogruMu = c?.DogruMu ?? false

                            };

                        }).ToList();

                    }
 
                    // Süre bitti → herkese yayınla

                    await _hub.Clients.Group(odaKodu).SendAsync("SoruBitti", new

                    {

                        oyunId,

                        soruId,

                        bitisZamani,

                        sonrakiSoruBaslangicZamani = sonrakiBaslangic,

                        oyuncular = oyuncuSonuclari,

                        dogruCevap

                    });
 
                    // Son soru değilse sonuç ekranı: 10 sn

                    if (!sonSoru)

                        await Task.Delay(TimeSpan.FromSeconds(10));

                }

            }

            catch (Exception ex)

            {

                Console.WriteLine("Orkestrator hatası: " + ex);

            }

            finally

            {

                lock (_kilit) { _calisanlar.Remove(oyunId); }

            }

        }

    }

}
 