'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PublicArtistProfile() {
  const params = useParams();
  const [artist, setArtist] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/artists/${params.artistId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setArtist(data.artist);
        setReviews(data.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.artistId]);

  if (loading) {
    return (
      <div className="public-profile-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="onboarding-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="public-profile-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>Artist not found</h2>
        <Link href="/" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>← Back to Home</Link>
      </div>
    );
  }

  const stars = n => '⭐'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  return (
    <div className="public-profile-page">
      {/* Hero */}
      <div className="public-profile-hero">
        {artist.photoUrl ? (
          <img src={artist.photoUrl} alt={artist.fullName} className="public-profile-photo" />
        ) : (
          <div className="public-profile-photo-placeholder">🎸</div>
        )}
        <div className="public-profile-info">
          <div className="public-profile-name">
            {artist.fullName}
            {artist.stageName && <span style={{ fontSize: 16, color: '#888', marginLeft: 8 }}>({artist.stageName})</span>}
          </div>
          <div className="public-profile-meta">
            {artist.genre && <span className="tag tag-teal">{artist.genre}</span>}
            {artist.actType && <span className="tag tag-gray">{artist.actType}{artist.actType === 'Band' && artist.bandSize ? ` (${artist.bandSize}-piece)` : ''}</span>}
            {artist.city && <span style={{ fontSize: 13, color: '#888' }}>📍 {artist.city}</span>}
          </div>
          <div className="public-profile-rating">
            {stars(artist.rating)}{' '}
            <span style={{ color: '#888' }}>
              {artist.rating ? `${artist.rating}/5` : 'New'}
              {artist.totalRatings ? ` (${artist.totalRatings} reviews)` : ''}
              {artist.gigsCompleted > 0 && ` · 🎵 ${artist.gigsCompleted} gigs`}
            </span>
          </div>
          {artist.priceRange && <div style={{ fontSize: 14, marginBottom: 6 }}>💰 {artist.priceRange}</div>}
          {artist.bio && <div className="public-profile-bio">{artist.bio}</div>}
        </div>
      </div>

      {/* Act Details */}
      {(artist.instruments?.length > 0 || artist.performanceStyles?.length > 0 || artist.languages?.length > 0 || artist.setDuration) && (
        <div className="profile-section">
          <div className="profile-section-title">🎵 Act Details</div>
          {artist.instruments?.length > 0 && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Instruments</span>
              <div className="profile-section-grid">
                {artist.instruments.map(i => <span key={i} className="tag tag-teal">{i}</span>)}
              </div>
            </div>
          )}
          {artist.performanceStyles?.length > 0 && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Styles</span>
              <div className="profile-section-grid">
                {artist.performanceStyles.map(s => <span key={s} className="tag tag-gray">{s}</span>)}
              </div>
            </div>
          )}
          {artist.languages?.length > 0 && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Languages</span>
              <span className="profile-detail-val">{artist.languages.join(', ')}</span>
            </div>
          )}
          {artist.setDuration && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Set Duration</span>
              <span className="profile-detail-val">{artist.setDuration}</span>
            </div>
          )}
        </div>
      )}

      {/* Tech Rider */}
      {(artist.techRider || artist.bringsOwnSound || artist.needsBackline) && (
        <div className="profile-section">
          <div className="profile-section-title">⚙️ Technical Requirements</div>
          <div className="amenity-grid" style={{ marginBottom: 12 }}>
            <span className={`amenity-badge ${artist.bringsOwnSound ? 'amenity-badge-yes' : ''}`}>
              {artist.bringsOwnSound ? '✅' : '❌'} Brings own sound
            </span>
            <span className={`amenity-badge ${artist.needsBackline ? 'amenity-badge-no' : 'amenity-badge-yes'}`}>
              {artist.needsBackline ? '⚠️ Needs backline' : '✅ No backline needed'}
            </span>
          </div>
          {artist.techRider && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Tech Rider</span>
              <span className="profile-detail-val">{artist.techRider}</span>
            </div>
          )}
          {artist.powerRequirements && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Power Needs</span>
              <span className="profile-detail-val">{artist.powerRequirements}</span>
            </div>
          )}
          {artist.specialRequirements && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Special Needs</span>
              <span className="profile-detail-val">{artist.specialRequirements}</span>
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {(artist.yearsActive > 0 || artist.notableVenues?.length > 0 || artist.achievements) && (
        <div className="profile-section">
          <div className="profile-section-title">🏆 Experience</div>
          {artist.yearsActive > 0 && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Years Active</span>
              <span className="profile-detail-val">{artist.yearsActive} year{artist.yearsActive !== 1 ? 's' : ''}</span>
            </div>
          )}
          {artist.notableVenues?.length > 0 && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Notable Venues</span>
              <span className="profile-detail-val">{artist.notableVenues.join(', ')}</span>
            </div>
          )}
          {artist.achievements && (
            <div className="profile-detail-row">
              <span className="profile-detail-key">Achievements</span>
              <span className="profile-detail-val">{artist.achievements}</span>
            </div>
          )}
        </div>
      )}

      {/* Media & Social */}
      <div className="profile-section">
        <div className="profile-section-title">📱 Media & Social</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {artist.instagramHandle && (
            <a href={`https://instagram.com/${artist.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              📸 Instagram {artist.instagramHandle}
            </a>
          )}
          {artist.youtubeLink && (
            <a href={artist.youtubeLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">🎬 YouTube</a>
          )}
          {artist.spotifyLink && (
            <a href={artist.spotifyLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">🎵 Spotify</a>
          )}
          {artist.socialLink && !artist.instagramHandle && !artist.youtubeLink && (
            <a href={artist.socialLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">🔗 Profile</a>
          )}
        </div>

        {/* Instagram Embed */}
        {artist.instagramHandle && (
          <div className="ig-embed-container">
            <iframe
              src={`https://www.instagram.com/${artist.instagramHandle.replace('@', '')}/embed`}
              title="Instagram Feed"
              loading="lazy"
            />
          </div>
        )}

        {/* Gallery */}
        {artist.galleryPhotos?.length > 0 && (
          <>
            <div className="profile-section-title" style={{ marginTop: 16 }}>📷 Gallery</div>
            <div className="profile-gallery">
              {artist.galleryPhotos.map((url, i) => (
                <img key={i} src={url} alt={`Performance ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="profile-section">
          <div className="profile-section-title">⭐ Reviews ({reviews.length})</div>
          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-card-header">
                <span className="review-card-venue">🏠 {r.venueName}</span>
                <span className="review-card-stars">{stars(r.rating)}</span>
              </div>
              {r.review && <div className="review-card-text">{r.review}</div>}
              <div className="review-card-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
