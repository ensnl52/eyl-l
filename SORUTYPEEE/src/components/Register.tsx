import { use, useState } from 'react'

type RegisterProps = {
  setSayfa: (sayfa: string) => void
}

function Register({ setSayfa }: RegisterProps) {
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [sifreTekrar, setSifreTekrar] = useState('')

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

      <div
        className="card shadow p-4"
        style={{ maxWidth: '500px', width: '100%' }}
      >

        <div className="text-center mb-4">

          <h1 className="fw-bold">
            Kayıt Ol
          </h1>

          <p className="text-muted">
            Yeni hesabını oluştur
          </p>

        </div>

        <div className="mb-3">

          <label className="form-label text-start d-block">
            Kullanıcı Adı
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Kullanıcı adınızı giriniz"
            value={kullaniciAdi}
            onChange={(e) => setKullaniciAdi(e.target.value)}
          />

        </div>

        <div className="mb-3">

          <label className="form-label text-start d-block">
            E-posta
          </label>

          <input
            type="email"
            className="form-control"
            placeholder="E-posta adresinizi giriniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

        </div>

        <div className="mb-4">

          <label className="form-label text-start d-block">
            Şifre
          </label>

          <input
            type="password"
            className="form-control"
            placeholder="Şifrenizi giriniz" 
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
          />

        </div>
         <div className="mb-4">

          <label className="form-label text-start d-block">
            Şifre Tekrar
          </label>

          <input
            type="password"
            className="form-control"
            placeholder="Şifrenizi tekrar giriniz"
            value={sifreTekrar}
            onChange={(e) => setSifreTekrar(e.target.value)}
          />

        </div>

        <button className="btn btn-danger btn-lg w-100 mb-3"
        onClick={()=>setSayfa('login')}>
          KAYIT OL
        </button>

        <button
          className="btn btn-link"
          onClick={() => setSayfa('login')}
        >
          Zaten hesabım var
        </button>

      </div>

    </div>
  )
}

export default Register