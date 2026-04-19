import { useEffect, useRef } from 'react';
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

  // Only use path-based step — ignore localStorage fallback to avoid stale redirects
  if (pathStep && STEP_ORDER.includes(pathStep)) return pathStep;
  return 'splash';
}

function getMaxAllowedStep(): StepName {
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
  if (onboardingCompleted) return 'tutorial';

  const termsAccepted = localStorage.getItem('onboarding_terms_accepted') === 'true';
  const walletSetup =
    !!localStorage.getItem('wallet_setup') ||
    getCashWalletBalance() > 0 ||
    getBankAccounts().length > 0;
  const user = getUser();
  const hasProfile = !!(user.fullName?.trim() && user.email?.trim() && user.dob?.trim());

  // Determine max allowed step based on completed prerequisites
  if (termsAccepted && hasProfile && walletSetup) return 'tutorial';
  if (termsAccepted && hasProfile) return 'wallet';
  if (termsAccepted) return 'profile';
  // splash and welcome are always accessible
  return 'welcome';
}

function getResolvedStep(requestedStep: StepName): StepName {
  const maxAllowed = getMaxAllowedStep();

  const requestedIndex = STEP_ORDER.indexOf(requestedStep);
  const maxIndex = STEP_ORDER.indexOf(maxAllowed);

  // Allow going back freely, but cap forward navigation at maxAllowed
  if (requestedIndex <= maxIndex) return requestedStep;
  return maxAllowed;
}

export default function OnboardingWrapper() {
  const location = useLocation();

  // All hooks must be called unconditionally before any early returns
  const requestedStep = getRequestedStep(location.pathname);
  const resolvedStep = getResolvedStep(requestedStep);
  const previousStepRef = useRef<StepName>(resolvedStep);

  const currentIndex = STEP_ORDER.indexOf(resolvedStep);
  const previousIndex = STEP_ORDER.indexOf(previousStepRef.current);
  const direction = currentIndex >= previousIndex ? 1 : -1;

  useEffect(() => {
    previousStepRef.current = resolvedStep;
  }, [resolvedStep]);

  // If onboarding is completed, redirect to app
  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
  if (onboardingCompleted) {
    return <Navigate to="/app" replace />;
  }

  // Redirect if trying to access a step not yet allowed
  if (requestedStep !== resolvedStep) {
    const target = resolvedStep === 'splash' ? '/' : `/onboarding/${resolvedStep}`;
    return <Navigate to={target} replace />;
  }

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
        variants={{
          enter: (d: number) => ({ opacity: 0, y: d > 0 ? 20 : -20 }),
          center: { opacity: 1, y: 0 },
          exit: (d: number) => ({ opacity: 0, y: d > 0 ? -20 : 20 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
