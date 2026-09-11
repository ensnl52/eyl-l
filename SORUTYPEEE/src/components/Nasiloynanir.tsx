type NasilOynanirProps = {
  setSayfa: (sayfa: string) => void
}

function Nasiloynanir({ setSayfa }: NasilOynanirProps) {
  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

      <div
        className="card shadow p-4"
        style={{ maxWidth: '650px', width: '100%' }}
      >

        <div className="text-center mb-4">

          <h1 className="fw-bold">
            📖 Nasıl Oynanır?
          </h1>

          <p className="text-muted">
            Canlı Rastgele Soru Oyunu kuralları
          </p>

        </div>

        <div className="list-group mb-4">

          <div className="list-group-item">
            👥 <strong>En az 2 oyuncu:</strong> Oyun en az iki oyuncu olduğunda başlayabilir.
          </div>

          <div className="list-group-item">
            ❓ <strong>20 soru:</strong> Her oyun toplam 20 sorudan oluşur.
          </div>

          <div className="list-group-item">
            ⏱️ <strong>15 saniye:</strong> Her soru için 15 saniye cevaplama süresi vardır.
          </div>

          <div className="list-group-item">
            ✍️ <strong>Yazılı cevap:</strong> Cevaplar şıklı değildir. Oyuncu cevabını input alanına yazar.
          </div>

          <div className="list-group-item">
            🔒 <strong>Cevap gönderildikten sonra:</strong> Input kilitlenir ve tekrar cevap gönderilemez.
          </div>

          <div className="list-group-item">
            🔤 <strong>Cevap kontrolü:</strong> Büyük-küçük harf ve Türkçe i/ı farkları önemsenmez.
          </div>

          <div className="list-group-item">
            🏆 <strong>Puanlama:</strong> Doğru ve daha hızlı cevap veren oyuncular daha yüksek puan kazanır.
          </div>

          <div className="list-group-item">
            📊 <strong>Sonuç:</strong> 20 soru tamamlandığında oyuncular puanlarına göre sıralanır.
          </div>

        </div>

        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => setSayfa('home')}
        >
          🏠 Ana Menüye Dön
        </button>

      </div>

    </div>
  )
}

export default Nasiloynanir