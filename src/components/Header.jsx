import React from 'react';
import { Globe } from 'lucide-react';
import HeroBackdrop from './HeroBackdrop';
import { IndiaMap } from './icons';

const SCOPES = [
  { id: 'national', label: 'National', icon: <IndiaMap className="h-[30px] w-[25px]" />, gap: 'gap-[23px]' },
  { id: 'international', label: 'International', icon: <Globe size={23} strokeWidth={1.7} />, gap: 'gap-[22px]' },
];

const activeScopeClass =
  'w-[51.5%] border border-[#3d8bff]/40 bg-[linear-gradient(90deg,#0050fe,#0174fe)] text-[16px] font-medium text-white shadow-[0_6px_16px_rgba(0,98,254,0.35)]';
const idleScopeClass = 'flex-1 text-[15px] font-semibold text-[#0e1a3d] hover:bg-white/40';

const Header = ({ scope, onScopeChange }) => {
  return (
    <header className="w-full font-sans">
      {/* Hero backdrop; the photo runs below the hero and fades out beside the filter card */}
      <div className="relative overflow-x-clip">
        <HeroBackdrop />

        {/* Hero Content */}
        <div className="shell relative z-10 pb-[25px] pt-[115px]">
          <div className="pl-[9px]">
            <h2 className="text-[45px] font-black leading-none tracking-[-0.035em] [word-spacing:0.12em] sm:text-[67px]">
              <span className="text-[#061a42]">Trade</span>{' '}
              <span className="bg-[linear-gradient(180deg,#0152ff,#0249e2)] bg-clip-text text-transparent">Fairs</span>
            </h2>

            {/* Tricolour underline */}
            <div className="-ml-px mt-[6px] flex h-[4px] w-[153px] overflow-hidden rounded-full">
              <div className="w-[62px] bg-[#ff7b1a]"></div>
              <div className="w-[27px] bg-white"></div>
              <div className="flex-1 bg-[#00996d]"></div>
            </div>
            

            <div className="mt-[82px] flex h-[50px] w-full max-w-[414px] rounded-full border border-white bg-[#deeafe] shadow-[0_5px_14px_rgba(31,64,120,0.08)]">
              {SCOPES.map(({ id, label, icon, gap }) => {
                const active = scope === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onScopeChange(id)}
                    className={`flex cursor-pointer items-center justify-center rounded-full ${gap} ${active ? activeScopeClass : idleScopeClass}`}
                  >
                    <span className={`flex shrink-0 ${active ? '' : 'text-[#4073b6]'}`}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
