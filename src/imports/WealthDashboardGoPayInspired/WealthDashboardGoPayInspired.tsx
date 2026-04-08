import svgPaths from "./svg-n7u2w4cmho";
import imgImage from "./f84ad6d75c01f5865641dba32416e817dee06ff5.png";
import imgUserProfile from "./d54e362804804e827ce9230a7aa02bfeacd3349a.png";

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium h-[17px] justify-center leading-[0] relative shrink-0 text-[11px] text-[rgba(0,56,36,0.7)] tracking-[0.55px] uppercase w-[99.53px]">
        <p className="leading-[16.5px]">Active Balance</p>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold items-end relative shrink-0 tracking-[-0.9px]" data-name="Heading 1">
      <div className="flex flex-col h-[40px] justify-center relative shrink-0 text-[#003824] text-[36px] w-[137.86px]">
        <p className="leading-[40px]">142,850</p>
      </div>
      <div className="flex flex-col h-[32px] justify-center relative shrink-0 text-[24px] text-[rgba(0,56,36,0.6)] w-[37.3px]">
        <p className="leading-[32px]">.42</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex gap-[4px] items-end leading-[0] left-0 right-0 top-[20.5px]" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center relative shrink-0 text-[20px] text-[rgba(0,56,36,0.6)] w-[12.95px]">
        <p className="leading-[28px]">$</p>
      </div>
      <Heading />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[60.5px] relative shrink-0 w-[192.11px]" data-name="Container">
      <Container2 />
      <Container3 />
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="h-[36px] relative shrink-0 w-[37px]" data-name="Overlay+Border">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37 36">
        <g id="Overlay+Border">
          <rect fill="var(--fill-0, white)" fillOpacity="0.1" height="36" rx="18" width="37" />
          <rect height="35" rx="17.5" stroke="var(--stroke-0, white)" strokeOpacity="0.1" width="36" x="0.5" y="0.5" />
          <path d={svgPaths.p3ab27900} fill="var(--fill-0, #003824)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <OverlayBorder />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[6px] relative shrink-0 w-[10px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
        <g id="Container">
          <path d={svgPaths.p313692c0} fill="var(--fill-0, #003824)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] relative shrink-0 text-[#003824] text-[12px] w-[106.59px]">
        <p>
          <span className="leading-[16px]">{`+12.4% `}</span>
          <span className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[16px]">this month</span>
        </p>
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(0,56,36,0.2)] content-stretch flex gap-[8px] items-center px-[12px] py-[6px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[10px] text-[rgba(0,56,36,0.6)] tracking-[-0.5px] uppercase w-[52.7px]">
        <p className="leading-[15px]">Vault Elite</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Container">
      <div className="bg-[rgba(255,255,255,0.4)] rounded-[9999px] shrink-0 size-[6px]" data-name="Overlay" />
      <Container8 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Overlay />
      <Container7 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[24px] relative shrink-0 w-full" data-name="Margin">
      <Container4 />
    </div>
  );
}

