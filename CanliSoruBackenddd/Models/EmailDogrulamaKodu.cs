namespace CanliSoruBackend.Models
{
    public class EmailDogrulamaKodu
    {
        public int Id { get; set; }

        public string KullaniciId { get; set; } = "";

        public string Kod { get; set; } = "";

        public DateTime OlusturmaZamani { get; set; }

        public DateTime SonKullanmaZamani { get; set; }

        public bool KullanildiMi { get; set; } = false;
    }
}