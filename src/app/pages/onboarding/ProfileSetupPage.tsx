import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLang } from '../../i18n';
import { getSettings, getUser, saveSettings, saveUser } from '../../store/database';
import OnboardingShell from './OnboardingShell';
import { validatePinStrength } from '../../lib/pinSecurity';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;
  const user = getUser();
  const settings = getSettings();

  const [profile, setProfile] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    birthDate: user.dob || '',
    gender: '',
    occupation: user.address || '',
    language: ((settings.language as 'id' | 'en') || 'id') as 'id' | 'en',
    pin: '',
    confirmPin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!profile.fullName.trim()) nextErrors.fullName = L('Nama lengkap wajib diisi', 'Full name is required');
    if (!profile.email.trim()) {
      nextErrors.email = L('Email wajib diisi', 'Email is required');
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      nextErrors.email = L('Format email belum valid', 'Email format is invalid');
    }

    if (!profile.phone.trim()) {
      nextErrors.phone = L('Nomor telepon wajib diisi', 'Phone number is required');
    } else {
      // Format Indonesia: +62 atau 08xx, minimal 10 digit
      const cleaned = profile.phone.replace(/[\s-]/g, '');
      const isValidFormat = /^(\+62|62|0)8\d{8,11}$/.test(cleaned);
      if (!isValidFormat) {
        nextErrors.phone = L('Format nomor Indonesia tidak valid (contoh: 08123456789 atau +628123456789)', 'Invalid Indonesian phone format (example: 08123456789 or +628123456789)');
      }
    }

    if (!profile.birthDate) nextErrors.birthDate = L('Tanggal lahir wajib diisi', 'Birth date is required');
    if (!profile.gender) nextErrors.gender = L('Pilih jenis kelamin terlebih dahulu', 'Please choose a gender');
    const pinError = validatePinStrength(profile.pin, L);
    if (pinError) nextErrors.pin = pinError;
    if (profile.confirmPin !== profile.pin) {
      nextErrors.confirmPin = L('Konfirmasi PIN belum cocok', 'PIN confirmation does not match');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }));
    }
  };

  const handleNext = () => {
    if (!validateForm()) return;

    saveUser({
      fullName: profile.fullName.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      dob: profile.birthDate,
      address: profile.occupation.trim(),
      memberSince: user.memberSince || new Date().getFullYear(),
      pin: profile.pin,
    });
    saveSettings({ language: profile.language });

    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem('onboarding_step', 'wallet');
    navigate('/onboarding/wallet');
  };

  const fieldClass = 'w-full rounded-[20px] border px-4 py-3 text-sm outline-none transition-all';

  return (
    <OnboardingShell
      title={L('Profil Anda', 'Your profile')}
      subtitle={L('Lengkapi data inti agar aplikasi bisa menyesuaikan bahasa, identitas, dan pengalaman awal Anda.', 'Complete the core details so the app can tailor language, identity, and your first experience.')}
      step={2}
      totalSteps={4}
      onBack={() => {
        // Hapus flag terms agar OnboardingWrapper tidak redirect balik ke profile
        localStorage.removeItem('onboarding_terms_accepted');
        localStorage.setItem('onboarding_step', 'welcome');
        navigate('/');
      }}
      footer={(
        <button
          onClick={handleNext}
          className="w-full rounded-[24px] py-4 font-semibold text-[#083626] shadow-[0_18px_40px_rgba(78,222,163,0.28)] transition-all"
          style={{ backgroundColor: '#4edea3' }}
        >
          {L('Simpan profil dan lanjut', 'Save profile and continue')}
        </button>
      )}
    >
      <div className="space-y-4 pb-2">
        <div className="rounded-[28px] border p-5" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] p-4" style={{ backgroundColor: 'var(--app-card2)' }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--app-text2)' }}>
                {L('Tujuan', 'Goal')}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text)' }}>
                {L('Biar ringkasan akun dan pengaturan awal langsung pas.', 'So your account summary and initial settings feel right from the start.')}
              </p>
            </div>
            <div className="rounded-[22px] p-4" style={{ backgroundColor: 'var(--app-card2)' }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--app-text2)' }}>
                {L('Catatan', 'Note')}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text)' }}>
                {L('Anda masih bisa mengubah data ini nanti dari menu akun.', 'You can still edit this later from the account menu.')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border p-5" style={{ background: 'linear-gradient(135deg, rgba(78,222,163,0.14) 0%, rgba(18,185,129,0.04) 100%)', borderColor: 'rgba(78,222,163,0.22)' }}>
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] text-lg" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}>
              {'🔐'}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{L('Keamanan akun sejak awal', 'Account security from the start')}</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
                {L('Buat PIN 6 digit Anda sekarang. Kami menolak PIN yang terlalu mudah ditebak seperti angka berulang atau berurutan.', 'Create your 6-digit PIN now. We reject PINs that are too easy to guess, such as repeated or sequential numbers.')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border p-5" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Nama lengkap', 'Full name')} *</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={fieldClass}
                style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.fullName ? '#ef4444' : 'var(--app-border)' }}
                placeholder={L('Masukkan nama lengkap Anda', 'Enter your full name')}
              />
              {errors.fullName ? <p className="mt-1 text-xs text-red-500">{errors.fullName}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Email', 'Email')} *</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={fieldClass}
                style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.email ? '#ef4444' : 'var(--app-border)' }}
                placeholder={L('nama@email.com', 'name@email.com')}
              />
              {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Nomor telepon', 'Phone number')} *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium select-none" style={{ color: 'var(--app-text2)' }}>+62</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={profile.phone.startsWith('+62') ? profile.phone.slice(3).replace(/^0/, '') : profile.phone.startsWith('62') ? profile.phone.slice(2) : profile.phone.startsWith('0') ? profile.phone.slice(1) : profile.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      handleInputChange('phone', '+62' + digits);
                    }}
                    className={fieldClass}
                    style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.phone ? '#ef4444' : 'var(--app-border)', paddingLeft: '52px' }}
                    placeholder="8123456789"
                  />
                </div>
                {errors.phone
                  ? <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  : <p className="mt-1 text-xs" style={{ color: 'var(--app-text2)' }}>{L('Contoh: 8123456789 (tanpa 0 di depan)', 'Example: 8123456789 (without leading 0)')}</p>
                }
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Tanggal lahir', 'Birth date')} *</label>
                <input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={fieldClass}
                  style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.birthDate ? '#ef4444' : 'var(--app-border)' }}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.birthDate ? <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Jenis kelamin', 'Gender')} *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'male', label: L('Laki-laki', 'Male') },
                  { value: 'female', label: L('Perempuan', 'Female') },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('gender', option.value)}
                    className="rounded-[20px] border px-4 py-3 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: profile.gender === option.value ? 'rgba(78, 222, 163, 0.12)' : 'var(--app-card2)',
                      color: profile.gender === option.value ? '#169b6d' : 'var(--app-text)',
                      borderColor: profile.gender === option.value ? '#4edea3' : 'var(--app-border)',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.gender ? <p className="mt-1 text-xs text-red-500">{errors.gender}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Bahasa aplikasi', 'App language')}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'id', label: 'Bahasa Indonesia', badge: 'ID' },
                  { value: 'en', label: 'English', badge: 'EN' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('language', option.value)}
                    className="rounded-[20px] border px-4 py-3 text-left transition-all"
                    style={{
                      backgroundColor: profile.language === option.value ? 'rgba(78, 222, 163, 0.12)' : 'var(--app-card2)',
                      color: 'var(--app-text)',
                      borderColor: profile.language === option.value ? '#4edea3' : 'var(--app-border)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: 'rgba(78, 222, 163, 0.16)', color: '#169b6d' }}>
                        {option.badge}
                      </span>
                      <span className="text-sm font-semibold">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Pekerjaan', 'Occupation')}</label>
              <input
                type="text"
                value={profile.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                className={fieldClass}
                style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: 'var(--app-border)' }}
                placeholder={L('Contoh: Software Engineer', 'Example: Software Engineer')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('PIN 6 digit', '6-digit PIN')} *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={profile.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, ''))}
                  className={fieldClass}
                  style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.pin ? '#ef4444' : 'var(--app-border)' }}
                  placeholder="••••••"
                />
                {errors.pin ? <p className="mt-1 text-xs text-red-500">{errors.pin}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--app-text)' }}>{L('Konfirmasi PIN', 'Confirm PIN')} *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={profile.confirmPin}
                  onChange={(e) => handleInputChange('confirmPin', e.target.value.replace(/\D/g, ''))}
                  className={fieldClass}
                  style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)', borderColor: errors.confirmPin ? '#ef4444' : 'var(--app-border)' }}
                  placeholder="••••••"
                />
                {errors.confirmPin ? <p className="mt-1 text-xs text-red-500">{errors.confirmPin}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
