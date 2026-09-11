import { useState } from 'react'

type LoginProps = {
  setSayfa: (sayfa: string) => void
}

function Login({ setSayfa }: LoginProps) {
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [sifre, setSifre] = useState('')
  const [kod, setKod] = useState('')
  const [kodAsamasi, setKodAsamasi] = useState(false)
  const [hata, setHata] = useState('')
  const [mesaj, setMesaj] = useState('')

  async function girisYap() {
    setHata('')
    setMesaj('')

    if (!kullaniciAdi.trim() || !sifre.trim()) {
      setHata(
        'Kullanıcı adı ve şifre alanları boş bırakılamaz.'
      )
      return
    }

    try {
      const cevap = await fetch(
        'https://localhost:7295/api/Auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            kullaniciAdi: kullaniciAdi,
            sifre: sifre
          })
        }
      )

      const veri = await cevap.text()

      if (!cevap.ok) {
        setHata(
          veri || 'Kullanıcı adı veya şifre hatalı.'
        )
        return
      }

      setMesaj(veri)
      setKodAsamasi(true)
    } catch (error) {
      console.error('Giriş hatası:', error)

      setHata(
        'Sunucuya bağlanılamadı.'
      )
    }
  }

  async function koduDogrula() {
    setHata('')
    setMesaj('')

    if (!kod.trim()) {
      setHata(
        'Doğrulama kodunu giriniz.'
      )
      return
    }

    try {
      const cevap = await fetch(
        `https://localhost:7295/api/Auth/login-dogrula?kullaniciAdi=${encodeURIComponent(
          kullaniciAdi
        )}&kod=${encodeURIComponent(kod)}`,
        {
          method: 'POST'
        }
      )

      if (!cevap.ok) {
        const veri = await cevap.text()

        setHata(
          veri ||
            'Doğrulama kodu hatalı veya süresi dolmuş.'
        )

        return
      }

      const veri = await cevap.json()

      localStorage.setItem(
        'token',
        veri.token
      )

      localStorage.setItem(
        'kullaniciTipi',
        veri.kullaniciTipi
      )

      localStorage.setItem(
        'roller',
        JSON.stringify(veri.roller || [])
      )

      const adminMi =
        veri.roller &&
        veri.roller.includes('Admin')

      if (adminMi) {
        setSayfa('adminpanel')
        return
      }

      setSayfa('home')
    } catch (error) {
      console.error(
        'Kod doğrulama hatası:',
        error
      )

      setHata(
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
            Canlı Sorular
          </h1>

          <p className="text-muted">
            Canlı Rastgele Soru Oyunu
            <br />
            Hesabına giriş yap ve yarışmaya başla
          </p>
        </div>

        {hata && (
          <div className="alert alert-danger">
            {hata}
          </div>
        )}

        {mesaj && (
          <div className="alert alert-success">
            {mesaj}
          </div>
        )}

        {!kodAsamasi ? (
          <>
            <div className="mb-3">
              <label className="form-label text-start d-block">
                Kullanıcı adı
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Kullanıcı adınızı giriniz."
                value={kullaniciAdi}
                onChange={(e) =>
                  setKullaniciAdi(e.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-start d-block">
                Şifre
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Şifrenizi giriniz"
                value={sifre}
                onChange={(e) =>
                  setSifre(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-danger btn-lg w-100"
              onClick={girisYap}
            >
              GİRİŞ YAP
            </button>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label text-start d-block">
                Doğrulama Kodu
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="E-postanıza gelen 6 haneli kodu giriniz."
                value={kod}
                onChange={(e) =>
                  setKod(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-success btn-lg w-100"
              onClick={koduDogrula}
            >
              KODU DOĞRULA
            </button>
          </>
        )}

        <div className="text-center mt-3">

          <span>Hesabınız yok mu? </span>

          <button
            className="btn btn-link p-0"
            onClick={() => setSayfa('register')}
          >
            Kayıt Ol
          </button>

        </div>

        <div className="text-center mt-3">
          <span>Ana Sayfaya dönmek mi istiyorsunuz? </span>

          <button
            className="btn btn-link p-0"
            onClick={() => setSayfa('guest')}
          >
            Geri Dön
          </button>
        </div>

      </div>

    </div>
  )
}

export default Login