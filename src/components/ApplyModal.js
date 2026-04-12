import { useState, useEffect } from 'react';

async function callAI(prompt) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const d = await res.json();
    return d.content?.[0]?.text || '';
  } catch { return ''; }
}

export default function ApplyModal({ gig, artist, onSubmit, onClose }) {
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gig || !artist) return;
    setLoading(true);
    callAI(`Write a short, genuine 3-4 sentence application pitch from ${artist.name} (${artist.genre}, ${artist.city}) applying for a gig at ${gig.name}. The gig needs: ${gig.genreNeed||'any genre'}, ${gig.pay}, ${gig.night}. Artist bio: ${artist.bio||'passionate musician'}. Make it personal and direct. No clichés.`)
      .then(text => { setPitch(text); setLoading(false); });
  }, [gig, artist]);

  if (!gig) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-bottom-sheet">
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 2 }}>{gig.name}</div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 18 }}>{gig.type} · {gig.city} · {gig.pay}</div>
        <div className="label" style={{ marginBottom: 10 }}>YOUR PITCH — EDIT FREELY</div>
        {loading
          ? <div style={{ padding: '2rem', textAlign: 'center', color: '#bbb', fontSize: 13, background: '#f8f8f8', borderRadius: 8, lineHeight: 1.7 }}>Personalizing your pitch based on your profile and this gig...</div>
          : <textarea value={pitch} onChange={e => setPitch(e.target.value)} style={{ minHeight: 120, lineHeight: 1.7 }} />
        }
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn btn-teal" style={{ flex: 1 }} disabled={loading} onClick={() => onSubmit(gig.id, pitch)}>Send application</button>
          <button className="btn btn-outline" style={{ padding: '13px 18px' }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
