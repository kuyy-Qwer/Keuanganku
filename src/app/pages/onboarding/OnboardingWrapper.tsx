import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import WelcomePage from './WelcomePage';
import ProfileSetupPage from './ProfileSetupPage';
import WalletSetupPage from './WalletSetupPage';
import TutorialPage from './TutorialPage';
import { getBankAccounts, getCashWalletBalance, getUser } from '../../store/database';

const STEP_ORDER = ['welcome', 'profile', 'wallet', 'tutorial'] as const;
type StepName = typeof STEP_ORDER[number];

function getRequestedStep(pathname: string): StepName {
  const match = pathname.match(/\/onboarding\/([^/]+)/);
  const pathStep = match?.[1] as StepName | undefined;
  const storedStep = localStorage.getItem('onboarding_step') as StepName | null;

  if (pathStep && STEP_ORDER.includes(pathStep)) return pathStep;
  if (storedStep && STEP_ORDER.includes(storedStep)) return storedStep;
  return 'welcome';
}

function getResolvedStep(requestedStep: StepName): StepName {
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
  const termsAccepted = localStorage.getItem('onboarding_terms_accepted') === 'true';
  const user = getUser();
  const hasProfile = [user.fullName, user.email, user.phone, user.dob].every((value) => value.trim().length > 0);
  const hasWallet = getCashWalletBalance() > 0 || getBankAccounts().length > 0 || !!localStorage.getItem('wallet_setup');

  if (onboardingCompleted) return 'tutorial';

  // Tentukan step maksimum yang boleh diakses
  let maxAllowed: StepName = 'welcome';
  if (termsAccepted) maxAllowed = 'profile';
  if (termsAccepted && hasProfile) maxAllowed = 'wallet';
  if (termsAccepted && hasProfile && hasWallet) maxAllowed = 'tutorial';

  const requestedIndex = STEP_ORDER.indexOf(requestedStep);
  const maxIndex = STEP_ORDER.indexOf(maxAllowed);

  // Izinkan navigasi ke step mana saja yang <= maxAllowed
  if (requestedIndex <= maxIndex) return requestedStep;

  // Kalau minta step yang belum boleh, redirect ke maxAllowed
  return maxAllowed;
}

export default function OnboardingWrapper() {
  const location = useLocation();
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';

  if (onboardingCompleted && (location.pathname === '/' || location.pathname.startsWith('/onboarding'))) {
    return <Navigate to="/app" replace />;
  }

  const requestedStep = getRequestedStep(location.pathname);
  const resolvedStep = getResolvedStep(requestedStep);
  const previousStepRef = useRef<StepName>(resolvedStep);

  if (requestedStep !== resolvedStep) {
    return <Navigate to={resolvedStep === 'welcome' ? '/' : `/onboarding/${resolvedStep}`} replace />;
  }

  const currentIndex = STEP_ORDER.indexOf(resolvedStep);
  const previousIndex = STEP_ORDER.indexOf(previousStepRef.current);
  const direction = currentIndex === previousIndex ? 1 : currentIndex > previousIndex ? 1 : -1;

  useEffect(() => {
    previousStepRef.current = resolvedStep;
  }, [resolvedStep]);

  const renderStep = () => {
    switch (resolvedStep) {
      case 'welcome':
        return <WelcomePage />;
      case 'profile':
        return <ProfileSetupPage />;
      case 'wallet':
        return <WalletSetupPage />;
      case 'tutorial':
        return <TutorialPage />;
      default:
        return <WelcomePage />;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={resolvedStep}
        custom={direction}
        initial={(stepDirection) => ({
          opacity: 0,
          y: stepDirection > 0 ? 44 : -44,
          scale: 0.985,
          filter: 'blur(10px)',
        })}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={(stepDirection) => ({
          opacity: 0,
          y: stepDirection > 0 ? -32 : 32,
          scale: 0.992,
          filter: 'blur(8px)',
        })}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
