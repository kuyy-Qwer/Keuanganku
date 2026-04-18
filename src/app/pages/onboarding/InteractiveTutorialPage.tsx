import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLang, t } from '../../i18n';
import GuidedTour, { TourStep } from '../../components/GuidedTour';
import { onboardingTourSteps } from '../../config/tourSteps';
import { addTransaction, getTransactions } from '../../store/database';

export default function InteractiveTutorialPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const [tourOpen, setTourOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('/app');

  useEffect(() => {
    // Navigate to main app first
    navigate('/app');
    
    // Wait for page to load, then start tour
    const timer = setTimeout(() => {
      setTourOpen(true);
      // Add sample transaction for demo
      const transactions = getTransactions();
      if (transactions.length === 0) {
        addTransaction({
          amount: 50000,
          category: 'Makanan',
          notes: 'Tutorial: Makan siang',
          type: 'expense',
          date: new Date().toISOString()
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleTourComplete = () => {
    setTourOpen(false);
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    navigate('/app');
  };

  const handleTourClose = () => {
    setTourOpen(false);
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    navigate('/app');
  };

  return (
    <>
      <GuidedTour
        steps={onboardingTourSteps}
        isOpen={tourOpen}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
      />
    </>
  );
}
