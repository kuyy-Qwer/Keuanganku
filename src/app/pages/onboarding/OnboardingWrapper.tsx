import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import SplashIntroPage from './SplashIntroPage';
import WelcomePage from './WelcomePage';
import WalletSetupPage from './WalletSetupPage';
import ProfileSetupPage from './ProfileSetupPage';
import TutorialPage from './TutorialPage';
import { getBankAccounts, getCashWalletBalance, getUser } from '../../store/database';

// Flow: splash → welcome → profile → wallet → tutorial
const STEP_ORDER = ['splash', 'welcome', 'profile', 'wallet', 'tutorial'] as const;
type StepName = typeof STEP_ORDER[number];

function getRequestedStep(pathname: string): StepName {
  if (pathname === '/' || pathname === '/onboarding') return 'splash';
  const match = pathname.match(/\/onboarding\/([^/]+)/);
  const pathStep = match?.[1] as StepName | undefined;
  const storedStep = localStorage.getItem('onboarding_step') as StepName | null;

  if (pathStep && STEP_ORDER.includes(pathStep)) return pathStep;
  if (storedStep && STEP_ORDER.includes(storedStep)) return storedStep;
  return 'splash';
}

function getResolvedStep(requestedStep: StepName): StepName {
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
  if (onboardingCompleted) return 'tutorial';

  const termsAccepted = localStorage.getItem('onboarding_terms_accepted') === 'true';
  const walletSetup = !!localStorage.getItem('wallet_setup') || getCashWalletBalance() > 0 || getBankAccounts().length > 0;
  const user = getUser();
  const hasProfile = !!(user.fullName?.trim() && user.email?.trim() && user.dob?.trim());

  // Determine max allowed step
  let maxAllowed: StepName = 'splash';
  if (true) maxAllowed = 'welcome'; // splash always accessible
  if (termsAccepted) maxAllowed = 'profile';
  if (termsAccepted && hasProfile) maxAllowed = 'wallet';
  if (termsAccepted && hasProfile && walletSetup) maxAllowed = 'tutorial';

  const requestedIndex = STEP_ORDER.indexOf(requestedStep);
  const maxIndex = STEP_ORDER.indexOf(maxAllowed);

  if (requestedIndex <= maxIndex) return requestedStep;
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

  // Redirect if trying to access a step not yet allowed
  if (requestedStep !== resolvedStep) {
    const target = resolvedStep === 'splash' ? '/' : `/onboarding/${resolvedStep}`;
    return <Navigate to={target} replace />;
  }

  const currentIndex = STEP_ORDER.indexOf(resolvedStep);
  const previousIndex = STEP_ORDER.indexOf(previousStepRef.current);
  const direction = currentIndex >= previousIndex ? 1 : -1;

  useEffect(() => {
    previousStepRef.current = resolvedStep;
  }, [resolvedStep]);

  // Splash has its own full-screen treatment — no wrapper animation
  if (resolvedStep === 'splash') {
    return <SplashIntroPage />;
  }

  const renderStep = () => {
    switch (resolvedStep) {
      case 'welcome': return <WelcomePage />;
      case 'profile': return <ProfileSetupPage />;
      case 'wallet': return <WalletSetupPage />;
      case 'tutorial': return <TutorialPage />;
      default: return <WelcomePage />;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={resolvedStep}
        custom={direction}
        initial={(d) => ({ opacity: 0, y: d > 0 ? 40 : -40, scale: 0.985, filter: 'blur(8px)' })}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={(d) => ({ opacity: 0, y: d > 0 ? -28 : 28, scale: 0.992, filter: 'blur(6px)' })}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
