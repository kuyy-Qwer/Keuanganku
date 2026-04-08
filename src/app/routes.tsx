import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import WalletPage from "./pages/WalletPage";
import HistoryPage from "./pages/HistoryPage";
import AccountPage from "./pages/AccountPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "wallet", element: <WalletPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "account", element: <AccountPage /> },
    ],
  },
]);
