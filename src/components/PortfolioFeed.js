import { useState, useRef, useEffect } from 'react';
import { ytEmbedUrl, getYtThumbnail } from '../utils';
import { C } from '../data/defaults';

// ── Single full-screen card in the feed ────────────────────────────
function FeedCard({ item, isActive }) {
  const isVideo = item.type === 'video';
  const embed = isVideo && item.url ? ytEmbedUrl(item.url) : null;
  const thumb = isVideo ? getYtThumbnail(item.url) : null;
  const [playing, setPlaying] = useState(false);

  // reset play state when card leaves view
  useEffect(() => { if (!isActive) setPlaying(false); }, [isActive]);

  return (
    <div className="feed-card">
      {/* Media area */}
      <div className="feed-media">
        {isVideo ? (
          playing && embed ? (
            <iframe
              src={`${embed}?autoplay=1`}
              allow="autoplay; fullscreen"
              allowFullScreen
              title={item.title}
              className="feed-iframe"
            />
          ) : (
            <div className="feed-thumb-wrap" onClick={() => embed && setPlaying(true)}>
              {thumb
                ? <img src={thumb} alt={item.title} className="feed-thumb-img" />
                : <div className="feed-thumb-placeholder">
                    <div className="feed-play-icon">▶</div>
                  </div>
              }
              <div className="feed-play-overlay">
                <div className="feed-play-btn">
                  {embed ? '▶ Play video' : '🎵 Track'}
                </div>
              </div>
              <div className="feed-type-badge">🎬 VIDEO</div>
            </div>
          )
        ) : (
          // Photo
          <div className="feed-photo-wrap">
            <img src={item.src} alt={item.caption || ''} className="feed-photo-img"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            <div className="feed-photo-error" style={{display:'none'}}>📷 Photo unavailable</div>
            <div className="feed-type-badge">📷 PHOTO</div>
          </div>
        )}
      </div>

      {/* Caption bar */}
      {(item.title || item.caption || item.desc) && (
        <div className="feed-caption">
          <div className="feed-caption-title">{item.title || item.caption}</div>
          {item.desc && <div className="feed-caption-desc">{item.desc}</div>}
        </div>
      )}
    </div>
  );
}

// ── Dot indicators ─────────────────────────────────────────────────
function DotNav({ total, current, onChange }) {
  if (total <= 1) return null;
  return (
    <div className="feed-dots">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} className={`feed-dot${i === current ? ' active' : ''}`}
          onClick={() => onChange(i)} />
      ))}
    </div>
  );
}

// ── Main exported feed ─────────────────────────────────────────────
export default function PortfolioFeed({ portfolio = [], photos = [], isOwner = false, onDeleteVideo, onDeletePhoto }) {
  const [idx, setIdx] = useState(0);
  const containerRef = useRef();

  // Build unified feed items
  const items = [
    ...portfolio.map(p => ({ ...p, type: 'video' })),
    ...photos.map((p, i) => ({
      id: 'ph' + i,
      type: 'photo',
      src: p.src || p,
      caption: p.caption || '',
    })),
  ];

  // Scroll snap: detect which card is visible
  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const newIdx = Math.round(el.scrollTop / el.clientHeight);
    setIdx(newIdx);
  }

  function scrollTo(i) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: 'smooth' });
    setIdx(i);
  }

  function deleteCurrentItem() {
    const item = items[idx];
    if (!item) return;
    if (!window.confirm('Remove this item from your portfolio?')) return;
    if (item.type === 'video') onDeleteVideo && onDeleteVideo(item);
    else onDeletePhoto && onDeletePhoto(item);
    const newIdx = Math.max(0, idx - 1);
    setIdx(newIdx);
  }

  if (items.length === 0) {
    return (
      <div className="feed-empty">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#555', marginBottom: 8 }}>No portfolio items yet</div>
        <div style={{ fontSize: 13, color: '#aaa' }}>Add videos and photos to build your board</div>
      </div>
    );
  }

  return (
    <div className="feed-root">
      {/* Scroll container */}
      <div className="feed-scroll" ref={containerRef} onScroll={handleScroll}>
        {items.map((item, i) => (
          <div key={item.id || i} className="feed-slide">
            <FeedCard item={item} isActive={i === idx} />
          </div>
        ))}
      </div>

      {/* Counter top-right */}
      <div className="feed-counter">{idx + 1} / {items.length}</div>

      {/* Dot nav on right side */}
      <div className="feed-dotnav">
        <DotNav total={items.length} current={idx} onChange={scrollTo} />
      </div>

      {/* Delete button for owner */}
      {isOwner && (
        <button className="feed-delete-btn" onClick={deleteCurrentItem}>
          ✕ Remove
        </button>
      )}

      {/* Scroll hint arrows */}
      {idx < items.length - 1 && (
        <button className="feed-arrow feed-arrow-down" onClick={() => scrollTo(idx + 1)}>↓</button>
      )}
      {idx > 0 && (
        <button className="feed-arrow feed-arrow-up" onClick={() => scrollTo(idx - 1)}>↑</button>
      )}
    </div>
  );
}
