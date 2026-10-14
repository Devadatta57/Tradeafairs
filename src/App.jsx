import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Header from './components/Header';
import FairsTable from './components/FairsTable';
import SourcesSection from './components/SourcesSection';
import { Search, RotateCw, ChevronDown } from 'lucide-react';
import { SECTORS, PLACES, YEARS, MONTHS, FAIR_NAMES, FAIRS } from './data/tradeFairs';

const labelClass = 'text-sm leading-5 text-[#4a5180]';
const controlClass =
  'mt-[7px] h-[38px] w-full rounded-lg border border-[#dee4ed] bg-white pl-[14px] text-sm text-[#1b2240] outline-none focus:border-blue-400';
const cardClass = 'relative overflow-hidden rounded-[12px] border border-[#ebe9e4] bg-white shadow-[0_4px_16px_rgba(60,50,30,0.05)]';

const EMPTY_FILTERS = { sector: '', place: '', year: '', month: '', name: '' };

// Dropdown shows "Agriculture Sector" but filters on the full ministry name the fairs carry
const SECTOR_OPTIONS = SECTORS.map((sector) => ({ value: sector, label: `${sector.replace(/^Ministry of /, '')} Sector` }));

// Same rules as the reference page: exact sector and place, year and month of the
// start date, name or city search; listed by start date
function filterFairs(scope, { sector, place, year, month, name }) {
  const query = name.trim().toLowerCase();
  return FAIRS.filter(
    (fair) =>
      fair.scope === scope &&
      (!sector || fair.sector === sector) &&
      (!place || fair.place === place) &&
      (!year || fair.start.slice(0, 4) === year) &&
      (!month || Number(fair.start.slice(5, 7)) === Number(month)) &&
      (!query || `${fair.name} ${fair.city}`.toLowerCase().includes(query)),
  ).sort((a, b) => (a.start < b.start ? -1 : 1));
}

const toOption = (option) => (typeof option === 'string' ? { value: option, label: option } : option);

const chevronClass = 'pointer-events-none absolute right-[11px] top-[calc(50%+3.5px)] -translate-y-1/2 text-[#1e2a4f]';

