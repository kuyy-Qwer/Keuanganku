// Hook untuk mengelola onboarding flow
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getBankAccounts, getCashWalletBalance, getUser } from '../store/database';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  occupation: string;
  createdAt: string;
}

export interface WalletSetup {
  cashBalance: number;
  bank: {
    name: string;
    accountNumber: string;
    accountName: string;
  } | null;
  createdAt: string;
}

export function useOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user needs onboarding
  const needsOnboarding = () => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
    const user = getUser();
    const hasProfile = [user.fullName, user.email, user.phone, user.dob].every((value) => value.trim().length > 0);
    const hasWallet = getCashWalletBalance() > 0 || getBankAccounts().length > 0 || !!localStorage.getItem('wallet_setup');
    
    return !onboardingCompleted || !hasProfile || !hasWallet;
  };

  // Get current onboarding step
  const getCurrentStep = () => {
    return localStorage.getItem('onboarding_step') || 'welcome';
  };

  // Reset onboarding (for testing)
  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_terms_accepted');
    localStorage.removeItem('onboarding_tour_pending');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('wallet_setup');
    navigate('/');
  };

  // Complete onboarding
  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_tour_pending');
    navigate('/app');
  };

  // Navigate to specific step
  const goToStep = (step: string) => {
    localStorage.setItem('onboarding_step', step);
    navigate(`/onboarding/${step}`);
  };

  // Get user profile
  const getUserProfile = (): UserProfile | null => {
    try {
      const profile = localStorage.getItem('user_profile');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  };

  // Get wallet setup
  const getWalletSetup = (): WalletSetup | null => {
    try {
      const wallet = localStorage.getItem('wallet_setup');
      return wallet ? JSON.parse(wallet) : null;
    } catch {
      return null;
    }
  };

  // Save user profile
  const saveUserProfile = (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const profileData: UserProfile = {
        ...profile,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      goToStep('wallet');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save wallet setup
  const saveWalletSetup = (wallet: Omit<WalletSetup, 'createdAt'>) => {
    setIsLoading(true);
    try {
      const walletData: WalletSetup = {
        ...wallet,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('wallet_setup', JSON.stringify(walletData));
      
      // Update balance in database
      const currentBalance = Number(localStorage.getItem('balance') || '0');
      const newBalance = currentBalance + wallet.cashBalance;
      localStorage.setItem('balance', newBalance.toString());
      
      goToStep('tutorial');
    } catch (error) {
      console.error('Error saving wallet setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize onboarding check
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // If trying to access app without completing onboarding
    if (currentPath.startsWith('/app') && needsOnboarding()) {
      navigate('/');
    }
    
    // If onboarding is completed and trying to access onboarding pages
    if (!needsOnboarding() && currentPath.startsWith('/onboarding')) {
      navigate('/app');
    }
  }, [navigate]);

  return {
    needsOnboarding,
    getCurrentStep,
    resetOnboarding,
    completeOnboarding,
    goToStep,
    getUserProfile,
    getWalletSetup,
    saveUserProfile,
    saveWalletSetup,
    isLoading
  };
}
