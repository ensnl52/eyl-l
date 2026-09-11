using CanliSoruBackend.ViewModels.Soru;

namespace CanliSoruBackend.ViewModels.Oyun
{
    public class OyunOlusturViewModel
    {
        public int OyunId { get; set; }
        public string OdaKodu { get; set; } = "";
        public List<SoruViewModel> Sorular { get; set; } = new();
    }
}