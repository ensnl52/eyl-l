import { useState, useEffect } from "react"

type HomeProps = {
  kullaniciAdi: string
  setSayfa: (sayfa: string) => void
}

function Home({ kullaniciAdi, setSayfa }: HomeProps) {

  const [girisYapmis, setGirisYapmis] = useState(false)

  useEffect(() => {

    async function kullaniciDurumunuKontrolEt() {

      const token = localStorage.getItem('token')

      if (!token) {
        setGirisYapmis(false)
        return
      }

      try {

        const cevap = await fetch(
          'https://localhost:7295/api/Auth/durum',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!cevap.ok) {
          setGirisYapmis(false)
          return
        }

        const veri = await cevap.json()

        setGirisYapmis(veri.girisYapmis)

      } catch (hata) {

        console.error(hata)

        setGirisYapmis(false)
      }
    }

    kullaniciDurumunuKontrolEt()

  }, [])


  function cikisYap() {

    localStorage.removeItem('token')

    setSayfa('guest')
  }


  return (

    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

      <div
        className="card shadow p-4 text-center"
        style={{ maxWidth: '500px', width: '100%' }}
      >

        <h1 className="fw-bold mb-2">
          Canlı Sorular
        </h1>

        <p className="text-muted">
          Hoş geldin, {kullaniciAdi}!
        </p>


        {girisYapmis && (
          <button
            className="btn btn-primary btn-lg w-100 mb-3"
            onClick={() => setSayfa('oyunkur')}
          >
            Oyun Kur
          </button>
        )}


        <button
          className="btn btn-success btn-lg w-100 mb-3"
          onClick={() => setSayfa('odayaKatil')}
        >
          Odaya Katıl
        </button>


        <button
          className="btn btn-info btn-lg w-100 mb-3"
          onClick={() => setSayfa('nasilOynanir')}
        >
          Nasıl Oynanır?
        </button>


        <button
          className="btn btn-secondary btn-lg w-100 mb-3"
          onClick={() => setSayfa('ayarlar')}
        >
          Ayarlar
        </button>


        <hr />


        <button
          className="btn btn-outline-danger w-100"
          onClick={cikisYap}
        >
          Çıkış Yap
        </button>

      </div>

    </div>
  )
}

export default Home