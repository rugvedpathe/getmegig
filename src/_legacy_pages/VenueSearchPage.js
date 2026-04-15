import { C } from '../data/defaults';
import { useState } from 'react';



function VenueCard({ v, onClick }) {
  const photos = v.photos || [];
  return (
    <div className="card" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={onClick}>
      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderRadius: 10, overflow: 'hidden', height: 100 }}>
          {photos.slice(0, 3).map((p, i) => (
            <img key={i} src={p.src || p} alt="" style={{ flex: 1, objectFit: 'cover', minWidth: 0 }} onError={e => e.target.style.display = 'none'} />
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.blueL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `2px solid rgba(24,95,165,.2)` }}>🏠</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{v.type} · {v.area ? v.area + ' · ' : ''}{v.city}</div>
          {v.capacity && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>👥 {v.capacity} cap</div>}
        </div>
        <span className="tag tag-blue">{v.type || 'Venue'}</span>
      </div>
      {v.about && (
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.about}</p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {v.pa && <span style={{ fontSize: 11, color: C.blue }}>🔊 {v.pa}</span>}
        {v.nights && <span style={{ fontSize: 11, color: '#888' }}>📅 {v.nights}</span>}
        {v.genres && <span className="tag tag-gray" style={{ fontSize: 10 }}>{v.genres.split(',')[0]?.trim()}</span>}
      </div>
    </div>
  );
}

export default function VenueSearchPage({ venues, setPage, onOpenVenue }) {
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const cities = ['All', 'Bangalore', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad', 'Chennai'];
  const types = ['All', 'Café', 'Bar', 'Club', 'Brewery', 'Music Venue', 'Restaurant', 'Rooftop'];

  const filtered = venues.filter(v => {
    const matchQuery = !query || v.name.toLowerCase().includes(query.toLowerCase()) || (v.about || '').toLowerCase().includes(query.toLowerCase()) || (v.genres || '').toLowerCase().includes(query.toLowerCase());
    const matchCity = cityFilter === 'All' || v.city === cityFilter;
    const matchType = typeFilter === 'All' || v.type === typeFilter;
    return matchQuery && matchCity && matchType;
  });

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 6px' }}>Find Venues</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>Browse venues looking for live music across India.</p>

      {/* Search bar */}
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Search by name, genre, vibe..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ fontSize: 14 }}
        />
      </div>

      {/* City filters */}
      <div className="filter-chips">
        {cities.map(c => (
          <button key={c} className={`filter-chip${cityFilter === c ? ' active' : ''}`} onClick={() => setCityFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Type filters */}
      <div className="filter-chips">
        {types.map(t => (
          <button key={t} className={`filter-chip${typeFilter === t ? ' active-teal' : ''}`}
            style={{ borderColor: typeFilter === t ? C.teal : undefined }}
            onClick={() => setTypeFilter(t)}>{t}</button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#ccc', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 12 }}>
          {venues.length === 0
            ? <>No venues yet — <span style={{ color: C.blue, cursor: 'pointer' }} onClick={() => setPage('venue')}>list your venue →</span></>
            : `No venues match your search.`
          }
        </div>
      ) : (
        <>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12, letterSpacing: 1 }}>{filtered.length} VENUE{filtered.length !== 1 ? 'S' : ''} FOUND</div>
          {filtered.map(v => <VenueCard key={v.id} v={v} onClick={() => onOpenVenue(v.id)} />)}
        </>
      )}
    </div>
  );
}
