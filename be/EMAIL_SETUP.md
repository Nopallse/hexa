# Setup Email Configuration

Untuk menggunakan fitur verifikasi email, Anda perlu mengkonfigurasi SMTP di file `.env`.

## Konfigurasi SMTP

Tambahkan konfigurasi berikut ke file `.env` di folder `be/`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173
```

## Setup Gmail SMTP

### 1. Aktifkan 2-Step Verification
- Buka [Google Account Security](https://myaccount.google.com/security)
- Aktifkan "2-Step Verification"

### 2. Buat App Password
- Buka [App Passwords](https://myaccount.google.com/apppasswords)
- Pilih "Mail" dan "Other (Custom name)"
- Masukkan nama: "Hexa Crochet API"
- Klik "Generate"
- **Salin password yang dihasilkan** (16 karakter tanpa spasi)

### 3. Update .env
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Ganti dengan App Password yang dihasilkan (tanpa spasi)
```

## Setup SMTP Lainnya

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false  # true untuk port 465
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

## Verifikasi Konfigurasi

Setelah mengkonfigurasi, restart server dan coba register user baru. Email verifikasi akan dikirim otomatis.

Jika masih ada error, periksa:
1. Apakah semua variabel SMTP sudah diisi di `.env`
2. Apakah App Password sudah benar (untuk Gmail)
3. Apakah firewall/network mengizinkan koneksi SMTP
4. Periksa log server untuk detail error

## Catatan

- **Jangan commit file `.env`** ke repository
- Gunakan App Password untuk Gmail, bukan password biasa
- Untuk production, gunakan email service profesional seperti SendGrid, Mailgun, atau AWS SES

