// Local database using localStorage for persistent data storage

// Simple polyfill for crypto.randomUUID if not available
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  memberSince: number;
  pin: string;
}

export interface ReceiptData {
  rawCode: string;          // raw barcode/QR value
  codeType: string;         // QR_CODE, EAN_13, CODE_128, etc.
  merchantName?: string;    // parsed merchant if available
  scannedAt: string;        // ISO
  imageDataUrl?: string;    // optional photo of receipt
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  notes: string;
  type: "income" | "expense";
  date: string; // ISO string
  receipt?: ReceiptData;    // nota/scan data
  /**
   * Metadata sumber dana untuk kebutuhan filter/history & simulasi.
   * Optional supaya data lama tetap valid.
   */
  paymentSource?: {
    type: "cash" | "bank" | "emergency_fund" | "locked_saving" | "debt" | "asset";
    id?: string;
    label?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  type: "income" | "expense" | "both";
}

export interface SavingTopUp {
  id: string;
  amount: number;
  date: string; // ISO
  note: string;
}

export interface LockedSaving {
  id: string;
  name: string;         // nama target tabungan
  reason: string;       // alasan/tujuan tabungan
  targetAmount: number; // target yang ingin dicapai
  savedAmount: number;  // uang yang sudah dimasukkan
  lockedAt: string;     // ISO - kapan dibuat
  unlockAt: string;     // ISO - kapan bisa dicairkan
  isWithdrawn: boolean; // sudah dicairkan normal
  isForcedOut: boolean; // dicairkan paksa
  emoji: string;        // ikon tabungan
  history: SavingTopUp[]; // riwayat top-up
}

export interface ReminderSchedule {
  id: string;
  title: string;
  message: string;
  time: string; // Format: "HH:MM" (24-hour)
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  enabled: boolean;
  lastSent?: string; // ISO timestamp
}

export interface AppSettings {
  biometricEnabled: boolean;
  language: string;
  theme: string;
  notifications: {
    transactions: boolean;
    security: boolean;
    reminders: boolean;
    promotions: boolean;
    updates: boolean;
  };
  privacy: {
    shareData: boolean;
    showBalance: boolean;
    twoFactor: boolean;
    loginAlerts: boolean;
  };
  reminders?: ReminderSchedule[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  weight: number; // bobot persen 1-100, default equal split
}

export interface KanbanTask {
  id: string;
  title: string;
  notes: string;
  status: "todo" | "doing" | "done";
  checklists: ChecklistItem[];
  dueDate?: string; // ISO
  labelColor?: string; // e.g. 'green' for Personal, 'yellow' for Work
  createdAt: string;
}

export interface Debt {
  id: string;
  type: "debt" | "loan"; // debt = saya berhutang ke orang, loan = saya menghutangi orang (piutang)
  personName: string;
  amount: number;
  remainingAmount: number;
  notes: string;
  dueDate?: string;
  isPaid: boolean;
  createdAt: string;
  payments: { date: string, amount: number }[];
}

const KEYS = {
  USER: "luminary_user",
  TRANSACTIONS: "luminary_transactions",
  SETTINGS: "luminary_settings",
  CATEGORIES: "luminary_categories",
  LOCKED_SAVINGS: "luminary_locked_savings",
  TASKS: "luminary_tasks",
  DEBTS: "luminary_debts",
  EMERGENCY_FUNDS: "luminary_emergency_funds",
};

export interface EmergencyFundTopUp {
  id: string;
  amount: number;
  date: string; // ISO
  note: string;
}

export interface EmergencyFundWithdrawal {
  id: string;
  amount: number;
  date: string; // ISO
  reason: string;
}

export interface EmergencyFund {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  history: EmergencyFundTopUp[];
  withdrawals: EmergencyFundWithdrawal[];
  /** Jika diikat ke rekening bank, dana sejumlah savedAmount dianggap "terkunci" di bank tsb */
  lockedFromBankAccountId?: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface InflowTarget {
  category: string;
  target: number;
}

export function getBudgets(): Budget[] {
  return get("luminary_budgets", []);
}

export function saveBudget(category: string, limit: number) {
  const budgets = getBudgets().filter(b => b.category !== category);
  if (limit > 0) budgets.push({ category, limit });
  set("luminary_budgets", budgets);
}

export function getInflowTargets(): InflowTarget[] {
  return get("luminary_inflow_targets", []);
}

export function saveInflowTarget(category: string, target: number) {
  const targets = getInflowTargets().filter(t => t.category !== category);
  if (target > 0) targets.push({ category, target });
  set("luminary_inflow_targets", targets);
}

// ─── Emergency Fund ─────────────────────────────────────────────────

function normalizeEmergencyFund(data: Partial<EmergencyFund>): EmergencyFund {
  return {
    id: data.id || crypto.randomUUID(),
    name: data.name || "Dana Darurat",
    targetAmount: data.targetAmount || 0,
    savedAmount: data.savedAmount || 0,
    monthlyContribution: data.monthlyContribution || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    isActive: data.isActive ?? true,
    history: data.history || [],
    withdrawals: data.withdrawals || [],
    lockedFromBankAccountId: data.lockedFromBankAccountId,
  };
}

function migrateEmergencyFundIfNeeded(): void {
  const existingList = get<Partial<EmergencyFund>[]>(KEYS.EMERGENCY_FUNDS, []);
  if (existingList.length > 0) return;

  const legacyKey = "luminary_emergency_fund";
  const legacy = get<Partial<EmergencyFund> | null>(legacyKey, null);
  if (!legacy) return;

  const migrated = normalizeEmergencyFund(legacy);
  set(KEYS.EMERGENCY_FUNDS, [migrated]);
}

export function getEmergencyFunds(): EmergencyFund[] {
  migrateEmergencyFundIfNeeded();
  const raw = get<Partial<EmergencyFund>[]>(KEYS.EMERGENCY_FUNDS, []);
  return raw.map(normalizeEmergencyFund);
}

export function getEmergencyFund(fundId?: string): EmergencyFund | null {
  const funds = getEmergencyFunds();
  if (funds.length === 0) return null;
  if (!fundId) return funds[0];
  return funds.find(f => f.id === fundId) ?? null;
}

// ─── Bank Locked Funds (saldo bank terkunci) ───────────────────────
type BankLockedFundsMap = Record<string, number>;
const BANK_LOCKED_FUNDS_KEY = "luminary_bank_locked_funds";

export function getBankLockedFundsMap(): BankLockedFundsMap {
  return get<BankLockedFundsMap>(BANK_LOCKED_FUNDS_KEY, {});
}

export function getBankLockedFunds(bankAccountId: string): number {
  const m = getBankLockedFundsMap();
  return Math.max(0, Math.floor(m[bankAccountId] || 0));
}

export function setBankLockedFunds(bankAccountId: string, lockedAmount: number) {
  const m = getBankLockedFundsMap();
  m[bankAccountId] = Math.max(0, Math.floor(lockedAmount));
  set(BANK_LOCKED_FUNDS_KEY, m);
}

export function addBankLockedFunds(bankAccountId: string, delta: number) {
  const prev = getBankLockedFunds(bankAccountId);
  setBankLockedFunds(bankAccountId, prev + delta);
}

export function getBankAvailableBalance(bankAccountId: string): number {
  const acc = getBankAccounts().find(a => a.id === bankAccountId);
  if (!acc) return 0;
  return acc.balance - getBankLockedFunds(bankAccountId);
}

export function saveEmergencyFund(
  fund: Omit<EmergencyFund, "id" | "createdAt" | "updatedAt" | "history" | "withdrawals"> & { id?: string }
) {
  const now = new Date().toISOString();
  const funds = getEmergencyFunds();
  const existing = fund.id ? funds.find(f => f.id === fund.id) : null;
  const prevLockedBank = existing?.lockedFromBankAccountId;
  const prevLockedAmt = existing?.savedAmount || 0;
  const initialHistory: EmergencyFundTopUp[] = fund.savedAmount > 0
    ? [{ id: crypto.randomUUID(), amount: fund.savedAmount, date: now, note: "Dana awal" }]
    : [];
  const next: EmergencyFund = {
    ...normalizeEmergencyFund(existing ?? {}),
    ...fund,
    id: existing?.id || fund.id || crypto.randomUUID(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    isActive: true,
    history: existing?.history?.length ? existing.history : initialHistory,
    withdrawals: existing?.withdrawals || [],
  };

  const updatedList = existing
    ? funds.map(f => f.id === existing.id ? next : f)
    : [next, ...funds];

  set(KEYS.EMERGENCY_FUNDS, updatedList);

  // Sync bank locked funds jika dana darurat diikat ke bank
  if (prevLockedBank && prevLockedAmt > 0) addBankLockedFunds(prevLockedBank, -prevLockedAmt);
  if (fund.lockedFromBankAccountId && fund.savedAmount > 0) addBankLockedFunds(fund.lockedFromBankAccountId, fund.savedAmount);
}

export function updateEmergencyFund(fundId: string, updates: Partial<Omit<EmergencyFund, "id" | "createdAt">>) {
  const funds = getEmergencyFunds();
  const existing = funds.find(f => f.id === fundId);
  if (!existing) return;
  set(KEYS.EMERGENCY_FUNDS, funds.map(f => f.id === fundId ? {
    ...f,
    ...updates,
    updatedAt: new Date().toISOString(),
  } : f));
}

export function addToEmergencyFund(fundId: string, amount: number, note = "") {
  const funds = getEmergencyFunds();
  const existing = funds.find(f => f.id === fundId);
  if (!existing) return;
  const entry: EmergencyFundTopUp = {
    id: crypto.randomUUID(),
    amount,
    date: new Date().toISOString(),
    note: note || "Top-up",
  };
  const next = {
    ...existing,
    savedAmount: existing.savedAmount + amount,
    history: [...existing.history, entry],
    updatedAt: new Date().toISOString(),
  };
  set(KEYS.EMERGENCY_FUNDS, funds.map(f => f.id === fundId ? next : f));
  if (existing.lockedFromBankAccountId) addBankLockedFunds(existing.lockedFromBankAccountId, amount);
}

export function withdrawFromEmergencyFund(fundId: string, amount: number, reason: string) {
  const funds = getEmergencyFunds();
  const existing = funds.find(f => f.id === fundId);
  if (!existing) return;
  const newSaved = Math.max(0, existing.savedAmount - amount);
  const entry: EmergencyFundWithdrawal = {
    id: crypto.randomUUID(),
    amount,
    date: new Date().toISOString(),
    reason,
  };
  const next = {
    ...existing,
    savedAmount: newSaved,
    withdrawals: [...existing.withdrawals, entry],
    updatedAt: new Date().toISOString(),
  };
  set(KEYS.EMERGENCY_FUNDS, funds.map(f => f.id === fundId ? next : f));
  if (existing.lockedFromBankAccountId) addBankLockedFunds(existing.lockedFromBankAccountId, -amount);
}

export function deleteEmergencyFund(fundId: string) {
  const funds = getEmergencyFunds();
  const existing = funds.find(f => f.id === fundId);
  if (existing?.lockedFromBankAccountId && existing.savedAmount > 0) {
    addBankLockedFunds(existing.lockedFromBankAccountId, -existing.savedAmount);
  }
  set(KEYS.EMERGENCY_FUNDS, funds.filter(f => f.id !== fundId));
}

/** Estimasi bulan untuk mencapai target berdasarkan kontribusi bulanan */
export function getEmergencyFundETA(fundId: string): number | null {
  const fund = getEmergencyFund(fundId);
  if (!fund || fund.monthlyContribution <= 0) return null;
  const remaining = fund.targetAmount - fund.savedAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / fund.monthlyContribution);
}

/** Format angka dengan pemisah ribuan, tanpa prefix Rp */
export function formatNumber(amount: number): string {
  return Math.abs(amount).toLocaleString("id-ID");
}

// ─── Debts & Loans ─────────────────────────────────────────────────

export function getDebts(): Debt[] {
  return get(KEYS.DEBTS, []);
}

export function addDebt(debt: Omit<Debt, "id" | "createdAt" | "isPaid" | "payments" | "remainingAmount"> & { createdAt?: string }) {
  const debts = getDebts();
  const newDebt: Debt = { 
    ...debt, 
    id: crypto.randomUUID(), 
    createdAt: debt.createdAt || new Date().toISOString(),
    isPaid: false,
    remainingAmount: debt.amount,
    payments: []
  };
  debts.push(newDebt);
  set(KEYS.DEBTS, debts);
}

export function addDebtPayment(id: string, amount: number) {
  const debts = getDebts();
  const prevDebt = debts.find(d => d.id === id);
  const prevPct = prevDebt ? ((prevDebt.amount - prevDebt.remainingAmount) / prevDebt.amount) * 100 : 0;

  const updated = debts.map(d => {
    if (d.id === id) {
      const remaining = Math.max(0, d.remainingAmount - amount);
      const isPaid = remaining === 0;
      const newPct = ((d.amount - remaining) / d.amount) * 100;

      return {
        ...d,
        remainingAmount: remaining,
        isPaid,
        payments: [...d.payments, { date: new Date().toISOString(), amount }]
      };
    }
    return d;
  });
  set(KEYS.DEBTS, updated);
}

export function updateDebt(id: string, updates: Partial<Pick<Debt, "personName" | "amount" | "notes" | "dueDate" | "type">>) {
  const debts = getDebts().map(d => {
    if (d.id !== id) return d;
    const updated = { ...d, ...updates };
    // Recalculate remainingAmount if amount changed
    if (updates.amount !== undefined) {
      const paid = d.amount - d.remainingAmount;
      updated.remainingAmount = Math.max(0, updates.amount - paid);
      updated.isPaid = updated.remainingAmount === 0;
    }
    return updated;
  });
  set(KEYS.DEBTS, debts);
}

export function deleteDebt(id: string) {
  set(KEYS.DEBTS, getDebts().filter(d => d.id !== id));
}

// ─── Kanban Tasks ──────────────────────────────────────────────────

export function getTasks(): KanbanTask[] {
  return get(KEYS.TASKS, []);
}

export function addTask(task: Omit<KanbanTask, "id" | "createdAt">) {
  const tasks = getTasks();
  const newTask: KanbanTask = { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  tasks.push(newTask);
  set(KEYS.TASKS, tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<KanbanTask>) {
  const tasks = getTasks().map(t => t.id === id ? { ...t, ...updates } : t);
  set(KEYS.TASKS, tasks);
}

export function deleteTask(id: string) {
  set(KEYS.TASKS, getTasks().filter(t => t.id !== id));
}

export function moveTask(id: string, status: KanbanTask["status"]) {
  updateTask(id, { status });
}

// ─── Task History (Rule of 5 FIFO) ────────────────────────────────
const TASK_HISTORY_KEY = "luminary_task_history";
const MAX_HOME_TASKS = 5;

export interface TaskHistoryEntry {
  id: string;
  title: string;
  notes: string;
  status: KanbanTask["status"];
  checklists: ChecklistItem[];
  dueDate?: string;
  labelColor?: string;
  createdAt: string;
  archivedAt: string;
}

export function getTaskHistory(): TaskHistoryEntry[] {
  return get(TASK_HISTORY_KEY, []);
}

/** Tambah tugas ke history (FIFO — tidak ada batas, semua masuk history) */
export function archiveTaskToHistory(task: KanbanTask) {
  const history = getTaskHistory();
  const entry: TaskHistoryEntry = { ...task, archivedAt: new Date().toISOString() };
  history.unshift(entry);
  set(TASK_HISTORY_KEY, history);
}

/** Hapus dari history */
export function deleteTaskHistory(id: string) {
  set(TASK_HISTORY_KEY, getTaskHistory().filter(t => t.id !== id));
}

/** Ambil tugas aktif (non-done) — max 5 untuk Home */
export function getActiveTasksForHome(): KanbanTask[] {
  return getTasks().filter(t => t.status !== "done").slice(0, MAX_HOME_TASKS);
}

/** Tambah tugas baru dengan FIFO: jika active tasks > 5, yang terlama masuk history */
export function addTaskWithFIFO(task: Omit<KanbanTask, "id" | "createdAt">): KanbanTask {
  const tasks = getTasks();
  const newTask: KanbanTask = { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  tasks.push(newTask);
  set(KEYS.TASKS, tasks);

  // FIFO: cek active tasks, jika > 5 arsipkan yang terlama
  const activeTasks = tasks.filter(t => t.status !== "done")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (activeTasks.length > MAX_HOME_TASKS) {
    const oldest = activeTasks[0];
    archiveTaskToHistory(oldest);
    set(KEYS.TASKS, tasks.filter(t => t.id !== oldest.id));
  }
  return newTask;
}

// ─── Default Values ────────────────────────────────────────────────

const defaultUser: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  memberSince: new Date().getFullYear(),
  pin: "123456",
};

const defaultCategories: Category[] = [
  { id: "1",  name: "Makanan",   emoji: "🍔",  type: "expense" },
  { id: "2",  name: "Transport", emoji: "🚗",  type: "expense" },
  { id: "3",  name: "Belanja",   emoji: "🛍️", type: "expense" },
  { id: "4",  name: "Tagihan",   emoji: "📄", type: "expense" },
  { id: "5",  name: "Hiburan",   emoji: "🎮", type: "expense" },
  { id: "6",  name: "Kesehatan", emoji: "💊", type: "expense" },
  { id: "7",  name: "Gaji",      emoji: "💵", type: "income"  },
  { id: "8",  name: "Freelance", emoji: "💻", type: "income"  },
  { id: "9",  name: "Investasi", emoji: "📈", type: "both"    },
  { id: "10", name: "Tabungan",  emoji: "💰", type: "expense" },
  { id: "11", name: "Transfer",  emoji: "↗️", type: "expense" },
];

const defaultSettings: AppSettings = {
  biometricEnabled: true,
  language: "id",
  theme: "dark",
  notifications: { transactions: true, security: true, reminders: true, promotions: false, updates: false },
  privacy: { shareData: false, showBalance: true, twoFactor: true, loginAlerts: true },
};

// ─── Helpers ───────────────────────────────────────────────────────

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  // Dispatch custom event so same-tab listeners can react
  window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key } }));
}

