import svgPaths from "./svg-mw3snlhtsw";
import imgUserProfile from "./d9227939ebeb7b3dba98e69bf89be62abd0d26e3.png";

function Container() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[12px] tracking-[0.6px] uppercase w-full">
          <p className="leading-[16px]">Total Spending This Month</p>
        </div>
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[36px] tracking-[-0.9px] w-full">
        <p className="leading-[40px]">Rp 12.450.000</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="h-[6.417px] relative shrink-0 w-[15.083px]" data-name="Margin">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0833 6.41662">
        <g id="Margin">
          <path d={svgPaths.p1ac9e780} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#4edea3] text-[12px] w-[130.8px]">
        <p className="leading-[16px]">-4.2% from last month</p>
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(78,222,163,0.1)] content-stretch flex items-center px-[10px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Overlay">
      <Margin />
      <Container3 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Overlay />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative w-full">
        <Heading />
        <Container2 />
      </div>
    </div>
  );
}

function SectionWealthSummaryHeroGoPayStyle() {
  return (
    <div className="bg-[#131b2e] relative rounded-[16px] shrink-0 w-full" data-name="Section - Wealth Summary Hero (GoPay Style)">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[25px] relative w-full">
        <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" data-name="Overlay+Shadow" />
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[14px] w-full">
        <p className="leading-[normal]">Search transactions...</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#222a3d] relative rounded-[48px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[16px] pl-[48px] pr-[16px] pt-[15px] relative w-full">
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Input />
      <div className="absolute bottom-[35.11%] left-[18.84px] top-[35.04%] w-[14.327px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.3269 14.3269">
          <path d={svgPaths.p2436f20} fill="var(--fill-0, #94A3B8)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#4edea3] content-stretch flex flex-col items-center justify-center left-0 pb-[7.5px] pt-[6.5px] px-[16px] rounded-[9999px] top-0" data-name="Button">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] relative shrink-0 text-[#002113] text-[12px] text-center w-[14.59px]">
        <p className="leading-[16px]">All</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#222a3d] content-stretch flex flex-col items-center justify-center left-[54.59px] px-[17px] py-[7px] rounded-[9999px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[12px] text-center w-[55.41px]">
        <p className="leading-[16px]">Expenses</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[#222a3d] content-stretch flex flex-col items-center justify-center left-[152px] px-[17px] py-[7px] rounded-[9999px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[12px] text-center w-[43.55px]">
        <p className="leading-[16px]">Income</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[#222a3d] content-stretch flex flex-col items-center justify-center left-[237.55px] px-[17px] py-[7px] rounded-[9999px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[12px] text-center w-[54.55px]">
        <p className="leading-[16px]">Category</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[#222a3d] content-stretch flex flex-col items-center justify-center left-[334.09px] px-[17px] py-[7px] rounded-[9999px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] relative shrink-0 text-[#cbd5e1] text-[12px] text-center w-[27.53px]">
        <p className="leading-[16px]">Date</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[34px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function SectionSearchFilters() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start pt-px relative shrink-0 w-full" data-name="Section - Search & Filters">
      <Container4 />
      <Container6 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 2">
      <div className="content-stretch flex flex-col items-start px-[4px] relative w-full">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#64748b] text-[11px] tracking-[2.2px] uppercase w-full">
          <p className="leading-[16.5px]">Today, 24 Oct</p>
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-[14px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9999 19.5">
        <g id="Container">
          <path d={svgPaths.p7657380} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder1() {
  return (
    <div className="bg-[rgba(79,219,200,0.1)] content-stretch flex items-center justify-center p-px relative rounded-[48px] shrink-0 size-[48px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(79,219,200,0.2)] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <Container8 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[23px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[15px] w-[113.22px]">
        <p className="leading-[22.5px]">The Gilded Fork</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[22.5px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] w-[102.25px]">
        <p className="leading-[18px]">Dining • 19:42 PM</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[40.5px] relative shrink-0 w-[113.22px]" data-name="Container">
      <Heading2 />
      <Container10 />
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <OverlayBorder1 />
        <Container9 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#ffb4ab] text-[16px] text-right w-[108.3px]">
        <p className="leading-[24px]">- Rp 450.000</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Container12 />
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item 1">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.03)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[17px] pt-[16px] px-[16px] relative w-full">
          <Container7 />
          <Container11 />
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[19px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 18.9999">
        <g id="Container">
          <path d={svgPaths.p17d45480} fill="var(--fill-0, #E9C400)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder2() {
  return (
    <div className="bg-[rgba(233,196,0,0.1)] content-stretch flex h-[48px] items-center justify-center p-px relative rounded-[48px] shrink-0 w-[43.09px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(233,196,0,0.2)] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <Container14 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.75px] right-0 top-[-0.75px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[45px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[15px] w-[123.3px]">
        <p className="leading-[22.5px] mb-0">Premium Leather</p>
        <p className="leading-[22.5px]">Co.</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[45px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] w-[111.45px]">
        <p className="leading-[18px]">Lifestyle • 14:15 PM</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[63px] relative shrink-0 w-[136.59px]" data-name="Container">
      <Heading3 />
      <Container16 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <OverlayBorder2 />
      <Container15 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-end pl-[24.47px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[48px] justify-center leading-[0] relative shrink-0 text-[#ffb4ab] text-[16px] text-right w-[87.84px]">
        <p className="leading-[24px] mb-0">- Rp</p>
        <p className="leading-[24px]">2.200.000</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container18 />
    </div>
  );
}

function Item1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item 2">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between p-[16px] relative w-full">
          <Container13 />
          <Container17 />
        </div>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(19,27,46,0.5)] relative rounded-[16px] shrink-0 w-full" data-name="Overlay+Border">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <Item />
        <Item1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function DateGroupToday() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Date Group: Today">
      <Heading1 />
      <OverlayBorder />
    </div>
  );
}

function Heading4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 2">
      <div className="content-stretch flex flex-col items-start px-[4px] relative w-full">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#64748b] text-[11px] tracking-[2.2px] uppercase w-full">
          <p className="leading-[16.5px]">Yesterday, 23 Oct</p>
        </div>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[18.942px] relative shrink-0 w-[18.461px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.4614 18.9422">
        <g id="Container">
          <path d={svgPaths.pd19dfc0} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder4() {
  return (
    <div className="bg-[rgba(78,222,163,0.1)] content-stretch flex h-[48px] items-center justify-center p-px relative rounded-[48px] shrink-0 w-[45.66px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(78,222,163,0.2)] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <Container20 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[23px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[15px] w-[119.5px]">
        <p className="leading-[22.5px]">Dividend Payout</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[22.5px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] w-[109.54px]">
        <p className="leading-[18px] mb-0">Investment • 09:00</p>
        <p className="leading-[18px]">AM</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[58.5px] relative shrink-0 w-[125.31px]" data-name="Container">
      <Heading5 />
      <Container22 />
    </div>
  );
}

function Container19() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <OverlayBorder4 />
        <Container21 />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-end pl-[31.72px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[48px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[16px] text-right w-[89.31px]">
        <p className="leading-[24px] mb-0">+ Rp</p>
        <p className="leading-[24px]">8.400.000</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Container24 />
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item 3">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.03)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[17px] pt-[16px] px-[16px] relative w-full">
          <Container19 />
          <Container23 />
        </div>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[19.019px] relative shrink-0 w-[17px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.9999 19.0192">
        <g id="Container">
          <path d={svgPaths.p374de700} fill="var(--fill-0, #FFB4AB)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder5() {
  return (
    <div className="bg-[rgba(255,180,171,0.1)] content-stretch flex h-[48px] items-center justify-center p-px relative rounded-[48px] shrink-0 w-[47.94px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(255,180,171,0.2)] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <Container26 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[23px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[15px] w-[118.5px]">
        <p className="leading-[22.5px]">City Grid Energy</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[22.5px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] w-[105.7px]">
        <p className="leading-[18px] mb-0">Utility Bills • 08:30</p>
        <p className="leading-[18px]">AM</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[58.5px] relative shrink-0 w-[128px]" data-name="Container">
      <Heading6 />
      <Container28 />
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <OverlayBorder5 />
        <Container27 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-end pl-[36.47px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[48px] justify-center leading-[0] relative shrink-0 text-[#ffb4ab] text-[16px] text-right w-[79.59px]">
        <p className="leading-[24px] mb-0">- Rp</p>
        <p className="leading-[24px]">1.150.000</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Container30 />
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item 4">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.03)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pb-[17px] pt-[16px] px-[16px] relative w-full">
          <Container25 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[15px] relative shrink-0 w-[17px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.9999 14.9999">
        <g id="Container">
          <path d={svgPaths.p2d79ac00} fill="var(--fill-0, #4FDBC8)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function OverlayBorder6() {
  return (
    <div className="bg-[rgba(79,219,200,0.1)] content-stretch flex items-center justify-center p-px relative rounded-[48px] shrink-0 size-[48px]" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(79,219,200,0.2)] border-solid inset-0 pointer-events-none rounded-[48px]" />
      <Container32 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[-1px]" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[23px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[15px] w-[89.09px]">
        <p className="leading-[22.5px]">Luxury Valet</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[22.5px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[18px] justify-center leading-[0] not-italic relative shrink-0 text-[#94a3b8] text-[12px] w-[122.97px]">
        <p className="leading-[18px]">Transport • 07:45 AM</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[40.5px] relative shrink-0 w-[122.97px]" data-name="Container">
      <Heading7 />
      <Container34 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <OverlayBorder6 />
      <Container33 />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#ffb4ab] text-[16px] text-right w-[97.83px]">
        <p className="leading-[24px]">- Rp 50.000</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container36 />
    </div>
  );
}

function Item4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Item 5">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between p-[16px] relative w-full">
          <Container31 />
          <Container35 />
        </div>
      </div>
    </div>
  );
}

function OverlayBorder3() {
  return (
    <div className="bg-[rgba(19,27,46,0.5)] relative rounded-[16px] shrink-0 w-full" data-name="Overlay+Border">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <Item2 />
        <Item3 />
        <Item4 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function DateGroupYesterday() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Date Group: Yesterday">
      <Heading4 />
      <OverlayBorder3 />
    </div>
  );
}

function TimelineList() {
  return (
    <div className="content-stretch flex flex-col gap-[31px] items-start relative shrink-0 w-full" data-name="Timeline List">
      <DateGroupToday />
      <DateGroupYesterday />
    </div>
  );
}

function MainContent() {
  return (
    <div className="max-w-[672px] relative shrink-0 w-full" data-name="Main Content">
      <div className="content-stretch flex flex-col gap-[31px] items-start max-w-[inherit] pt-[112px] px-[24px] relative w-full">
        <SectionWealthSummaryHeroGoPayStyle />
        <SectionSearchFilters />
        <TimelineList />
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

function BackgroundBorder() {
  return (
    <div className="bg-[#2d3449] relative rounded-[9999px] shrink-0 size-[40px]" data-name="Background+Border">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip p-px relative rounded-[inherit] size-full">
        <UserProfile />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[20px] tracking-[4px] w-[135.55px]">
        <p className="leading-[28px]">LUMINARY</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <BackgroundBorder />
        <Container38 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[19.192px] relative shrink-0 w-[15px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9999 19.1922">
        <g id="Container">
          <path d={svgPaths.p1a177c00} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-[8px] relative">
        <Container39 />
      </div>
    </div>
  );
}

function HeaderTopAppBar() {
  return (
    <div className="absolute backdrop-blur-[10px] bg-[rgba(11,19,38,0.85)] content-stretch flex h-[80px] items-center justify-between left-0 pb-px px-[24px] top-0 w-[390px]" data-name="Header - TopAppBar">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.05)] border-b border-solid inset-0 pointer-events-none" />
      <Container37 />
      <Button5 />
    </div>
  );
}

function Container40() {
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
      <Container40 />
      <Margin1 />
    </div>
  );
}

function Container41() {
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
      <Container41 />
      <Margin2 />
    </div>
  );
}

function Container42() {
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
      <Container42 />
      <Margin3 />
    </div>
  );
}

function Container43() {
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
      <Container43 />
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
    <div className="absolute bottom-[36px] content-stretch flex flex-col items-start left-0 px-[16px] right-0" data-name="Bottom Navigation (Refined)">
      <Nav />
    </div>
  );
}

export default function TransactionTimelineGoPayInspired() {
  return (
    <div className="bg-[#0b1326] content-stretch flex flex-col items-start pb-[128px] relative size-full" data-name="Transaction Timeline - GoPay Inspired">
      <MainContent />
      <HeaderTopAppBar />

    </div>
  );
}