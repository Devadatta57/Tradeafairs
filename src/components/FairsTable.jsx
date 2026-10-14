import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SOURCES } from '../data/tradeFairs';
import useVisitedLinks from '../hooks/useVisitedLinks';

export const PAGE_SIZE = 8;

// Same gold as the outline around the header photo
const GOLD = 'bg-[#d4a227]';
const NAVY = 'bg-[#0a3260]';

// Sl. No. is the navy number strip; the rest follow the mockup's column widths and text insets
const COLUMNS = [
  { width: '53px' },
  { width: '22%', pad: 'pl-[16px]' },
  { width: '21.1%', pad: 'pl-[20px]' },
  { width: '14.6%', pad: 'pl-[17px]' },
  { width: '21.2%', pad: 'pl-[23px]' },
  { width: '17.3%', pad: 'pl-[15px]' },
];

// Pastel chip per ministry; ministries not listed use the Commerce blue
const CHIP_COLORS = {
  'Ministry of Commerce': 'bg-[#dbe7fd] text-[#1f47bf]',
  'Ministry of Animal Husbandry': 'bg-[#cbfbe4] text-[#145c3c]',
  'Ministry of MSME': 'bg-[#ecddfd] text-[#5b2bc4]',
  'Ministry of Agriculture': 'bg-[#fde3bc] text-[#c47417]',
  'Ministry of Food Processing': 'bg-[#fce0ec] text-[#b3245f]',
  'Ministry of Textiles': 'bg-[#d2f1f5] text-[#127580]',
  'Ministry of Health & Family Welfare': 'bg-[#fde0dc] text-[#c2352b]',
  'Ministry of Chemicals & Fertilizers': 'bg-[#fbf1c4] text-[#8a6a00]',
};

const headCellClass = 'h-[42px] bg-[#f2f2f3] text-left align-middle text-[13.5px] font-bold text-[#1c1f3d]';
const bodyCellClass = 'border-b border-r border-[#ebecee] py-[6px] pr-[12px] align-middle';
const textClass = 'text-[14.5px] leading-[20px] text-[#3f4055]';
const pageButtonClass =
  'h-[32px] min-w-[32px] cursor-pointer rounded-[8px] border px-[12px] text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45';
const idleButtonClass = 'border-[#e1e3e8] bg-white text-[#1c1f3d] enabled:hover:bg-[#f2f2f3]';
const activeButtonClass = `border-[#0a3260] ${NAVY} text-white`;

// "View details" turns purple once this person has opened that fair's link. Fairs that
// share an organiser's page are tracked one by one, so only the fair clicked changes
const detailsLinkClass =
  'inline-flex items-center gap-[6px] rounded-[8px] border px-[11px] py-[4px] text-[13px] font-semibold leading-[18px] text-white transition-colors';
const unvisitedLinkClass = 'border-[#2343c9] bg-[#2343c9] hover:border-[#16309c] hover:bg-[#16309c]';
const visitedLinkClass = 'border-[#6d3fc0] bg-[#6d3fc0] hover:border-[#55309a] hover:bg-[#55309a]';