// Filter dropdown whose list always opens below the box: a native <select> flips its list
// upward when the page runs out of room underneath. The list is rendered into <body> so
// the card's overflow-hidden doesn't clip it.
// options: plain strings, or { value, label } pairs; onChange receives the new value.
function Dropdown({ id, value, onChange, options }) {
  const items = [{ value: '', label: 'All' }, ...options.map(toOption)];
  const selectedIndex = Math.max(0, items.findIndex((item) => item.value === value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const openList = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    setActive(selectedIndex);
    setOpen(true);
  };
  const choose = (index) => {
    onChange(items[index].value);
    setOpen(false);
  };

  // Close on a click outside, or when a resize would leave the list out of place
  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (!buttonRef.current.contains(event.target) && !listRef.current?.contains(event.target)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', closeOnOutside);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // On opening, scroll the page just enough to show the list rather than flipping it upward
  useLayoutEffect(() => {
    if (open) listRef.current.scrollIntoView({ block: 'nearest' });
  }, [open]);

  // Keep the highlighted option visible inside the list
  useLayoutEffect(() => {
    const list = listRef.current;
    const option = list?.children[active];
    if (!option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [open, active]);

  const onKeyDown = (event) => {
    const { key } = event;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault();
        openList();
      }
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.min(items.length - 1, Math.max(0, index + (key === 'ArrowDown' ? 1 : -1))));
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      setActive(key === 'Home' ? 0 : items.length - 1);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      choose(active);
    } else if (key === 'Escape' || key === 'Tab') {
      if (key === 'Escape') event.preventDefault();
      setOpen(false);
    }

    // Typing a letter jumps to the next option starting with it, as a native select does
    if (key.length === 1 && key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const from = open ? active : selectedIndex;
      const letter = key.toLowerCase();
      for (let step = 1; step <= items.length; step += 1) {
        const index = (from + step) % items.length;
        if (items[index].label.toLowerCase().startsWith(letter)) {
          if (open) setActive(index);
          else onChange(items[index].value);
          break;
        }
      }
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        // Space activates a button on keyup; it is already handled on keydown
        onKeyUp={(event) => event.key === ' ' && event.preventDefault()}
        className={`${controlClass} pr-8 text-left`}
      >
        <span className="block truncate">{items[selectedIndex].label}</span>
      </button>
      <ChevronDown size={16} strokeWidth={1.8} className={chevronClass} />

      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={id}
            style={{ top: position.top, left: position.left, minWidth: position.width, maxWidth: window.innerWidth - position.left - 16 }}
            className="absolute z-50 max-h-[280px] overflow-y-auto rounded-lg border border-[#dee4ed] bg-white py-1 font-sans text-sm text-[#1b2240] shadow-[0_8px_24px_rgba(17,28,58,0.12)]"
          >
            {items.map((item, index) => (
              <li
                key={item.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={`cursor-pointer px-[14px] py-[7px] ${index === active ? 'bg-[#e6f1fe]' : ''} ${
                  index === selectedIndex ? 'font-semibold text-[#1a60e3]' : ''
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}

function App() {
  const [scope, setScope] = useState('international');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // Country/State options depend on the scope, so switching starts from a clean filter set.
  // Any scope or filter change goes back to the first page of results.
  const changeScope = (next) => {
    if (next === scope) return;
    setScope(next);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };
  const setFilter = (key) => (value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const updateFilter = (key) => (event) => setFilter(key)(event.target.value);
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] font-sans pb-12">
      <Header scope={scope} onScopeChange={changeScope} />

      <main className="shell relative z-30 flex flex-col gap-5">
        {/* Find a fair section */}
        <div className={`${cardClass} pb-[12px] pl-[19px] pr-[24px] pt-[15px]`}>
          {/* Soft blue sweep in the bottom-right corner */}
          <svg aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-full w-[272px]" viewBox="0 0 340 235" preserveAspectRatio="none">
            <defs>
              <linearGradient id="card-wave-a" x1="0" x2="1" y1="1" y2="0">
                <stop offset="0" stopColor="#eef5fd" stopOpacity="0" />
                <stop offset="1" stopColor="#e8f1fc" />
              </linearGradient>
              <linearGradient id="card-wave-b" x1="0" x2="1" y1="1" y2="0">
                <stop offset="0" stopColor="#f4f8fe" stopOpacity="0" />
                <stop offset="1" stopColor="#f3f8fe" />
              </linearGradient>
            </defs>
            <path d="M0 235C110 205 215 125 340 18V235Z" fill="url(#card-wave-a)" />
            <path d="M120 235C205 210 275 165 340 118V235Z" fill="url(#card-wave-b)" />
          </svg>

          <div className="relative flex h-[26px] items-center">
            <span className="h-[26px] w-[4px] rounded-full bg-[#ff881e]" />
            <Search className="ml-[15px] text-[#1a60e3]" size={28} strokeWidth={2} />
            <h3 className="ml-[14px] text-[22px] font-bold text-navy">Find a fair</h3>
          </div>

          <div className="relative mt-[11px] grid grid-cols-1 gap-x-[19px] gap-y-3 sm:grid-cols-2 lg:grid-cols-[296fr_233fr_222fr_225fr_316fr]">
            <div className="flex flex-col">
              <label htmlFor="filter-sector" className={labelClass}>Sector</label>
              <Dropdown id="filter-sector" value={filters.sector} onChange={setFilter('sector')} options={SECTOR_OPTIONS} />
            </div>
            <div className="flex flex-col">
              <label htmlFor="filter-place" className={labelClass}>{scope === 'international' ? 'Country' : 'State'}</label>
              <Dropdown id="filter-place" value={filters.place} onChange={setFilter('place')} options={PLACES[scope]} />
            </div>
            <div className="flex flex-col">
              <label htmlFor="filter-year" className={labelClass}>Year</label>
              <Dropdown id="filter-year" value={filters.year} onChange={setFilter('year')} options={YEARS} />
            </div>
            <div className="flex flex-col">
              <label htmlFor="filter-month" className={labelClass}>Month</label>
              <Dropdown id="filter-month" value={filters.month} onChange={setFilter('month')} options={MONTHS} />
            </div>
            <div className="flex flex-col">
              <label htmlFor="filter-name" className={labelClass}>Fair name</label>
              <input
                id="filter-name"
                type="text"
                list="fair-names"
                autoComplete="off"
                placeholder="Type part of a name"
                value={filters.name}
                onChange={updateFilter('name')}
                className={`${controlClass} pr-3 placeholder:text-[#6b7898]`}
              />
              <datalist id="fair-names">
                {FAIR_NAMES[scope].map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>

          <button type="button" onClick={clearFilters} className="relative mt-[16px] flex h-[38px] w-[150px] items-center justify-center gap-3 rounded-[8px] border border-[#cddff8] bg-[#e6f1fe] text-[14px] font-bold text-[#0e1a3d] transition-colors hover:bg-[#dbe9fc]">
            <RotateCw size={18} strokeWidth={2} /> Clear filters
          </button>
        </div>
      </main>

      <FairsTable
        scope={scope}
        fairs={filterFairs(scope, filters)}
        page={page}
        onPageChange={setPage}
        onClearFilters={clearFilters}
      />

      <SourcesSection />
    </div>
  );
}

export default App;
