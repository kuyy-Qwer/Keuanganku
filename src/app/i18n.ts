// Simple i18n system - Indonesian & English only

export type Lang = "id" | "en";

export const translations = {
  // Navigation
  home: { id: "Home", en: "Home" },
  wallet: { id: "Wallet", en: "Wallet" },
  history: { id: "History", en: "History" },
  tasks: { id: "Tugas", en: "Tasks" },
  account: { id: "Akun", en: "Account" },

  // HomePage
  welcomeBack: { id: "Halo kembali 👋", en: "Welcome back 👋" },
  manageWealth: { id: "Yuk kelola keuanganmu", en: "Let's manage your wealth" },
  activeBalance: { id: "Saldo Aktif", en: "Active Balance" },
  monthlyIn: { id: "Masuk Bulan Ini", en: "Monthly In" },
  monthlyOut: { id: "Keluar Bulan Ini", en: "Monthly Out" },
  services: { id: "Layanan", en: "Services" },
  pay: { id: "Bayar", en: "Pay" },
  invest: { id: "Investasi", en: "Invest" },
  calendar: { id: "Kalender", en: "Calendar" },
  report: { id: "Laporan", en: "Report" },
  savings: { id: "Tabungan", en: "Savings" },
  debt: { id: "Hutang", en: "Debt" },
  recent: { id: "Terbaru", en: "Recent" },
  recentTransactions: { id: "Transaksi Terbaru", en: "Recent Transactions" },
  seeAll: { id: "Lihat Semua →", en: "See All →" },
  noTransactions: { id: "Belum ada transaksi", en: "No transactions yet" },
  noTransactionsDesc: { id: "Klik tombol + untuk menambah transaksi pertama", en: "Tap + to add your first transaction" },

  // WalletPage
  totalBalance: { id: "Total Saldo", en: "Total Balance" },
  incomeThisMonth: { id: "Pemasukan Bulan Ini", en: "Income This Month" },
  expenseThisMonth: { id: "Pengeluaran Bulan Ini", en: "Expense This Month" },
  savingsTarget: { id: "🎯 Target Tabungan", en: "🎯 Savings Target" },
  change: { id: "Ubah", en: "Change" },
  cancel: { id: "Batal", en: "Cancel" },
  save: { id: "Simpan", en: "Save" },
  addTransaction: { id: "Tambah", en: "Add" },
  newTransaction: { id: "Transaksi baru", en: "New transaction" },
  transaksi: { id: "Transaksi", en: "Transaction" },
  transfer: { id: "Transfer", en: "Transfer" },
  sendMoney: { id: "Kirim uang", en: "Send money" },
  spendingByCategory: { id: "Pengeluaran per Kategori", en: "Spending by Category" },
  noData: { id: "Belum ada data", en: "No data yet" },
  noDataDesc: { id: "Tambah transaksi untuk melihat ringkasan", en: "Add transactions to see summary" },

  // HistoryPage
  transactionHistory: { id: "Riwayat Transaksi", en: "Transaction History" },
  totalIn: { id: "Total Masuk", en: "Total In" },
  totalOut: { id: "Total Keluar", en: "Total Out" },
  searchPlaceholder: { id: "Cari transaksi...", en: "Search transactions..." },
  all: { id: "Semua", en: "All" },
  income: { id: "Pemasukan", en: "Income" },
  expense: { id: "Pengeluaran", en: "Expense" },
  noTransactionsFound: { id: "Belum ada transaksi", en: "No transactions found" },
  addFromHome: { id: "Klik tombol + di Home untuk menambah transaksi", en: "Tap + on Home to add a transaction" },
  transactions: { id: "transaksi", en: "transactions" },

  // InvestPage
  investment: { id: "Investasi", en: "Investment" },
  totalInvestment: { id: "Total Investasi", en: "Total Investment" },
  investmentHistory: { id: "Riwayat Investasi", en: "Investment History" },
  noInvestment: { id: "Belum ada investasi", en: "No investments yet" },
  noInvestmentDesc: { id: "Tambah transaksi dengan kategori bertipe Investasi", en: "Add transactions with Investment category type" },
  investInfo: { id: "Transaksi dengan kategori bertipe Investasi (income & expense) akan muncul di sini. Atur kategori di Kelola Kategori.", en: "Transactions with Investment category type (income & expense) appear here. Manage in Categories." },

  // ReportPage
  financialReport: { id: "Laporan Keuangan", en: "Financial Report" },
  weeklyIncome: { id: "Pemasukan Minggu Ini", en: "Income This Week" },
  weeklyExpense: { id: "Pengeluaran Minggu Ini", en: "Expense This Week" },
  summary: { id: "Ringkasan", en: "Summary" },
  totalTransactions: { id: "Total Transaksi", en: "Total Transactions" },
  weeklyDiff: { id: "Selisih Minggu Ini", en: "Weekly Difference" },
  perCategory: { id: "Per Kategori", en: "By Category" },
  noReportData: { id: "Belum ada data", en: "No data yet" },
  noReportDataDesc: { id: "Tambah transaksi untuk melihat laporan", en: "Add transactions to see report" },

  // AccountPage
  vaultProfile: { id: "Vault Profile", en: "Vault Profile" },
  notSet: { id: "Belum diatur", en: "Not set" },
  setProfile: { id: "Atur profil di Personal Information", en: "Set profile in Personal Information" },
  balance: { id: "Saldo", en: "Balance" },
  securityScore: { id: "Security Score", en: "Security Score" },
  memberSince: { id: "Member Sejak", en: "Member Since" },
  accountSection: { id: "AKUN", en: "ACCOUNT" },
  securitySection: { id: "KEAMANAN", en: "SECURITY" },
  preferencesSection: { id: "PREFERENSI", en: "PREFERENCES" },
  supportSection: { id: "DUKUNGAN", en: "SUPPORT" },
  personalInfo: { id: "Informasi Pribadi", en: "Personal Information" },
  manageCategories: { id: "Kelola Kategori", en: "Manage Categories" },
  linkedBanks: { id: "Rekening Bank", en: "Linked Banks" },
  biometrics: { id: "Fingerprint/Biometrics", en: "Fingerprint/Biometrics" },
  changePin: { id: "Ubah PIN", en: "Change PIN" },
  privacy: { id: "Privacy", en: "Privacy" },
  notifications: { id: "Notifikasi", en: "Notifications" },
  language: { id: "Bahasa", en: "Language" },
  theme: { id: "Tema", en: "Theme" },
  helpCenter: { id: "Pusat Bantuan", en: "Help Center" },
  termsOfService: { id: "Syarat & Ketentuan", en: "Terms of Service" },
  logOut: { id: "Keluar", en: "Log Out" },

  // Transaction Modal
  newTransactionTitle: { id: "Transaksi Baru", en: "New Transaction" },
  recordMovement: { id: "Catat pergerakan keuangan", en: "Record financial movement" },
  expenseType: { id: "Pengeluaran", en: "Expense" },
  incomeType: { id: "Pemasukan", en: "Income" },
  enterAmount: { id: "MASUKKAN NOMINAL", en: "ENTER AMOUNT" },
  selectCategory: { id: "PILIH KATEGORI", en: "SELECT CATEGORY" },
  notes: { id: "CATATAN", en: "NOTES" },
  notesPH: { id: "Apa tujuan transaksi ini?", en: "What is this transaction for?" },
  showCalc: { id: "Tampilkan Kalkulator", en: "Show Calculator" },
  hideCalc: { id: "Sembunyikan Kalkulator", en: "Hide Calculator" },
  saveTransaction: { id: "SIMPAN TRANSAKSI", en: "SAVE TRANSACTION" },
  transactionSaved: { id: "Transaksi Tersimpan!", en: "Transaction Saved!" },

  // Settings
  personalInfoTitle: { id: "Informasi Pribadi", en: "Personal Information" },
  fullName: { id: "NAMA LENGKAP", en: "FULL NAME" },
  email: { id: "EMAIL", en: "EMAIL" },
  phone: { id: "NOMOR TELEPON", en: "PHONE NUMBER" },
  dob: { id: "TANGGAL LAHIR", en: "DATE OF BIRTH" },
  address: { id: "ALAMAT", en: "ADDRESS" },
  saveChanges: { id: "Simpan Perubahan", en: "Save Changes" },
  saved: { id: "✓ Tersimpan!", en: "✓ Saved!" },

  // Theme
  themeTitle: { id: "Tema", en: "Theme" },
  themeDesc: { id: "Pilih tampilan yang sesuai selera. Perubahan langsung diterapkan.", en: "Choose your preferred appearance. Changes apply instantly." },
  darkTheme: { id: "Mode Gelap", en: "Dark Mode" },
  darkThemeDesc: { id: "Tampilan gelap yang nyaman di mata", en: "Easy on the eyes dark appearance" },
  lightTheme: { id: "Mode Terang", en: "Light Mode" },
  lightThemeDesc: { id: "Tampilan terang yang bersih dan segar", en: "Clean and fresh light appearance" },
  activeTheme: { id: "Tema aktif", en: "Active theme" },

  // Language
  languageTitle: { id: "Bahasa", en: "Language" },
  activeLanguage: { id: "Bahasa aktif", en: "Active language" },
  languageNote: { id: "Perubahan bahasa diterapkan langsung", en: "Language changes apply instantly" },

  // Notifications
  notificationsTitle: { id: "Notifikasi", en: "Notifications" },
  enableAll: { id: "Aktifkan Semua", en: "Enable All" },
  disableAll: { id: "Matikan Semua", en: "Disable All" },
  notifActive: { id: "notifikasi aktif", en: "notifications active" },
  notifTransactions: { id: "Transaksi", en: "Transactions" },
  notifTransactionsDesc: { id: "Notifikasi setiap ada transaksi masuk/keluar", en: "Notify on every income/expense transaction" },
  notifSecurity: { id: "Keamanan", en: "Security" },
  notifSecurityDesc: { id: "Alert login dan perubahan akun", en: "Login alerts and account changes" },
  notifReminders: { id: "Pengingat", en: "Reminders" },
  notifRemindersDesc: { id: "Pengingat tagihan dan target tabungan", en: "Bill and savings target reminders" },
  notifPromotions: { id: "Promosi", en: "Promotions" },
  notifPromotionsDesc: { id: "Penawaran dan promo spesial", en: "Special offers and promotions" },
  notifUpdates: { id: "Update Aplikasi", en: "App Updates" },
  notifUpdatesDesc: { id: "Informasi fitur dan pembaruan baru", en: "New features and update info" },

  // Privacy
  privacyTitle: { id: "Privacy", en: "Privacy" },
  privacyDesc: { id: "Kontrol data dan privasi akun Anda. Perubahan langsung diterapkan.", en: "Control your data and account privacy. Changes apply instantly." },
  showBalance: { id: "Tampilkan Saldo", en: "Show Balance" },
  showBalanceDesc: { id: "Sembunyikan nominal saldo di semua halaman", en: "Hide balance amounts on all pages" },
  twoFactor: { id: "Two-Factor Auth", en: "Two-Factor Auth" },
  twoFactorDesc: { id: "Keamanan ekstra saat login", en: "Extra security on login" },
  loginAlerts: { id: "Notifikasi Login", en: "Login Alerts" },
  loginAlertsDesc: { id: "Notifikasi saat ada login baru", en: "Notify on new login" },
  shareData: { id: "Bagikan Data Analitik", en: "Share Analytics Data" },
  shareDataDesc: { id: "Bantu kami meningkatkan layanan", en: "Help us improve our service" },

  // Change PIN
  changePinTitle: { id: "Ubah PIN", en: "Change PIN" },
  currentPin: { id: "PIN SAAT INI", en: "CURRENT PIN" },
  newPin: { id: "PIN BARU", en: "NEW PIN" },
  confirmPin: { id: "KONFIRMASI PIN BARU", en: "CONFIRM NEW PIN" },
  updatePin: { id: "Update PIN", en: "Update PIN" },
  pinDefault: { id: "PIN default: 123456. Ubah segera untuk keamanan.", en: "Default PIN: 123456. Change it for security." },
  pinWrongCurrent: { id: "PIN saat ini salah", en: "Current PIN is incorrect" },
  pinTooShort: { id: "PIN baru harus 6 digit", en: "New PIN must be 6 digits" },
  pinMismatch: { id: "Konfirmasi PIN tidak cocok", en: "PIN confirmation doesn't match" },
  pinSuccess: { id: "✓ PIN berhasil diubah!", en: "✓ PIN changed successfully!" },

  // Help Center
  helpTitle: { id: "Pusat Bantuan", en: "Help Center" },
  contactUs: { id: "Hubungi Kami", en: "Contact Us" },
  supportReady: { id: "Tim support siap membantu 24/7", en: "Support team ready 24/7" },
  chatSupport: { id: "Chat dengan Support", en: "Chat with Support" },
  liveChat: { id: "💬 Live Chat", en: "💬 Live Chat" },
  close: { id: "Tutup", en: "Close" },
  typeMessage: { id: "Ketik pesan...", en: "Type a message..." },
  faq: { id: "FAQ", en: "FAQ" },
  botReply: { id: "Terima kasih atas pertanyaannya. Tim kami akan segera menghubungi Anda melalui email. 📧", en: "Thank you for your question. Our team will contact you via email shortly. 📧" },

  // Terms
  termsTitle: { id: "Syarat & Ketentuan", en: "Terms of Service" },
  termsUpdated: { id: "Terakhir diperbarui", en: "Last updated" },

  // Login
  loginSubtitle: { id: "Masukkan PIN untuk melanjutkan", en: "Enter your PIN to continue" },
  pinDefault2: { id: "PIN default: 123456", en: "Default PIN: 123456" },
  pinWrong: { id: "PIN salah, coba lagi", en: "Wrong PIN, try again" },

  // Categories
  categoriesTitle: { id: "Kelola Kategori", en: "Manage Categories" },
  addCategory: { id: "Tambah Kategori", en: "Add Category" },
  editCategory: { id: "Edit Kategori", en: "Edit Category" },
  categoryEmoji: { id: "EMOJI", en: "EMOJI" },
  categoryName: { id: "NAMA", en: "NAME" },
  categoryType: { id: "TIPE", en: "TYPE" },
  categoryNamePH: { id: "Nama kategori", en: "Category name" },
  typeExpense: { id: "Keluar", en: "Expense" },
  typeIncome: { id: "Masuk", en: "Income" },
  typeBoth: { id: "Dua-nya", en: "Both" },
  update: { id: "Update", en: "Update" },
  add: { id: "Tambah", en: "Add" },

  // Linked Banks
  linkedBanksTitle: { id: "Rekening Bank", en: "Linked Banks" },
  addBank: { id: "Tambah Rekening", en: "Add Bank Account" },
  bankName: { id: "NAMA BANK", en: "BANK NAME" },
  bankNumber: { id: "NOMOR REKENING", en: "ACCOUNT NUMBER" },
  bankType: { id: "TIPE", en: "TYPE" },
  bankNamePH: { id: "BCA, Mandiri, BNI...", en: "BCA, Mandiri, BNI..." },
  bankNumberPH: { id: "••• •••• 1234", en: "••• •••• 1234" },
  bankSavings: { id: "Tabungan", en: "Savings" },
  bankGiro: { id: "Giro", en: "Checking" },
  bankDeposit: { id: "Deposito", en: "Deposit" },
  bankActive: { id: "Aktif", en: "Active" },
  noBanks: { id: "Belum ada rekening", en: "No bank accounts" },
  noBanksDesc: { id: "Tambah rekening bank Anda", en: "Add your bank account" },

  // Financial Guardian
  financialGuardian: { id: "Financial Guardian", en: "Financial Guardian" },
  proteksiKeuangan: { id: "Proteksi Keuangan", en: "Financial Protection" },
  saldoAman: { id: "Saldo Aman", en: "Balance Safe" },
  peringatanRisiko: { id: "Peringatan Risiko", en: "Risk Warning" },
  modeProteksiAktif: { id: "Mode Proteksi Aktif", en: "Protection Mode Active" },
  prediksiSaldoHabis: { id: "Prediksi Saldo Habis", en: "Predicted Balance Zero" },
  siklusBerikutnya: { id: "Siklus Berikutnya", en: "Next Cycle" },
  disarankanKurangi: { id: "Disarankan untuk mengurangi pengeluaran", en: "Recommended to reduce spending" },
  kategoriTerbatas: { id: "Kategori Terbatas", en: "Categories Limited" },
  becausePola: { id: "Karena pola pengeluaran saat ini, akses dibatasi", en: "Due to spending pattern, access limited" },
  danaTidakCukup: { id: "Dana tidak mencukupi hingga siklus berikutnya", en: "Funds insufficient until next cycle" },

  weeklySpending: { id: "Pengeluaran Mingguan", en: "Weekly Spending" },
  youSpentThisWeek: { id: "Kamu menghabiskan minggu ini", en: "You spent this week" },
  goodSavingsRate: { id: "Tingkat Tabungan Baik", en: "Good Savings Rate" },
  youAreSaving: { id: "Kamu menabung dari pendapatan. Pertahankan!", en: "You're saving of income. Keep it up!" },
  savingsRateLow: { id: "Tingkat Tabungan Rendah", en: "Low Savings Rate" },
  yourSavingsRateIs: { id: "Tingkat tabungan kamu hanya. Coba kurangi pengeluaran non-esensial.", en: "Your savings rate is only. Try reducing non-essential expenses." },
  expensesExceedIncome: { id: "Pengeluaran Lebih dari Pendapatan", en: "Expenses Exceed Income" },
  expensesExceedIncomeDesc: { id: "Pengeluaran bulan ini lebih besar dari pendapatan. Coba atur budget lebih ketat.", en: "This month's expenses exceed income. Try setting a tighter budget." },
  incomeIncreased: { id: "Pendapatan Meningkat", en: "Income Increased" },
  incomeIncreasedDesc: { id: "Pendapatan bulan ini naik dari bulan lalu.", en: "This month's income is up from last month." },
  incomeDecreased: { id: "Pendapatan Menurun", en: "Income Decreased" },
  incomeDecreasedDesc: { id: "Pendapatan bulan ini turun dari bulan lalu.", en: "This month's income is down from last month." },
  largestExpenseCategory: { id: "Kategori Pengeluaran Terbesar", en: "Largest Expense Category" },
  largestCategoryDesc: { id: "menyontribusi dari total pengeluaran.", en: "accounts for of total expenses." },
  startTracking: { id: "Mulai Mencatat Keuangan", en: "Start Tracking Finances" },
  recordFirstTransaction: { id: "Catat transaksi pertamamu untuk mendapatkan insights pribadi.", en: "Record your first transaction to get personalized insights." },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang] ?? translations[key]["id"];
}

// React hook for language
import { useState, useEffect } from "react";
import { getSettings } from "./store/database";

export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(() => (getSettings().language as Lang) || "id");

  useEffect(() => {
    const update = () => {
      const newLang = (getSettings().language as Lang) || "id";
      setLang(newLang);
    };
    window.addEventListener("luminary_data_change", update);
    window.addEventListener("storage", update);
    // Also poll once on mount to catch any missed updates
    update();
    return () => {
      window.removeEventListener("luminary_data_change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return lang;
}

// React hook for theme
export function useTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">(() => (getSettings().theme as "dark" | "light") || "dark");

  useEffect(() => {
    const update = () => setTheme((getSettings().theme as "dark" | "light") || "dark");
    window.addEventListener("luminary_data_change", update);
    return () => window.removeEventListener("luminary_data_change", update);
  }, []);

  return theme;
}
