import { useState, useRef } from 'react';
import { uid, compressImage } from '../utils';
import { C } from '../data/defaults';
import { showToast } from '../components/Toast';


export default function VenuePage({ curVenue, setCurVenue, venues, setVenues, gigs, setGigs, applications, setPage }) {
  const [tab, setTab] = useState('profile');
  const [vphotoTab, setVphotoTab] = useState('file');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  const [editExistingPhotos, setEditExistingPhotos] = useState([]);
  const vPhotoFilesRef = useRef();
  const editPhotoFilesRef = useRef();

  // Gig form
  const [gigForm, setGigForm] = useState({ night: '', pay: '', genre: '', duration: '', slots: '', desc: '' });

  // Register form
  const [form, setForm] = useState({
    name:'',type:'',city:'Bangalore',address:'',area:'',about:'',
    capacity:'',seated:'',stage:'',
    pa:'',monitors:'',mixer:'',mics:'',di:'',
    lighting:'',visual:'',backline:'',green:'',parking:'',
    nights:'',genres:'',instagram:'',contact:'',
    photos:[]
  });
  function f(k){return form[k];}
  function sf(k,v){setForm(p=>({...p,[k]:v}));}

  async function collectPhotos(fileInput) {
    const files = Array.from(fileInput?.files || []);
    const compressed = await Promise.all(files.map(f => compressImage(f)));
    return compressed.map(src => ({ src }));
  }

  async function registerVenue() {
    if (!form.name || !form.address || !form.nights || !form.contact) { showToast('Fill required fields (*)', true); return; }
    let photos = form.photos;
    if (vphotoTab === 'file') {
      const newPhotos = await collectPhotos(vPhotoFilesRef.current);
      photos = [...photos, ...newPhotos];
    }
    const v = { id: uid(), ...form, photos };
    const newVenues = [...venues, v];
    setVenues(newVenues);
    setCurVenue(v);
    setTab('profile');
    showToast('Venue profile created! 🏠');
  }

  async function saveEdit() {
    let photos = editExistingPhotos;
    if (editPhotoFilesRef.current?.files?.length) {
      const newPhotos = await collectPhotos(editPhotoFilesRef.current);
      photos = [...photos, ...newPhotos];
    }
    const updated = { ...curVenue, ...editForm, photos };
    setCurVenue(updated);
    setVenues(venues.map(v => v.id === updated.id ? updated : v));
    setEditing(false);
    showToast('Venue updated');
  }

  function deleteVenueProfile() {
    if (!window.confirm('Delete your venue profile? All gig listings will also be removed. This cannot be undone.')) return;
    setVenues(venues.filter(v => v.id !== curVenue.id));
    setGigs(gigs.filter(g => g.venueId !== curVenue.id));
    setCurVenue(null);
    setPage('home');
    showToast('Venue profile deleted');
  }

  function postGig() {
    if (!gigForm.night || !gigForm.pay) { showToast('Night and pay required', true); return; }
    const v = curVenue;
    const newGig = {
      id: uid(), venueId: v.id, name: v.name, type: v.type, city: v.city,
      night: gigForm.night, pay: gigForm.pay, genreNeed: gigForm.genre,
      duration: gigForm.duration, desc: gigForm.desc,
      slots: gigForm.slots ? gigForm.slots.split(',').map(s => s.trim()) : [],
      posted: 'just now', applicants: [], sponsors: []
    };
    setGigs([...gigs, newGig]);
    setGigForm({ night:'',pay:'',genre:'',duration:'',slots:'',desc:'' });
    showToast('Gig posted!');
  }

  function deleteGig(gigId) {
    if (!window.confirm('Remove this gig listing?')) return;
    setGigs(gigs.filter(g => g.id !== gigId));
    showToast('Gig removed');
  }

  function removeExistingPhoto(src) {
    setEditExistingPhotos(editExistingPhotos.filter(p => (p.src||p) !== src));
  }

  const myGigs = gigs.filter(g => curVenue && g.venueId === curVenue.id);
  const myApplicants = applications.filter(a => myGigs.some(g => g.id === a.gigId));

  // ── NO VENUE: REGISTER FORM ──────────────────────────────────────
  if (!curVenue) {
    return (
      <div className="page" style={{ maxWidth: 540 }}>
        <div className="label label-blue" style={{ marginBottom: 12 }}>VENUE REGISTRATION</div>
        <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 6px' }}>Create your venue profile</h2>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>Show off your space, sound system, and tech. Artists can see exactly what they're walking into.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Venue name *" value={f('name')} onChange={e=>sf('name',e.target.value)}/>
          <div className="grid-2">
            <select value={f('type')} onChange={e=>sf('type',e.target.value)}>
              <option value="">Venue type *</option>
              {['Café','Bar','Club','Brewery','Music Venue','Restaurant','Rooftop','Art Gallery','Open Air','Other'].map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={f('city')} onChange={e=>sf('city',e.target.value)}>
              {['Bangalore','Mumbai','Pune','Delhi','Hyderabad','Chennai','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <input placeholder="Full address *" value={f('address')} onChange={e=>sf('address',e.target.value)}/>
          <input placeholder="Area / Neighbourhood (e.g. Koramangala, Bandra)" value={f('area')} onChange={e=>sf('area',e.target.value)}/>
          <textarea placeholder="Tell artists about your venue — vibe, history, what makes your nights special *" value={f('about')} onChange={e=>sf('about',e.target.value)}/>
          <div className="section-title" style={{marginTop:4}}>CAPACITY & SPACE</div>
          <div className="grid-2">
            <input placeholder="Standing capacity" value={f('capacity')} onChange={e=>sf('capacity',e.target.value)}/>
            <input placeholder="Seated capacity" value={f('seated')} onChange={e=>sf('seated',e.target.value)}/>
          </div>
          <input placeholder="Stage dimensions (e.g. 6m × 4m, raised 0.6m)" value={f('stage')} onChange={e=>sf('stage',e.target.value)}/>
          <div className="section-title">VENUE PHOTOS</div>
          <div className="upload-toggle">
            <button className={`upload-toggle-btn ${vphotoTab==='file'?'active-blue':'inactive'}`} onClick={()=>setVphotoTab('file')}>📁 Upload Photos</button>
            <button className={`upload-toggle-btn ${vphotoTab==='url'?'active-blue':'inactive'}`} onClick={()=>setVphotoTab('url')}>🔗 Paste URLs</button>
          </div>
          {vphotoTab==='file'
            ? <><input type="file" accept="image/*" multiple ref={vPhotoFilesRef}/><div style={{fontSize:11,color:'#aaa',marginTop:5,lineHeight:1.5}}>Upload multiple photos — compressed automatically.</div></>
            : <textarea placeholder="Photo URLs — one per line" value={f('photos').map(p=>p.src||p).join('\n')} onChange={e=>sf('photos',e.target.value.split('\n').filter(Boolean).map(src=>({src})))} style={{minHeight:60}}/>
          }
          <div className="section-title">SOUND SYSTEM</div>
          <div className="grid-2">
            <input placeholder="PA system (e.g. QSC K10, JBL SRX)" value={f('pa')} onChange={e=>sf('pa',e.target.value)}/>
            <input placeholder="Stage monitors" value={f('monitors')} onChange={e=>sf('monitors',e.target.value)}/>
          </div>
          <input placeholder="Mixing desk (e.g. Behringer X32)" value={f('mixer')} onChange={e=>sf('mixer',e.target.value)}/>
          <input placeholder="Microphones (e.g. 4× SM58, 2× SM57)" value={f('mics')} onChange={e=>sf('mics',e.target.value)}/>
          <input placeholder="DI boxes, direct outs, other audio gear" value={f('di')} onChange={e=>sf('di',e.target.value)}/>
          <div className="section-title">LIGHTING & TECH</div>
          <input placeholder="Lighting rig" value={f('lighting')} onChange={e=>sf('lighting',e.target.value)}/>
          <input placeholder="Visuals / projection" value={f('visual')} onChange={e=>sf('visual',e.target.value)}/>
          <input placeholder="Backline provided (e.g. drum kit, bass amp)" value={f('backline')} onChange={e=>sf('backline',e.target.value)}/>
          <input placeholder="Green room / artist facilities" value={f('green')} onChange={e=>sf('green',e.target.value)}/>
          <input placeholder="Parking situation" value={f('parking')} onChange={e=>sf('parking',e.target.value)}/>
          <div className="section-title">NIGHTS & CONTACT</div>
          <input placeholder="Which nights do you book live music? *" value={f('nights')} onChange={e=>sf('nights',e.target.value)}/>
          <input placeholder="Genres that work for your crowd (comma separated)" value={f('genres')} onChange={e=>sf('genres',e.target.value)}/>
          <input placeholder="Venue Instagram handle" value={f('instagram')} onChange={e=>sf('instagram',e.target.value)}/>
          <input placeholder="Booking contact — email or phone *" value={f('contact')} onChange={e=>sf('contact',e.target.value)}/>
          <button className="btn btn-blue" onClick={registerVenue} style={{marginTop:4}}>Create venue profile →</button>
        </div>
      </div>
    );
  }

  const v = curVenue;

  return (
    <div className="page">
      <div className="tab-bar">
        {[['profile','Venue Profile'],['gigs','Post Gigs'],['applicants','Applicants']].map(([k,l])=>(
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab==='profile' && (
        <div>
          {editing ? (
            <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:520}}>
              <div className="label label-blue" style={{marginBottom:4}}>EDIT VENUE</div>
              <input placeholder="Venue name" value={editForm.name||''} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}/>
              <textarea placeholder="About" value={editForm.about||''} onChange={e=>setEditForm(p=>({...p,about:e.target.value}))}/>
              <input placeholder="Address" value={editForm.address||''} onChange={e=>setEditForm(p=>({...p,address:e.target.value}))}/>
              <input placeholder="Instagram" value={editForm.instagram||''} onChange={e=>setEditForm(p=>({...p,instagram:e.target.value}))}/>
              <input placeholder="Contact" value={editForm.contact||''} onChange={e=>setEditForm(p=>({...p,contact:e.target.value}))}/>
              <div className="section-title">CURRENT PHOTOS (click ✕ to remove)</div>
              <div className="photo-thumb-grid">
                {editExistingPhotos.map((p,i)=>(
                  <div key={i} className="photo-thumb-item">
                    <img src={p.src||p} alt=""/>
                    <button className="photo-thumb-remove" onClick={()=>removeExistingPhoto(p.src||p)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="section-title">ADD MORE PHOTOS</div>
              <input type="file" accept="image/*" multiple ref={editPhotoFilesRef}/>
              <div className="flex-row">
                <button className="btn btn-blue" style={{flex:1}} onClick={saveEdit}>Save changes</button>
                <button className="btn btn-outline" onClick={()=>setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="venue-hero">
                <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:12}}>
                  <div style={{width:56,height:56,borderRadius:'50%',background:C.blueL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,border:`2px solid rgba(24,95,165,.3)`}}>🏠</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:20,fontWeight:500,marginBottom:4}}>{v.name}</div>
                    <div style={{fontSize:13,color:'#666'}}>{v.type} · {v.area?v.area+' · ':''}{v.city}</div>
                    {v.capacity && <div style={{fontSize:12,color:'#aaa',marginTop:2}}>👥 {v.capacity} standing{v.seated?' · '+v.seated+' seated':''}</div>}
                  </div>
                </div>
                {v.about && <p style={{fontSize:14,color:'#555',lineHeight:1.8,marginBottom:12}}>{v.about}</p>}
                {(v.photos||[]).length>0 && (
                  <div className="photo-strip">
                    {v.photos.map((p,i)=><img key={i} src={p.src||p} alt="" style={{height:80,borderRadius:8,objectFit:'cover',flexShrink:0}} onError={e=>e.target.style.display='none'}/>)}
                  </div>
                )}
              </div>

              {/* Tech info */}
              {(v.pa||v.mixer||v.lighting||v.backline) && (
                <>
                  <div className="section-title">SOUND & TECH</div>
                  <div className="card" style={{marginBottom:16}}>
                    {[['PA System',v.pa],['Monitors',v.monitors],['Mixing Desk',v.mixer],['Mics',v.mics],['DI/Other',v.di],['Lighting',v.lighting],['Visuals',v.visual],['Backline',v.backline],['Green Room',v.green],['Parking',v.parking]].filter(([,val])=>val).map(([label,val])=>(
                      <div key={label} className="info-row"><span className="info-label">{label}</span><span style={{fontSize:13}}>{val}</span></div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex-row" style={{marginBottom:16}}>
                <button className="btn btn-blue" style={{flex:1}} onClick={()=>setTab('gigs')}>Post a gig</button>
                <button className="btn btn-outline" onClick={()=>{setEditForm({...v});setEditExistingPhotos(v.photos||[]);setEditing(true);}}>Edit Venue</button>
              </div>

              {/* Danger zone */}
              <div className="danger-zone">
                <div className="danger-zone-title">⚠ DANGER ZONE</div>
                <p style={{fontSize:12,color:'#888',marginBottom:10,lineHeight:1.5}}>Deleting your venue profile is permanent. All gig listings will also be removed.</p>
                <button className="btn btn-red btn-sm" onClick={deleteVenueProfile}>Delete my venue profile</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* POST GIGS TAB */}
      {tab==='gigs' && (
        <div style={{maxWidth:520}}>
          <div className="label label-blue" style={{marginBottom:14}}>POST A NEW GIG</div>
          <div className="card" style={{marginBottom:20}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <input placeholder="Night / date (e.g. Friday evenings, Dec 20th) *" value={gigForm.night} onChange={e=>setGigForm(p=>({...p,night:e.target.value}))}/>
              <div className="grid-2">
                <input placeholder="Artist pay range * (e.g. ₹3,000–5,000)" value={gigForm.pay} onChange={e=>setGigForm(p=>({...p,pay:e.target.value}))}/>
                <input placeholder="Genre needed" value={gigForm.genre} onChange={e=>setGigForm(p=>({...p,genre:e.target.value}))}/>
              </div>
              <div className="grid-2">
                <input placeholder="Set duration (e.g. 2hrs)" value={gigForm.duration} onChange={e=>setGigForm(p=>({...p,duration:e.target.value}))}/>
                <input placeholder="Sponsor slots (comma separated)" value={gigForm.slots} onChange={e=>setGigForm(p=>({...p,slots:e.target.value}))}/>
              </div>
              <textarea placeholder="What are you looking for — style, crowd size, any requirements..." value={gigForm.desc} onChange={e=>setGigForm(p=>({...p,desc:e.target.value}))} style={{minHeight:70}}/>
              <button className="btn btn-blue" onClick={postGig}>Post gig listing →</button>
            </div>
          </div>
          <div className="section-title">ACTIVE LISTINGS</div>
          {myGigs.length===0
            ? <div style={{padding:'1.5rem',textAlign:'center',color:'#ccc',fontSize:13,border:'1px dashed #e8e8e8',borderRadius:10}}>No active gig listings yet.</div>
            : myGigs.map(g=>(
                <div key={g.id} className="card" style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                    <div>
                      <div style={{fontWeight:500,fontSize:14}}>{g.night}</div>
                      <div style={{fontSize:12,color:'#888',marginTop:2}}>{g.pay}{g.genreNeed?' · '+g.genreNeed:''}{g.duration?' · '+g.duration:''}</div>
                      {g.desc && <p style={{fontSize:12,color:'#666',marginTop:6,lineHeight:1.5}}>{g.desc}</p>}
                      <div style={{marginTop:6,fontSize:11,color:C.blue}}>{(applications.filter(a=>a.gigId===g.id)).length} applicant(s)</div>
                    </div>
                    <button className="btn btn-outline btn-sm" style={{color:'#c0392b',borderColor:'rgba(192,57,43,.3)',flexShrink:0}} onClick={()=>deleteGig(g.id)}>✕ Remove</button>
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {/* APPLICANTS TAB */}
      {tab==='applicants' && (
        <div style={{maxWidth:520}}>
          <div className="label label-blue" style={{marginBottom:14}}>APPLICANTS</div>
          {myApplicants.length===0
            ? <div style={{padding:'2rem',textAlign:'center',color:'#ccc',fontSize:13,border:'1px dashed #e8e8e8',borderRadius:10}}>No applications yet. Post a gig to start receiving them.</div>
            : myApplicants.map(app=>{
                const g=gigs.find(x=>x.id===app.gigId);
                return (
                  <div key={app.id} className="card" style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <div style={{fontWeight:500,fontSize:14}}>{app.artistName}</div>
                      <span className="tag tag-teal">{g?g.night:'Unknown gig'}</span>
                    </div>
                    {app.artistGenre && <div style={{fontSize:12,color:'#888',marginBottom:8}}>{app.artistGenre} · {app.artistCity}</div>}
                    <p style={{fontSize:13,color:'#666',lineHeight:1.6,background:'#f8f8f8',padding:'10px 12px',borderRadius:8}}>{app.pitch}</p>
                    <div style={{marginTop:8,fontSize:11,color:'#bbb'}}>Applied {app.sent}</div>
                  </div>
                );
              })
          }
        </div>
      )}
    </div>
  );
}