// ─── User Profile ──────────────────────────────────────────────────

export function getUser(): UserProfile {
  return get(KEYS.USER, defaultUser);
}

export function saveUser(user: Partial<UserProfile>) {
  const current = getUser();
  set(KEYS.USER, { ...current, ...user });
}

const ALL_DATA_KEYS = [
  "luminary_user",
  "luminary_transactions",
  "luminary_settings",
  "luminary_categories",
  "luminary_locked_savings",
  "luminary_tasks",
  "luminary_debts",
  "luminary_budgets",
  "luminary_inflow_targets",
  "luminary_task_history",
  "luminary_emergency_funds",
  "luminary_cash_wallet_balance",
  "luminary_cash_wallet_txs",
  "luminary_bank_accounts",
  "luminary_bank_transactions",
  "luminary_transfer_contacts",
  "luminary_assets",
  "luminary_custom_banks",
];

export function exportAllData(): string {
  const data: Record<string, unknown> = {};
  ALL_DATA_KEYS.forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      data[key] = JSON.parse(item);
    }
  });

  // Wrap with metadata for integrity checking
  const payload = {
    _meta: {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      appName: "Luminary",
      keyCount: Object.keys(data).length,
      // Simple checksum: sum of char codes of all keys
      checksum: Object.keys(data).join("").split("").reduce((s, c) => s + c.charCodeAt(0), 0),
    },
    data,
  };

  return JSON.stringify(payload, null, 2);
}

export function importAllData(jsonStr: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);

    // Support both new format (with _meta) and legacy format (plain keys)
    let data: Record<string, unknown>;

    if (parsed._meta && parsed.data) {
      // New format — validate metadata
      if (parsed._meta.appName !== "Luminary") {
        return { success: false, error: "File bukan backup Luminary yang valid." };
      }
      data = parsed.data as Record<string, unknown>;
    } else {
      // Legacy format — plain object with luminary_ keys
      const hasLuminaryKeys = Object.keys(parsed).some(k => k.startsWith("luminary_"));
      if (!hasLuminaryKeys) {
        return { success: false, error: "Format file tidak dikenali. Pastikan file adalah backup Luminary." };
      }
      data = parsed;
    }

    // Validate that at least user or transactions key exists
    const hasEssentialData = ALL_DATA_KEYS.some(k => k in data);
    if (!hasEssentialData) {
      return { success: false, error: "File backup tidak mengandung data yang valid." };
    }

    // Apply data — only known keys
    ALL_DATA_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    Object.entries(data).forEach(([key, value]) => {
      if (ALL_DATA_KEYS.includes(key)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });

    window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: "all" } }));
    return { success: true };
  } catch {
    return { success: false, error: "File rusak atau tidak dapat dibaca." };
  }
}

// ─── Categories ────────────────────────────────────────────────────

export function getCategories(): Category[] {
  const cats = get(KEYS.CATEGORIES, defaultCategories);
  // Inject "Transfer" jika belum ada (untuk user lama)
  if (!cats.find(c => c.name === "Transfer")) {
    const withTransfer = [...cats, { id: "11", name: "Transfer", emoji: "↗️", type: "expense" as const }];
    set(KEYS.CATEGORIES, withTransfer);
    return withTransfer;
  }
  return cats;
}

