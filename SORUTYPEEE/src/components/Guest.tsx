import { useState } from 'react'
import './Guest.css'

type GuestProps = {
  setSayfa: (sayfa: string) => void
  setKullaniciAdi: (kullaniciAdi: string) => void
}

function Guest({ setSayfa, setKullaniciAdi }: GuestProps) {

  const [nick, setNick] = useState('')

  async function guestGiris() {
  if (!nick.trim()) {
    alert('Lütfen bir nick giriniz')
    return
  }

  try {
    console.log("1 - Guest giriş başladı")

    const cevap = await fetch(
      `https://localhost:7295/api/Auth/guest?kullaniciAdi=${encodeURIComponent(nick.trim())}`,
      {
        method: 'POST'
      }
    )

    console.log("2 - Backend cevap verdi")
    console.log("Status:", cevap.status)

    if (!cevap.ok) {
      const hata = await cevap.text()

      console.log("3 - Backend hata cevabı:")
      console.log(hata)

      throw new Error(hata || 'Guest girişi başarısız')
    }

    const veri = await cevap.json()

    console.log("4 - Token geldi:")
    console.log(veri)

    localStorage.setItem('token', veri.token)
    localStorage.setItem('kullaniciTipi', veri.kullaniciTipi)
    localStorage.setItem('kullaniciAdi', nick.trim())

    setKullaniciAdi(nick.trim())

    console.log("5 - Home'a gidiliyor")

    setSayfa('home')

  } catch (hata) {

    console.error("GUEST HATASI:")
    console.error(hata)

    alert('Guest girişi yapılamadı')
  }
}
  return (
    <div className="guest-page">

      <header className="guest-header">

        <div className="guest-logo">

          <div className="guest-logo-box">
            ⚡
          </div>

          <div>
            <h2>CANLI SORU</h2>

            <span>
              CANLI BİLGİ YARIŞMASI
            </span>
          </div>

        </div>

      </header>


      <main className="guest-main">

        <div className="guest-badge">
          <span></span>
          CANLI YARIŞMAYA HAZIR MISIN?
        </div>


        <h1>
          BİLGİNİ
          <br />
          <strong>SINAMAYA</strong>
          <br />
          HAZIR OL.
        </h1>


        <p>
          Arkadaşlarınla aynı odada yarış,
          soruları herkesten önce cevapla
          ve en yüksek puanı kazan.
        </p>


        <div className="guest-nick">

          <input
            type="text"
            placeholder="Nickini gir"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
          />

        </div>


        <div className="guest-buttons">

          <button
            className="guest-start-button"
            onClick={guestGiris}
          >
            OYUNA BAŞLA
            <span>➜</span>
          </button>


          <button
            className="guest-register-button"
            onClick={() => setSayfa('login')}
          >
            Giriş Yap
          </button>

        </div>


        <div className="guest-features">

          <div>
            <strong>20</strong>
            <span>SORU</span>
          </div>


          <div>
            <strong>15</strong>
            <span>SANİYE</span>
          </div>


          <div>
            <strong>⚡</strong>
            <span>GERÇEK ZAMANLI</span>
          </div>

        </div>

      </main>

    </div>
  )
}

export default Guest