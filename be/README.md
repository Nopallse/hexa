# Hexa Crochet E-commerce API

Backend API untuk toko e-commerce Hexa Crochet yang menjual produk rajutan (crochet) dengan menggunakan Express.js, Prisma ORM, dan Supabase PostgreSQL.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Logging**: Winston
- **Validation**: Express Validator

## 📋 Prerequisites

- Node.js (v16 atau lebih baru)
- npm atau yarn
- Akun Supabase
- PostgreSQL database (via Supabase)

## 🛠️ Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd hexa-crochet-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit file `.env` dan isi dengan konfigurasi Supabase Anda:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres.qogymroczgfeeymvtefg:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.qogymroczgfeeymvtefg:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   
   # Supabase
   SUPABASE_URL="https://your-project-ref.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # JWT
   JWT_SECRET="your-jwt-secret-key"
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register pengguna baru
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/logout` - Logout pengguna
- `GET /api/auth/me` - Get user profile

### Categories
- `GET /api/categories` - Dapatkan semua kategori
- `GET /api/categories/:id` - Dapatkan kategori by ID
- `POST /api/categories` - Buat kategori baru (admin)
- `PUT /api/categories/:id` - Update kategori (admin)
- `DELETE /api/categories/:id` - Hapus kategori (admin)

### Products
- `GET /api/products` - Dapatkan semua produk dengan filter & pagination
- `GET /api/products/:id` - Dapatkan detail produk
- `POST /api/products` - Buat produk baru (admin)
- `PUT /api/products/:id` - Update produk (admin)
- `DELETE /api/products/:id` - Hapus produk (admin)

### Cart
- `GET /api/cart` - Dapatkan keranjang user
- `POST /api/cart` - Tambah item ke keranjang
- `PUT /api/cart/:id` - Update quantity item
- `DELETE /api/cart/:id` - Hapus item dari keranjang

### Orders
- `GET /api/orders` - Dapatkan orders user
- `GET /api/orders/:id` - Dapatkan detail order
- `POST /api/orders` - Buat order baru (checkout)
- `PUT /api/orders/:id/status` - Update status order (admin)
- `DELETE /api/orders/:id` - Cancel order

### Addresses
- `GET /api/addresses` - Dapatkan alamat user
- `POST /api/addresses` - Tambah alamat baru
- `PUT /api/addresses/:id` - Update alamat
- `DELETE /api/addresses/:id` - Hapus alamat

### Payments
- `POST /api/payments` - Buat pembayaran
- `GET /api/payments/:orderId` - Dapatkan info pembayaran order
- `PUT /api/payments/:id/verify` - Verifikasi pembayaran (admin)

### Shipping
- `GET /api/shipping/:orderId` - Dapatkan info pengiriman
- `POST /api/shipping` - Buat info pengiriman (admin)
- `PUT /api/shipping/:id` - Update tracking info (admin)

## 🗄️ Database Schema

### Core Tables
- **users** - Data pengguna
- **categories** - Kategori produk
- **products** - Produk utama
- **product_variants** - Varian produk (warna, ukuran)
- **variant_options** - Detail opsi varian
- **product_images** - Gambar produk

### E-commerce Tables
- **addresses** - Alamat pengiriman
- **cart_items** - Item keranjang
- **orders** - Pesanan
- **order_items** - Detail item pesanan
- **payments** - Record pembayaran
- **shipping** - Informasi pengiriman
- **transactions** - Log transaksi

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm start           # Start production server

# Database
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema changes to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio
npm run db:seed     # Seed database with sample data
```

## 🔐 Authentication

API menggunakan Supabase Auth untuk autentikasi. Setiap request yang memerlukan autentikasi harus menyertakan header:

```
Authorization: Bearer <access_token>
```

## 📝 Business Logic

### Checkout Process
1. Validasi items di cart
2. Cek stok produk
3. Hitung total amount + shipping cost
4. Buat order baru dengan status 'pending'
5. Buat order_items dari cart_items
6. Kurangi stok produk
7. Kosongkan cart
8. Return order ID untuk pembayaran

### Payment Process
1. User upload bukti pembayaran atau pilih payment gateway
2. Admin verifikasi pembayaran
3. Update payment_status di orders
4. Trigger notifikasi ke user
5. Update order status ke 'processing'

### Shipping Process
1. Admin input resi & courier
2. Update order status ke 'shipped'
3. Kirim notifikasi tracking ke user
4. Update status saat delivered

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Express Validator
- **JWT Authentication** - Supabase Auth
- **Role-based Access Control** - Admin/User roles

## 📊 Logging

Aplikasi menggunakan Winston untuk logging dengan level:
- **Error** - Error logs (error.log)
- **Combined** - All logs (combined.log)
- **Console** - Development console output

## 🚀 Deployment

1. **Setup production environment**
   ```bash
   NODE_ENV=production
   ```

2. **Build and start**
   ```bash
   npm install --production
   npm run db:generate
   npm start
   ```

3. **Environment variables**
   Pastikan semua environment variables production sudah di-set dengan benar.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.

---

**Hexa Crochet E-commerce API** - Dibuat dengan ❤️ untuk toko rajutan terbaik!
