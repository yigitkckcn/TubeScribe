# TubiScribe v2.0 - Kapsamlı YouTube Transkript ve Video Asistanı

TubiScribe, YouTube üzerindeki eğitici, bilgilendirici veya uzun süreli videoları hızlı bir şekilde okumak, başka dillere anında çevirmek, yapay zeka ile özetlemek ve en yüksek kalitede bilgisayarınıza indirmek için geliştirilmiş modern, tam bağımsız ve asenkron çalışan bir web uygulamasıdır. 

Zamanın çok değerli olduğu günümüzde, saatler süren videoları baştan sona izlemek yerine içeriğine saniyeler içinde göz atmanızı, aradığınız kelimeyi nokta atışı bulmanızı ve videoları e-kitap akıcılığında okumanızı sağlar. Sistem tamamen kendi sunucunuzda (localhost) çalışır.

---

## Ekran Görüntüleri

<table>
  <tr>
    <td><img src="docs/screenshots/LightMode.png" alt="Aydınlık Tema" width="100%"><br><sub>Aydınlık Tema — Ana Ekran ve Arama Çubuğu</sub></td>
    <td><img src="docs/screenshots/TrasnkriptExample.png" alt="Transkript Arayüzü" width="100%"><br><sub>Transkript Görünümü — Video Senkronizasyonu ve Kelime Arama</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/DarkMode.png" alt="Karanlık Tema" width="100%"><br><sub>Karanlık Tema — Göz Yormayan Arayüz (Tailwind CSS v4)</sub></td>
    <td><img src="docs/screenshots/Video%20İndirme.png" alt="Video İndirme" width="100%"><br><sub>Medya İndirme — Format, Kalite Seçimi ve Asenkron İndirme</sub></td>
  </tr>
</table>

<details>
<summary><b>Daha fazla ekran görüntüsü</b></summary>
<table>
  <tr>
    <td><img src="docs/screenshots/Saved.png" alt="Kaydedilen Videolar" width="100%"><br><sub>Kaydedilen Videolar — Akıllı Hafıza ve Yerel Veritabanı Yönetimi</sub></td>
  </tr>
</table>
</details>

---

## Detaylı Özellikler (v2.0 Güncellemeleri)

### 1. Akıllı Transkript ve Senkronize Okuma
* Anında Çeviri Motoru: Orijinal dili ne olursa olsun, videoların transkriptleri saniyeler içinde çekilir ve entegre çeviri algoritmaları (deep-translator) kullanılarak istenilen dile tek tıkla çevrilir. Uygulama, Google Translate API sınırlamalarını aşmak için metinleri dinamik olarak parçalara (chunk) böler.
* Çift Dilli Okuma Modu (Dual-Language): Dil öğrenenler veya çeviri kıyaslaması yapmak isteyenler için orijinal transkript ile çeviriyi yan yana, iki sütun halinde ve tam senkronize olarak sunar.
* Senkronize Takip: Video oynatılırken okunan transkript satırı otomatik olarak algılanır, arka planı koyulaşır ve liste otomatik olarak aşağı kayar. Video üzerinde tıklanılan bir kelime doğrudan videoyu o saniyeye sarar.
* Gelişmiş Arama (Ctrl+F): Transkript içerisinde entegre arama yapılabilir. Aranan kelimeler metin içerisinde sarı renkle vurgulanır ve ok tuşlarıyla sonuçlar arasında hızlıca gezinilebilir.
* Akıllı Önbellekleme (LRU Cache): Sunucu belleğindeki özel önbellekleme sayesinde, diller arası geçiş yapıldığında veya aynı video tekrar açıldığında YouTube sunucularına yeniden istek atılmaz. Saniyede on binlerce kelime işleme kapasitesiyle bekleme süresi sıfıra indirilir.

### 2. Yapay Zeka (AI) Destekli Video Özeti
* Akıllı Analiz: Uygulama içi yerleşik yapay zeka entegrasyonu sayesinde, saatler süren videoların transkriptleri okunup analiz edilir ve videonun ana fikri, önemli noktaları saniyeler içinde madde madde özetlenir. Uzun eğitim veya belgesel videolarında saatlerce zaman tasarrufu sağlar.
* Dinamik Model Geçişi: Sistem, Google GenAI altyapısını destekler. Google API tarafında eski modellerin kapatılması veya kapasite dolması ihtimaline karşı, otomatik deneme-yanılma (fallback) algoritması barındırır.
* Kişisel API Kullanımı: Kullanıcılar kendi API anahtarlarını girerek güvenli ve kotasız bir şekilde özetleme yapabilirler. Bu anahtar sadece kendi bilgisayarınızda saklanır.

