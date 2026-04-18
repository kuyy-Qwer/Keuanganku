import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLang } from '../../i18n';
import { addBankAccount, setCashWalletBalance } from '../../store/database';
import OnboardingShell from './OnboardingShell';

export default function WalletSetupPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;

  const [walletData, setWalletData] = useState({
    cashBalance: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!walletData.cashBalance.trim()) {
      nextErrors.cashBalance = L('Saldo cash wajib diisi', 'Cash balance is required');
    } else if (Number(walletData.cashBalance) < 0) {
      nextErrors.cashBalance = L('Saldo cash tidak boleh minus', 'Cash balance cannot be negative');
    }

    if (walletData.bankName.trim()) {
      if (!walletData.bankAccountNumber.trim()) {
        nextErrors.bankAccountNumber = L('Nomor rekening wajib diisi jika nama bank diisi', 'Account number is required when bank name is filled');
      }
      if (!walletData.bankAccountName.trim()) {
        nextErrors.bankAccountName = L('Nama pemilik wajib diisi jika bank dipakai', 'Account holder name is required when bank is used');
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setWalletData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }));
    }
  };

  const handleCashBalanceChange = (value: string) => {
    handleInputChange('cashBalance', value.replace(/[^\d]/g, ''));
  };

  const formatCurrency = (value: string) => value ? Number(value).toLocaleString('id-ID') : '';

  const handleNext = () => {
    if (!validateForm()) return;

    const initialCash = Number(walletData.cashBalance || '0');
    setCashWalletBalance(initialCash);

    if (walletData.bankName.trim()) {
      addBankAccount({
        bankName: walletData.bankName.trim(),
        accountNumber: walletData.bankAccountNumber.trim(),
        ownerName: walletData.bankAccountName.trim(),
        type: 'Tabungan',
        color: '#10B981',
        balance: 0,
      });
    }

    localStorage.setItem('wallet_setup', JSON.stringify({
      cashBalance: initialCash,
      bank: walletData.bankName.trim() ? {
        name: walletData.bankName.trim(),
        accountNumber: walletData.bankAccountNumber.trim(),
        accountName: walletData.bankAccountName.trim(),
      } : null,
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem('onboarding_step', 'tutorial');
    navigate('/onboarding/tutorial');
  };

  return (
    <OnboardingShell
      title={L('Atur dompet awal', 'Set up your starting wallet')}
      subtitle={L('Masukkan saldo cash awal dan rekening bank utama supaya dashboard pertama Anda langsung terisi.', 'Enter your starting cash and main bank account so your first dashboard already has context.')}
      step={3}
      totalSteps={4}
      onBack={() => navigate('/onboarding/profile')}
      footer={(
        <button
          onClick={handleNext}
          className="w-full rounded-[24px] py-4 font-semibold text-[#083626] shadow-[0_18px_40px_rgba(78,222,163,0.28)] transition-all"
          style={{ backgroundColor: '#4edea3' }}
        >
          {L('Simpan dompet dan lanjut', 'Save wallet and continue')}
        </button>
      )}
    >
      <div className="space-y-4 pb-2">
        <div className="rounded-[28px] border p-5" style={{ background: 'linear-gradient(135deg, rgba(78,222,163,0.16) 0%, rgba(78,222,163,0.04) 100%)', borderColor: 'rgba(78,222,163,0.24)' }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] p-4" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--app-text2)' }}>{L('Cash', 'Cash')}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text)' }}>{L('Dipakai untuk saldo tunai harian.', 'Used for your daily cash balance.')}</p>
            </div>
            <div className="rounded-[22px] p-4" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--app-text2)' }}>{L('Bank', 'Bank')}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text)' }}>{L('Opsional, tapi membantu saat mulai simulasi rekening.', 'Optional, but useful when you start simulating bank accounts.')}</p>
            </div>
            <div className="rounded-[22px] p-4" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--app-text2)' }}>{L('Fleksibel', 'Flexible')}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text)' }}>{L('Semua data ini bisa diubah lagi setelah onboarding selesai.', 'All of this can still be edited after onboarding.')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border p-5" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Saldo cash awal', 'Initial cash balance')} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--app-text2)' }}>Rp</span>
                <input
                  type="text"
                  value={formatCurrency(walletData.cashBalance)}
                  onChange={(e) => handleCashBalanceChange(e.target.value)}
                  className="w-full rounded-[20px] border py-3 pl-12 pr-4 text-sm outline-none transition-all"
                  style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.cashBalance ? '#ef4444' : 'var(--app-border)' }}
                  placeholder="0"
                />
              </div>
              {errors.cashBalance ? <p className="mt-1 text-xs text-red-500">{errors.cashBalance}</p> : null}
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                {L('Ini akan dipakai sebagai saldo tunai awal pada dashboard Anda.', 'This becomes the starting cash balance on your dashboard.')}
              </p>
            </div>

            <div className="rounded-[24px] p-4" style={{ backgroundColor: 'var(--app-card2)' }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{L('Rekening bank utama', 'Primary bank account')}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                    {L('Bagian ini opsional. Isi jika Anda ingin langsung punya akun bank saat pertama masuk app.', 'This section is optional. Fill it if you want a bank account ready from your first app session.')}
                  </p>
                </div>
                <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ backgroundColor: 'rgba(78,222,163,0.14)', color: '#169b6d' }}>
                  {L('Opsional', 'Optional')}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Nama bank', 'Bank name')}</label>
                  <input
                    type="text"
                    value={walletData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full rounded-[20px] border px-4 py-3 text-sm outline-none transition-all"
                    style={{ backgroundColor: 'var(--app-card)', color: 'var(--app-text)', borderColor: 'var(--app-border)' }}
                    placeholder={L('Contoh: BCA, Mandiri, BNI', 'Example: BCA, Mandiri, BNI')}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Nomor rekening', 'Account number')}</label>
                    <input
                      type="text"
                      value={walletData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      className="w-full rounded-[20px] border px-4 py-3 text-sm outline-none transition-all"
                      style={{ backgroundColor: 'var(--app-card)', color: 'var(--app-text)', borderColor: errors.bankAccountNumber ? '#ef4444' : 'var(--app-border)' }}
                      placeholder="1234567890"
                      disabled={!walletData.bankName.trim()}
                    />
                    {errors.bankAccountNumber ? <p className="mt-1 text-xs text-red-500">{errors.bankAccountNumber}</p> : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Nama pemilik', 'Account holder')}</label>
                    <input
                      type="text"
                      value={walletData.bankAccountName}
                      onChange={(e) => handleInputChange('bankAccountName', e.target.value)}
                      className="w-full rounded-[20px] border px-4 py-3 text-sm outline-none transition-all"
                      style={{ backgroundColor: 'var(--app-card)', color: 'var(--app-text)', borderColor: errors.bankAccountName ? '#ef4444' : 'var(--app-border)' }}
                      placeholder={L('Nama sesuai rekening', 'Name on the account')}
                      disabled={!walletData.bankName.trim()}
                    />
                    {errors.bankAccountName ? <p className="mt-1 text-xs text-red-500">{errors.bankAccountName}</p> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border p-4" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{L('Yang akan terjadi setelah ini', 'What happens next')}</p>
              <div className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                <p>{L('Saldo awal akan langsung muncul di dashboard dan wallet.', 'Your opening balance will appear immediately on the dashboard and wallet.')}</p>
                <p>{L('Jika Anda mengisi bank, akun bank baru akan dibuat dengan saldo awal 0 supaya bisa dipakai untuk simulasi berikutnya.', 'If you add a bank, a new bank account will be created with a starting balance of 0 for later simulations.')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
