namespace CanliSoruBackend.ViewModels.Oyun
{
    public class OyuncuViewModel
    {
        public string KullaniciId { get; set; } = "";
        public string KullaniciAdi { get; set; } = "";
        public int Puan { get; set; }
        public bool HazirMi { get; set; }
    }
}
