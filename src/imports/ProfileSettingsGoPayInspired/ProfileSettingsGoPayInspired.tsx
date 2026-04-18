import svgPaths from "./svg-shra2amx3w";
import imgAlexanderSterling from "./8e9f82f484bdee6b7ee19eff1312061ddd2a0c08.png";

function Heading2Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[42.31px] pb-[8px] top-[152px]" data-name="Heading 2:margin">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[36px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[30px] tracking-[-0.75px] w-[257.38px]">
        <p className="leading-[36px]">Alexander Sterling</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[15.75px] relative shrink-0 w-[12px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 15.75">
        <g id="Container">
          <path d={svgPaths.pf31d500} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#4edea3] text-[12px] tracking-[0.6px] uppercase w-[95.7px]">
          <p className="leading-[16px]">Gold Member</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorderShadow() {
  return (
    <div className="-translate-x-1/2 absolute bg-[rgba(78,222,163,0.1)] content-stretch flex gap-[8px] items-center left-[calc(50%-0.01px)] px-[17px] py-[7px] rounded-[9999px] top-[196px]" data-name="Overlay+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[rgba(78,222,163,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px] shadow-[0px_0px_20px_0px_rgba(78,222,163,0.15)]" />
      <Container />
      <Container1 />
    </div>
  );
}

function AlexanderSterling() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px pointer-events-none relative rounded-[9999px] w-full" data-name="Alexander Sterling">
      <div className="absolute inset-0 overflow-hidden rounded-[9999px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAlexanderSterling} />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-[#0b1326] border-solid inset-0 rounded-[9999px]" />
    </div>
  );
}

function Background() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center p-[4px] relative rounded-[9999px] shrink-0 size-[128px]" data-name="Background" style={{ backgroundImage: "linear-gradient(135deg, rgb(78, 222, 163) 0%, rgb(4, 180, 162) 100%)" }}>
      <AlexanderSterling />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="absolute bottom-[-8px] h-[28.25px] right-[-8px] w-[28.833px]" data-name="Background+Shadow">
      <div className="absolute inset-[-53.1%_-52.02%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 58.8333 58.25">
          <g filter="url(#filter0_d_1_1003)" id="Background+Shadow">
            <rect fill="var(--fill-0, #4EDEA3)" height="28.25" rx="14.125" shapeRendering="crispEdges" width="28.8333" x="15" y="15" />
            <path d={svgPaths.p21137000} fill="var(--fill-0, #003824)" id="Icon" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="58.25" id="filter0_d_1_1003" width="58.8333" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset />
              <feGaussianBlur stdDeviation="7.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.305882 0 0 0 0 0.870588 0 0 0 0 0.639216 0 0 0 0.4 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_1003" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_1003" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Background />
      <BackgroundShadow />
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[107px] pb-[24px] top-0" data-name="Margin">
      <Container2 />
    </div>
  );
}