### 3. Yüksek Kaliteli Medya İndirme Sistemi (yt-dlp & FFmpeg)
* Hassas Format Seçimi: YouTube'un karmaşık format yapısı (sesin ve görüntünün ayrı iletilmesi) çözümlenir. Görüntü ve sesin en yüksek kalitede arka planda FFmpeg ile birleştirildiği MP4 formatı veya sadece ses odaklı MP3 formatı seçilebilir. Çift sayım hatalarına (double-count) karşı algoritmik koruma içerir.
* Liste (Playlist) ve Toplu İndirme: Oynatma listelerinin içerisindeki videolar listelenir, kullanıcı onay kutucukları (checkbox) ile istediği videoları seçip toplu olarak indirebilir.
* Asenkron Arka Plan Görevleri (Task Polling): Dev boyutlu 4K/1080p dosyalar indirilirken tarayıcı bağlantısı ağ zaman aşımına (timeout) uğramaz. İndirme işlemi sunucuda asenkron bir görev olarak başlar ve ön yüze (frontend) her saniye güncel indirme yüzdesi (%45, %80 vb.) iletilir.
* Shorts Video Desteği: YouTube Shorts bağlantıları otomatik olarak algılanır, standart formata dönüştürülür ve eksiksiz bir şekilde indirilebilir.

### 4. Arayüz, Kullanıcı Deneyimi ve Güvenlik
* Otomatik Tamamlama (Autocomplete): Arama çubuğuna kelime girilirken YouTube'un resmi öneri altyapısı (Google Suggest API) kullanılarak anlık arama önerileri listelenir (Debouncer ile optimize edilmiştir).
* Akıllı Hafıza (Kaldığın Yerden Devam Et): İzlenen ve kaydedilen videoların son kalınan saniyeleri (timestamp) tarayıcı hafızasında yerel olarak tutulur. Video tekrar açıldığında, otomatik olarak saniyesi saniyesine kaldığı yerden başlar.
* Kalıcı Ayarlar Paneli (settings.json): Yapay zeka servis sağlayıcısı, API anahtarı, tema tercihleri ve akıllı hafıza ayarları doğrudan sunucu tarafında kalıcı bir JSON dosyasında saklanır.

---


## Kimler İçin Tasarlandı? (Kullanım Senaryoları)

TubiScribe, video içeriklerini sadece izlemekle kalmayıp, onu işlemek ve veriye dönüştürmek isteyen profesyoneller için özel kullanım senaryoları sunar:

* Öğrenciler ve Araştırmacılar: Yabancı dildeki uzun üniversite derslerini, konferansları veya belgeselleri kendi dilinize çevirip transkript üzerinden okuyabilir, tez ve makale araştırmalarınız için yapay zekaya özetletebilirsiniz.
* İçerik Üreticileri ve Gazeteciler: Rakiplerin veya haber kaynaklarının uzun videolarını saatlerce izlemek yerine saniyeler içinde tarayabilir, Ctrl+F ile sadece aradığınız spesifik kelimelerin geçtiği dakikaları bulup doğrudan o saniyeye atlayabilirsiniz.
* Dil Öğrenenler: Çift Dilli Okuma (Dual-Language) modu sayesinde, hedeflediğiniz dildeki bir videonun hem orijinal altyazısını hem de anadilinizdeki çevirisini yan yana, satır satır senkronize takip ederek kelime dağarcığınızı geliştirebilirsiniz.
* Arşivciler ve Editörler: Kaybolmasını veya silinmesini istemediğiniz eğitim serilerini, müzikleri veya podcast yayınlarını en yüksek kalitede (ses ve görüntü ayrışması olmadan) doğrudan bilgisayarınıza fiziksel olarak (MP4/MP3) yedekleyebilirsiniz.

