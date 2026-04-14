import './index.css';
import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { useToast, Toast } from './components/Toast';
import { uid } from './utils';

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import CommunityPage from './pages/CommunityPage';
import ArtistPage from './pages/ArtistPage';
import VenuePage from './pages/VenuePage';
import VenueSearchPage from './pages/VenueSearchPage';
import SponsorPage from './pages/SponsorPage';
import DeckPage from './pages/DeckPage';
import ArtistModal from './components/ArtistModal';
import VenueModal from './components/VenueModal';
import ApplyModal from './components/ApplyModal';

export default function App() {
  const [curPage, setCurPage] = useState('home');
  const { toast, showToast } = useToast();
  const state = useAppState();

  const [artistModal, setArtistModal] = useState(null);
  const [venueModal, setVenueModal] = useState(null);
  const [applyGig, setApplyGig] = useState(null);

  function setPage(p) {
    setCurPage(p);
    document.querySelector('.app-scroll')?.scrollTo(0, 0);
  }

  function openArtistModal(id) {
    const a = state.artists.find(x => x.id === id);
    if (a) setArtistModal(a);
  }
  function openVenueModal(id) {
    const v = state.venues.find(x => x.id === id);
    if (v) setVenueModal(v);
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

  const nav = [
    ['home','Home'],['browse','Gigs'],['community','Scene'],
    ['venues','Venues'],
    ['artist', state.curArtist ? 'My Artist' : 'Artist'],
    ['venue', state.curVenue ? 'My Venue' : 'Venue'],
    ['sponsor','Sponsor'],['deck','Pitch Deck']
  ];

  return (
    <>
      <Toast toast={toast} />
      <div className="app-scroll">
        <nav>
          <div className="nav-logo" onClick={() => setPage('home')}>getme<span>gig</span><span style={{fontSize:11}}>.co.in</span></div>
          <div className="nav-links">
            {nav.map(([p,l]) => (
              <button key={p} className={`nav-btn${p===curPage?' active':''}`} onClick={() => setPage(p)}>{l.toUpperCase()}</button>
            ))}
          </div>
        </nav>

        <div id="content">
          {curPage==='home' && <HomePage gigs={state.gigs} artists={state.artists} appliedGigs={state.appliedGigs} setPage={setPage} onApply={openApply} onOpenArtist={openArtistModal}/>}
          {curPage==='browse' && <BrowsePage gigs={state.gigs} appliedGigs={state.appliedGigs} onApply={openApply} onOpenVenue={openVenueModal}/>}
          {curPage==='community' && <CommunityPage artists={state.artists} venues={state.venues} setPage={setPage} onOpenArtist={openArtistModal} onOpenVenue={openVenueModal}/>}
          {curPage==='venues' && <VenueSearchPage venues={state.venues} setPage={setPage} onOpenVenue={openVenueModal}/>}
          {curPage==='artist' && (
            <ArtistPage curArtist={state.curArtist} setCurArtist={state.setCurArtist}
              artists={state.artists} setArtists={state.setArtists}
              gigs={state.gigs} applications={state.applications} setApplications={state.setApplications}
              appliedGigs={state.appliedGigs} setAppliedGigs={state.setAppliedGigs} setPage={setPage}/>
          )}
          {curPage==='venue' && (
            <VenuePage curVenue={state.curVenue} setCurVenue={state.setCurVenue}
              venues={state.venues} setVenues={state.setVenues}
              gigs={state.gigs} setGigs={state.setGigs}
              applications={state.applications} setApplications={state.setApplications}
              artists={state.artists} setArtists={state.setArtists}
              setPage={setPage}/>
          )}
          {curPage==='sponsor' && <SponsorPage gigs={state.gigs} setGigs={state.setGigs}/>}
          {curPage==='deck' && <DeckPage/>}
        </div>
      </div>

      {artistModal && <ArtistModal artist={artistModal} onClose={() => setArtistModal(null)}/>}
      {venueModal && <VenueModal venue={venueModal} onClose={() => setVenueModal(null)}/>}
      {applyGig && <ApplyModal gig={gigForApply} artist={state.curArtist} onSubmit={submitApp} onClose={() => setApplyGig(null)}/>}
    </>
  );
}