export function addCategory(cat: Omit<Category, "id">) {
  const categories = getCategories();
  categories.push({ ...cat, id: crypto.randomUUID() });
  set(KEYS.CATEGORIES, categories);
}

export function updateCategory(id: string, updates: Partial<Category>) {
  const categories = getCategories().map(c => c.id === id ? { ...c, ...updates } : c);
  set(KEYS.CATEGORIES, categories);
}

export function deleteCategory(id: string) {
  const categories = getCategories().filter(c => c.id !== id);
  set(KEYS.CATEGORIES, categories);
}

// ─── Transactions ──────────────────────────────────────────────────

export function getTransactions(): Transaction[] {
  return (get(KEYS.TRANSACTIONS, []) as Transaction[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addTransaction(tx: Omit<Transaction, "id"> & { date?: string }) {
  const transactions = getTransactions();
  const newTx: Transaction = { ...tx, id: crypto.randomUUID(), date: tx.date ?? new Date().toISOString() };
  transactions.unshift(newTx);
  set(KEYS.TRANSACTIONS, transactions);
  
  // Add EXP for transaction
  const newLevel = addExp(EXP_PER_TRANSACTION);

  // Note: per requirement CRUD feedback pakai alert("berhasil") + sound dari UI layer.
  // Level/EXP tetap dihitung, tapi tidak memunculkan toast otomatis di sini.
  return newTx;
}

// ─── Money input helpers (Rupiah-style) ─────────────────────────────
export function formatMoneyInput(val: string): string {
  const digits = (val ?? "").toString().replace(/\D/g, "");
  if (!digits) return "";
  // Manual dot-separated thousands (id-ID style) — avoids locale inconsistencies
  const num = parseInt(digits, 10);
  if (isNaN(num)) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseMoneyInput(val: string): number {
  // Strip all non-digit characters (dots, commas, spaces, Rp prefix, etc.)
  const digits = (val ?? "").toString().replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) || 0;
}

// ─── Backfill History (once) ────────────────────────────────────────
const BACKFILL_HISTORY_V1_KEY = "luminary_history_backfill_v1_done";

function backfillHistoryOnce() {
  try {
    if (localStorage.getItem(BACKFILL_HISTORY_V1_KEY) === "1") return;

    const existing = get(KEYS.TRANSACTIONS, []) as Transaction[];
    const sig = (t: Pick<Transaction, "date" | "type" | "category" | "amount" | "notes">) =>
      `${t.date}|${t.type}|${t.category}|${t.amount}|${t.notes}`;
    const existingSigs = new Set(existing.map(t => sig(t)));

    const toInsert: Omit<Transaction, "id">[] = [];

    // Emergency Fund: history (top-up) + withdrawals
    try {
      getEmergencyFunds().forEach(fund => {
        (fund.history || []).forEach(h => {
          const notes = [fund.name ? `Dana Darurat: ${fund.name}` : "Dana Darurat", h.note].filter(Boolean).join(" · ");
          const t: Omit<Transaction, "id"> = {
            amount: h.amount,
            category: "Dana Darurat",
            notes,
            type: "expense",
            date: h.date,
            paymentSource: { type: "emergency_fund", id: fund.id, label: fund.name },
          };
          if (!existingSigs.has(sig(t))) { existingSigs.add(sig(t)); toInsert.push(t); }
        });
        (fund.withdrawals || []).forEach(w => {
          const notes = [fund.name ? `Dana Darurat: ${fund.name}` : "Dana Darurat", w.reason ? `Tarik: ${w.reason}` : "Tarik"].filter(Boolean).join(" · ");
          const t: Omit<Transaction, "id"> = {
            amount: w.amount,
            category: "Dana Darurat",
            notes,
            type: "income",
            date: w.date,
            paymentSource: { type: "emergency_fund", id: fund.id, label: fund.name },
          };
          if (!existingSigs.has(sig(t))) { existingSigs.add(sig(t)); toInsert.push(t); }
        });
      });
    } catch { /* ignore */ }

    // Locked Savings: top-up history
    try {
      getLockedSavings().forEach(s => {
        (s.history || []).forEach(h => {
          const notes = [s.name ? `Tabungan: ${s.name}` : "Tabungan", h.note].filter(Boolean).join(" · ");
          const t: Omit<Transaction, "id"> = {
            amount: h.amount,
            category: "Tabungan",
            notes,
            type: "expense",
            date: h.date,
            paymentSource: { type: "locked_saving", id: s.id, label: s.name },
          };
          if (!existingSigs.has(sig(t))) { existingSigs.add(sig(t)); toInsert.push(t); }
        });
      });
    } catch { /* ignore */ }

    if (toInsert.length > 0) {
      const merged: Transaction[] = [
        ...existing,
        ...toInsert.map(t => ({ ...t, id: crypto.randomUUID() })),
      ];
      set(KEYS.TRANSACTIONS, merged);
    }

    localStorage.setItem(BACKFILL_HISTORY_V1_KEY, "1");
  } catch {
    // ignore
  }
}

// ─── Cash Wallet Simulation (Dana Cash) ─────────────────────────────

export interface CashWalletTx {
  id: string;
  type: "in" | "out";
  amount: number;
  category: string;
  notes: string;
  date: string; // ISO
  createdAt: string; // ISO
  relatedTransactionId?: string;
}

const CASH_WALLET_BALANCE_KEY = "luminary_cash_wallet_balance";
const CASH_WALLET_TX_KEY = "luminary_cash_wallet_txs";

export function getCashWalletBalance(): number {
  return get<number>(CASH_WALLET_BALANCE_KEY, 0);
}

export function setCashWalletBalance(balance: number) {
  set(CASH_WALLET_BALANCE_KEY, Math.max(0, Math.floor(balance)));
}

export function getCashWalletTransactions(): CashWalletTx[] {
  return get<CashWalletTx[]>(CASH_WALLET_TX_KEY, []);
}

export function addCashWalletTransaction(tx: Omit<CashWalletTx, "id" | "createdAt">) {
  const all = getCashWalletTransactions();
  const createdAt = new Date().toISOString();
  const newTx: CashWalletTx = { ...tx, id: crypto.randomUUID(), createdAt };
  all.unshift(newTx);
  set(CASH_WALLET_TX_KEY, all);

  const current = getCashWalletBalance();
  const next = tx.type === "in"
    ? current + tx.amount
    : Math.max(0, current - tx.amount);
  setCashWalletBalance(next);

  return newTx;
}

export function deleteTransaction(id: string) {
  set(KEYS.TRANSACTIONS, getTransactions().filter(t => t.id !== id));
}

// ─── Locked Savings ────────────────────────────────────────────────

export function getLockedSavings(): LockedSaving[] {
  const raw = get(KEYS.LOCKED_SAVINGS, []) as Partial<LockedSaving>[];
  // Migrate old data that may not have all fields
  return raw.map(s => {
    const migrated: LockedSaving = {
      id: s.id ?? crypto.randomUUID(),
      name: s.name ?? "",
      reason: s.reason ?? "",
      targetAmount: s.targetAmount ?? s.savedAmount ?? 0,
      savedAmount: s.savedAmount ?? 0,
      lockedAt: s.lockedAt ?? new Date().toISOString(),
      unlockAt: s.unlockAt ?? new Date().toISOString(),
      isWithdrawn: s.isWithdrawn ?? false,
      isForcedOut: s.isForcedOut ?? false,
      emoji: s.emoji ?? "🎯",
      history: s.history ?? [],
    };
    return migrated;
  });
}

export function addLockedSaving(saving: Omit<LockedSaving, "id" | "lockedAt" | "isWithdrawn" | "isForcedOut" | "history">) {
  const savings = getLockedSavings();
  const initialHistory: SavingTopUp[] = saving.savedAmount > 0
    ? [{ id: crypto.randomUUID(), amount: saving.savedAmount, date: new Date().toISOString(), note: "Dana awal" }]
    : [];
  savings.push({
    ...saving,
    id: crypto.randomUUID(),
    lockedAt: new Date().toISOString(),
    isWithdrawn: false,
    isForcedOut: false,
    history: initialHistory,
  });
  set(KEYS.LOCKED_SAVINGS, savings);
  addExp(EXP_PER_SAVINGS_GOAL);
}

export function updateLockedSaving(id: string, updates: Partial<LockedSaving>) {
  const savings = getLockedSavings().map(s => s.id === id ? { ...s, ...updates } : s);
  set(KEYS.LOCKED_SAVINGS, savings);
}

export function topUpLockedSaving(id: string, amount: number, note = "") {
  const savings = getLockedSavings().map(s => {
    if (s.id === id && !s.isWithdrawn && !s.isForcedOut) {
      const entry: SavingTopUp = { id: crypto.randomUUID(), amount, date: new Date().toISOString(), note };
      return { ...s, savedAmount: s.savedAmount + amount, history: [...s.history, entry] };
    }

    return s;
  });
  set(KEYS.LOCKED_SAVINGS, savings);
}

export function withdrawLockedSaving(id: string) {
  // Normal withdraw - only if unlock date has passed
  const savings = getLockedSavings().map(s => {
    if (s.id === id && new Date(s.unlockAt) <= new Date() && !s.isWithdrawn && !s.isForcedOut) {
      return { ...s, isWithdrawn: true };
    }
    return s;
  });
  set(KEYS.LOCKED_SAVINGS, savings);
}

export function forceWithdrawLockedSaving(id: string) {
  // Force withdraw - anytime, with penalty awareness
  const savings = getLockedSavings().map(s => {
    if (s.id === id && !s.isWithdrawn && !s.isForcedOut) {
      return { ...s, isForcedOut: true };
    }
    return s;
  });
  set(KEYS.LOCKED_SAVINGS, savings);
}

export function forceWithdrawLockedSavingAmount(id: string, amount: number, reason: string) {
  const amt = Math.max(0, Math.floor(amount));
  if (amt <= 0) return;

  const savings = getLockedSavings().map(s => {
    if (s.id !== id || s.isWithdrawn || s.isForcedOut) return s;

    const take = Math.min(amt, s.savedAmount);
    const entry: SavingTopUp = {
      id: crypto.randomUUID(),
      amount: -take,
      date: new Date().toISOString(),
      note: reason || "Tarik paksa",
    };
    const remaining = Math.max(0, s.savedAmount - take);

    return {
      ...s,
      savedAmount: remaining,
      isForcedOut: remaining === 0 ? true : s.isForcedOut,
      history: [...s.history, entry],
    };
  });

  set(KEYS.LOCKED_SAVINGS, savings);
}

export function deleteLockedSaving(id: string) {
  set(KEYS.LOCKED_SAVINGS, getLockedSavings().filter(s => s.id !== id));
}

export function getTotalLocked(): number {
  return getLockedSavings()
    .filter(s => !s.isWithdrawn && !s.isForcedOut)
    .reduce((sum, s) => sum + s.savedAmount, 0);
}

export function getAvailableBalance(): number {
  return getBalance() - getTotalLocked();
}

// ─── Computed Financial Data ───────────────────────────────────────

export function getBalance(): number {
  return getTransactions().reduce((sum, tx) => tx.type === "income" ? sum + tx.amount : sum - tx.amount, 0);
}

export function getMonthlyIncome(): number {
  const now = new Date();
  return getTransactions()
    .filter(tx => tx.type === "income" && new Date(tx.date).getMonth() === now.getMonth() && new Date(tx.date).getFullYear() === now.getFullYear())
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getMonthlyExpense(): number {
  const now = new Date();
  return getTransactions()
    .filter(tx => tx.type === "expense" && new Date(tx.date).getMonth() === now.getMonth() && new Date(tx.date).getFullYear() === now.getFullYear())
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getWeeklyIncome(): number {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return getTransactions().filter(tx => tx.type === "income" && new Date(tx.date) >= weekAgo).reduce((sum, tx) => sum + tx.amount, 0);
}

export function getWeeklyExpense(): number {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return getTransactions().filter(tx => tx.type === "expense" && new Date(tx.date) >= weekAgo).reduce((sum, tx) => sum + tx.amount, 0);
}

export function getCategoryTotals(): Record<string, number> {
  const totals: Record<string, number> = {};
  getTransactions().forEach(tx => { totals[tx.category] = (totals[tx.category] || 0) + tx.amount; });
  return totals;
}

export function getMonthlyCategorySpending(): Record<string, number> {
  const now = new Date();
  const totals: Record<string, number> = {};
  getTransactions()
    .filter(tx => tx.type === "expense" && new Date(tx.date).getMonth() === now.getMonth() && new Date(tx.date).getFullYear() === now.getFullYear())
    .forEach(tx => { totals[tx.category] = (totals[tx.category] || 0) + tx.amount; });
  return totals;
}

export function isCategoryOverBudget(category: string): boolean {
  const budgets = getBudgets();
  const budget = budgets.find(b => b.category === category);
  if (!budget || budget.limit <= 0) return false;
  const spent = getMonthlyCategorySpending()[category] || 0;
  return spent >= budget.limit;
}

export function getBudgetStatus(category: string): { isOverBudget: boolean; spent: number; limit: number; remaining: number; pct: number } {
  const budgets = getBudgets();
  const budget = budgets.find(b => b.category === category);
  const spent = getMonthlyCategorySpending()[category] || 0;
  if (!budget || budget.limit <= 0) {
    return { isOverBudget: false, spent, limit: 0, remaining: 0, pct: 0 };
  }
  const remaining = Math.max(0, budget.limit - spent);
  const pct = (spent / budget.limit) * 100;
  return { isOverBudget: spent >= budget.limit, spent, limit: budget.limit, remaining, pct };
}

// ─── Settings ──────────────────────────────────────────────────────

export function getSettings(): AppSettings {
  return get(KEYS.SETTINGS, defaultSettings);
}

export function saveSettings(settings: Partial<AppSettings>) {
  set(KEYS.SETTINGS, { ...getSettings(), ...settings });
}

// ─── Format Helpers ────────────────────────────────────────────────

export function formatRupiah(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (amount < 0 ? "-" : "") + "Rp" + formatted;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function playNotificationSound() {
  // Kept for backward compat — use dispatchNotif from notify.ts instead
}

// ─── Level & EXP System ───────────────────────────────────────

interface UserLevel {
  level: number;
  currentExp: number;
  totalExp: number;
  title: string;
}

const LEVEL_TITLES = [
  "Pemula", "Pencatat", "Pengatur", "Tabunner",
  "Juragan", "Bos Investasi", "Sultan", "Taipan",
  "Miliarder", "Triliuner", "Dewa Keuangan"
];

const EXP_PER_TRANSACTION = 10;
const EXP_PER_SAVINGS_GOAL = 100;
const EXP_PER_STREAK_DAY = 5;
const EXP_FOR_LEVEL_UP = 100;

function calcExpForLevel(level: number): number {
  return Math.floor(EXP_FOR_LEVEL_UP * Math.pow(1.2, level - 1));
}

export function getUserLevel(): UserLevel {
  const data = get<UserLevel>("luminary_level", { level: 1, currentExp: 0, totalExp: 0, title: "Pemula" });
  const titleIdx = Math.min(data.level - 1, LEVEL_TITLES.length - 1);
  return { ...data, title: LEVEL_TITLES[titleIdx] };
}

function saveUserLevel(level: Partial<UserLevel>) {
  const current = getUserLevel();
  set("luminary_level", { ...current, ...level });
}

export function addExp(amount: number) {
  const user = getUserLevel();
  let newExp = user.currentExp + amount;
  let newLevel = user.level;
  let newTotalExp = user.totalExp + amount;
  const expNeeded = calcExpForLevel(newLevel);
  
  while (newExp >= expNeeded) {
    newExp -= expNeeded;
    newLevel++;
  }
  
  const titleIdx = Math.min(newLevel - 1, LEVEL_TITLES.length - 1);
  const updated = {
    level: newLevel,
    currentExp: newExp,
    totalExp: newTotalExp,
    title: LEVEL_TITLES[titleIdx]
  };
  set("luminary_level", updated);
  dispatchEvent(new CustomEvent("luminary_data_change"));
  return updated;
}

export function getStreak(): { current: number; longest: number; lastDate: string | null; } {
  const txs = getTransactions();
  if (txs.length === 0) return { current: 0, longest: 0, lastDate: null };
  
  const dates = [...new Set(txs.map(t => new Date(t.date).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const lastDate = dates[0];
  
  let current = 0;
  let longest = 0;
  let tempStreak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (dates[0] === today || dates[0] === yesterday) {
    for (let i = 0; i < dates.length; i++) {
      const diff = i === 0 ? 0 : (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000;
      if (diff <= 1.5) tempStreak++;
      else break;
    }
    current = tempStreak;
  }
  
  tempStreak = 0;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000;
    if (diff <= 1.5) tempStreak++;
    else {
      longest = Math.max(longest, tempStreak);
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, tempStreak, current);
  
  return { current, longest, lastDate };
}

// ─── Gamification & Insights ───────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: number;
  isUnlocked: boolean;
}

export function getBocorHalusInsights(): string[] {
  const txs = getTransactions();
  const now = new Date();
  const thisMonth = txs.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth());
  
  const stats: Record<string, { count: number, total: number }> = {};
  thisMonth.forEach(t => {
    if (!stats[t.category]) stats[t.category] = { count: 0, total: 0 };
    stats[t.category].count++;
    stats[t.category].total += t.amount;
  });

  const insights: string[] = [];
  const income = getMonthlyIncome();

  Object.entries(stats).forEach(([cat, s]) => {
    if (s.count >= 5) {
      let msg = `Kamu sudah ${cat} sebanyak ${s.count} kali bulan ini (Total ${formatRupiah(s.total)}).`;
      if (income > 0) {
        const pct = (s.total / income) * 100;
        if (pct > 5) msg += ` Itu setara dengan ${pct.toFixed(0)}% dari pemasukanmu.`;
      }
      insights.push(msg);
    }
  });

  return insights;
}

// ─── Proactive Financial Guardian ────────────────────────────────

export interface IncomeCycle {
  lastIncomeDate: string;
  lastIncomeAmount: number;
  cycleDuration: number;
  nextIncomeEstimate: string;
}

export function getIncomeCycle(): IncomeCycle | null {
  const txs = getTransactions();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const incomes = txs.filter(t => 
    t.type === "income" && new Date(t.date) >= thirtyDaysAgo
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (incomes.length === 0) return null;
  
  const lastIncome = incomes[0];
  const lastIncomeDate = new Date(lastIncome.date);
  
  let cycleDuration = 30;
  if (incomes.length >= 2) {
    const prevIncome = incomes[1];
    const diffTime = new Date(lastIncome.date).getTime() - new Date(prevIncome.date).getTime();
    cycleDuration = Math.max(15, Math.min(35, Math.ceil(diffTime / (24 * 60 * 60 * 1000))));
  }
  
  const nextIncomeEstimate = new Date(lastIncomeDate.getTime() + cycleDuration * 24 * 60 * 60 * 1000);
  
  return {
    lastIncomeDate: lastIncome.date,
    lastIncomeAmount: lastIncome.amount,
    cycleDuration,
    nextIncomeEstimate: nextIncomeEstimate.toISOString()
  };
}

export function getWeightedMovingAverage(weightRecent: number = 3): { dailyAvg: number; weightedAvg: number; trend: "normal" | "high" | "critical" } {
  const txs = getTransactions();
  const now = new Date();
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    
    const dayTotal = txs
      .filter(t => t.type === "expense" && new Date(t.date) >= dayStart && new Date(t.date) < dayEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { date: dayStart.toISOString(), amount: dayTotal };
  });
  
  const simpleAvg = last7Days.reduce((s, d) => s + d.amount, 0) / 7;
  
  const weights = [1, 2, 3, 4, 5, 6, 7];
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const weightedSum = last7Days.reduce((s, d, i) => s + d.amount * weights[i], 0);
  const weightedAvg = weightedSum / totalWeight;
  
  let trend: "normal" | "high" | "critical" = "normal";
  if (weightedAvg > simpleAvg * 1.5) trend = "critical";
  else if (weightedAvg > simpleAvg * 1.2) trend = "high";
  
  return { dailyAvg: simpleAvg, weightedAvg, trend };
}

export interface CashFlowPrediction {
  isAtRisk: boolean;
  protectionMode: boolean;
  daysUntilEmpty: number;
  predictedEmptyDate: string;
  riskLevel: "safe" | "warning" | "danger" | "critical";
  message: string;
  affectedCategories: string[];
  cycleInfo: IncomeCycle | null;
  recommendation: string;
}

export function predictCashFlow(): CashFlowPrediction {
  const balance = getBalance();
  if (balance <= 0) {
    return {
      isAtRisk: true,
      protectionMode: true,
      daysUntilEmpty: 0,
      predictedEmptyDate: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      riskLevel: "critical",
      message: "Saldo Anda saat ini sudah habis.",
      affectedCategories: [],
      cycleInfo: null,
      recommendation: "Segera tambahkan dana untuk melanjutkan."
    };
  }
  
  const cycle = getIncomeCycle();
  const wma = getWeightedMovingAverage();
  const now = new Date();
  
  const daysInCycle = cycle?.cycleDuration || 30;
  const dayOfCycle = cycle ? Math.ceil((now.getTime() - new Date(cycle.lastIncomeDate).getTime()) / (24 * 60 * 60 * 1000)) : 15;
  const daysRemainingInCycle = Math.max(0, daysInCycle - dayOfCycle);
  
  const projectedSpending = wma.weightedAvg * daysRemainingInCycle;
  const projectedBalance = balance - projectedSpending;
  
  const daysUntilEmpty = Math.floor(balance / wma.weightedAvg);
  const emptyDate = new Date(now.getTime() + daysUntilEmpty * 24 * 60 * 60 * 1000);
  const predictedEmptyDateStr = emptyDate.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  
  let riskLevel: "safe" | "warning" | "danger" | "critical" = "safe";
  let message = "";
  let recommendation = "";
  
  const isAtRisk = daysUntilEmpty < daysRemainingInCycle || projectedBalance < 0;
  
  if (riskLevel === "safe") {
    message = "Keuangan Anda dalam keadaan aman.";
    recommendation = "Pertahankan pola pengeluaran saat ini.";
  }
  
  if (wma.trend === "critical") {
    riskLevel = "critical";
    message = `Pola pengeluaran 7 hari terakhir menunjukkan tren kritis. Rata-rata harian: ${formatRupiah(Math.round(wma.weightedAvg))}.`;
    recommendation = "Kurangi pengeluaran non-esensial sekarang.";
  } else if (wma.trend === "high") {
    riskLevel = "danger";
    message = `Pengeluaran meningkat. Rata-rata harian: ${formatRupiah(Math.round(wma.weightedAvg))}.`;
    recommendation = "Hati-hati dengan pengeluaran接下来的几天.";
  } else if (isAtRisk) {
    riskLevel = "warning";
    message = `Saldo diprediksi akan habis ${daysUntilEmpty} hari lagi, lebih cepat dari siklus ${daysInCycle} hari.`;
    recommendation = "Sesuaikan pengeluaran hingga akhir periode.";
  }
  
  const affectedCategories: string[] = [];
  if (isAtRisk || riskLevel === "danger" || riskLevel === "critical") {
    const budgets = getBudgets();
    const categorySpending = getMonthlyCategorySpending();
    
    const sortedCategories = budgets
      .map(b => ({ category: b.category, spent: categorySpending[b.category] || 0, limit: b.limit }))
      .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit));
    
    const topNonEssential = sortedCategories.find(c => c.limit > 0 && (c.spent / c.limit) > 0.5);
    if (topNonEssential) affectedCategories.push(topNonEssential.category);
  }
  
  const protectionMode = riskLevel === "critical" || (isAtRisk && daysUntilEmpty < 7);
  
  return {
    isAtRisk,
    protectionMode,
    daysUntilEmpty: Math.max(0, daysUntilEmpty),
    predictedEmptyDate: predictedEmptyDateStr,
    riskLevel,
    message,
    affectedCategories,
    cycleInfo: cycle,
    recommendation
  };
}

// ─── Achievement Tracking Helpers ─────────────────────────────────

/** Tandai bahwa user sudah membuka halaman tertentu */
export function trackPageVisit(page: string) {
  const key = `luminary_visit_${page}`;
  const existing = get<string[]>(key, []);
  const today = new Date().toDateString();
  if (!existing.includes(today)) {
    set(key, [...existing, today]);
  }
}

/** Ambil daftar tanggal kunjungan halaman */
export function getPageVisits(page: string): string[] {
  return get<string[]>(`luminary_visit_${page}`, []);
}

/** Hitung streak hari berturut-turut dari array tanggal (toDateString format) */
function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].map(d => new Date(d).getTime()).sort((a, b) => b - a);
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff = (unique[i - 1] - unique[i]) / 86400000;
    if (diff <= 1.5) streak++;
    else break;
  }
  return streak;
}

export function getAchievements(): Achievement[] {
  const txs = getTransactions();
  const savings = getLockedSavings();
  const debts = getDebts();
  const budgets = getBudgets();
  const balance = getBalance();
  const txCount = txs.length;
  const savingCount = savings.length;
  const totalSaved = savings.reduce((s, a) => s + a.savedAmount, 0);
  const paidDebtCount = debts.filter(d => d.isPaid).length;
  const savingsCompletedCount = savings.filter(s => s.targetAmount > 0 && s.savedAmount >= s.targetAmount).length;

  // Hitung pengeluaran terbesar dalam 7 hari terakhir
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekExpenses = txs.filter(t => t.type === 'expense' && new Date(t.date).getTime() >= weekAgo);
  const maxWeekExpense = weekExpenses.length > 0 ? Math.max(...weekExpenses.map(t => t.amount)) : 0;

  // Pengeluaran vs pendapatan bulan ini
  const now = new Date();
  const thisMonthTxs = txs.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthIncome = thisMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = thisMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Bocor halus: kategori dengan >= 5 transaksi bulan ini
  const catCount: Record<string, number> = {};
  thisMonthTxs.filter(t => t.type === 'expense').forEach(t => {
    catCount[t.category] = (catCount[t.category] || 0) + 1;
  });
  const hasBocorHalus = Object.values(catCount).some(c => c >= 5);

  // Streak laporan
  const reportVisits = getPageVisits('report');
  const reportStreak = calcStreak(reportVisits);

  // Streak kalender
  const calendarStreak = calcStreak(getPageVisits('calendar'));

  // Transaksi streak (1x per hari selama 7 hari berturut-turut)
  const txDates = txs.map(t => new Date(t.date).toDateString());
  const txStreak = calcStreak(txDates);

  // Dana darurat
  const hasEmergencyFund = getEmergencyFunds().length > 0;

  // Assets
  const assets = getAssets();
  const hasAssets = assets.length > 0;
  const hasAssetIncrease = assets.some(a => a.currentValue > a.purchaseValue * 1.1);

  // Budget check: 1 bulan penuh tidak ada kategori yang melebihi budget
  const categorySpending = getMonthlyCategorySpending();
  const allBudgetOk = budgets.every(b => categorySpending[b.category] <= b.limit);

  // Transaksi transfer dengan bukti (receiptImageUrl)
  const bankTxs = getBankTransactions();
  const transferWithProof = bankTxs.filter(t => t.type === 'transfer_out' && t.receiptImageUrl).length >= 10;

  // Tabungan yang dicairkan saat target tercapai
  const savingsCompleted = savings.filter(s => !s.isWithdrawn && s.savedAmount >= s.targetAmount);

  // Mode Proteksi WMA yang kembali aman
  // TODO: log perubahan status proteksi

  // Apakah pernah buka invest (ada transaksi kategori investasi ATAU pernah visit)
  const investVisits = getPageVisits('invest');
  const investCats = new Set(
    get<Category[]>(KEYS.CATEGORIES, []).filter(c => c.type === 'both').map(c => c.name)
  );
  const hasInvested = investVisits.length > 0 || txs.some(t => investCats.has(t.category));

  // Hutang lunas
  const hasPaidDebt = debts.some(d => d.isPaid);

  // Tanggal pertama kali pakai app (transaksi pertama atau member since)
  const firstTxDate = txs.length > 0
    ? new Date(txs[txs.length - 1].date).getTime()
    : Date.now();
  const daysSinceStart = (Date.now() - firstTxDate) / 86400000;

  // Semua kategori yang pernah dipakai
  const usedCategories = new Set(txs.map(t => t.category)).size;

    const list: Omit<Achievement, 'isUnlocked'>[] = [
    { id: '1',  title: 'Langkah Awal',      description: 'Catat transaksi pertama',                    emoji: '🌱', level: 1 },
    { id: '2',  title: 'Pencatat Setia',     description: 'Catat 10 transaksi',                         emoji: '✍️', level: 2 },
    { id: '3',  title: 'Pahlawan Tabungan',  description: 'Buat target tabungan pertama',               emoji: '🦸', level: 3 },
    { id: '4',  title: 'Hemat Seminggu',     description: 'Tidak ada pengeluaran > 500rb dalam 7 hari', emoji: '🛡️', level: 4 },
    { id: '5',  title: 'Kolektor Kategori',  description: 'Gunakan 5 kategori berbeda',                 emoji: '🎨', level: 5 },
    { id: '6',  title: 'Raja Budget',        description: 'Pasang anggaran untuk 3 kategori',           emoji: '👑', level: 6 },
    { id: '7',  title: 'Disiplin Tinggi',    description: 'Catat 50 transaksi',                         emoji: '⚖️', level: 7 },
    { id: '8',  title: 'Si Jutawan',         description: 'Saldo mencapai Rp1.000.000',                 emoji: '💰', level: 8 },
    { id: '9',  title: 'Anti Bocor',         description: 'Tidak ada pola bocor halus bulan ini',       emoji: '🚱', level: 9 },
    { id: '10', title: 'Master Saving',      description: 'Total tabungan mencapai Rp5.000.000',        emoji: '⛰️', level: 10 },
    { id: '11', title: 'Investasi Muda',     description: 'Buka menu Investasi',                        emoji: '📈', level: 11 },
    { id: '12', title: 'Bebas Hutang',       description: 'Selesaikan 1 catatan hutang/piutang',        emoji: '🕊️', level: 12 },
    { id: '13', title: 'Target Tercapai',    description: 'Capai 100% pada 1 target tabungan',          emoji: '🎉', level: 13 },
    { id: '14', title: 'Analis Keuangan',    description: 'Cek laporan 5 hari berturut-turut',          emoji: '🔍', level: 14 },
    { id: '15', title: 'Ekonom Handal',      description: 'Pengeluaran bulan ini < 50% pendapatan',     emoji: '📉', level: 15 },
    { id: '16', title: 'Sultan Bijak',       description: 'Saldo mencapai Rp10.000.000',                emoji: '🏰', level: 16 },
    { id: '17', title: 'Veteran Luminary',   description: 'Gunakan aplikasi selama 30 hari',            emoji: '🏅', level: 17 },
    { id: '18', title: 'Legenda Berhemat',   description: 'Gunakan aplikasi selama 90 hari',            emoji: '💎', level: 18 },
    { id: '19', title: 'Miliarder Mimpi',    description: 'Saldo mencapai Rp100.000.000',               emoji: '🪐', level: 19 },
    { id: '20', title: 'Guru Finansial',     description: 'Unlock 15 penghargaan lainnya',              emoji: '🌌', level: 20 },

    // ── Achievement Tambahan ───────────────────────────────────────
    { id: '36', title: 'Siaga Bencana',      description: 'Setup Dana Darurat pertama kali',             emoji: '🚨', level: 21 },
    { id: '37', title: 'Bebas Beban',        description: 'Melunasi satu catatan hutang/piutang penuh', emoji: '🕊️', level: 22 },
    { id: '38', title: 'Kolektor Aset',      description: 'Mencatat aset pertama di fitur Aset',         emoji: '🏦', level: 23 },
    { id: '39', title: 'Investor Muda',      description: 'Transaksi pertama kategori Investment/Both', emoji: '📈', level: 24 },
    { id: '40', title: 'Disiplin 7 Hari',    description: 'Catat transaksi 1x/hari selama 7 hari',      emoji: '🔥', level: 25 },
    { id: '41', title: 'Anti Bocor',         description: '1 bulan tanpa kategori melebihi budget',     emoji: '🛡️', level: 26 },
    { id: '42', title: 'Cuan Maksimal',      description: 'Aset mengalami kenaikan nilai > 10%',         emoji: '📈', level: 27 },
    { id: '43', title: 'Pahlawan Digital',   description: '10x transfer bank dengan bukti upload',      emoji: '💳', level: 28 },
    { id: '44', title: 'Target Tuntas',      description: 'Cairkan tabungan saat target tercapai',      emoji: '✅', level: 29 },
    { id: '45', title: 'Master Of WMA',      description: 'Kembali ke mode AMAN dari Proteksi Aktif',   emoji: '🛡️', level: 30 },

    // ── Tier tinggi (lebih banyak pencapaian) ─────────────────────
    { id: '21', title: 'Maraton Pencatatan',  description: 'Catat 100 transaksi',                         emoji: '🏃', level: 36 },
    { id: '22', title: 'Arsip Keuangan',      description: 'Catat 250 transaksi',                         emoji: '🗂️', level: 37 },
    { id: '23', title: 'Mesin Konsisten',     description: 'Catat 500 transaksi',                         emoji: '⚙️', level: 38 },
    { id: '24', title: 'Pengendali Kategori', description: 'Gunakan 12 kategori berbeda',                 emoji: '🧭', level: 39 },
    { id: '25', title: 'Budget Monster',      description: 'Pasang anggaran untuk 8 kategori',            emoji: '🧾', level: 40 },
    { id: '26', title: 'Pecah Celengan',      description: 'Total tabungan mencapai Rp20.000.000',        emoji: '🐷', level: 41 },
    { id: '27', title: 'Puncak Tabungan',     description: 'Total tabungan mencapai Rp100.000.000',       emoji: '🏔️', level: 42 },
    { id: '28', title: 'Kaya Stabil',         description: 'Saldo mencapai Rp250.000.000',                emoji: '🪙', level: 43 },
    { id: '29', title: 'Satu Miliar Pertama', description: 'Saldo mencapai Rp1.000.000.000',              emoji: '💼', level: 44 },
    { id: '30', title: 'Pelunasan Pro',       description: 'Selesaikan 5 catatan hutang/piutang',         emoji: '🧹', level: 45 },
    { id: '31', title: 'Kolektor Target',     description: 'Buat 5 target tabungan',                      emoji: '🎯', level: 46 },
    { id: '32', title: 'Komandan Target',     description: 'Capai 3 target tabungan (100%)',              emoji: '🏁', level: 47 },
    { id: '33', title: 'Analis Senior',       description: 'Cek laporan 14 hari berturut-turut',          emoji: '🧠', level: 48 },
    { id: '34', title: 'Ritual Kalender',     description: 'Buka kalender 14 hari berturut-turut',        emoji: '🗓️', level: 49 },
    { id: '35', title: 'Mentor Finansial',    description: 'Unlock 40 penghargaan lainnya',               emoji: '🧙', level: 50 },
  ];

  const results = list.map(a => {
    let unlocked = false;
    switch (a.id) {
      case '1':  unlocked = txCount >= 1; break;
      case '2':  unlocked = txCount >= 10; break;
      case '3':  unlocked = savingCount >= 1; break;
      case '4':  unlocked = weekExpenses.length > 0 && maxWeekExpense <= 500000; break;
      case '5':  unlocked = usedCategories >= 5; break;
      case '6':  unlocked = budgets.length >= 3; break;
      case '7':  unlocked = txCount >= 50; break;
      case '8':  unlocked = balance >= 1000000; break;
      case '9':  unlocked = thisMonthTxs.length > 0 && !hasBocorHalus; break;
      case '10': unlocked = totalSaved >= 5000000; break;
      case '11': unlocked = hasInvested; break;
      case '12': unlocked = hasPaidDebt; break;
      case '13': unlocked = savingsCompletedCount >= 1; break;
      case '14': unlocked = reportStreak >= 5; break;
      case '15': unlocked = monthIncome > 0 && monthExpense < monthIncome * 0.5; break;
      case '16': unlocked = balance >= 10000000; break;
      case '17': unlocked = daysSinceStart >= 30; break;
      case '18': unlocked = daysSinceStart >= 90; break;
      case '19': unlocked = balance >= 100000000; break;
      case '20': break; // dihitung setelah semua

      // ── Achievement Baru ─────────────────────────────────────────
      case '36': unlocked = hasEmergencyFund; break;
      case '37': unlocked = paidDebtCount >= 1; break;
      case '38': unlocked = hasAssets; break;
      case '39': unlocked = txs.some(t => investCats.has(t.category)); break;
      case '40': unlocked = txStreak >= 7; break;
      case '41': unlocked = budgets.length > 0 && allBudgetOk; break;
      case '42': unlocked = hasAssetIncrease; break;
      case '43': unlocked = transferWithProof; break;
      case '44': unlocked = savingsCompleted.length > 0; break;
      case '45': unlocked = false; // TODO: track WMA status change
      // ────────────────────────────────────────────────────────────

      case '21': unlocked = txCount >= 100; break;
      case '22': unlocked = txCount >= 250; break;
      case '23': unlocked = txCount >= 500; break;
      case '24': unlocked = usedCategories >= 12; break;
      case '25': unlocked = budgets.length >= 8; break;
      case '26': unlocked = totalSaved >= 20000000; break;
      case '27': unlocked = totalSaved >= 100000000; break;
      case '28': unlocked = balance >= 250000000; break;
      case '29': unlocked = balance >= 1000000000; break;
      case '30': unlocked = paidDebtCount >= 5; break;
      case '31': unlocked = savingCount >= 5; break;
      case '32': unlocked = savingsCompletedCount >= 3; break;
      case '33': unlocked = reportStreak >= 14; break;
      case '34': unlocked = calendarStreak >= 14; break;
      case '35': break; // dihitung setelah semua
    }
    return { ...a, isUnlocked: unlocked };
  });

  // Achievement meta: unlock berdasarkan jumlah penghargaan lain
  const unlockedCount = results.filter(a => a.id !== '20' && a.id !== '35' && a.isUnlocked).length;
  const guru = results.find(a => a.id === '20')!;
  guru.isUnlocked = unlockedCount >= 15;
  const mentor = results.find(a => a.id === '35')!;
  mentor.isUnlocked = unlockedCount >= 40;

  return results;
}

// ─── Assets ────────────────────────────────────────────────────────

export type AssetCategory = "properti" | "kendaraan" | "elektronik" | "investasi" | "lainnya";
export type AssetDisposalType = "dijual" | "rusak" | "habis_manfaat";

export interface AssetDisposal {
  type: AssetDisposalType;
  date: string;           // ISO
  saleValue: number;      // nilai jual (0 jika rusak/habis)
  saleDestination?: { type: "cash" | "bank"; id?: string; label?: string };
  notes: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  emoji: string;
  purchaseValue: number;   // harga beli
  currentValue: number;    // estimasi nilai sekarang
  purchaseDate: string;    // ISO
  notes: string;
  createdAt: string;
  isDisposed: boolean;
  disposal?: AssetDisposal;
}

const ASSET_KEY = "luminary_assets";

export function getAssets(): Asset[] {
  // Migrate legacy assets that don't have isDisposed field
  return get<Asset[]>(ASSET_KEY, []).map(a => ({ ...a, isDisposed: a.isDisposed ?? false }));
}

export function addAsset(asset: Omit<Asset, "id" | "createdAt" | "isDisposed" | "disposal">) {
  const assets = getAssets();
  const newAsset: Asset = { ...asset, id: crypto.randomUUID(), createdAt: new Date().toISOString(), isDisposed: false };
  assets.push(newAsset);
  set(ASSET_KEY, assets);
}

export function updateAsset(id: string, updates: Partial<Omit<Asset, "id" | "createdAt">>) {
  set(ASSET_KEY, getAssets().map(a => a.id === id ? { ...a, ...updates } : a));
}

export function disposeAsset(id: string, disposal: AssetDisposal) {
  set(ASSET_KEY, getAssets().map(a =>
    a.id === id ? { ...a, disposal, isDisposed: true, currentValue: disposal.saleValue } : a
  ));
}

export function deleteAsset(id: string) {
  set(ASSET_KEY, getAssets().filter(a => a.id !== id));
}

export function getTotalAssetValue(): number {
  return getAssets().filter(a => !a.isDisposed).reduce((sum, a) => sum + a.currentValue, 0);
}

// ─── Proactive Financial Guardian (Waspada Tanggal Tua) ────────────

export interface CategoryWMA {
  category: string;
  wmaPerDay: number;       // Weighted Moving Average pengeluaran per hari
  totalLast7Days: number;
  transactionCount: number;
}

export interface GuardianAnalysis {
  isProtectionMode: boolean;          // true jika saldo diprediksi habis sebelum siklus selesai
  projectedZeroDate: Date | null;     // kapan saldo diprediksi habis
  daysUntilZero: number | null;       // berapa hari lagi saldo habis
  daysEarlyWarning: number | null;    // berapa hari lebih cepat dari siklus normal
  cycleStartDate: Date | null;        // estimasi tanggal mulai siklus (pemasukan terakhir)
  cycleDurationDays: number;          // durasi siklus (default 30)
  nextIncomeEstimate: Date | null;    // estimasi pemasukan berikutnya
  topBorosCategory: string | null;    // kategori paling boros
  topBorosCategoryWMA: number;        // WMA per hari kategori terboros
  categoryBreakdown: CategoryWMA[];   // breakdown semua kategori
  currentBalance: number;
  warningMessage: string | null;      // pesan dinamis
  warningMessageEn: string | null;
}

/**
 * Hitung Weighted Moving Average pengeluaran per kategori.
 * Bobot: hari ke-7 (terlama) = 1, hari ke-1 (terbaru) = 7
 */
export function computeGuardianAnalysis(): GuardianAnalysis {
  const txs = getTransactions();
  const balance = getBalance();
  const now = new Date();

  // ── 1. Deteksi siklus: cari pemasukan terbesar dalam 30 hari terakhir ──
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const recentIncomes = txs.filter(t =>
    t.type === "income" && new Date(t.date) >= thirtyDaysAgo
  ).sort((a, b) => b.amount - a.amount);

  const cycleStartDate = recentIncomes.length > 0
    ? new Date(recentIncomes[0].date)
    : new Date(now.getTime() - 30 * 86400000);

  const cycleDurationDays = 30;
  const nextIncomeEstimate = new Date(cycleStartDate.getTime() + cycleDurationDays * 86400000);
  const remainingCycleDays = Math.max(1,
    Math.ceil((nextIncomeEstimate.getTime() - now.getTime()) / 86400000)
  );

  // ── 2. WMA per kategori (7 hari terakhir, bobot terbaru lebih tinggi) ──
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const last7Expenses = txs.filter(t =>
    t.type === "expense" && new Date(t.date) >= sevenDaysAgo
  );

  // Kelompokkan per kategori per hari
  const catDayMap: Record<string, Record<number, number>> = {};
  last7Expenses.forEach(t => {
    const daysAgo = Math.floor((now.getTime() - new Date(t.date).getTime()) / 86400000);
    const dayIdx = Math.min(daysAgo, 6); // 0 = hari ini, 6 = 7 hari lalu
    if (!catDayMap[t.category]) catDayMap[t.category] = {};
    catDayMap[t.category][dayIdx] = (catDayMap[t.category][dayIdx] || 0) + t.amount;
  });

  // Bobot: hari terbaru (idx 0) = 7, hari terlama (idx 6) = 1
  const weights = [7, 6, 5, 4, 3, 2, 1];
  const totalWeight = weights.reduce((s, w) => s + w, 0); // 28

  const categoryBreakdown: CategoryWMA[] = Object.entries(catDayMap).map(([cat, dayData]) => {
    let weightedSum = 0;
    let totalLast7 = 0;
    let count = 0;
    for (let d = 0; d <= 6; d++) {
      const amt = dayData[d] || 0;
      weightedSum += amt * weights[d];
      totalLast7 += amt;
      if (amt > 0) count++;
    }
    const wmaPerDay = weightedSum / totalWeight;
    return { category: cat, wmaPerDay, totalLast7Days: totalLast7, transactionCount: count };
  }).sort((a, b) => b.wmaPerDay - a.wmaPerDay);

  // ── 3. Total WMA semua kategori → proyeksi saldo ──
  const totalWMAPerDay = categoryBreakdown.reduce((s, c) => s + c.wmaPerDay, 0);
  const projectedBalance = balance - (totalWMAPerDay * remainingCycleDays);

  let daysUntilZero: number | null = null;
  let projectedZeroDate: Date | null = null;
  let daysEarlyWarning: number | null = null;

  if (totalWMAPerDay > 0 && balance > 0) {
    daysUntilZero = Math.floor(balance / totalWMAPerDay);
    projectedZeroDate = new Date(now.getTime() + daysUntilZero * 86400000);
    // Berapa hari lebih cepat dari siklus normal
    if (projectedZeroDate < nextIncomeEstimate) {
      daysEarlyWarning = Math.ceil(
        (nextIncomeEstimate.getTime() - projectedZeroDate.getTime()) / 86400000
      );
    }
  }

  const isProtectionMode = projectedBalance < 0 && daysEarlyWarning !== null && daysEarlyWarning > 0;
  // Fallback: jika saldo sudah negatif atau habis dalam 3 hari, tetap aktifkan
  const isEffectiveProtection = isProtectionMode ||
    (balance > 0 && daysUntilZero !== null && daysUntilZero <= 3) ||
    balance <= 0;
  const topBorosCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : null;
  const topBorosCategoryWMA = categoryBreakdown.length > 0 ? categoryBreakdown[0].wmaPerDay : 0;

  // ── 4. Pesan dinamis ──
  let warningMessage: string | null = null;
  let warningMessageEn: string | null = null;

  if (isEffectiveProtection && topBorosCategory && (daysEarlyWarning ?? 0) > 0) {
    warningMessage = `Analisis pengeluaran pada label "${topBorosCategory}" menunjukkan lonjakan signifikan. Dana Anda diprediksi akan habis ${daysEarlyWarning} hari lebih cepat dari siklus biasanya. Pertimbangkan untuk mengurangi pengeluaran pada kategori ini.`;
    warningMessageEn = `Spending analysis on "${topBorosCategory}" shows a significant spike. Your balance is predicted to run out ${daysEarlyWarning} days earlier than your usual cycle. Consider reducing spending in this category.`;
  } else if (daysUntilZero !== null && daysUntilZero <= 7 && daysUntilZero > 0) {
    warningMessage = `Saldo Anda diprediksi akan habis dalam ${daysUntilZero} hari berdasarkan pola pengeluaran saat ini.`;
    warningMessageEn = `Your balance is predicted to run out in ${daysUntilZero} days based on current spending patterns.`;
  }

  return {
    isProtectionMode: isEffectiveProtection,
    projectedZeroDate,
    daysUntilZero,
    daysEarlyWarning,
    cycleStartDate,
    cycleDurationDays,
    nextIncomeEstimate,
    topBorosCategory,
    topBorosCategoryWMA,
    categoryBreakdown,
    currentBalance: balance,
    warningMessage,
    warningMessageEn,
  };
}

// ─── Bank Simulation (Simulasi Rekening Bank) ──────────────────────

export interface BankAccount {
  id: string;
  bankName: string;       // nama bank (BCA, Mandiri, dll)
  accountNumber: string;  // nomor rekening
  ownerName: string;      // nama pemilik
  type: "Tabungan" | "Giro" | "Deposito";
  color: string;
  balance: number;        // saldo simulasi
  createdAt: string;
}

export interface TransferContact {
  id: string;
  name: string;           // nama penerima
  bankName: string;
  accountNumber: string;
  lastUsed: string;       // ISO
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;  // dari bank mana
  type: "debit" | "credit" | "transfer_out" | "transfer_in";
  amount: number;
  adminFee: number;       // biaya admin (0 jika tidak ada)
  category: string;
  notes: string;
  paymentMethod: "cash" | string; // "cash" atau bankAccountId
  receiptImageUrl?: string;       // foto bukti pembayaran (base64)
  /**
   * Link ke transaksi utama (History).
   * Optional supaya data lama tetap valid.
   */
  relatedTransactionId?: string;
  // Transfer fields
  transferToAccountId?: string;   // jika transfer antar bank sendiri
  transferToContactId?: string;   // jika transfer ke orang lain
  transferToName?: string;        // nama penerima
  transferToBank?: string;        // bank penerima
  transferToNumber?: string;      // nomor rekening penerima
  date: string;                   // ISO
  createdAt: string;
}

const BANK_ACCOUNTS_KEY = "luminary_bank_accounts";
const BANK_TRANSACTIONS_KEY = "luminary_bank_transactions";
const TRANSFER_CONTACTS_KEY = "luminary_transfer_contacts";

// ── Bank Accounts ──────────────────────────────────────────────────

export function getBankAccounts(): BankAccount[] {
  try {
    const raw = localStorage.getItem(BANK_ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw) as BankAccount[];
  } catch { /* ignore */ }
  return [];
}

function saveBankAccountsDB(accounts: BankAccount[]) {
  localStorage.setItem(BANK_ACCOUNTS_KEY, JSON.stringify(accounts));
  window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: BANK_ACCOUNTS_KEY } }));
}

