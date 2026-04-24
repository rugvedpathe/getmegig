'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BRAND_TYPES = ['Beverage', 'Clothing/Streetwear', 'Tattoo/Art', 'Food', 'Tech/Gadgets', 'Lifestyle', 'Music/Vinyl', 'Other'];
const SPONSORSHIP_OPTIONS = [
  'Set up a stall / pop-up booth',
  'Sponsor the event (branding)',
  'Provide free samples / merch',
  'Co-host / present the event',
  'Provide prizes / giveaways',
  'Logo placement only',
];

export default function SponsorProfileSetup() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    brandName: '',
    brandType: '',
    city: '',
    description: '',
    websiteUrl: '',
    instagramHandle: '',
    contactPerson: '',
    contactEmail: '',
    budget: '',
  });
  const [sponsorshipTypes, setSponsorshipTypes] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isLoaded && user?.publicMetadata?.profileComplete) {
    router.push('/dashboard');
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleSponsorshipType(type) {
    setSponsorshipTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo must be under 5MB');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function uploadLogo() {
    if (!logoFile) return '';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (cloudName && uploadPreset && cloudName !== 'your_cloud_name_here') {
      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'getmegig/sponsors');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      return data.secure_url || '';
    }
    return logoPreview || '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.brandName || !form.brandType || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const logoUrl = await uploadLogo();

      const res = await fetch('/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          logoUrl,
          sponsorshipTypes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      await user.reload();
      router.push('/dashboard/sponsor');
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
          <Link href="/onboarding" className="back-to-roles">← Back to role selection</Link>
          <span className="profile-setup-step">Step 2 of 2</span>
          <h1 className="profile-setup-title">Set up your brand</h1>
          <p className="profile-setup-subtitle">
            Tell venues and artists about your brand so they can see if it&apos;s a good fit. 🏷️
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-setup-form">
          {/* Logo Upload */}
          <div className="photo-upload-section">
            <div className="photo-upload-circle" onClick={() => fileInputRef.current?.click()}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="photo-upload-preview" />
              ) : (
                <div className="photo-upload-placeholder">
                  <span className="photo-upload-icon">🏷️</span>
                  <span className="photo-upload-text">Add Logo</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
            <span className="photo-upload-hint">Click to upload brand logo</span>
          </div>

          {/* Brand Name */}
          <div className="form-group">
            <label className="form-label">Brand Name *</label>
            <input type="text" name="brandName" value={form.brandName} onChange={handleChange} placeholder="e.g. The Souled Store" className="form-input" required />
          </div>

          {/* Type + City */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand Type *</label>
              <select name="brandType" value={form.brandType} onChange={handleChange} className="form-input" required>
                <option value="">Select type</option>
                {BRAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bangalore" className="form-input" required />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">About Your Brand</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="What does your brand do? Why would gig-goers care?" className="form-input form-textarea" rows={3} />
          </div>

          {/* Contact */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="e.g. Priya Sharma" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="e.g. priya@brand.com" className="form-input" />
            </div>
          </div>

          {/* Links */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Website</label>
              <input type="url" name="websiteUrl" value={form.websiteUrl} onChange={handleChange} placeholder="https://yourbrand.com" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram Handle</label>
              <input type="text" name="instagramHandle" value={form.instagramHandle} onChange={handleChange} placeholder="@yourbrand" className="form-input" />
            </div>
          </div>

          {/* Budget */}
          <div className="form-group">
            <label className="form-label">Sponsorship Budget (per event)</label>
            <input type="text" name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. ₹5,000 – ₹50,000" className="form-input" />
          </div>

          {/* Sponsorship Types */}
          <div className="form-group">
            <label className="form-label">What would you like to do at gigs?</label>
            <div className="checkbox-grid">
              {SPONSORSHIP_OPTIONS.map(opt => (
                <label key={opt} className={`checkbox-card ${sponsorshipTypes.includes(opt) ? 'checkbox-card-active' : ''}`}>
                  <input type="checkbox" checked={sponsorshipTypes.includes(opt)} onChange={() => toggleSponsorshipType(opt)} style={{ display: 'none' }} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="profile-setup-error">{error}</div>}

          <button type="submit" className="profile-setup-submit sponsor-submit" disabled={loading}>
            {loading && <span className="onboarding-spinner" />}
            {loading ? 'Saving...' : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  );
}
