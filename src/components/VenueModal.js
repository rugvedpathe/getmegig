import { C } from '../data/defaults';

export default function VenueModal({ venue, onClose }) {
  if (!venue) return null;
  const v = venue;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="label label-blue">VENUE PROFILE</div>
          <button onClick={onClose} className="btn btn-outline btn-sm">✕ Close</button>
        </div>

        <div className="venue-hero">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.blueL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: `2px solid rgba(24,95,165,.3)` }}>🏠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{v.name}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{v.type} · {v.area ? v.area + ' · ' : ''}{v.city}</div>
              {v.address && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>📍 {v.address}</div>}
              {v.capacity && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>👥 {v.capacity} standing{v.seated ? ' · ' + v.seated + ' seated' : ''}</div>}
            </div>
          </div>
          {v.about && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 12 }}>{v.about}</p>}
          {(v.photos || []).length > 0 && (
            <div className="photo-strip">
              {v.photos.map((p, i) => (
                <img key={i} src={p.src || p} alt="" style={{ height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
              ))}
            </div>
          )}
        </div>

        {(v.pa || v.mixer || v.mics || v.monitors) && (
          <>
            <div className="section-title">SOUND SYSTEM</div>
            <div className="card" style={{ marginBottom: 16 }}>
              {[['PA System', v.pa], ['Monitors', v.monitors], ['Mixing Desk', v.mixer], ['Microphones', v.mics], ['DI / Other', v.di]].filter(([, val]) => val).map(([label, val]) => (
                <div key={label} className="info-row"><span className="info-label">{label}</span><span style={{ fontSize: 13 }}>{val}</span></div>
              ))}
            </div>
          </>
        )}

        {(v.lighting || v.visual || v.backline || v.green || v.stage) && (
          <>
            <div className="section-title">STAGE & TECH</div>
            <div className="card" style={{ marginBottom: 16 }}>
              {[['Stage', v.stage], ['Lighting', v.lighting], ['Visuals', v.visual], ['Backline', v.backline], ['Green Room', v.green], ['Parking', v.parking]].filter(([, val]) => val).map(([label, val]) => (
                <div key={label} className="info-row"><span className="info-label">{label}</span><span style={{ fontSize: 13 }}>{val}</span></div>
              ))}
            </div>
          </>
        )}

        {(v.nights || v.genres || v.instagram || v.contact) && (
          <>
            <div className="section-title">NIGHTS & CONTACT</div>
            <div className="card">
              {[['Live nights', v.nights], ['Genres', v.genres], ['Instagram', v.instagram], ['Booking contact', v.contact]].filter(([, val]) => val).map(([label, val]) => (
                <div key={label} className="info-row"><span className="info-label">{label}</span><span style={{ fontSize: 13 }}>{val}</span></div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
