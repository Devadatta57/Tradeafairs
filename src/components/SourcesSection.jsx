import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { SOURCES } from '../data/tradeFairs';
import useVisitedLinks from '../hooks/useVisitedLinks';

// Letter colour for each card's round badge, in listing order
const BADGE_COLORS = ['text-[#ea6a12]', 'text-[#2563eb]', 'text-[#16a34a]', 'text-[#7c3aed]', 'text-[#dc2626]', 'text-[#0d9488]', 'text-[#db2777]'];

const SIDE_COLUMN_OFFSET = 'lg:pt-[90px]';

const rowClass = 'flex gap-[10px] text-[13px] leading-[19px] text-[#3b3f48]';
const iconClass = 'mt-[1.5px] shrink-0 text-[#4a4e57]';

// "View details" turns from the blue gradient to a purple one once this person has
// opened that source's page from its card
const unvisitedLinkClass = 'bg-[linear-gradient(90deg,#7783fc,#4b65e9)] shadow-[0_6px_16px_rgba(75,101,233,0.30)]';
const visitedLinkClass = 'bg-[linear-gradient(90deg,#9a6cf0,#6d3fc0)] shadow-[0_6px_16px_rgba(109,63,192,0.30)]';

// Entrance: the cards wait in a loose stack, then deal out one by one (in listing order)
// to their places once the list is in view
const DEAL_DELAY_MS = 250;
const DEAL_STEP_MS = 170;
const DEAL_DURATION_MS = 750;
const STACK_TILT = [-2, 3, -4, 2, -3, 4, -1];

const ENTRIES = Object.values(SOURCES).map((source, i) => ({ ...source, color: BADGE_COLORS[i % BADGE_COLORS.length], index: i }));

// Cards run down three columns in listing order, as in the mockup: the middle column
// starts higher; the cards split evenly, with a leftover going to the middle column
// first and then the left one (7 cards: 2-3-2, 8 cards: 3-3-2, 9 cards: 3-3-3)
const PER_COLUMN = Math.floor(ENTRIES.length / 3);
const LEFTOVER = ENTRIES.length % 3;
const COLUMN_SIZES = [PER_COLUMN + (LEFTOVER === 2 ? 1 : 0), PER_COLUMN + (LEFTOVER > 0 ? 1 : 0), PER_COLUMN];
const COLUMNS = COLUMN_SIZES.map((size, col) => {
  const start = COLUMN_SIZES.slice(0, col).reduce((sum, n) => sum + n, 0);
  return ENTRIES.slice(start, start + size);
});

