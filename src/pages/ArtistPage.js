import { useState, useRef } from 'react';
import { uid, compressImage } from '../utils';
import { C } from '../data/defaults';
import { showToast } from '../components/Toast';
import PortfolioFeed from '../components/PortfolioFeed';

async function callAI(prompt) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
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
    if (!window.confirm('Delete your artist profile? All your portfolio, photos and applications will be permanently removed. This cannot be undone.')) return;
    setArtists(artists.filter(a => a.id !== curArtist.id));
    setCurArtist(null);
    setAppliedGigs({});
    setPage('home');
    showToast('Artist profile deleted');
  }

  async function addPortfolioItem() {
    if (!portForm.title) { showToast('Add a title', true); return; }
    let item = { id: uid(), title: portForm.title, desc: portForm.desc };
    if (portTab === 'link') {
      if (!portForm.url) { showToast('Add a URL', true); return; }
      item.url = portForm.url; item.isFile = false;
    } else {
      const file = portFileRef.current?.files?.[0];
      if (!file) { showToast('Choose a file', true); return; }
      item.isFile = true; item.fileName = file.name; item.url = URL.createObjectURL(file);
    }
    const updated = { ...curArtist, portfolio: [...(curArtist.portfolio||[]), item] };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    setPortForm({ title:'',url:'',desc:'' });
    setShowAddVideo(false);
    showToast('Video added to portfolio');
  }

  function deletePortfolioItem(item) {
    const updated = { ...curArtist, portfolio: (curArtist.portfolio||[]).filter(p => p.id !== item.id) };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    showToast('Removed from portfolio');
  }

  async function addPhoto() {
    let src = '';
    if (aphotoTab === 'file') {
      const file = photoFileRef.current?.files?.[0];
      if (!file) { showToast('Choose a photo', true); return; }
      src = await compressImage(file);
    } else {
      if (!photoUrl) { showToast('Enter an image URL', true); return; }
      src = photoUrl;
    }
    const photo = { src, caption: photoCaption };
    const updated = { ...curArtist, photos: [...(curArtist.photos||[]), photo] };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
    setPhotoCaption(''); setPhotoUrl('');
    setShowAddPhoto(false);
    showToast('Photo added');
  }

  function deletePhoto(item) {
    const photos = (curArtist.photos||[]).filter(p => (p.src||p) !== (item.src||item));
    const updated = { ...curArtist, photos };
    setCurArtist(updated);
    setArtists(artists.map(a => a.id === updated.id ? updated : a));
  }

  const myApps = applications.filter(a => curArtist && a.artistId === curArtist.id);

  // ── REGISTRATION FORM ───────────────────────────────────────────
  if (!curArtist) return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="label label-teal" style={{ marginBottom: 12 }}>ARTIST REGISTRATION</div>
      <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 6px' }}>Create your profile</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Always free. AI writes your bio. Build a portfolio. Venues screen you. You get paid.</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Artist Bio</span>
            <button className="btn btn-teal btn-sm" onClick={genBio} disabled={bioLoading}>
              {bioLoading ? 'Generating...' : 'Generate with AI ↗'}
            </button>
          </div>
          <textarea placeholder="Click generate or write your own..." value={form.bio} onChange={e=>sf('bio',e.target.value)} style={{ minHeight: 90, lineHeight: 1.7 }} />
        </div>
        <button className="btn btn-teal" onClick={registerArtist}>Create profile & start applying →</button>
      </div>
    </div>
  );

  const a = curArtist;
  const totalMedia = (a.portfolio||[]).length + (a.photos||[]).length;

  return (
    <div className="page">
      <div className="tab-bar">
        {[['profile','Profile'],['portfolio','Portfolio'],['applications','Applications']].map(([k,l]) => (
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={() => setTab(k)}>
            {l}{k==='portfolio' && totalMedia > 0 ? ` (${totalMedia})` : ''}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div style={{ maxWidth: 520 }}>
          {editing ? (
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <div className="label label-teal" style={{ marginBottom: 4 }}>EDIT PROFILE</div>
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
              <div className="flex-row" style={{ marginBottom:16 }}>
                <button className="btn btn-teal" style={{ flex:1 }} onClick={() => setPage('browse')}>Browse gigs</button>
                <button className="btn btn-outline" onClick={() => { setEditForm({...a}); setEditing(true); }}>Edit Profile</button>
              </div>

              {/* ── DELETE PROFILE ── */}
              <div className="danger-zone">
                <div className="danger-zone-title">⚠ DANGER ZONE</div>
                <p style={{ fontSize:12,color:'#888',marginBottom:10,lineHeight:1.5 }}>
                  Deleting your artist profile is permanent and cannot be undone. Your portfolio, photos, and all applications will be lost.
                </p>
                <button className="btn btn-red btn-sm" onClick={deleteArtistProfile}>
                  Delete my artist profile
                </button>
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
              <button className="btn btn-teal btn-sm" onClick={() => { setShowAddVideo(v=>!v); setShowAddPhoto(false); }}>
                + Video
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => { setShowAddPhoto(v=>!v); setShowAddVideo(false); }}>
                + Photo
              </button>
            </div>
          </div>
          <p style={{ fontSize:12,color:'#aaa',marginBottom:16,lineHeight:1.5 }}>
            Scroll up & down through your videos and photos. Venues see this board when reviewing your application.
          </p>

          {/* Add video form */}
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
                  : <><input type="file" accept="video/*" ref={portFileRef} /><div className="session-warn">⚠️ Uploaded files are session-only — use YouTube links for a permanent portfolio.</div></>
                }
                <input placeholder="Short description (optional)" value={portForm.desc} onChange={e=>setPortForm(p=>({...p,desc:e.target.value}))} />
                <div className="flex-row">
                  <button className="btn btn-teal" style={{ flex:1,padding:10 }} onClick={addPortfolioItem}>Add to portfolio</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddVideo(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Add photo form */}
          {showAddPhoto && (
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ fontSize:13,fontWeight:500,marginBottom:12 }}>🖼️ Add a photo</div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                <div className="upload-toggle">
                  <button className={`upload-toggle-btn ${aphotoTab==='file'?'active-teal':'inactive'}`} onClick={()=>setAphotoTab('file')}>📁 Upload Photo</button>
                  <button className={`upload-toggle-btn ${aphotoTab==='url'?'active-teal':'inactive'}`} onClick={()=>setAphotoTab('url')}>🔗 Image URL</button>
                </div>
                {aphotoTab==='file'
                  ? <input type="file" accept="image/*" ref={photoFileRef} />
                  : <input placeholder="Direct image URL" value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} />
                }
                <input placeholder="Caption (optional)" value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)} />
                <div className="flex-row">
                  <button className="btn btn-teal" style={{ flex:1,padding:10 }} onClick={addPhoto}>Add photo</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddPhoto(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* The Hinge-style feed */}
          <PortfolioFeed
            portfolio={a.portfolio || []}
            photos={a.photos || []}
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
            return (
              <div key={app.id} className="card" style={{ marginBottom:12 }}>
                <div style={{ fontWeight:500,fontSize:14,marginBottom:4 }}>{g?g.name:'Unknown gig'}</div>
                {g && <div style={{ fontSize:12,color:'#888',marginBottom:8 }}>{g.city} · {g.night} · {g.pay}</div>}
                <p style={{ fontSize:13,color:'#666',lineHeight:1.6,background:'#f8f8f8',padding:'10px 12px',borderRadius:8 }}>{app.pitch}</p>
                <div style={{ marginTop:8,fontSize:11,color:'#bbb' }}>Sent {app.sent}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
