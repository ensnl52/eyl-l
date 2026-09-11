using CanliSoruBackend.ViewModels.Soru;

namespace CanliSoruBackend.Services
{
    public interface ISoruService
    {
        Task<List<SoruViewModel>> SorulariGetirAsync();

        Task<SoruViewModel?> RastgeleSoruAsync();

        Task<SoruAdminViewModel> SoruEkleAsync(
            SoruEkleViewModel model);
    }
}