export default function Nav({ curPage, setPage, curArtist, curVenue }) {
  const nav = [
    ['home', 'Home'],
    ['browse', 'Gigs'],
    ['community', 'Scene'],
    ['artist', curArtist ? 'My Artist' : 'Artist'],
    ['venue', curVenue ? 'My Venue' : 'Venue'],
    ['sponsor', 'Sponsor'],
    ['deck', 'Pitch Deck'],
  ];
  return (
    <nav>
      <div className="nav-logo" onClick={() => setPage('home')}>
        getme<span>gig</span><span style={{ fontSize: 11 }}>.co.in</span>
      </div>
      <div className="nav-links">
        {nav.map(([p, l]) => (
          <button key={p} className={`nav-btn${p === curPage ? ' active' : ''}`} onClick={() => setPage(p)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}
