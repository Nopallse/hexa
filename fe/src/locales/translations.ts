// Indonesian translations
export const id = {
  // Header
  header: {
    home: 'Beranda',
    categories: 'Kategori',
    contact: 'Kontak',
    about: 'Tentang',
    cart: 'Keranjang',
    wishlist: 'Wishlist',
    profile: 'Profil Saya',
    orders: 'Pesanan Saya',
    logout: 'Keluar',
    login: 'Masuk',
    register: 'Daftar',
    searchPlaceholder: 'Cari produk...',
  },
  
  // Settings
  settings: {
    language: 'Bahasa',
    currency: 'Mata Uang',
    shipping: 'Dikirim Kemana',
    indonesian: 'Bahasa Indonesia',
    english: 'English',
    rupiah: 'IDR - Rupiah',
    dollar: 'USD - Dollar',
    euro: 'EUR - Euro',
    indonesia: 'Indonesia',
    singapore: 'Singapore',
    malaysia: 'Malaysia',
    thailand: 'Thailand',
  },
  
  // Contact Info
  contact: {
    phone: '+62 812-3456-7890',
    email: 'info@hexacrochet.com',
    followUs: 'Follow us:',
  },
  
  // Mobile Menu
  mobileMenu: {
    welcome: 'Selamat Datang!',
    welcomeMessage: 'Silakan login untuk pengalaman terbaik',
    hello: 'Halo, {name}!',
    shoppingMessage: 'Selamat berbelanja',
    mainMenu: 'Menu Utama',
    shopping: 'Belanja',
    account: 'Akun',
    myAccount: 'Akun Saya',
    loadingCategories: 'Memuat kategori...',
    noCategories: 'Tidak ada kategori tersedia',
  },
  
  // User Menu
  userMenu: {
    myProfile: 'Profil Saya',
    myOrders: 'Pesanan Saya',
    myAddresses: 'Alamat Saya',
  },
  
  // Common
  common: {
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    success: 'Berhasil',
    cancel: 'Batal',
    save: 'Simpan',
    edit: 'Edit',
    delete: 'Hapus',
    confirm: 'Konfirmasi',
    close: 'Tutup',
  },
};

// English translations
export const en = {
  // Header
  header: {
    home: 'Home',
    categories: 'Categories',
    contact: 'Contact',
    about: 'About',
    cart: 'Cart',
    wishlist: 'Wishlist',
    profile: 'My Profile',
    orders: 'My Orders',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    searchPlaceholder: 'Search products...',
  },
  
  // Settings
  settings: {
    language: 'Language',
    currency: 'Currency',
    shipping: 'Ship To',
    indonesian: 'Indonesian',
    english: 'English',
    rupiah: 'IDR - Rupiah',
    dollar: 'USD - Dollar',
    euro: 'EUR - Euro',
    indonesia: 'Indonesia',
    singapore: 'Singapore',
    malaysia: 'Malaysia',
    thailand: 'Thailand',
  },
  
  // Contact Info
  contact: {
    phone: '+62 812-3456-7890',
    email: 'info@hexacrochet.com',
    followUs: 'Follow us:',
  },
  
  // Mobile Menu
  mobileMenu: {
    welcome: 'Welcome!',
    welcomeMessage: 'Please login for the best experience',
    hello: 'Hello, {name}!',
    shoppingMessage: 'Happy shopping',
    mainMenu: 'Main Menu',
    shopping: 'Shopping',
    account: 'Account',
    myAccount: 'My Account',
    loadingCategories: 'Loading categories...',
    noCategories: 'No categories available',
  },
  
  // User Menu
  userMenu: {
    myProfile: 'My Profile',
    myOrders: 'My Orders',
    myAddresses: 'My Addresses',
  },
  
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
  },
};

// Translation object
export const translations = {
  id,
  en,
};

// Type for translation keys
export type TranslationKey = keyof typeof id;
export type TranslationKeys = {
  [K in TranslationKey]: typeof id[K];
};