## Performans, Güvenlik ve Gizlilik Odaklı Yaklaşım

Proje, standart bir medya aracı olmanın ötesinde çok ciddi performans ve gizlilik standartlarına sahiptir:

* Sıfır Veri İhlali (Tam Yerel Çalışma): Uygulama tamamen kendi yerel makinenizde (localhost) ayağa kalkar. İzlediğiniz, kaydettiğiniz veya çevirdiğiniz hiçbir video verisi üçüncü taraf bir bulut sunucusuna gönderilmez. Tüm ayarlarınız ve kayıt geçmişiniz doğrudan bilgisayarınızdaki `saved/` klasöründe yerel olarak barındırılır.
* İzleyicisiz (Tracker-Free) Oynatıcı: Video oynatıcı (Iframe) modülü standart YouTube bağlantısı yerine `youtube-nocookie.com` altyapısını kullanır. Bu sayede tarayıcınıza izleme çerezleri (tracking cookies) ve hedefli reklam kodları yerleştirilemez; tamamen anonim bir izleme deneyimi sunulur.
* Gelişmiş Ağ (Network) Optimizasyonu: Arama çubuğuna yazılan her harfte API sunucularına istek atıp banlanmamak (Rate-Limit) için ön yüzde "Debouncer" algoritması kullanılmıştır. İstekler saniyenin beşte biri oranında geciktirilerek optimize edilir.
* Akıllı Bellek Yönetimi (LRU Cache): Sunucu tarafında çekilen çeviriler ve transkriptler RAM üzerinde belirli bir kota ile tutulur. Böylece aynı videoya veya dile ikinci kez geçiş yapıldığında, hiçbir ağ isteği atılmaz ve veriler anında (0 ms gecikmeyle) ekrana getirilir.

## Mimari ve Sistem Altyapısı (Architecture Flow)

Proje, birbirinden tamamen bağımsız ancak mükemmel bir uyum içinde çalışan iki ana yapıdan oluşur. İletişim, Axios ve FastAPI arasında RESTful mimari ile gerçekleşir.

### 1. Frontend (Ön Yüz - React 18 & Vite)
Tarayıcı tarafında çalışan, durum yönetimini (state management) yerel hafıza ve React bileşenleriyle (Hooks) sağlayan dinamik arayüz. Uygulama Tailwind CSS v4 ile tamamen duyarlı (responsive) bir tasarıma sahiptir.
* Tema Parlama Koruması (Flicker Prevention): Tailwind CSS v4'ün `@custom-variant dark` özelliği kullanılarak tasarlanmıştır. Kullanıcı sayfayı ilk açtığında ekranda "beyaz parlama (flicker)" olmaması için `index.html` içerisinde özel bir bloklayıcı betik çalışır ve kullanıcının (localStorage'daki) tercihine göre `html` etiketine `.dark` sınıfını anında ekler.
* Global Klavye Dinleyicisi: Odak tarayıcının neresinde olursa olsun (arama çubuğu hariç) klavye kısayollarını algılayan global bir `useEffect` mekanizması vardır. Boşluk tuşu videoyu durdurur, yön tuşları 5 saniye atlatır. Ayrıca Ctrl+F araması sırasında, okuma konforunun bozulmaması için videoyla beraber aşağı kayma (auto-scroll) otomatik duraklatılır.
* Sayfa Korumalı İndirme (Hidden Iframe): İndirme işleminde yüzde 100'e ulaşıldığında arka planda görünmez bir `<iframe>` oluşturulup tetiklenir, bu sayede sayfanın çökmesi veya hata sayfasına yönlendirilmesi tamamen engellenir.

