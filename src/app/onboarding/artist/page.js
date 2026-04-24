'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GENRES = ['Rock', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'EDM', 'Metal', 'House', 'DJ', 'Stand-up Comedy', 'Improv', 'Hip-Hop', 'Acoustic', 'Sufi', 'Indie', 'Other'];
const ACT_TYPES = ['Solo', 'Duo', 'Band', 'DJ', 'Comedy', 'Spoken Word', 'Other'];
const INSTRUMENT_OPTIONS = ['Guitar', 'Bass', 'Drums', 'Keys/Piano', 'Vocals', 'Violin', 'Tabla', 'Flute', 'Sitar', 'Turntables', 'Saxophone', 'Trumpet', 'Other'];
const STYLE_OPTIONS = ['Originals', 'Covers', 'Improv/Jam', 'Scripted Set', 'DJ Set', 'Open Mic'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Punjabi', 'Other'];

export default function ArtistProfileSetup() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '', stageName: '', genre: '', customGenre: '', city: '',
    priceRange: '', bio: '',
    // Media
    instagramHandle: '', youtubeLink: '', spotifyLink: '', socialLink: '', highlightVideo: '',
    // Act Details
    actType: 'Solo', bandSize: '', setDuration: '',
    // Tech Rider
    techRider: '', powerRequirements: '', specialRequirements: '',
    // Experience
    yearsActive: '', achievements: '',
  });
  const [instruments, setInstruments] = useState([]);
  const [performanceStyles, setPerformanceStyles] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [notableVenues, setNotableVenues] = useState('');
  const [bringsOwnSound, setBringsOwnSound] = useState(false);
  const [needsBackline, setNeedsBackline] = useState(false);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If profile is already complete, redirect to dashboard
  if (isLoaded && user?.publicMetadata?.profileComplete) {
    router.push('/dashboard');
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleItem(list, setList, item) {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5MB'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function uploadPhoto() {
    if (!photoFile) return '';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (cloudName && uploadPreset && cloudName !== 'your_cloud_name_here') {
      const fd = new FormData();
      fd.append('file', photoFile);
      fd.append('upload_preset', uploadPreset);
      fd.append('folder', 'getmegig/artists');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      return data.secure_url || '';
    }
    return photoPreview || '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const finalGenre = form.genre === 'Other' ? form.customGenre.trim() : form.genre;
    if (!form.fullName || !finalGenre || !form.city) {
      setError('Please fill in Full Name, Genre, and City.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const photoUrl = await uploadPhoto();

      const res = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          stageName: form.stageName,
          genre: finalGenre,
          city: form.city,
          priceRange: form.priceRange,
          bio: form.bio,
          photoUrl,
          // Media
          instagramHandle: form.instagramHandle,
          youtubeLink: form.youtubeLink,
          spotifyLink: form.spotifyLink,
          socialLink: form.socialLink,
          highlightVideo: form.highlightVideo,
          // Act Details
          actType: form.actType,
          bandSize: form.bandSize,
          instruments,
          performanceStyles,
          languages,
          setDuration: form.setDuration,
          // Tech Rider
          techRider: form.techRider,
          bringsOwnSound,
          needsBackline,
          powerRequirements: form.powerRequirements,
          specialRequirements: form.specialRequirements,
          // Experience
          yearsActive: form.yearsActive,
          notableVenues: notableVenues ? notableVenues.split(',').map(v => v.trim()).filter(Boolean) : [],
          achievements: form.achievements,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return; }

      await user.reload();
      router.push('/dashboard/artist');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (<div className="onboarding-page"><div className="onboarding-spinner" /></div>);
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container" style={{ maxWidth: 640 }}>
        <div className="profile-setup-header">
          <Link href="/onboarding" className="back-to-roles">← Back to role selection</Link>
          <span className="profile-setup-step">Step 2 of 2</span>
          <h1 className="profile-setup-title">Set up your artist profile</h1>
          <p className="profile-setup-subtitle">
            This is how venues will discover you. Fill in what you can — you can always come back and edit! 🎸
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          {/* ── Photo ── */}
          <div className="photo-upload-section">
            <div className="photo-upload-circle" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-upload-preview" />
              ) : (
                <div className="photo-upload-placeholder">
                  <span className="photo-upload-icon">📷</span>
                  <span className="photo-upload-text">Add Photo</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            <span className="photo-upload-hint">Click to upload profile photo</span>
          </div>

          {/* ── SECTION: Basics ── */}
          <div className="form-section-label">🎤 Basic Info</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name / Stage Name *</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. The Midnight Collective" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Alternate Name</label>
              <input type="text" name="stageName" value={form.stageName} onChange={handleChange} placeholder="e.g. legal name or band name" className="form-input" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Genre *</label>
              <select name="genre" value={form.genre} onChange={handleChange} className="form-input" required>
                <option value="">Select genre</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {form.genre === 'Other' && (
                <input type="text" name="customGenre" value={form.customGenre} onChange={handleChange} placeholder="Type your genre" className="form-input" style={{ marginTop: 8 }} required />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bangalore" className="form-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Act Type</label>
              <select name="actType" value={form.actType} onChange={handleChange} className="form-input">
                {ACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {form.actType === 'Band' && (
              <div className="form-group">
                <label className="form-label">Band Size</label>
                <input type="number" name="bandSize" value={form.bandSize} onChange={handleChange} placeholder="e.g. 4" className="form-input" min="2" max="20" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Price per Gig (₹)</label>
              <input type="text" name="priceRange" value={form.priceRange} onChange={handleChange} placeholder="e.g. ₹3,000 – ₹8,000" className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell venues about your sound, vibe, and what makes you special..." className="form-input form-textarea" rows={3} />
          </div>

          {/* ── SECTION: Media ── */}
          <div className="form-section-label">📱 Social & Media</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Instagram Handle</label>
              <input type="text" name="instagramHandle" value={form.instagramHandle} onChange={handleChange} placeholder="@yourhandle" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">YouTube Link</label>
              <input type="url" name="youtubeLink" value={form.youtubeLink} onChange={handleChange} placeholder="https://youtube.com/..." className="form-input" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Spotify Link</label>
              <input type="url" name="spotifyLink" value={form.spotifyLink} onChange={handleChange} placeholder="https://open.spotify.com/..." className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Highlight Video (YouTube/IG Reel)</label>
              <input type="url" name="highlightVideo" value={form.highlightVideo} onChange={handleChange} placeholder="Best live performance clip URL" className="form-input" />
            </div>
          </div>

          {/* ── SECTION: Act Details ── */}
          <div className="form-section-label">🎵 Act Details</div>

          <div className="form-group">
            <label className="form-label">Instruments</label>
            <div className="checkbox-grid">
              {INSTRUMENT_OPTIONS.map(inst => (
                <label key={inst} className={`checkbox-card ${instruments.includes(inst) ? 'checkbox-card-active' : ''}`}>
                  <input type="checkbox" checked={instruments.includes(inst)} onChange={() => toggleItem(instruments, setInstruments, inst)} style={{ display: 'none' }} />
                  {inst}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Performance Styles</label>
            <div className="checkbox-grid">
              {STYLE_OPTIONS.map(s => (
                <label key={s} className={`checkbox-card ${performanceStyles.includes(s) ? 'checkbox-card-active' : ''}`}>
                  <input type="checkbox" checked={performanceStyles.includes(s)} onChange={() => toggleItem(performanceStyles, setPerformanceStyles, s)} style={{ display: 'none' }} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Languages</label>
              <div className="checkbox-grid">
                {LANGUAGE_OPTIONS.map(l => (
                  <label key={l} className={`checkbox-card ${languages.includes(l) ? 'checkbox-card-active' : ''}`} style={{ padding: '6px 10px', fontSize: 12 }}>
                    <input type="checkbox" checked={languages.includes(l)} onChange={() => toggleItem(languages, setLanguages, l)} style={{ display: 'none' }} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Typical Set Duration</label>
            <input type="text" name="setDuration" value={form.setDuration} onChange={handleChange} placeholder="e.g. 45 min – 2 hours" className="form-input" />
          </div>

          {/* ── SECTION: Tech Rider ── */}
          <div className="form-section-label">⚙️ Technical Requirements</div>

          <div className="form-group">
            <label className="form-label">Tech Rider</label>
            <textarea name="techRider" value={form.techRider} onChange={handleChange} placeholder="e.g. Need 2 vocal mics, 1 DI box, 1 monitor wedge, drum kit..." className="form-input form-textarea" rows={3} />
          </div>

          <div className="form-row">
            <label className={`checkbox-card ${bringsOwnSound ? 'checkbox-card-active' : ''}`} style={{ flex: 1 }}>
              <input type="checkbox" checked={bringsOwnSound} onChange={() => setBringsOwnSound(!bringsOwnSound)} style={{ display: 'none' }} />
              🔊 I bring my own PA / sound setup
            </label>
            <label className={`checkbox-card ${needsBackline ? 'checkbox-card-active' : ''}`} style={{ flex: 1 }}>
              <input type="checkbox" checked={needsBackline} onChange={() => setNeedsBackline(!needsBackline)} style={{ display: 'none' }} />
              🎸 I need backline (amps/drums) from venue
            </label>
          </div>

          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="form-label">Special Requirements</label>
            <input type="text" name="specialRequirements" value={form.specialRequirements} onChange={handleChange} placeholder="Green room, parking, plus-ones, etc." className="form-input" />
          </div>

          {/* ── SECTION: Experience ── */}
          <div className="form-section-label">🏆 Experience</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Years Active</label>
              <input type="number" name="yearsActive" value={form.yearsActive} onChange={handleChange} placeholder="e.g. 3" className="form-input" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Notable Venues (comma separated)</label>
              <input type="text" value={notableVenues} onChange={e => setNotableVenues(e.target.value)} placeholder="e.g. The Humming Tree, Hard Rock Cafe" className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Achievements / Press</label>
            <textarea name="achievements" value={form.achievements} onChange={handleChange} placeholder="Awards, press mentions, viral moments..." className="form-input form-textarea" rows={2} />
          </div>

          {error && <div className="profile-setup-error">{error}</div>}

          <button type="submit" className="profile-setup-submit" disabled={loading}>
            {loading && <span className="onboarding-spinner" />}
            {loading ? 'Saving...' : 'Complete Profile →'}
          </button>
        </form>
      </div>
    </div>
  );
}
