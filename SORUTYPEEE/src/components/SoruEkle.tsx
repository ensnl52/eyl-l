import { useState } from 'react'
import './soruEkle.css'

type SoruEkleProps = {
  setSayfa: (sayfa: string) => void
}

function SoruEkle({ setSayfa }: SoruEkleProps) {
  const [metin, setMetin] = useState('')
  const [cevap, setCevap] = useState('')
  const [hata, setHata] = useState('')

  const soruKaydet = () => {
    setHata('')

    if (metin.trim() === '') {
      setHata('Lütfen soru metnini girin.')
      return
    }

    if (cevap.trim() === '') {
      setHata('Lütfen doğru cevabı girin.')
      return
    }

  

    console.log('Gönderilecek soru:', {
      metin: metin.trim(),
      cevap: cevap.trim(),
    })
  }

  return (
    <div className="soru-ekle-page">

      <div className="soru-ekle-glow glow-one"></div>
      <div className="soru-ekle-glow glow-two"></div>

      <header className="soru-ekle-header">

        <button
          className="geri-button"
          onClick={() => setSayfa('admin')}
        >
          ← Soru Yönetimi
        </button>

        <div className="soru-ekle-title">
          <span>ADMIN PANEL</span>
          <h1>Yeni Soru Ekle</h1>
          <p>
            Soru havuzuna yeni bir soru ekle.
          </p>
        </div>

      </header>

      <main className="soru-form-card">

        <div className="form-icon">
          ?
        </div>

        <div className="form-heading">
          <h2>Soru Bilgileri</h2>
          <p>
            Oyuncuların karşılaşacağı soru ve doğru cevabı girin.
          </p>
        </div>

        <div className="form-group">

          <label htmlFor="soru">
            SORU METNİ
          </label>

          <textarea
            id="soru"
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            placeholder="Örneğin: Türkiye'nin başkenti neresidir?"
            rows={5}
            maxLength={500}
          />

          <div className="character-count">
            {metin.length} / 500
          </div>

        </div>

        <div className="form-group">

          <label htmlFor="cevap">
            DOĞRU CEVAP
          </label>

          <input
            id="cevap"
            type="text"
            value={cevap}
            onChange={(e) => setCevap(e.target.value)}
            placeholder="Örneğin: Ankara"
            maxLength={200}
          />

          <small>
            Oyuncunun cevabı bu bilgiye göre kontrol edilecek.
          </small>

        </div>

        {hata && (
          <div className="form-error">
            <span>!</span>
            {hata}
          </div>
        )}

        <div className="form-security">

          <span>🔐</span>

          <div>
            <strong>Admin işlemi</strong>
            <p>
              Bu işlem yalnızca yetkili admin kullanıcıları tarafından
              gerçekleştirilebilir.
            </p>
          </div>

        </div>

        <div className="form-buttons">

          <button
            className="cancel-button"
            onClick={() => setSayfa('admin')}
          >
            Vazgeç
          </button>

          <button
            className="save-button"
            onClick={soruKaydet}
          >
            ✓ Soruyu Kaydet
          </button>

        </div>

      </main>

    </div>
  )
}

export default SoruEkle