import { useEffect, useState } from 'react'
import './admin.css'

import type { Soru } from '../types/Soru'
import { sorulariGetir } from '../services/soruService'

type AdminPanelProps = {
  setSayfa: (sayfa: string) => void
}




function AdminPanel({ setSayfa }: AdminPanelProps) {



  const [sorular, setSorular] = useState<Soru[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState('')
  const [silinecekSoru, SetsilinecekSoru] =useState<Soru | null>(null)

  const [arama, setArama] = useState('')

  useEffect(() => {
    const sorulariYukle = async () => {
      try {
        setYukleniyor(true)
        setHata('')

        const data = await sorulariGetir()

        setSorular(data)
     } catch (error) {
        console.error(error)

        setHata(
          'Sorular yüklenirken bir hata oluştu.'
        )
      } finally {
        setYukleniyor(false)
      }
    }

    sorulariYukle()
  }, [])

  const filtrelenmisSorular = sorular.filter((soru) =>
    soru.metin
      .toLocaleLowerCase('tr-TR')
      .includes(
        arama.toLocaleLowerCase('tr-TR')
      )
  )

  return (
    <div className="admin-page">

     

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="admin-logo-icon">
            Q
          </div>

          <div>
            <strong>CANLI SORU</strong>
            <span>ADMIN PANEL</span>
          </div>

        </div>

        <nav className="admin-menu">

          <button className="admin-menu-item">
            <span>▦</span>
            Dashboard
          </button>

          <button className="admin-menu-item active">
            <span>?</span>
            Soru Yönetimi
          </button>

          <button className="admin-menu-item">
            <span>♟</span>
            Kullanıcılar
          </button>

          <button className="admin-menu-item">
            <span>◉</span>
            Oyunlar
          </button>

        </nav>

        <button
          className="admin-exit"
          onClick={() => setSayfa('home')}
        >
          ← Ana Menü
        </button>

      </aside>

    

      <main className="admin-content">

        <header className="admin-header">

          <div>

            <span className="admin-page-label">
              YÖNETİM PANELİ
            </span>

            <h1>
              Soru Yönetimi
            </h1>

            <p>
              Sistemde bulunan soruları yönet.
            </p>

          </div>
<button
  className="add-question-button"
  onClick={() => setSayfa('soruEkle')}
>
  + Yeni Soru
</button>

        </header>

     

        <section className="admin-stats">

          <div className="admin-stat-card">

            <span className="stat-title">
              TOPLAM SORU
            </span>

            <strong>
              {sorular.length}
            </strong>

            <small>
              Sistemde kayıtlı
            </small>

          </div>

          <div className="admin-stat-card">

            <span className="stat-title">
              GÖSTERİLEN
            </span>

            <strong>
              {filtrelenmisSorular.length}
            </strong>

            <small>
              Arama sonucunda
            </small>

          </div>

        </section>

       

        <section className="question-management">

          <div className="table-header">

            <div>

              <h2>
                Sorular
              </h2>

              <span>
                Backend'den gelen soru havuzu
              </span>

            </div>

   <input
      className="question-search"
     type="text"
   value={arama}
      placeholder="Soru ara..."
    onChange={(e) =>
     setArama(e.target.value)
              }
            />

          </div>

     

          {yukleniyor && (
            <div className="admin-loading">
              Sorular yükleniyor...
            </div>
          )}

        

          {!yukleniyor && hata && (
            <div className="admin-error">
              {hata}
            </div>
          )}

          
          {!yukleniyor &&
            !hata &&
            filtrelenmisSorular.length > 0 && (

              <div className="question-table">

                <div className="table-row table-head">

                  <span>ID</span>

                  <span>SORU</span>

                  <span>CEVAP</span>

                  <span>İŞLEMLER</span>

                </div>

                {filtrelenmisSorular.map((soru) => (

                  <div
                    className="table-row"
                    key={soru.id}
                  >

                    <span className="question-id">
                      #{soru.id}
                    </span>

                    <span className="question-text">
                      {soru.metin}
                    </span>

                    <span className="question-answer">
                      {soru.cevap}
                    </span>

                    <div className="question-actions">

                      <button className="edit-button">
                        Düzenle
                      </button>
<button
  className="delete-button"
  onClick={() => SetsilinecekSoru(soru)}
>
  Sil
</button>
                    </div>

                  </div>

                ))}

              </div>

            )}

          

 {!yukleniyor &&
!hata &&
  filtrelenmisSorular.length === 0 && (

 <div className="admin-empty">
  Gösterilecek soru bulunamadı.      </div>

            )}
            
</section>

      </main>
      {silinecekSoru && (
  <div className="delete-modal-overlay">

   <div className="delete-modal">
   <div className="delete-modal-icon">
  !
  </div>
   <span className="delete-modal-label">
        SORU SİLME
      </span>

      <h2>
        Soruyu silmek istediğine emin misin?
      </h2>

      <p>
        Bu işlem geri alınamaz. Aşağıdaki soru
        soru havuzundan kaldırılacaktır.
      </p>

      <div className="delete-question-preview">
        {silinecekSoru.metin}
      </div>

      <div className="delete-modal-buttons">

    <button
className="delete-cancel"
     onClick={() => SetsilinecekSoru(null)}
        >
    Vazgeç
    </button>

        <button
   className="delete-confirm"
    onClick={() => {

         

console.log(
    'Silinecek soru:',
     silinecekSoru.id
    )

   SetsilinecekSoru(null)
          }}
        >
          Soruyu Sil
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  )
}

export default AdminPanel