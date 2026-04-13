import { useState } from 'react';

export function StarDisplay({ rating, size = 'sm' }) {
  const cls = size === 'lg' ? 'rating-star' : 'star star-sm';
  return (
    <div className="star-row">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={cls} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
      {rating > 0 && <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>{rating.toFixed(1)}</span>}
    </div>
  );
}

export function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rating-stars">
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          className={`rating-star${i <= (hover || value) ? ' active' : ''}`}
          style={{ color: i <= (hover || value) ? '#f0a500' : '#e8e8e8' }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >★</span>
      ))}
    </div>
  );
}

export function RatingModal({ artist, gig, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  function submit() {
    if (!rating) return;
    onSubmit({ rating, comment, artistId: artist.id, gigId: gig.id, date: new Date().toLocaleDateString('en-IN') });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rating-modal">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎸</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Rate {artist?.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>for {gig?.night} at {gig?.name}</div>
        </div>
        <StarPicker value={rating} onChange={setRating} />
        <div style={{ textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 16 }}>
          {['','Poor','Fair','Good','Very Good','Excellent'][rating] || 'Tap to rate'}
        </div>
        <textarea
          placeholder="Leave a comment (optional) — other venues will see this"
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{ marginBottom: 12, minHeight: 70 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-teal" style={{ flex: 1 }} onClick={submit} disabled={!rating}>Submit rating</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