function SectionUserProfileCard() {
  return (
    <div className="h-[238px] relative shrink-0 w-full" data-name="Section - User Profile Card">
      <Heading2Margin />
      <OverlayBorderShadow />
      <Margin />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#bbcabf] text-[12px] text-center tracking-[1.2px] uppercase w-[120.88px]">
        <p className="leading-[16px]">Security Score</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0" data-name="Margin">
      <Container3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[24px] text-center w-[54.73px]">
        <p className="leading-[32px]">98%</p>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#2d3449] h-[4px] overflow-clip relative rounded-[9999px] shrink-0 w-[64px]" data-name="Background">
      <div className="absolute bg-[#4edea3] inset-[0_2%_0_0]" data-name="Background" />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col h-[12px] items-start pt-[8px] relative shrink-0 w-[64px]" data-name="Margin">
      <Background2 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#131b2e] col-1 justify-self-stretch relative rounded-[32px] row-1 self-start shrink-0" data-name="Background">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[20px] py-[25.5px] relative w-full">
          <Margin1 />
          <Container4 />
          <Margin2 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#bbcabf] text-[12px] text-center tracking-[1.2px] uppercase w-[105.77px]">
        <p className="leading-[16px]">Member Since</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0" data-name="Margin">
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[32px] justify-center leading-[0] relative shrink-0 text-[#4fdbc8] text-[24px] text-center w-[59.98px]">
        <p className="leading-[32px]">2022</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-center opacity-60 relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal h-[15px] italic justify-center leading-[0] relative shrink-0 text-[#bbcabf] text-[10px] text-center w-[67px]">
        <p className="leading-[15px]">Legacy Status</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <Container7 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#131b2e] col-2 justify-self-stretch relative rounded-[32px] row-1 self-start shrink-0" data-name="Background">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[20px] relative w-full">
          <Margin3 />
          <Container6 />
          <Margin4 />
        </div>
      </div>
    </div>
  );
}

function SectionQuickActionStats() {
  return (
    <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_115px] relative shrink-0 w-full" data-name="Section - Quick Action Stats">
      <Background1 />
      <Background3 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[334px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#bbcabf] text-[14px] tracking-[2.8px] uppercase w-[91.14px]">
        <p className="leading-[20px]">Account</p>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="relative shrink-0 size-[36px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="36" rx="18" width="36" />
          <path d={svgPaths.p35f18080} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[158.8px]">
        <p className="leading-[24px]">Personal Information</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Background5 />
      <Container9 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative w-full">
          <Container8 />
          <Container10 />
        </div>
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="40" rx="20" width="40" />
          <path d={svgPaths.p20659500} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[169.8px]">
        <p className="leading-[24px]">Linked Bank Accounts</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Background6 />
        <Container12 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[20px] pt-[21px] px-[20px] relative w-full">
          <Container11 />
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="h-[40px] relative shrink-0 w-[36px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 40">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="40" rx="18" width="36" />
          <path d={svgPaths.p2ebddf00} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[87.23px]">
        <p className="leading-[24px]">Documents</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Background7 />
        <Container15 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[20px] pt-[21px] px-[20px] relative w-full">
          <Container14 />
          <Container16 />
        </div>
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#131b2e] content-stretch flex flex-col items-start overflow-clip relative rounded-[32px] shrink-0 w-full" data-name="Background">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}

function AccountSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-end relative shrink-0 w-full" data-name="Account Section">
      <Heading1 />
      <Background4 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[334px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#bbcabf] text-[14px] tracking-[2.8px] uppercase w-[90.67px]">
        <p className="leading-[20px]">Security</p>
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div className="h-[39.964px] relative shrink-0 w-[38.049px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38.049 39.9643">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="39.9643" rx="19.0245" width="38.049" />
          <path d={svgPaths.p4740d80} fill="var(--fill-0, #E9C400)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] w-[171.48px]">
        <p className="leading-[24px]">Fingerprint/Biometrics</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Background9 />
      <Container19 />
    </div>
  );
}

function ToggleSwitch() {
  return (
    <div className="bg-[#4edea3] h-[24px] relative rounded-[9999px] shadow-[0px_0px_10px_0px_rgba(78,222,163,0.3)] shrink-0 w-[48px]" data-name="Toggle Switch">
      <div className="absolute bg-[#003824] right-[4px] rounded-[9999px] size-[16px] top-[4px]" data-name="Background" />
    </div>
  );
}

function Container17() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative w-full">
          <Container18 />
          <ToggleSwitch />
        </div>
      </div>
    </div>
  );
}

function Background10() {
  return (
    <div className="h-[32px] relative shrink-0 w-[42px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 32">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="32" rx="16" width="42" />
          <path d={svgPaths.p182e100} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[90.38px]">
        <p className="leading-[24px]">Change PIN</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Background10 />
        <Container21 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[20px] pt-[21px] px-[20px] relative w-full">
          <Container20 />
          <Container22 />
        </div>
      </div>
    </div>
  );
}

function Background11() {
  return (
    <div className="h-[40px] relative shrink-0 w-[36px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 40">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="40" rx="18" width="36" />
          <path d={svgPaths.p334fa880} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[123.95px]">
        <p className="leading-[24px]">Privacy Settings</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Background11 />
        <Container24 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[20px] pt-[21px] px-[20px] relative w-full">
          <Container23 />
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#131b2e] content-stretch flex flex-col items-start overflow-clip relative rounded-[32px] shrink-0 w-full" data-name="Background">
      <Container17 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-end relative shrink-0 w-full" data-name="Security Section">
      <Heading2 />
      <Background8 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[334px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#bbcabf] text-[14px] tracking-[2.8px] uppercase w-[171.98px]">
        <p className="leading-[20px]">App Preferences</p>
      </div>
    </div>
  );
}

function Background13() {
  return (
    <div className="h-[40px] relative shrink-0 w-[36px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 40">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="40" rx="18" width="36" />
          <path d={svgPaths.p3fb31340} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[97.25px]">
        <p className="leading-[24px]">Notifications</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Background13 />
      <Container27 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(78,222,163,0.1)] content-stretch flex flex-col items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#4edea3] text-[12px] text-center w-[46.72px]">
        <p className="leading-[16px]">Enabled</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative w-full">
          <Container26 />
          <Overlay />
        </div>
      </div>
    </div>
  );
}

function Background14() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="40" rx="20" width="40" />
          <path d={svgPaths.p97bb880} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[75.7px]">
        <p className="leading-[24px]">Language</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Background14 />
        <Container29 />
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#bbcabf] text-[14px] text-center w-[47.73px]">
        <p className="leading-[20px]">English</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
        <Container31 />
        <Container32 />
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[20px] pt-[21px] px-[20px] relative w-full">
          <Container28 />
          <Container30 />
        </div>
      </div>
    </div>
  );
}