export function addBankAccount(account: Omit<BankAccount, "id" | "createdAt">) {
  const accounts = getBankAccounts();
  const newAcc: BankAccount = {
    ...account,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  accounts.push(newAcc);
  saveBankAccountsDB(accounts);
  return newAcc;
}

export function updateBankAccount(id: string, updates: Partial<Omit<BankAccount, "id" | "createdAt">>) {
  saveBankAccountsDB(getBankAccounts().map(a => a.id === id ? { ...a, ...updates } : a));
}

export function deleteBankAccount(id: string) {
  saveBankAccountsDB(getBankAccounts().filter(a => a.id !== id));
}

// ── Bank Transactions ──────────────────────────────────────────────

export function getBankTransactions(bankAccountId?: string): BankTransaction[] {
  try {
    const raw = localStorage.getItem(BANK_TRANSACTIONS_KEY);
    const all = raw ? JSON.parse(raw) as BankTransaction[] : [];
    return bankAccountId ? all.filter(t => t.bankAccountId === bankAccountId) : all;
  } catch { return []; }
}

export function addBankTransaction(tx: Omit<BankTransaction, "id" | "createdAt">) {
  const all = getBankTransactions();
  const newTx: BankTransaction = { ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.unshift(newTx);
  localStorage.setItem(BANK_TRANSACTIONS_KEY, JSON.stringify(all));

  // Update saldo bank
  const accounts = getBankAccounts();
  const totalFee = tx.adminFee || 0;

  if (tx.type === "credit") {
    saveBankAccountsDB(accounts.map(a =>
      a.id === tx.bankAccountId ? { ...a, balance: a.balance + tx.amount } : a
    ));
  } else if (tx.type === "debit") {
    saveBankAccountsDB(accounts.map(a =>
      a.id === tx.bankAccountId ? { ...a, balance: a.balance - tx.amount - totalFee } : a
    ));
  } else if (tx.type === "transfer_out") {
    // Kurangi dari bank asal
    const updated = accounts.map(a =>
      a.id === tx.bankAccountId ? { ...a, balance: a.balance - tx.amount - totalFee } : a
    );
    // Tambah ke bank tujuan (jika transfer antar bank sendiri)
    if (tx.transferToAccountId) {
      saveBankAccountsDB(updated.map(a =>
        a.id === tx.transferToAccountId ? { ...a, balance: a.balance + tx.amount } : a
      ));
    } else {
      saveBankAccountsDB(updated);
    }
  }

  window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: BANK_TRANSACTIONS_KEY } }));
  return newTx;
}

