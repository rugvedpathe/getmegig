import { useState, useCallback } from 'react';
import { GIGS_DEFAULT } from '../data/defaults';

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function useAppState() {
  const [gigs, setGigsRaw] = useState(() => load('gmg8-gigs', JSON.parse(JSON.stringify(GIGS_DEFAULT))));
  const [artists, setArtistsRaw] = useState(() => load('gmg8-artists', []));
  const [venues, setVenuesRaw] = useState(() => load('gmg8-venues', []));
  const [applications, setApplicationsRaw] = useState(() => load('gmg8-apps', []));
  const [curArtist, setCurArtistRaw] = useState(() => load('gmg8-cur-artist', null));
  const [curVenue, setCurVenueRaw] = useState(() => load('gmg8-cur-venue', null));
  const [appliedGigs, setAppliedGigs] = useState(() => {
    const apps = load('gmg8-apps', []);
    const ca = load('gmg8-cur-artist', null);
    if (!ca) return {};
    const m = {};
    apps.filter(a => a.artistId === ca.id).forEach(a => { m[a.gigId] = true; });
    return m;
  });

  const setGigs = useCallback(v => { setGigsRaw(v); save('gmg8-gigs', v); }, []);
  const setArtists = useCallback(v => { setArtistsRaw(v); save('gmg8-artists', v); }, []);
  const setVenues = useCallback(v => { setVenuesRaw(v); save('gmg8-venues', v); }, []);
  const setApplications = useCallback(v => { setApplicationsRaw(v); save('gmg8-apps', v); }, []);
  const setCurArtist = useCallback(v => { setCurArtistRaw(v); save('gmg8-cur-artist', v); }, []);
  const setCurVenue = useCallback(v => { setCurVenueRaw(v); save('gmg8-cur-venue', v); }, []);

  return {
    gigs, setGigs,
    artists, setArtists,
    venues, setVenues,
    applications, setApplications,
    curArtist, setCurArtist,
    curVenue, setCurVenue,
    appliedGigs, setAppliedGigs,
  };
}
