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
Ürün seed fiyatları mevcut V3 kataloğundaki değerlerdir; müşteri admin panelinden güncelleyebilir. Stok başlangıçta 0 gelir; müşteri gerçek stokları girmelidir.
