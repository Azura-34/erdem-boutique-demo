# Erdem Boutique V5 — Yayına Hazır E-Ticaret Adayı

## Tamamlanan
- Premium frontend + responsive
- Veritabanından canlı ürün kataloğu
- Admin giriş + güvenli session
- Ürün CRUD
- Görsel yükleme (JPG/PNG/WebP, 8 MB)
- Beden/renk/galeri/stok yönetimi
- Sepet varyantları
- Checkout müşteri/adres formu
- Sipariş numarası ve sipariş kaydı
- Admin sipariş listesi + ödeme/sipariş/kargo durumları
- Güvenlik için CSRF, password_hash/password_verify, session rotation, login rate limit
- Bilgi/yasal sayfa iskeletleri

## Yarın kalan iki iş
1. Hosting + domain + SSL + MySQL kurulumu
2. iyzico canlı entegrasyonu (ödeme oluşturma, 3D Secure, callback/webhook, ödeme sonrası stok düşümü ve sipariş durumunun otomatik güncellenmesi)

## Kurulum
- PHP + MySQL destekli hosting'e yükle.
- `/install.php` aç.
- MySQL bilgilerini ve güçlü admin şifresini gir.
- Kurulumdan sonra `.installed` kilidi oluşur.
- HTTPS aktif olmadan admin kullanma.
- Canlıya almadan önce install.php'nin erişilemez olduğunu kontrol et.
- İşletmenin gerçek unvan/adres/vergi/iletişim bilgilerini yasal sayfalara ekle.

## Not
Ürün seed verileri kamuya açık Shopier listesinden alınmıştır; müşteri admin panelinden güncelleyebilir. Kaynak stok bilgisi vermediğinden stok başlangıçta 0 gelir ve gerçek stok ayrıca yönetilmelidir.

## Katalog kaynağı ve sipariş bildirimi
- `products-seed.json`, Shopier mağazasında herkese açık listede görünen 19 ürünün ad, kategori, fiyat ve ürün görseli bağlantılarını içerir. Kışlık Kaşe Kaban'ın listelenen 1.600 TL karşılaştırma fiyatı da korunur. Shopier mağazası şu anda satışlarına geçici ara verdiğinden fiyat ve stokları yayından önce yeniden doğrulayın.
- Instagram profilinden ürün bilgileri bu çalışma sırasında doğrulanamadı. Beden/renk seçenekleri ve ürün açıklamaları Shopier listesinde yer almadığı için uydurulmamıştır.
- Sipariş kaydı başarıyla veritabanına yazıldıktan sonra isteğe bağlı Telegram bildirimi gönderilir. PHP sunucusunda cURL uzantısını ve `TELEGRAM_BOT_TOKEN` ile `TELEGRAM_CHAT_ID` ortam değişkenlerini tanımlayın; değişkenleri kaynak dosyalara veya tarayıcıya koymayın. Değişkenlerden biri tanımlı değilse bildirim kapalıdır.
- Telegram mesajı yalnızca sipariş numarası, ürün adları/adetleri ve toplam tutarı içerir. Bildirim isteği kısa zaman aşımıyla yapılır; Telegram erişilemezse hata sunucu günlüğüne yazılır, sipariş kaydı başarılı kalır.
- Bildirim kodu entegrasyona hazırdır; bu depo herhangi bir bot kurmaz veya gerçek Telegram mesajı göndermez. Bu mağaza sürümünde çevrimiçi ödeme etkin değildir; sipariş formu bir talep kaydı oluşturur.
- Önceden kurulmuş veritabanları `install.php` kilidi nedeniyle seed dosyasından otomatik güncellenmez. Bu kurulumlarda ürün adı/fiyat/görsellerini admin panelinden yeni seed bilgileriyle eşitleyin.
