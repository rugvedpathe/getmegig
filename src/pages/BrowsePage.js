import { useState } from 'react';
import GigCard from '../components/GigCard';
import { C } from '../data/defaults';

const CITIES  = ['All', 'Bangalore', 'Mumbai', 'Pune', 'Delhi'];
const GENRES  = ['All', 'Acoustic', 'Indie', 'Rock', 'Jazz', 'Metal', 'Soul', 'Electronic', 'Folk', 'Hip-Hop', 'Classical', 'Other'];
const TYPES   = ['All', 'Café', 'Bar', 'Club', 'Brewery', 'Music Venue', 'Restaurant', 'Rooftop', 'Open Air'];
const PAY     = ['Any pay', '₹0–2,000', '₹2,000–5,000', '₹5,000–10,000', '₹10,000+'];

function payMatches(gigPay, filter) {
  if (filter === 'Any pay') return true;
  if (!gigPay) return false;
  // Extract first number from pay string
  const num = parseInt(gigPay.replace(/[^0-9]/g, ''));
  if (isNaN(num)) return true;
  if (filter === '₹0–2,000')       return num < 2000;
  if (filter === '₹2,000–5,000')   return num >= 2000 && num < 5000;
  if (filter === '₹5,000–10,000')  return num >= 5000 && num < 10000;
  if (filter === '₹10,000+')       return num >= 10000;
  return true;
}

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
      border: `1px solid ${active ? C.teal : '#e8e8e8'}`,
      background: active ? C.tealL : 'transparent',
      color: active ? C.teal : '#aaa',
      fontFamily: "'DM Sans',sans-serif", fontSize: 12,
      whiteSpace: 'nowrap', transition: 'all .15s'
    }}>{label}</button>
  );
}

export default function BrowsePage({ gigs, appliedGigs, onApply, onOpenVenue }) {
  const [city,   setCity]   = useState('All');
  const [genre,  setGenre]  = useState('All');
  const [type,   setType]   = useState('All');
  const [pay,    setPay]    = useState('Any pay');
  const [open,   setOpen]   = useState(false); // filter panel toggle on mobile

  const activeFilters = [city!=='All', genre!=='All', type!=='All', pay!=='Any pay'].filter(Boolean).length;

  function reset() { setCity('All'); setGenre('All'); setType('All'); setPay('Any pay'); }

  const filtered = gigs.filter(g => {
    if (city  !== 'All'    && g.city !== city)                         return false;
    if (genre !== 'All'    && !(g.genreNeed||'').toLowerCase().includes(genre.toLowerCase())) return false;
    if (type  !== 'All'    && g.type !== type)                         return false;
    if (!payMatches(g.pay, pay))                                       return false;
    return true;
  });

  return (
    <div className="page">
      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:500, margin:0 }}>Open gigs</h2>
          <div style={{ fontSize:12, color:'#aaa', marginTop:3 }}>{filtered.length} gig{filtered.length!==1?'s':''} found</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {activeFilters > 0 && (
            <button onClick={reset} style={{ fontSize:12, color:'#C0392B', border:'1px solid rgba(192,57,43,.25)', borderRadius:20, padding:'5px 12px', background:'rgba(192,57,43,.04)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              ✕ Clear {activeFilters} filter{activeFilters!==1?'s':''}
            </button>
          )}
          <button onClick={() => setOpen(o=>!o)} style={{
            fontSize:12, padding:'6px 14px', borderRadius:8, cursor:'pointer',
            border:`1px solid ${open||activeFilters>0?C.teal:'#e8e8e8'}`,
            background: open||activeFilters>0 ? C.tealL : 'transparent',
            color: open||activeFilters>0 ? C.teal : '#888',
            fontFamily:"'DM Sans',sans-serif", fontWeight:500
          }}>
            ⚙ Filters{activeFilters>0?` (${activeFilters})`:''}
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {open && (
        <div className="card" style={{ marginBottom:20, padding:'16px 16px 12px' }}>
          {/* City */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:'#bbb', letterSpacing:2, fontWeight:500, marginBottom:8 }}>CITY</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {CITIES.map(c => <FilterPill key={c} label={c} active={city===c} onClick={()=>setCity(c)} />)}
            </div>
          </div>
          {/* Genre */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:'#bbb', letterSpacing:2, fontWeight:500, marginBottom:8 }}>GENRE</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {GENRES.map(g => <FilterPill key={g} label={g} active={genre===g} onClick={()=>setGenre(g)} />)}
            </div>
          </div>
          {/* Venue type */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:'#bbb', letterSpacing:2, fontWeight:500, marginBottom:8 }}>VENUE TYPE</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {TYPES.map(t => <FilterPill key={t} label={t} active={type===t} onClick={()=>setType(t)} />)}
            </div>
          </div>
          {/* Pay */}
          <div>
            <div style={{ fontSize:11, color:'#bbb', letterSpacing:2, fontWeight:500, marginBottom:8 }}>PAY RANGE</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {PAY.map(p => <FilterPill key={p} label={p} active={pay===p} onClick={()=>setPay(p)} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter chips (collapsed state) ── */}
      {!open && activeFilters > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {city  !== 'All'     && <span className="tag tag-teal">{city} ✕</span>}
          {genre !== 'All'     && <span className="tag tag-teal">{genre} ✕</span>}
          {type  !== 'All'     && <span className="tag tag-teal">{type} ✕</span>}
          {pay   !== 'Any pay' && <span className="tag tag-teal">{pay} ✕</span>}
        </div>
      )}

      {/* ── Gig list ── */}
      {filtered.length > 0
        ? filtered.map(g => <GigCard key={g.id} g={g} appliedGigs={appliedGigs} onApply={onApply} onOpenVenue={onOpenVenue} />)
        : (
          <div style={{ padding:'3rem', textAlign:'center', color:'#ccc', fontSize:13, border:'1px dashed #e8e8e8', borderRadius:10, lineHeight:1.8 }}>
            No gigs match your filters.<br/>
            <span style={{ color:C.teal, cursor:'pointer' }} onClick={reset}>Clear filters →</span>
          </div>
        )
      }
    </div>
  );
}
