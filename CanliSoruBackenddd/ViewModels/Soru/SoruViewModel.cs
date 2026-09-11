namespace CanliSoruBackend.ViewModels.Soru
{
    public class SoruViewModel
    {
        public int Id { get; set; }
        public string SoruMetni { get; set; } = "";
        public string? GorselUrl { get; set; }
    }
}