function Background15() {
  return (
    <div className="relative shrink-0 size-[38px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 38">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="38" rx="19" width="38" />
          <path d={svgPaths.p2599b620} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[53.08px]">
        <p className="leading-[24px]">Theme</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Background15 />
        <Container34 />
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#bbcabf] text-[14px] text-center w-[72.86px]">
        <p className="leading-[20px]">Dark Mode</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.99px] items-center relative">
        <Container36 />
        <Container37 />
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[20px] pl-[20px] pr-[19.99px] pt-[21px] relative w-full">
          <Container33 />
          <Container35 />
        </div>
      </div>
    </div>
  );
}

function Background12() {
  return (
    <div className="bg-[#131b2e] content-stretch flex flex-col items-start overflow-clip relative rounded-[32px] shrink-0 w-full" data-name="Background">
      <Button5 />
      <Button6 />
      <Button7 />
    </div>
  );
}

function AppPreferencesSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-end relative shrink-0 w-full" data-name="App Preferences Section">
      <Heading3 />
      <Background12 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[334px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#bbcabf] text-[14px] tracking-[2.8px] uppercase w-[85.72px]">
        <p className="leading-[20px]">Support</p>
      </div>
    </div>
  );
}

function Background17() {
  return (
    <div className="relative shrink-0 size-[38px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 38">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="38" rx="19" width="38" />
          <path d={svgPaths.p6058e60} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[91.14px]">
        <p className="leading-[24px]">Help Center</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Background17 />
      <Container39 />
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative w-full">
          <Container38 />
          <Container40 />
        </div>
      </div>
    </div>
  );
}

