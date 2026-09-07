# TubiScribe

### YouTube Gelişmiş Transkript Motoru ve Reklamsız Oynatıcı

TubiScribe, standart YouTube deneyimini akademik ve odaklanmış bir çalışma ortamına dönüştüren bağımsız bir masaüstü web uygulamasıdır. Reklamsız ve dikkat dağıtıcılardan arındırılmış arayüzüyle videoları izlerken eş zamanlı transkript okuma, 35+ dile anlık çeviri ve profesyonel formatlarda dışa aktarma imkânı sunar.

> **API Anahtarı Gerektirmez** — YouTube Data API kotasına takılmadan, sınırsız arama ve transkript çekme.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-GPL_3.0-green?style=for-the-badge)

---

## İçindekiler

- [Özellikler](#-özellikler)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Hızlı Başlangıç](#-hızlı-başlangıç-tek-komut)
- [Manuel Kurulum](#-manuel-kurulum)
- [Kullanım Rehberi](#-kullanım-rehberi)
- [Proje Mimarisi](#-proje-mimarisi)
- [API Referansı](#-api-referansı)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Sorun Giderme](#-sorun-giderme)
- [Yol Haritası](#-yol-haritası)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## Özellikler

### Arama ve Keşif
| Özellik | Açıklama |
|---|---|
| **Sınırsız Arama** | YouTube Data API kotası olmadan `yt-dlp` ile doğrudan video arama. Her aramada 15 sonuç döner. |
| **Akıllı Playlist Desteği** | Herhangi bir YouTube playlist linkini yapıştırın — tüm videolar sırasıyla listelenir, tek tıkla oynatılır. |
| **Otomatik Algılama** | Girilen metnin arama terimi mi yoksa playlist linki mi olduğu otomatik algılanır. |

###  Video Oynatıcı
| Özellik | Açıklama |
|---|---|
| **Reklamsız Oynatma** | YouTube IFrame API üzerinden reklamsız, kesintisiz video akışı. |
| **Stabil Gömme** | `react-youtube` ile codec/DRM hatası olmadan güvenilir oynatma. |
| **Responsive Tasarım** | 16:9 aspect ratio ile her ekran boyutuna uyumlu oynatıcı. |

###  İnteraktif Transkript
| Özellik | Açıklama |
|---|---|
| **Otomatik Dil Tespiti** | Videoda mevcut olan tüm orijinal ve otomatik oluşturulmuş altyazı dillerini anında tespit eder. |
| **Senkronize Vurgulama** | Video oynarken aktif satır mavi renkle vurgulanır ve panel otomatik kaydırılır. |
| **Tıkla-Atla (Seek)** | Transkriptteki herhangi bir cümleye tıklayın, video o saniyeye atlasın. |
| **Çift Görünüm Modu** | **Liste** (zaman damgalı satırlar) veya **Paragraf** (akıcı metin) — paragraf modunda da her cümle tıklanabilir. |

### Çeviri Motoru
| Özellik | Açıklama |
|---|---|
| **35+ Dil Desteği** | Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Arapça, Çince, Japonca, Korece, Hintçe ve daha fazlası. |
| **Anlık Çeviri** | YouTube'un dahili çeviri motoru kullanılarak saniyeler içinde hedef dile çeviri. |
| **Orijinal + Çeviri** | Orijinal dili seçin, ardından çeviri dilini seçin — ikisi arasında anında geçiş yapın. |

### Dışa Aktarma (Export)
| Özellik | Açıklama |
|---|---|
| **Şık Export Modalı** | Tek bir "Dışa Aktar" butonu ile format ve stil seçeneklerinin sunulduğu pop-up pencere. |
| **TXT — Zaman Damgalı** | `[00:15] Merhaba, bu bir testtir.` formatında satır satır metin dosyası. |
| **TXT — Düz Metin** | Zaman damgası olmadan akıcı paragraf metni — akademik alıntılar için ideal. |
| **SRT — Altyazı Dosyası** | `00:00:15,000 --> 00:00:20,500` standart SubRip formatı — VLC, Premiere, DaVinci Resolve uyumlu. |
| **İstemci Taraflı** | Tüm dönüştürme ve indirme tarayıcıda gerçekleşir, sunucuya ek yük binmez. |

---

## Ekran Görüntüleri

> Ekran görüntüleri yakında eklenecektir.


## Hızlı Başlangıç (Tek Komut)

### Gereksinimler

TubiScribe, eksik bağımlılıkları **otomatik olarak kurar**. Yine de sisteminizde şunların bulunması önerilir:

| Bağımlılık | Minimum Versiyon | Otomatik Kurulur mu? |
|---|---|---|
| Python | 3.10+ 
| python3-venv 
| python3-pip  
| Node.js | 18+ 
| npm | 9+ 
| curl veya wget 

> **Desteklenen İşletim Sistemleri:** Ubuntu 20.04+, Debian 11+, Linux Mint 20+, Pop!_OS ve apt tabanlı tüm dağıtımlar.İlerdeki Sürümlerde Diğer Dağıtımlar İçin Destek Sağlanacaktır.

### Kurulum ve Çalıştırma

```bash
# 1. Projeyi klonla
git clone https://github.com/KULLANICI/TubiScribe.git

# 2. Proje dizinine gir
cd TubiScribe

# 3. Tek komutla kur ve çalıştır
./start.sh
```

### `start.sh` Ne Yapar?

```
[1/5] Sistem bağımlılıkları kontrol ediliyor...
      → python3 / python3-venv / python3-pip yoksa apt ile kurar
[2/5] Node.js kontrol ediliyor...
      → Node.js yoksa NodeSource LTS deposundan kurar
[3/5] Backend kuruluyor...
      → Python sanal ortamı (venv) oluşturur
      → pip paketlerini kurar (fastapi, yt-dlp, youtube-transcript-api)
[4/5] Frontend kuruluyor...
      → npm paketlerini kurar (react, tailwind, axios, vb.)
[5/5] Sunucular başlatılıyor...
      → Backend: http://localhost:8000
      → Frontend: http://localhost:5173
```

### Sonuç

```
  ════════════════════════════════════════════
  ✔ TubiScribe hazır ve çalışıyor!

  Frontend → http://localhost:5173
  Backend  → http://localhost:8000
  API Docs → http://localhost:8000/docs

  Durdurmak için: Ctrl+C
  ════════════════════════════════════════════
```

---

## 🔧 Manuel Kurulum

Otomatik kurulum istemiyorsanız veya farklı bir dağıtım kullanıyorsanız:

### Backend

```bash
cd backend

# Sanal ortam oluştur ve aktifleştir
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# Bağımlılıkları kur
pip install -r requirements.txt

# Sunucuyu başlat
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend

# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

> **Not:** Backend ve frontend'i ayrı terminal pencerelerinde çalıştırın. Her ikisinin de aynı anda aktif olması gerekir.

---

## Kullanım Rehberi

### Video Arama
1. Üst kısımdaki arama çubuğuna arama terimini yazın (örn: *"python tutorial"*)
2. `Enter`'a basın veya 🔍 ikonuna tıklayın
3. Sağ paneldeki **Sıradakiler** sekmesinde sonuçlar listelenir
4. İstediğiniz videoya tıklayarak oynatmayı başlatın

### Playlist Oynatma
1. Arama çubuğuna YouTube playlist linkini yapıştırın
   ```
   https://www.youtube.com/playlist?list=PLxxxxxx
   ```
2. `Enter`'a basın — tüm videolar **Sıradakiler** sekmesinde listelenir
3. Videolar arasında tek tıkla geçiş yapın

### Transkript Okuma
1. Video oynatılmaya başladığında **Transkript** sekmesine geçin
2. Üst dropdown'dan **orijinal dili** seçin
3. Video oynarken aktif satır otomatik olarak 🔵 mavi ile vurgulanır
4. Herhangi bir satıra tıklayarak videoyu o saniyeye atlayın
5. Liste ↔ Paragraf görünümü arasında geçiş yapın

### Çeviri
1. Transkript sekmesindeki sağ dropdown'dan **hedef dili** seçin (örn: *İngilizce*)
2. Birkaç saniye içinde çevrilen transkript yüklenir
3. Çeviriyi kaldırmak için *"Çeviri yok"* seçeneğini seçin

### Dışa Aktarma
1. **Dışa Aktar** butonuna tıklayın
2. Açılan modalda format seçin:
   - **TXT** → Zaman damgalı veya düz metin
   - **SRT** → Standart altyazı dosyası
3. **İndir** butonuna basın — dosya tarayıcınız üzerinden iner

---

##  Proje Mimarisi

```
TubiScribe/
│
├── start.sh                        ← Otomatik kurulum ve başlatma scripti
├── README.md                       ← Bu dosya
├── LICENSE                         ← GPL-3.0 lisansı
│
├── backend/                        ← Python FastAPI Arka Uç
│   ├── main.py                     ← FastAPI uygulaması, CORS, 4 endpoint
│   ├── schemas.py                  ← Pydantic response modelleri (7 şema)
│   ├── requirements.txt            ← Python bağımlılıkları
│   └── venv/                       ← Sanal ortam (otomatik oluşur, git'e dahil değil)
│
└── frontend/                       ← React + Vite Ön Yüz
    ├── vite.config.js              ← Vite + Tailwind CSS yapılandırması
    ├── index.html                  ← HTML giriş noktası
    ├── package.json                ← Node.js bağımlılıkları
    ├── public/
    │   └── favicon.svg             ← TubiScribe logosu
    └── src/
        ├── main.jsx                ← React giriş noktası
        ├── App.jsx                 ← Ana state yönetimi, API çağrıları, player ref
        ├── index.css               ← Tailwind CSS import
        └── components/
            ├── Navbar.jsx          ← Üst bar: logo + arama çubuğu
            ├── VideoArea.jsx       ← YouTube IFrame oynatıcı + video bilgileri
            ├── Sidebar.jsx         ← Sekmeli sağ panel (Sıradakiler / Transkript)
            ├── PlaylistTab.jsx     ← Arama sonuçları / playlist video listesi
            └── TranscriptTab.jsx   ← Transkript görüntüleme, çeviri, seek, export modal
```

### Veri Akışı

```
Kullanıcı Arama Yapar
        │
        ▼
   [Navbar.jsx] ──onSearch()──▶ [App.jsx] ──axios──▶ Backend /api/search
        │                                                    │
        │                                              JSON yanıt
        │                                                    │
        ▼                                                    ▼
   [Sidebar.jsx]                                    searchResults state
        │                                                    │
        ├── Sıradakiler ──▶ [PlaylistTab.jsx] ◀─────────────┘
        │                         │
        │                   onVideoSelect()
        │                         │
        │                         ▼
        │                    [App.jsx] ──axios──▶ /api/subtitles + /api/transcript
        │                         │
        │                   transcript state
        │                         │
        └── Transkript ──▶ [TranscriptTab.jsx] ◀─┘
                                  │
                            onSeek(seconds)
                                  │
                                  ▼
                          [VideoArea.jsx]
                        player.seekTo(s)
```

---

## 📡 API Referansı

Backend `http://localhost:8000` adresinde çalışır. İnteraktif dokümantasyon: **http://localhost:8000/docs**

### `GET /api/search`

YouTube'da video arar.

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `q` | string | ✅ | Arama terimi |

```bash
curl "http://localhost:8000/api/search?q=python+tutorial"
```

<details>
<summary>Örnek Yanıt</summary>

```json
{
  "results": [
    {
      "id": "rfscVS0vtbw",
      "title": "Learn Python - Full Course for Beginners",
      "channel": "freeCodeCamp.org",
      "duration": "4:26:52",
      "thumbnail": "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg"
    }
  ]
}
```
</details>

---

### `GET /api/playlist`

YouTube playlist'ini ayrıştırır.

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `url` | string | ✅ | YouTube playlist URL'si |

```bash
curl "http://localhost:8000/api/playlist?url=https://www.youtube.com/playlist?list=PLxxxxxxx"
```

<details>
<summary>Örnek Yanıt</summary>

```json
{
  "title": "Python Dersleri",
  "channel": "Akademi Kanalı",
  "videos": [
    {
      "id": "abc123",
      "title": "Ders 1 — Giriş",
      "channel": "Akademi Kanalı",
      "duration": "14:32",
      "thumbnail": "https://i.ytimg.com/vi/abc123/hqdefault.jpg"
    }
  ]
}
```
</details>

---

### `GET /api/subtitles/{video_id}`

Videodaki mevcut altyazı dillerini listeler.

```bash
curl "http://localhost:8000/api/subtitles/dQw4w9WgXcQ"
```

<details>
<summary>Örnek Yanıt</summary>

```json
{
  "languages": [
    {
      "language": "English",
      "language_code": "en",
      "is_generated": false,
      "is_translatable": true
    },
    {
      "language": "Turkish (auto-generated)",
      "language_code": "tr",
      "is_generated": true,
      "is_translatable": true
    }
  ]
}
```
</details>

---

### `GET /api/transcript/{video_id}`

Transkript verisini çeker, opsiyonel olarak çevirir.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `lang` | string | ❌ | `tr` | Orijinal dil kodu (ISO 639-1) |
| `translate_to` | string | ❌ | `null` | Çeviri hedef dil kodu |

```bash
# Türkçe transkript
curl "http://localhost:8000/api/transcript/dQw4w9WgXcQ?lang=en"

# İngilizce → Türkçe çeviri
curl "http://localhost:8000/api/transcript/dQw4w9WgXcQ?lang=en&translate_to=tr"
```

<details>
<summary>Örnek Yanıt</summary>

```json
{
  "language": "English",
  "language_code": "en",
  "transcript": [
    {
      "text": "We're no strangers to love",
      "start": 18.0,
      "duration": 3.0
    },
    {
      "text": "You know the rules and so do I",
      "start": 21.0,
      "duration": 3.4
    }
  ]
}
```
</details>

---

##  Teknoloji Yığını

### Backend
| Teknoloji | Kullanım Amacı |
|---|---|
| **Python 3.10+** | Temel programlama dili |
| **FastAPI** | Yüksek performanslı asenkron REST API framework'ü |
| **Uvicorn** | ASGI sunucusu |
| **yt-dlp** | Video arama ve playlist metadata çekme (indirme yok, sadece bilgi) |
| **youtube-transcript-api** | Altyazı verilerini saniye/süre bazlı JSON olarak çekme |
| **Pydantic** | Veri doğrulama ve response şemaları |

### Frontend
| Teknoloji | Kullanım Amacı |
|---|---|
| **React 19** | Bileşen tabanlı UI framework'ü |
| **Vite** | Hızlı geliştirme sunucusu ve build aracı |
| **Tailwind CSS 4** | Utility-first CSS framework'ü (YouTube Dark Mode teması) |
| **Axios** | HTTP istemcisi (API çağrıları) |
| **react-youtube** | YouTube IFrame API'nin React sarmalayıcısı |
| **lucide-react** | Hafif ve tutarlı SVG ikon kütüphanesi |

---

##  Sorun Giderme

### `localhost:5173` — Bağlantı reddedildi

**Sebep:** Vite dev sunucusu yalnızca `127.0.0.1`'e bağlanıyor olabilir.

**Çözüm:** `vite.config.js` dosyasında `server.host` ayarı `0.0.0.0` olmalı (varsayılan olarak ayarlıdır).

---

### `externally-managed-environment` — pip hatası

**Sebep:** Python 3.11+ sürümlerde PEP 668 gereği sistem Python'una doğrudan paket kurma engellenir.

**Çözüm:** TubiScribe sanal ortam (venv) kullanır, bu sorun oluşmaz. `start.sh` otomatik olarak venv oluşturur.

---

### `python3-venv` — Modül bulunamadı

**Sebep:** Bazı minimal Linux kurulumlarında `venv` modülü yüklü gelmez.

**Çözüm:**
```bash
sudo apt install python3-venv
```
`start.sh` bunu otomatik kontrol eder ve kurar.

---

### Video altyazısı bulunamadı

**Sebep:** Bazı videolarda (özellikle çok eski veya telif korumalı) altyazı bulunmayabilir.

**Davranış:** Uygulama çökmez — transkript panelinde *"Bu video için altyazı bulunamadı"* mesajı gösterilir, video oynatılmaya devam eder.

---

### Çeviri başarısız / 500 hatası

**Sebep:** Bazı dil çiftleri YouTube tarafından desteklenmeyebilir.

**Davranış:** Hata mesajı panelde gösterilir, uygulama çökmez. Farklı bir dil seçerek tekrar deneyin.

---

##  Yol Haritası

- [ ] Kelime bazlı arama (transkript içinde Ctrl+F)
- [ ] Karanlık / Aydınlık tema geçişi
- [ ] Video indirme desteği (mp3/mp4)
- [ ] Klavye kısayolları (Space: oynat/duraklat, ←→: 5sn atlama)
- [ ] Çoklu transkript karşılaştırma (orijinal + çeviri yan yana)
- [ ] PWA desteği (çevrimdışı kullanım)
- [ ] Docker Compose ile tek komutla dağıtım

---



##  Güvenlik ve Gizlilik

| Konu | Durum |
|---|---|
| Video indirme | ❌ **Hiçbir medya dosyası indirilmez** — yt-dlp sadece metadata çeker (`skip_download: True`) |
| API Anahtarı | ❌ **Gerekmez** — YouTube Data API kullanılmaz |
| Veri depolama | ❌ **Hiçbir kullanıcı verisi saklanmaz** — tüm veri anlık işlenir |
| Çerezler (Cookie) | ❌ **Kullanılmaz** |
| Telemetri | ❌ **Hiçbir analitik veya izleme yoktur** |

---

## Lisans

Bu proje **GNU General Public License v3.0** altında lisanslanmıştır.

Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---