export function deleteBankTransaction(id: string) {
  const all = getBankTransactions();
  const tx = all.find(t => t.id === id);
  if (!tx) return;

  // Reverse saldo
  const accounts = getBankAccounts();
  const totalFee = tx.adminFee || 0;
  if (tx.type === "credit") {
    saveBankAccountsDB(accounts.map(a =>
      a.id === tx.bankAccountId ? { ...a, balance: a.balance - tx.amount } : a
    ));
  } else if (tx.type === "debit") {
    saveBankAccountsDB(accounts.map(a =>
      a.id === tx.bankAccountId ? { ...a, balance: a.balance + tx.amount + totalFee } : a
    ));
  } else if (tx.type === "transfer_out") {
    const updated = accounts.map(a =>
      a.id === tx.bankAccountId ? { ...a, balance: a.balance + tx.amount + totalFee } : a
    );
    if (tx.transferToAccountId) {
      saveBankAccountsDB(updated.map(a =>
        a.id === tx.transferToAccountId ? { ...a, balance: a.balance - tx.amount } : a
      ));
    } else {
      saveBankAccountsDB(updated);
    }
  }

  localStorage.setItem(BANK_TRANSACTIONS_KEY, JSON.stringify(all.filter(t => t.id !== id)));
  window.dispatchEvent(new CustomEvent("luminary_data_change", { detail: { key: BANK_TRANSACTIONS_KEY } }));
}

