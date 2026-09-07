# TubiScribe

### YouTube Gelişmiş Transkript Motoru ve Reklamsız Oynatıcı

TubiScribe, standart YouTube deneyimini akademik ve odaklanmış bir çalışma ortamına dönüştüren bağımsız bir masaüstü web uygulamasıdır. Reklamsız ve dikkat dağıtıcılardan arındırılmış arayüzüyle videoları izlerken eş zamanlı transkript okuma, 35+ dile anlık çeviri, gelişmiş video indirme ve profesyonel formatlarda dışa aktarma imkânı sunar.

> API Anahtarı Gerektirmez -- YouTube Data API kotasına takılmadan, sınırsız arama ve işlem yapma özgürlüğü sağlar.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Hızlı Başlangıç (Tek Komut)](#hızlı-başlangıç-tek-komut)
- [Manuel Kurulum](#manuel-kurulum)
- [Kullanım Rehberi](#kullanım-rehberi)
- [Proje Mimarisi](#proje-mimarisi)
- [API Referansı](#api-referansı)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Sorun Giderme](#sorun-giderme)
- [Güvenlik ve Gizlilik](#güvenlik-ve-gizlilik)

---

## Özellikler

### Arama ve Keşif
| Özellik | Açıklama |
|---|---|
| Sınırsız Arama | YouTube Data API kotası olmadan yt-dlp ile doğrudan video arama. |
| Akıllı Playlist Desteği | Herhangi bir YouTube playlist linkini yapıştırın -- tüm videolar sırasıyla listelenir. |

### Video Oynatıcı ve Kayıt Sistemi
| Özellik | Açıklama |
|---|---|
| Reklamsız Oynatma | YouTube IFrame API üzerinden reklamsız, kesintisiz video akışı. |
| Kalıcı Veritabanı | Kaydedilen videolar tarayıcı önbelleğinde değil, uygulama klasöründeki fiziksel bir JSON dosyasında (saved/saved_videos.json) kalıcı olarak saklanır. |
| İçe ve Dışa Aktarma | Kaydedilen videolar listenizi JSON olarak dışa aktarabilir veya başka bilgisayardan içe aktarabilirsiniz. |

### İnteraktif Transkript ve Çeviri
| Özellik | Açıklama |
|---|---|
| Senkronize Vurgulama | Video oynarken aktif satır vurgulanır ve panel otomatik kaydırılır. |
| Tıkla-Atla (Seek) | Transkriptteki herhangi bir cümleye tıklayın, video o saniyeye atlasın. |
| 35+ Dil Desteği | YouTube'un dahili motoru kullanılarak, desteklenmeyen dillerde otomatik akıllı hata yönetimi ile çeviri. |

### Medya İndirme ve Dışa Aktarma
| Özellik | Açıklama |
|---|---|
| Gelişmiş İndirme Motoru | YouTube'un ayrıştırdığı ses ve yüksek çözünürlüklü görüntü dosyalarını arka planda FFmpeg ile birleştirip tek bir MP4 dosyası olarak sunar. |
| MP3 Desteği | Videoları doğrudan yüksek kaliteli MP3 (192kbps) formatında indirebilirsiniz. |
| Metin Dışa Aktarma | Transkriptleri zaman damgalı TXT, düz metin (paragraf) veya SRT altyazı dosyası olarak indirebilirsiniz. |

---

## Hızlı Başlangıç (Tek Komut)

### Gereksinimler

TubiScribe, Linux sistemlerde (Ubuntu, Debian, Linux Mint, Fedora, Arch, vb.) eksik bağımlılıkları otomatik algılar ve kurar. Paket yöneticisi (apt, dnf, pacman, zypper) otomatik tanınır.

Kurulan temel araçlar:
* Python 3.10+ ve python3-venv
* Node.js ve npm
* FFmpeg (Video ve Ses birleştirme işlemleri için)
* curl

### Kurulum ve Çalıştırma

```bash
# 1. Projeyi klonla
git clone https://github.com/KULLANICI/TubiScribe.git

# 2. Proje dizinine gir
cd TubiScribe

# 3. Tek komutla kur ve çalıştır
./start.sh
```

### start.sh Ne Yapar?
1. Sistem bağımlılıklarını kontrol eder, eksikse paket yöneticisi ile otomatik kurar.
2. Python sanal ortamı (venv) oluşturur ve kilitli dizinler üzerinden paketleri indirir.
3. Frontend bağımlılıklarını (Node modules) kurar.
4. Backend (Port 8000) ve Frontend (Port 5173) servislerini başlatır.

---

## Manuel Kurulum

Otomatik kurulum kullanmak istemiyorsanız:

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Kullanım Rehberi

### Video Arama ve Oynatma
1. Arama çubuğuna kelime veya playlist linki yazın ve aratın.
2. Sağ paneldeki "Sıradakiler" sekmesinden videoyu seçerek oynatın.
3. Videoyu kaydetmek için alt kısımdaki "Kaydet" butonunu kullanın. Kayıtlarınız "Kaydedilenler" sekmesinde yer alacaktır.

### Video ve Ses İndirme
1. Oynatılan videonun altındaki "İndir" butonuna tıklayın.
2. Desteklenen çözünürlükler (1080p, 720p vb.) ve tahmini dosya boyutları listelenecektir.
3. İndirmek istediğiniz formata (Video veya MP3) tıklayın.
4. Sunucu dosyayı hazırlayana kadar bekleyin, ardından tarayıcı indirme işlemini başlatacaktır.

---

## Proje Mimarisi

```
TubiScribe/
├── start.sh                        (Otomatik kurulum ve başlatma)
├── backend/                        (Python FastAPI)
│   ├── main.py                     (API Uç Noktaları ve İndirme Motoru)
│   ├── schemas.py                  (Veri Modelleri)
│   ├── requirements.txt            (Bağımlılıklar)
│   └── saved/                      (JSON Veritabanı Klasörü)
└── frontend/                       (React + Vite)
    ├── vite.config.js              (Sunucu Ayarları)
    └── src/                        (Arayüz Bileşenleri)
```

---

## API Referansı

Backend http://localhost:8000 adresinde çalışır. Dokümantasyon: http://localhost:8000/docs

| Endpoint | Metot | Açıklama |
|---|---|---|
| /api/search | GET | YouTube üzerinde arama yapar. |
| /api/playlist | GET | Playlist URL'sini ayrıştırıp listeler. |
| /api/transcript/{video_id} | GET | Videonun transkript verisini çeker, opsiyonel çeviri yapar. |
| /api/formats/{video_id} | GET | İndirilebilir video/ses çözünürlüklerini ve boyutlarını listeler. |
| /api/download/{video_id} | GET | Belirtilen formatı arka planda birleştirip tarayıcıya stream eder. |
| /api/saved | GET / POST | Kaydedilen videolar listesini okur veya yeni video ekler. |
| /api/saved/{video_id} | DELETE | Listeden video çıkartır. |
| /api/saved/sync | PUT | Dışa aktarılmış JSON dosyasındaki listeyi mevcut veritabanına entegre eder. |

---

## Teknoloji Yığını

### Backend
* Python 3.10+
* FastAPI & Uvicorn
* yt-dlp (Veri çekme ve indirme işlemleri)
* youtube-transcript-api (Altyazı sistemi)
* FFmpeg (Görüntü ve ses birleştirme)

### Frontend
* React 19
* Vite
* Tailwind CSS 4
* Axios
* react-youtube

---

## Sorun Giderme

* localhost:5173 Bağlantı Reddedildi: Vite dev sunucusunun host ayarı 0.0.0.0 yapılmalıdır (varsayılan olarak eklidir).
* Pip / Uvicorn Bulunamadı Hatası: start.sh kilitli venv yollarını kullandığı için bu hata yeni versiyonda tamamen giderilmiştir. Çalışmazsa python3-venv paketinin tam kurulu olduğundan emin olun.
* Çeviri Başarısız: YouTube bazı otomatik oluşturulmuş dillerin çapraz çevirisine izin vermeyebilir. Sistem artık çökmeden bu durumu tespit edip uyarı vermektedir.
* Sesli Video İnmiyor: Yüksek kaliteli videolar için sisteminizde FFmpeg kurulu olmalıdır. start.sh bunu otomatik sağlar.

---

## Güvenlik ve Gizlilik

* Kişisel Veriler: Hiçbir kullanıcı verisi veya izleme (telemetri) kodu içermez.
* API Bağımsızlığı: Uygulama resmi YouTube Data API'sini kullanmaz, bu nedenle kota sınırı yoktur.
* Veri Depolama: Kaydedilen veriler sadece kendi cihazınızda (saved/ klasörü) tutulur, herhangi bir uzak sunucuya gönderilmez.