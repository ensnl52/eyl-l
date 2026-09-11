import { useEffect, useState } from 'react'
import './sonuc.css'

type SonucProps = {
  setSayfa: (sayfa: string) => void
  oyunId: number
}

type Oyuncu = {
  sira: number
  isim: string
  puan: number
}

function Sonuc({
  setSayfa,
  oyunId
}: SonucProps) {

  const [oyuncular, setOyuncular] =
    useState<Oyuncu[]>([])

  const [yukleniyor, setYukleniyor] =
    useState(true)

  useEffect(() => {

    async function sonuclariGetir() {

      const token =
        localStorage.getItem('token')

      if (!token || !oyunId) {
        setYukleniyor(false)
        return
      }

      try {

        const cevap = await fetch(
          `https://localhost:7295/api/Oyun/${oyunId}/oyuncular`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!cevap.ok) {
          throw new Error(
            `Sonuçlar alınamadı: ${cevap.status}`
          )
        }

        const veri = await cevap.json()

        const siraliOyuncular: Oyuncu[] =
          veri
            .map((oyuncu: any) => ({
              isim: oyuncu.kullaniciAdi,
              puan: oyuncu.puan
            }))
            .sort(
              (a: Oyuncu, b: Oyuncu) =>
                b.puan - a.puan
            )
            .map(
              (
                oyuncu: Oyuncu,
                index: number
              ) => ({
                ...oyuncu,
                sira: index + 1
              })
            )

        setOyuncular(siraliOyuncular)

      } catch (hata) {

        console.error(
          'Sonuçlar alınamadı:',
          hata
        )

      } finally {

        setYukleniyor(false)

      }
    }

    sonuclariGetir()

  }, [oyunId])


  if (yukleniyor) {

    return (
      <div className="sonuc-page">

        <main className="sonuc-card">

          <div className="trophy">
            <div className="trophy-circle">
              🏆
            </div>
          </div>

          <div className="tebrik">
            SONUÇLAR HAZIRLANIYOR
          </div>

          <h1>
            Bekleyin...
          </h1>

        </main>

      </div>
    )

  }


  const birinci = oyuncular[0]


  return (
    <div className="sonuc-page">

      <div className="sonuc-glow sonuc-glow-one"></div>
      <div className="sonuc-glow sonuc-glow-two"></div>


      <div className="sonuc-header">

        <div className="sonuc-logo">
          <span>Q</span>
          CANLI SORU
        </div>

        <div className="oyun-bitti">
          OYUN BİTTİ
        </div>

      </div>


      <main className="sonuc-card">

        <div className="trophy">

          <div className="trophy-circle">
            🏆
          </div>

        </div>


        <div className="tebrik">
          OYUN TAMAMLANDI
        </div>


        <h1>
          Tebrikler!
        </h1>


        <p className="sonuc-aciklama">
          20 soruluk oyun tamamlandı.
          <br />
          İşte oyun sonuçları.
        </p>


        {birinci && (

          <div className="benim-sonucum">

            <div className="benim-sira">
              #1
            </div>

            <div className="benim-bilgi">

              <span>
                OYUN BİRİNCİSİ
              </span>

              <strong>
                {birinci.isim}
              </strong>

            </div>

            <div className="benim-puan">

              <span>PUAN</span>

              <strong>
                {birinci.puan}
              </strong>

            </div>

          </div>

        )}


        <div className="siralama-baslik">

          <span>
            OYUNCU
          </span>

          <span>
            PUAN
          </span>

        </div>


        <div className="oyuncu-listesi">

          {oyuncular.map((oyuncu) => (

            <div
              className={`oyuncu-satiri ${
                oyuncu.sira === 1
                  ? 'birinci'
                  : ''
              }`}
              key={oyuncu.sira}
            >

              <div className="oyuncu-sira">

                {oyuncu.sira === 1
                  ? '🏆'
                  : oyuncu.sira}

              </div>


              <div className="oyuncu-isim">

                {oyuncu.isim}

                {oyuncu.sira === 1 && (
                  <span>
                    KAZANAN
                  </span>
                )}

              </div>


              <div className="oyuncu-puan">
                {oyuncu.puan}
              </div>

            </div>

          ))}

        </div>


        <div className="sonuc-butonlari">

          <button
            className="ana-menu-button"
            onClick={() =>
              setSayfa('home')
            }
          >
            ANA MENÜ
          </button>


          <button
            className="tekrar-button"
            onClick={() =>
              setSayfa('oyunkur')
            }
          >
            YENİ OYUN
          </button>

        </div>

      </main>

    </div>
  )
}

export default Sonuc