function Background18() {
  return (
    <div className="h-[39px] relative shrink-0 w-[38px]" data-name="Background">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 39">
        <g id="Background">
          <rect fill="var(--fill-0, #2D3449)" height="39" rx="19" width="38" />
          <path d={svgPaths.p3c375f00} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[16px] text-center w-[130.13px]">
        <p className="leading-[24px]">Terms of Service</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Background18 />
        <Container42 />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.4 12">
        <g id="Container">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #3C4A42)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[20px] pt-[21px] px-[20px] relative w-full">
          <Container41 />
          <Container43 />
        </div>
      </div>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="relative shrink-0 size-[38px]" data-name="Overlay">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 38">
        <g id="Overlay">
          <rect fill="var(--fill-0, #93000A)" fillOpacity="0.2" height="38" rx="19" width="38" />
          <path d={svgPaths.p19b8100} fill="var(--fill-0, #FFB4AB)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(255,180,171,0.8)] text-center w-[60.58px]">
        <p className="leading-[24px]">Log Out</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Overlay1 />
        <Container45 />
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-[20px] pt-[21px] px-[20px] relative w-full">
          <Container44 />
        </div>
      </div>
    </div>
  );
}

function Background16() {
  return (
    <div className="bg-[#131b2e] content-stretch flex flex-col items-start overflow-clip relative rounded-[32px] shrink-0 w-full" data-name="Background">
      <Button8 />
      <Button9 />
      <Button10 />
    </div>
  );
}

function SupportSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-end relative shrink-0 w-full" data-name="Support Section">
      <Heading4 />
      <Background16 />
    </div>
  );
}

function SettingsList() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Settings List">
      <AccountSection />
      <SecuritySection />
      <AppPreferencesSection />
      <SupportSection />
    </div>
  );
}

function Main() {
  return (
    <div className="h-[1752px] max-w-[672px] relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[inherit] pt-[96px] px-[24px] relative size-full">
        <SectionUserProfileCard />
        <SectionQuickActionStats />
        <SettingsList />
      </div>
    </div>
  );
}

function Container46() {
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

function Margin5() {
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
      <Container46 />
      <Margin5 />
    </div>
  );
}

function Container47() {
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

function Margin6() {
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
      <Container47 />
      <Margin6 />
    </div>
  );
}

function Container48() {
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

function Margin7() {
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
      <Container48 />
      <Margin7 />
    </div>
  );
}

function Container49() {
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

function Margin8() {
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
      <Container49 />
      <Margin8 />
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
    <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-[390px]" data-name="Bottom Navigation (Refined)">
      <Nav />
    </div>
  );
}

function Container51() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative" data-name="Button">
      <Container51 />
    </div>
  );
}

function ButtonCssTransform() {
  return (
    <div className="content-stretch flex flex-col h-[64px] items-start justify-center py-[20.6px] relative shrink-0" data-name="Button:css-transform">
      <div className="flex items-center justify-center relative shrink-0 size-[15.2px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none scale-x-95 scale-y-95">
          <Button11 />
        </div>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[18px] tracking-[-0.45px] w-[99.39px]">
        <p className="leading-[28px]">Vault Profile</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1 20">
        <g id="Container">
          <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative" data-name="Button">
      <Container52 />
    </div>
  );
}

function ButtonCssTransform1() {
  return (
    <div className="content-stretch flex flex-col h-[64px] items-start justify-center py-[20.6px] relative shrink-0" data-name="Button:css-transform">
      <div className="flex h-[19px] items-center justify-center relative shrink-0 w-[19.095px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none scale-x-95 scale-y-95">
          <Button12 />
        </div>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[64px] max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] pl-[24.6px] pr-[24.62px] relative size-full">
          <ButtonCssTransform />
          <Heading />
          <ButtonCssTransform1 />
        </div>
      </div>
    </div>
  );
}

function HeaderTopAppBar() {
  return (
    <div className="absolute bg-[#0b1326] content-stretch flex flex-col items-start left-0 top-0 w-[390px]" data-name="Header - TopAppBar">
      <Container50 />
    </div>
  );
}

export default function ProfileSettingsGoPayInspired() {
  return (
    <div className="bg-[#0b1326] content-stretch flex flex-col items-start pb-[133px] relative size-full" data-name="Profile & Settings - GoPay Inspired">
      <Main />

      <HeaderTopAppBar />
    </div>
  );
}