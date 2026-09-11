import { useState } from 'react'

type AyarlarProps = {
  setSayfa: (sayfa: string) => void
}

function Ayarlar({ setSayfa }: AyarlarProps) {
  const [kullaniciAdi, setKullaniciAdi] = useState('Enes')
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">

      <div
        className="card shadow p-4"
        style={{ maxWidth: '500px', width: '100%' }}
      >

        <div className="text-center mb-4">

          <h1 className="fw-bold">
            ⚙️ Ayarlar
          </h1>

          <p className="text-muted">
            Hesap bilgilerinizi düzenleyin
          </p>

        </div>

        <div className="mb-3">

          <label className="form-label">
            Kullanıcı Adı
          </label>

  <input
  type="text"
   className="form-control"
 value={kullaniciAdi}
onChange={(e) => setKullaniciAdi(e.target.value)}
          />

        </div>

 <div className="mb-3">

 <label className="form-label">
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

          <label className="form-label">
            Yeni Şifre
            
          </label>
          
          
        

  <input
    type="password"
   className="form-control"
    placeholder="Yeni şifrenizi giriniz"
    value={sifre}
    onChange={(e) => setSifre(e.target.value)}
          />



 <label className="form-label">
            Yeni Şifre Tekrar
          </label>


          
          <input


      type="password"
       className="form-control"
        placeholder="Yeni şifrenizi Tekrar giriniz"
      value={sifre}
     onChange={(e) => setSifre(e.target.value)}
          />


        </div>

        <button
          className="btn btn-primary btn-lg w-100 mb-3"
          onClick={()=>setSayfa('login')}
        >
          Değişiklikleri Kaydet
          
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

export default Ayarlar