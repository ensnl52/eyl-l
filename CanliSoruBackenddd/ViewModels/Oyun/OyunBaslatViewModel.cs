namespace CanliSoruBackend.ViewModels.Oyun
{
    public class OyunBaslatViewModel
    {
        public bool BasariliMi { get; set; }
        public string Mesaj { get; set; } = "";
        public int OyunId { get; set; }
        public string OdaKodu { get; set; } = "";
        public bool BasladiMi { get; set; }
        public DateTime BaslangicZamani { get; set; }
    }
}