import { useEffect, useState } from "react"
import * as signalR from "@microsoft/signalr"
import connection from "../SignalR/signalr"
import { signalRBaslat } from "../SignalR/signalrBaslat"

type LobiProps = {
  setSayfa: (sayfa: string) => void
  oyunId: number
  odaKodu: string
  kullaniciAdi: string
  setOyunBaslangicZamani: (zaman: string) => void
}

type Oyuncu = {
  kullaniciId: string
  kullaniciAdi: string
  puan: number
  hazirMi: boolean
}

function Lobi({
  setSayfa,
  oyunId,
  odaKodu,
  kullaniciAdi,
  setOyunBaslangicZamani
}: LobiProps) {
  console.log(
  "SETTER TEST:",
  setOyunBaslangicZamani,
  typeof setOyunBaslangicZamani
)
  const [oyuncular, setOyuncular] = useState<Oyuncu[]>([])
  const [mesaj, setMesaj] = useState("")
  const [hazirOluyor, setHazirOluyor] = useState(false)
  const [oyunBaslatiliyor, setOyunBaslatiliyor] = useState(false)
  const [kullaniciId, setKullaniciId] = useState("")
  const [benHazirim, setBenHazirim] = useState(false)


  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      return
    }

    try {
      const parcalar = token.split(".")

      if (parcalar.length !== 3) {
        return
      }

      const payload = JSON.parse(
        atob(
          parcalar[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      )

      const id =
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]

      if (id) {
        setKullaniciId(id)
      }
    } catch (hata) {
      console.error(
        "Token okunamadı:",
        hata
      )
    }
  }, [])

  async function oyunculariGetir() {
    const token = localStorage.getItem("token")

    if (!token || !oyunId) {
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
          `Oyuncular alınamadı: ${cevap.status}`
        )
      }

      const veri: Oyuncu[] =
        await cevap.json()

      setOyuncular(veri)
    } catch (hata) {
      console.error(
        "Oyuncular alınırken hata oluştu:",
        hata
      )
    }
  }

  async function hazirOl() {
    if (hazirOluyor || benHazirim) {
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      alert("Önce giriş yapmalısınız.")
      return
    }

    setHazirOluyor(true)
    setMesaj("")

    try {
      const cevap = await fetch(
        `https://localhost:7295/api/Oyun/${oyunId}/hazir`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const metin =
        await cevap.text()

      if (!cevap.ok) {
        setMesaj(
          metin ||
          "Hazır olma işlemi başarısız."
        )
        return
      }

      setBenHazirim(true)
      setMesaj("Hazır oldunuz.")

      await oyunculariGetir()

    } catch (hata) {
      console.error(
        "Hazır olma hatası:",
        hata
      )

      setMesaj(
        "Hazır olma sırasında bağlantı hatası oluştu."
      )
    } finally {
      setHazirOluyor(false)
    }
  }

  async function oyunuBaslat() {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Önce giriş yapmalısınız.")
      return
    }

    setOyunBaslatiliyor(true)
    setMesaj("")

    try {
      const cevap = await fetch(
        `https://localhost:7295/api/Oyun/${oyunId}/baslat-oyun`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const metin = await cevap.text()

      if (!cevap.ok) {
        setMesaj(
          metin || "Oyun başlatılamadı."
        )
        return
      }

      const sonuc = JSON.parse(metin)

      if (typeof setOyunBaslangicZamani === "function") {
  setOyunBaslangicZamani(sonuc.baslangicZamani)
}

      setSayfa("oyun")

    } catch (hata) {
      console.error(
        "Oyunu başlatma hatası:",
        hata
      )

      setMesaj(
        `Oyunu başlatma hatası: ${hata}`
      )
    } finally {
      setOyunBaslatiliyor(false)
    }
  }

  useEffect(() => {
    oyunculariGetir()

    const zamanlayici =
      setInterval(() => {
        oyunculariGetir()
      }, 1000)

    return () => {
      clearInterval(zamanlayici)
    }
  }, [oyunId])

  useEffect(() => {
    const oyuncuListesiGuncellendi =
      () => {
        oyunculariGetir()
      }

    connection.on(
      "OyuncuListesiGuncellendi",
      oyuncuListesiGuncellendi
    )

    return () => {
      connection.off(
        "OyuncuListesiGuncellendi",
        oyuncuListesiGuncellendi
      )
    }
  }, [oyunId])

  useEffect(() => {
    const oyunBasladi = (sonuc: {
      baslangicZamani: string
    }) => {
      console.log(
        "🔥 OyunBasladi eventi Guest'e geldi"
      )

      console.log(
        "🔥 Ortak başlangıç zamanı:",
        sonuc.baslangicZamani
      )

      setOyunBaslangicZamani(
        sonuc.baslangicZamani
      )

      setSayfa("oyun")
    }

    connection.on(
      "OyunBasladi",
      oyunBasladi
    )

    return () => {
      connection.off(
        "OyunBasladi",
        oyunBasladi
      )
    }
  }, [
    setSayfa,
    setOyunBaslangicZamani
  ])

  useEffect(() => {
    async function baglan() {
      try {
        await signalRBaslat()

        if (
          connection.state !==
          signalR.HubConnectionState.Connected
        ) {
          throw new Error(
            "SignalR bağlantısı kurulamadı."
          )
        }

        await connection.invoke(
          "OdayaKatil",
          odaKodu,
          kullaniciAdi
        )

        await oyunculariGetir()

        console.log(
          "Lobi SignalR bağlantısı başarılı"
        )
      } catch (hata) {
        console.error(
          "Lobi SignalR bağlantı hatası:",
          hata
        )
      }
    }

    if (
      odaKodu &&
      kullaniciAdi
    ) {
      baglan()
    }
  }, [odaKodu, kullaniciAdi])

  const odaKurucusu =
    oyuncular.length > 0 &&
    kullaniciId !== "" &&
    oyuncular[0].kullaniciId === kullaniciId

  const herkesHazir =
    oyuncular.length >= 2 &&
    oyuncular
      .filter(
        oyuncu =>
          oyuncu.kullaniciId !==
          oyuncular[0]?.kullaniciId
      )
      .every(
        oyuncu =>
          oyuncu.hazirMi
      )

  const oyunuBaslatabilir =
    odaKurucusu &&
    oyuncular.length >= 2 &&
    herkesHazir &&
    !oyunBaslatiliyor

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow p-4"
        style={{
          maxWidth: "600px",
          width: "100%"
        }}
      >
        <div className="text-center mb-4">
          <h1 className="fw-bold">
            🎮 Oyun Lobisi
          </h1>

          <p className="text-muted">
            Oyuncuların katılması bekleniyor
          </p>
        </div>

        <div className="alert alert-primary text-center">
          <p className="mb-1">
            Oda Kodu
          </p>

          <h2 className="fw-bold mb-0">
            {odaKodu}
          </h2>
        </div>

        <h5 className="mb-3">
          Oyuncular
        </h5>

        <div className="list-group mb-4">
          {oyuncular.map(
            oyuncu => (
              <div
                key={oyuncu.kullaniciId}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  👤 {oyuncu.kullaniciAdi}
                </span>

                <span
                  className={
                    oyuncu.hazirMi
                      ? "badge bg-success"
                      : "badge bg-secondary"
                  }
                >
                  {oyuncu.hazirMi
                    ? "Hazır"
                    : "Bekliyor"}
                </span>
              </div>
            )
          )}
        </div>

        {oyuncular.length < 2 && (
          <div className="alert alert-warning text-center">
            Oyunun başlayabilmesi için en az 2 oyuncu gereklidir.
          </div>
        )}

        {oyuncular.length >= 2 &&
          !herkesHazir && (
            <div className="alert alert-warning text-center">
              Katılan tüm oyuncular hazır olmalıdır.
            </div>
          )}

        {mesaj && (
          <div className="alert alert-info text-center">
            {mesaj}
          </div>
        )}

        {!odaKurucusu && (
          <button
            className="btn btn-primary btn-lg w-100 mb-3"
            onClick={hazirOl}
            disabled={
              benHazirim ||
              hazirOluyor
            }
          >
            {hazirOluyor
              ? "Hazırlanıyor..."
              : benHazirim
              ? "Hazırsınız ✓"
              : "Hazırım"}
          </button>
        )}

        {odaKurucusu && (
          <button
            className="btn btn-success btn-lg w-100 mb-3"
            onClick={oyunuBaslat}
            disabled={
              !oyunuBaslatabilir
            }
          >
            {oyunBaslatiliyor
              ? "Oyun Başlatılıyor..."
              : "Oyunu Başlat"}
          </button>
        )}

        <button
          className="btn btn-outline-danger w-100"
          onClick={() =>
            setSayfa("home")
          }
        >
          Lobiden Ayrıl
        </button>
      </div>
    </div>
  )
}

export default Lobi