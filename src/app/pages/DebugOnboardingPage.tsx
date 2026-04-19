import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getUser, getCashWalletBalance, getBankAccounts } from '../store/database';

export default function DebugOnboardingPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const checkStatus = () => {
    const status = {
      onboarding_completed: localStorage.getItem('onboarding_completed'),
      onboarding_step: localStorage.getItem('onboarding_step'),
      onboarding_terms_accepted: localStorage.getItem('onboarding_terms_accepted'),
      onboarding_tour_pending: localStorage.getItem('onboarding_tour_pending'),
      wallet_setup: localStorage.getItem('wallet_setup'),
    };

    const user = getUser();
    const hasProfile = !!(user.fullName?.trim() && user.email?.trim() && user.dob?.trim());
    const walletSetup = getCashWalletBalance() > 0 || getBankAccounts().length > 0 || !!localStorage.getItem('wallet_setup');

    const computed = {
      hasProfile,
      walletSetup,
      cashBalance: getCashWalletBalance(),
      bankAccounts: getBankAccounts().length,
    };

    console.log('=== Onboarding Status ===');
    console.log('LocalStorage Flags:', status);
    console.log('Computed Status:', computed);
    console.log('User Profile:', user);

    setMessage(JSON.stringify({ status, computed, user }, null, 2));
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_terms_accepted');
    localStorage.removeItem('onboarding_tour_pending');
    localStorage.removeItem('wallet_setup');
    
    setMessage('✅ Onboarding reset! Navigate to "/" to start fresh.');
    console.log('✅ Onboarding reset complete!');
  };

  const forceComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_terms_accepted', 'true');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_tour_pending');
    
    setMessage('✅ Onboarding marked as completed! Navigate to "/app".');
    console.log('✅ Onboarding force completed!');
  };

  const goToOnboarding = () => {
    navigate('/');
  };

  const goToApp = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔧 Onboarding Debug Tools</h1>
          <p className="text-sm" style={{ color: 'var(--app-text2)' }}>
            Tools untuk debugging dan testing onboarding flow
          </p>
        </div>

        <div className="grid gap-4 mb-8">
          {/* Check Status */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
            <h2 className="text-xl font-bold mb-3">📊 Check Status</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--app-text2)' }}>
              Cek status onboarding saat ini (lihat console untuk detail lengkap)
            </p>
            <button
              onClick={checkStatus}
              className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: '#4edea3', color: '#003824' }}
            >
              Check Status
            </button>
          </div>

          {/* Reset Onboarding */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
            <h2 className="text-xl font-bold mb-3">🔄 Reset Onboarding</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--app-text2)' }}>
              Hapus semua flag onboarding dan mulai dari awal. User profile dan data lain tetap tersimpan.
            </p>
            <button
              onClick={resetOnboarding}
              className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: '#ffb4ab', color: '#5f0000' }}
            >
              Reset Onboarding
            </button>
          </div>

          {/* Force Complete */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
            <h2 className="text-xl font-bold mb-3">⚡ Force Complete</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--app-text2)' }}>
              Tandai onboarding sebagai selesai tanpa melalui semua step.
            </p>
            <button
              onClick={forceComplete}
              className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: '#00b4a2', color: '#ffffff' }}
            >
              Force Complete
            </button>
          </div>

          {/* Navigation */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
            <h2 className="text-xl font-bold mb-3">🧭 Navigation</h2>
            <div className="flex gap-3">
              <button
                onClick={goToOnboarding}
                className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)' }}
              >
                Go to Onboarding (/)
              </button>
              <button
                onClick={goToApp}
                className="px-6 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ backgroundColor: 'var(--app-card2)', color: 'var(--app-text)' }}
              >
                Go to App (/app)
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
            <h3 className="text-lg font-bold mb-3">📝 Output</h3>
            <pre className="text-xs overflow-auto p-4 rounded-xl" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text2)' }}>
              {message}
            </pre>
          </div>
        )}

        {/* Console Commands */}
        <div className="mt-8 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
          <h3 className="text-lg font-bold mb-3">💻 Console Commands</h3>
          <p className="text-sm mb-3" style={{ color: 'var(--app-text2)' }}>
            Buka browser console (F12) dan gunakan command berikut:
          </p>
          <div className="space-y-2 text-sm font-mono">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--app-bg)' }}>
              <code style={{ color: '#4edea3' }}>onboardingDebug.check()</code>
              <span style={{ color: 'var(--app-text2)' }}> // Check status</span>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--app-bg)' }}>
              <code style={{ color: '#4edea3' }}>onboardingDebug.reset()</code>
              <span style={{ color: 'var(--app-text2)' }}> // Reset onboarding</span>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--app-bg)' }}>
              <code style={{ color: '#4edea3' }}>onboardingDebug.forceComplete()</code>
              <span style={{ color: 'var(--app-text2)' }}> // Force complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
