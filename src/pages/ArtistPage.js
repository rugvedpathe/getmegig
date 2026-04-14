import { useState, useRef } from 'react';
import { uid, compressImage } from '../utils';
import { C } from '../data/defaults';
import { showToast } from '../components/Toast';
import PortfolioFeed from '../components/PortfolioFeed';
import { StarDisplay } from '../components/StarRating';
import { uploadToCloudinary, isCloudinaryConfigured } from '../cloudinary';

async function callAI(prompt) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
    });
    const d = await res.json();
    return d.content?.[0]?.text || '';
  } catch { return ''; }
}

export default function ArtistPage({ curArtist, setCurArtist, artists, setArtists, gigs, applications, setApplications, appliedGigs, setAppliedGigs, setPage }) {
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name:'',genre:'',city:'Bangalore',members:'1',instruments:'',exp:'',vibe:'',instagram:'',yt:'',phone:'',bio:'' });
  const [bioLoading, setBioLoading] = useState(false);
  const [portTab, setPortTab] = useState('link');
  const [portForm, setPortForm] = useState({ title:'',url:'',desc:'' });
  const [aphotoTab, setAphotoTab] = useState('file');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  // Upload progress state
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [photoUploading, setPhotoUploading] = useState(false);
  const portFileRef = useRef();
  const photoFileRef = useRef();

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function genBio() {
    if (!form.name) { showToast('Enter your artist name first', true); return; }
    setBioLoading(true);
    const bio = await callAI(`Write a short, genuine 2-3 sentence artist bio for ${form.name}, a ${form.genre||'musician'} from ${form.city}. Instruments: ${form.instruments||'various'}. Vibe: ${form.vibe||'authentic'}. Keep it real, no clichés.`);
    sf('bio', bio);
    setBioLoading(false);
  }

  function registerArtist() {
    if (!form.name || !form.genre) { showToast('Name and genre required', true); return; }
    const a = { id: uid(), ...form, portfolio: [], photos: [] };
    setArtists([...artists, a]);
    setCurArtist(a);
    setTab('profile');
    showToast('Profile created! Welcome to the scene 🎸');
  }

  function saveEdit() {
    const updated = { ...curArtist, ...editForm };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    setEditing(false);
    showToast('Profile updated');
  }

  function deleteArtistProfile() {
    if (!window.confirm('Delete your artist profile? All your portfolio, photos and applications will be permanently removed.')) return;
    setArtists(artists.filter(a => a.id !== curArtist.id));
    setCurArtist(null);
    setAppliedGigs({});
    setPage('home');
    showToast('Artist profile deleted');
  }

  // ── ADD PORTFOLIO VIDEO ──────────────────────────────────────────
  async function addPortfolioItem() {
    if (!portForm.title) { showToast('Add a title', true); return; }
    let item = { id: uid(), title: portForm.title, desc: portForm.desc };

    if (portTab === 'link') {
      if (!portForm.url) { showToast('Add a URL', true); return; }
      item.url = portForm.url;
      item.isFile = false;
    } else {
      const file = portFileRef.current?.files?.[0];
      if (!file) { showToast('Choose a file', true); return; }

      if (isCloudinaryConfigured()) {
        // ── Cloudinary upload ──────────────────────────────────────
        setVideoUploading(true);
        setVideoProgress(0);
        try {
          const result = await uploadToCloudinary(file, pct => setVideoProgress(pct));
          item.url = result.url;           // permanent Cloudinary URL
          item.thumbnail = result.thumbnail;
          item.isFile = false;             // treat as URL — survives refresh
          item.isCloudinary = true;
        } catch (err) {
          showToast('Upload failed — ' + err.message, true);
          setVideoUploading(false);
          return;
        }
        setVideoUploading(false);
        setVideoProgress(0);
      } else {
        // ── Fallback: object URL (session-only) ────────────────────
        item.isFile = true;
        item.fileName = file.name;
        item.url = URL.createObjectURL(file);
        showToast('⚠️ Video is session-only. Set up Cloudinary env vars for permanent uploads.');
      }
    }

    const updated = { ...curArtist, portfolio: [...(curArtist.portfolio||[]), item] };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    setPortForm({ title:'',url:'',desc:'' });
    if (portFileRef.current) portFileRef.current.value = '';
    setShowAddVideo(false);
    showToast(item.isCloudinary ? 'Video uploaded to cloud ✓' : 'Video added to portfolio');
  }

  function deletePortfolioItem(item) {
    const updated = { ...curArtist, portfolio: (curArtist.portfolio||[]).filter(p => p.id !== item.id) };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    showToast('Removed');
  }

  // ── ADD PHOTO ────────────────────────────────────────────────────
  async function addPhoto() {
    let src = '';
    let isCloudinary = false;

    if (aphotoTab === 'file') {
      const file = photoFileRef.current?.files?.[0];
      if (!file) { showToast('Choose a photo', true); return; }

      if (isCloudinaryConfigured()) {
        // ── Cloudinary upload ──────────────────────────────────────
        setPhotoUploading(true);
        try {
          const result = await uploadToCloudinary(file, () => {});
          src = result.url;
          isCloudinary = true;
        } catch (err) {
          showToast('Upload failed — ' + err.message, true);
          setPhotoUploading(false);
          return;
        }
        setPhotoUploading(false);
      } else {
        // ── Fallback: base64 compressed ────────────────────────────
        src = await compressImage(file);
      }
    } else {
      if (!photoUrl) { showToast('Enter an image URL', true); return; }
      src = photoUrl;
    }

    const photo = { src, caption: photoCaption };
    const updated = { ...curArtist, photos: [...(curArtist.photos||[]), photo] };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    setPhotoCaption('');
    setPhotoUrl('');
    if (photoFileRef.current) photoFileRef.current.value = '';
    setShowAddPhoto(false);
    showToast(isCloudinary ? 'Photo uploaded to cloud ✓' : 'Photo added');
  }

  function deletePhoto(item) {
    const photos = (curArtist.photos||[]).filter(p => (p.src||p) !== (item.src||item));
    const updated = { ...curArtist, photos };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
  }

  const myApps = applications.filter(a => curArtist && a.artistId === curArtist.id);

  // ── REGISTRATION FORM ────────────────────────────────────────────
  if (!curArtist) return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="label label-teal" style={{ marginBottom: 12 }}>ARTIST REGISTRATION</div>
      <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 6px' }}>Create your profile</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Always free. AI writes your bio. Build a portfolio. Get paid.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="Artist / Band name *" value={form.name} onChange={e=>sf('name',e.target.value)} />
        <input placeholder="Genre (e.g. Indie Folk, Jazz, Metal) *" value={form.genre} onChange={e=>sf('genre',e.target.value)} />
        <div className="grid-2">
          <input placeholder="City" value={form.city} onChange={e=>sf('city',e.target.value)} />
          <input placeholder="No. of members" value={form.members} onChange={e=>sf('members',e.target.value)} />
        </div>
        <input placeholder="Instruments (comma separated)" value={form.instruments} onChange={e=>sf('instruments',e.target.value)} />
        <div className="grid-2">
          <input placeholder="Years gigging" value={form.exp} onChange={e=>sf('exp',e.target.value)} />
          <input placeholder="Vibe in 3 words" value={form.vibe} onChange={e=>sf('vibe',e.target.value)} />
        </div>
        <input placeholder="Instagram handle (e.g. @bandname)" value={form.instagram} onChange={e=>sf('instagram',e.target.value)} />
        <input placeholder="YouTube / SoundCloud / Spotify link" value={form.yt} onChange={e=>sf('yt',e.target.value)} />
        <input placeholder="Contact number (shared only with confirmed venues)" value={form.phone} onChange={e=>sf('phone',e.target.value)} />
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
            <span style={{ fontSize:13,fontWeight:500 }}>Artist Bio</span>
            <button className="btn btn-teal btn-sm" onClick={genBio} disabled={bioLoading}>{bioLoading?'Generating...':'Generate with AI ↗'}</button>
          </div>
          <textarea placeholder="Click generate or write your own..." value={form.bio} onChange={e=>sf('bio',e.target.value)} style={{ minHeight:90,lineHeight:1.7 }} />
        </div>
        <button className="btn btn-teal" onClick={registerArtist}>Create profile & start applying →</button>
      </div>
    </div>
  );

  const a = curArtist;
  const totalMedia = (a.portfolio||[]).length + (a.photos||[]).length;
  const reviews = a.reviews || [];

  return (
    <div className="page">
      <div className="tab-bar">
        {[['profile','Profile'],['portfolio',`Portfolio${totalMedia>0?` (${totalMedia})`:'`'}`],['applications','Applications']].map(([k,l]) => (
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div style={{ maxWidth: 520 }}>
          {editing ? (
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <div className="label label-teal" style={{ marginBottom:4 }}>EDIT PROFILE</div>
              {[['name','Artist / Band name'],['genre','Genre'],['city','City'],['members','Members'],['instruments','Instruments'],['exp','Years gigging'],['vibe','Vibe in 3 words'],['instagram','Instagram'],['yt','YouTube / SoundCloud'],['phone','Phone']].map(([k,ph]) => (
                <input key={k} placeholder={ph} value={editForm[k]||''} onChange={e=>setEditForm(p=>({...p,[k]:e.target.value}))} />
              ))}
              <textarea placeholder="Bio" value={editForm.bio||''} onChange={e=>setEditForm(p=>({...p,bio:e.target.value}))} />
              <div className="flex-row">
                <button className="btn btn-teal" style={{ flex:1 }} onClick={saveEdit}>Save changes</button>
                <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-hero">
                <div style={{ display:'flex',alignItems:'flex-start',gap:16,marginBottom:12 }}>
                  <div className="profile-avatar" style={{ background:C.tealL }}>🎸</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:20,fontWeight:500,marginBottom:4 }}>{a.name}</div>
                    <div style={{ fontSize:13,color:'#666' }}>{a.genre} · {a.city} · {a.members==='1'?'Solo artist':a.members+'-piece band'}</div>
                    {a.exp && <div style={{ fontSize:12,color:'#aaa',marginTop:2 }}>{a.exp} years gigging</div>}
                    {a.avgRating > 0 && <div style={{ marginTop:6 }}><StarDisplay rating={a.avgRating} /></div>}
                    {a.instruments && (
                      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginTop:8 }}>
                        {a.instruments.split(',').map((t,i) => <span key={i} className="tag tag-gray">{t.trim()}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                {a.bio && <p style={{ fontSize:14,color:'#555',lineHeight:1.8,marginBottom:12 }}>{a.bio}</p>}
                <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
                  {a.instagram && <span style={{ fontSize:12,color:C.teal }}>📷 {a.instagram}</span>}
                  {a.yt && <span style={{ fontSize:12,color:C.teal }}>▶ Music link added</span>}
                </div>
              </div>

              <div className="flex-row" style={{ marginBottom:20 }}>
                <button className="btn btn-teal" style={{ flex:1 }} onClick={() => setPage('browse')}>Browse gigs</button>
                <button className="btn btn-outline" onClick={() => { setEditForm({...a}); setEditing(true); }}>Edit Profile</button>
              </div>

              {reviews.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <div className="section-title">RATINGS FROM VENUES</div>
                  <div style={{ display:'flex',alignItems:'center',gap:16,padding:'14px 16px',background:C.tealL,borderRadius:12,border:`1px solid rgba(29,158,117,.2)`,marginBottom:12 }}>
                    <div style={{ fontSize:36,fontWeight:700,color:C.teal,lineHeight:1 }}>{a.avgRating?.toFixed(1)}</div>
                    <div>
                      <StarDisplay rating={a.avgRating||0} size="lg" />
                      <div style={{ fontSize:11,color:'#888',marginTop:4 }}>{reviews.length} review{reviews.length!==1?'s':''} from venues</div>
                    </div>
                  </div>
                  {reviews.slice().reverse().map((r,i) => (
                    <div key={i} className="card" style={{ marginBottom:8,padding:'12px 14px' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                        <div style={{ fontWeight:500,fontSize:13 }}>{r.venue}</div>
                        <StarDisplay rating={r.rating} />
                      </div>
                      {r.gig && <div style={{ fontSize:11,color:'#aaa',marginBottom:4 }}>📅 {r.gig}</div>}
                      {r.comment && <p style={{ fontSize:13,color:'#666',lineHeight:1.5 }}>{r.comment}</p>}
                      <div style={{ fontSize:11,color:'#bbb',marginTop:4 }}>{r.date}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="danger-zone">
                <div className="danger-zone-title">⚠ DANGER ZONE</div>
                <p style={{ fontSize:12,color:'#888',marginBottom:10,lineHeight:1.5 }}>
                  Deleting your artist profile is permanent. Your portfolio, photos, and all applications will be lost.
                </p>
                <button className="btn btn-red btn-sm" onClick={deleteArtistProfile}>Delete my artist profile</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PORTFOLIO TAB ── */}
      {tab === 'portfolio' && (
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
            <div className="label label-teal">MY PORTFOLIO</div>
            <div style={{ display:'flex',gap:8 }}>
              <button className="btn btn-teal btn-sm" onClick={() => { setShowAddVideo(v=>!v); setShowAddPhoto(false); }}>+ Video</button>
              <button className="btn btn-outline btn-sm" onClick={() => { setShowAddPhoto(v=>!v); setShowAddVideo(false); }}>+ Photo</button>
            </div>
          </div>
          <p style={{ fontSize:12,color:'#aaa',marginBottom:16,lineHeight:1.5 }}>
            Scroll up & down through your videos and photos. Venues see this when reviewing your application.
          </p>

          {/* ── Add Video Form ── */}
          {showAddVideo && (
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ fontSize:13,fontWeight:500,marginBottom:12 }}>🎬 Add a video or track</div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                <input placeholder="Title (e.g. 'Live at Blue Tokai, 2024') *" value={portForm.title} onChange={e=>setPortForm(p=>({...p,title:e.target.value}))} />
                <div className="upload-toggle">
                  <button className={`upload-toggle-btn ${portTab==='link'?'active-teal':'inactive'}`} onClick={()=>setPortTab('link')}>🔗 YouTube / Link</button>
                  <button className={`upload-toggle-btn ${portTab==='file'?'active-teal':'inactive'}`} onClick={()=>setPortTab('file')}>📁 Upload Video</button>
                </div>
                {portTab==='link'
                  ? <input placeholder="YouTube / SoundCloud / Instagram link *" value={portForm.url} onChange={e=>setPortForm(p=>({...p,url:e.target.value}))} />
                  : <>
                      <input type="file" accept="video/*" ref={portFileRef} />
                      {isCloudinaryConfigured()
                        ? <div style={{ fontSize:11,color:'var(--teal)',background:'var(--tealL)',padding:'6px 10px',borderRadius:6,border:'1px solid rgba(29,158,117,.2)' }}>
                            ☁️ Will be uploaded to Cloudinary — permanent & playable
                          </div>
                        : <div className="session-warn">⚠️ No Cloudinary set up — video is session-only. Set REACT_APP_CLOUDINARY_CLOUD_NAME env var.</div>
                      }
                      {videoUploading && (
                        <div>
                          <div style={{ fontSize:12,color:'#888',marginBottom:4 }}>Uploading... {videoProgress}%</div>
                          <div style={{ height:6,background:'#eee',borderRadius:4,overflow:'hidden' }}>
                            <div style={{ height:'100%',width:`${videoProgress}%`,background:'var(--teal)',transition:'width .2s' }} />
                          </div>
                        </div>
                      )}
                    </>
                }
                <input placeholder="Short description (optional)" value={portForm.desc} onChange={e=>setPortForm(p=>({...p,desc:e.target.value}))} />
                <div className="flex-row">
                  <button className="btn btn-teal" style={{ flex:1,padding:10 }} onClick={addPortfolioItem} disabled={videoUploading}>
                    {videoUploading ? `Uploading ${videoProgress}%...` : 'Add to portfolio'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddVideo(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Add Photo Form ── */}
          {showAddPhoto && (
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ fontSize:13,fontWeight:500,marginBottom:12 }}>🖼️ Add a photo</div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                <div className="upload-toggle">
                  <button className={`upload-toggle-btn ${aphotoTab==='file'?'active-teal':'inactive'}`} onClick={()=>setAphotoTab('file')}>📁 Upload Photo</button>
                  <button className={`upload-toggle-btn ${aphotoTab==='url'?'active-teal':'inactive'}`} onClick={()=>setAphotoTab('url')}>🔗 Image URL</button>
                </div>
                {aphotoTab==='file'
                  ? <>
                      <input type="file" accept="image/*" ref={photoFileRef} />
                      {isCloudinaryConfigured() && (
                        <div style={{ fontSize:11,color:'var(--teal)',background:'var(--tealL)',padding:'6px 10px',borderRadius:6,border:'1px solid rgba(29,158,117,.2)' }}>
                          ☁️ Will be uploaded to Cloudinary permanently
                        </div>
                      )}
                    </>
                  : <input placeholder="Direct image URL" value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} />
                }
                <input placeholder="Caption (optional)" value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)} />
                <div className="flex-row">
                  <button className="btn btn-teal" style={{ flex:1,padding:10 }} onClick={addPhoto} disabled={photoUploading}>
                    {photoUploading ? 'Uploading...' : 'Add photo'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddPhoto(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <PortfolioFeed
            portfolio={a.portfolio||[]}
            photos={a.photos||[]}
            isOwner={true}
            onDeleteVideo={deletePortfolioItem}
            onDeletePhoto={deletePhoto}
          />
        </div>
      )}

      {/* ── APPLICATIONS TAB ── */}
      {tab === 'applications' && (
        <div style={{ maxWidth:520 }}>
          <div className="label label-teal" style={{ marginBottom:14 }}>MY APPLICATIONS</div>
          {myApps.length === 0 ? (
            <div style={{ padding:'2rem',textAlign:'center',color:'#ccc',fontSize:13,border:'1px dashed #e8e8e8',borderRadius:10 }}>
              No applications yet — <span style={{ color:C.teal,cursor:'pointer' }} onClick={() => setPage('browse')}>browse open gigs →</span>
            </div>
          ) : myApps.map(app => {
            const g = gigs.find(x => x.id === app.gigId);
            const status = app.status || 'pending';
            return (
              <div key={app.id} className="card" style={{ marginBottom:12, borderLeft:`3px solid ${status==='confirmed'?C.teal:status==='shortlisted'?C.blue:status==='rejected'?'#c0392b':status==='completed'?'#27ae60':'#e8e8e8'}` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:500,fontSize:14 }}>{g?g.name:'Unknown gig'}</div>
                    {g && <div style={{ fontSize:12,color:'#888',marginTop:2 }}>{g.city} · {g.night} · {g.pay}</div>}
                  </div>
                  <span className={`status-badge status-${status==='completed'?'confirmed':status}`}>
                    {status==='pending'?'⏳ Pending':status==='shortlisted'?'⭐ Shortlisted':status==='confirmed'?'✅ Confirmed':status==='rejected'?'✕ Declined':'🎉 Completed'}
                  </span>
                </div>
                <p style={{ fontSize:13,color:'#666',lineHeight:1.6,background:'#f8f8f8',padding:'10px 12px',borderRadius:8 }}>{app.pitch}</p>
                {status==='confirmed' && (
                  <div style={{ marginTop:8,fontSize:12,color:C.teal,background:C.tealL,padding:'8px 12px',borderRadius:8 }}>
                    🎉 You're confirmed! The venue will contact you soon.
                  </div>
                )}
                {status==='shortlisted' && (
                  <div style={{ marginTop:8,fontSize:12,color:C.blue,background:C.blueL,padding:'8px 12px',borderRadius:8 }}>
                    ⭐ You've been shortlisted! The venue is considering you.
                  </div>
                )}
                <div style={{ marginTop:8,fontSize:11,color:'#bbb' }}>Sent {app.sent}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
