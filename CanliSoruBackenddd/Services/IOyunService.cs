using CanliSoruBackend.Models;
using CanliSoruBackend.ViewModels.Oyun;
using CanliSoruBackend.ViewModels.Soru;

namespace CanliSoruBackend.Services
{
    public interface IOyunService
    {
        Task<OyunKatilViewModel> OyunaKatilAsync(
            string kullaniciId,
            string kullaniciAdi,
            string odaKodu);

        Task<List<OyuncuViewModel>?> OyunculariGetirAsync(
            string kullaniciId,
            int oyunId);

        Task<OyunOlusturViewModel?> OyunOlusturAsync(
            string kullaniciId,
            string kullaniciAdi);

        Task<List<SoruViewModel>?> OyunSorulariGetirAsync(
            string kullaniciId,
            int oyunId);

        Task<SoruBaslatViewModel?> SoruBaslatAsync(
            string kullaniciId,
            int oyunId,
            int soruId);

        Task<CevapViewModel?> CevaplaAsync(
            string kullaniciId,
            OyunCevap cevap);

        Task<HazirViewModel?> HazirOlAsync(
            string kullaniciId,
            int oyunId);

        Task<HazirKontrolViewModel?> HazirKontrolAsync(
            string kullaniciId,
            int oyunId);

        Task<OyunBaslatViewModel> OyunuBaslatAsync(
            string kullaniciId,
            int oyunId);
    }
}