import { createBrowserRouter, Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import OnboardingWrapper from "./pages/onboarding/OnboardingWrapper";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthGuard from "./components/AuthGuard";
import HomePage from "./pages/HomePage";
import WalletPage from "./pages/WalletPage";
import HistoryPage from "./pages/HistoryPage";
import AccountPage from "./pages/AccountPage";
import ReportPage from "./pages/ReportPage";
import PersonalInfoPage from "./pages/settings/PersonalInfoPage";
import CategoriesPage from "./pages/settings/CategoriesPage";
import ChangePinPage from "./pages/settings/ChangePinPage";
import TasksPage from "./pages/TasksPage";
import BackupPage from "./pages/BackupPage";
import CalendarPage from "./pages/CalendarPage";
import DebtPage from "./pages/DebtPage";
import AchievementsPage from "./pages/AchievementsPage";
import SavingsPage from "./pages/SavingsPage";
import SavingsListPage from "./pages/SavingsListPage";
import EmergencyFundPage from "./pages/EmergencyFundPage";
import EmergencyFundListPage from "./pages/EmergencyFundListPage";
import PrivacySettingsPage from "./pages/settings/PrivacySettingsPage";
import NotificationsSettingsPage from "./pages/settings/NotificationsPage";
import ReminderSettingsPage from "./pages/settings/ReminderSettingsPage";
import LanguagePage from "./pages/settings/LanguagePage";
import ThemePage from "./pages/settings/ThemePage";
import HelpCenterPage from "./pages/settings/HelpCenterPage";
import TermsOfServicePage from "./pages/settings/TermsOfServicePage";
import InsightsPage from "./pages/InsightsPage";
import AssetPage from "./pages/AssetPage";
import BankSimulationPage from "./pages/BankSimulationPage";
import NotifHistoryPage from "./pages/NotificationsPage";
import DisciplinePage from "./pages/DisciplinePage";
import TestPusherPage from "./pages/TestPusherPage";

// Simple 404 fallback
function NotFound() {
  return <Navigate to="/app" replace />;
}

// Protected layout — wraps DashboardLayout with AuthGuard
function ProtectedLayout() {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <OnboardingWrapper />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/onboarding",
    element: <OnboardingWrapper />,
  },
  {
    path: "/onboarding/splash",
    element: <OnboardingWrapper />,
  },
  {
    path: "/onboarding/welcome",
    element: <OnboardingWrapper />,
  },
  {
    path: "/onboarding/wallet",
    element: <OnboardingWrapper />,
  },
  {
    path: "/onboarding/profile",
    element: <OnboardingWrapper />,
  },
  {
    path: "/onboarding/tutorial",
    element: <OnboardingWrapper />,
  },
  {
    path: "/app",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "wallet", element: <WalletPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "debt", element: <DebtPage /> },
      { path: "backup", element: <BackupPage /> },
      { path: "achievements", element: <AchievementsPage /> },
      { path: "report", element: <ReportPage /> },
      { path: "savings", element: <SavingsListPage /> },
      { path: "savings/:savingId", element: <SavingsPage /> },
      { path: "emergency-funds", element: <EmergencyFundListPage /> },
      { path: "emergency-funds/new", element: <EmergencyFundPage /> },
      { path: "emergency-funds/:fundId", element: <EmergencyFundPage /> },
      { path: "emergency-fund", element: <EmergencyFundPage /> },
      { path: "settings/personal", element: <PersonalInfoPage /> },
      { path: "settings/categories", element: <CategoriesPage /> },
      { path: "settings/pin", element: <ChangePinPage /> },
      { path: "settings/privacy", element: <PrivacySettingsPage /> },
      { path: "settings/notifications", element: <NotificationsSettingsPage /> },
      { path: "settings/reminders", element: <ReminderSettingsPage /> },
      { path: "settings/language", element: <LanguagePage /> },
      { path: "settings/theme", element: <ThemePage /> },
      { path: "settings/help", element: <HelpCenterPage /> },
      { path: "settings/terms", element: <TermsOfServicePage /> },
      { path: "insights", element: <InsightsPage /> },
      { path: "notif-history", element: <NotifHistoryPage /> },
      { path: "assets", element: <AssetPage /> },
      { path: "bank-simulation", element: <BankSimulationPage /> },
      { path: "discipline", element: <DisciplinePage /> },
      { path: "test-pusher", element: <TestPusherPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <Navigate to="/app" replace /> },
]);
