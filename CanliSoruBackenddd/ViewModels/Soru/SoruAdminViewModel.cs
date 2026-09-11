namespace CanliSoruBackend.ViewModels.Soru
{
    public class SoruAdminViewModel
    {
        public int Id { get; set; }
        public string SoruMetni { get; set; } = "";
        public string DogruCevap { get; set; } = "";
        public string? GorselUrl { get; set; }
    }
}