### 2. Backend (Arka Plan - FastAPI)
Yüksek performanslı Python sunucusudur. Video indirme, transkript işleme, yapay zeka iletişimleri, çeviri parçalamaları ve dosya birleştirme (FFmpeg) gibi işlemci yükü gerektiren işlemleri çözer.
* Threadpool ve Asenkron Yönetim: FastAPI asenkron bir çatı olmasına rağmen, `yt-dlp` ve `youtube-transcript-api` gibi kütüphaneler senkron (engelleyici - blocking) çalışır. Uygulamanın kilitlenmemesi için tüm ağır I/O uç noktaları (endpoints) `async def` yerine standart `def` olarak tanımlanmıştır. Bu sayede FastAPI işlemleri otomatik olarak arka plan işçi havuzuna (Threadpool) aktarır ve sunucu aynı anda birden fazla isteğe anında yanıt vermeye devam eder.
* Güvenlik (CORS ve DNS Rebinding): Tarayıcı güvenliği için CORS politikaları sıkılaştırılmış, sunucu sadece `http://localhost:5173` ve `http://127.0.0.1:5173` adreslerinden gelen isteklere yanıt verecek şekilde izole edilmiştir. Bu da dış kaynaklı sitelerin yerel API'nizi kullanmasını engeller.
* İndirme Kuyruğu (Task Polling): Büyük boyutlu video indirmelerinde tarayıcı Timeout (zaman aşımı) yememesi için backend, indirmeyi ayrı bir `threading.Thread` üzerinde başlatır ve ilerleme yüzdesini RAM'de tutar. İstemci 1.5 saniyede bir durumu sorgular.

---

## Kapsamlı Dosya Yapısı

```text
TubeScribe/
├── backend/
│   ├── main.py                # FastAPI ana sunucusu, asenkron görev yönetimi, API rotaları ve AI fallback algoritmaları
│   ├── schemas.py             # Pydantic veri modelleri, güvenlik doğrulama şemaları
│   ├── requirements.txt       # Python kütüphane bağımlılıkları (fastapi, yt-dlp, google-genai, deep-translator vb.)
│   ├── venv/                  # Python sanal ortamı
│   └── saved/                 # Kullanıcı ayarları (settings.json) ve kaydedilenler veritabanı (saved_videos.json)
├── frontend/
│   ├── src/
│   │   ├── components/        # Modüler React bileşenleri (Navbar, Sidebar, VideoArea, TranscriptTab vb.)
│   │   ├── App.jsx            # Ana durum (state) yöneticisi, akıllı hafıza ve genel iletişim katmanı
│   │   ├── main.jsx           # React DOM render ve başlangıç ayarları
│   │   └── index.css          # Global Tailwind CSS v4 kuralları ve karanlık tema varyantları
│   ├── package.json           # Node.js bağımlılıkları, versiyon 2.0.0
│   └── vite.config.js         # Vite derleyici ayarları
├── docs/                      # İleri düzey geliştiriciler için ekran görüntüleri ve sistem dokümantasyonları
├── start.sh                   # Tüm sistemi sıfırdan kuran ve sunucuları başlatan Linux otomasyon betiği
├── OPTIMIZATIONS.md           # Hız, performans ve güvenlik analiz raporu
└── README.md                  # Ana doküman
```

---

## Kurulum ve Çalıştırma Rehberi

TubiScribe, işletim sisteminden (Windows/macOS/Linux) bağımsız olarak çalışabilir. Bilgisayarınızda **Python 3.12+**, **Node.js** ve **FFmpeg** araçlarının (komut satırında çalışacak şekilde ortam değişkenlerine ekli) yüklü olması zorunludur. FFmpeg, indirilen videonun görüntü stream'i ile ses stream'inin kayıpsız birleştirilmesi için hayati öneme sahiptir.

### Yöntem 1: Tek Tıkla Otomatik Çalıştırma (Sadece Linux)

Eğer Linux tabanlı bir dağıtım kullanıyorsanız (Ubuntu, Debian, Fedora, Arch Linux vb.):

```bash
chmod +x start.sh
./start.sh
```

Bu komut: Python sanal ortamını (venv) yaratır, npm ve pip paketlerini kurar, hem arka planı (Backend) hem de ön yüzü (Frontend) başlatır. Uygulamayı kapatmak için terminalde Ctrl+C yapmanız yeterlidir.

### Yöntem 2: Manuel Kurulum ve Çalıştırma (Tüm İşletim Sistemleri)

#### 1. Arka Planı (Backend) Hazırlamak ve Başlatmak
```bash
cd backend
python3 -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Ön Yüzü (Frontend) Hazırlamak ve Başlatmak
İkinci bir terminal açın:
```bash
cd frontend
npm install
npm run dev
```
Terminalde beliren adrese (genellikle `http://localhost:5173`) tıklayarak TubiScribe'ı kullanmaya başlayabilirsiniz.

