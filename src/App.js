import './index.css';
import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { useToast, Toast } from './components/Toast';
import { uid } from './utils';

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import CommunityPage from './pages/CommunityPage';
import ArtistPage from './pages/ArtistPage';
import SponsorPage from './pages/SponsorPage';
import DeckPage from './pages/DeckPage';
import ArtistModal from './components/ArtistModal';
import ApplyModal from './components/ApplyModal';

// Nav: removed 'venues' page and 'venue' (My Venue) — kept sponsor + deck
const NAV = [
  ['home',     'Home'],
  ['browse',   'Gigs'],
  ['community','Scene'],
  ['artist',   null],   // label set dynamically
  ['sponsor',  'Sponsor'],
  ['deck',     'Pitch Deck'],
];

export default function App() {
  const [curPage, setCurPage] = useState('home');
  const { toast, showToast }  = useToast();
  const state = useAppState();

  const [artistModal, setArtistModal] = useState(null);
  const [applyGig,    setApplyGig]    = useState(null);

  function setPage(p) {
    setCurPage(p);
    document.querySelector('.app-scroll')?.scrollTo(0, 0);
  }

  function openArtistModal(id) {
    const a = state.artists.find(x => x.id === id);
    if (a) setArtistModal(a);
  }

  function openApply(gigId) {
    if (!state.curArtist) { showToast('Register as an artist first', true); setPage('artist'); return; }
    if (state.appliedGigs[gigId]) return;
    setApplyGig(gigId);
  }

  function submitApp(gigId, pitch) {
    const artist = state.curArtist;
    const app = {
      id: uid(), gigId, artistId: artist.id,
      artistName: artist.name, artistGenre: artist.genre, artistCity: artist.city,
      pitch, sent: 'just now', status: 'pending'
    };
    state.setApplications([...state.applications, app]);
    state.setAppliedGigs({ ...state.appliedGigs, [gigId]: true });
    setApplyGig(null);
    showToast('Application sent! 🎸');
  }

  const gigForApply = applyGig ? state.gigs.find(g => g.id === applyGig) : null;

  const navItems = NAV.map(([p, l]) => [
    p,
    p === 'artist' ? (state.curArtist ? 'My Artist' : 'Artist') : l
  ]);

  return (
    <>
      <Toast toast={toast} />
      <div className="app-scroll">
        <nav>
          <div className="nav-logo" onClick={() => setPage('home')}>
            getme<span>gig</span><span style={{ fontSize: 11 }}>.co.in</span>
          </div>
          <div className="nav-links">
            {navItems.map(([p, l]) => (
              <button key={p} className={`nav-btn${p === curPage ? ' active' : ''}`} onClick={() => setPage(p)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>

        <div id="content">
          {curPage === 'home'      && <HomePage gigs={state.gigs} artists={state.artists} appliedGigs={state.appliedGigs} setPage={setPage} onApply={openApply} onOpenArtist={openArtistModal} />}
          {curPage === 'browse'    && <BrowsePage gigs={state.gigs} appliedGigs={state.appliedGigs} onApply={openApply} />}
          {curPage === 'community' && <CommunityPage artists={state.artists} setPage={setPage} onOpenArtist={openArtistModal} />}
          {curPage === 'artist'    && (
            <ArtistPage
              curArtist={state.curArtist} setCurArtist={state.setCurArtist}
              artists={state.artists}     setArtists={state.setArtists}
              gigs={state.gigs}
              applications={state.applications} setApplications={state.setApplications}
              appliedGigs={state.appliedGigs}   setAppliedGigs={state.setAppliedGigs}
              setPage={setPage}
            />
          )}
          {curPage === 'sponsor'   && <SponsorPage gigs={state.gigs} setGigs={state.setGigs} />}
          {curPage === 'deck'      && <DeckPage />}
        </div>
      </div>

      {artistModal && <ArtistModal artist={artistModal} onClose={() => setArtistModal(null)} />}
      {applyGig    && <ApplyModal  gig={gigForApply}  artist={state.curArtist} onSubmit={submitApp} onClose={() => setApplyGig(null)} />}
    </>
  );
}