function SectionWalletCardGoPayInspired() {
  return (
    <div className="min-h-[180px] relative rounded-[24px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0 w-full" data-name="Section - Wallet Card (GoPay Inspired)" style={{ backgroundImage: "linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)" }}>
      <div className="min-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-between min-h-[inherit] p-[24px] relative w-full">
          <Container />
          <Margin />
          <div className="absolute bg-size-[24px_22px] bg-top-left inset-0 opacity-10" data-name="Image" style={{ backgroundImage: `url('${imgImage}')` }} />
        </div>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[24px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[16px] tracking-[-0.4px] w-[64.38px]">
        <p className="leading-[24px]">Services</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(78,222,163,0.1)] content-stretch flex flex-col items-center justify-center px-[12px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[11px] text-center tracking-[0.55px] uppercase w-[45.8px]">
        <p className="leading-[16.5px]">See All</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading1 />
      <Button />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[19px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 19">
        <g id="Container">
          <path d={svgPaths.p37546d20} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(79,219,200,0.1)] content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 size-[56px]" data-name="Overlay">
      <Container11 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[10px] text-center w-[37.89px]">
        <p className="leading-[15px]">Savings</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[14px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[9px] text-center w-[30.05px]">
        <p className="leading-[13.5px]">$84.2k</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[37.89px]" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function ButtonSavings() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center justify-self-start px-[10.75px] relative row-1 self-start shrink-0" data-name="Button - Savings">
      <Overlay1 />
      <Container12 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[16px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
        <g id="Container">
          <path d={svgPaths.p1fd78800} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(78,222,163,0.2)] content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 size-[56px]" data-name="Overlay">
      <Container15 />
      <div className="absolute bg-[#4edea3] right-[-2px] rounded-[9999px] size-[8px] top-[-2px]" data-name="Background+Border">
        <div aria-hidden="true" className="absolute border-2 border-[#0b1326] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[10px] text-center w-[17.83px]">
        <p className="leading-[15px]">Pay</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[14px] justify-center leading-[0] relative shrink-0 text-[9px] text-[rgba(78,222,163,0.6)] text-center w-[27.61px]">
        <p className="leading-[13.5px]">$12.5k</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[27.61px]" data-name="Container">
      <Container17 />
      <Container18 />
    </div>
  );
}

function ButtonSpending() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[8px] items-center justify-self-start px-[10.75px] relative row-1 self-start shrink-0" data-name="Button - Spending">
      <Overlay2 />
      <Container16 />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[17px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 17">
        <g id="Container">
          <path d={svgPaths.paad5c90} fill="var(--fill-0, #E9C400)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(233,196,0,0.1)] content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 size-[56px]" data-name="Overlay">
      <Container19 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[10px] text-center w-[29.58px]">
        <p className="leading-[15px]">Invest</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[14px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[9px] text-center w-[29.77px]">
        <p className="leading-[13.5px]">$46.2k</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[29.77px]" data-name="Container">
      <Container21 />
      <Container22 />
    </div>
  );
}

function ButtonInvest() {
  return (
    <div className="col-3 content-stretch flex flex-col gap-[8px] items-center justify-self-start px-[10.75px] relative row-1 self-start shrink-0" data-name="Button - Invest">
      <Overlay3 />
      <Container20 />
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p4c2b800} fill="var(--fill-0, #BBCABF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#222a3d] content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 size-[56px]" data-name="Background">
      <Container23 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[10px] text-center w-[33.7px]">
        <p className="leading-[15px]">Report</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[14px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[9px] text-center w-[31.39px]">
        <p className="leading-[13.5px]">Weekly</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[33.7px]" data-name="Container">
      <Container25 />
      <Container26 />
    </div>
  );
}

function ButtonAnalytics() {
  return (
    <div className="col-4 content-stretch flex flex-col gap-[8px] items-center justify-self-start px-[10.75px] relative row-1 self-start shrink-0" data-name="Button - Analytics">
      <Background />
      <Container24 />
    </div>
  );
}

function Container10() {
  return (
    <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_92.50px] relative shrink-0 w-full" data-name="Container">
      <ButtonSavings />
      <ButtonSpending />
      <ButtonInvest />
      <ButtonAnalytics />
    </div>
  );
}

function SectionShortcutsPillarsGridLayoutLikeGoPay() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Section - Shortcuts / Pillars (Grid Layout like GoPay)">
      <Container9 />
      <Container10 />
    </div>
  );
}

function Overlay4() {
  return (
    <div className="bg-[rgba(255,180,171,0.1)] content-stretch flex flex-col items-start px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#ffb4ab] text-[10px] w-[32.75px]">
        <p className="leading-[15px]">-2.4%</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative w-full">
        <Overlay4 />
        <div className="h-[10px] relative shrink-0 w-[16.667px]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 10">
            <path d={svgPaths.p1aa1cd00} fill="var(--fill-0, #FFB4AB)" id="Icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[12px] w-full">
        <p className="leading-[16px]">Tech Index</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#64748b] text-[9px] tracking-[-0.225px] uppercase w-full">
        <p className="leading-[13.5px]">Market Exposure</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative w-full">
        <Heading2 />
        <Container29 />
      </div>
    </div>
  );
}

function CompactMarket() {
  return (
    <div className="col-1 h-[128px] justify-self-stretch relative rounded-[24px] row-1 shrink-0" data-name="Compact Market">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[24px]" />
      <div className="content-stretch flex flex-col items-start justify-between p-[17px] relative size-full">
        <Container27 />
        <Container28 />
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[20px] justify-center leading-[0] relative shrink-0 text-[#4fdbc8] text-[14px] tracking-[-0.7px] w-[29.13px]">
        <p className="leading-[20px]">72%</p>
      </div>
    </div>
  );
}

function Overlay5() {
  return (
    <div className="h-[20.25px] relative shrink-0 w-[20.833px]" data-name="Overlay">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.8333 20.25">
        <g id="Overlay">
          <rect fill="var(--fill-0, #4FDBC8)" fillOpacity="0.1" height="20.25" rx="10.125" width="20.8333" />
          <path d={svgPaths.pe13e000} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Container31 />
        <Overlay5 />
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#2d3449] h-[4px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#4fdbc8] inset-[0_28.01%_0_0]" data-name="Background" />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[9px] tracking-[-0.225px] uppercase w-full">
        <p className="leading-[13.5px]">Target: $1M Vault</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <Background1 />
        <Container33 />
      </div>
    </div>
  );
}

function CompactMilestone() {
  return (
    <div className="col-2 h-[128px] justify-self-stretch relative rounded-[24px] row-1 shrink-0" data-name="Compact Milestone">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[24px]" />
      <div className="content-stretch flex flex-col items-start justify-between p-[17px] relative size-full">
        <Container30 />
        <Container32 />
      </div>
    </div>
  );
}

function SectionMarketMilestonesCompactCards() {
  return (
    <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_128px] relative shrink-0 w-full" data-name="Section - Market & Milestones (Compact Cards)">
      <CompactMarket />
      <CompactMilestone />
    </div>
  );
}

