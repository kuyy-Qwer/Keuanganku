import svgPaths from "./svg-bmcziry1u9";

function SubtleBackgroundAmbientElement() {
  return (
    <div className="absolute h-[884px] left-0 overflow-clip top-0 w-[390px]" data-name="Subtle Background Ambient Element">
      <div className="-translate-x-1/2 absolute bg-[rgba(78,222,163,0.05)] blur-[60px] left-1/2 rounded-[9999px] size-[600px] top-[-88.39px]" data-name="Overlay+Blur" />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.p124aec00} fill="var(--fill-0, #4EDEA3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[20px] justify-center leading-[0] relative shrink-0 text-[#4edea3] text-[14px] text-center tracking-[1.4px] uppercase w-[84.75px]">
        <p className="leading-[20px]">LUMINARY</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[20px] relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[40px] justify-center leading-[0] relative shrink-0 text-[#dae2fd] text-[36px] text-center w-[262.14px]">
        <p className="leading-[40px]">Welcome Back</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(187,202,191,0.7)] text-center w-[228px]">
        <p className="leading-[20px]">Access your private vault securely</p>
      </div>
    </div>
  );
}

function SimplifiedBrandHeader() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start max-w-[448px] relative shrink-0 w-full" data-name="Simplified Brand & Header">
      <Container />
      <Heading />
      <Container3 />
    </div>
  );
}

function SimplifiedBrandHeaderMargin() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[448px] pb-[48px] relative shrink-0 w-full" data-name="Simplified Brand & Header:margin">
      <SimplifiedBrandHeader />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[322px]" data-name="Label">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(187,202,191,0.6)] tracking-[2px] uppercase w-[109.84px]">
        <p className="leading-[15px]">Mobile Number</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[14px] w-[15.16px]">
          <p className="leading-[20px]">+1</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(23,31,51,0.5)] content-stretch flex h-[64px] items-center pl-[21px] pr-[20px] py-px relative rounded-bl-[16px] rounded-tl-[16px] shrink-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border-[rgba(60,74,66,0.1)] border-b border-l border-solid border-t inset-0 pointer-events-none rounded-bl-[16px] rounded-tl-[16px]" />
      <Container6 />
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(134,148,138,0.3)] w-full">
          <p className="leading-[normal]">Enter phone number</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[rgba(23,31,51,0.5)] flex-[1_0_0] h-[64px] min-h-px min-w-px relative rounded-br-[16px] rounded-tr-[16px]" data-name="Input">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[17px] py-[20.5px] relative size-full">
          <Container7 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(60,74,66,0.1)] border-solid inset-0 pointer-events-none rounded-br-[16px] rounded-tr-[16px]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <OverlayBorder />
      <Input />
    </div>
  );
}

function ProminentPhoneInput() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-end relative shrink-0 w-full" data-name="Prominent Phone Input">
      <Label />
      <Container5 />
    </div>
  );
}

function ButtonPrimaryAction() {
  return (
    <div className="bg-[#4edea3] content-stretch flex h-[64px] items-center justify-center pb-[18.5px] pt-[17.5px] relative rounded-[16px] shrink-0 w-full" data-name="Button - Primary Action">
      <div className="absolute bg-[rgba(255,255,255,0)] h-[64px] left-0 right-0 rounded-[16px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-0" data-name="Button - Primary Action:shadow" />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#003824] text-[18px] text-center w-[80.5px]">
        <p className="leading-[28px]">Continue</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <ProminentPhoneInput />
      <ButtonPrimaryAction />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[16.637px] relative shrink-0 w-[15.041px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0408 16.6369">
        <g id="Container">
          <path d={svgPaths.p2b44ee60} fill="var(--fill-0, #BBCABF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold h-[20px] justify-center leading-[0] relative shrink-0 text-[#bbcabf] text-[14px] text-center w-[145.2px]">
        <p className="leading-[20px]">Login with Biometrics</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Button">
      <Container8 />
      <Container9 />
    </div>
  );
}

function SecondaryOptionBiometrics() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[8px] relative shrink-0 w-full" data-name="Secondary Option: Biometrics">
      <Button />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(187,202,191,0.5)] w-[66.64px]">
        <p className="leading-[16px]">Forgot PIN?</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-[rgba(187,202,191,0.5)] w-[66.55px]">
        <p className="leading-[16px]">Need Help?</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[40px] h-[16px] items-start relative shrink-0" data-name="Container">
      <Link />
      <Link1 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[12.25px] relative shrink-0 w-[9.333px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33333 12.25">
        <g id="Container">
          <path d={svgPaths.p27c49100} fill="var(--fill-0, #DAE2FD)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#dae2fd] text-[10px] tracking-[1px] uppercase w-[95.75px]">
        <p className="leading-[15px]">256-bit Secure</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex gap-[8px] items-center opacity-40 relative shrink-0" data-name="Container">
      <Container12 />
      <Container13 />
    </div>
  );
}

function MinimalFooterActions() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center pt-[32px] relative shrink-0 w-full" data-name="Minimal Footer Actions">
      <Container10 />
      <Container11 />
    </div>
  );
}

function CleanFocusedMainContent() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[448px] relative shrink-0 w-full" data-name="Clean, Focused Main Content">
      <Container4 />
      <SecondaryOptionBiometrics />
      <MinimalFooterActions />
    </div>
  );
}

export default function SimplifiedLoginScreen() {
  return (
    <div className="bg-[#0b1326] content-stretch flex flex-col items-center justify-center px-[32px] py-[154.5px] relative size-full" data-name="Simplified Login Screen">
      <SubtleBackgroundAmbientElement />
      <SimplifiedBrandHeaderMargin />
      <CleanFocusedMainContent />
    </div>
  );
}