function SourceCard({ name, description, url, color, visited, onVisit }) {
  return (
    // On hover the card lifts, turns light pink and glows with a soft dark pink shade all
    // round its edge, on top of its usual drop shadow
    <div className="flex flex-col rounded-[18px] bg-white p-[20px] shadow-[0_10px_30px_rgba(110,90,150,0.10)] transition duration-300 ease-out hover:-translate-y-[6px] hover:bg-[#fde2ec] hover:shadow-[0_0_22px_4px_rgba(190,24,93,0.45),0_18px_40px_rgba(110,90,150,0.18)]">
      <div className="flex items-center gap-[12px]">
        <span
          aria-hidden="true"
          className={`flex size-[52px] shrink-0 items-center justify-center rounded-full border border-[#eceef4] bg-white text-[22px] font-bold shadow-[0_2px_6px_rgba(40,40,80,0.06)] ${color}`}
        >
          {name[0]}
        </span>
        <strong className="text-[16.5px] font-semibold leading-[22px] text-[#2a2e37]">{name}</strong>
      </div>

      <div className="mt-[16px] flex flex-col gap-[10px] rounded-[14px] bg-[#eef1fd] px-[16px] py-[14px]">
        <p className={rowClass}>
          <FileText size={16} strokeWidth={1.8} className={iconClass} />
          {description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-[10px] pt-[16px]">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View details on ${name} (opens in a new tab${visited ? ', visited' : ''})`}
          // Left click, Enter, or middle click to open in a new tab
          onClick={onVisit}
          onAuxClick={(event) => event.button === 1 && onVisit()}
          className={`flex h-[44px] items-center justify-center rounded-full px-[22px] text-[14.5px] font-semibold text-white transition hover:brightness-105 ${visited ? visitedLinkClass : unvisitedLinkClass}`}
        >
          View details
        </a>
      </div>
    </div>
  );
}

function SourcesSection() {
  const listRef = useRef(null);
  const cardRefs = useRef([]);
  // idle: plain layout (reduced motion or no IntersectionObserver); stacked: waiting; dealing: animating
  const [phase, setPhase] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined' ? 'idle' : 'stacked',
  );
  const [stack, setStack] = useState([]);
  const [landed, setLanded] = useState(0);
  const [visited, markVisited] = useVisitedLinks('visited-sources');

  // Offset from each card's own place to the stack point. offsetLeft/Top ignore transforms,
  // so this can re-run while the cards are stacked
  const measure = useCallback(() => {
    const list = listRef.current;
    const cards = cardRefs.current;
    if (!list || cards.length !== ENTRIES.length || cards.some((card) => !card)) return;
    // Middle of the grid on wide screens; in the single column, where the first card sits
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    const x = list.clientWidth / 2;
    const y = wide ? list.clientHeight / 2 : cards[0].offsetTop + cards[0].offsetHeight / 2;
    setStack(
      cards.map((card, i) => ({
        x: x - (card.offsetLeft + card.offsetWidth / 2),
        y: y - (card.offsetTop + card.offsetHeight / 2) + i * 4,
        tilt: STACK_TILT[i % STACK_TILT.length],
      })),
    );
  }, []);

  // Stack before the first paint so the cards never flash in their final places
  useLayoutEffect(() => {
    if (phase !== 'stacked') return;
    measure();
    document.fonts?.ready.then(measure);
  }, [phase, measure]);

  // Deal once most of the list (or most of the screen, for the tall single column) is in view
  useEffect(() => {
    if (phase !== 'stacked') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const needed = Math.min(entry.boundingClientRect.height, window.innerHeight) * 0.6;
        if (entry.isIntersecting && entry.intersectionRect.height >= needed) setPhase('dealing');
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    observer.observe(listRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [phase, measure]);

  const dealStyle = (i) => {
    const offset = stack[i];
    if (phase === 'idle' || !offset || i < landed) return undefined;
    // Cards still in the stack, or in flight, ride above the ones already placed; the top card goes first
    const zIndex = 10 + ENTRIES.length - i;
    if (phase === 'stacked') {
      return { transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.tilt}deg)`, zIndex };
    }
    return {
      transform: 'none',
      transition: `transform ${DEAL_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${DEAL_DELAY_MS + i * DEAL_STEP_MS}ms`,
      zIndex,
    };
  };

  return (
    <section aria-labelledby="sources-title" className="shell mt-5">
      <div className="relative overflow-hidden rounded-[12px] border border-[#ebe9e4] bg-[linear-gradient(100deg,#fff3ec_0%,#fbf0ed_25%,#f8edf0_50%,#f5ecf4_72%,#f2e9f8_100%)] px-[16px] pb-[28px] pt-[22px] sm:px-[24px] shadow-[0_4px_16px_rgba(60,50,30,0.05)]">
        {/* Faint ring in the top-left corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[120px] -top-[160px] size-[420px] rounded-full border-[46px] border-white/40"
        />

        <h3 id="sources-title" className="relative text-[22px] font-bold leading-[30px] text-[#2a2e37]">
          Official sources for fair listings
        </h3>

        {/* One column on small screens; three staggered columns from lg up */}
        <div
          ref={listRef}
          role="list"
          className="relative mx-auto mt-[16px] flex max-w-[480px] flex-col gap-[20px] lg:max-w-[1060px] lg:flex-row lg:items-start"
        >
          {COLUMNS.map((cards, col) => (
            <div key={col} className={`flex min-w-0 flex-1 flex-col gap-[20px] ${col === 1 ? '' : SIDE_COLUMN_OFFSET}`}>
              {cards.map((source) => (
                <div
                  key={source.url}
                  ref={(el) => {
                    cardRefs.current[source.index] = el;
                  }}
                  role="listitem"
                  style={dealStyle(source.index)}
                  onTransitionEnd={(e) => {
                    if (e.target === e.currentTarget && e.propertyName === 'transform') {
                      setLanded((n) => Math.max(n, source.index + 1));
                    }
                  }}
                >
                  <SourceCard {...source} visited={visited.has(source.url)} onVisit={() => markVisited(source.url)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SourcesSection;