---

## API Uç Noktaları ve Manuel Test (cURL)

Uygulamanın ön yüzü kapalıyken bile backend'in doğru çalışıp çalışmadığını terminal üzerinden (cURL) test edebilirsiniz. Swagger UI dokümantasyonu için uygulamanız çalışırken `http://127.0.0.1:8000/docs` adresini ziyaret edebilirsiniz.

* Arama Yapma: Belirtilen anahtar kelimeye göre asenkron arama yapar.
  ```bash
  curl -s "http://127.0.0.1:8000/api/search?q=teknoloji"
  ```
* Transkript (Altyazı) Çekme: Belirli bir videonun İngilizce altyazısını Türkçe'ye çevirerek getirmek için:
  ```bash
  curl -s "http://127.0.0.1:8000/api/transcript/dQw4w9WgXcQ?lang=en&translate_to=tr"
  ```
* Video Formatlarını Listeleme: Çift sayım hatalarından (double-count) arındırılmış çözünürlükleri listeler.
  ```bash
  curl -s "http://127.0.0.1:8000/api/formats/dQw4w9WgXcQ"
  ```
* İndirme Görevi Başlatma ve İzleme (Task Polling):
  Önce görev başlatılır ve bir `task_id` alınır:
  ```bash
  curl -X POST "http://127.0.0.1:8000/api/download/start" \
       -H "Content-Type: application/json" \
       -d '{"video_id": "dQw4w9WgXcQ", "format_id": "1080"}'
  ```
  Dönen `task_id` ile indirme yüzdesi sorgulanır:
  ```bash
  curl -s "http://127.0.0.1:8000/api/download/status/BURAYA_TASK_ID_GELECEK"
  ```
* Kaydedilen Videoları Okuma: Kullanıcının yerel (settings.json) veritabanını okur.
  ```bash
  curl -s "http://127.0.0.1:8000/api/saved"
  ```

---

## Kullanılan Teknolojiler (Tech Stack)

Projenin geliştirilmesinde performans, güvenlik ve sürdürülebilirlik odaklı modern web teknolojileri kullanılmıştır:

### Frontend (Ön Yüz)
* React 18: Kullanıcı arayüzünün oluşturulması ve bileşen (component) tabanlı durum (state) yönetimi.
* Vite: Hızlı derleme, anlık sayfa yenileme (HMR) sağlayan ve paketi optimize eden yeni nesil geliştirme sunucusu.
* Tailwind CSS v4: Uygulamanın karanlık/aydınlık tema destekli, tamamen duyarlı (responsive) tasarımının yapılandırılması.
* Axios: Arka plan API'leri ile asenkron ve güvenli HTTP iletişimi.
* Lucide React: Arayüzdeki vektörel, modern ve hafif ikonların sağlanması.
* React Markdown: Yapay zeka tarafından üretilen özetlerin formatlı (başlık, liste, kalın yazı vb.) olarak ekrana yansıtılması.

### Backend (Arka Plan)
* FastAPI: Yüksek performanslı, asenkron (async) yapıyı destekleyen modern Python web çatısı.
* Uvicorn: FastAPI uygulamasını hızlı bir şekilde çalıştıran ASGI web sunucusu.
* yt-dlp: YouTube üzerinden yüksek kaliteli medya akışlarının (stream) ve karmaşık formatların çözümlenmesi.
* youtube-transcript-api: Videoların gömülü veya otomatik oluşturulmuş (auto-generated) altyazılarının metin olarak çekilmesi.
* FFmpeg: İndirilen 1080p/4K video akışları ile ses dosyalarının kalite kaybı (lossless) yaşanmadan arka planda birleştirilmesi.
* deep-translator: Çekilen uzun transkriptlerin Google Translate altyapısıyla, rate-limit aşımı yaşamamak için parçalanarak (chunking) hedeflenen dile çevrilmesi.
* Google GenAI: Çekilen uzun metinlerin analiz edilerek saniyeler içinde yapay zeka destekli akıllı özetlerinin çıkarılması.
* Pydantic: Uygulamaya giren ve çıkan verilerin tip güvenliği (type hinting) şemalarıyla sıkı bir şekilde doğrulanması.

---

