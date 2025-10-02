# Hexa Crochet Frontend

Frontend aplikasi e-commerce untuk toko rajutan Hexa Crochet yang dibangun dengan React, TypeScript, dan Material UI.

## 🚀 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Styling**: Emotion (CSS-in-JS)
- **Notifications**: React Hot Toast

## 📁 Struktur Project

```
src/
├── app/                    # Core app setup
│   ├── App.tsx            # Main app component
│   ├── routes.tsx         # Routing configuration
│   ├── providers.tsx      # App providers
│   └── theme.ts           # MUI theme configuration
├── features/              # Feature-based modules
│   ├── auth/              # Authentication
│   ├── home/              # Homepage
│   ├── products/          # Product management
│   ├── categories/        # Category management
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── orders/            # Order management
│   ├── profile/           # User profile
│   ├── addresses/         # Address management
│   └── admin/             # Admin panel
├── components/            # Reusable components
│   ├── ui/                # UI components
│   ├── layout/            # Layout components
│   └── common/            # Common components
├── store/                 # Zustand stores
├── hooks/                 # Custom hooks
├── services/              # API services
├── types/                 # TypeScript types
├── utils/                 # Utility functions
└── assets/                # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: #9682db (Purple)
- **Secondary**: #f8bbd0 (Pink)
- **Background**: #fafafa

### Typography
- **Font Family**: Inter, Roboto, Arial, sans-serif
- **Heading Scale**: 2.5rem, 2rem, 1.75rem, 1.5rem, 1.25rem, 1.125rem
- **Body Text**: 1rem, 0.875rem

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

1. Clone repository ini
```bash
git clone <repository-url>
cd hexa-fe
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
```

Edit file `.env` sesuai dengan konfigurasi backend:
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Hexa Crochet
```

4. Jalankan development server
```bash
npm run dev
```

5. Buka browser di `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Menjalankan development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code dengan ESLint
- `npm run type-check` - Type checking dengan TypeScript

## 🔗 API Integration

Frontend ini terintegrasi dengan backend Express.js melalui:

- **Base URL**: Konfigurasi via `VITE_API_URL`
- **Authentication**: JWT token via localStorage
- **Auto Refresh**: Token refresh otomatis
- **Error Handling**: Centralized error handling

### API Endpoints
- `/api/auth/*` - Authentication
- `/api/products/*` - Products
- `/api/categories/*` - Categories
- `/api/cart/*` - Shopping cart
- `/api/orders/*` - Orders
- `/api/addresses/*` - Addresses
- `/api/payments/*` - Payments
- `/api/upload/*` - File upload

## 👥 User Roles

### Customer (user)
- Browse dan search produk
- Kelola keranjang belanja
- Proses checkout
- Kelola pesanan
- Kelola profil dan alamat

### Admin (admin)
- Dashboard dengan statistik
- Kelola produk dan kategori
- Kelola pesanan dan pembayaran
- Kelola pengguna
- Upload dan kelola gambar

## 🎯 Features

### Customer Features
- [x] Homepage dengan hero section
- [x] Product listing dengan filter dan search
- [x] Product detail dengan variant selector
- [x] Shopping cart management
- [x] Multi-step checkout process
- [x] Order history dan tracking
- [x] User profile management
- [x] Address management
- [x] Responsive design

### Admin Features
- [x] Admin dashboard dengan stats
- [x] Product management (CRUD)
- [x] Category management
- [x] Order management
- [x] Payment verification
- [x] User management
- [x] File upload system

## 🚧 Development Status

✅ **Completed:**
- Project setup dan struktur folder
- Routing dan navigation
- Theme dan design system
- State management dengan Zustand
- API integration setup
- Basic layouts dan components

🔄 **In Progress:**
- Feature implementations
- Form validations
- Error handling
- Loading states

📋 **Todo:**
- Testing setup
- Performance optimization
- SEO optimization
- PWA features

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail lengkap.

## 📞 Contact

- **Email**: info@hexacrochet.com
- **Website**: [hexacrochet.com](https://hexacrochet.com)
- **Instagram**: [@hexacrochet](https://instagram.com/hexacrochet)

---

Dibuat dengan ❤️ untuk Hexa Crochet