// ── Transfer Contacts ──────────────────────────────────────────────

export function getTransferContacts(): TransferContact[] {
  try {
    const raw = localStorage.getItem(TRANSFER_CONTACTS_KEY);
    return raw ? JSON.parse(raw) as TransferContact[] : [];
  } catch { return []; }
}

export function upsertTransferContact(contact: Omit<TransferContact, "id" | "lastUsed">) {
  const contacts = getTransferContacts();
  const existing = contacts.find(
    c => c.accountNumber === contact.accountNumber && c.bankName === contact.bankName
  );
  if (existing) {
    const updated = contacts.map(c =>
      c.id === existing.id ? { ...c, ...contact, lastUsed: new Date().toISOString() } : c
    );
    localStorage.setItem(TRANSFER_CONTACTS_KEY, JSON.stringify(updated));
    return existing.id;
  } else {
    const newContact: TransferContact = {
      ...contact,
      id: crypto.randomUUID(),
      lastUsed: new Date().toISOString(),
    };
    localStorage.setItem(TRANSFER_CONTACTS_KEY, JSON.stringify([...contacts, newContact]));
    return newContact.id;
  }
}

export function deleteTransferContact(id: string) {
  localStorage.setItem(
    TRANSFER_CONTACTS_KEY,
    JSON.stringify(getTransferContacts().filter(c => c.id !== id))
  );
}

