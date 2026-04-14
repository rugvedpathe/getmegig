import { C } from '../data/defaults';
import { getYtThumbnail } from '../utils';

function ArtistMiniCard({ a, onClick }) {
  const portfolio = a.portfolio || [];
  const firstVid  = portfolio[0];
  const ytThumb   = firstVid ? getYtThumbnail(firstVid.url) : null;
  // Also check for Cloudinary thumbnail stored on the item
  const thumb     = (firstVid && firstVid.thumbnail) ? firstVid.thumbnail : ytThumb;
  const hasVids   = portfolio.length > 0;

  return (
    <div className="community-card" onClick={onClick}>
      {hasVids && thumb && (
        <div className="vid-thumb-wrap">
          <img src={thumb} alt={firstVid.title} loading="lazy" />
          <div className="vid-thumb-overlay"><div className="play-btn">▶</div></div>
          {portfolio.length > 1 && <div className="vid-thumb-count">+{portfolio.length - 1} more</div>}
        </div>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:C.tealL, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🎸</div>
        <div>
          <div style={{ fontWeight:500, fontSize:13 }}>{a.name}</div>
          <div style={{ fontSize:11, color:'#aaa' }}>{a.city}</div>
        </div>
      </div>
      <span className="tag tag-teal">{a.genre}</span>
      <div style={{ fontSize:12, color:'#888', lineHeight:1.5, marginTop:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{a.bio || ''}</div>
      {hasVids && <div style={{ marginTop:8, fontSize:11, color:C.teal }}>▶ {portfolio.length} video{portfolio.length > 1 ? 's' : ''}</div>}
    </div>
  );
}

export default function CommunityPage({ artists, setPage, onOpenArtist }) {
  return (
    <div className="page">
      <h2 style={{ fontSize:22, fontWeight:500, margin:'0 0 6px' }}>The Scene</h2>
      <p style={{ fontSize:13, color:'#888', marginBottom:24, lineHeight:1.6 }}>Artists building India's live music scene.</p>

      <div className="community-grid">
        {artists.length > 0
          ? artists.map(a => <ArtistMiniCard key={a.id} a={a} onClick={() => onOpenArtist(a.id)} />)
          : (
            <div style={{ fontSize:13, color:'#ccc', gridColumn:'1/-1', padding:'2rem', textAlign:'center', border:'1px dashed #e8e8e8', borderRadius:10 }}>
              No artists yet — <span style={{ color:C.teal, cursor:'pointer' }} onClick={() => setPage('artist')}>be the first →</span>
            </div>
          )
        }
      </div>
    </div>
  );
}
