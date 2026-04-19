import { TourStep } from '../components/GuidedTour';

const clickIfExists = (selector: string) => {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (el) el.click();
};

export const onboardingTourSteps: TourStep[] = [

  // ── 1. Dashboard ──────────────────────────────────────────────────
  {
    target: '#tour-balance-card',
    title: 'Dashboard',
    titleEn: 'Dashboard',
    content: 'Ringkasan saldo aktif, arus masuk, dan arus keluar ada di sini.',
    contentEn: 'Active balance, inflow, and outflow summary are all here.',
    position: 'bottom',
    highlightPadding: 10,
    action: () => {
      if (window.location.pathname !== '/app') clickIfExists('#tour-nav-home');
    },
  },

  // ── 2. Tombol transaksi ───────────────────────────────────────────
  {
    target: '#tour-fab-transaction',
    title: 'Tombol Transaksi',
    titleEn: 'Transaction Button',
    content: 'Tap tombol ini untuk membuka form transaksi baru.',
    contentEn: 'Tap this button to open the new transaction form.',
    position: 'left',
    highlightPadding: 8,
    requireInteraction: true,
    completionAction: 'click',
    action: () => {
      if (window.location.pathname !== '/app') clickIfExists('#tour-nav-home');
    },
  },

  // ── 3. Isi nominal dulu ───────────────────────────────────────────
  {
    target: '#tour-tx-amount',
    title: 'Isi Nominal',
    titleEn: 'Enter Amount',
    content: 'Ketik nominal transaksi. Selesai mengetik, panduan lanjut otomatis.',
    contentEn: 'Type the transaction amount. When done, the guide continues automatically.',
    position: 'bottom',
    highlightPadding: 6,
    requireInteraction: true,
    completionAction: 'amount-filled',
    action: () => {
      setTimeout(() => {
        const inp = document.querySelector('#tour-tx-amount input') as HTMLInputElement | null;
        if (inp) inp.focus();
      }, 300);
    },
  },

  // ── 4. Pilih kategori — setelah nominal diisi ─────────────────────
  {
    target: '#tour-tx-category-btn',
    title: 'Pilih Kategori',
    titleEn: 'Choose Category',
    content: 'Tap di sini lalu pilih kategori yang sesuai, misalnya "Makanan".',
    contentEn: 'Tap here then choose the right category, e.g. "Food".',
    position: 'bottom',
    highlightPadding: 6,
    requireInteraction: true,
    completionAction: 'category-select',
    action: () => {},
  },

  // ── 5. Simpan ─────────────────────────────────────────────────────
  {
    target: '#tour-tx-save',
    title: 'Simpan Transaksi',
    titleEn: 'Save Transaction',
    content: 'Tap Simpan. Panduan lanjut setelah modal tertutup.',
    contentEn: 'Tap Save. The guide continues after the modal closes.',
    position: 'top',
    highlightPadding: 6,
    requireInteraction: true,
    completionAction: 'transaction-save',
    action: () => {},
  },

  // ── 6. Nav: Wallet ────────────────────────────────────────────────
  {
    target: '#tour-nav-wallet',
    title: 'Wallet',
    titleEn: 'Wallet',
    content: 'Tap untuk melihat saldo cash, rekening bank, dan tabungan aktif.',
    contentEn: 'Tap to see cash balance, bank accounts, and active savings.',
    position: 'top',
    highlightPadding: 4,
    requireInteraction: true,
    completionAction: 'nav-wallet',
    action: () => {},
  },

  // ── 7. Konten Wallet ──────────────────────────────────────────────
  {
    target: '#tour-wallet-summary',
    title: 'Isi Wallet',
    titleEn: 'Wallet Content',
    content: 'Di sini terlihat susunan dana dan total yang sedang dikelola.',
    contentEn: 'Here you can see your fund structure and total managed balance.',
    position: 'bottom',
    highlightPadding: 10,
    action: () => {
      if (window.location.pathname !== '/app/wallet') clickIfExists('#tour-nav-wallet');
    },
  },

  // ── 8. Nav: History ───────────────────────────────────────────────
  {
    target: '#tour-nav-history',
    title: 'History',
    titleEn: 'History',
    content: 'Tap untuk melihat semua riwayat transaksi.',
    contentEn: 'Tap to see all transaction history.',
    position: 'top',
    highlightPadding: 4,
    requireInteraction: true,
    completionAction: 'nav-history',
    action: () => {},
  },

  // ── 9. Konten History ─────────────────────────────────────────────
  {
    target: '#tour-history-summary',
    title: 'Isi History',
    titleEn: 'History Content',
    content: 'Semua transaksi tersusun di sini. Gunakan filter untuk evaluasi bulanan.',
    contentEn: 'All transactions are organized here. Use filters for monthly reviews.',
    position: 'bottom',   // tooltip di bawah summary, tidak menghalangi
    highlightPadding: 8,
    action: () => {
      if (window.location.pathname !== '/app/history') clickIfExists('#tour-nav-history');
    },
  },

  // ── 10. Nav: Tasks ────────────────────────────────────────────────
  {
    target: '#tour-nav-tasks',
    title: 'Tasks',
    titleEn: 'Tasks',
    content: 'Tap untuk membuat checklist dan pengingat finansial.',
    contentEn: 'Tap to create financial checklists and reminders.',
    position: 'top',
    highlightPadding: 4,
    requireInteraction: true,
    completionAction: 'nav-tasks',
    action: () => {},
  },

  // ── 11. Konten Tasks ──────────────────────────────────────────────
  {
    target: '#tour-tasks-header',   // sorot header Tasks, tooltip di bawah — tidak halangi board
    title: 'Isi Tasks',
    titleEn: 'Tasks Content',
    content: 'Susun langkah kecil yang mendukung tujuan finansialmu.',
    contentEn: 'Organize small steps that support your financial goals.',
    position: 'bottom',
    highlightPadding: 8,
    action: () => {
      if (window.location.pathname !== '/app/tasks') clickIfExists('#tour-nav-tasks');
    },
  },

  // ── 12. Nav: Account ──────────────────────────────────────────────
  {
    target: '#tour-nav-account',
    title: 'Akun',
    titleEn: 'Account',
    content: 'Tap untuk mengelola profil, PIN, bahasa, dan pengaturan lainnya.',
    contentEn: 'Tap to manage your profile, PIN, language, and other settings.',
    position: 'top',
    highlightPadding: 4,
    requireInteraction: true,
    completionAction: 'nav-account',
    action: () => {},
  },

  // ── 13. Konten Account ────────────────────────────────────────────
  {
    target: '#tour-account-header',  // sorot judul "Akun", tooltip di bawah — tidak halangi profil card
    title: 'Isi Akun',
    titleEn: 'Account Content',
    content: 'Semua pengaturan personal ada di sini. Bisa diubah kapan saja.',
    contentEn: 'All personal settings are here. Can be changed anytime.',
    position: 'bottom',
    highlightPadding: 8,
    action: () => {
      if (window.location.pathname !== '/app/account') clickIfExists('#tour-nav-account');
    },
  },
];

export const featureTourSteps: TourStep[] = onboardingTourSteps;