// ─── Notification History ───────────────────────────────────────

const NOTIF_HISTORY_KEY = "luminary_notif_history";
const MAX_NOTIF_HISTORY = 100;

export interface NotifHistoryItem {
  id: string;
  type: string;
  title: string;
  message: string;
  emoji?: string;
  createdAt: string;
  isRead: boolean;
}

export function getNotifHistory(): NotifHistoryItem[] {
  return get<NotifHistoryItem[]>(NOTIF_HISTORY_KEY, []);
}

export function addNotifToHistory(item: Omit<NotifHistoryItem, "id" | "createdAt" | "isRead">) {
  const history = getNotifHistory();
  const newItem: NotifHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  const updated = [newItem, ...history].slice(0, MAX_NOTIF_HISTORY);
  set(NOTIF_HISTORY_KEY, updated);
}

export function markNotifAsRead(id: string) {
  const history = getNotifHistory();
  const updated = history.map(n => n.id === id ? { ...n, isRead: true } : n);
  set(NOTIF_HISTORY_KEY, updated);
}

export function markAllNotifsAsRead() {
  const history = getNotifHistory();
  const updated = history.map(n => ({ ...n, isRead: true }));
  set(NOTIF_HISTORY_KEY, updated);
}

export function clearNotifHistory() {
  set(NOTIF_HISTORY_KEY, []);
}

