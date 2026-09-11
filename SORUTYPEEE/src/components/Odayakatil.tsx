import { useState } from 'react'

type OdayaKatilProps = {
  setSayfa: (sayfa: string) => void
  setOyunId: (oyunId: number) => void
  setOdaKodu: (odaKodu: string) => void
}

function Odayakatil({
  setSayfa,
  setOyunId,
  setOdaKodu
}: OdayaKatilProps) {
  const [odaKodu, setOdaKoduInput] = useState('')

  async function odayaKatil() {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Önce giriş yapmalısınız.')
      return
    }

    const temizOdaKodu = odaKodu.trim()

    if (!temizOdaKodu) {
      alert('Oda kodunu giriniz.')
      return
    }

    console.log('Gönderilen oda kodu:', temizOdaKodu)

    try {
      const cevap = await fetch(
        `https://localhost:7295/api/Oyun/katil?odaKodu=${encodeURIComponent(temizOdaKodu)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const metin = await cevap.text()

      console.log('Backend cevabı:', metin)
      console.log('HTTP durumu:', cevap.status)

      if (!cevap.ok) {
        alert(metin || 'Odaya katılınamadı.')
        return
      }

      const veri = JSON.parse(metin)

      setOyunId(veri.oyunId)
      setOdaKodu(veri.odaKodu)

      setSayfa('lobi')
    } catch (hata) {
      console.error('Odaya katılma hatası:', hata)
      alert(`Odaya katılma hatası: ${hata}`)
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
            🚪 Odaya Katıl
          </h1>

          <p className="text-muted">
            Katılmak istediğin odanın kodunu gir
          </p>
        </div>

        <div className="mb-4">
          <label className="form-label">
            Oda Kodu
          </label>

          <input
            type="text"
            className="form-control text-center"
            placeholder="Örn: ABC123"
            value={odaKodu}
            onChange={(e) =>
              setOdaKoduInput(
                e.target.value.toUpperCase()
              )
            }
          />
        </div>

        <button
          className="btn btn-success btn-lg w-100 mb-3"
          onClick={odayaKatil}
        >
          Odaya Katıl
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

export default Odayakatil