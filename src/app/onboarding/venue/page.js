'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const VENUE_TYPES = ['Bar', 'Cafe', 'Restaurant', 'Event Space', 'Club', 'Pub', 'Rooftop', 'Amphitheatre', 'Other'];
const STAGE_TYPES = ['Indoor Stage', 'Outdoor Stage', 'Corner/No Stage', 'Rooftop', 'Amphitheatre'];
const SOUND_OPTIONS = ['Professional PA', 'Basic Setup', 'Bring Your Own', 'No System'];
const LIGHTING_OPTIONS = ['Professional Lights', 'Basic Lights', 'None'];
const PAYMENT_OPTIONS = ['Same Day', 'Within 7 Days', 'Within 30 Days', 'Before Gig'];
const AGE_OPTIONS = ['All Ages', '18+', '21+'];
const GENRE_PREFS = ['Rock', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'EDM', 'Metal', 'House', 'DJ', 'Stand-up Comedy', 'Improv', 'Hip-Hop', 'Acoustic', 'Sufi', 'Indie'];

export default function VenueProfileSetup() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const photoInputRef = useRef(null);

  const [form, setForm] = useState({
    venueName: '', city: '', venueType: '', capacity: '', contactPerson: '',
    // Media
    venueDescription: '', address: '', googleMapsLink: '',
    instagramHandle: '', websiteUrl: '', operatingHours: '',
    // Stage & Sound
    stageType: '', stageDimensions: '', soundSystem: '', soundSystemDetails: '',
    backlineDetails: '', lightingSetup: '', lightingDetails: '',
    microphoneCount: '', monitorCount: '',
    // Logistics
    loadInAccess: '', soundCheckPolicy: '', paymentTerms: 'Same Day',
    cancellationPolicy: '', ageRestriction: 'All Ages', dresscode: '',
    // Preferences
    averageBudget: '',
  });
  const [hasBackline, setHasBackline] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [greenRoomAvailable, setGreenRoomAvailable] = useState(false);
  const [foodDrinkForArtists, setFoodDrinkForArtists] = useState(false);
  const [preferredGenres, setPreferredGenres] = useState([]);
  const [pastArtists, setPastArtists] = useState('');
  const [venuePhotoPreviews, setVenuePhotoPreviews] = useState([]);
  const [venuePhotoFiles, setVenuePhotoFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isLoaded && user?.publicMetadata?.profileComplete) {
    router.push('/dashboard');
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleGenre(g) {
    setPreferredGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  function handlePhotoAdd(e) {
    const files = Array.from(e.target.files || []);
    const remaining = 8 - venuePhotoFiles.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach(file => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setVenuePhotoPreviews(prev => [...prev, ev.target.result]);
        setVenuePhotoFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadPhotos() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const urls = [];
    for (const file of venuePhotoFiles) {
      if (cloudName && uploadPreset && cloudName !== 'your_cloud_name_here') {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', uploadPreset);
        fd.append('folder', 'getmegig/venues');
        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
          const data = await res.json();
          if (data.secure_url) urls.push(data.secure_url);
        } catch {}
      }
    }
    // Fallback to base64 if no Cloudinary
    if (urls.length === 0 && venuePhotoPreviews.length > 0) {
      return venuePhotoPreviews;
    }
    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.venueName || !form.city || !form.venueType) {
      setError('Please fill in Venue Name, City, and Type.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const venuePhotos = await uploadPhotos();

      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          venuePhotos,
          hasBackline,
          parkingAvailable,
          greenRoomAvailable,
          foodDrinkForArtists,
          preferredGenres,
          pastArtists: pastArtists ? pastArtists.split(',').map(a => a.trim()).filter(Boolean) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return; }

      await user.reload();
      router.push('/dashboard/venue');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (<div className="onboarding-page"><div className="onboarding-spinner" /></div>);
  }

  async function goBackToRoles() {
    try {
      await fetch('/api/clear-role', { method: 'POST' });
      await user.reload();
      router.push('/onboarding');
    } catch { router.push('/onboarding'); }
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container" style={{ maxWidth: 640 }}>
        <div className="profile-setup-header">
          <button type="button" onClick={goBackToRoles} className="back-to-roles">← Back to role selection</button>
          <span className="profile-setup-step">Step 2 of 2</span>
          <h1 className="profile-setup-title">Set up your venue</h1>
          <p className="profile-setup-subtitle">
            Help artists know exactly what to expect at your space. 🏠
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          {/* ── SECTION: Basics ── */}
          <div className="form-section-label">🏠 Basic Info</div>

          <div className="form-group">
            <label className="form-label">Venue Name *</label>
            <input type="text" name="venueName" value={form.venueName} onChange={handleChange} placeholder="e.g. The Humming Tree" className="form-input" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bangalore" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Venue Type *</label>
              <select name="venueType" value={form.venueType} onChange={handleChange} className="form-input" required>
                <option value="">Select type</option>
                {VENUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 200" className="form-input" min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="e.g. Rahul Sharma" className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue Description</label>
            <textarea name="venueDescription" value={form.venueDescription} onChange={handleChange} placeholder="What's the vibe? Intimate jazz bar, rooftop party spot, indie café..." className="form-input form-textarea" rows={3} />
          </div>

          {/* ── SECTION: Media ── */}
          <div className="form-section-label">📷 Photos & Social</div>

          <div className="form-group">
            <label className="form-label">Venue Photos (up to 8)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {venuePhotoPreviews.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt={`Venue ${i+1}`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  <button type="button" onClick={() => {
                    setVenuePhotoPreviews(prev => prev.filter((_, j) => j !== i));
                    setVenuePhotoFiles(prev => prev.filter((_, j) => j !== i));
                  }} style={{ position: 'absolute', top: -6, right: -6, background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {venuePhotoFiles.length < 8 && (
                <div onClick={() => photoInputRef.current?.click()} style={{ width: 80, height: 60, borderRadius: 8, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: '#ccc' }}>+</div>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoAdd} style={{ display: 'none' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Instagram Handle</label>
              <input type="text" name="instagramHandle" value={form.instagramHandle} onChange={handleChange} placeholder="@yourvenue" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input type="url" name="websiteUrl" value={form.websiteUrl} onChange={handleChange} placeholder="https://yourvenue.com" className="form-input" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Full address (shown only to confirmed artists)" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Operating Hours</label>
              <input type="text" name="operatingHours" value={form.operatingHours} onChange={handleChange} placeholder="e.g. Tue–Sun, 6 PM – 1 AM" className="form-input" />
            </div>
          </div>

          {/* ── SECTION: Stage & Sound ── */}
          <div className="form-section-label">🎛️ Stage & Sound</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stage Type</label>
              <select name="stageType" value={form.stageType} onChange={handleChange} className="form-input">
                <option value="">Select stage type</option>
                {STAGE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stage Dimensions</label>
              <input type="text" name="stageDimensions" value={form.stageDimensions} onChange={handleChange} placeholder="e.g. 12ft × 8ft" className="form-input" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sound System</label>
              <select name="soundSystem" value={form.soundSystem} onChange={handleChange} className="form-input">
                <option value="">Select</option>
                {SOUND_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Lighting</label>
              <select name="lightingSetup" value={form.lightingSetup} onChange={handleChange} className="form-input">
                <option value="">Select</option>
                {LIGHTING_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sound System Details</label>
            <input type="text" name="soundSystemDetails" value={form.soundSystemDetails} onChange={handleChange} placeholder="e.g. JBL PRX 815, Yamaha TF1 mixer, 4 monitor wedges" className="form-input" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mics Available</label>
              <input type="number" name="microphoneCount" value={form.microphoneCount} onChange={handleChange} placeholder="e.g. 4" className="form-input" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Monitors Available</label>
              <input type="number" name="monitorCount" value={form.monitorCount} onChange={handleChange} placeholder="e.g. 2" className="form-input" min="0" />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 4 }}>
            <label className={`checkbox-card ${hasBackline ? 'checkbox-card-active' : ''}`} style={{ flex: 1 }}>
              <input type="checkbox" checked={hasBackline} onChange={() => setHasBackline(!hasBackline)} style={{ display: 'none' }} />
              🎸 Backline available (amps, drums)
            </label>
          </div>
          {hasBackline && (
            <div className="form-group" style={{ marginTop: 8 }}>
              <input type="text" name="backlineDetails" value={form.backlineDetails} onChange={handleChange} placeholder="e.g. Marshall JCM800, Fender Twin, DW drum kit" className="form-input" />
            </div>
          )}

          {/* ── SECTION: Logistics ── */}
          <div className="form-section-label">📋 Logistics & Policies</div>

          <div className="form-row">
            <label className={`checkbox-card ${parkingAvailable ? 'checkbox-card-active' : ''}`} style={{ flex: 1 }}>
              <input type="checkbox" checked={parkingAvailable} onChange={() => setParkingAvailable(!parkingAvailable)} style={{ display: 'none' }} />
              🅿️ Parking available
            </label>
            <label className={`checkbox-card ${greenRoomAvailable ? 'checkbox-card-active' : ''}`} style={{ flex: 1 }}>
              <input type="checkbox" checked={greenRoomAvailable} onChange={() => setGreenRoomAvailable(!greenRoomAvailable)} style={{ display: 'none' }} />
              🚪 Green room available
            </label>
            <label className={`checkbox-card ${foodDrinkForArtists ? 'checkbox-card-active' : ''}`} style={{ flex: 1 }}>
              <input type="checkbox" checked={foodDrinkForArtists} onChange={() => setFoodDrinkForArtists(!foodDrinkForArtists)} style={{ display: 'none' }} />
              🍽️ F&B for artists
            </label>
          </div>

          <div className="form-row" style={{ marginTop: 8 }}>
            <div className="form-group">
              <label className="form-label">Soundcheck Policy</label>
              <input type="text" name="soundCheckPolicy" value={form.soundCheckPolicy} onChange={handleChange} placeholder="e.g. 2 hours before doors" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select name="paymentTerms" value={form.paymentTerms} onChange={handleChange} className="form-input">
                {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age Restriction</label>
              <select name="ageRestriction" value={form.ageRestriction} onChange={handleChange} className="form-input">
                {AGE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Load-in Access</label>
              <input type="text" name="loadInAccess" value={form.loadInAccess} onChange={handleChange} placeholder="e.g. Rear entrance, loading dock" className="form-input" />
            </div>
          </div>

          {/* ── SECTION: Preferences ── */}
          <div className="form-section-label">🎵 What Works Here</div>

          <div className="form-group">
            <label className="form-label">Preferred Genres</label>
            <div className="checkbox-grid">
              {GENRE_PREFS.map(g => (
                <label key={g} className={`checkbox-card ${preferredGenres.includes(g) ? 'checkbox-card-active' : ''}`} style={{ padding: '6px 10px', fontSize: 12 }}>
                  <input type="checkbox" checked={preferredGenres.includes(g)} onChange={() => toggleGenre(g)} style={{ display: 'none' }} />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Past Artists (comma separated)</label>
              <input type="text" value={pastArtists} onChange={e => setPastArtists(e.target.value)} placeholder="e.g. Prateek Kuhad, Nucleya" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Typical Artist Budget</label>
              <input type="text" name="averageBudget" value={form.averageBudget} onChange={handleChange} placeholder="e.g. ₹5,000 – ₹25,000" className="form-input" />
            </div>
          </div>

          {error && <div className="profile-setup-error">{error}</div>}

          <button type="submit" className="profile-setup-submit venue-submit" disabled={loading}>
            {loading && <span className="onboarding-spinner" />}
            {loading ? 'Saving...' : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  );
}
