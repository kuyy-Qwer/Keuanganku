import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useLang } from '../../i18n';
import { addBankAccount, setCashWalletBalance, addTransaction } from '../../store/database';

export default function WalletSetupPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;

  const [cashBalance, setCashBalance] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCurrency = (v: string) => (v ? Number(v).toLocaleString('id-ID') : '');
  const parseCurrency = (v: string) => v.replace(/[^\d]/g, '');

  const handleNext = () => {
    const nextErrors: Record<string, string> = {};
    if (bankName.trim()) {
      if (!bankAccountNumber.trim()) nextErrors.bankAccountNumber = L('Nomor rekening wajib diisi', 'Account number is required');
      if (!bankAccountName.trim()) nextErrors.bankAccountName = L('Nama pemilik wajib diisi', 'Account holder name is required');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const initialCash = Number(cashBalance || '0');
    setCashWalletBalance(initialCash);

    // Catat saldo awal sebagai transaksi pemasukan
    if (initialCash > 0) {
      addTransaction({
        amount: initialCash,
        category: 'Saldo Awal',
        notes: L('Saldo awal dari setup onboarding', 'Initial balance from onboarding setup'),
        type: 'income',
        date: new Date().toISOString(),
        paymentSource: { type: 'cash', label: 'Cash' },
      });
    }

    if (bankName.trim()) {
      addBankAccount({
        bankName: bankName.trim(),
        accountNumber: bankAccountNumber.trim(),
        ownerName: bankAccountName.trim(),
        type: 'Tabungan',
        color: '#10B981',
        balance: 0,
      });
    }

    localStorage.setItem('wallet_setup', JSON.stringify({
      cashBalance: initialCash,
      bank: bankName.trim() ? { name: bankName.trim(), accountNumber: bankAccountNumber.trim(), accountName: bankAccountName.trim() } : null,
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem('onboarding_step', 'tutorial');
    navigate('/onboarding/tutorial');
  };

  const quickAmounts = ['50000', '100000', '500000', '1000000'];

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: 'var(--app-bg)' }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="absolute -left-16 top-0 h-52 w-52 rounded-full blur-3xl"
          style={{ background: 'rgba(78,222,163,0.18)' }}
          animate={{ x: [0, 10, 0], y: [0, 14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute right-[-60px] top-32 h-44 w-44 rounded-full blur-3xl"
          style={{ background: 'rgba(0,180,162,0.14)' }}
          animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-6 pt-10">

        {/* Back */}
        <button
          onClick={() => navigate('/onboarding/profile')}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border self-start"
          style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress indicator */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="h-1.5 flex-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(78,222,163,0.12)' }}>
              {s <= 3 && (
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #4edea3, #00b4a2)' }}
                  initial={{ width: 0 }} animate={{ width: '100%' }}
                  transition={{ duration: 0.4, delay: s * 0.1 }} />
              )}
            </div>
          ))}
          <span className="text-xs font-semibold ml-1" style={{ color: 'var(--app-text2)' }}>3/4</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 text-center"
        >
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-[20px]"
            style={{ background: 'linear-gradient(135deg, #4edea3, #00b4a2)', boxShadow: '0 12px 32px rgba(78,222,163,0.3)' }}>
            <span className="text-3xl">💰</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] font-black text-[26px] mb-2" style={{ color: 'var(--app-text)' }}>
            {L('Mulai dengan Uang Anda', 'Start with Your Money')}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
            {L('Masukkan saldo awal agar dashboard langsung hidup dengan data Anda.', 'Enter your starting balance so your dashboard comes alive immediately.')}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col flex-1 gap-4"
        >
              {/* Cash input */}
              <div className="rounded-[24px] p-5"
                style={{ background: 'linear-gradient(135deg, rgba(78,222,163,0.1), rgba(0,180,162,0.05))', border: '1px solid rgba(78,222,163,0.2)' }}>
                <p className="text-sm font-semibold mb-3 text-center" style={{ color: 'var(--app-text)' }}>
                  💵 {L('Saldo Cash Awal', 'Starting Cash Balance')}
                </p>

                {/* Big input */}
                <div className="relative mb-3">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'var(--app-text2)' }}>Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(cashBalance)}
                    onChange={(e) => setCashBalance(parseCurrency(e.target.value))}
                    className="w-full rounded-[20px] border py-4 pl-14 pr-5 font-bold outline-none transition-all text-center"
                    style={{
                      backgroundColor: 'var(--app-card)',
                      color: 'var(--app-text)',
                      borderColor: 'rgba(78,222,163,0.3)',
                      fontSize: '26px',
                      letterSpacing: '0.5px',
                    }}
                    placeholder="0"
                  />
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashBalance(amt)}
                      className="rounded-[14px] border py-2 text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                      style={{
                        backgroundColor: cashBalance === amt ? 'rgba(78,222,163,0.15)' : 'var(--app-card)',
                        color: cashBalance === amt ? '#169b6d' : 'var(--app-text)',
                        borderColor: cashBalance === amt ? '#4edea3' : 'var(--app-border)',
                      }}
                    >
                      {Number(amt) >= 1000000 ? `${Number(amt) / 1000000}jt` : `${Number(amt) / 1000}rb`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank section */}
              <div className="rounded-[24px] p-5"
                style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                    🏦 {L('Rekening Bank', 'Bank Account')}
                  </p>
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: 'rgba(78,222,163,0.12)', color: '#169b6d' }}>
                    {L('Opsional', 'Optional')}
                  </span>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-[16px] border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: 'var(--app-border)' }}
                    placeholder={L('Nama Bank (BCA, Mandiri, BNI...)', 'Bank Name (BCA, Mandiri, BNI...)')}
                  />

                  <AnimatePresence>
                    {bankName.trim() && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-3 overflow-hidden"
                      >
                        <div>
                          <input
                            type="text"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                            className="w-full rounded-[16px] border px-4 py-3 text-sm outline-none"
                            style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.bankAccountNumber ? '#ef4444' : 'var(--app-border)' }}
                            placeholder={L('No. Rekening', 'Account No.')}
                          />
                          {errors.bankAccountNumber && <p className="mt-1 text-xs text-red-500">{errors.bankAccountNumber}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={bankAccountName}
                            onChange={(e) => setBankAccountName(e.target.value)}
                            className="w-full rounded-[16px] border px-4 py-3 text-sm outline-none"
                            style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.bankAccountName ? '#ef4444' : 'var(--app-border)' }}
                            placeholder={L('Nama Pemilik', 'Account Holder')}
                          />
                          {errors.bankAccountName && <p className="mt-1 text-xs text-red-500">{errors.bankAccountName}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex-1" />

              {/* CTA */}
              <div className="rounded-[24px] border p-4"
                style={{ background: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
                <button
                  onClick={handleNext}
                  className="w-full rounded-[20px] py-4 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
                    color: '#083626',
                    boxShadow: '0 12px 32px rgba(78,222,163,0.3)',
                  }}
                >
                  {cashBalance
                    ? L(`Lanjut dengan Rp${formatCurrency(cashBalance)} →`, `Continue with Rp${formatCurrency(cashBalance)} →`)
                    : L('Lanjut tanpa saldo →', 'Continue without balance →')}
                </button>
              </div>
        </motion.div>
      </div>
    </div>
  );
}
