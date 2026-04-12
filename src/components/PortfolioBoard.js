import { useState } from 'react';
import { getYtThumbnail, ytEmbedUrl } from '../utils';

// Lightbox
function Lightbox({ item, onClose }) {
  if (!item) return null;
  const embed = item.url ? ytEmbedUrl(item.url) : null;
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      <div onClick={e => e.stopPropagation()}>
        {item.type === 'photo' ? (
          <img src={item.src} alt={item.caption || ''} />
        ) : embed ? (
          <div className="lb-vid">
            <iframe src={embed} allowFullScreen title={item.title} />
          </div>
        ) : (
          <div style={{ color: '#fff', fontSize: 16, padding: '2rem' }}>
            <div style={{ marginBottom: 8 }}>▶ {item.title}</div>
            <div style={{ fontSize: 12, opacity: .6 }}>Uploaded video (session only)</div>
          </div>
        )}
      </div>
      {(item.title || item.caption) && (
        <div className="lb-caption">{item.title || item.caption}</div>
      )}
    </div>
  );
}

// Single board item
function BoardItem({ item, onDelete, isOwner, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isVid = item.type === 'video';
  const thumb = isVid ? getYtThumbnail(item.url) : item.src;
  const heights = [120, 150, 180, 140, 160, 130];
  const h = heights[(item.id || '').charCodeAt(0) % heights.length] || 140;

  return (
    <div
      className="board-item"
      style={{ height: thumb ? 'auto' : h }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {thumb ? (
        <img src={thumb} alt={item.title || item.caption || ''} style={{ minHeight: 90 }} />
      ) : (
        <div style={{ height: h, background: 'linear-gradient(135deg,#1a1a2e,#16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
          <div style={{ width: 40, height: 40, background: '#1D9E75', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff' }}>▶</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textAlign: 'center', padding: '0 8px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        </div>
      )}
      {isVid && (
        <div className="board-item-vid">▶ video</div>
      )}
      <div className="board-item-overlay" style={{ opacity: hovered ? 1 : 0 }}>
        <div className="board-item-title">{item.title || item.caption || ''}</div>
        {item.desc && <div className="board-item-desc">{item.desc}</div>}
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); onDelete && onDelete(item); }}
            style={{ marginTop: 6, padding: '3px 10px', borderRadius: 6, border: 'none', background: 'rgba(192,57,43,.8)', color: '#fff', fontSize: 10, cursor: 'pointer', alignSelf: 'flex-start' }}>
            ✕ Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function PortfolioBoard({ portfolio = [], photos = [], isOwner = false, onDeleteVideo, onDeletePhoto, onAddVideo, onAddPhoto }) {
  const [lightbox, setLightbox] = useState(null);

  // Merge all items for the board
  const vidItems = portfolio.map(p => ({ ...p, type: 'video' }));
  const photoItems = photos.map((p, i) => ({ id: 'ph' + i, type: 'photo', src: p.src || p, caption: p.caption || '' }));
  const allItems = [];
  // Interleave videos and photos for visual variety
  let vi = 0, pi = 0;
  while (vi < vidItems.length || pi < photoItems.length) {
    if (vi < vidItems.length) allItems.push(vidItems[vi++]);
    if (pi < photoItems.length) allItems.push(photoItems[pi++]);
    if (pi < photoItems.length) allItems.push(photoItems[pi++]);
  }

  return (
    <>
      <div className="portfolio-board">
        {isOwner && (
          <div className="board-add-btn" onClick={onAddVideo}>
            <span style={{ fontSize: 20 }}>＋</span> Add video
          </div>
        )}
        {isOwner && (
          <div className="board-add-btn" onClick={onAddPhoto} style={{ borderColor: '#e8e8e8' }}>
            <span style={{ fontSize: 20 }}>🖼️</span> Add photo
          </div>
        )}
        {allItems.map((item, idx) => (
          <BoardItem
            key={item.id || idx}
            item={item}
            isOwner={isOwner}
            onClick={() => setLightbox(item)}
            onDelete={item.type === 'video' ? onDeleteVideo : onDeletePhoto}
          />
        ))}
        {allItems.length === 0 && !isOwner && (
          <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: '#ccc', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 12 }}>
            No portfolio items yet
          </div>
        )}
      </div>
      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
