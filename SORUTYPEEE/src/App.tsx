import { useState } from 'react'

import Guest from './components/Guest'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import Oyunkur from './components/Oyunkur'
import Odayakatil from './components/Odayakatil'
import Lobi from './components/Lobi'
import Nasiloynanir from './components/Nasiloynanir'
import Ayarlar from './components/Ayarlar'
import Oyun from './components/oyun'
import Sonuc from './components/Sonuc'
import SoruEkle from './components/SoruEkle'
import AdminPanel from './components/AdminPanel'

function App() {

  const [sayfa, setSayfa] = useState('guest')

  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [oyunId, setOyunId] = useState(0)
  const [odaKodu, setOdaKodu] = useState('')

  const [oyunBaslangicZamani, setOyunBaslangicZamani] = useState('')

  return (
    <>

      {sayfa === 'login' && (
        <Login setSayfa={setSayfa} />
      )}

      {sayfa === 'register' && (
        <Register setSayfa={setSayfa} />
      )}

      {sayfa === 'home' && (
        <Home
          kullaniciAdi={kullaniciAdi}
          setSayfa={setSayfa}
        />
      )}

      {sayfa === 'oyunkur' && (
        <Oyunkur
          setSayfa={setSayfa}
          setOyunId={setOyunId}
          setOdaKodu={setOdaKodu}
        />
      )}

      {sayfa === 'odayaKatil' && (
        <Odayakatil
          setSayfa={setSayfa}
          setOyunId={setOyunId}
          setOdaKodu={setOdaKodu}
        />
      )}

      {sayfa === 'lobi' && (
        <Lobi
          setSayfa={setSayfa}
          oyunId={oyunId}
          odaKodu={odaKodu}
          kullaniciAdi={kullaniciAdi}
          setOyunBaslangicZamani={setOyunBaslangicZamani}
        />
      )}

      {sayfa === 'nasilOynanir' && (
        <Nasiloynanir setSayfa={setSayfa} />
      )}

      {sayfa === 'ayarlar' && (
        <Ayarlar setSayfa={setSayfa} />
      )}

      {sayfa === 'oyun' && (
        <Oyun
          setSayfa={setSayfa}
          oyunId={oyunId}
          oyunBaslangicZamani={oyunBaslangicZamani}
          odaKodu={odaKodu}
        />
      )}

      {sayfa === 'sonuc' && (
        <Sonuc setSayfa={setSayfa} 
        oyunId={oyunId}
        />
      )}

      {sayfa === 'soruekle' && (
        <SoruEkle setSayfa={setSayfa} />
      )}

      {sayfa === 'adminpanel' && (
        <AdminPanel setSayfa={setSayfa} />
      )}

      {sayfa === 'guest' && (
        <Guest
          setSayfa={setSayfa}
          setKullaniciAdi={setKullaniciAdi}
        />
      )}

    </>
  )
}

export default App