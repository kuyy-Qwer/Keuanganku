import svgPaths from "./svg-b4suhej239";
import imgUserProfile from "./463ec4fbfb883be0da68b1a07556a63d26a53a40.png";

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold h-[16px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] tracking-[0.6px] uppercase w-[148.84px]">
        <p className="leading-[16px]">Total Balance Saved</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex gap-[8px] items-baseline relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[36px] justify-center leading-[0] relative shrink-0 text-[30px] text-white w-[181.39px]">
        <p className="leading-[36px]">$42,850.00</p>
      </div>
      <div className="h-[11.25px] relative shrink-0 w-[16.5px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 11.25">
          <path d={svgPaths.p110cf380} fill="var(--fill-0, #64748B)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-[205.89px]" data-name="Container">
      <Container2 />
      <Paragraph />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[10px] w-[51.75px]">
          <p className="leading-[15px]">GROWING</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(78,222,163,0.1)] content-stretch flex gap-[4px] items-center px-[13px] py-[5px] relative rounded-[9999px] shrink-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(78,222,163,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="bg-[#4edea3] rounded-[9999px] shrink-0 size-[6px]" data-name="Background" />
      <Container3 />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-between relative w-full">
        <Container1 />
        <OverlayBorder />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Container">
          <path d={svgPaths.p2bb32400} fill="var(--fill-0, #003824)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#4edea3] content-stretch flex items-center justify-center relative rounded-[16px] shrink-0 size-[48px]" data-name="Background">
      <div className="-translate-x-1/2 absolute bg-[rgba(255,255,255,0)] left-1/2 rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(78,222,163,0.2),0px_4px_6px_-4px_rgba(78,222,163,0.2)] size-[48px] top-0" data-name="Overlay+Shadow" />
      <Container4 />
    </div>
  );
}

function Button() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[7.75px] items-center justify-self-start pl-[10.7px] pr-[10.72px] relative row-1 self-start shrink-0" data-name="Button">
      <Background />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[11px] text-center w-[49.58px]">
        <p className="leading-[16.5px]">Add Goal</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[16px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
        <g id="Container">
          <path d={svgPaths.p278ce134} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-[#2d3449] content-stretch flex items-center justify-center p-px relative rounded-[16px] shrink-0 size-[48px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container5 />
    </div>
  );
}

function Button1() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[7.75px] items-center justify-self-start px-[11.5px] relative row-1 self-start shrink-0" data-name="Button">
      <BackgroundBorder />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[11px] text-center w-[43.13px]">
        <p className="leading-[16.5px]">Transfer</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p22876fc0} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#2d3449] content-stretch flex items-center justify-center p-px relative rounded-[16px] shrink-0 size-[48px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container6 />
    </div>
  );
}

