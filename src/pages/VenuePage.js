import { useState, useRef } from 'react';
import { uid, compressImage } from '../utils';
import { C } from '../data/defaults';
import { showToast } from '../components/Toast';
import { StarDisplay, RatingModal } from '../components/StarRating';

export default function VenuePage({ curVenue, setCurVenue, venues, setVenues, gigs, setGigs, applications, setApplications, artists, setArtists, setPage }) {
  const [tab, setTab] = useState('profile');
  const [vphotoTab, setVphotoTab] = useState('file');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editExistingPhotos, setEditExistingPhotos] = useState([]);
  const [gigForm, setGigForm] = useState({ night:'',pay:'',genre:'',duration:'',slots:'',desc:'' });
  const [ratingTarget, setRatingTarget] = useState(null); // {artist, gig}
  const vPhotoFilesRef = useRef();
  const editPhotoFilesRef = useRef();

  const [form, setForm] = useState({
    name:'',type:'',city:'Bangalore',address:'',area:'',about:'',
    capacity:'',seated:'',stage:'',pa:'',monitors:'',mixer:'',mics:'',di:'',
    lighting:'',visual:'',backline:'',green:'',parking:'',
    nights:'',genres:'',instagram:'',contact:'',photos:[]
  });
  const sf = (k,v) => setForm(p=>({...p,[k]:v}));

  async function collectPhotos(fileInput) {
    const files = Array.from(fileInput?.files || []);
    const compressed = await Promise.all(files.map(f => compressImage(f)));
    return compressed.map(src => ({ src }));
  }

  async function registerVenue() {
    if (!form.name||!form.address||!form.nights||!form.contact){showToast('Fill required fields (*)',true);return;}
    let photos = form.photos;
    if (vphotoTab==='file'){const newPhotos=await collectPhotos(vPhotoFilesRef.current);photos=[...photos,...newPhotos];}
    const v={id:uid(),...form,photos};
    setVenues([...venues,v]);setCurVenue(v);setTab('profile');showToast('Venue profile created! 🏠');
  }

  async function saveEdit() {
    let photos=editExistingPhotos;
    if(editPhotoFilesRef.current?.files?.length){const np=await collectPhotos(editPhotoFilesRef.current);photos=[...photos,...np];}
    const updated={...curVenue,...editForm,photos};
    setCurVenue(updated);setVenues(venues.map(v=>v.id===updated.id?updated:v));setEditing(false);showToast('Venue updated');
  }

  function deleteVenueProfile() {
    if(!window.confirm('Delete your venue profile? All gig listings will also be removed. This cannot be undone.'))return;
    setVenues(venues.filter(v=>v.id!==curVenue.id));
    setGigs(gigs.filter(g=>g.venueId!==curVenue.id));
    setCurVenue(null);setPage('home');showToast('Venue profile deleted');
  }

  function postGig() {
    if(!gigForm.night||!gigForm.pay){showToast('Night and pay required',true);return;}
    const v=curVenue;
    const newGig={id:uid(),venueId:v.id,name:v.name,type:v.type,city:v.city,night:gigForm.night,pay:gigForm.pay,genreNeed:gigForm.genre,duration:gigForm.duration,desc:gigForm.desc,slots:gigForm.slots?gigForm.slots.split(',').map(s=>s.trim()):[],posted:'just now',applicants:[],sponsors:[]};
    setGigs([...gigs,newGig]);
    setGigForm({night:'',pay:'',genre:'',duration:'',slots:'',desc:''});
    showToast('Gig posted!');
  }

  function deleteGig(gigId) {
    if(!window.confirm('Remove this gig listing?'))return;
    setGigs(gigs.filter(g=>g.id!==gigId));showToast('Gig removed');
  }

  // ── GIG CONFIRMATION FLOW ────────────────────────────────────────
  function updateAppStatus(appId, status) {
    const updated = applications.map(a => a.id===appId ? {...a, status} : a);
    setApplications(updated);
    const statusLabels = { shortlisted:'Shortlisted ⭐', confirmed:'Confirmed ✅', rejected:'Declined' };
    showToast(statusLabels[status] || 'Updated');
  }

  function confirmArtist(app) {
    // Confirm this artist, reject others for the same gig
    const updated = applications.map(a => {
      if(a.gigId===app.gigId && a.id!==app.id && a.status!=='rejected') return {...a,status:'rejected'};
      if(a.id===app.id) return {...a,status:'confirmed'};
      return a;
    });
    setApplications(updated);
    showToast('Artist confirmed! Share your contact with them 🎸');
  }

  function markGigComplete(app) {
    const artist = artists.find(a=>a.id===app.artistId);
    const gig = gigs.find(g=>g.id===app.gigId);
    if(artist && gig) setRatingTarget({artist, gig, appId: app.id});
  }

  function submitRating({rating, comment, artistId, gigId}) {
    // Add rating to artist profile
    const updatedArtists = artists.map(a => {
      if(a.id!==artistId) return a;
      const reviews = [...(a.reviews||[]), {rating, comment, venue: curVenue.name, gig: gigs.find(g=>g.id===gigId)?.night||'', date: new Date().toLocaleDateString('en-IN')}];
      const avgRating = reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;
      return {...a, reviews, avgRating: Math.round(avgRating*10)/10};
    });
    setArtists(updatedArtists);
    // Mark app as completed
    const updatedApps = applications.map(a => a.id===ratingTarget?.appId ? {...a, status:'completed'} : a);
    setApplications(updatedApps);
    showToast('Rating submitted! Thank you 🌟');
    setRatingTarget(null);
  }

  const myGigs = gigs.filter(g=>curVenue&&g.venueId===curVenue.id);
  const myApplicants = applications.filter(a=>myGigs.some(g=>g.id===a.gigId));

  // ── NO VENUE ────────────────────────────────────────────────────
  if(!curVenue) return (
    <div className="page" style={{maxWidth:540}}>
      <div className="label label-blue" style={{marginBottom:12}}>VENUE REGISTRATION</div>
      <h2 style={{fontSize:22,fontWeight:500,margin:'0 0 6px'}}>Create your venue profile</h2>
      <p style={{fontSize:13,color:'#888',marginBottom:24,lineHeight:1.6}}>Show off your space, sound system, and tech. Artists can see exactly what they're walking into.</p>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <input placeholder="Venue name *" value={form.name} onChange={e=>sf('name',e.target.value)}/>
        <div className="grid-2">
          <select value={form.type} onChange={e=>sf('type',e.target.value)}>
            <option value="">Venue type *</option>
            {['Café','Bar','Club','Brewery','Music Venue','Restaurant','Rooftop','Art Gallery','Open Air','Other'].map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={form.city} onChange={e=>sf('city',e.target.value)}>
            {['Bangalore','Mumbai','Pune','Delhi','Hyderabad','Chennai','Other'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <input placeholder="Full address *" value={form.address} onChange={e=>sf('address',e.target.value)}/>
        <input placeholder="Area / Neighbourhood" value={form.area} onChange={e=>sf('area',e.target.value)}/>
        <textarea placeholder="Tell artists about your venue *" value={form.about} onChange={e=>sf('about',e.target.value)}/>
        <div className="section-title">CAPACITY & SPACE</div>
        <div className="grid-2">
          <input placeholder="Standing capacity" value={form.capacity} onChange={e=>sf('capacity',e.target.value)}/>
          <input placeholder="Seated capacity" value={form.seated} onChange={e=>sf('seated',e.target.value)}/>
        </div>
        <input placeholder="Stage dimensions" value={form.stage} onChange={e=>sf('stage',e.target.value)}/>
        <div className="section-title">VENUE PHOTOS</div>
        <div className="upload-toggle">
          <button className={`upload-toggle-btn ${vphotoTab==='file'?'active-blue':'inactive'}`} onClick={()=>setVphotoTab('file')}>📁 Upload</button>
          <button className={`upload-toggle-btn ${vphotoTab==='url'?'active-blue':'inactive'}`} onClick={()=>setVphotoTab('url')}>🔗 URLs</button>
        </div>
        {vphotoTab==='file'
          ? <input type="file" accept="image/*" multiple ref={vPhotoFilesRef}/>
          : <textarea placeholder="Photo URLs — one per line" value={form.photos.map(p=>p.src||p).join('\n')} onChange={e=>sf('photos',e.target.value.split('\n').filter(Boolean).map(src=>({src})))} style={{minHeight:60}}/>
        }
        <div className="section-title">SOUND SYSTEM</div>
        <div className="grid-2">
          <input placeholder="PA system" value={form.pa} onChange={e=>sf('pa',e.target.value)}/>
          <input placeholder="Stage monitors" value={form.monitors} onChange={e=>sf('monitors',e.target.value)}/>
        </div>
        <input placeholder="Mixing desk" value={form.mixer} onChange={e=>sf('mixer',e.target.value)}/>
        <input placeholder="Microphones" value={form.mics} onChange={e=>sf('mics',e.target.value)}/>
        <input placeholder="DI boxes / other audio" value={form.di} onChange={e=>sf('di',e.target.value)}/>
        <div className="section-title">LIGHTING & TECH</div>
        <input placeholder="Lighting rig" value={form.lighting} onChange={e=>sf('lighting',e.target.value)}/>
        <input placeholder="Visuals / projection" value={form.visual} onChange={e=>sf('visual',e.target.value)}/>
        <input placeholder="Backline provided" value={form.backline} onChange={e=>sf('backline',e.target.value)}/>
        <input placeholder="Green room / artist facilities" value={form.green} onChange={e=>sf('green',e.target.value)}/>
        <input placeholder="Parking situation" value={form.parking} onChange={e=>sf('parking',e.target.value)}/>
        <div className="section-title">NIGHTS & CONTACT</div>
        <input placeholder="Which nights do you book live music? *" value={form.nights} onChange={e=>sf('nights',e.target.value)}/>
        <input placeholder="Genres that work for your crowd" value={form.genres} onChange={e=>sf('genres',e.target.value)}/>
        <input placeholder="Venue Instagram handle" value={form.instagram} onChange={e=>sf('instagram',e.target.value)}/>
        <input placeholder="Booking contact — email or phone *" value={form.contact} onChange={e=>sf('contact',e.target.value)}/>
        <button className="btn btn-blue" onClick={registerVenue} style={{marginTop:4}}>Create venue profile →</button>
      </div>
    </div>
  );

  const v = curVenue;

  return (
    <div className="page">
      <div className="tab-bar">
        {[['profile','Venue Profile'],['gigs','Post Gigs'],['applicants',`Applicants${myApplicants.length>0?` (${myApplicants.length})`:''}` ]].map(([k,l])=>(
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
              <div className="section-title">CURRENT PHOTOS</div>
              <div className="photo-thumb-grid">
                {editExistingPhotos.map((p,i)=>(
                  <div key={i} className="photo-thumb-item">
                    <img src={p.src||p} alt=""/>
                    <button className="photo-thumb-remove" onClick={()=>setEditExistingPhotos(editExistingPhotos.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                ))}
              </div>
              <div className="section-title">ADD PHOTOS</div>
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
                    {v.capacity&&<div style={{fontSize:12,color:'#aaa',marginTop:2}}>👥 {v.capacity} standing{v.seated?' · '+v.seated+' seated':''}</div>}
                  </div>
                </div>
                {v.about&&<p style={{fontSize:14,color:'#555',lineHeight:1.8,marginBottom:12}}>{v.about}</p>}
                {(v.photos||[]).length>0&&(
                  <div className="photo-strip">
                    {v.photos.map((p,i)=><img key={i} src={p.src||p} alt="" style={{height:80,borderRadius:8,objectFit:'cover',flexShrink:0}} onError={e=>e.target.style.display='none'}/>)}
                  </div>
                )}
              </div>
              <div className="flex-row" style={{marginBottom:16}}>
                <button className="btn btn-blue" style={{flex:1}} onClick={()=>setTab('gigs')}>Post a gig</button>
                <button className="btn btn-outline" onClick={()=>{setEditForm({...v});setEditExistingPhotos(v.photos||[]);setEditing(true);}}>Edit Venue</button>
              </div>
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
              <textarea placeholder="What are you looking for..." value={gigForm.desc} onChange={e=>setGigForm(p=>({...p,desc:e.target.value}))} style={{minHeight:70}}/>
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
                    <div style={{fontSize:12,color:'#888',marginTop:2}}>{g.pay}{g.genreNeed?' · '+g.genreNeed:''}</div>
                    {g.desc&&<p style={{fontSize:12,color:'#666',marginTop:6,lineHeight:1.5}}>{g.desc}</p>}
                    <div style={{marginTop:6,fontSize:11,color:C.blue}}>{applications.filter(a=>a.gigId===g.id).length} applicant(s)</div>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{color:'#c0392b',borderColor:'rgba(192,57,43,.3)',flexShrink:0}} onClick={()=>deleteGig(g.id)}>✕ Remove</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* APPLICANTS TAB — with full confirmation flow */}
      {tab==='applicants' && (
        <div style={{maxWidth:560}}>
          <div className="label label-blue" style={{marginBottom:14}}>APPLICANTS</div>
          {myApplicants.length===0
            ? <div style={{padding:'2rem',textAlign:'center',color:'#ccc',fontSize:13,border:'1px dashed #e8e8e8',borderRadius:10}}>No applications yet. Post a gig to start receiving them.</div>
            : (() => {
                // Group by gig
                const byGig = {};
                myApplicants.forEach(app => {
                  const gig = gigs.find(g=>g.id===app.gigId);
                  if(!byGig[app.gigId]) byGig[app.gigId] = {gig, apps:[]};
                  byGig[app.gigId].apps.push(app);
                });
                return Object.values(byGig).map(({gig, apps}) => (
                  <div key={gig?.id||'x'} style={{marginBottom:24}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.blue,marginBottom:10,padding:'6px 12px',background:C.blueL,borderRadius:8,display:'inline-block'}}>
                      📅 {gig?.night||'Unknown gig'} · {gig?.pay}
                    </div>
                    {apps.map(app => {
                      const artist = artists.find(a=>a.id===app.artistId);
                      const status = app.status||'pending';
                      return (
                        <div key={app.id} className="card" style={{marginBottom:10,borderLeft:`3px solid ${status==='confirmed'?C.teal:status==='shortlisted'?C.blue:status==='rejected'?'#c0392b':status==='completed'?'#27ae60':'#e8e8e8'}`}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:8}}>
                            <div>
                              <div style={{fontWeight:600,fontSize:14}}>{app.artistName}</div>
                              {app.artistGenre&&<div style={{fontSize:12,color:'#888'}}>{app.artistGenre} · {app.artistCity}</div>}
                              {artist?.avgRating>0&&<div style={{marginTop:4}}><StarDisplay rating={artist.avgRating}/></div>}
                            </div>
                            <span className={`status-badge status-${status==='completed'?'confirmed':status}`}>
                              {status==='pending'?'⏳ Pending':status==='shortlisted'?'⭐ Shortlisted':status==='confirmed'?'✅ Confirmed':status==='rejected'?'✕ Declined':'🎉 Done'}
                            </span>
                          </div>

                          <p style={{fontSize:13,color:'#666',lineHeight:1.6,background:'#f8f8f8',padding:'10px 12px',borderRadius:8,marginBottom:10}}>{app.pitch}</p>

                          {/* Action buttons based on status */}
                          {status==='pending' && (
                            <div className="confirm-actions">
                              <button className="btn btn-outline btn-sm" style={{color:C.blue,borderColor:C.blue}} onClick={()=>updateAppStatus(app.id,'shortlisted')}>⭐ Shortlist</button>
                              <button className="btn btn-outline btn-sm" style={{color:'#c0392b',borderColor:'rgba(192,57,43,.3)'}} onClick={()=>updateAppStatus(app.id,'rejected')}>✕ Decline</button>
                            </div>
                          )}
                          {status==='shortlisted' && (
                            <div className="confirm-actions">
                              <button className="btn btn-teal btn-sm" onClick={()=>confirmArtist(app)}>✅ Confirm this artist</button>
                              <button className="btn btn-outline btn-sm" style={{color:'#c0392b',borderColor:'rgba(192,57,43,.3)'}} onClick={()=>updateAppStatus(app.id,'rejected')}>✕ Decline</button>
                            </div>
                          )}
                          {status==='confirmed' && (
                            <div>
                              <div style={{fontSize:12,color:C.teal,marginBottom:8,background:C.tealL,padding:'8px 12px',borderRadius:8}}>
                                ✅ Confirmed! Share contact: {artist?.phone||'No phone on file'} · {artist?.instagram||''}
                              </div>
                              <button className="btn btn-outline btn-sm" style={{color:'#555'}} onClick={()=>markGigComplete(app)}>
                                🎤 Gig done — Rate this artist
                              </button>
                            </div>
                          )}
                          {status==='completed' && artist?.reviews?.slice(-1)[0] && (
                            <div style={{fontSize:11,color:'#aaa',marginTop:4}}>
                              You rated: {'★'.repeat(artist.reviews.slice(-1)[0].rating)}{'☆'.repeat(5-artist.reviews.slice(-1)[0].rating)}
                            </div>
                          )}
                          <div style={{marginTop:6,fontSize:11,color:'#bbb'}}>Applied {app.sent}</div>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()
          }
        </div>
      )}

      {/* Rating modal */}
      {ratingTarget && (
        <RatingModal
          artist={ratingTarget.artist}
          gig={ratingTarget.gig}
          onSubmit={submitRating}
          onClose={()=>setRatingTarget(null)}
        />
      )}
    </div>
  );
}
