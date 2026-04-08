import { Outlet, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import TransactionInputWithNotesGoPayInspired from "../../imports/TransactionInputWithNotesGoPayInspired/TransactionInputWithNotesGoPayInspired";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const isActive = (path: string) => {
    if (path === "/app" && location.pathname === "/app") return true;
    if (path !== "/app" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#0b1326] overflow-hidden">
      {/* Main Content */}
      <div className="relative w-full min-h-screen">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center">
        <div className="w-full max-w-[390px] h-[88px] backdrop-blur-[12px] bg-[rgba(11,19,38,0.9)] border-t border-[rgba(255,255,255,0.05)] px-6">
          <div className="flex items-center justify-around h-full">
            {/* Home */}
            <button
              onClick={() => navigate("/app")}
              className="flex flex-col items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-[18px]" fill="none" viewBox="0 0 16 18">
                <path
                  d="M1 6.5L8 1L15 6.5V15.5C15 16.0523 14.5523 16.5 14 16.5H2C1.44772 16.5 1 16.0523 1 15.5V6.5Z"
                  fill={isActive("/app") ? "#10B981" : "#64748B"}
                  stroke={isActive("/app") ? "#10B981" : "#64748B"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`text-[10px] font-bold font-['Plus_Jakarta_Sans'] ${
                  isActive("/app") ? "text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                Home
              </span>
            </button>

            {/* Wallet */}
            <button
              onClick={() => navigate("/app/wallet")}
              className="flex flex-col items-center gap-1 transition-colors"
            >
              <svg className="w-[19px] h-[18px]" fill="none" viewBox="0 0 19 18">
                <path
                  d="M17 4H2C1.44772 4 1 4.44772 1 5V15C1 15.5523 1.44772 16 2 16H17C17.5523 16 18 15.5523 18 15V5C18 4.44772 17.5523 4 17 4Z"
                  fill={isActive("/app/wallet") ? "#10B981" : "none"}
                  stroke={isActive("/app/wallet") ? "#10B981" : "#94A3B8"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="14"
                  cy="10"
                  r="1"
                  fill={isActive("/app/wallet") ? "#0b1326" : "#94A3B8"}
                />
              </svg>
              <span
                className={`text-[10px] font-bold font-['Plus_Jakarta_Sans'] ${
                  isActive("/app/wallet") ? "text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                Wallet
              </span>
            </button>

            {/* History */}
            <button
              onClick={() => navigate("/app/history")}
              className="flex flex-col items-center gap-1 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                <path
                  d="M15 3H3C1.89543 3 1 3.89543 1 5V15C1 16.1046 1.89543 17 3 17H15C16.1046 17 17 16.1046 17 15V5C17 3.89543 16.1046 3 15 3Z"
                  stroke={isActive("/app/history") ? "#10B981" : "#94A3B8"}
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1 7H17"
                  stroke={isActive("/app/history") ? "#10B981" : "#94A3B8"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={`text-[10px] font-bold font-['Plus_Jakarta_Sans'] ${
                  isActive("/app/history") ? "text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                History
              </span>
            </button>

            {/* Account */}
            <button
              onClick={() => navigate("/app/account")}
              className="flex flex-col items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-5" fill="none" viewBox="0 0 16 20">
                <path
                  d="M15 19V17C15 15.9391 14.5786 14.9217 13.8284 14.1716C13.0783 13.4214 12.0609 13 11 13H5C3.93913 13 2.92172 13.4214 2.17157 14.1716C1.42143 14.9217 1 15.9391 1 17V19"
                  stroke={isActive("/app/account") ? "#10B981" : "#94A3B8"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="8"
                  cy="5"
                  r="4"
                  stroke={isActive("/app/account") ? "#10B981" : "#94A3B8"}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              <span
                className={`text-[10px] font-bold font-['Plus_Jakarta_Sans'] ${
                  isActive("/app/account") ? "text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                Account
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTransactionModal(false)}
          />
          <div className="relative w-full max-w-[390px] animate-in slide-in-from-bottom duration-300">
            <div onClick={() => setShowTransactionModal(false)}>
              <TransactionInputWithNotesGoPayInspired />
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Transaction Button - Only on Home */}
      {location.pathname === "/app" && (
        <div className="fixed bottom-[117.5px] left-0 right-0 z-40 flex justify-center pointer-events-none">
          <button
            onClick={() => setShowTransactionModal(true)}
            className="bg-[#4edea3] flex gap-2 items-center px-6 py-4 rounded-full shadow-[0px_8px_25px_0px_rgba(16,185,129,0.4)] pointer-events-auto hover:scale-105 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path
                d="M8 3V13M3 8H13"
                stroke="#003824"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-extrabold font-['Plus_Jakarta_Sans'] text-[12px] text-[#003824] tracking-[0.3px] uppercase">
              Add Transaction
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
