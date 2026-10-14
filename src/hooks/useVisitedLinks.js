import { useEffect, useState } from 'react';

// Links this person has opened, remembered in their own browser (localStorage), so each
// person sees their own visited links and the list survives reloads. Storage can be
// missing or blocked (private windows, blocked site data); links then start unvisited
// and only stay marked until the page is closed.
const read = (key) => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(key));
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
};

function useVisitedLinks(storageKey) {
  const [visited, setVisited] = useState(() => read(storageKey));

  // Pick up links opened from another tab of the portal
  useEffect(() => {
    const sync = (event) => {
      if (event.key === storageKey) setVisited((current) => new Set([...current, ...read(storageKey)]));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [storageKey]);

  const markVisited = (id) => {
    if (visited.has(id)) return;
    const next = new Set([...read(storageKey), ...visited, id]);
    setVisited(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch {
      // Not remembered after this visit, but the colour still changes for now
    }
  };

  return [visited, markVisited];
}

export default useVisitedLinks;
