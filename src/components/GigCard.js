import { C } from '../data/defaults';

export default function GigCard({ g, appliedGigs, onApply, onOpenVenue }) {
  const applied = appliedGigs[g.id];
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15 }}>
            {g.name}
            {g.venueId && (
              <span onClick={() => onOpenVenue && onOpenVenue(g.venueId)}
                style={{ fontSize: 11, color: C.blue, cursor: 'pointer', marginLeft: 8 }}>
                View venue →
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
            {g.type} · {g.city} · {g.night}{g.duration ? ' · ' + g.duration : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.teal }}>{g.pay}</div>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>posted {g.posted}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#666', margin: '10px 0', lineHeight: 1.6 }}>{g.desc}</p>
      {(g.sponsors || []).length > 0 && (
        <div style={{ margin: '8px 0', padding: '7px 12px', background: C.amberL, borderRadius: 8, border: '1px solid rgba(186,117,23,.2)' }}>
          <span style={{ fontSize: 11, color: C.amber }}>🏷️ Sponsored · </span>
          {g.sponsors.map((s, i) => (
            <span key={i} style={{ fontSize: 12, color: C.amber }}>{s.brand} — {s.amount}</span>
          ))}
        </div>
      )}
      {(g.slots || []).length > 0 && (
        <div style={{ margin: '8px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {g.slots.map((s, i) => <span key={i} className="tag tag-teal">{s}</span>)}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
        <span className="tag tag-gray">{g.genreNeed || 'Open genre'}</span>
        <button
          onClick={() => !applied && onApply(g.id)}
          disabled={!!applied}
          style={{ padding: '7px 18px', borderRadius: 8, border: `1px solid ${applied ? '#e8e8e8' : C.teal}`, background: applied ? '#f8f8f8' : 'transparent', color: applied ? '#bbb' : C.teal, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: applied ? 'default' : 'pointer' }}>
          {applied ? 'Applied ✓' : 'Apply — AI writes your pitch ↗'}
        </button>
      </div>
    </div>
  );
}