// Entrance: once the table is in view, its text rains in from the right edge, row by row
// from the top, each row's cells a beat apart from left to right. Only the text moves;
// cell colours stay put. Plays once per page load, so later page or filter changes
// show their rows in place
const RAIN_START_PX = 200; // banner, gold rule and header row
const RAIN_DELAY_MS = 150;
const RAIN_ROW_STEP_MS = 110;
const RAIN_COL_STEP_MS = 35;
const RAIN_DURATION_MS = 900;
const RAIN_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Same date style as the reference page, e.g. "14 Oct 2026"
const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function FairsTable({ scope, fairs, page, onPageChange, onClearFilters }) {
  const cardRef = useRef(null);
  const pages = Math.max(1, Math.ceil(fairs.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const first = (current - 1) * PAGE_SIZE;
  const rows = fairs.slice(first, first + PAGE_SIZE);
  const placeLabel = scope === 'international' ? 'Country' : 'State';
  const scopeLabel = scope === 'international' ? 'International' : 'National';
  const [visited, markVisited] = useVisitedLinks('visited-fairs');

  // idle: plain layout (reduced motion, no IntersectionObserver, or already played);
  // waiting: text held off to the right; raining: animating
  const [rain, setRain] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined' ? 'idle' : 'waiting',
  );

  const goTo = (next) => {
    onPageChange(next);
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Rain as soon as the banner and the header row are on screen; the rows below land
  // in turn, top first
  useEffect(() => {
    if (rain !== 'waiting') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const needed = Math.min(entry.boundingClientRect.height, RAIN_START_PX);
        if (entry.isIntersecting && entry.intersectionRect.height >= needed) setRain('raining');
      },
      { threshold: Array.from({ length: 41 }, (_, i) => i / 40) },
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [rain]);

  // Back to the plain layout once the last row has landed
  useEffect(() => {
    if (rain !== 'raining') return undefined;
    const lastStart = RAIN_DELAY_MS + rows.length * RAIN_ROW_STEP_MS + (COLUMNS.length - 1) * RAIN_COL_STEP_MS;
    const timer = setTimeout(() => setRain('idle'), lastStart + RAIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [rain, rows.length]);

  // Row 0 is the header. The text starts a full screen width to the right, past the
  // table's clipped edge, so it enters from the right side
  const rainStyle = (row, col) => {
    if (rain === 'idle') return undefined;
    if (rain === 'waiting') return { transform: 'translateX(100vw)', opacity: 0 };
    const delay = RAIN_DELAY_MS + row * RAIN_ROW_STEP_MS + col * RAIN_COL_STEP_MS;
    return {
      transform: 'none',
      opacity: 1,
      transition: `transform ${RAIN_DURATION_MS}ms ${RAIN_EASE} ${delay}ms, opacity ${RAIN_DURATION_MS}ms ease-out ${delay}ms`,
    };
  };

  return (
    <section className="shell mt-5">
      <div
        ref={cardRef}
        className="scroll-mt-4 overflow-hidden rounded-[12px] border border-[#ebe9e4] bg-[#f5f6f8] shadow-[0_4px_16px_rgba(60,50,30,0.05)]"
      >
        {/* Banner: title on the left, illustration and scope tab on the right */}
        <div className="relative h-[119px] bg-[#fdfdfd]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-[330px] right-0 top-0 hidden overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_80px)] lg:block"
          >
            <img src="/fairs-banner-art-realistic.png" alt="" className="absolute right-0 top-0 h-full max-w-none" />
          </div>

          <h3 id="fairs-title" className="relative pl-[20px] pt-[21px] sm:pl-[55px]">
            <span className="block text-[30px] font-semibold leading-[40px] text-[#333754] sm:text-[36px]">{scopeLabel}</span>
            <span className="block text-[31px] font-bold leading-[40px] text-[#d4a227] sm:text-[37.5px]">TRADE FAIRS</span>
          </h3>

          <div
            className={`absolute bottom-0 right-[20px] hidden h-[36px] w-[251px] items-center justify-center rounded-t-[22px] ${GOLD} text-[17px] font-bold text-white sm:flex`}
          >
            {scopeLabel} Trade Fairs
          </div>
        </div>
        <div className={`h-[5px] ${GOLD}`} />

        <div className="pb-[14px] pl-[27px] pr-[28px]">
          {fairs.length === 0 ? (
            <div className="mt-[14px] rounded-[10px] border border-[#ebecee] bg-white px-[16px] py-[24px] text-center">
              <h4 className="text-[15px] font-bold leading-[20px] text-[#15173a]">No fairs match these filters</h4>
              <p className="mt-[4px] text-[12.5px] leading-[17px] text-[#5f6070]">
                Choose "All" for sector, {placeLabel.toLowerCase()} or month, or clear the filters.
              </p>
              <button type="button" onClick={onClearFilters} className={`mt-[12px] ${pageButtonClass} ${activeButtonClass}`}>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Clip the incoming text instead of showing a scrollbar for it while it rains in */}
              <div className={rain === 'idle' ? 'overflow-x-auto' : 'overflow-x-hidden'}>
                <table
                  aria-labelledby="fairs-title"
                  className="w-full min-w-[1100px] table-fixed border-separate border-spacing-0"
                >
                  <colgroup>
                    {COLUMNS.map(({ width }, i) => (
                      <col key={i} style={{ width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      {['Sl. No.', 'Fair', 'Sector', placeLabel, 'Dates', 'Details'].map((label, col) => (
                        <th key={label} scope="col" className={`${headCellClass} ${COLUMNS[col].pad ?? 'text-center'}`}>
                          <div style={rainStyle(0, col)}>{label}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((fair, i) => {
                      const source = SOURCES[fair.source];
                      const rowBg = i % 2 ? 'bg-[#f8f8fa]' : 'bg-[#fdfdfd]';
                      const cell = (col, extra = '') => `${bodyCellClass} ${COLUMNS[col].pad} ${rowBg} ${extra}`;
                      const rainIn = (col) => rainStyle(i + 1, col);
                      const id = `${fair.name}-${fair.start}`;
                      const seen = visited.has(id);
                      return (
                        <tr key={id}>
                          {/* One continuous navy strip, rounded at its first and last row */}
                          <td
                            className={`${NAVY} text-center align-middle text-[15px] font-bold text-white ${i === 0 ? 'rounded-t-[27px]' : ''} ${i === rows.length - 1 ? 'rounded-b-[27px]' : ''}`}
                          >
                            <div style={rainIn(0)}>{first + i + 1}</div>
                          </td>
                          <td className={cell(1)}>
                            <div style={rainIn(1)}>
                              <span className="block text-[15.5px] font-bold leading-[21px] text-[#15173a]">{fair.name}</span>
                              <span className="block text-[12.5px] leading-[17px] text-[#5f6070]">{fair.city}</span>
                            </div>
                          </td>
                          <td className={cell(2)}>
                            <span
                              style={rainIn(2)}
                              className={`inline-block max-w-[205px] rounded-[14px] px-[11px] py-[5px] align-middle text-[12px] font-medium leading-[17px] ${CHIP_COLORS[fair.sector] ?? CHIP_COLORS['Ministry of Commerce']}`}
                            >
                              {fair.sector}
                            </span>
                          </td>
                          <td className={cell(3, textClass)}>
                            <div style={rainIn(3)}>{fair.place}</div>
                          </td>
                          <td className={cell(4, `${textClass} whitespace-nowrap`)}>
                            <div style={rainIn(4)}>
                              {formatDate(fair.start)} to {formatDate(fair.end)}
                            </div>
                          </td>
                          <td className={cell(5)}>
                            <div style={rainIn(5)}>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View details of ${fair.name} on ${source.name} (opens in a new tab${seen ? ', visited' : ''})`}
                                // Left click, Enter, or middle click to open in a new tab
                                onClick={() => markVisited(id)}
                                onAuxClick={(event) => event.button === 1 && markVisited(id)}
                                className={`${detailsLinkClass} ${seen ? visitedLinkClass : unvisitedLinkClass}`}
                              >
                                View details
                                <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
                              </a>
                              <span className="mt-[3px] block text-[12.5px] leading-[17px] text-[#6b6c7c]">{source.name}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <nav aria-label="Pagination" className="mt-[12px] flex flex-wrap items-center justify-between gap-[8px]">
                  <button
                    type="button"
                    disabled={current === 1}
                    onClick={() => goTo(current - 1)}
                    className={`${pageButtonClass} ${idleButtonClass}`}
                  >
                    Previous
                  </button>
                  <div className="flex flex-wrap gap-[6px]">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`Page ${n}`}
                        aria-current={n === current ? 'page' : undefined}
                        onClick={() => goTo(n)}
                        className={`${pageButtonClass} ${n === current ? activeButtonClass : idleButtonClass}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={current === pages}
                    onClick={() => goTo(current + 1)}
                    className={`${pageButtonClass} ${idleButtonClass}`}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default FairsTable;
