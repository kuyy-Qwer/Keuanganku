import { useNavigate } from "react-router";
import svgPaths from "../../imports/WealthDashboardGoPayInspired/svg-n7u2w4cmho";
import imgImage from "../../imports/WealthDashboardGoPayInspired/f84ad6d75c01f5865641dba32416e817dee06ff5.png";
import imgUserProfile from "../../imports/WealthDashboardGoPayInspired/d54e362804804e827ce9230a7aa02bfeacd3349a.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b1326] w-full min-h-screen flex justify-center">
      <div className="w-full max-w-[390px] relative">
        {/* Top Navigation */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50 backdrop-blur-[12px] bg-[rgba(11,19,38,0.6)] flex h-16 items-center justify-between px-6">
          <div className="flex gap-3 items-center">
            <div className="relative rounded-full size-8">
              <div className="overflow-hidden rounded-full size-full">
                <img alt="User" className="size-full object-cover" src={imgUserProfile} />
              </div>
              <div className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-full" />
            </div>
            <div className="font-extrabold font-['Plus_Jakarta_Sans'] text-[12px] text-[#dae2fd] tracking-[1.2px]">
              LUMINARY
            </div>
          </div>
          <button className="bg-[#171f33] p-2 rounded-full hover:bg-[#1f2740] transition-colors">
            <svg className="w-[13.33px] h-[16.67px]" fill="none" viewBox="0 0 13.3333 16.6667">
              <path d={svgPaths.p2ab08e80} fill="#BBCABF" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="pt-20 pb-44 px-4 space-y-8">
          {/* Balance Card */}
          <div
            className="relative rounded-3xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] overflow-hidden"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)" }}
          >
            <div className="relative p-6 min-h-[180px] flex flex-col justify-between z-10">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="font-['Plus_Jakarta_Sans'] font-medium text-[11px] text-[rgba(0,56,36,0.7)] tracking-[0.55px] uppercase leading-[16.5px]">
                    Active Balance
                  </p>
                  <div className="flex gap-1 items-end">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-[20px] text-[rgba(0,56,36,0.6)] leading-[28px]">
                      $
                    </span>
                    <div className="flex items-end">
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[36px] text-[#003824] tracking-[-0.9px] leading-[40px]">
                        142,850
                      </span>
                      <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[24px] text-[rgba(0,56,36,0.6)] tracking-[-0.9px] leading-[32px]">
                        .42
                      </span>
                    </div>
                  </div>
                </div>
                <button className="bg-white/10 rounded-full p-2 border border-white/10 hover:bg-white/20 transition-colors flex-shrink-0">
                  <svg className="w-[21px] h-5" fill="none" viewBox="0 0 37 36">
                    <path d={svgPaths.p3ab27900} fill="#003824" />
                  </svg>
                </button>
              </div>

              {/* Footer Row */}
              <div className="flex items-center justify-between">
                <div className="bg-[rgba(0,56,36,0.2)] flex items-center gap-2 px-3 py-1.5 rounded-full">
                  <svg className="w-2.5 h-1.5" fill="none" viewBox="0 0 10 6">
                    <path d={svgPaths.p313692c0} fill="#003824" />
                  </svg>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] text-[#003824] leading-[16px]">
                    +12.4% <span className="font-normal">this month</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-white/40 rounded-full size-1.5" />
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[rgba(0,56,36,0.6)] tracking-[-0.5px] uppercase leading-[15px]">
                    Vault Elite
                  </span>
                </div>
              </div>

              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-10 bg-size-[24px_22px] bg-top-left pointer-events-none"
                style={{ backgroundImage: `url('${imgImage}')` }}
              />
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px] text-[#dae2fd] tracking-[-0.4px] leading-[24px]">
                Services
              </h2>
              <button className="bg-[rgba(78,222,163,0.1)] px-3 py-1 rounded-full hover:bg-[rgba(78,222,163,0.15)] transition-colors">
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[11px] text-[#4edea3] tracking-[0.55px] uppercase leading-[16.5px]">
                  See All
                </span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {/* Savings */}
              <button
                onClick={() => navigate("/app/wallet")}
                className="flex flex-col gap-2 items-center hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="bg-[rgba(79,219,200,0.1)] flex items-center justify-center rounded-2xl size-14">
                  <svg className="w-5 h-[19px]" fill="none" viewBox="0 0 20 19">
                    <path d={svgPaths.p37546d20} fill="#4FDBC8" />
                  </svg>
                </div>
                <div className="text-center space-y-0.5">
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#dae2fd] leading-[15px]">
                    Savings
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#64748b] leading-[13.5px]">
                    $84.2k
                  </p>
                </div>
              </button>

              {/* Pay */}
              <button className="flex flex-col gap-2 items-center hover:scale-105 active:scale-95 transition-transform">
                <div className="bg-[rgba(78,222,163,0.2)] flex items-center justify-center rounded-2xl size-14 relative">
                  <svg className="w-5 h-4" fill="none" viewBox="0 0 20 16">
                    <path d={svgPaths.p1fd78800} fill="#4EDEA3" />
                  </svg>
                  <div className="absolute bg-[#4edea3] right-[-2px] rounded-full size-2 top-[-2px] border-2 border-[#0b1326]" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#4edea3] leading-[15px]">
                    Pay
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] text-[9px] text-[rgba(78,222,163,0.6)] leading-[13.5px]">
                    $12.5k
                  </p>
                </div>
              </button>

              {/* Invest */}
              <button className="flex flex-col gap-2 items-center hover:scale-105 active:scale-95 transition-transform">
                <div className="bg-[rgba(233,196,0,0.1)] flex items-center justify-center rounded-2xl size-14">
                  <svg className="w-[22px] h-[17px]" fill="none" viewBox="0 0 22 17">
                    <path d={svgPaths.paad5c90} fill="#E9C400" />
                  </svg>
                </div>
                <div className="text-center space-y-0.5">
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#dae2fd] leading-[15px]">
                    Invest
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#64748b] leading-[13.5px]">
                    $46.2k
                  </p>
                </div>
              </button>

              {/* Report */}
              <button className="flex flex-col gap-2 items-center hover:scale-105 active:scale-95 transition-transform">
                <div className="bg-[#222a3d] flex items-center justify-center rounded-2xl size-14">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 18 18">
                    <path d={svgPaths.p4c2b800} fill="#BBCABF" />
                  </svg>
                </div>
                <div className="text-center space-y-0.5">
                  <p className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#dae2fd] leading-[15px]">
                    Report
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#64748b] leading-[13.5px]">
                    Weekly
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Market & Milestones */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tech Index Card */}
            <div className="h-32 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(19,27,46,0.5)] p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="bg-[rgba(255,180,171,0.1)] px-2 py-0.5 rounded-2xl">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[10px] text-[#ffb4ab] leading-[15px]">
                    -2.4%
                  </span>
                </div>
                <svg className="w-[16.67px] h-2.5" fill="none" viewBox="0 0 16.6667 10">
                  <path d={svgPaths.p1aa1cd00} fill="#FFB4AB" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[12px] text-[#dae2fd] leading-[16px]">
                  Tech Index
                </p>
                <p className="font-['Plus_Jakarta_Sans'] font-medium text-[9px] text-[#64748b] tracking-[-0.225px] uppercase leading-[13.5px]">
                  Market Exposure
                </p>
              </div>
            </div>

            {/* Target Milestone Card */}
            <div className="h-32 rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(19,27,46,0.5)] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[14px] text-[#4fdbc8] tracking-[-0.7px] leading-[20px]">
                  72%
                </span>
                <div className="bg-[rgba(79,219,200,0.1)] rounded-full p-1.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 20.8333 20.25">
                    <path d={svgPaths.pe13e000} fill="#4FDBC8" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-[#2d3449] h-1 rounded-full overflow-hidden">
                  <div className="bg-[#4fdbc8] h-full w-[72%]" />
                </div>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[9px] text-[#dae2fd] tracking-[-0.225px] uppercase leading-[13.5px]">
                  Target: $1M Vault
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}