function MainContent() {
  return (
    <div className="max-w-[672px] relative shrink-0 w-full" data-name="Main Content">
      <div className="content-stretch flex flex-col gap-[32px] items-start max-w-[inherit] pb-[176px] pt-[80px] px-[16px] relative w-full">
        <SectionWalletCardGoPayInspired />
        <SectionShortcutsPillarsGridLayoutLikeGoPay />
        <SectionMarketMilestonesCompactCards />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="relative shrink-0 size-[16.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
        <g id="Container">
          <path d={svgPaths.p2f06d100} fill="var(--fill-0, #003824)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[18px] justify-center leading-[0] relative shrink-0 text-[#003824] text-[12px] text-center tracking-[0.3px] uppercase w-[120.34px]">
        <p className="leading-[18px]">Add Transaction</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#4edea3] content-stretch flex gap-[8px] items-center px-[24px] py-[16px] relative rounded-[9999px] shadow-[0px_8px_25px_0px_rgba(16,185,129,0.4)] shrink-0" data-name="Button">
      <Container34 />
      <Container35 />
    </div>
  );
}

function FloatingActionButtonGoPayStyleTactile() {
  return (
    <div className="absolute bottom-[117.5px] content-stretch flex items-start justify-center left-0 right-0" data-name="Floating Action Button (GoPay Style Tactile)">
      <Button1 />
    </div>
  );
}

function UserProfile() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="User Profile">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUserProfile} />
      </div>
    </div>
  );
}

function Border() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[32px]" data-name="Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <UserProfile />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[16px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[12px] tracking-[1.2px] w-[72.64px]">
        <p className="leading-[16px]">LUMINARY</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <Border />
      <Container37 />
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[16.667px] relative shrink-0 w-[13.333px]" data-name="Button">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 16.6667">
        <g id="Button">
          <path d={svgPaths.p2ab08e80} fill="var(--fill-0, #BBCABF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#171f33] content-stretch flex flex-col items-start p-[8px] relative rounded-[9999px] shrink-0" data-name="Background">
      <Button2 />
    </div>
  );
}

function TopNavigation() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(11,19,38,0.6)] content-stretch flex h-[64px] items-center justify-between left-0 px-[24px] top-0 w-[390px]" data-name="Top Navigation">
      <Container36 />
      <Background2 />
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
        <g id="Container">
          <path d={svgPaths.p1820480} fill="var(--fill-0, #10B981)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#10b981] text-[10px] w-[29.22px]">
        <p className="leading-[15px]">Home</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[9px] right-[267.81px] top-1/2" data-name="Link">
      <Container38 />
      <Margin1 />
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[18px] relative shrink-0 w-[19px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 18">
        <g id="Container">
          <path d={svgPaths.p53fc80} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[30.89px]">
        <p className="leading-[15px]">Wallet</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[90.19px] right-[186.62px] top-1/2" data-name="Link">
      <Container39 />
      <Margin2 />
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[20px] relative shrink-0 w-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g id="Container">
          <path d={svgPaths.p396ca1c0} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[35.2px]">
        <p className="leading-[15px]">History</p>
      </div>
    </div>
  );
}

function LinkSpacerForFab() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[186.66px] right-[90.15px] top-1/2" data-name="Link - Spacer for FAB">
      <Container40 />
      <Margin3 />
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p85bff00} fill="var(--fill-0, #64748B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[2px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[41.59px]">
        <p className="leading-[15px]">Account</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-center justify-center left-[267.84px] right-[8.97px] top-1/2" data-name="Link">
      <Container41 />
      <Margin4 />
    </div>
  );
}

function Nav() {
  return (
    <div className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.04)] h-[64px] max-w-[384px] relative rounded-[9999px] shrink-0 w-full" data-name="Nav">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="absolute bg-[rgba(255,255,255,0)] h-[64px] left-0 right-0 rounded-[9999px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] top-0" data-name="Nav:shadow" />
      <Link />
      <Link1 />
      <LinkSpacerForFab />
      <Link2 />
    </div>
  );
}

function BottomNavigationRefined() {
  return (
    <div className="absolute bottom-[23.5px] content-stretch flex flex-col items-start left-0 px-[16px] right-0" data-name="Bottom Navigation (Refined)">
      <Nav />
    </div>
  );
}

export default function WealthDashboardGoPayInspired() {
  return (
    <div className="bg-[#0b1326] content-stretch flex flex-col items-start pb-[123px] relative size-full" data-name="Wealth Dashboard - GoPay Inspired">
      <MainContent />
      <FloatingActionButtonGoPayStyleTactile />
      <TopNavigation />
      <BottomNavigationRefined />
    </div>
  );
}