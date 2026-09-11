type OyunkurProps = {
  setSayfa: (sayfa: string) => void
  setOyunId: (oyunId: number) => void
  setOdaKodu: (odaKodu: string) => void
}

function Oyunkur({
  setSayfa,
  setOyunId,
  setOdaKodu
}: OyunkurProps) {

 async function oyunOlustur() {
  const token = localStorage.getItem('token')

  if (!token) {
    alert('Önce giriş yapmalısınız.')
    return
  }

  try {
    const cevap = await fetch(
      'https://localhost:7295/api/Oyun/baslat',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const veri = await cevap.json()

    if (!cevap.ok) {
      alert(veri || 'Oyun oluşturulamadı.')
      return
    }

    if (veri.odaKurucuToken) {
      localStorage.setItem(
        'token',
        veri.odaKurucuToken
      )
    }

    setOyunId(veri.oyunId)
    setOdaKodu(veri.odaKodu)

    setSayfa('lobi')
  } catch (hata) {
    console.error(
      'Oyun oluşturma hatası:',
      hata
    )

    alert(
      'Sunucuya bağlanılamadı.'
    )
  }
}

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

      <div
        className="card shadow p-4"
        style={{ maxWidth: '500px', width: '100%' }}
      >

        <div className="text-center mb-4">

          <h1 className="fw-bold">
            🎮 Oyun Kur
          </h1>

          <p className="text-muted">
            Yeni bir oyun odası oluştur
          </p>

        </div>

        <div className="alert alert-info text-center">
          Oyunun başlayabilmesi için en az 2 oyuncu gereklidir.
        </div>

        <div className="mb-3">

          <label className="form-label">
            Soru Sayısı
          </label>

          <input
            type="text"
            className="form-control"
            value="20"
            disabled
            readOnly
          />

        </div>

        <div className="mb-4">

          <label className="form-label">
            Soru Süresi
          </label>

          <input
            type="text"
            className="form-control"
            value="15 saniye"
            disabled
            readOnly
          />

        </div>

        <button
          className="btn btn-primary btn-lg w-100 mb-3"
          onClick={oyunOlustur}
        >
          Odayı Oluştur
        </button>

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

export default Oyunkur