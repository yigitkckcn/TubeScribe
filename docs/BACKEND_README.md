# TubiScribe Backend Servisi

Bu dizin, TubiScribe uygulamasının veri işleme, medya indirme ve YouTube iletişimini sağlayan **FastAPI** tabanlı sunucu tarafını barındırır. 

## Mimari ve İletişim

Backend servisi varsayılan olarak `http://127.0.0.1:8000` adresi üzerinde çalışır. Ön yüz (Frontend) ile tamamen asenkron REST API standartlarında JSON formatı aracılığıyla haberleşir.

### 1. Güvenlik ve CORS
Tarayıcı güvenliği için CORS (Cross-Origin Resource Sharing) politikaları sıkılaştırılmıştır. Sunucu sadece ön yüzün çalıştığı `http://localhost:5173` ve `http://127.0.0.1:5173` adreslerinden gelen isteklere yanıt verir. Bu durum dış kaynaklı sitelerin yerel API'nizi kullanmasını (DNS Rebinding) engeller.

### 2. Threadpool ve Asenkron Yönetim
FastAPI asenkron bir çatı olmasına rağmen, `yt-dlp` ve `youtube-transcript-api` gibi kütüphaneler senkron (engelleyici - blocking) çalışır. Uygulamanın kilitlenmemesi için tüm ağır I/O uç noktaları `async def` yerine `def` olarak tanımlanmıştır. Bu sayede FastAPI işlemleri otomatik olarak arka plan işçi havuzuna (Threadpool) aktarır ve sunucu aynı anda birden fazla isteğe anında yanıt vermeye devam eder.

### 3. İndirme Kuyruğu (Task Polling Sistemi)
Büyük boyutlu video indirmelerinde tarayıcının zaman aşımına (Timeout) uğramaması için özel bir görev sistemi yazılmıştır:
1. İstemci indirmeyi başlatır ve bir `task_id` alır.
2. Sunucu indirmeyi ayrı bir `threading.Thread` üzerinde başlatır ve ilerleme yüzdesini RAM'de tutar.
3. İstemci her 1.5 saniyede bir durumu sorgular. Tamamlandığında dosyayı çeker.

---

## Manuel Kurulum ve Çalıştırma

Geliştirme amacıyla arka planı bağımsız olarak çalıştırmak isterseniz:

```bash
# 1. Klasöre girin
cd backend

# 2. Sanal ortam (venv) oluşturun ve aktif edin
python3 -m venv venv
source venv/bin/activate

# 3. Bağımlılıkları yükleyin
pip install -r requirements.txt

# 4. Sunucuyu geliştirici modunda (otomatik yenileme ile) başlatın
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## Manuel Test (cURL) ve API Uç Noktaları

Uygulamanın ön yüzü kapalıyken bile backend'in doğru çalışıp çalışmadığını terminal üzerinden test edebilirsiniz. 

### 1. Arama Yapma
```bash
curl -s "http://127.0.0.1:8000/api/search?q=teknoloji"
```

### 2. Transkript (Altyazı) Çekme
Belirli bir videonun İngilizce altyazısını Türkçe'ye çevirerek getirmek için:
```bash
curl -s "http://127.0.0.1:8000/api/transcript/dQw4w9WgXcQ?lang=en&translate_to=tr"
```

### 3. Video Formatlarını Listeleme
```bash
curl -s "http://127.0.0.1:8000/api/formats/dQw4w9WgXcQ"
```

### 4. İndirme Görevi Başlatma ve İzleme
Manuel olarak indirme testi yapmak için önce bir görev başlatın:
```bash
curl -X POST "http://127.0.0.1:8000/api/download/start" \
     -H "Content-Type: application/json" \
     -d '{"video_id": "dQw4w9WgXcQ", "format_id": "1080"}'
```
Dönen yanıt içerisindeki `task_id` değerini kopyalayın ve durumunu sorgulayın:
```bash
curl -s "http://127.0.0.1:8000/api/download/status/BURAYA_TASK_ID_GELECEK"
```
Durum "ready": true olduğunda dosyayı tarayıcı üzerinden `http://127.0.0.1:8000/api/download/file/TASK_ID` bağlantısıyla indirebilirsiniz.

### 5. Kaydedilen Videoları Okuma
Kullanıcının yerel `saved/saved_videos.json` veritabanını test etmek için:
```bash
curl -s "http://127.0.0.1:8000/api/saved"
```
