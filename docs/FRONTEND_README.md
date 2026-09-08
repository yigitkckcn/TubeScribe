# TubiScribe İstemci (Frontend) Arayüzü

Bu dizin, TubiScribe uygulamasının kullanıcıyla etkileşime girdiği, modern ve yüksek performanslı **React** tabanlı web/masaüstü arayüzünü barındırır.

## Mimari ve Kullanılan Teknolojiler

* **Çatı (Framework):** React 18 (Vite ile derlenmiştir)
* **Stil ve Tasarım:** Tailwind CSS v4
* **İkonlar:** Lucide React
* **Video Oynatıcı:** react-youtube (youtube-nocookie üzerinden gizlilik odaklı kullanım)
* **HTTP İstemcisi:** Axios

Arayüz varsayılan olarak geliştirme modunda `http://localhost:5173` adresi üzerinden çalışır. Tüm veri trafiği (arama, transkriptler, format listeleri) yerel makinedeki backend servisine (port 8000) yönlendirilir.

## Öne Çıkan Frontend Özellikleri

### 1. Karanlık ve Aydınlık Tema Sistemi
Tailwind CSS v4'ün `@custom-variant dark (&:where(.dark, .dark *));` özelliği kullanılarak tasarlanmıştır. `App.jsx` üzerinden yönetilen tema durumu, tarayıcının `localStorage` alanına kaydedilir. Kullanıcı sayfayı ilk açtığında ekranda "beyaz parlama (flicker)" olmaması için `index.html` içerisinde özel bir bloklayıcı betik çalışır ve kullanıcının tercihine göre `html` etiketine `.dark` sınıfını anında ekler/kaldırır.

### 2. Güvenli İndirme Yöntemi (Görünmez Iframe)
Kullanıcı bir indirme işlemi başlattığında, uygulamanın durumunu bozmamak veya sayfanın hata sayfasına düşmesini engellemek için doğrudan bağlantı yönlendirmesi yapılmaz. Backend'in Polling (Durum sorgulama) mekanizması dinlenir. İndirme %100 olduğunda arka planda görünmez bir `<iframe>` oluşturulup tetiklenir ve dosya kullanıcının bilgisayarına indirilir.

### 3. Global Klavye Dinleyicisi
Kullanıcıların videoyu izlerken transkript okuma deneyimini artırmak için, odak tarayıcının neresinde olursa olsun klavye kısayollarını algılayan bir `useEffect` mekanizması yazılmıştır. Eğer kullanıcı arama çubuğuna yazı yazmıyorsa; Boşluk (Space) tuşu videoyu durdurur/başlatır, sağ/sol yön tuşları ise 5 saniye ileri/geri sarar.

### 4. Transkript İçi Dinamik Arama
Ctrl+F klavye kısayolu dinlenerek uygulamanın kendi içerisindeki arama motoru açılır. Tarayıcının varsayılan arama özelliği yerine, React tabanlı bu arama sayesinde bulunan kelimeler sarı renkle işaretlenir. Arama yapıldığı esnada transkriptin videoyla beraber senkronize olarak aşağı/yukarı kayması (auto-scroll) otomatik olarak duraklatılır, böylece okuma konforu bozulmaz.

---

## Dosya Yapısı

* **`src/App.jsx`**: Uygulamanın beyni. Temel durumları (seçili video, arama sonuçları, kaydedilenler) tutar ve diğer bileşenlere aktarır. Klavye kısayolları ve tema değişimi burada kurgulanmıştır.
* **`src/components/Sidebar.jsx`**: Sol taraftaki menü paneli. Kendi içinde Oynatma Listesi, Transkript, ve Kaydedilenler bileşenlerini barındırır ve sekmeler arası geçişi sağlar.
* **`src/components/VideoArea.jsx`**: Sağ taraftaki video izleme ve indirme bölümü. Video kalitesi hesaplama ve asenkron indirme (Task Polling) çubuğu bu bileşendedir.
* **`src/components/TranscriptTab.jsx`**: Altyazıların listelendiği, arama yapıldığı, dışa aktarıldığı ve satır satır videoyla senkron çalıştığı ana bileşen.
* **`src/index.html`**: Arayüzün barındırıldığı ilk ve tek HTML dosyası. Tema parlama (flicker) önleyici scripti buradadır.

---

## Manuel Kurulum ve Derleme

Eğer frontend tarafını bağımsız bir terminalde geliştirmek veya test etmek isterseniz:

```bash
# 1. Klasöre girin
cd frontend

# 2. Node kütüphanelerini kurun
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

### Üretime Hazırlık (Build)
Uygulamayı statik dosyalara (HTML, CSS, JS) derlemek ve bağımsız bir web sunucusunda barındırmak isterseniz:
```bash
npm run build
```
Bu komut sonucunda optimize edilmiş statik dosyalar `dist/` klasörü içerisinde oluşturulacaktır.