function Button2() {
  return (
    <div className="col-3 content-stretch flex flex-col gap-[7.75px] items-center justify-self-start px-[11.5px] relative row-1 self-start shrink-0" data-name="Button">
      <BackgroundBorder1 />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[11px] text-center w-[38.72px]">
        <p className="leading-[16.5px]">History</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[17px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 17">
        <g id="Container">
          <path d={svgPaths.paad5c90} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-[#2d3449] content-stretch flex items-center justify-center p-px relative rounded-[16px] shrink-0 size-[48px]" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Container7 />
    </div>
  );
}

function Button3() {
  return (
    <div className="col-4 content-stretch flex flex-col gap-[7.75px] items-center justify-self-start px-[11.5px] relative row-1 self-start shrink-0" data-name="Button">
      <BackgroundBorder2 />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[11px] text-center w-[44.05px]">
        <p className="leading-[16.5px]">Analysis</p>
      </div>
    </div>
  );
}

function QuickActionsRow() {
  return (
    <div className="relative shrink-0 w-full" data-name="Quick Actions Row">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid gap-x-[8px] gap-y-[8px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[_72.50px] relative w-full">
        <Button />
        <Button1 />
        <Button2 />
        <Button3 />
      </div>
    </div>
  );
}

function SectionBalanceAccountViewGoPayStyle() {
  return (
    <div className="bg-[#131b2e] relative rounded-[16px] shrink-0 w-full" data-name="Section - Balance / Account View (GoPay Style)">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[25px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[16px] shadow-[0px_4px_24px_-1px_rgba(0,0,0,0.2)]" data-name="Section - Balance / Account View (GoPay Style):shadow" />
        <Container />
        <QuickActionsRow />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[18px] text-white w-[164.48px]">
        <p className="leading-[28px]">Your Savings Goals</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[14px] text-center w-[45.72px]">
        <p className="leading-[20px]">See All</p>
      </div>
    </div>
  );
}

function SavingsGoalsListHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="Savings Goals List Header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pt-[8px] px-[8px] relative w-full">
          <Heading />
          <Button4 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[15px] relative shrink-0 w-[27.5px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.5 15">
        <g id="Container">
          <path d={svgPaths.p1f474600} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder1() {
  return (
    <div className="bg-[rgba(78,222,163,0.1)] relative rounded-[16px] shrink-0 size-[56px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(78,222,163,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold items-start justify-between leading-[0] relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col h-[16px] justify-center relative shrink-0 text-[16px] text-white w-[152.09px]">
        <p className="leading-[16px]">Alpine Retreat Fund</p>
      </div>
      <div className="flex flex-col h-[16px] justify-center relative shrink-0 text-[#64748b] text-[12px] tracking-[-0.6px] uppercase w-[53.2px]">
        <p className="leading-[16px]">Dec 2024</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-full">
        <p>
          <span className="leading-[16px]">{`Saved: `}</span>
          <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[16px] text-white">$12,400</span>
          <span className="leading-[16px]">{` / $25,000`}</span>
        </p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#0b1326] h-[8px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#4edea3] inset-[0_50.4%_0_0] rounded-[9999px]" data-name="Background" />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[10px] tracking-[0.25px] w-[83.25px]">
        <p className="leading-[15px]">49% PROGRESS</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[93.84px]">
        <p className="leading-[15px]">+$1,200 this month</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex h-[19px] items-start justify-between pt-[4px] relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Container9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Paragraph1 />
        <Container10 />
        <Background1 />
        <Container11 />
      </div>
    </div>
  );
}

function GoalCard1AlpineRetreat() {
  return (
    <div className="bg-[#171f33] relative rounded-[16px] shrink-0 w-full" data-name="Goal Card 1: Alpine Retreat">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[16px] items-start p-[17px] relative w-full">
          <OverlayBorder1 />
          <Container9 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 size-[25.063px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.0625 25.0625">
        <g id="Container">
          <path d={svgPaths.p155ca820} fill="var(--fill-0, #E9C400)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder2() {
  return (
    <div className="bg-[rgba(233,196,0,0.1)] relative rounded-[16px] shrink-0 size-[56px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(233,196,0,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <Container14 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold items-start justify-between leading-[0] relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col h-[16px] justify-center relative shrink-0 text-[16px] text-white w-[130.7px]">
        <p className="leading-[16px]">Emergency Fund</p>
      </div>
      <div className="flex flex-col h-[16px] justify-center relative shrink-0 text-[#e9c400] text-[12px] w-[85.52px]">
        <p className="leading-[16px]">NEARLY THERE</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-full">
        <p>
          <span className="leading-[16px]">{`Saved: `}</span>
          <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[16px] text-white">$9,200</span>
          <span className="leading-[16px]">{` / $10,000`}</span>
        </p>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#0b1326] h-[8px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#e9c400] inset-[0_8%_0_0] rounded-[9999px] shadow-[0px_0px_8px_0px_rgba(233,196,0,0.3)]" data-name="Background+Shadow" />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#e9c400] text-[10px] tracking-[0.25px] w-full">
        <p className="leading-[15px]">92% PROGRESS</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex h-[19px] items-start pt-[4px] relative shrink-0 w-full" data-name="Container">
      <Container18 />
    </div>
  );
}

function Container15() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Paragraph2 />
        <Container16 />
        <Background2 />
        <Container17 />
      </div>
    </div>
  );
}

function GoalCard2Emergency() {
  return (
    <div className="bg-[#171f33] relative rounded-[16px] shrink-0 w-full" data-name="Goal Card 2: Emergency">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[16px] items-start p-[17px] relative w-full">
          <OverlayBorder2 />
          <Container15 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[20px] relative shrink-0 w-[22.5px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5 20">
        <g id="Container">
          <path d={svgPaths.p2b4ecc20} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder3() {
  return (
    <div className="bg-[rgba(79,219,200,0.1)] relative rounded-[16px] shrink-0 size-[56px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(79,219,200,0.1)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <Container19 />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold items-start justify-between leading-[0] relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col h-[16px] justify-center relative shrink-0 text-[16px] text-white w-[104.23px]">
        <p className="leading-[16px]">Tesla Model S</p>
      </div>
      <div className="flex flex-col h-[16px] justify-center relative shrink-0 text-[#64748b] text-[12px] w-[65.34px]">
        <p className="leading-[16px]">NEW GOAL</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] w-full">
        <p>
          <span className="leading-[16px]">{`Saved: `}</span>
          <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[16px] text-white">$15,000</span>
          <span className="leading-[16px]">{` / $100,000`}</span>
        </p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#0b1326] h-[8px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#4fdbc8] inset-[0_85%_0_0] rounded-[9999px]" data-name="Background" />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#4fdbc8] text-[10px] tracking-[0.25px] w-full">
        <p className="leading-[15px]">15% PROGRESS</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex h-[19px] items-start pt-[4px] relative shrink-0 w-full" data-name="Container">
      <Container23 />
    </div>
  );
}

function Container20() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Paragraph3 />
        <Container21 />
        <Background3 />
        <Container22 />
      </div>
    </div>
  );
}

function GoalCard3Tesla() {
  return (
    <div className="bg-[#171f33] relative rounded-[16px] shrink-0 w-full" data-name="Goal Card 3: Tesla">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[16px] items-start p-[17px] relative w-full">
          <OverlayBorder3 />
          <Container20 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function SectionStructuredGoalCards() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Section - Structured Goal Cards">
      <GoalCard1AlpineRetreat />
      <GoalCard2Emergency />
      <GoalCard3Tesla />
    </div>
  );
}

function Container24() {
  return (
    <div className="relative shrink-0 size-[18.333px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
        <g id="Container">
          <path d={svgPaths.p3ca8ed80} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(78,222,163,0.2)] relative rounded-[9999px] shrink-0 size-[40px]" data-name="Overlay">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container24 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] relative shrink-0 text-[12px] text-white w-[183.27px]">
        <p className="leading-[16.5px]">Boost your Alpine fund by $200</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[16.5px]" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[15px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[10px] w-[162.72px]">
        <p className="leading-[15px]">Based on your spending this week.</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="flex-[1_0_0] h-[31.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container26 />
        <Container27 />
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#4edea3] relative rounded-[32px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center px-[12px] py-[6px] relative">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_0_0.5px_0] rounded-[32px] shadow-[0px_10px_15px_-3px_rgba(78,222,163,0.2),0px_4px_6px_-4px_rgba(78,222,163,0.2)]" data-name="Button:shadow" />
        <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[17px] justify-center leading-[0] relative shrink-0 text-[#003824] text-[11px] text-center w-[32.34px]">
          <p className="leading-[16.5px]">Apply</p>
        </div>
      </div>
    </div>
  );
}

function SectionAiInsightSuggestionGoPayStyleBanner() {
  return (
    <div className="bg-gradient-to-r from-[rgba(16,185,129,0.2)] relative rounded-[16px] shrink-0 to-[rgba(16,185,129,0)] w-full" data-name="Section - AI Insight / Suggestion (GoPay style banner)">
      <div aria-hidden="true" className="absolute border border-[rgba(78,222,163,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center p-[21px] relative w-full">
          <Overlay />
          <Container25 />
          <Button5 />
        </div>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#64748b] text-[12px] tracking-[1.2px] uppercase w-full">
          <p className="leading-[16px]">Wealth Distribution</p>
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] relative shrink-0 text-[12px] text-white w-[83.42px]">
        <p className="leading-[12px]">Liquid Savings</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[68.25px]">
        <p className="leading-[15px]">Instant access</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[83.42px]" data-name="Container">
      <Container32 />
      <Container33 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <div className="bg-[#4edea3] h-[24px] rounded-[9999px] shrink-0 w-[6px]" data-name="Background" />
      <Container31 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[14px] text-white w-[56.73px]">
        <p className="leading-[20px]">$18,200</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container30 />
      <Container34 />
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[12px] justify-center leading-[0] relative shrink-0 text-[12px] text-white w-[72.17px]">
        <p className="leading-[12px]">Investments</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[15px] justify-center leading-[0] relative shrink-0 text-[#64748b] text-[10px] w-[105.06px]">
        <p className="leading-[15px]">Compounding growth</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[105.06px]" data-name="Container">
      <Container38 />
      <Container39 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <div className="bg-[#4fdbc8] h-[24px] rounded-[9999px] shrink-0 w-[6px]" data-name="Background" />
      <Container37 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[14px] text-white w-[58.39px]">
        <p className="leading-[20px]">$24,650</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container36 />
      <Container40 />
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative w-full">
        <Container29 />
        <Container35 />
      </div>
    </div>
  );
}

function SectionWealthDistributionSmallSummary() {
  return (
    <div className="bg-[#131b2e] relative rounded-[16px] shrink-0 w-full" data-name="Section - Wealth Distribution Small Summary">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[21px] relative w-full">
        <Heading1 />
        <Container28 />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="max-w-[672px] relative shrink-0 w-full" data-name="Main Content">
      <div className="content-stretch flex flex-col gap-[24px] items-start max-w-[inherit] pt-[96px] px-[16px] relative w-full">
        <SectionBalanceAccountViewGoPayStyle />
        <SavingsGoalsListHeader />
        <SectionStructuredGoalCards />
        <SectionAiInsightSuggestionGoPayStyleBanner />
        <SectionWealthDistributionSmallSummary />
      </div>
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
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <UserProfile />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(78,222,163,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[20px] tracking-[4px] uppercase w-[135.55px]">
        <p className="leading-[28px]">LUMINARY</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Container">
      <Border />
      <Container42 />
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.p164b49c0} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container43 />
    </div>
  );
}

function HeaderTopAppBarSharedComponent() {
  return (
    <div className="absolute bg-[#0b1326] content-stretch flex h-[80px] items-center justify-between left-0 px-[24px] top-0 w-[390px]" data-name="Header - TopAppBar (Shared Component)">
      <Container41 />
      <Button6 />
    </div>
  );
}

function Container44() {
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

function Margin() {
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
      <Container44 />
      <Margin />
    </div>
  );
}

function Container45() {
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

function Margin1() {
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
      <Container45 />
      <Margin1 />
    </div>
  );
}

function Container46() {
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

function Margin2() {
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
      <Container46 />
      <Margin2 />
    </div>
  );
}

function Container47() {
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

function Margin3() {
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
      <Container47 />
      <Margin3 />
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
    <div className="absolute bottom-[32px] content-stretch flex flex-col items-start left-0 px-[16px] right-0" data-name="Bottom Navigation (Refined)">
      <Nav />
    </div>
  );
}

export default function SavingsTargetsGoPayInspired() {
  return (
    <div className="bg-[#0b1326] content-stretch flex flex-col items-start pb-[128px] relative size-full" data-name="Savings & Targets - GoPay Inspired">
      <MainContent />
      <HeaderTopAppBarSharedComponent />

    </div>
  );
}