export function getUnreadNotifCount(): number {
  return getNotifHistory().filter(n => !n.isRead).length;
}

// Run migrations/backfills
backfillHistoryOnce();

// ═══════════════════════════════════════════════════════════════════
// ─── THE DISCIPLINE MASTER (Credit Reputation System) ──────────────
// ═══════════════════════════════════════════════════════════════════

const DISCIPLINE_KEY = "luminary_discipline";

/** Riwayat satu pelanggaran penarikan paksa dana darurat */
export interface WithdrawalStrike {
  id: string;
  fundName: string;
  reason: string;
  amount: number;
  createdAt: string; // ISO
}

export interface DisciplineState {
  financialScore: number;             // 0–100, reputasi keuangan
  // 5-Strike Rule
  withdrawalStrikes: WithdrawalStrike[];  // riwayat pelanggaran penarikan
  coolingOffUntil: string | null;     // ISO — null = tidak dalam cooling-off
  // Budget
  budgetViolationCount: number;
  lastBudgetViolationMonth: string;   // "YYYY-MM"
  // Stats
  totalForcedWithdrawals: number;     // total penarikan paksa sepanjang masa
}

const DEFAULT_DISCIPLINE: DisciplineState = {
  financialScore: 100,
  withdrawalStrikes: [],
  coolingOffUntil: null,
  budgetViolationCount: 0,
  lastBudgetViolationMonth: "",
  totalForcedWithdrawals: 0,
};

export function getDisciplineState(): DisciplineState {
  const raw = get<Partial<DisciplineState>>(DISCIPLINE_KEY, {});
  return {
    ...DEFAULT_DISCIPLINE,
    ...raw,
    withdrawalStrikes: raw.withdrawalStrikes ?? [],
  };
}

function saveDisciplineState(state: DisciplineState) {
  set(DISCIPLINE_KEY, state);
}

/** Apakah user sedang dalam cooling-off period? */
export function isInvestFrozen(): boolean {
  const state = getDisciplineState();
  if (!state.coolingOffUntil) return false;
  return new Date(state.coolingOffUntil) > new Date();
}

/** Sisa jam cooling-off */
export function getInvestFreezeHoursLeft(): number {
  const state = getDisciplineState();
  if (!state.coolingOffUntil) return 0;
  const diff = new Date(state.coolingOffUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 3600000));
}

/** Apakah user dalam skor kritis (<40)? */
export function isExtremeSavingMode(): boolean {
  return getDisciplineState().financialScore < 40;
}

/** Jumlah strike aktif (pelanggaran penarikan paksa) */
export function getWithdrawalStrikeCount(): number {
  return getDisciplineState().withdrawalStrikes.length;
}

/** Label skor finansial */
export function getFinancialScoreLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: "Sehat", color: "#4edea3", emoji: "💚" };
  if (score >= 60) return { label: "Waspada", color: "#fbbf24", emoji: "⚠️" };
  if (score >= 40) return { label: "Bahaya", color: "#fb923c", emoji: "🔶" };
  return { label: "Kritis", color: "#ef4444", emoji: "🔴" };
}

/**
 * PENALTI PENARIKAN PAKSA — 5-Strike Rule.
 * Strike 1–4 : skor -20, tidak ada pembekuan.
 * Strike ke-5+: skor -20 + cooling-off 5 hari.
 * Tidak ada Shadow Debt, tidak ada pemotongan pemasukan.
 */
export function applyForcedWithdrawalPenalty(
  amount: number,
  fundName: string,
  reason: string
): { strikeCount: number; coolingOffApplied: boolean } {
  const state = getDisciplineState();

  const strike: WithdrawalStrike = {
    id: crypto.randomUUID(),
    fundName,
    reason,
    amount,
    createdAt: new Date().toISOString(),
  };

  const newStrikes = [...state.withdrawalStrikes, strike];
  const strikeCount = newStrikes.length;
  const newScore = Math.max(0, state.financialScore - 20);

  // Strike ke-5 atau lebih → cooling-off 5 hari
  const coolingOffApplied = strikeCount >= 5;
  const coolingOffUntil = coolingOffApplied
    ? new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString()
    : state.coolingOffUntil;

  saveDisciplineState({
    ...state,
    financialScore: newScore,
    withdrawalStrikes: newStrikes,
    coolingOffUntil,
    totalForcedWithdrawals: state.totalForcedWithdrawals + 1,
  });

  return { strikeCount, coolingOffApplied };
}

/**
 * AUTO-UNLOCK — dipanggil saat user top-up dana darurat.
 * Jika saldo dana darurat mencapai ≥70% target, hapus cooling-off.
 */
export function checkAndAutoUnlockCoolingOff(savedAmount: number, targetAmount: number): boolean {
  const state = getDisciplineState();
  if (!state.coolingOffUntil) return false;
  if (new Date(state.coolingOffUntil) <= new Date()) return false; // sudah expired sendiri
  if (targetAmount <= 0) return false;

  const pct = (savedAmount / targetAmount) * 100;
  if (pct >= 70) {
    saveDisciplineState({ ...state, coolingOffUntil: null });
    return true; // auto-unlock berhasil
  }
  return false;
}

/**
 * MODAL EXIT — dipanggil saat dana darurat 100% tercapai dan user memilih
 * mencairkan sebagai modal usaha/investasi. Tidak ada penalti poin.
 */
export function applyModalExitReward() {
  const state = getDisciplineState();
  // Bersihkan strikes dan beri bonus skor
  saveDisciplineState({
    ...state,
    financialScore: Math.min(100, state.financialScore + 10),
    withdrawalStrikes: [],
    coolingOffUntil: null,
  });
}

/**
 * PENALTI BUDGET — dipanggil saat user melanggar budget kategori.
 */
export function applyBudgetViolationPenalty() {
  const state = getDisciplineState();
  const thisMonth = new Date().toISOString().slice(0, 7);
  const isNewMonth = state.lastBudgetViolationMonth !== thisMonth;
  const newCount = isNewMonth ? 1 : state.budgetViolationCount + 1;
  const newScore = Math.max(0, state.financialScore - 5);

  saveDisciplineState({
    ...state,
    financialScore: newScore,
    budgetViolationCount: newCount,
    lastBudgetViolationMonth: thisMonth,
  });
}

/**
 * NAIKKAN SKOR — dipanggil saat user berhasil menabung / top-up dana darurat.
 */
export function applyDisciplineReward(type: "topup_emergency" | "savings_goal" | "budget_ok") {
  const state = getDisciplineState();
  const gain = type === "topup_emergency" ? 3 : type === "savings_goal" ? 5 : 2;
  saveDisciplineState({
    ...state,
    financialScore: Math.min(100, state.financialScore + gain),
  });
}

/**
 * RESET SKOR BULANAN — naikkan skor +5 setiap awal bulan jika tidak ada pelanggaran.
 */
export function applyMonthlyScoreRecovery() {
  const state = getDisciplineState();
  const thisMonth = new Date().toISOString().slice(0, 7);
  if (state.lastBudgetViolationMonth === thisMonth) return;
  saveDisciplineState({
    ...state,
    financialScore: Math.min(100, state.financialScore + 5),
  });
}

/** @deprecated — Shadow Debt dihapus. Fungsi ini tidak melakukan apa-apa, hanya untuk backward compat. */
export function processIncomeForShadowDebt(_incomeAmount: number): { deducted: number; message: string | null } {
  return { deducted: 0, message: null };
}

/** @deprecated — Shadow Debt dihapus. */
export function getTotalShadowDebt(): number {
  return 0;
}
