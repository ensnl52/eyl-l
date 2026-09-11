import { useEffect, useRef, useState } from 'react'
import './oyun.css'
import connection from '../SignalR/signalr'
import { signalRBaslat } from '../SignalR/signalrBaslat'

type OyunProps = {
  setSayfa: (sayfa: string) => void
  oyunId: number
  oyunBaslangicZamani: string
  odaKodu: string
}

type Soru = {
  id: number
  soruMetni: string
  gorselUrl?: string | null
}

type SoruBaslatSonucu = {
  oyunId: number
  soruId: number
  baslangicZamani: string
   sunucuZamani: string
  sure: number
}

type CevapSonucu = {
  dogruMu: boolean
  puan: number
  toplamPuan: number
  gecenSaniye: number
}

type SoruSonucuOyuncu = {
  kullaniciAdi: string
  alinanPuan: number
  toplamPuan: number
  dogruMu: boolean
}

function Oyun({
  setSayfa,
  oyunId,
  oyunBaslangicZamani,
  odaKodu
}: OyunProps) {

  const [cevap, setCevap] = useState('')
  const [cevapGonderildi, setCevapGonderildi] = useState(false)
const [sunucuSaatFarki, setSunucuSaatFarki] =
  useState(0)
  const [sure, setSure] = useState(15)
  const [geriSayim, setGeriSayim] = useState(10)
  const [oyunBasliyor, setOyunBasliyor] = useState(true)
  

  const [sonucEkrani, setSonucEkrani] = useState(false)
  const [sonucSuresi, setSonucSuresi] = useState(10)
const [sonucBitisZamani, setSonucBitisZamani] = useState('')
const [sonrakiSoruBaslangicZamani, setSonrakiSoruBaslangicZamani] =
  useState('')
  const [soruSonuclari, setSoruSonuclari] =
  useState<SoruSonucuOyuncu[]>([])

  const [dogruCevap, setDogruCevap] =
    useState('')

  const [sorular, setSorular] = useState<Soru[]>([])
  const [soruIndex, setSoruIndex] = useState(0)

  const [soruBaslangicZamani, setSoruBaslangicZamani] =
    useState('')

  const [puan, setPuan] = useState(0)

  const [sorularYukleniyor, setSorularYukleniyor] =
    useState(true)

  const [cevapGonderiliyor, setCevapGonderiliyor] =
  
    useState(false)

  const baslatilanSoruRef =
    useRef<number | null>(null)
    const soruBittiBildirildiRef =
  useRef<number | null>(null)

// =====================================================
// SIGNALR - SORU BİTTİ
// =====================================================

useEffect(() => {
  let aktif = true

  async function dinlemeyiBaslat() {
    try {
      await signalRBaslat()

      await connection.invoke(
        'OdayaKatil',
        odaKodu,
        'Oyun'
      )

      if (!aktif) {
        return
      }

      connection.off('SoruBitti')

      connection.on(
        'SoruBitti',
        (veri: {
          oyunId: number
          soruId: number
          bitisZamani: string
          sonrakiSoruBaslangicZamani?: string
          oyuncular?: SoruSonucuOyuncu[]
          dogruCevap?: string
        }) => {

          if (veri.oyunId !== oyunId) {
            return
          }

          const mevcutSoru =
            sorular[soruIndex]

          if (!mevcutSoru) {
            return
          }

          if (
            veri.soruId !==
            mevcutSoru.id
          ) {
            return
          }

          console.log(
            'SIGNALR SORU BİTTİ:',
            veri
          )

          setSure(0)

          setSonucBitisZamani(
            new Date(
              new Date(
                veri.bitisZamani
              ).getTime() + 10000
            ).toISOString()
          )

          setSonrakiSoruBaslangicZamani(
            veri.sonrakiSoruBaslangicZamani || ''
          )

          setSoruSonuclari(
            veri.oyuncular || []
          )

          setDogruCevap(
            veri.dogruCevap || ''
          )

          setSonucEkrani(true)
          setSonucSuresi(10)
        }
      )

    } catch (hata) {
      console.error(
        'SoruBitti SignalR dinleme hatası:',
        hata
      )
    }
  }

  dinlemeyiBaslat()

  return () => {
    aktif = false
    connection.off('SoruBitti')
  }

}, [
  oyunId,
  soruIndex,
  sorular
])

  useEffect(() => {
    async function sorulariGetir() {

      const token =
        localStorage.getItem('token')

      if (!token || !oyunId) {
        setSorularYukleniyor(false)
        return
      }

      try {

        const cevap = await fetch(
          `https://localhost:7295/api/Oyun/${oyunId}/sorular`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!cevap.ok) {
          throw new Error(
            `Sorular alınamadı: ${cevap.status}`
          )
        }

        const veri: Soru[] =
          await cevap.json()

        setSorular(veri)

      } catch (hata) {

        console.error(
          'Sorular alınırken hata oluştu:',
          hata
        )

      } finally {

        setSorularYukleniyor(false)
      }
    }

    sorulariGetir()

  }, [oyunId])

  // =====================================================
  // ORTAK 10 SANİYELİK OYUN BAŞLANGICI
  // =====================================================

  useEffect(() => {

    if (
      !oyunBasliyor ||
      !oyunBaslangicZamani
    ) {
      return
    }

    const baslangic =
      new Date(
        oyunBaslangicZamani
      ).getTime()

    const timer =
      setInterval(() => {

        const simdi =
          Date.now()

        const gecenSaniye =
          Math.floor(
            (simdi - baslangic) / 1000
          )

        const kalan =
          Math.max(
            0,
            10 - gecenSaniye
          )

        setGeriSayim(kalan)

        if (kalan <= 0) {
          setOyunBasliyor(false)
        }

      }, 100)

    return () =>
      clearInterval(timer)

  }, [
    oyunBasliyor,
    oyunBaslangicZamani
  ])

 // =====================================================
// SORU BAŞLANGIÇ ZAMANI
// =====================================================

useEffect(() => {
  if (
    oyunBasliyor ||
    sonucEkrani ||
    sorularYukleniyor ||
    sorular.length === 0
  ) {
    return
  }

  // Sadece ilk soru için oyun başlangıcından
  // 10 saniye sonrasını hesapla.
  if (
    soruIndex === 0 &&
    !soruBaslangicZamani
  ) {
    const oyunBaslangic =
      new Date(
        oyunBaslangicZamani
      ).getTime()

    const soruBaslangic =
      oyunBaslangic + 10000

    setSoruBaslangicZamani(
      new Date(
        soruBaslangic
      ).toISOString()
    )

    setSure(15)
  }

}, [
  oyunBasliyor,
  sonucEkrani,
  sorularYukleniyor,
  sorular.length,
  soruIndex,
  oyunBaslangicZamani,
  soruBaslangicZamani
])
  // =====================================================
// ORTAK 15 SANİYELİK SORU SAYACI
// =====================================================

useEffect(() => {
  if (
    oyunBasliyor ||
    sonucEkrani ||
    !soruBaslangicZamani
  ) {
    return
  }

  const baslangic =
    new Date(
      soruBaslangicZamani
    ).getTime()

  const timer =
    setInterval(() => {

      const simdi =
        Date.now()

      const gecenSaniye =
        Math.floor(
          (simdi - baslangic) /
          1000
        )

      const kalan =
        Math.max(
          0,
          15 - gecenSaniye
        )

      setSure(kalan)

      if (kalan <= 0) {
        clearInterval(timer)
      }

    }, 100)

  return () => {
    clearInterval(timer)
  }

}, [
  oyunBasliyor,
  sonucEkrani,
  soruBaslangicZamani
])

  // =====================================================
  // SÜRE BİTTİ
  // =====================================================

 

  // =====================================================
  // SONUÇ EKRANI 10 SANİYE
  // =====================================================

  useEffect(() => {
    if (
      !sonucEkrani ||
      !sonucBitisZamani
    ) {
      return
    }

    const timer =
      setInterval(() => {

        const simdi =
          Date.now()

        const bitis =
          new Date(
            sonucBitisZamani
          ).getTime()

        const kalan =
          Math.max(
            0,
            Math.ceil(
              (bitis - simdi) / 1000
            )
          )

        setSonucSuresi(kalan)

        if (kalan <= 0) {

          clearInterval(timer)

          setSonucEkrani(false)
          setSonucSuresi(10)
          setSonucBitisZamani('')

          setCevap('')
          setCevapGonderildi(false)
          setDogruCevap('')

          if (
            soruIndex >=
            sorular.length - 1
          ) {
            setSoruBaslangicZamani('')
            setSayfa('sonuc')
            return
          }

          setSoruBaslangicZamani(
            sonrakiSoruBaslangicZamani
          )

          setSonrakiSoruBaslangicZamani('')

          setSoruIndex(prev => prev + 1)
        }
      }, 100)

    return () =>
      clearInterval(timer)

  }, [
    sonucEkrani,
    sonucBitisZamani,
    soruIndex,
    sorular.length,
    setSayfa,
    sonrakiSoruBaslangicZamani
  ])

  // =====================================================
  // CEVAP GÖNDER
  // =====================================================

  const cevapGonder =
    async () => {

      if (
        cevap.trim() === '' ||
        cevapGonderildi ||
        cevapGonderiliyor ||
        sure === 0
      ) {
        return
      }

      const token =
        localStorage.getItem('token')

      const mevcutSoru =
        sorular[soruIndex]

      if (
        !token ||
        !mevcutSoru
      ) {
        return
      }

      setCevapGonderiliyor(true)

      try {

        const cevapApi =
          await fetch(
            `https://localhost:7295/api/Oyun/cevapla`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Bearer ${token}`
              },

              body: JSON.stringify({
                oyunId: oyunId,
                soruId: mevcutSoru.id,
                cevap: cevap
              })
            }
          )

        if (!cevapApi.ok) {
          const hataMetni =
            await cevapApi.text()

          throw new Error(
            hataMetni ||
            `Cevap gönderilemedi: ${cevapApi.status}`
          )
        }

        const sonuc:
          CevapSonucu =
          await cevapApi.json()

        setPuan(
          sonuc.toplamPuan
        )

        setCevapGonderildi(true)

      } catch (hata) {

        console.error(
          'Cevap gönderme hatası:',
          hata
        )

      } finally {

        setCevapGonderiliyor(false)
      }
    }

  const mevcutSoru =
    sorular[soruIndex]

  const ilerleme =
    ((15 - sure) / 15) * 100


  if (sorularYukleniyor) {

    return (
      <div className="quiz-page">

        <div className="background-glow glow-purple"></div>

        <div className="background-glow glow-blue"></div>

        <main className="question-card">

          <div className="question-content">

            <h1>
              Sorular yükleniyor...
            </h1>

          </div>

        </main>

      </div>
    )
  }

  return (
    <div className="quiz-page">

      <div className="background-glow glow-purple"></div>

      <div className="background-glow glow-blue"></div>

      <header className="quiz-header">

        <div className="quiz-brand">

          <div className="brand-box">
            ⚡
          </div>

          <div>

            <h2>
              CANLI SORU
            </h2>

            <div className="live-text">
              <span className="live-dot"></span>
              CANLI OYUN
            </div>

          </div>

        </div>

        <div className="question-number">

          <span>
            SORU
          </span>

          <div>

            <strong>
              {String(
                soruIndex + 1
              ).padStart(2, '0')}
            </strong>

            <small>
              / {sorular.length}
            </small>

          </div>

        </div>

        <div className="timer-wrapper">

          <svg
            className="timer-svg"
            viewBox="0 0 100 100"
          >

            <circle
              className="timer-bg"
              cx="50"
              cy="50"
              r="43"
            />

            <circle
              className="timer-line"
              cx="50"
              cy="50"
              r="43"
              style={{
                strokeDashoffset:
                  270 -
                  (270 * ilerleme) / 100,
              }}
            />

          </svg>

          <div className="timer-number">

            <strong>
              {sure}
            </strong>

            <span>
              SN
            </span>

          </div>

          <div className="timer-label">

            SÜRE
            <br />
            KALDI

          </div>

        </div>

      </header>

      {oyunBasliyor && (
        <div className="result-overlay">

          <div className="result-card">

            <div className="result-icon">
              ⚡
            </div>

            <span className="result-badge">
              HAZIR OL
            </span>

            <h1>
              OYUN BAŞLIYOR
            </h1>

            <strong className="correct-answer">
              {geriSayim}
            </strong>

            <div className="next-question-info">

              <span>
                Geri Sayım Bitince Oyun Başlayacak
              </span>

            </div>

          </div>

        </div>
      )}

      {sonucEkrani && (
        <div className="result-overlay">

          <div className="result-card">

            <div className="result-icon">
              🏆
            </div>

            <span className="result-badge">
              SORU SONUCU
            </span>

            <h1>
              Doğru Cevap:
            </h1>

            <strong className="correct-answer">
              {dogruCevap}
            </strong>

            <div className="score-list">

              {soruSonuclari.map(
                (oyuncu, index) => (
                  <div
                    className={
                      `score-item${
                        index === 0
                          ? ' first'
                          : ''
                      }`
                    }
                    key={`${oyuncu.kullaniciAdi}-${index}`}
                  >

                    <span>
                      {index === 0
                        ? '🥇'
                        : index === 1
                        ? '🥈'
                        : index === 2
                        ? '🥉'
                        : '•'}
                      {' '}
                      {oyuncu.kullaniciAdi}
                    </span>

                    <strong>
                      {oyuncu.alinanPuan > 0
                        ? `+${oyuncu.alinanPuan}`
                        : '0'}
                    </strong>

                    <small>
                      {oyuncu.toplamPuan} PUAN
                    </small>

                  </div>
                )
              )}

            </div>

            <div className="next-question-info">

              <span>
                YENİ SORU
              </span>

              <strong>
                {sonucSuresi}
              </strong>

              <small>
                saniye içinde başlayacak
              </small>

            </div>

          </div>

        </div>
      )}

      <main className="question-card">

        <div className="question-content">

          <div className="question-badge">

            SORU {
              String(
                soruIndex + 1
              ).padStart(2, '0')
            }

          </div>

          <h1>
            {mevcutSoru?.soruMetni}
          </h1>

          {mevcutSoru?.gorselUrl && (
            <img
              src={mevcutSoru.gorselUrl}
              alt="Soru görseli"
              style={{
                maxWidth: '100%',
                maxHeight: '250px',
                objectFit: 'contain',
                marginTop: '20px',
                borderRadius: '12px'
              }}
            />
          )}

          <div className="question-divider">

            <span>
              ϟ
            </span>

          </div>

          <p>
            Cevabını düşün ve süren dolmadan gönder.
          </p>

        </div>

        <div className="answer-section">

          <label>
            CEVABIN
          </label>

          <div className="answer-row">

            <div className="answer-input-wrapper">

              <input
                type="text"
                value={cevap}
                disabled={
                  cevapGonderildi ||
                  cevapGonderiliyor ||
                  sure === 0
                }
                placeholder="Cevabını buraya yaz..."
                onChange={(e) =>
                  setCevap(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === 'Enter') {
                    cevapGonder()
                  }

                }}
              />

              <span className="input-icon">
                ✎
              </span>

            </div>

            <button
              className="answer-button"
              disabled={
                cevapGonderildi ||
                cevapGonderiliyor ||
                cevap.trim() === '' ||
                sure === 0
              }
              onClick={cevapGonder}
            >

              {cevapGonderiliyor
                ? 'GÖNDERİLİYOR...'
                : cevapGonderildi
                ? '✓ GÖNDERİLDİ'
                : 'CEVABI GÖNDER'}

              <span>
                ➤
              </span>

            </button>

          </div>

          {cevapGonderildi && (
            <div className="answer-success">

              <span>
                ✓
              </span>

              <div>

                <strong>
                  Cevabın alındı
                </strong>

                <small>
                  Cevabın başarıyla kaydedildi.
                </small>

              </div>

            </div>
          )}

          {sure === 0 &&
            !cevapGonderildi && (
              <div className="time-ended">
                Süre doldu. Bu soru için cevap hakkın sona erdi.
              </div>
            )}

        </div>

      </main>

      <footer className="quiz-stats">

        <div className="stat-item">

          <div className="stat-circle trophy">
            🏆
          </div>

          <div>

            <span>
              PUAN
            </span>

            <strong>
              {puan}
            </strong>

          </div>

        </div>

        <div className="stat-separator"></div>

        <div className="stat-item">

          <div className="stat-circle players">
            👥
          </div>

          <div>

            <span>
              OYUNCU
            </span>

            <strong>
              4
            </strong>

          </div>

        </div>

        <div className="stat-separator"></div>

        <div className="stat-item">

          <div className="stat-circle ranking">
            📊
          </div>

          <div>

            <span>
              SIRALAMA
            </span>

            <strong>
              -
            </strong>

          </div>

        </div>

      </footer>

      <button
        className="leave-button"
        onClick={() =>
          setSayfa('home')
        }
      >

        <span>
          ⇥
        </span>

        Oyundan ayrıl

      </button>

    </div>
  )
      }
export default Oyun