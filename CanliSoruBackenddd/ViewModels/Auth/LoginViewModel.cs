namespace CanliSoruBackend.ViewModels.Auth
{
    public class LoginViewModel
    {
        public string Token { get; set; } = "";
        public string KullaniciTipi { get; set; } = "";
        public IList<string> Roller { get; set; } = new List<string>();
    }
}
