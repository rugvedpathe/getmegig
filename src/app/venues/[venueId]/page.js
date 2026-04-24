'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PublicVenueProfile() {
  const params = useParams();
  const [venue, setVenue] = useState(null);
  const [activeGigs, setActiveGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/venues/${params.venueId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setVenue(data.venue);
        setActiveGigs(data.activeGigs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.venueId]);

  if (loading) {
    return (
      <div className="public-profile-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="public-profile-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>Venue not found</h2>
        <Link href="/" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="public-profile-page">
      {/* Hero */}
      <div className="public-profile-hero">
        {venue.venuePhotos?.[0] ? (
          <img src={venue.venuePhotos[0]} alt={venue.venueName} className="public-profile-photo" />
        ) : (
          <div className="public-profile-photo-placeholder">🏠</div>
        )}
        <div className="public-profile-info">
          <div className="public-profile-name">{venue.venueName}</div>
          <div className="public-profile-meta">
            <span className="tag tag-blue">{venue.venueType}</span>
            {venue.capacity && <span className="tag tag-gray">👥 {venue.capacity} capacity</span>}
            {venue.city && <span style={{ fontSize: 13, color: '#888' }}>📍 {venue.city}</span>}
          </div>
          {venue.operatingHours && <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>🕐 {venue.operatingHours}</div>}
          {venue.ageRestriction && venue.ageRestriction !== 'All Ages' && (
            <div style={{ fontSize: 13, marginBottom: 6 }}><span className="tag tag-amber">{venue.ageRestriction}</span></div>
          )}
          {venue.venueDescription && <div className="public-profile-bio">{venue.venueDescription}</div>}
        </div>
      </div>

      {/* Venue Photos Gallery */}
      {venue.venuePhotos?.length > 1 && (
        <div className="profile-section">
          <div className="profile-section-title">📷 Venue Photos</div>
          <div className="profile-gallery">
            {venue.venuePhotos.map((url, i) => (
              <img key={i} src={url} alt={`Venue ${i + 1}`} />
            ))}
          </div>
        </div>
      )}

      {/* Stage & Sound */}
      {(venue.stageType || venue.soundSystem || venue.hasBackline || venue.lightingSetup) && (
        <div className="profile-section">
          <div className="profile-section-title">🎛️ Stage & Sound System</div>
          {venue.stageType && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Stage</span>
              <span className="profile-detail-val">{venue.stageType}{venue.stageDimensions ? ` — ${venue.stageDimensions}` : ''}</span>
            </div>
          )}
          {venue.soundSystem && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Sound System</span>
              <span className="profile-detail-val">{venue.soundSystem}</span>
            </div>
          )}
          {venue.soundSystemDetails && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">PA Details</span>
              <span className="profile-detail-val">{venue.soundSystemDetails}</span>
            </div>
          )}
          <div className="amenity-grid" style={{ marginTop: 10 }}>
            <span className={`amenity-badge ${venue.hasBackline ? 'amenity-badge-yes' : 'amenity-badge-no'}`}>
              {venue.hasBackline ? '✅ Backline available' : '❌ No backline'}
            </span>
            {venue.lightingSetup && (
              <span className="amenity-badge amenity-badge-yes">💡 {venue.lightingSetup}</span>
            )}
            {venue.microphoneCount > 0 && (
              <span className="amenity-badge">🎤 {venue.microphoneCount} mic{venue.microphoneCount !== 1 ? 's' : ''}</span>
            )}
            {venue.monitorCount > 0 && (
              <span className="amenity-badge">🔊 {venue.monitorCount} monitor{venue.monitorCount !== 1 ? 's' : ''}</span>
            )}
          </div>
          {venue.backlineDetails && (
            <div className="profile-detail-row" style={{ marginTop: 10 }}>
              <span className="profile-detail-key">Backline</span>
              <span className="profile-detail-val">{venue.backlineDetails}</span>
            </div>
          )}
        </div>
      )}

      {/* Logistics */}
      <div className="profile-section">
        <div className="profile-section-title">📋 Logistics & Policies</div>
        <div className="amenity-grid" style={{ marginBottom: 12 }}>
          <span className={`amenity-badge ${venue.parkingAvailable ? 'amenity-badge-yes' : 'amenity-badge-no'}`}>
            {venue.parkingAvailable ? '✅ Parking' : '❌ No parking'}
          </span>
          <span className={`amenity-badge ${venue.greenRoomAvailable ? 'amenity-badge-yes' : 'amenity-badge-no'}`}>
            {venue.greenRoomAvailable ? '✅ Green room' : '❌ No green room'}
          </span>
          <span className={`amenity-badge ${venue.foodDrinkForArtists ? 'amenity-badge-yes' : ''}`}>
            {venue.foodDrinkForArtists ? '✅ F&B for artists' : '🍽️ No F&B'}
          </span>
        </div>
        {venue.soundCheckPolicy && (
          <div className="profile-detail-row">
            <span className="profile-detail-key">Soundcheck</span>
            <span className="profile-detail-val">{venue.soundCheckPolicy}</span>
          </div>
        )}
        {venue.paymentTerms && (
          <div className="profile-detail-row">
            <span className="profile-detail-key">Payment</span>
            <span className="profile-detail-val">{venue.paymentTerms}</span>
          </div>
        )}
      </div>

      {/* Preferred Genres & Past Artists */}
      {(venue.preferredGenres?.length > 0 || venue.pastArtists?.length > 0) && (
        <div className="profile-section">
          <div className="profile-section-title">🎵 Music & Culture</div>
          {venue.preferredGenres?.length > 0 && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Preferred Genres</span>
              <div className="profile-section-grid">
                {venue.preferredGenres.map(g => <span key={g} className="tag tag-teal">{g}</span>)}
              </div>
            </div>
          )}
          {venue.pastArtists?.length > 0 && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Past Artists</span>
              <span className="profile-detail-val">{venue.pastArtists.join(', ')}</span>
            </div>
          )}
          {venue.averageBudget && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Typical Budget</span>
              <span className="profile-detail-val">💰 {venue.averageBudget}</span>
            </div>
          )}
        </div>
      )}

      {/* Social */}
      {(venue.instagramHandle || venue.websiteUrl) && (
        <div className="profile-section">
          <div className="profile-section-title">📱 Connect</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {venue.instagramHandle && (
              <a href={`https://instagram.com/${venue.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                📸 {venue.instagramHandle}
              </a>
            )}
            {venue.websiteUrl && (
              <a href={venue.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">🌐 Website</a>
            )}
          </div>
        </div>
      )}

      {/* Active Gigs */}
      {activeGigs.length > 0 && (
        <div className="profile-section">
          <div className="profile-section-title">🎤 Open Gig Slots</div>
          {activeGigs.map(gig => (
            <div key={gig._id} className="gig-list-item" style={{ marginBottom: 8 }}>
              <div className="gig-list-info">
                <div className="gig-list-title">{gig.title}</div>
                <div className="gig-list-meta">
                  🎵 {gig.genre} · 📅 {new Date(gig.date).toLocaleDateString('en-IN')}
                  {gig.budget && ` · 💰 ${gig.budget}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
