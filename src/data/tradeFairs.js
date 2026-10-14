// Filter and listing data taken from the Trade Fairs Portal reference page.
// FAIRS is that page's sample listing; the country and fair-name options are
// derived from it the same way that page builds its dropdowns. Years run from
// 2026 onward and extend automatically (see YEARS).

export const SECTORS = [
  'Ministry of Agriculture', 'Ministry of Commerce', 'Ministry of Consumer Affairs & PDS', 'Ministry of MSME',
  'Ministry of Co-operation', 'Ministry of AYUSH', 'Ministry of Shipping', 'Ministry of Chemicals & Fertilizers',
  'Ministry of Forest', 'Ministry of Health & Family Welfare', 'Ministry of Women & Child Development',
  'Ministry of Defence', 'Ministry of Textiles', 'Ministry of Finance', 'Ministry of HRD',
  'Ministry of Skill Development', 'Ministry of Railways', 'Ministry of Food Processing',
  'Ministry of Civil Aviation', 'Ministry of Animal Husbandry', 'Ministry of External Affairs',
];

export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Chandigarh', 'Puducherry',
];

// Value is the month number, as on the reference page
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
].map((label, i) => ({ value: String(i + 1), label }));

// Organisers / listing pages each fair's "View details" link points to; also listed
// in the "Official sources for fair listings" section
export const SOURCES = {
  apeda: { name: 'APEDA', description: 'Agri and processed food fairs, international listing', url: 'https://apeda.gov.in/TradeFairs' },
  wb: {
    name: 'State Export Facilitation Centre, West Bengal',
    description: 'Domestic fairs, redirect link reference',
    url: 'https://www.wbseps.com/fairs.html',
  },
  warsaw: {
    name: 'Embassy of India, Warsaw',
    description: 'Upcoming trade fairs',
    url: 'https://www.indianembassywarsaw.gov.in/page/upcomingtrade-fairs-in-india/',
  },
  spice: { name: 'Spices Board', description: 'Spice trade fairs', url: 'https://www.indianspices.com/marketing/trade/trade-fairs.html' },
  epch: {
    name: 'Export Promotion Council for Handicrafts',
    description: 'Proposed participation in international fairs',
    url: 'https://epch.in/',
  },
  up: { name: 'UP International Trade Show', description: 'Domestic fair', url: 'https://upinternationaltradeshow.com/' },
  tg: {
    name: 'Trade Events Worldwide',
    description: 'Design reference and worldwide event list',
    url: 'https://www.trade.gov.in/pages/trade-events-worldwide',
  },
};

