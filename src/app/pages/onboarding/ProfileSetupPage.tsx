import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useLang } from '../../i18n';
import { getUser, saveUser } from '../../store/database';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === 'en' ? en : id;
  const user = getUser();

  const [fullName, setFullName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');
  const [birthDate, setBirthDate] = useState(user.dob || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = L('Nama wajib diisi', 'Name is required');
    if (!email.trim()) {
      e.email = L('Email wajib diisi', 'Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = L('Format email tidak valid', 'Invalid email format');
    }
    if (!birthDate) e.birthDate = L('Tanggal lahir wajib diisi', 'Birth date is required');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    saveUser({
      fullName: fullName.trim(),
      email: email.trim(),
      dob: birthDate,
      memberSince: user.memberSince || new Date().getFullYear(),
    });
    localStorage.setItem('user_profile', JSON.stringify({ fullName: fullName.trim(), email: email.trim(), birthDate }));
    localStorage.setItem('onboarding_step', 'tutorial');
    navigate('/onboarding/tutorial');
  };

  const inputClass = 'w-full rounded-[18px] border px-4 py-3.5 text-sm outline-none transition-all';

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
          onClick={() => navigate('/onboarding/wallet')}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border self-start"
          style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress */}
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-[20px]"
            style={{ background: 'linear-gradient(135deg, rgba(78,222,163,0.2), rgba(0,180,162,0.1))', border: '1px solid rgba(78,222,163,0.25)' }}>
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] font-black text-[26px] mb-2" style={{ color: 'var(--app-text)' }}>
            {L('Identitas Dasar', 'Basic Identity')}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--app-text2)' }}>
            {L('Hanya 3 informasi. Selesai dalam 1 menit.', 'Only 3 details. Done in 1 minute.')}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-[24px] p-5 mb-4"
          style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)' }}
        >
          <div className="space-y-5">
            {/* Nama */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#4edea3', color: '#083626' }}>1</div>
                <label className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                  {L('Nama Panggilan / Lengkap', 'Nickname / Full Name')} *
                </label>
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })); }}
                className={inputClass}
                style={{
                  backgroundColor: 'var(--app-card2)',
                  color: 'var(--app-text)',
                  borderColor: errors.fullName ? '#ef4444' : 'var(--app-border)',
                }}
                placeholder={L('Untuk greeting di Dashboard', 'For greeting in Dashboard')}
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#4edea3', color: '#083626' }}>2</div>
                <label className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                  {L('Email', 'Email')} *
                </label>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                className={inputClass}
                style={{
                  backgroundColor: 'var(--app-card2)',
                  color: 'var(--app-text)',
                  borderColor: errors.email ? '#ef4444' : 'var(--app-border)',
                }}
                placeholder={L('Identitas akun unik', 'Unique account identity')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Tanggal Lahir */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#4edea3', color: '#083626' }}>3</div>
                <label className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                  {L('Tanggal Lahir', 'Birth Date')} *
                </label>
              </div>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => { setBirthDate(e.target.value); setErrors(p => ({ ...p, birthDate: '' })); }}
                className={inputClass}
                style={{
                  backgroundColor: 'var(--app-card2)',
                  color: 'var(--app-text)',
                  borderColor: errors.birthDate ? '#ef4444' : 'var(--app-border)',
                }}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
              <p className="mt-1.5 text-xs" style={{ color: 'var(--app-text2)' }}>
                {L('Untuk ucapan ulang tahun & analisis keuangan.', 'For birthday greetings & financial analysis.')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-[18px] p-4 mb-4 flex items-start gap-2"
          style={{ backgroundColor: 'rgba(78,222,163,0.07)', border: '1px solid rgba(78,222,163,0.15)' }}
        >
          <span className="text-sm shrink-0">💡</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text2)' }}>
            {L('Data lain (pekerjaan, telepon, PIN) bisa dilengkapi nanti di pengaturan profil.', 'Other data (occupation, phone, PIN) can be added later in profile settings.')}
          </p>
        </motion.div>

        <div className="flex-1" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[24px] border p-4"
          style={{ background: 'var(--app-card)', borderColor: 'var(--app-border)' }}
        >
          <button
            onClick={handleNext}
            className="w-full rounded-[20px] py-4 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
              color: '#083626',
              boxShadow: '0 12px 32px rgba(78,222,163,0.3)',
            }}
          >
            {L('Lanjut ke Mission →', 'Continue to Mission →')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
