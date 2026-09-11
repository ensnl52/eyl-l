using CanliSoruBackend.Models;
using CanliSoruBackend.ViewModels.Auth;

namespace CanliSoruBackend.Services
{
    public interface IAuthService
    {
        Task<(bool Basarili, string Mesaj)> RegisterAsync(
            RegisterRequest request);

        Task<(bool Basarili, string Mesaj)> LoginAsync(
            LoginRequest request);

        GuestViewModel Guest(string kullaniciAdi);

        DurumViewModel Durum(string authorization);

        Task<(bool Basarili, string Mesaj)> AdminYapAsync(
            string kullaniciAdi);

        Task<(bool Basarili, string Mesaj)> LoginKoduGonderAsync(
            LoginRequest request);

        Task<LoginViewModel?> LoginKoduDogrulaAsync(
            string kullaniciAdi,
            string kod);
    }
}