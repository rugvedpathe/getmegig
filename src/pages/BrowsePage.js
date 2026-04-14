import { useState } from 'react';
import GigCard from '../components/GigCard';
import { C } from '../data/defaults';

export default function BrowsePage({ gigs, appliedGigs, onApply, onOpenVenue }) {
  const [filterCity, setFilterCity] = useState('All');
  const cities = ['All', 'Bangalore', 'Mumbai', 'Pune', 'Delhi'];
  const filtered = filterCity === 'All' ? gigs : gigs.filter(g => g.city === filterCity);
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Open gigs</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cities.map(c => (
            <button key={c} onClick={() => setFilterCity(c)}
              style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filterCity === c ? C.teal : '#e8e8e8'}`, background: filterCity === c ? C.tealL : 'transparent', color: filterCity === c ? C.teal : '#aaa', fontFamily: "'DM Sans',sans-serif", fontSize: 12, cursor: 'pointer' }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {filtered.length > 0
        ? filtered.map(g => <GigCard key={g.id} g={g} appliedGigs={appliedGigs} onApply={onApply} onOpenVenue={onOpenVenue} />)
        : <div style={{ padding: '3rem', textAlign: 'center', color: '#ccc', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 10 }}>No gigs in {filterCity} yet.</div>
      }
    </div>
  );
}
