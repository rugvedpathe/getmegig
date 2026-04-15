'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const GENRES = ['Rock', 'Jazz', 'Classical', 'Bollywood', 'Folk', 'EDM', 'Other'];

export default function ArtistProfileSetup() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    genre: '',
    city: '',
    priceRange: '',
    bio: '',
    socialLink: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if user doesn't have artist role
  if (isLoaded && user?.publicMetadata?.role !== 'artist') {
    router.push('/onboarding');
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function uploadPhoto() {
    if (!photoFile) return '';

    // If Cloudinary is configured, use it
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset && cloudName !== 'your_cloud_name_here') {
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'getmegig/artists');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      return data.secure_url || '';
    }

    // Fallback: convert to base64 (for development without Cloudinary)
    return photoPreview || '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName || !form.genre || !form.city) {
      setError('Please fill in all required fields.');
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
          ...form,
          photoUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Mark onboarding as complete in metadata
      await user.reload();
      router.push('/dashboard/artist');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-spinner" />
      </div>
    );
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <div className="profile-setup-header">
          <span className="profile-setup-step">Step 2 of 2</span>
          <h1 className="profile-setup-title">Set up your artist profile</h1>
          <p className="profile-setup-subtitle">
            This is how venues will discover you. Make it count! 🎸
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          {/* Photo Upload */}
          <div className="photo-upload-section">
            <div
              className="photo-upload-circle"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="photo-upload-preview" />
              ) : (
                <div className="photo-upload-placeholder">
                  <span className="photo-upload-icon">📷</span>
                  <span className="photo-upload-text">Add Photo</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <span className="photo-upload-hint">Click to upload profile photo</span>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name / Stage Name *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. The Midnight Collective"
              className="form-input"
              required
            />
          </div>

          {/* Genre + City row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Genre *</label>
              <select
                name="genre"
                value={form.genre}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select genre</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="form-group">
            <label className="form-label">Price per Gig (₹ range)</label>
            <input
              type="text"
              name="priceRange"
              value={form.priceRange}
              onChange={handleChange}
              placeholder="e.g. ₹3,000 – ₹8,000"
              className="form-input"
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Short Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell venues about your sound, your vibe, and what makes you special..."
              className="form-input form-textarea"
              rows={4}
            />
          </div>

          {/* Social Link */}
          <div className="form-group">
            <label className="form-label">YouTube or Instagram Link</label>
            <input
              type="url"
              name="socialLink"
              value={form.socialLink}
              onChange={handleChange}
              placeholder="https://youtube.com/... or https://instagram.com/..."
              className="form-input"
            />
          </div>

          {error && <div className="profile-setup-error">{error}</div>}

          <button
            type="submit"
            className="profile-setup-submit"
            disabled={loading}
          >
            {loading && <span className="onboarding-spinner" />}
            {loading ? 'Saving...' : 'Complete Profile →'}
          </button>
        </form>
      </div>
    </div>
  );
}