// [scope, name, sector, country or state, city, start, end, source]
export const FAIRS = [
  ['international', 'SIAL Paris', 'Ministry of Food Processing', 'France', 'Paris', '2026-10-17', '2026-10-21', 'apeda'],
  ['international', 'Gulfood', 'Ministry of Food Processing', 'United Arab Emirates', 'Dubai', '2027-01-25', '2027-01-29', 'apeda'],
  ['international', 'Heimtextil', 'Ministry of Textiles', 'Germany', 'Frankfurt', '2027-01-12', '2027-01-15', 'epch'],
  ['international', 'Ambiente', 'Ministry of Commerce', 'Germany', 'Frankfurt', '2027-02-05', '2027-02-09', 'epch'],
  ['international', 'BIOFACH', 'Ministry of Agriculture', 'Germany', 'Nuremberg', '2027-02-17', '2027-02-20', 'apeda'],
  ['international', 'Arab Health (WHX)', 'Ministry of Health & Family Welfare', 'United Arab Emirates', 'Dubai', '2027-02-01', '2027-02-04', 'tg'],
  ['international', 'Foodex Japan', 'Ministry of Food Processing', 'Japan', 'Tokyo', '2027-03-09', '2027-03-12', 'apeda'],
  ['international', 'Warsaw Industry Week', 'Ministry of MSME', 'Poland', 'Warsaw', '2027-03-17', '2027-03-19', 'warsaw'],
  ['international', 'Hannover Messe', 'Ministry of MSME', 'Germany', 'Hannover', '2027-04-12', '2027-04-16', 'tg'],
  ['international', 'Seafood Expo Global', 'Ministry of Animal Husbandry', 'Spain', 'Barcelona', '2027-04-20', '2027-04-22', 'apeda'],
  ['international', 'Canton Fair', 'Ministry of Commerce', 'China', 'Guangzhou', '2027-04-15', '2027-05-05', 'tg'],
  ['international', 'ACHEMA', 'Ministry of Chemicals & Fertilizers', 'Germany', 'Frankfurt', '2027-06-14', '2027-06-18', 'tg'],
  ['international', 'Summer Fancy Food Show', 'Ministry of Agriculture', 'United States', 'New York', '2027-06-27', '2027-06-29', 'apeda'],
  ['international', 'Spice sourcing mission', 'Ministry of Commerce', 'Singapore', 'Singapore', '2026-11-24', '2026-11-26', 'spice'],
  ['national', 'IHGF Delhi Fair (Autumn)', 'Ministry of Commerce', 'Delhi', 'Greater Noida', '2026-10-14', '2026-10-17', 'epch'],
  ['national', 'Global Economic Summit and World Trade Expo', 'Ministry of Commerce', 'Maharashtra', 'Mumbai', '2026-11-20', '2026-11-21', 'tg'],
  ['national', 'India International Trade Fair (IITF)', 'Ministry of Commerce', 'Delhi', 'New Delhi', '2026-11-14', '2026-11-27', 'tg'],
  ['national', 'Aqua and Fisheries Expo', 'Ministry of Animal Husbandry', 'Andhra Pradesh', 'Visakhapatnam', '2026-11-12', '2026-11-14', 'apeda'],
  ['national', 'West Bengal MSME Trade Fair', 'Ministry of MSME', 'West Bengal', 'Kolkata', '2026-12-10', '2026-12-14', 'wb'],
  ['national', 'International Agri Expo', 'Ministry of Agriculture', 'Telangana', 'Hyderabad', '2026-12-18', '2026-12-20', 'apeda'],
  ['national', 'India International Leather Fair', 'Ministry of Commerce', 'Tamil Nadu', 'Chennai', '2027-01-30', '2027-02-01', 'epch'],
  ['national', 'India International Seafood Show', 'Ministry of Animal Husbandry', 'Kerala', 'Kochi', '2027-02-05', '2027-02-07', 'apeda'],
  ['national', 'India International Spices Conference', 'Ministry of Commerce', 'Kerala', 'Kochi', '2027-02-19', '2027-02-21', 'spice'],
  ['national', 'Bharat Tex', 'Ministry of Textiles', 'Delhi', 'New Delhi', '2027-02-26', '2027-03-01', 'tg'],
  ['national', 'AAHAR Food and Hospitality Fair', 'Ministry of Food Processing', 'Delhi', 'New Delhi', '2027-03-09', '2027-03-13', 'apeda'],
  ['national', 'UP International Trade Show', 'Ministry of MSME', 'Uttar Pradesh', 'Greater Noida', '2027-09-24', '2027-09-28', 'up'],
].map(([scope, name, sector, place, city, start, end, source]) => ({ scope, name, sector, place, city, start, end, source }));

const uniqueSorted = (list) => [...new Set(list)].sort();
const fairsIn = (scope) => FAIRS.filter((fair) => fair.scope === scope);

// International lists the countries that have fairs; national lists every state and UT
export const PLACES = {
  international: uniqueSorted(fairsIn('international').map((fair) => fair.place)),
  national: STATES,
};

// Every year from 2026 up to five years past the current year (or the latest fair, if later)
const FIRST_YEAR = 2026;
const YEARS_AHEAD = 5;
const lastYear = Math.max(
  new Date().getFullYear() + YEARS_AHEAD,
  ...FAIRS.map((fair) => Number(fair.start.slice(0, 4))),
);
export const YEARS = Array.from({ length: lastYear - FIRST_YEAR + 1 }, (_, i) => String(FIRST_YEAR + i));

export const FAIR_NAMES = {
  international: uniqueSorted(fairsIn('international').map((fair) => fair.name)),
  national: uniqueSorted(fairsIn('national').map((fair) => fair.name)),
};
