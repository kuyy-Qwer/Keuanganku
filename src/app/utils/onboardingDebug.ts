/**
 * Utility functions untuk debugging onboarding
 * Gunakan di browser console untuk troubleshooting
 */

export function checkOnboardingStatus() {
  const status = {
    onboarding_completed: localStorage.getItem('onboarding_completed'),
    onboarding_step: localStorage.getItem('onboarding_step'),
    onboarding_terms_accepted: localStorage.getItem('onboarding_terms_accepted'),
    onboarding_tour_pending: localStorage.getItem('onboarding_tour_pending'),
    wallet_setup: localStorage.getItem('wallet_setup'),
    user_profile: localStorage.getItem('user_profile'),
  };
  
  console.log('=== Onboarding Status ===');
  console.table(status);
  
  return status;
}

export function resetOnboarding() {
  console.log('🔄 Resetting onboarding...');
  
  // Remove all onboarding flags
  localStorage.removeItem('onboarding_completed');
  localStorage.removeItem('onboarding_step');
  localStorage.removeItem('onboarding_terms_accepted');
  localStorage.removeItem('onboarding_tour_pending');
  localStorage.removeItem('wallet_setup');
  
  console.log('✅ Onboarding reset complete!');
  console.log('📍 Reload page and navigate to "/" to start onboarding');
  
  return {
    success: true,
    message: 'Onboarding has been reset. Reload the page to start fresh.'
  };
}

export function forceCompleteOnboarding() {
  console.log('⚡ Force completing onboarding...');
  
  localStorage.setItem('onboarding_completed', 'true');
  localStorage.setItem('onboarding_terms_accepted', 'true');
  localStorage.removeItem('onboarding_step');
  localStorage.removeItem('onboarding_tour_pending');
  
  console.log('✅ Onboarding marked as completed!');
  console.log('📍 Navigate to "/app" to access the app');
  
  return {
    success: true,
    message: 'Onboarding marked as completed.'
  };
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  try {
    (window as any).onboardingDebug = {
      check: checkOnboardingStatus,
      reset: resetOnboarding,
      forceComplete: forceCompleteOnboarding,
    };
    
    console.log('🔧 Onboarding Debug Tools loaded!');
    console.log('Usage:');
    console.log('  - onboardingDebug.check()         // Check current status');
    console.log('  - onboardingDebug.reset()         // Reset onboarding');
    console.log('  - onboardingDebug.forceComplete() // Force complete onboarding');
  } catch (error) {
    console.error('Failed to load onboarding debug tools:', error);
  }
}
